
import os
import stripe

from dotenv import load_dotenv
from datetime import datetime
from controllers.dbConnection import DBConnection
from flask import Blueprint, jsonify, request, session

load_dotenv()
stripe_api_key = os.getenv("STRIPE_PRIVATE_KEY")


cart_bp = Blueprint('cart', __name__)
stripe_api_key = stripe_api_key

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

@cart_bp.route('/getAddresses', methods=['GET'])
def getAddresses():
    if not session.get('autenticado'):
        return jsonify({'direcciones': []})

    id_usuario = session.get('id_user')
    db = DBConnection()

    direcciones = db.query("""
        SELECT 
            id_direccion AS id,
            alias,
            calle,
            colonia,
            ciudad,
            estado,
            cp
        FROM costanzo.direcciones
        WHERE id_usuario = %s
        """, (id_usuario,))

    db.close()
    return jsonify({'direcciones': direcciones})

@cart_bp.route('/create-payment-intent', methods=['POST'])
def create_payment():
    data = request.json
    db = DBConnection()
    id_usuario = session.get('id_user') if session.get('autenticado') else None
    # Obtener IP de origen (X-Forwarded-For si está presente, sino remote_addr)
    xff = request.headers.get('X-Forwarded-For', '')
    ip_origen = xff.split(',')[0].strip() if xff else request.remote_addr
    # Esperamos 'amount' en centavos y 'method_id' en el body
    method_id = data.get('method_id')

    # Métodos offline: (lista proporcionada)
    offline_methods = {4,5,6,7}  # 4: Transferencia, 5:Efectivo en tienda, 6:OXXO, 7:SPEI

    # Opcionales enviados desde frontend
    direccion_id = data.get('direccion_id')
    cupon_id = data.get('cupon_id')

    try:
        amount = int(data.get('amount', 0))
        # Si el método es offline (efectivo/transferencia/OXXO/SPEI), registrar sólo el pago pendiente en `logpagos` y actividad.
        # NOTE: ya no se usa la tabla `ventascotizaciones` aquí por petición del cliente.
        if method_id and int(method_id) in offline_methods:
            try:
                # Para pagos offline no hay PaymentIntent, guardamos NULL en id_intento_pago
                db.execute(
                    "INSERT INTO costanzo.logpagos (id_intento_pago, id_metodo_pago, monto, fecha_pago, estado_pago) VALUES (%s, %s, %s, %s, %s)",
                    (None, int(method_id), amount/100.0, datetime.now(), 'pendiente')
                )
            except Exception as log_exc:
                print('Error guardando logpagos (pendiente):', str(log_exc))

            # Registrar en logactividad: CREACION_PAGO (pendiente)
            try:
                descripcion_log = f"Pago pendiente creado metodo={method_id} monto={amount/100.0}"
                db.execute(
                    "INSERT INTO costanzo.logactividad (id_usuario, accion, descripcion, fecha_evento, ip_origen) VALUES (%s, %s, %s, %s, %s)",
                    (id_usuario, 'CREACION_PAGO', descripcion_log, datetime.now(), ip_origen)
                )
            except Exception as logact_exc:
                print('Error guardando logactividad (pendiente):', str(logact_exc))

            # Borrar carrito del usuario
            try:
                print('Attempting to delete cart for id_usuario=', id_usuario)
                if not id_usuario:
                    print('No id_usuario found; skipping delete')
                else:
                    carrito = db.query("SELECT id_carrito FROM costanzo.carritocompra WHERE id_usuario = %s", (id_usuario,))
                    if not carrito:
                        print('No carritocompra found for id_usuario=', id_usuario)
                    else:
                        id_carrito = carrito[0]['id_carrito']
                        try:
                            db.execute("DELETE FROM costanzo.carrito_items WHERE id_carrito = %s", (id_carrito,))
                            print('Deleted carrito_items rows count:', db.cursor.rowcount)
                        except Exception as del_items_exc:
                            print('Error deleting carrito_items (pendiente):', str(del_items_exc))
                        try:
                            db.execute("DELETE FROM costanzo.carritocompra WHERE id_carrito = %s", (id_carrito,))
                            print('Deleted carritocompra rows count:', db.cursor.rowcount)
                        except Exception as del_carrito_exc:
                            print('Error deleting carritocompra (pendiente):', str(del_carrito_exc))
            except Exception as del_exc:
                print('Error borrando carrito (pendiente):', str(del_exc))

            return jsonify({'ok': True, 'status': 'pendiente', 'closeModal': True})
        # Procesar pago con Stripe: crear PaymentIntent primero
        stripe.api_key = stripe_api_key
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='mxn',
            automatic_payment_methods={'enabled': True}
        )

        # Registrar el pago en `logpagos` usando el id del PaymentIntent para pagos online
        try:
            intent_id = getattr(intent, 'id', None)
            db.execute(
                "INSERT INTO costanzo.logpagos (id_intento_pago, id_metodo_pago, monto, fecha_pago, estado_pago) VALUES (%s, %s, %s, %s, %s)",
                (intent_id, int(method_id) if method_id else None, amount/100.0, datetime.now(), 'exitoso')
            )
        except Exception as log_exc:
            print('Error guardando logpagos (exitoso):', str(log_exc))

        # Registrar en logactividad: CREACION_PAGO (exitoso)
        try:
            descripcion_log = f"Pago exitoso creado metodo={method_id} monto={amount/100.0} intent_id={getattr(intent, 'id', None)}"
            db.execute(
                "INSERT INTO costanzo.logactividad (id_usuario, accion, descripcion, fecha_evento, ip_origen) VALUES (%s, %s, %s, %s, %s)",
                (id_usuario, 'CREACION_PAGO', descripcion_log, datetime.now(), ip_origen)
            )
        except Exception as logact_exc:
            print('Error guardando logactividad (exitoso):', str(logact_exc))

        # Borrar carrito del usuario al completar el pago
        try:
            carrito = db.query("SELECT id_carrito FROM costanzo.carritocompra WHERE id_usuario = %s", (id_usuario,))
            if carrito:
                id_carrito = carrito[0]['id_carrito']
                db.execute("DELETE FROM costanzo.carrito_items WHERE id_carrito = %s", (id_carrito,))
                db.execute("DELETE FROM costanzo.carritocompra WHERE id_carrito = %s", (id_carrito,))
        except Exception as del_exc:
            print('Error borrando carrito (exitoso):', str(del_exc))

        return jsonify({'clientSecret': intent.client_secret, 'ok': True, 'status': 'exitoso', 'closeModal': True})
    except Exception as e:
        print('Error en Stripe:', str(e))
        # Intentar loggear el error en la tabla logactividad
        descripcion = f"Error creando PaymentIntent: {str(e)}"
        try:
            db.execute(
                "INSERT INTO costanzo.logactividad (id_usuario, accion, descripcion, fecha_evento, ip_origen) VALUES (%s, %s, %s, %s, %s)",
                (id_usuario, 'create_payment_error', descripcion, datetime.now(), ip_origen)
            )
        except Exception as log_exc:
            print('Error guardando log de actividad (error):', str(log_exc))

        return jsonify({'error': str(e)}), 400
    finally:
        try:
            db.close()
        except Exception:
            pass


@cart_bp.route('/get-discounts', methods=['GET'])
def get_discounts():
    db = DBConnection()
    try:
        discounts = db.query(
            "SELECT id_descuento, nombre, tipo, valor, fecha_inicio, fecha_fin, activo FROM costanzo.descuentospromociones WHERE activo = 1 AND (fecha_inicio IS NULL OR fecha_inicio <= %s) AND (fecha_fin IS NULL OR fecha_fin >= %s)",
            (datetime.now(), datetime.now())
        )
        return jsonify(discounts)
    except Exception as e:
        print('Error fetching discounts:', str(e))
        return jsonify([])
    finally:
        db.close()
 