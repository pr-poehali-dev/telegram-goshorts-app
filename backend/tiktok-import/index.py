import json
import os
import re
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Import TikTok videos by URL, parse metadata and save to database
    Args: event - dict with httpMethod, body, headers
          context - object with request_id attribute
    Returns: HTTP response dict with video data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id', 'anonymous')
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT id, tiktok_url, video_url, author, author_avatar, 
                           description, likes, comments, shares, views, 
                           hashtags, created_at
                    FROM tiktok_videos 
                    WHERE is_active = TRUE 
                    ORDER BY created_at DESC
                    LIMIT 50
                    """
                )
                videos = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'videos': [dict(v) for v in videos]
                    }, default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            tiktok_url = body_data.get('tiktok_url', '').strip()
            
            if not tiktok_url:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'TikTok URL is required'})
                }
            
            video_data = parse_tiktok_url(tiktok_url)
            
            if not video_data:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Invalid TikTok URL or unable to fetch video'})
                }
            
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO tiktok_videos 
                    (tiktok_url, video_url, author, author_avatar, description, 
                     likes, comments, shares, views, hashtags, added_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (tiktok_url) 
                    DO UPDATE SET 
                        video_url = EXCLUDED.video_url,
                        description = EXCLUDED.description,
                        likes = EXCLUDED.likes,
                        comments = EXCLUDED.comments,
                        shares = EXCLUDED.shares,
                        views = EXCLUDED.views,
                        hashtags = EXCLUDED.hashtags,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING id
                    """,
                    (
                        tiktok_url,
                        video_data['video_url'],
                        video_data['author'],
                        video_data.get('author_avatar'),
                        video_data['description'],
                        video_data.get('likes', 0),
                        video_data.get('comments', 0),
                        video_data.get('shares', 0),
                        video_data.get('views', 0),
                        video_data.get('hashtags', []),
                        user_id
                    )
                )
                video_id = cur.fetchone()[0]
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'message': 'Video imported successfully',
                        'video_id': video_id,
                        'video_data': video_data
                    })
                }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            video_id = query_params.get('id')
            
            if not video_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Video ID is required'})
                }
            
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE tiktok_videos SET is_active = FALSE WHERE id = %s",
                    (video_id,)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'message': 'Video deleted successfully'
                    })
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()


def parse_tiktok_url(url: str) -> Optional[Dict[str, Any]]:
    '''
    Parse TikTok URL and extract video metadata
    For production: integrate with TikTok API or use third-party service
    For now: returns demo structure with embedded TikTok video
    '''
    video_id_match = re.search(r'/video/(\d+)', url)
    if not video_id_match:
        return None
    
    video_id = video_id_match.group(1)
    
    hashtags_match = re.findall(r'#(\w+)', url)
    
    return {
        'video_url': f'https://www.tiktok.com/embed/v2/{video_id}',
        'author': extract_username_from_url(url),
        'author_avatar': None,
        'description': f'TikTok видео #{video_id}',
        'likes': 0,
        'comments': 0,
        'shares': 0,
        'views': 0,
        'hashtags': hashtags_match if hashtags_match else ['tiktok']
    }


def extract_username_from_url(url: str) -> str:
    '''Extract TikTok username from URL'''
    username_match = re.search(r'@([a-zA-Z0-9._]+)', url)
    if username_match:
        return f"@{username_match.group(1)}"
    return '@tiktok_user'
