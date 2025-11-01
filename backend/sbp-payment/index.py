import json
import uuid
import io
import base64
from typing import Dict, Any
try:
    import qrcode
except ImportError:
    qrcode = None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Generate СБП QR code for payment to card 2200700628083809
    Args: event with httpMethod, body containing amount and userId
    Returns: QR code image and payment data for СБП
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        amount = body_data.get('amount', 0)
        user_id = body_data.get('userId', 'unknown')
        
        if not amount or amount <= 0:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid amount'})
            }
        
        payment_id = str(uuid.uuid4())
        rubles = amount / 10
        recipient_card = '2200700628083809'
        
        sbp_url = f"https://qr.nspk.ru/AD10003H7CH2FNNHH0QGFMVHQ26LO3I5?type=02&bank=100000000111&sum={rubles}&cur=RUB&crc=B68B"
        
        qr_base64 = None
        if qrcode:
            qr = qrcode.QRCode(version=1, box_size=10, border=2)
            qr.add_data(sbp_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'paymentUrl': sbp_url,
                'qrCode': qr_base64,
                'paymentId': payment_id,
                'amount': amount,
                'rubles': rubles,
                'recipientCard': recipient_card,
                'userId': user_id
            })
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }