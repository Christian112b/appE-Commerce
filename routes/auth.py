import bcrypt
import re
import jwt
import datetime
import os

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from controllers.dbConnection import DBConnection
from flask import Blueprint, request, session, jsonify, redirect, url_for, current_app

auth_bp = Blueprint('auth', __name__)

# JWT Secret Key (should be in environment variables in production)
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

def generate_jwt_token(user_id, email, is_admin=False):
    """Generate JWT token for API authentication"""
    payload = {
        'user_id': user_id,
        'email': email,
        'is_admin': is_admin,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),  # 24 hours
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

def jwt_required(f):
    """Decorator to protect routes with JWT authentication"""
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token de autorización requerido'}), 401

        token = auth_header.split(' ')[1]
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Token inválido o expirado'}), 401

        # Add user info to request context
        request.user_id = payload['user_id']
        request.user_email = payload['email']
        request.is_admin = payload['is_admin']

        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def validate_email(email):
    """Validate email format and return normalized version"""
    if not email or not isinstance(email, str):
        return None, "El correo electrónico es requerido"

    # Normalize email to lowercase and strip whitespace
    email = email.strip().lower()

    # Email regex validation
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return None, "Formato de correo electrónico inválido"

    # Additional checks
    if len(email) > 254:  # RFC 5321 limit
        return None, "El correo electrónico es demasiado largo"

    return email, None

def validate_password(password):
    """Validate password requirements"""
    if not password or not isinstance(password, str):
        return False, "La contraseña es requerida"

    # Check minimum length
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"

    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "La contraseña debe contener al menos una letra mayúscula"

    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "La contraseña debe contener al menos una letra minúscula"

    # Check for at least one digit
    if not re.search(r'\d', password):
        return False, "La contraseña debe contener al menos un número"

    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "La contraseña debe contener al menos un carácter especial"

    return True, None

def sanitize_input(text, max_length=255):
    """Sanitize text input to prevent XSS and SQL injection"""
    if not text or not isinstance(text, str):
        return ""

    # Remove potentially dangerous characters
    text = re.sub(r'[<>]', '', text)  # Remove angle brackets
    text = text.strip()

    # Limit length
    if len(text) > max_length:
        text = text[:max_length]

    return text

@auth_bp.route('/validationLogin', methods=['POST'])
def validationLogin():

    print("Iniciando proceso de login")


    try:
        # Get and validate form data
        user_email = request.form.get('email', '').strip()
        password = request.form.get('password', '')

        # Validate email format
        normalized_email, email_error = validate_email(user_email)
        if email_error:
            return jsonify({'status': 400, 'message': email_error})

        # Validate password presence
        if not password:
            return jsonify({'status': 400, 'message': 'La contraseña es requerida'})

        db = DBConnection()

        # Buscar usuario por correo normalizado
        result = db.query("""
            SELECT id_usuario, nombre, apellido, correo, contraseña_hash, tipo_usuario, telefono
            FROM usuarios
            WHERE LOWER(correo) = %s
        """, (normalized_email,))

        db.close()

        if not result:
            return jsonify({'status': 401, 'message': 'Usuario no encontrado'}), 401

        usuario = result[0]

        # Verificar contraseña con bcrypt
        if bcrypt.checkpw(password.encode('utf-8'), usuario['contraseña_hash'].encode('utf-8')):
            # Usar sesiones tradicionales de Flask
            session['user'] = f"{usuario['nombre']} {usuario['apellido']}"
            session['autenticado'] = True
            session['correo'] = usuario['correo']
            session['id_user'] = usuario['id_usuario']
            session['admin'] = 1 if usuario['tipo_usuario'] == 1 else 0

            # Generate JWT token for API access
            jwt_token = generate_jwt_token(
                usuario['id_usuario'],
                usuario['correo'],
                usuario['tipo_usuario'] == 1
            )

            return jsonify({
                'status': 200,
                'message': 'Login exitoso',
                'token': jwt_token
            })
        else:
            return jsonify({'status': 403, 'message': 'Contraseña incorrecta'}), 403

    except Exception as e:
        print("Error en login:", e)
        return jsonify({'status': 500, 'message': 'Error interno del servidor'}), 500

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.index'))

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify JWT token for API authentication"""
    data = request.get_json()
    token = data.get('token', '')

    if not token:
        return jsonify({'valid': False, 'message': 'Token requerido'}), 400

    payload = verify_jwt_token(token)
    if payload:
        return jsonify({
            'valid': True,
            'user': {
                'id': payload['user_id'],
                'email': payload['email'],
                'is_admin': payload['is_admin']
            }
        })
    else:
        return jsonify({'valid': False, 'message': 'Token inválido o expirado'}), 401

@auth_bp.route('/registerUser', methods=['POST'])
def validationRegister():
    try:



        # Get and sanitize form data
        name = sanitize_input(request.form.get('name', ''), 100)
        email_raw = request.form.get('email', '').strip()
        phone = sanitize_input(request.form.get('phone', ''), 20)
        password = request.form.get('password', '')



        # Validate required fields
        if not name:
            return jsonify({'status': 400, 'message': 'El nombre es requerido'}), 400

        if not phone:
            return jsonify({'status': 400, 'message': 'El teléfono es requerido'}), 400

        # Validate email
        normalized_email, email_error = validate_email(email_raw)
        if email_error:
            return jsonify({'status': 400, 'message': email_error}), 400

        # Validate password requirements
            password_valid, password_error = validate_password(password)
            if not password_valid:
                return jsonify({'status': 400, 'message': password_error}), 400
            print("Iniciando proceso de registro")

        # Additional phone validation (basic)
        if not re.match(r'^\+?\d{10,15}$', phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')):
            return jsonify({'status': 400, 'message': 'Formato de teléfono inválido'}), 400


        db = DBConnection()

        # Check if email already exists (case-insensitive)
        existing = db.query("SELECT id_usuario FROM usuarios WHERE LOWER(correo) = %s", (normalized_email,))
        if existing:
            db.close()
            return jsonify({'status': 409, 'message': 'El correo ya está registrado.'}), 409

        # Hash the password with bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Insert user with normalized email
        db.execute("""
            INSERT INTO usuarios (nombre, correo, telefono, contraseña_hash, fecha_registro)
            VALUES (%s, %s, %s, %s, NOW())
        """, (name, normalized_email, phone, hashed_password.decode('utf-8')))

        db.close()

        # Get the newly created user ID for JWT token
        db = DBConnection()
        try:
            user_result = db.query("SELECT id_usuario FROM usuarios WHERE correo = %s", (normalized_email,))
            if user_result:
                user_id = user_result[0]['id_usuario']
                jwt_token = generate_jwt_token(user_id, normalized_email, False)
            else:
                jwt_token = None
        finally:
            db.close()

        if jwt_token:
            return jsonify({
                'status': 200,
                'message': 'Usuario registrado correctamente.',
                'token': jwt_token
            }), 200
        else:
            return jsonify({
                'status': 200,
                'message': 'Usuario registrado correctamente.'
            }), 200

    except Exception as e:
        print("Error en el registro:", e)
        return jsonify({'status': 500, 'message': 'Error interno del servidor.'})