import bcrypt
# Import database connection
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from controllers.dbConnection import DBConnection

class User:
    def __init__(self, id_usuario=None, nombre=None, email=None, password_hash=None,
                 fecha_registro=None, activo=None):
        self.id_usuario = id_usuario
        self.nombre = nombre
        self.email = email
        self.password_hash = password_hash
        self.fecha_registro = fecha_registro
        self.activo = activo

    @staticmethod
    def authenticate(email, password):
        """Authenticate user with email and password"""
        db = DBConnection()
        try:
            user = db.query(
                "SELECT id_usuario, nombre, email, password_hash, activo FROM usuarios WHERE email = %s",
                (email,)
            )

            if user and user[0]['activo'] and bcrypt.checkpw(password.encode('utf-8'), user[0]['password_hash'].encode('utf-8')):
                return {
                    'id_usuario': user[0]['id_usuario'],
                    'nombre': user[0]['nombre'],
                    'email': user[0]['email']
                }
            return None
        finally:
            db.close()

    @staticmethod
    def register(nombre, email, password):
        """Register a new user"""
        db = DBConnection()
        try:
            # Check if email already exists
            existing = db.query("SELECT id_usuario FROM usuarios WHERE email = %s", (email,))
            if existing:
                return False, "Email ya registrado"

            # Hash password
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            # Insert new user
            db.execute(
                "INSERT INTO usuarios (nombre, email, password_hash) VALUES (%s, %s, %s)",
                (nombre, email, password_hash)
            )

            return True, "Usuario registrado exitosamente"
        except Exception as e:
            print(f"Error registering user: {e}")
            return False, "Error interno del servidor"
        finally:
            db.close()

    @staticmethod
    def get_addresses(user_id):
        """Get all addresses for a user"""
        db = DBConnection()
        try:
            addresses = db.query("""
                SELECT
                    id_direccion AS id,
                    alias,
                    calle,
                    colonia,
                    ciudad,
                    estado,
                    cp
                FROM direcciones
                WHERE id_usuario = %s
                ORDER BY alias
            """, (user_id,))
            return addresses
        finally:
            db.close()

    @staticmethod
    def add_address(user_id, alias, calle, colonia, ciudad, estado, cp):
        """Add new address for user"""
        db = DBConnection()
        try:
            db.execute(
                "INSERT INTO direcciones (id_usuario, alias, calle, colonia, ciudad, estado, cp) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (user_id, alias, calle, colonia, ciudad, estado, cp)
            )
            return True
        except Exception as e:
            print(f"Error adding address: {e}")
            return False
        finally:
            db.close()