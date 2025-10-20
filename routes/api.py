
from controllers.dbConnection import DBConnection
from flask import Blueprint, jsonify, request

api_bp = Blueprint('api', __name__)

#Obtener productos de DB
@api_bp.route('/getProducts', methods=['GET'])
def getProducts():

    try:
        db = DBConnection()

        productos = db.query("""
            SELECT p.id_producto, p.nombre, p.descripcion, p.categoria, p.precio_unitario, p.activo, p.imagen_base64,
                   COALESCE(i.cantidad_actual, 0) as stock
            FROM costanzo.productos p
            LEFT JOIN costanzo.inventario i ON p.id_producto = i.id_producto
            WHERE p.activo = 1 AND COALESCE(i.cantidad_actual, 0) > 0
        """)

        categorias = db.query("""
            SELECT categoria FROM costanzo.productos
        """)

        db.close()

        for p in productos:
            p['precio_unitario'] = float(p['precio_unitario'])
        
        categoriaSet = set()
        for c in categorias:
            categoriaSet.add(c['categoria'])

        data = {
            'productos': productos,
            'categorias': list(categoriaSet)
        }

        return jsonify(data)

    except Exception as e:
        print("Error al obtener productos:", e)
        return jsonify([])
    

# Editar producto en DB
@api_bp.route('/updateProduct', methods=['POST'])
def updateProduct():

    print("Estoy aqui")

    try:
        data = request.get_json()

        id_producto = int(data.get('id_producto'))
        nombre = data.get('nombre', '').strip()
        descripcion = data.get('descripcion', '').strip()
        categoria = data.get('categoria', '').strip()
        precio_unitario = float(data.get('precio_unitario', 0))
        cantidad_actual = int(data.get('stock', 0))  # Now represents inventory quantity
        cantidad_minima = int(data.get('cantidad_minima', 0))
        ubicacion = data.get('ubicacion', '').strip()
        activo = int(data.get('activo', 1))
        imagen_base64 = data.get('imagen_base64')  # puede ser None

        db = DBConnection()

        # Update product (without stock column)
        if imagen_base64:
            product_query = """
                UPDATE costanzo.productos
                SET nombre = %s,
                    descripcion = %s,
                    categoria = %s,
                    precio_unitario = %s,
                    activo = %s,
                    imagen_base64 = %s
                WHERE id_producto = %s
            """
            product_params = [nombre, descripcion, categoria, precio_unitario, activo, imagen_base64, id_producto]
        else:
            product_query = """
                UPDATE costanzo.productos
                SET nombre = %s,
                    descripcion = %s,
                    categoria = %s,
                    precio_unitario = %s,
                    activo = %s
                WHERE id_producto = %s
            """
            product_params = [nombre, descripcion, categoria, precio_unitario, activo, id_producto]

        db.execute(product_query, product_params)

        # Update or insert inventory
        inventory_check = db.query("SELECT id_inventario FROM costanzo.inventario WHERE id_producto = %s", (id_producto,))
        if inventory_check:
            # Update existing inventory
            db.execute("""
                UPDATE costanzo.inventario
                SET cantidad_actual = %s, cantidad_minima = %s, ubicacion = %s, fecha_actualizacion = NOW()
                WHERE id_producto = %s
            """, (cantidad_actual, cantidad_minima, ubicacion, id_producto))
        else:
            # Insert new inventory record
            db.execute("""
                INSERT INTO costanzo.inventario (id_producto, cantidad_actual, cantidad_minima, ubicacion, fecha_actualizacion)
                VALUES (%s, %s, %s, %s, NOW())
            """, (id_producto, cantidad_actual, cantidad_minima, ubicacion))

        db.close()

        return jsonify({'success': True, 'message': 'Producto actualizado correctamente'})

    except Exception as e:
        print("Error al actualizar producto:", e)
        return jsonify({'success': False, 'message': 'Error al actualizar producto'})


