import json
import os
import re
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Import TikTok videos with moderation, categories, and TikTok API integration
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            query_params = event.get('queryStringParameters') or {}
            action = query_params.get('action', 'approved')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                if action == 'categories':
                    cur.execute("SELECT * FROM video_categories ORDER BY name")
                    categories = cur.fetchall()
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({'categories': [dict(c) for c in categories]}, default=str)
                    }
                
                elif action == 'pending':
                    cur.execute(
                        """
                        SELECT id, tiktok_url, video_url, author, author_avatar, 
                               description, likes, comments, shares, views, 
                               hashtags, category, moderation_status, created_at
                        FROM tiktok_videos 
                        WHERE is_active = TRUE AND moderation_status = 'pending'
                        ORDER BY created_at DESC
                        """
                    )
                else:
                    category_filter = query_params.get('category')
                    if category_filter:
                        cur.execute(
                            """
                            SELECT id, tiktok_url, video_url, author, author_avatar, 
                                   description, likes, comments, shares, views, 
                                   hashtags, category, created_at
                            FROM tiktok_videos 
                            WHERE is_active = TRUE AND moderation_status = 'approved' AND category = %s
                            ORDER BY created_at DESC
                            LIMIT 50
                            """,
                            (category_filter,)
                        )
                    else:
                        cur.execute(
                            """
                            SELECT id, tiktok_url, video_url, author, author_avatar, 
                                   description, likes, comments, shares, views, 
                                   hashtags, category, created_at
                            FROM tiktok_videos 
                            WHERE is_active = TRUE AND moderation_status = 'approved'
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
            category = body_data.get('category', 'general')
            
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
            
            client_key = os.environ.get('TIKTOK_CLIENT_KEY')
            video_data = parse_tiktok_with_api(tiktok_url, client_key) if client_key else parse_tiktok_url(tiktok_url)
            
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
                     likes, comments, shares, views, hashtags, category, added_by, moderation_status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
                    ON CONFLICT (tiktok_url) 
                    DO UPDATE SET 
                        video_url = EXCLUDED.video_url,
                        description = EXCLUDED.description,
                        likes = EXCLUDED.likes,
                        comments = EXCLUDED.comments,
                        shares = EXCLUDED.shares,
                        views = EXCLUDED.views,
                        hashtags = EXCLUDED.hashtags,
                        category = EXCLUDED.category,
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
                        category,
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
                        'message': 'Video added to moderation queue',
                        'video_id': video_id,
                        'video_data': video_data
                    })
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            video_id = body_data.get('video_id')
            action = body_data.get('action')
            
            if not video_id or not action:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Video ID and action are required'})
                }
            
            with conn.cursor() as cur:
                if action == 'approve':
                    cur.execute(
                        """UPDATE tiktok_videos 
                           SET moderation_status = 'approved', moderated_by = %s, moderated_at = CURRENT_TIMESTAMP 
                           WHERE id = %s""",
                        (user_id, video_id)
                    )
                elif action == 'reject':
                    cur.execute(
                        """UPDATE tiktok_videos 
                           SET moderation_status = 'rejected', moderated_by = %s, moderated_at = CURRENT_TIMESTAMP, is_active = FALSE 
                           WHERE id = %s""",
                        (user_id, video_id)
                    )
                elif action == 'update_category':
                    category = body_data.get('category', 'general')
                    cur.execute(
                        "UPDATE tiktok_videos SET category = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                        (category, video_id)
                    )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': f'Video {action} successfully'})
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


def parse_tiktok_with_api(url: str, client_key: str) -> Optional[Dict[str, Any]]:
    '''
    Parse TikTok URL using official TikTok API
    Requires TIKTOK_CLIENT_KEY to be configured
    '''
    try:
        video_id_match = re.search(r'/video/(\d+)', url)
        if not video_id_match:
            return parse_tiktok_url(url)
        
        video_id = video_id_match.group(1)
        
        response = requests.get(
            'https://open.tiktokapis.com/v2/video/query/',
            headers={
                'Authorization': f'Bearer {client_key}',
                'Content-Type': 'application/json'
            },
            params={'video_id': video_id},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            video_info = data.get('data', {}).get('video', {})
            
            return {
                'video_url': f'https://www.tiktok.com/embed/v2/{video_id}',
                'author': extract_username_from_url(url),
                'author_avatar': video_info.get('author_avatar_url'),
                'description': video_info.get('description', f'TikTok видео #{video_id}'),
                'likes': video_info.get('like_count', 0),
                'comments': video_info.get('comment_count', 0),
                'shares': video_info.get('share_count', 0),
                'views': video_info.get('view_count', 0),
                'hashtags': extract_hashtags(video_info.get('description', ''))
            }
        else:
            return parse_tiktok_url(url)
    except Exception as e:
        print(f'TikTok API error: {e}')
        return parse_tiktok_url(url)


def parse_tiktok_url(url: str) -> Optional[Dict[str, Any]]:
    '''
    Parse TikTok URL - fallback method without API
    Returns basic structure with embedded TikTok video
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


def extract_hashtags(text: str) -> list:
    '''Extract hashtags from text'''
    hashtags = re.findall(r'#(\w+)', text)
    return hashtags if hashtags else ['tiktok']