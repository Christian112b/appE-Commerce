from functools import wraps
from flask import request, redirect, url_for
from routes.auth import jwt_required

def login_required(f):
    @wraps(f)
    @jwt_required
    def wrapper(*args, **kwargs):
        # JWT validation is handled by jwt_required decorator
        return f(*args, **kwargs)
    return wrapper
