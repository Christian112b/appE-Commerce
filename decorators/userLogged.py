from functools import wraps
from flask import session, redirect, url_for

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if 'id_usuario' not in session:
            return redirect(url_for('login'))  # Redirige a la ruta de login
        return f(*args, **kwargs)
    return wrapper
