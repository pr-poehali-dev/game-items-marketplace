'''
Business: User authentication - login and registration with username/password
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response with JWT token on success
'''
import json
import os
import hashlib
import secrets
from typing import Dict, Any
import psycopg2
import jwt
from datetime import datetime, timedelta

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        salt, pwd_hash = stored_hash.split('$')
        check_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return check_hash == pwd_hash
    except:
        return False

def generate_referral_code() -> str:
    """Generate unique 8-character referral code"""
    return secrets.token_urlsafe(6)[:8].upper()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action', 'login')
    username = body_data.get('username', '').strip()
    password = body_data.get('password', '')
    
    if not username or not password:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Введите логин и пароль'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if action == 'register':
        if len(username) < 3:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Логин должен быть не менее 3 символов'}),
                'isBase64Encoded': False
            }
        
        if len(password) < 6:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'}),
                'isBase64Encoded': False
            }
        
        # Check if username exists
        cur.execute(
            "SELECT id FROM t_p99005675_game_items_marketpla.users WHERE LOWER(username) = LOWER(%s)",
            (username,)
        )
        existing_user = cur.fetchone()
        
        if existing_user:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Пользователь с таким логином уже существует'}),
                'isBase64Encoded': False
            }
        
        # Create new user
        password_hash = hash_password(password)
        referral_code = generate_referral_code()
        
        cur.execute(
            """INSERT INTO t_p99005675_game_items_marketpla.users 
               (username, password_hash, referral_code, balance) 
               VALUES (%s, %s, %s, 0.00) 
               RETURNING id, username, balance""",
            (username, password_hash, referral_code)
        )
        user = cur.fetchone()
        conn.commit()
        user_id, user_username, balance = user
        
    else:  # login
        # Find user by username
        cur.execute(
            """SELECT id, username, password_hash, balance 
               FROM t_p99005675_game_items_marketpla.users 
               WHERE LOWER(username) = LOWER(%s)""",
            (username,)
        )
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Неверный логин или пароль'}),
                'isBase64Encoded': False
            }
        
        user_id, user_username, password_hash, balance = user
        
        # Check if user has password (OAuth users don't have password)
        if not password_hash:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Этот аккаунт создан через соцсеть'}),
                'isBase64Encoded': False
            }
        
        # Verify password
        if not verify_password(password, password_hash):
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Неверный логин или пароль'}),
                'isBase64Encoded': False
            }
    
    cur.close()
    conn.close()
    
    # Generate JWT token
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    token = jwt.encode(
        {
            'user_id': user_id,
            'username': user_username,
            'exp': datetime.utcnow() + timedelta(days=30)
        },
        jwt_secret,
        algorithm='HS256'
    )
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'token': token,
            'user': {
                'id': user_id,
                'username': user_username,
                'balance': float(balance)
            }
        }),
        'isBase64Encoded': False
    }
