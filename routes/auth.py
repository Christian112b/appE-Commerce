from flask import Blueprint, request, session, jsonify, redirect, url_for

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/validationLogin', methods=['POST'])
def validationLogin():
    user = request.form['username']
    password = request.form['password']

    if user == 'admin' and password == '1234':
        session['user'] = user
        session['autenticado'] = True
        session['admin'] = 1
        return jsonify({'status': 200})
    else:
        return jsonify({'status': 400})

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.index'))
