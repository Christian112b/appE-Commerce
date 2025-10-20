
import os
import stripe
from threading import Thread

from dotenv import load_dotenv
from datetime import datetime, timedelta
from pytz import timezone
from controllers.dbConnection import DBConnection
from flask import Blueprint, jsonify, request, session
from flask_mail import Message

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
        "SELECT p.precio_unitario, COALESCE(i.cantidad_actual, 0) as stock_disponible FROM costanzo.productos p LEFT JOIN costanzo.inventario i ON p.id_producto = i.id_producto WHERE p.id_producto = %s AND p.activo = 1",
        (id_producto,)
    )

    if not producto:
        db.close()
        return jsonify({'ok': False, 'mensaje': 'Producto no encontrado o inactivo.'}), 404

    precio = producto[0]['precio_unitario']
    stock_disponible = producto[0]['stock_disponible']

    if stock_disponible <= 0:
        db.close()
        return jsonify({'ok': False, 'mensaje': 'Producto sin stock disponible.'}), 400


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
    # Usar zona horaria de México para fechas
    mexico_tz = timezone('America/Mexico_City')
    now_mexico = datetime.now(mexico_tz)
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
                    (None, int(method_id), amount/100.0, now_mexico, 'pendiente')
                )
            except Exception as log_exc:
                print('Error guardando logpagos (pendiente):', str(log_exc))

            # Registrar en logactividad: CREACION_PAGO (pendiente)
            try:
                descripcion_log = f"Pago pendiente creado metodo={method_id} monto={amount/100.0}"
                db.execute(
                    "INSERT INTO costanzo.logactividad (id_usuario, accion, descripcion, fecha_evento, ip_origen) VALUES (%s, %s, %s, %s, %s)",
                    (id_usuario, 'CREACION_PAGO', descripcion_log, now_mexico, ip_origen)
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
                        # Obtener items del carrito para actualizar inventario (solo para pagos pendientes)
                        cart_items = db.query("""
                            SELECT id_producto, cantidad FROM costanzo.carrito_items WHERE id_carrito = %s
                        """, (id_carrito,))

                        # Actualizar inventario para cada producto vendido (pagos pendientes)
                        for item in cart_items:
                            db.execute("""
                                UPDATE costanzo.inventario
                                SET cantidad_actual = cantidad_actual - %s, fecha_actualizacion = NOW()
                                WHERE id_producto = %s
                            """, (item['cantidad'], item['id_producto']))

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
                (intent_id, int(method_id) if method_id else None, amount/100.0, now_mexico, 'exitoso')
            )
        except Exception as log_exc:
            print('Error guardando logpagos (exitoso):', str(log_exc))

        # Registrar en logactividad: CREACION_PAGO (exitoso)
        try:
            descripcion_log = f"Pago exitoso creado metodo={method_id} monto={amount/100.0} intent_id={getattr(intent, 'id', None)}"
            db.execute(
                "INSERT INTO costanzo.logactividad (id_usuario, accion, descripcion, fecha_evento, ip_origen) VALUES (%s, %s, %s, %s, %s)",
                (id_usuario, 'CREACION_PAGO', descripcion_log, now_mexico, ip_origen)
            )
        except Exception as logact_exc:
            print('Error guardando logactividad (exitoso):', str(logact_exc))

        # Borrar carrito del usuario al completar el pago y actualizar inventario
        try:
            carrito = db.query("SELECT id_carrito FROM costanzo.carritocompra WHERE id_usuario = %s", (id_usuario,))
            if carrito:
                id_carrito = carrito[0]['id_carrito']

                # Obtener items del carrito para actualizar inventario
                cart_items = db.query("""
                    SELECT id_producto, cantidad FROM costanzo.carrito_items WHERE id_carrito = %s
                """, (id_carrito,))

                # Actualizar inventario para cada producto vendido
                for item in cart_items:
                    db.execute("""
                        UPDATE costanzo.inventario
                        SET cantidad_actual = cantidad_actual - %s, fecha_actualizacion = NOW()
                        WHERE id_producto = %s
                    """, (item['cantidad'], item['id_producto']))

                    # Actualizar tabla ventas_productos
                    db.execute("""
                        INSERT INTO costanzo.ventas_productos (id_producto, total_vendido, fecha_ultima_venta)
                        VALUES (%s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            total_vendido = total_vendido + VALUES(total_vendido),
                            fecha_ultima_venta = VALUES(fecha_ultima_venta)
                    """, (item['id_producto'], item['cantidad'], now_mexico))

                # Obtener email del usuario para enviar confirmación
                usuario = db.query("SELECT email FROM costanzo.usuarios WHERE id_usuario = %s", (id_usuario,))
                email_usuario = usuario[0]['email'] if usuario else None

                # Preparar datos del pedido para el correo
                subtotal = sum(item['price'] * item['quantity'] for item in cart_items)
                iva = subtotal * 0.16
                descuento = 0
                descuento_info = ""

                # Calcular descuento si hay cupón aplicado (desde request data)
                if cupon_id:
                    cupon = db.query("SELECT nombre, tipo, valor FROM costanzo.cupones WHERE id_descuento = %s", (cupon_id,))
                    if cupon:
                        cupon_data = cupon[0]
                        if cupon_data['tipo'] == 'porcentaje':
                            descuento = subtotal * (cupon_data['valor'] / 100)
                            descuento_info = f"{cupon_data['nombre']} ({cupon_data['valor']}%)"
                        else:
                            descuento = float(cupon_data['valor'] or 0)
                            descuento_info = cupon_data['nombre']

                total = subtotal + iva - descuento

                # Obtener dirección de envío
                direccion_envio = "Dirección no especificada"
                if direccion_id:
                    direccion = db.query("SELECT CONCAT(calle, ', ', colonia, ', ', ciudad, ', ', estado, ' CP:', cp) as full_address FROM costanzo.direcciones WHERE id_direccion = %s", (direccion_id,))
                    if direccion:
                        direccion_envio = direccion[0]['full_address']

                # Mapear método de pago
                metodo_map = {1: 'Tarjeta de Crédito', 4: 'Transferencia Bancaria', 5: 'Efectivo en Tienda', 6: 'OXXO', 7: 'SPEI'}
                metodo_pago = metodo_map.get(method_id, f'Método {method_id}')

                datos_pedido = {
                    'numero_pedido': f"CC-{datetime.now().strftime('%Y%m%d%H%M%S')}",
                    'fecha_pedido': now_mexico.strftime('%d/%m/%Y %H:%M'),
                    'productos': cart_items,
                    'subtotal': subtotal,
                    'iva': iva,
                    'descuento': descuento,
                    'descuento_info': descuento_info,
                    'total': total,
                    'direccion_envio': direccion_envio,
                    'metodo_pago': metodo_pago
                }

                # Borrar items del carrito
                db.execute("DELETE FROM costanzo.carrito_items WHERE id_carrito = %s", (id_carrito,))
                db.execute("DELETE FROM costanzo.carritocompra WHERE id_carrito = %s", (id_carrito,))

                # Enviar correo de confirmación en background si hay email
                if email_usuario:
                    Thread(target=enviar_correo_confirmacion, args=(email_usuario, datos_pedido)).start()
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
                (id_usuario, 'create_payment_error', descripcion, now_mexico, ip_origen)
            )
        except Exception as log_exc:
            print('Error guardando log de actividad (error):', str(log_exc))

        return jsonify({'error': str(e)}), 400
    finally:
        try:
            db.close()
        except Exception:
            pass

