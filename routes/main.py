from flask import Blueprint, render_template, request, jsonify
from controllers.dbConnection import DBConnection
from routes.auth import validate_email, sanitize_input
import datetime

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    return render_template('index.html')

@main_bp.route('/login')
def login():
    return render_template('components/login.html')

@main_bp.route('/register')
def register():
    return render_template('components/register.html')

@main_bp.route('/contact', methods=['POST'])
def contact():
    """Handle contact form submission"""
    try:
        # Get and validate form data
        name = sanitize_input(request.form.get('name', ''), 100)
        email_raw = request.form.get('email', '').strip()
        subject = sanitize_input(request.form.get('subject', ''), 150)  # New subject field
        message = sanitize_input(request.form.get('message', ''), 1000)

        # Validate required fields
        if not name:
            return jsonify({'status': 400, 'message': 'El nombre es requerido'}), 400

        if not subject:
            return jsonify({'status': 400, 'message': 'El asunto es requerido'}), 400

        if not message:
            return jsonify({'status': 400, 'message': 'El mensaje es requerido'}), 400

        # Validate email
        normalized_email, email_error = validate_email(email_raw)
        if email_error:
            return jsonify({'status': 400, 'message': email_error}), 400

        # Save to database
        db = DBConnection()
        try:
            db.execute("""
                INSERT INTO costanzo.mensajes_contacto (nombre, email, asunto, mensaje, fecha_envio, estado)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (name, normalized_email, subject, message, datetime.datetime.now(), 'nuevo'))

            db.close()

            return jsonify({
                'status': 200,
                'message': 'Mensaje enviado correctamente. Te responderemos pronto.'
            }), 200

        except Exception as db_error:
            print(f"Database error: {db_error}")
            db.close()
            return jsonify({'status': 500, 'message': 'Error al guardar el mensaje'}), 500

    except Exception as e:
        print(f"Contact form error: {e}")
        return jsonify({'status': 500, 'message': 'Error interno del servidor'}), 500
