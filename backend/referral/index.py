import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для реферальной системы с бонусами за приглашение
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с данными реферальной программы
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
    
    conn = None
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id', '1')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT referral_code FROM users WHERE id = %s",
                    (user_id,)
                )
                user = cur.fetchone()
                
                cur.execute(
                    """SELECT COUNT(*) as total_referrals, COALESCE(SUM(bonus_amount), 0) as total_earned
                       FROM referrals WHERE referrer_id = %s""",
                    (user_id,)
                )
                stats = cur.fetchone()
                
                cur.execute(
                    """SELECT u.username, r.bonus_amount, r.created_at
                       FROM referrals r
                       JOIN users u ON r.referred_id = u.id
                       WHERE r.referrer_id = %s
                       ORDER BY r.created_at DESC
                       LIMIT 10""",
                    (user_id,)
                )
                referrals = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'referral_code': user['referral_code'] if user else None,
                        'total_referrals': stats['total_referrals'],
                        'total_earned': str(stats['total_earned']),
                        'referrals': referrals
                    }, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            referral_code = body_data.get('referral_code', '')
            new_user_id = body_data.get('new_user_id', 0)
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id FROM users WHERE referral_code = %s",
                    (referral_code,)
                )
                referrer = cur.fetchone()
                
                if not referrer:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Invalid referral code'}),
                        'isBase64Encoded': False
                    }
                
                referrer_id = referrer['id']
                bonus_amount = 50.00
                
                cur.execute(
                    """INSERT INTO referrals (referrer_id, referred_id, bonus_amount)
                       VALUES (%s, %s, %s)
                       ON CONFLICT (referrer_id, referred_id) DO NOTHING
                       RETURNING id""",
                    (referrer_id, new_user_id, bonus_amount)
                )
                
                result = cur.fetchone()
                
                if result:
                    cur.execute(
                        "UPDATE users SET balance = balance + %s WHERE id = %s",
                        (bonus_amount, referrer_id)
                    )
                    
                    cur.execute(
                        "UPDATE users SET referred_by = %s WHERE id = %s",
                        (referrer_id, new_user_id)
                    )
                    
                    conn.commit()
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'success': True, 'bonus': str(bonus_amount)}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Referral already applied'}),
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
