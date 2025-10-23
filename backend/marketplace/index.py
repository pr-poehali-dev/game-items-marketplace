import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения и создания игровых предметов на маркетплейсе
    Args: event - dict с httpMethod, queryStringParameters, body
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с JSON списком предметов или созданным предметом
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
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT 
                        i.id, 
                        i.title, 
                        i.description, 
                        i.price, 
                        i.image_url, 
                        i.category, 
                        i.rarity,
                        i.is_sold,
                        u.username as seller_name
                    FROM items i
                    LEFT JOIN users u ON i.seller_id = u.id
                    WHERE i.is_sold = FALSE
                    ORDER BY i.created_at DESC
                """)
                items = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'items': items}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            seller_id = body_data.get('seller_id', 1)
            title = body_data.get('title', '')
            description = body_data.get('description', '')
            price = float(body_data.get('price', 0))
            image_url = body_data.get('image_url', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400')
            category = body_data.get('category', 'Разное')
            rarity = body_data.get('rarity', 'Обычный')
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO items (seller_id, title, description, price, image_url, category, rarity)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, seller_id, title, description, price, image_url, category, rarity, is_sold
                """, (seller_id, title, description, price, image_url, category, rarity))
                
                conn.commit()
                new_item = cur.fetchone()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(new_item, default=str),
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