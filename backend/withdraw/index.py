import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для вывода балов пользователя на реальный счет
    Args: event - dict с httpMethod, body
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с результатом операции
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            user_id = body_data.get('user_id', 1)
            amount = float(body_data.get('amount', 0))
            payment_method = body_data.get('payment_method', 'card')
            payment_details = body_data.get('payment_details', '')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT balance FROM users WHERE id = %s", (user_id,))
                user = cur.fetchone()
                
                if not user:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
                
                current_balance = float(user['balance'])
                
                if current_balance < amount:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Insufficient balance'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(
                    "UPDATE users SET balance = balance - %s WHERE id = %s",
                    (amount, user_id)
                )
                
                cur.execute(
                    """INSERT INTO withdrawals (user_id, amount, payment_method, payment_details, status)
                       VALUES (%s, %s, %s, %s, %s)
                       RETURNING id, amount, status, created_at""",
                    (user_id, amount, payment_method, payment_details, 'pending')
                )
                
                withdrawal = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(withdrawal, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id', '1')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT id, amount, status, payment_method, created_at, processed_at
                       FROM withdrawals WHERE user_id = %s ORDER BY created_at DESC LIMIT 10""",
                    (user_id,)
                )
                withdrawals = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'withdrawals': withdrawals}, default=str),
                    'isBase64Encoded': False
                }
    finally:
        if conn:
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
