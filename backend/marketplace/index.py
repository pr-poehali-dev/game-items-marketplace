import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения, создания и покупки игровых предметов на маркетплейсе
    Args: event - dict с httpMethod, queryStringParameters, body, path
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с JSON списком предметов, созданным или купленным предметом
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
                        i.price, 
                        i.image_url,
                        i.category, 
                        i.rarity,
                        i.is_sold,
                        i.seller_id,
                        u.username as seller_name
                    FROM t_p99005675_game_items_marketpla.items i
                    LEFT JOIN t_p99005675_game_items_marketpla.users u ON i.seller_id = u.id
                    WHERE i.is_sold = FALSE
                    ORDER BY i.created_at DESC
                    LIMIT 10
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
                    INSERT INTO t_p99005675_game_items_marketpla.items (seller_id, title, description, price, image_url, category, rarity)
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
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            buyer_id = body_data.get('buyer_id')
            item_id = body_data.get('item_id')
            
            if not buyer_id or not item_id:
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'buyer_id and item_id required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, seller_id, title, price, is_sold, image_url
                    FROM t_p99005675_game_items_marketpla.items
                    WHERE id = %s
                """, (item_id,))
                item = cur.fetchone()
                
                if not item:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Item not found'}),
                        'isBase64Encoded': False
                    }
                
                if item['is_sold']:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Item already sold'}),
                        'isBase64Encoded': False
                    }
                
                if item['seller_id'] == buyer_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Cannot buy your own item'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    SELECT balance FROM t_p99005675_game_items_marketpla.users WHERE id = %s
                """, (buyer_id,))
                buyer = cur.fetchone()
                
                if not buyer or float(buyer['balance']) < float(item['price']):
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Insufficient balance'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    UPDATE t_p99005675_game_items_marketpla.users 
                    SET balance = balance - %s 
                    WHERE id = %s
                """, (item['price'], buyer_id))
                
                cur.execute("""
                    UPDATE t_p99005675_game_items_marketpla.users 
                    SET balance = balance + %s 
                    WHERE id = %s
                """, (item['price'], item['seller_id']))
                
                cur.execute("""
                    UPDATE t_p99005675_game_items_marketpla.items 
                    SET is_sold = TRUE 
                    WHERE id = %s
                """, (item_id,))
                
                cur.execute("""
                    INSERT INTO t_p99005675_game_items_marketpla.transactions 
                    (buyer_id, seller_id, item_id, amount, transaction_type)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                """, (buyer_id, item['seller_id'], item_id, item['price'], 'purchase'))
                
                transaction = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'transaction_id': transaction['id'],
                        'item': dict(item)
                    }, default=str),
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