def enviar_correo_confirmacion(email_usuario, datos_pedido):
    """Envía correo de confirmación de pedido"""
    try:
        # Crear lista de productos para el email
        productos_html = ""
        for producto in datos_pedido['productos']:
            productos_html += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{producto['name']}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">{producto['quantity']}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${producto['price']:.2f}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${producto['price'] * producto['quantity']:.2f}</td>
            </tr>
            """

        # Template HTML del correo
        html_content = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de Pedido - Chocolates Costanzo</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8B4513; margin-bottom: 10px;">¡Gracias por tu compra!</h1>
                <p style="font-size: 16px; color: #666;">Tu pedido ha sido confirmado exitosamente</p>
            </div>

            <!-- Order Details -->
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #8B4513; margin-bottom: 15px;">Detalles del Pedido</h2>
                <p><strong>Número de pedido:</strong> {datos_pedido['numero_pedido']}</p>
                <p><strong>Fecha:</strong> {datos_pedido['fecha_pedido']}</p>
                <p><strong>Método de pago:</strong> {datos_pedido['metodo_pago']}</p>
            </div>

            <!-- Products Table -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #8B4513; margin-bottom: 10px;">Productos</h3>
                <table style="width: 100%; border-collapse: collapse; background: white; border: 1px solid #ddd;">
                    <thead>
                        <tr style="background: #8B4513; color: white;">
                            <th style="padding: 10px; text-align: left;">Producto</th>
                            <th style="padding: 10px; text-align: center;">Cantidad</th>
                            <th style="padding: 10px; text-align: right;">Precio</th>
                            <th style="padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos_html}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f9f9f9; font-weight: bold;">
                            <td colspan="3" style="padding: 10px; text-align: right;">Subtotal:</td>
                            <td style="padding: 10px; text-align: right;">${datos_pedido['subtotal']:.2f}</td>
                        </tr>
                        <tr style="background: #f9f9f9; font-weight: bold;">
                            <td colspan="3" style="padding: 10px; text-align: right;">IVA (16%):</td>
                            <td style="padding: 10px; text-align: right;">${datos_pedido['iva']:.2f}</td>
                        </tr>
                        {f'<tr style="background: #f9f9f9; font-weight: bold;"><td colspan="3" style="padding: 10px; text-align: right;">Descuento ({datos_pedido.get("descuento_info", "")}):</td><td style="padding: 10px; text-align: right; color: #d9534f;">-${datos_pedido["descuento"]:.2f}</td></tr>' if datos_pedido.get('descuento', 0) > 0 else ''}
                        <tr style="background: #8B4513; color: white; font-weight: bold; font-size: 18px;">
                            <td colspan="3" style="padding: 15px; text-align: right;">Total:</td>
                            <td style="padding: 15px; text-align: right;">${datos_pedido['total']:.2f}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- Shipping Info -->
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #8B4513; margin-bottom: 10px;">Información de Envío</h3>
                <p><strong>Dirección:</strong> {datos_pedido['direccion_envio']}</p>
                <p>Recibirás actualizaciones sobre el estado de tu pedido por este medio.</p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 14px;">
                    Gracias por elegir <strong>Chocolates Costanzo</strong><br>
                    ¡Esperamos verte pronto!
                </p>
                <div style="margin-top: 15px;">
                    <a href="#" style="color: #8B4513; text-decoration: none; margin: 0 10px;">Sitio Web</a> |
                    <a href="#" style="color: #8B4513; text-decoration: none; margin: 0 10px;">Contacto</a> |
                    <a href="#" style="color: #8B4513; text-decoration: none; margin: 0 10px;">Ayuda</a>
                </div>
            </div>
        </body>
        </html>
        """

        # Importar mail aquí para evitar import circular
        from app import mail

        msg = Message(
            subject=f'Confirmación de Pedido #{datos_pedido["numero_pedido"]} - Chocolates Costanzo',
            recipients=[email_usuario],
            html=html_content
        )

        mail.send(msg)
        print(f"Correo de confirmación enviado exitosamente a {email_usuario}")
        return True
    except Exception as e:
        print(f"Error enviando correo de confirmación: {e}")
        return False

