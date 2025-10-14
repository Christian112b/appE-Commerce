
from datetime import datetime
from controllers.dbConnection import DBConnection
from flask import Blueprint, jsonify, request, session

cart_bp = Blueprint('cart', __name__)

# Agregar producto en carrito
@cart_bp.route('/addCart', methods=['POST'])
def addCart():
    if not session.get('autenticado'):
        return jsonify({
            'ok': False,
            'mensaje': 'Debes iniciar sesión para agregar productos al carrito.'
        }), 401

    id_usuario = session.get('id_user')
    data = request.get_json()
    id_producto = data.get('id_producto')

    db = DBConnection()

    producto = db.query(
        "SELECT precio_unitario FROM costanzo.productos WHERE id_producto = %s",
        (id_producto,)
    )

    if not producto:
        db.close()
        return jsonify({'ok': False, 'mensaje': 'Producto no encontrado.'}), 404

    precio = producto[0]['precio_unitario']


    # Obtener o crear carrito
    carrito = db.query(
        "SELECT id_carrito FROM costanzo.carritocompra WHERE id_usuario = %s",
        (id_usuario,)
    )

    if not carrito:
        db.execute(
            "INSERT INTO costanzo.carritocompra (id_usuario, fecha_creacion) VALUES (%s, %s)",
            (id_usuario, datetime.now())
        )
        id_carrito = db.cursor.lastrowid
    else:
        id_carrito = carrito[0]['id_carrito']

    # Verificar si el producto ya está en el carrito
    item = db.query(
        "SELECT id_item, cantidad FROM costanzo.carrito_items WHERE id_carrito = %s AND id_producto = %s",
        (id_carrito, id_producto)
    )

    if item:
        nueva_cantidad = item[0]['cantidad'] + 1
        db.execute(
            "UPDATE costanzo.carrito_items SET cantidad = %s WHERE id_item = %s",
            (nueva_cantidad, item[0]['id_item'])
        )
    else:
        db.execute(
            "INSERT INTO costanzo.carrito_items (id_carrito, id_producto, cantidad, precio_unitario) VALUES (%s, %s, %s, %s)",
            (id_carrito, id_producto, 1, precio)
        )

    db.close()

    return jsonify({
        'ok': True,
        'mensaje': 'Producto agregado correctamente al carrito.'
    })


@cart_bp.route('/getItemsCart', methods=['GET'])
def getItemsCart():
    if not session.get('autenticado'):
        return jsonify({'ok': False, 'mensaje': 'Debes iniciar sesión para ver tu carrito.'}), 401

    id_usuario = session.get('id_user')

    db = DBConnection()

    # Obtener el carrito del usuario
    carrito = db.query(
        "SELECT id_carrito FROM costanzo.carritocompra WHERE id_usuario = %s",
        (id_usuario,)
    )

    if not carrito:
        db.close()
        return jsonify({'ok': True, 'items': []})  # Carrito vacío

    id_carrito = carrito[0]['id_carrito']

    # Obtener los productos del carrito con info visual
    raw_items = db.query("""
        SELECT 
            ci.id_producto AS id,
            p.nombre AS name,
            p.imagen_base64 AS image,
            ci.cantidad,
            ci.precio_unitario AS price
        FROM costanzo.carrito_items ci
        JOIN costanzo.productos p ON ci.id_producto = p.id_producto
        WHERE ci.id_carrito = %s
    """, (id_carrito,))

    db.close()

    # Agregar encabezado base64 a cada imagen
    items = []
    for item in raw_items:
        imagen_base64 = item['image']
        imagen_final = f"data:image/png;base64,{imagen_base64}" if imagen_base64 else None

        items.append({
            'id': item['id'],
            'name': item['name'],
            'image': imagen_final,
            'price': item['price'],
            'quantity': item['cantidad']
        })

    return jsonify({'ok': True, 'items': items})

@cart_bp.route('/check-session', methods=['GET'])
def verificar_sesion():
    autenticado = session.get('autenticado', False)
    return jsonify({'ok': autenticado})

@cart_bp.route('/saveCart', methods=['POST'])
def saveCart():
    if not session.get('autenticado'):
        return jsonify({'ok': False, 'mensaje': 'No autenticado'}), 401

    data = request.get_json()
    items = data.get('items', [])
    id_usuario = session.get('id_user')

    db = DBConnection()

    carrito = db.query("SELECT id_carrito FROM costanzo.carritocompra WHERE id_usuario = %s", (id_usuario,))
    if not carrito:
        db.execute("INSERT INTO costanzo.carritocompra (id_usuario) VALUES (%s)", (id_usuario,))
        carrito = db.query("SELECT id_carrito FROM costanzo.carritocompra WHERE id_usuario = %s", (id_usuario,))

    id_carrito = carrito[0]['id_carrito']

    # Limpiar carrito actual
    db.execute("DELETE FROM costanzo.carrito_items WHERE id_carrito = %s", (id_carrito,))

    # Insertar nuevos items
    for item in items:
        db.execute("""
            INSERT INTO costanzo.carrito_items (id_carrito, id_producto, cantidad, precio_unitario)
            VALUES (%s, %s, %s, %s)
        """, (id_carrito, item['id'], item['quantity'], item['price']))


    db.close()
    return jsonify({'ok': True})

