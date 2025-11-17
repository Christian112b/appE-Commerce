
from controllers.dbConnection import DBConnection
from flask import Blueprint, jsonify, request, Response
from routes.auth import jwt_required
from models.order import Order

api_bp = Blueprint('api', __name__)

#Obtener productos de DB
@api_bp.route('/getProducts', methods=['GET'])
def getProducts():


    try:
        db = DBConnection()

        productos = db.query("""
            SELECT p.id_producto, p.nombre, p.descripcion, p.categoria, p.precio_unitario, p.activo,
                    COALESCE(i.cantidad_actual, 0) as stock,
                    p.imagen
            FROM costanzo.productos p
            LEFT JOIN costanzo.inventario i ON p.id_producto = i.id_producto
            WHERE p.activo = 1 AND COALESCE(i.cantidad_actual, 0) > 0
        """)

        categorias = db.query("""
            SELECT categoria FROM costanzo.productos
        """)

        db.close()

        
        newList = []

        for p in productos:
            newList.append(p['imagen'])
            
            p['precio_unitario'] = float(p['precio_unitario'])
        
        categoriaSet = set()
        for c in categorias:
            categoriaSet.add(c['categoria'])

        data = {
            'productos': productos,
            'categorias': list(categoriaSet)
        }

        print(newList[0])

        return jsonify(data)

    except Exception as e:
        print("Error al obtener productos:", e)
        return jsonify([])
    

def compress_image_function(image_data):
    """Convierte imagen a WebP para mejor compresión"""
    try:
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        output = io.BytesIO()
        image.save(output, format='WebP', quality=75)
        
        return base64.b64encode(output.getvalue()).decode()
    except:
        return image_data

# Editar producto en DB
@api_bp.route('/updateProduct', methods=['POST'])
def updateProduct():

    print("Estoy aqui")

    try:
        id_producto = int(request.form.get('id_producto'))
        nombre = request.form.get('nombre', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        categoria = request.form.get('categoria', '').strip()
        precio_unitario = float(request.form.get('precio_unitario', 0))
        cantidad_actual = int(request.form.get('stock', 0))
        cantidad_minima = int(request.form.get('cantidad_minima', 0))
        ubicacion = request.form.get('ubicacion', '').strip()
        activo = int(request.form.get('activo', 1))

        # Handle image file
        imagen_data = None
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename:
                imagen_data = file.read()

        db = DBConnection()

        # Update product
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

        # Update or insert image
        if imagen_data is not None:
            # Check if image exists
            image_check = db.query("SELECT id FROM costanzo.images WHERE product_id = %s", (id_producto,))
            if image_check:
                # Update existing image
                db.execute("""
                    UPDATE costanzo.images
                    SET image = %s
                    WHERE product_id = %s
                """, (imagen_data, id_producto))
            else:
                # Insert new image
                db.execute("""
                    INSERT INTO costanzo.images (product_id, image)
                    VALUES (%s, %s)
                """, (id_producto, imagen_data))

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
        nombre = request.form.get('nombre', '').strip()
        descripcion = request.form.get('descripcion', '').strip()
        categoria = request.form.get('categoria', '').strip()
        precio_unitario = float(request.form.get('precio_unitario', 0))
        cantidad_actual = int(request.form.get('stock', 0))
        cantidad_minima = int(request.form.get('cantidad_minima', 0))
        ubicacion = request.form.get('ubicacion', '').strip()
        activo = int(request.form.get('activo', 1))

        # Handle image file
        imagen_data = None
        if 'imagen' in request.files:
            file = request.files['imagen']
            if file and file.filename:
                imagen_data = file.read()

        db = DBConnection()

        # Insert product
        product_query = """
            INSERT INTO costanzo.productos
            (nombre, descripcion, categoria, precio_unitario, activo)
            VALUES (%s, %s, %s, %s, %s)
        """
        product_params = [nombre, descripcion, categoria, precio_unitario, activo]

        db.execute(product_query, product_params)
        product_id = db.cursor.lastrowid

        # Insert image if provided
        if imagen_data:
            db.execute("""
                INSERT INTO costanzo.images (product_id, image)
                VALUES (%s, %s)
            """, (product_id, imagen_data))

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
@jwt_required
def addAddress():

    try:
        id_usuario = request.user_id
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

# Servir imagen desde tabla images (BLOB)
@api_bp.route('/image/<int:product_id>')
def get_image(product_id):
    try:
        db = DBConnection()
        image_data = db.query("SELECT image FROM costanzo.images WHERE product_id = %s", (product_id,))
        db.close()

        if image_data and image_data[0]['image']:
            return Response(image_data[0]['image'], mimetype='image/jpeg')
        else:
            return '', 404
    except Exception as e:
        print("Error al obtener imagen:", e)
        return '', 500

# Crear pedido
@api_bp.route('/create-order', methods=['POST'])
@jwt_required
def create_order():
    try:
        user_id = request.user_id
        data = request.get_json()

        cart_items = data.get('cart_items', [])
        total = float(data.get('total', 0))
        address_id = int(data.get('address_id', 0))
        payment_method = data.get('payment_method', '')

        if not cart_items or total <= 0 or not address_id:
            return jsonify({'success': False, 'message': 'Datos incompletos para crear el pedido'}), 400

        order_id, order_number = Order.create_order(user_id, cart_items, total, address_id, payment_method)

        if order_id:
            return jsonify({
                'success': True,
                'message': 'Pedido creado exitosamente',
                'order_id': order_id,
                'order_number': order_number
            })
        else:
            return jsonify({'success': False, 'message': 'Error al crear el pedido'}), 500

    except Exception as e:
        print("Error al crear pedido:", e)
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500

# Obtener pedidos del usuario
@api_bp.route('/user-orders/<int:user_id>', methods=['GET'])
@jwt_required
def get_user_orders(user_id):
    try:
        # Verify that the user is requesting their own orders
        if request.user_id != user_id:
            return jsonify({'success': False, 'message': 'No autorizado'}), 403

        orders = Order.get_user_orders(user_id)

        return jsonify({'success': True, 'orders': orders})

    except Exception as e:
        print("Error al obtener pedidos:", e)
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500

# Actualizar estado del pedido
@api_bp.route('/update-order/<int:order_id>', methods=['PUT'])
@jwt_required
def update_order_status(order_id):
    try:
        data = request.get_json()
        new_status = data.get('status', '')

        if new_status not in ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']:
            return jsonify({'success': False, 'message': 'Estado inválido'}), 400

        # Check if user owns this order (for non-admin users)
        order = Order.get_order_by_id(order_id)
        if not order:
            return jsonify({'success': False, 'message': 'Pedido no encontrado'}), 404

        # Only allow users to cancel their own orders, admins can update any
        if new_status == 'cancelado' and order['id_usuario'] != request.user_id:
            return jsonify({'success': False, 'message': 'No autorizado para cancelar este pedido'}), 403

        success = Order.update_order_status(order_id, new_status)

        if success:
            return jsonify({'success': True, 'message': 'Estado del pedido actualizado'})
        else:
            return jsonify({'success': False, 'message': 'Error al actualizar el estado'}), 500

    except Exception as e:
        print("Error al actualizar estado del pedido:", e)
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500