@cart_bp.route('/validate-coupon', methods=['POST'])
def validate_coupon():
    data = request.get_json()
    coupon_name = data.get('coupon_name', '').strip()

    if not coupon_name:
        return jsonify({'ok': False, 'mensaje': 'Nombre del cupón requerido.'}), 400

    db = DBConnection()
    try:
        # Usar zona horaria de México para validar fechas
        mexico_tz = timezone('America/Mexico_City')
        now_mexico = datetime.now(mexico_tz)
        print('Hora de validación del cupón:', now_mexico)

        # Buscar cupón activo por nombre (case-insensitive)
        coupon = db.query(
            "SELECT id_descuento, nombre, tipo, valor FROM costanzo.cupones WHERE LOWER(nombre) = LOWER(%s) AND activo = 1 AND (fecha_inicio IS NULL OR fecha_inicio <= %s) AND (fecha_fin IS NULL OR fecha_fin >= %s)",
            (coupon_name, now_mexico, now_mexico)
        )

        print('Coupon query result for', coupon_name, ':', coupon)

        if coupon:
            return jsonify({
                'ok': True,
                'cupon': coupon[0]
            })
        else:
            return jsonify({
                'ok': False,
                'mensaje': 'Cupón no encontrado o no válido.'
            }), 404
    except Exception as e:
        print('Error validating coupon:', str(e))
        return jsonify({'ok': False, 'mensaje': 'Error interno del servidor.'}), 500
    finally:
        db.close()

