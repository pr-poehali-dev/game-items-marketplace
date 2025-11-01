import json
import os
from typing import Dict, Any
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get payment history for user
    Args: event with httpMethod, queryStringParameters with user_id
    Returns: List of payment transactions with dates and amounts
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
            'body': ''
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        user_id = params.get('user_id')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'user_id required'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn or not psycopg2:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Database not available'})
            }
        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(
            '''
            SELECT id, payment_id, amount, rubles, status, payment_method, 
                   created_at, completed_at
            FROM t_p99005675_game_items_marketpla.payment_history
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 50
            ''',
            (user_id,)
        )
        
        payments = cursor.fetchall()
        cursor.close()
        conn.close()
        
        result = []
        for p in payments:
            result.append({
                'id': p['id'],
                'paymentId': p['payment_id'],
                'amount': p['amount'],
                'rubles': float(p['rubles']),
                'status': p['status'],
                'paymentMethod': p['payment_method'],
                'createdAt': p['created_at'].isoformat() if p['created_at'] else None,
                'completedAt': p['completed_at'].isoformat() if p['completed_at'] else None
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'payments': result})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('userId')
        payment_id = body_data.get('paymentId')
        amount = body_data.get('amount')
        rubles = body_data.get('rubles')
        
        if not all([user_id, payment_id, amount, rubles]):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn or not psycopg2:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Database not available'})
            }
        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        cursor.execute(
            '''
            INSERT INTO t_p99005675_game_items_marketpla.payment_history 
            (user_id, payment_id, amount, rubles, status, payment_method)
            VALUES (%s, %s, %s, %s, 'pending', 'sbp')
            RETURNING id
            ''',
            (user_id, payment_id, amount, rubles)
        )
        
        new_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'id': new_id, 'status': 'created'})
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }
