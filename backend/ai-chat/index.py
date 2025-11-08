import json
import os
from typing import Dict, Any
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: AI chat integration with Yandex GPT
    Args: event - dict with httpMethod, body, headers
          context - object with request_id attribute
    Returns: HTTP response dict with AI response
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_message = body_data.get('message', '')
        chat_history = body_data.get('history', [])
        style = body_data.get('style', 'friendly')
        
        api_key = os.environ.get('YANDEX_GPT_API_KEY')
        
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'error': 'API key not configured',
                    'response': 'Привет! Я пока не настроен. Добавь API ключ Yandex GPT в настройках проекта.'
                })
            }
        
        style_prompts = {
            'friendly': 'Отвечай дружелюбно, используй эмодзи, будь позитивным.',
            'business': 'Отвечай деловым тоном, кратко и по существу.',
            'ironic': 'Отвечай с лёгкой иронией и юмором.',
            'casual': 'Отвечай непринуждённо, как в обычной переписке.'
        }
        
        system_prompt = f'''Ты - цифровой двойник пользователя в приложении GoShorts. 
{style_prompts.get(style, style_prompts['friendly'])}
Помогай пользователю с задачами, отвечай на вопросы, веди диалог естественно.
Будь полезным и внимательным ассистентом.'''
        
        messages = [{'role': 'system', 'text': system_prompt}]
        
        for msg in chat_history[-10:]:
            messages.append({
                'role': 'user' if msg['role'] == 'user' else 'assistant',
                'text': msg['text']
            })
        
        messages.append({'role': 'user', 'text': user_message})
        
        try:
            response = requests.post(
                'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
                headers={
                    'Authorization': f'Api-Key {api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'modelUri': f'gpt://b1gvvvvvvvvvvvvvvvvv/yandexgpt-lite',
                    'completionOptions': {
                        'stream': False,
                        'temperature': 0.7,
                        'maxTokens': 500
                    },
                    'messages': messages
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result.get('result', {}).get('alternatives', [{}])[0].get('message', {}).get('text', 'Не удалось получить ответ.')
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'response': ai_response})
                }
            else:
                return {
                    'statusCode': response.status_code,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'error': 'Yandex GPT API error',
                        'response': 'Извини, не могу ответить прямо сейчас. Попробуй позже!'
                    })
                }
        
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'error': str(e),
                    'response': 'Произошла ошибка. Проверь подключение к интернету.'
                })
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
