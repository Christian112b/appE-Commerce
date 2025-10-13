import os
from dotenv import load_dotenv
from flask import Flask

from routes.main import main_bp
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.api import api_bp
from routes.cart import cart_bp


load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

# Registrar Blueprints
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(api_bp)
app.register_blueprint(cart_bp)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