# Agregar producto en DB
@api_bp.route('/insertProduct', methods=['POST'])
def insertProduct():
    try:
        data = request.get_json()

        nombre = data.get('nombre', '').strip()
        descripcion = data.get('descripcion', '').strip()
        categoria = data.get('categoria', '').strip()
        precio_unitario = float(data.get('precio_unitario', 0))
        cantidad_actual = int(data.get('stock', 0))  # Now represents inventory quantity
        cantidad_minima = int(data.get('cantidad_minima', 0))
        ubicacion = data.get('ubicacion', '').strip()
        activo = int(data.get('activo', 1))
        imagen_base64 = data.get('imagen_base64')  # puede ser None

        db = DBConnection()

        # Insert product (without stock column)
        product_query = """
            INSERT INTO costanzo.productos
            (nombre, descripcion, categoria, precio_unitario, activo, imagen_base64)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        product_params = [nombre, descripcion, categoria, precio_unitario, activo, imagen_base64]

        db.execute(product_query, product_params)
        product_id = db.cursor.lastrowid

        # Insert inventory record
        if cantidad_actual > 0 or cantidad_minima > 0:
            db.execute("""
                INSERT INTO costanzo.inventario (id_producto, cantidad_actual, cantidad_minima, ubicacion, fecha_actualizacion)
                VALUES (%s, %s, %s, %s, NOW())
            """, (product_id, cantidad_actual, cantidad_minima, ubicacion))

        db.close()

        return jsonify({'success': True, 'message': 'Producto agregado correctamente'})

    except Exception as e:
        print("Error al insertar producto:", e)
        return jsonify({'success': False, 'message': 'Error al insertar producto'})

# Borrar producto en DB
@api_bp.route('/deleteProduct', methods=['POST'])
def deleteProduct():
    try:
        data = request.get_json()
        id_producto = int(data.get('id_producto'))

        db = DBConnection()
        query = "DELETE FROM costanzo.productos WHERE id_producto = %s"
        db.execute(query, [id_producto])
        db.close()

        return jsonify({'success': True, 'message': 'Producto eliminado correctamente'})

    except Exception as e:
        print("Error al eliminar producto:", e)
        return jsonify({'success': False, 'message': 'Error al eliminar producto'})

# Obtener mensajes de contacto para admin
@api_bp.route('/api/getContactMessages', methods=['GET'])
def getContactMessages():
    try:
        db = DBConnection()
        messages = db.query("""
            SELECT id_mensaje, nombre, email, asunto, mensaje,
                   DATE_FORMAT(fecha_envio, '%Y-%m-%d %H:%i:%s') as fecha_envio,
                   estado
            FROM costanzo.mensajes_contacto
            ORDER BY fecha_envio DESC
        """)
        db.close()

        return jsonify({'success': True, 'messages': messages})

    except Exception as e:
        print("Error al obtener mensajes de contacto:", e)
        return jsonify({'success': False, 'message': 'Error al obtener mensajes'})

# Actualizar estado de mensaje de contacto
@api_bp.route('/updateContactMessageStatus', methods=['POST'])
def updateContactMessageStatus():
    try:
        data = request.get_json()
        id_mensaje = int(data.get('id_mensaje'))
        estado = data.get('estado')

        if estado not in ['nuevo', 'leído', 'respondido']:
            return jsonify({'success': False, 'message': 'Estado inválido'})

        db = DBConnection()
        db.execute("""
            UPDATE costanzo.mensajes_contacto
            SET estado = %s
            WHERE id_mensaje = %s
        """, (estado, id_mensaje))
        db.close()

        return jsonify({'success': True, 'message': 'Estado actualizado correctamente'})

    except Exception as e:
        print("Error al actualizar estado del mensaje:", e)
        return jsonify({'success': False, 'message': 'Error al actualizar estado'})

# Eliminar mensaje de contacto
@api_bp.route('/deleteContactMessage', methods=['POST'])
def deleteContactMessage():
    try:
        data = request.get_json()
        id_mensaje = int(data.get('id_mensaje'))

        db = DBConnection()
        db.execute("DELETE FROM costanzo.mensajes_contacto WHERE id_mensaje = %s", (id_mensaje,))
        db.close()

        return jsonify({'success': True, 'message': 'Mensaje eliminado correctamente'})

    except Exception as e:
        print("Error al eliminar mensaje de contacto:", e)
        return jsonify({'success': False, 'message': 'Error al eliminar mensaje'})

# Agregar nueva dirección
@api_bp.route('/api/address/add', methods=['POST'])
def addAddress():
  
    try:
        from flask import session

        if not session.get('autenticado'):
            return jsonify({'ok': False, 'message': 'Usuario no autenticado'}), 401

        id_usuario = session.get('id_user')
        data = request.get_json()

        alias = data.get('alias', '').strip()
        street = data.get('street', '').strip()
        neighborhood = data.get('neighborhood', '').strip()
        city = data.get('city', '').strip()
        state = data.get('state', '').strip()
        postalCode = data.get('postalCode', '').strip()

        # Validaciones básicas
        if not all([alias, street, neighborhood, city, state, postalCode]):
            return jsonify({'ok': False, 'message': 'Todos los campos son requeridos'}), 400

        if len(alias) > 50 or len(street) > 100 or len(neighborhood) > 100 or len(city) > 100 or len(state) > 100:
            return jsonify({'ok': False, 'message': 'Uno o más campos exceden la longitud máxima'}), 400

        if len(postalCode) != 5 or not postalCode.isdigit():
            return jsonify({'ok': False, 'message': 'Código postal debe tener 5 dígitos'}), 400

        db = DBConnection()

        # Insertar nueva dirección
        db.execute("""
            INSERT INTO costanzo.direcciones (id_usuario, alias, calle, colonia, ciudad, estado, cp)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (id_usuario, alias, street, neighborhood, city, state, postalCode))

        db.close()

        return jsonify({'ok': True, 'message': 'Dirección agregada correctamente'})

    except Exception as e:
        print("Error al agregar dirección:", e)
        return jsonify({'ok': False, 'message': 'Error interno del servidor'}), 500
