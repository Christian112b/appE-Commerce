import bcrypt

from controllers.dbConnection import DBConnection
from flask import Blueprint, request, session, jsonify, redirect, url_for

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/validationLogin', methods=['POST'])
def validationLogin():
    try:
        user = request.form['email']
        password = request.form['password']

        db = DBConnection()

        # Buscar usuario por correo
        result = db.query("""
            SELECT id_usuario, nombre, apellido, correo,contraseña_hash, tipo_usuario, telefono
            FROM usuarios
            WHERE correo = %s
        """, (user,))

        db.close()

        if not result:
            return jsonify({'status': 401, 'message': 'Usuario no encontrado'})

        usuario = result[0]

        # Verificar contraseña
        if bcrypt.checkpw(password.encode('utf-8'), usuario['contraseña_hash'].encode('utf-8')):
            session['user'] = f"{usuario['nombre']} {usuario['apellido']}"
            session['autenticado'] = True
            session['correo'] = usuario['correo']
            session['id_user'] = usuario['id_usuario']
            session['admin'] = 1 if usuario['tipo_usuario'] == 1 else 0
            return jsonify({'status': 200, 'message': 'Login exitoso'})
        else:
            return jsonify({'status': 403, 'message': 'Contraseña incorrecta'})

    except Exception as e:
        print("Error en login:", e)
        return jsonify({'status': 500, 'message': 'Error interno del servidor'})

@auth_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.index'))

@auth_bp.route('/registerUser', methods=['POST'])
def validationRegister():
    try:
        name = request.form['name']
        email = request.form['email']
        phone = request.form['phone']
        password = request.form['password']

        db = DBConnection()

        existing = db.query("SELECT id_usuario FROM usuarios WHERE correo = %s", (email,))
        if existing:
            db.close()
            return jsonify({'status': 409, 'message': 'El correo ya está registrado.'})

        # Hashear la contraseña
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Insertar usuario
        db.execute("""
            INSERT INTO usuarios (nombre, correo, telefono, contraseña_hash, fecha_registro)
            VALUES (%s, %s, %s, %s, NOW())
        """, (name, email, phone, hashed_password.decode('utf-8')))

        db.close()
        return jsonify({'status': 200, 'message': 'Usuario registrado correctamente.'})

    except Exception as e:
        print("Error en el registro:", e)
        return jsonify({'status': 500, 'message': 'Error interno del servidor.'})