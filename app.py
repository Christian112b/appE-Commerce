import os
from dotenv import load_dotenv
from flask import Flask
from flask_mail import Mail
from flask_cors import CORS

from routes.main import main_bp
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.api import api_bp
from routes.cart import cart_bp


load_dotenv()

app = Flask(__name__)
CORS(app, 
     origins=["https://backend-app-x7k2.zeabur.app"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)


app.secret_key = os.getenv('SECRET_KEY')

# Configuración de Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'tienda@costanzo.com')

mail = Mail(app)

# HTTPS configuration for production
if os.getenv('FLASK_ENV') == 'production':
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Registrar Blueprints
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(api_bp)
app.register_blueprint(cart_bp)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
