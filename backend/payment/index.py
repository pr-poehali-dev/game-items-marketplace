import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import hashlib
import hmac

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для создания платежей T-Bank и обработки webhook уведомлений
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с данными для оплаты или подтверждением webhook
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    if method == 'POST':
        path = event.get('path', '')
        
        if '/webhook' in path:
            return handle_webhook(event)
        else:
            return create_payment(event)
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }


def create_payment(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Создает платеж и возвращает ссылку T-Bank'''
    body_data = json.loads(event.get('body', '{}'))
    user_id = body_data.get('user_id')
    amount = int(body_data.get('amount', 0))
    
    if not user_id or amount <= 0:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid user_id or amount'}),
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "INSERT INTO pending_payments (user_id, amount, status) VALUES (%s, %s, %s) RETURNING id",
                (user_id, amount, 'pending')
            )
            conn.commit()
            payment_id = cur.fetchone()['id']
            
            price_rub = amount / 10
            
            payment_url = f"https://tbank.ru/cf/2bwxNMfSFLa"
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'payment_id': payment_id,
                    'payment_url': payment_url,
                    'amount': amount,
                    'price_rub': price_rub
                }),
                'isBase64Encoded': False
            }
    finally:
        if conn:
            conn.close()


def handle_webhook(event: Dict[str, Any]) -> Dict[str, Any]:
    '''Обрабатывает webhook от T-Bank о успешной оплате'''
    body_data = json.loads(event.get('body', '{}'))
    
    payment_id = body_data.get('payment_id')
    status = body_data.get('status')
    
    if status != 'CONFIRMED':
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Payment not confirmed'}),
            'isBase64Encoded': False
        }
    
    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT user_id, amount, status FROM pending_payments WHERE id = %s",
                (payment_id,)
            )
            payment = cur.fetchone()
            
            if not payment or payment['status'] != 'pending':
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Payment not found or already processed'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "UPDATE users SET balance = balance + %s WHERE id = %s",
                (payment['amount'], payment['user_id'])
            )
            
            cur.execute(
                "UPDATE pending_payments SET status = %s WHERE id = %s",
                ('completed', payment_id)
            )
            
            cur.execute(
                "INSERT INTO transactions (buyer_id, amount, transaction_type) VALUES (%s, %s, %s)",
                (payment['user_id'], payment['amount'], 'top_up')
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Payment processed successfully'}),
                'isBase64Encoded': False
            }
    finally:
        if conn:
            conn.close()
