import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage user data (saved videos, likes, settings)
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with request_id, function_name attributes
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
                    "SELECT * FROM user_videos WHERE user_id = %s",
                    (user_id,)
                )
                videos = cur.fetchall()
                
                cur.execute(
                    "SELECT * FROM user_settings WHERE user_id = %s",
                    (user_id,)
                )
                settings = cur.fetchone()
                
                cur.execute(
                    "SELECT profile_name, avatar_url FROM users WHERE user_id = %s",
                    (user_id,)
                )
                profile = cur.fetchone()
                
                result = {
                    'videos': [dict(v) for v in videos] if videos else [],
                    'settings': dict(settings) if settings else None,
                    'profile': dict(profile) if profile else None
                }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps(result, default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            with conn.cursor() as cur:
                if action == 'save_video':
                    video_id = body_data.get('video_id')
                    is_saved = body_data.get('is_saved', False)
                    
                    cur.execute(
                        """
                        INSERT INTO user_videos (user_id, video_id, is_saved)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (user_id, video_id)
                        DO UPDATE SET is_saved = %s, updated_at = CURRENT_TIMESTAMP
                        """,
                        (user_id, video_id, is_saved, is_saved)
                    )
                    
                elif action == 'like_video':
                    video_id = body_data.get('video_id')
                    is_liked = body_data.get('is_liked', False)
                    
                    cur.execute(
                        """
                        INSERT INTO user_videos (user_id, video_id, is_liked)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (user_id, video_id)
                        DO UPDATE SET is_liked = %s, updated_at = CURRENT_TIMESTAMP
                        """,
                        (user_id, video_id, is_liked, is_liked)
                    )
                
                elif action == 'update_settings':
                    settings = body_data.get('settings', {})
                    
                    cur.execute(
                        """
                        INSERT INTO user_settings (user_id, dark_mode, language, notifications_enabled, auto_sound)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (user_id)
                        DO UPDATE SET 
                            dark_mode = %s,
                            language = %s,
                            notifications_enabled = %s,
                            auto_sound = %s,
                            updated_at = CURRENT_TIMESTAMP
                        """,
                        (
                            user_id,
                            settings.get('dark_mode', False),
                            settings.get('language', 'ru'),
                            settings.get('notifications_enabled', True),
                            settings.get('auto_sound', False),
                            settings.get('dark_mode', False),
                            settings.get('language', 'ru'),
                            settings.get('notifications_enabled', True),
                            settings.get('auto_sound', False)
                        )
                    )
                
                elif action == 'update_profile':
                    profile_name = body_data.get('profile_name', '@my_profile')
                    avatar_url = body_data.get('avatar_url')
                    
                    cur.execute(
                        """
                        INSERT INTO users (user_id, profile_name, avatar_url)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (user_id)
                        DO UPDATE SET 
                            profile_name = %s,
                            avatar_url = %s,
                            updated_at = CURRENT_TIMESTAMP
                        """,
                        (user_id, profile_name, avatar_url, profile_name, avatar_url)
                    )
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'message': 'Data saved'})
                }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()