@cart_bp.route('/get-reportes', methods=['GET'])
def get_reportes():
    periodo = request.args.get('periodo', 'mes')
    db = DBConnection()

    try:
        # Calcular fechas según período
        now = datetime.now()
        if periodo == 'hoy':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif periodo == 'semana':
            start_date = now - timedelta(days=now.weekday())
            start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif periodo == 'mes':
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif periodo == 'anio':
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            start_date = now - timedelta(days=30)

        # Ventas totales
        ventas_result = db.query(
            "SELECT COALESCE(SUM(monto), 0) as total FROM costanzo.logpagos WHERE estado_pago = 'exitoso' AND fecha_pago >= %s",
            (start_date,)
        )
        ventas_totales = float(ventas_result[0]['total']) if ventas_result else 0

        # Pedidos completados
        pedidos_result = db.query(
            "SELECT COUNT(*) as count FROM costanzo.logpagos WHERE estado_pago = 'exitoso' AND fecha_pago >= %s",
            (start_date,)
        )
        pedidos_completados = pedidos_result[0]['count'] if pedidos_result else 0

        # Productos vendidos (suma de cantidades de carrito_items)
        productos_result = db.query(
            "SELECT COALESCE(SUM(ci.cantidad), 0) as total FROM costanzo.carrito_items ci JOIN costanzo.carritocompra c ON ci.id_carrito = c.id_carrito WHERE c.fecha_creacion >= %s",
            (start_date,)
        )
        productos_vendidos = productos_result[0]['total'] if productos_result else 0

        # Cupones usados
        cupones_result = db.query(
            "SELECT COUNT(*) as count FROM costanzo.logpagos WHERE cupon_id IS NOT NULL AND estado_pago = 'exitoso' AND fecha_pago >= %s",
            (start_date,)
        )
        cupones_usados = cupones_result[0]['count'] if cupones_result else 0

        # Ventas por método de pago
        metodos_result = db.query(
            "SELECT id_metodo_pago, COUNT(*) as count, SUM(monto) as total FROM costanzo.logpagos WHERE estado_pago = 'exitoso' AND fecha_pago >= %s GROUP BY id_metodo_pago",
            (start_date,)
        )
        metodos_pago = []
        for row in metodos_result:
            metodo_id = row['id_metodo_pago']
            metodo_map = {1: 'Tarjeta', 4: 'Transferencia', 5: 'Efectivo', 6: 'OXXO', 7: 'SPEI'}
            metodo_name = metodo_map.get(metodo_id, f'Método {metodo_id}')
            metodos_pago.append({
                'id_metodo_pago': metodo_id,
                'nombre': metodo_name,
                'count': row['count'],
                'total': float(row['total'])
            })

        # Ventas detalladas con JOIN para obtener cantidad de productos
        ventas_detalle = db.query(
            """
            SELECT
                lp.id_pago,
                lp.id_intento_pago,
                lp.id_metodo_pago,
                lp.monto,
                lp.fecha_pago,
                lp.estado_pago,
                COALESCE(SUM(ci.cantidad), 0) as productos_cantidad
            FROM costanzo.logpagos lp
            LEFT JOIN costanzo.carritocompra c ON lp.fecha_pago >= c.fecha_creacion
                AND lp.fecha_pago <= DATE_ADD(c.fecha_creacion, INTERVAL 1 HOUR)
                AND lp.id_usuario = c.id_usuario
            LEFT JOIN costanzo.carrito_items ci ON c.id_carrito = ci.id_carrito
            WHERE lp.fecha_pago >= %s
            GROUP BY lp.id_pago, lp.id_intento_pago, lp.id_metodo_pago, lp.monto, lp.fecha_pago, lp.estado_pago
            ORDER BY lp.fecha_pago DESC
            LIMIT 50
            """,
            (start_date,)
        )

        # Ganancias por semana (últimas 4 semanas)
        ganancias_semana = []
        for i in range(4):
            week_start = now - timedelta(days=now.weekday() + (i * 7))
            week_end = week_start + timedelta(days=6)
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            week_end = week_end.replace(hour=23, minute=59, second=59, microsecond=999999)

            week_result = db.query(
                "SELECT COALESCE(SUM(monto), 0) as total FROM costanzo.logpagos WHERE estado_pago = 'exitoso' AND fecha_pago BETWEEN %s AND %s",
                (week_start, week_end)
            )
            ganancias_semana.append({
                'semana': f'Sem {4-i}',
                'total': float(week_result[0]['total']) if week_result else 0
            })

        return jsonify({
            'ventas_totales': ventas_totales,
            'pedidos_completados': pedidos_completados,
            'productos_vendidos': productos_vendidos,
            'cupones_usados': cupones_usados,
            'metodos_pago': metodos_pago,
            'ventas_detalle': ventas_detalle,
            'ganancias_semana': ganancias_semana
        })

    except Exception as e:
        print('Error generating reports:', str(e))
        return jsonify({
            'ventas_totales': 0,
            'pedidos_completados': 0,
            'productos_vendidos': 0,
            'cupones_usados': 0,
            'metodos_pago': [],
            'ventas_detalle': [],
            'ganancias_semana': []
        })
    finally:
        db.close()
 