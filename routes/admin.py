from flask import Blueprint, render_template, session, redirect, url_for, jsonify, request
from controllers.dbConnection import DBConnection
from datetime import datetime
from pytz import timezone

admin_bp = Blueprint('admin', __name__)

# Initialize coupon usage tracking table
def init_coupon_usage_table():
    db = DBConnection()
    try:
        schema = """
            id_uso_cupon INT AUTO_INCREMENT PRIMARY KEY,
            id_usuario INT NOT NULL,
            id_descuento INT NOT NULL,
            fecha_uso DATETIME DEFAULT CURRENT_TIMESTAMP,
            id_pago INT,
            FOREIGN KEY (id_usuario) REFERENCES costanzo.usuarios(id_usuario),
            FOREIGN KEY (id_descuento) REFERENCES costanzo.descuentospromociones(id_descuento),
            FOREIGN KEY (id_pago) REFERENCES costanzo.logpagos(id_pago),
            UNIQUE KEY unique_coupon_usage (id_usuario, id_descuento)
        """
    except Exception as e:
        print('Error creating coupon usage table:', str(e))
    finally:
        db.close()

# Initialize table on import
init_coupon_usage_table()

@admin_bp.route('/adminPanel')
def adminPanel():
    if session.get('admin') == 1:
        return render_template('admin/dashboard.html')
    return redirect(url_for('main.index'))

@admin_bp.route('/get-discounts', methods=['GET'])
def get_coupons():
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    db = DBConnection()
    try:
        coupons = db.query("SELECT id_descuento, nombre, tipo, valor, fecha_inicio, fecha_fin, activo FROM costanzo.descuentospromociones ORDER BY id_descuento DESC")
        return jsonify(coupons)
    except Exception as e:
        print('Error fetching coupons:', str(e))
        return jsonify([])
    finally:
        db.close()

@admin_bp.route('/save-coupon', methods=['POST'])
def save_coupon():
    if session.get('admin') != 1:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    data = request.get_json()
    coupon_id = data.get('id_descuento')
    nombre = data.get('nombre', '').strip()
    tipo = data.get('tipo')
    valor = float(data.get('valor', 0))
    fecha_inicio = data.get('fecha_inicio')
    fecha_fin = data.get('fecha_fin')
    activo = data.get('activo', True)

    if not nombre or not tipo or valor <= 0:
        return jsonify({'success': False, 'message': 'Datos inválidos'}), 400

    db = DBConnection()
    try:
        mexico_tz = timezone('America/Mexico_City')

        if coupon_id:
            # Update existing coupon
            query = """
                UPDATE costanzo.descuentospromociones
                SET nombre = %s, tipo = %s, valor = %s, fecha_inicio = %s, fecha_fin = %s, activo = %s
                WHERE id_descuento = %s
            """
            params = (nombre, tipo, valor, fecha_inicio, fecha_fin, activo, coupon_id)
        else:
            # Insert new coupon
            query = """
                INSERT INTO costanzo.descuentospromociones (nombre, tipo, valor, fecha_inicio, fecha_fin, activo)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            params = (nombre, tipo, valor, fecha_inicio, fecha_fin, activo)

        db.execute(query, params)
        return jsonify({'success': True, 'message': 'Cupón guardado correctamente'})
    except Exception as e:
        print('Error saving coupon:', str(e))
        return jsonify({'success': False, 'message': 'Error al guardar el cupón'}), 500
    finally:
        db.close()

@admin_bp.route('/delete-coupon', methods=['POST'])
def delete_coupon():
    if session.get('admin') != 1:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    data = request.get_json()
    coupon_id = data.get('id_descuento')

    if not coupon_id:
        return jsonify({'success': False, 'message': 'ID de cupón requerido'}), 400

    db = DBConnection()
    try:
        # Instead of deleting, set activo to 0 (soft delete)
        db.execute("UPDATE costanzo.descuentospromociones SET activo = 0 WHERE id_descuento = %s", (coupon_id,))
        return jsonify({'success': True, 'message': 'Cupón desactivado correctamente'})
    except Exception as e:
        print('Error deactivating coupon:', str(e))
        return jsonify({'success': False, 'message': 'Error al desactivar el cupón'}), 500
    finally:
        db.close()

@admin_bp.route('/get-pagos', methods=['GET'])
def get_pagos():
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    db = DBConnection()
    try:
        pagos = db.query("SELECT id_pago, id_intento_pago, id_metodo_pago, monto, fecha_pago, estado_pago FROM costanzo.logpagos ORDER BY fecha_pago DESC")
        return jsonify(pagos)
    except Exception as e:
        print('Error fetching pagos:', str(e))
        return jsonify([])
    finally:
        db.close()

@admin_bp.route('/get-inventario', methods=['GET'])
def get_inventario():
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    db = DBConnection()
    try:
        inventario = db.query("""
            SELECT i.id_inventario, i.id_producto, i.cantidad_actual, i.cantidad_minima, i.ubicacion, i.fecha_actualizacion,
                   p.nombre as nombre_producto
            FROM costanzo.inventario i
            JOIN costanzo.productos p ON i.id_producto = p.id_producto
            ORDER BY i.fecha_actualizacion DESC
        """)
        return jsonify(inventario)
    except Exception as e:
        print('Error fetching inventario:', str(e))
        return jsonify([])
    finally:
        db.close()

@admin_bp.route('/get-productos-simple', methods=['GET'])
def get_productos_simple():
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    db = DBConnection()
    try:
        productos = db.query("SELECT id_producto, nombre FROM costanzo.productos WHERE activo = 1 ORDER BY nombre")
        return jsonify(productos)
    except Exception as e:
        print('Error fetching productos:', str(e))
        return jsonify([])
    finally:
        db.close()

@admin_bp.route('/save-inventario', methods=['POST'])
def save_inventario():
    if session.get('admin') != 1:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    data = request.get_json()
    inventario_id = data.get('id_inventario')
    id_producto = data.get('id_producto')
    cantidad_actual = int(data.get('cantidad_actual', 0))
    cantidad_minima = int(data.get('cantidad_minima', 0))
    ubicacion = data.get('ubicacion', '').strip()

    if not id_producto or cantidad_actual < 0 or cantidad_minima < 0:
        return jsonify({'success': False, 'message': 'Datos inválidos'}), 400

    db = DBConnection()
    try:
        if inventario_id:
            # Update existing inventario
            query = """
                UPDATE costanzo.inventario
                SET cantidad_actual = %s, cantidad_minima = %s, ubicacion = %s, fecha_actualizacion = %s
                WHERE id_inventario = %s
            """
            params = (cantidad_actual, cantidad_minima, ubicacion, datetime.now(), inventario_id)
        else:
            # Insert new inventario
            query = """
                INSERT INTO costanzo.inventario (id_producto, cantidad_actual, cantidad_minima, ubicacion, fecha_actualizacion)
                VALUES (%s, %s, %s, %s, %s)
            """
            params = (id_producto, cantidad_actual, cantidad_minima, ubicacion, datetime.now())

        db.execute(query, params)
        return jsonify({'success': True, 'message': 'Registro de inventario guardado correctamente'})
    except Exception as e:
        print('Error saving inventario:', str(e))
        return jsonify({'success': False, 'message': 'Error al guardar el registro de inventario'}), 500
    finally:
        db.close()

@admin_bp.route('/delete-inventario', methods=['POST'])
def delete_inventario():
    if session.get('admin') != 1:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    data = request.get_json()
    inventario_id = data.get('id_inventario')

    if not inventario_id:
        return jsonify({'success': False, 'message': 'ID de inventario requerido'}), 400

    db = DBConnection()
    try:
        db.execute("DELETE FROM costanzo.inventario WHERE id_inventario = %s", (inventario_id,))
        return jsonify({'success': True, 'message': 'Registro de inventario eliminado correctamente'})
    except Exception as e:
        print('Error deleting inventario:', str(e))
        return jsonify({'success': False, 'message': 'Error al eliminar el registro de inventario'}), 500
    finally:
        db.close()

@admin_bp.route('/get-usuarios', methods=['GET'])
def get_usuarios():
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    db = DBConnection()
    try:
        usuarios = db.query("SELECT id_usuario, nombre, apellido, correo, tipo_usuario, telefono, fecha_registro FROM costanzo.usuarios ORDER BY fecha_registro DESC")
        return jsonify(usuarios)
    except Exception as e:
        print('Error fetching usuarios:', str(e))
        return jsonify([])
    finally:
        db.close()

@admin_bp.route('/save-usuario', methods=['POST'])
def save_usuario():
    if session.get('admin') != 1:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    data = request.get_json()
    usuario_id = data.get('id_usuario')
    nombre = data.get('nombre', '').strip()
    apellido = data.get('apellido', '').strip()
    correo = data.get('correo', '').strip()
    telefono = data.get('telefono', '').strip()
    tipo_usuario = int(data.get('tipo_usuario', 0))
    password = data.get('password')

    if not nombre or not apellido or not correo:
        return jsonify({'success': False, 'message': 'Nombre, apellido y correo son requeridos'}), 400

    # Validate email format
    import re
    if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', correo):
        return jsonify({'success': False, 'message': 'Formato de correo inválido'}), 400

    db = DBConnection()
    try:
        if usuario_id:
            # Update existing user
            query = """
                UPDATE costanzo.usuarios
                SET nombre = %s, apellido = %s, correo = %s, telefono = %s, tipo_usuario = %s
                WHERE id_usuario = %s
            """
            params = (nombre, apellido, correo, telefono, tipo_usuario, usuario_id)
        else:
            # Insert new user - password required for new users
            if not password or len(password) < 6:
                return jsonify({'success': False, 'message': 'Contraseña requerida (mínimo 6 caracteres)'}), 400

            # Hash password
            from werkzeug.security import generate_password_hash
            password_hash = generate_password_hash(password)

            query = """
                INSERT INTO costanzo.usuarios (nombre, apellido, correo, contraseña_hash, tipo_usuario, telefono, fecha_registro)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            params = (nombre, apellido, correo, password_hash, tipo_usuario, telefono, datetime.now())

        db.execute(query, params)
        return jsonify({'success': True, 'message': 'Usuario guardado correctamente'})
    except Exception as e:
        print('Error saving usuario:', str(e))
        if 'correo' in str(e).lower():
            return jsonify({'success': False, 'message': 'El correo ya está registrado'}), 400
        return jsonify({'success': False, 'message': 'Error al guardar el usuario'}), 500
    finally:
        db.close()

@admin_bp.route('/delete-usuario', methods=['POST'])
def delete_usuario():
    if session.get('admin') != 1:
        return jsonify({'success': False, 'message': 'No autorizado'}), 403

    data = request.get_json()
    usuario_id = data.get('id_usuario')

    if not usuario_id:
        return jsonify({'success': False, 'message': 'ID de usuario requerido'}), 400

    # Prevent deleting self
    if usuario_id == session.get('id_user'):
        return jsonify({'success': False, 'message': 'No puedes eliminar tu propia cuenta'}), 400

    db = DBConnection()
    try:
        db.execute("DELETE FROM costanzo.usuarios WHERE id_usuario = %s", (usuario_id,))
        return jsonify({'success': True, 'message': 'Usuario eliminado correctamente'})
    except Exception as e:
        print('Error deleting usuario:', str(e))
        return jsonify({'success': False, 'message': 'Error al eliminar el usuario'}), 500
    finally:
        db.close()

# ========================
# Coupon Usage Tracking
# ========================

@admin_bp.route('/check-coupon-usage', methods=['POST'])
def check_coupon_usage():
    """Check if a user has already used a specific coupon"""
    data = request.get_json()
    user_id = data.get('user_id')
    coupon_id = data.get('coupon_id')

    if not user_id or not coupon_id:
        return jsonify({'success': False, 'message': 'ID de usuario y cupón requeridos'}), 400

    db = DBConnection()
    try:
        # Check if user has used this coupon
        usage = db.query("""
            SELECT id_uso_cupon, fecha_uso
            FROM costanzo.cupon_uso
            WHERE id_usuario = %s AND id_descuento = %s
        """, (user_id, coupon_id))

        if usage:
            return jsonify({
                'success': True,
                'used': True,
                'usage_date': usage[0]['fecha_uso'].isoformat() if usage[0]['fecha_uso'] else None
            })
        else:
            return jsonify({
                'success': True,
                'used': False
            })

    except Exception as e:
        print('Error checking coupon usage:', str(e))
        return jsonify({'success': False, 'message': 'Error al verificar uso del cupón'}), 500
    finally:
        db.close()

@admin_bp.route('/record-coupon-usage', methods=['POST'])
def record_coupon_usage():
    """Record that a user has used a coupon"""
    data = request.get_json()
    user_id = data.get('user_id')
    coupon_id = data.get('coupon_id')
    payment_id = data.get('payment_id')

    if not user_id or not coupon_id:
        return jsonify({'success': False, 'message': 'ID de usuario y cupón requeridos'}), 400

    db = DBConnection()
    try:
        # Insert coupon usage record
        db.execute("""
            INSERT INTO costanzo.cupon_uso (id_usuario, id_descuento, id_pago, fecha_uso)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                fecha_uso = VALUES(fecha_uso),
                id_pago = VALUES(id_pago)
        """, (user_id, coupon_id, payment_id, datetime.now()))

        return jsonify({'success': True, 'message': 'Uso del cupón registrado correctamente'})

    except Exception as e:
        print('Error recording coupon usage:', str(e))
        return jsonify({'success': False, 'message': 'Error al registrar uso del cupón'}), 500
    finally:
        db.close()

@admin_bp.route('/get-coupon-usage', methods=['GET'])
def get_coupon_usage():
    """Get coupon usage statistics for admin"""
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    db = DBConnection()
    try:
        # Get all coupon usage records with user and coupon details
        usage_records = db.query("""
            SELECT
                cu.id_uso_cupon,
                cu.fecha_uso,
                u.nombre,
                u.apellido,
                u.correo,
                dp.nombre as nombre_cupon,
                dp.tipo,
                dp.valor,
                lp.monto as monto_pago,
                lp.estado_pago
            FROM costanzo.cupon_uso cu
            JOIN costanzo.usuarios u ON cu.id_usuario = u.id_usuario
            JOIN costanzo.descuentospromociones dp ON cu.id_descuento = dp.id_descuento
            LEFT JOIN costanzo.logpagos lp ON cu.id_pago = lp.id_pago
            ORDER BY cu.fecha_uso DESC
        """)

        return jsonify(usage_records)

    except Exception as e:
        print('Error fetching coupon usage:', str(e))
        return jsonify([]), 500
    finally:
        db.close()

@admin_bp.route('/get-ventas', methods=['GET'])
def get_ventas():
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    # Get filter parameters
    estado = request.args.get('estado', '')
    metodo = request.args.get('metodo', '')
    fecha_inicio = request.args.get('fecha_inicio', '')
    fecha_fin = request.args.get('fecha_fin', '')

    db = DBConnection()
    try:
        # Build query with filters - using available tables
        query = """
            SELECT
                lp.id_pago,
                lp.id_intento_pago,
                lp.id_metodo_pago,
                lp.monto,
                lp.fecha_pago,
                lp.estado_pago,
                vp.total_vendido as productos_cantidad
            FROM costanzo.logpagos lp
            LEFT JOIN costanzo.ventas_productos vp ON lp.id_pago = vp.id_venta_producto
            WHERE 1=1
        """

        params = []

        if estado:
            query += " AND lp.estado_pago = %s"
            params.append(estado)

        if metodo:
            query += " AND lp.id_metodo_pago = %s"
            params.append(metodo)

        if fecha_inicio:
            query += " AND DATE(lp.fecha_pago) >= %s"
            params.append(fecha_inicio)

        if fecha_fin:
            query += " AND DATE(lp.fecha_pago) <= %s"
            params.append(fecha_fin)

        query += " ORDER BY lp.fecha_pago DESC"

        ventas = db.query(query, params)

        # Calculate summary statistics
        total_ventas = sum(float(v['monto']) for v in ventas if v['estado_pago'] == 'exitoso')
        total_pedidos = len(ventas)
        pedidos_exitosos = len([v for v in ventas if v['estado_pago'] == 'exitoso'])
        pedidos_pendientes = len([v for v in ventas if v['estado_pago'] == 'pendiente'])

        return jsonify({
            'ventas': ventas,
            'summary': {
                'total_ventas': total_ventas,
                'total_pedidos': total_pedidos,
                'pedidos_exitosos': pedidos_exitosos,
                'pedidos_pendientes': pedidos_pendientes
            }
        })

    except Exception as e:
        print('Error fetching ventas:', str(e))
        return jsonify({'error': 'Error al obtener ventas'}), 500
    finally:
        db.close()

@admin_bp.route('/get-venta-detalles/<int:venta_id>', methods=['GET'])
def get_venta_detalles(venta_id):
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    db = DBConnection()
    try:
        # Get sale details - using available tables
        venta_query = """
            SELECT
                lp.*,
                vp.total_vendido as productos_cantidad,
                p.nombre as producto_nombre
            FROM costanzo.logpagos lp
            LEFT JOIN costanzo.ventas_productos vp ON lp.id_pago = vp.id_venta_producto
            LEFT JOIN costanzo.productos p ON vp.id_producto = p.id_producto
            WHERE lp.id_pago = %s
        """
        venta_data = db.query(venta_query, (venta_id,))

        if not venta_data:
            return jsonify({'error': 'Venta no encontrada'}), 404

        # Structure the response
        venta = {
            'id_pago': venta_data[0]['id_pago'],
            'id_intento_pago': venta_data[0]['id_intento_pago'],
            'id_metodo_pago': venta_data[0]['id_metodo_pago'],
            'monto': venta_data[0]['monto'],
            'fecha_pago': venta_data[0]['fecha_pago'],
            'estado_pago': venta_data[0]['estado_pago'],
            'nombre': venta_data[0]['nombre'] or 'Cliente',
            'apellido': venta_data[0]['apellido'] or 'Anónimo',
            'correo': venta_data[0]['correo'] or 'N/A',
            'telefono': venta_data[0]['telefono'] or 'N/A'
        }

        # Get products - simplified
        productos = []
        for item in venta_data:
            if item['producto_nombre']:
                productos.append({
                    'producto_nombre': item['producto_nombre'],
                    'cantidad': item['productos_cantidad'] or 1,
                    'precio_unitario': float(item['monto']) / (item['productos_cantidad'] or 1),
                    'subtotal': float(item['monto'])
                })

        return jsonify({
            'venta': venta,
            'productos': productos
        })

    except Exception as e:
        print('Error fetching venta details:', str(e))
        return jsonify({'error': 'Error al obtener detalles de venta'}), 500
    finally:
        db.close()

@admin_bp.route('/get-dashboard-data', methods=['GET'])
def get_dashboard_data():
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    db = DBConnection()
    try:
        # Get today's sales
        from datetime import datetime, timedelta
        mexico_tz = timezone('America/Mexico_City')
        today = datetime.now(mexico_tz)
        today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today.replace(hour=23, minute=59, second=59, microsecond=999999)

        ventas_hoy_query = """
            SELECT SUM(monto) as ventas_hoy
            FROM costanzo.logpagos
            WHERE fecha_pago BETWEEN %s AND %s AND estado_pago = 'exitoso'
        """
        ventas_hoy_data = db.query(ventas_hoy_query, (today_start, today_end))
        ventas_hoy = float(ventas_hoy_data[0]['ventas_hoy'] or 0) if ventas_hoy_data else 0

        # Get today's orders
        pedidos_hoy_query = """
            SELECT COUNT(*) as pedidos_hoy
            FROM costanzo.logpagos
            WHERE fecha_pago BETWEEN %s AND %s
        """
        pedidos_hoy_data = db.query(pedidos_hoy_query, (today_start, today_end))
        pedidos_hoy = int(pedidos_hoy_data[0]['pedidos_hoy'] or 0) if pedidos_hoy_data else 0

        # Get total products
        productos_total_query = "SELECT COUNT(*) as total_productos FROM costanzo.productos WHERE activo = 1"
        productos_data = db.query(productos_total_query)
        total_productos = int(productos_data[0]['total_productos'] or 0) if productos_data else 0

        # Get total users
        usuarios_total_query = "SELECT COUNT(*) as total_usuarios FROM costanzo.usuarios"
        usuarios_data = db.query(usuarios_total_query)
        total_usuarios = int(usuarios_data[0]['total_usuarios'] or 0) if usuarios_data else 0

        # Get recent orders (last 10)
        pedidos_recientes_query = """
            SELECT
                lp.id_pago,
                u.nombre,
                u.apellido,
                lp.monto,
                lp.estado_pago,
                lp.fecha_pago,
                COUNT(ci.id_item) as productos
            FROM costanzo.logpagos lp
            LEFT JOIN costanzo.usuarios u ON lp.id_usuario = u.id_usuario
            LEFT JOIN costanzo.carritocompra cc ON lp.id_intento_pago IS NOT NULL
            LEFT JOIN costanzo.carrito_items ci ON cc.id_carrito = ci.id_carrito
            GROUP BY lp.id_pago, u.nombre, u.apellido, lp.monto, lp.estado_pago, lp.fecha_pago
            ORDER BY lp.fecha_pago DESC
            LIMIT 10
        """
        pedidos_recientes = db.query(pedidos_recientes_query)

        return jsonify({
            'ventas_hoy': ventas_hoy,
            'pedidos_hoy': pedidos_hoy,
            'total_productos': total_productos,
            'total_usuarios': total_usuarios,
            'pedidos_recientes': pedidos_recientes
        })

    except Exception as e:
        print('Error getting dashboard data:', str(e))
        return jsonify({'error': 'Error al obtener datos del dashboard'}), 500
    finally:
        db.close()

@admin_bp.route('/get-reportes', methods=['GET'])
def get_reportes():
    if session.get('admin') != 1:
        return jsonify({'error': 'No autorizado'}), 403

    periodo = request.args.get('periodo', 'mes')

    periodo = request.args.get('periodo', 'mes')

    # Calculate date range based on periodo
    from datetime import datetime, timedelta
    mexico_tz = timezone('America/Mexico_City')
    now = datetime.now(mexico_tz)

    if periodo == 'hoy':
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif periodo == 'semana':
        start_date = now - timedelta(days=now.weekday())
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59, microseconds=999999)
    elif periodo == 'mes':
        start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = now.replace(day=28) + timedelta(days=4)
        end_date = (next_month - timedelta(days=next_month.day)).replace(hour=23, minute=59, second=59, microsecond=999999)
    elif periodo == 'anio':
        start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = now.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
    else:
        return jsonify({'error': 'Período inválido'}), 400

    db = DBConnection()
    try:
        # Get sales summary
        ventas_query = """
            SELECT
                SUM(monto) as total_ventas,
                COUNT(*) as total_pedidos,
                SUM(CASE WHEN estado_pago = 'exitoso' THEN 1 ELSE 0 END) as pedidos_completados
            FROM costanzo.logpagos
            WHERE fecha_pago BETWEEN %s AND %s
        """
        ventas_data = db.query(ventas_query, (start_date, end_date))
        ventas_summary = ventas_data[0] if ventas_data else {'total_ventas': 0, 'total_pedidos': 0, 'pedidos_completados': 0}

        # Get payment methods distribution
        metodos_query = """
            SELECT id_metodo_pago, COUNT(*) as cantidad, SUM(monto) as total
            FROM costanzo.logpagos
            WHERE fecha_pago BETWEEN %s AND %s
            GROUP BY id_metodo_pago
        """
        metodos_data = db.query(metodos_query, (start_date, end_date))

        # Get detailed sales report
        ventas_detalle_query = """
            SELECT
                lp.fecha_pago,
                lp.id_pago,
                lp.id_metodo_pago,
                lp.monto,
                lp.estado_pago,
                COUNT(ci.id_item) as productos_cantidad
            FROM costanzo.logpagos lp
            LEFT JOIN costanzo.carritocompra cc ON lp.id_intento_pago IS NOT NULL
            LEFT JOIN costanzo.carrito_items ci ON cc.id_carrito = ci.id_carrito
            WHERE lp.fecha_pago BETWEEN %s AND %s
            GROUP BY lp.id_pago, lp.fecha_pago, lp.id_metodo_pago, lp.monto, lp.estado_pago
            ORDER BY lp.fecha_pago DESC
        """
        ventas_detalle = db.query(ventas_detalle_query, (start_date, end_date))

        # Get order status distribution
        estado_pedidos_query = """
            SELECT estado_pago, COUNT(*) as cantidad
            FROM costanzo.logpagos
            WHERE fecha_pago BETWEEN %s AND %s
            GROUP BY estado_pago
        """
        estado_pedidos_data = db.query(estado_pedidos_query, (start_date, end_date))

        # Get products sold (simplified - would need more complex query for actual product sales)
        productos_vendidos = sum(item['productos_cantidad'] or 0 for item in ventas_detalle)

        # Get daily sales data for trend chart
        ganancias_dia_query = """
            SELECT
                DATE(fecha_pago) as dia,
                SUM(monto) as total
            FROM costanzo.logpagos
            WHERE fecha_pago BETWEEN %s AND %s AND estado_pago = 'exitoso'
            GROUP BY DATE(fecha_pago)
            ORDER BY dia
        """
        ganancias_dia = db.query(ganancias_dia_query, (start_date, end_date))

        # Get top products sold in the period from ventas_productos table
        top_productos_query = """
            SELECT
                p.nombre,
                vp.total_vendido as cantidad_vendida,
                (vp.total_vendido * p.precio_unitario) as total_ventas
            FROM costanzo.ventas_productos vp
            JOIN costanzo.productos p ON vp.id_producto = p.id_producto
            WHERE vp.fecha_ultima_venta BETWEEN %s AND %s
            ORDER BY vp.total_vendido DESC
            LIMIT 5
        """
        top_productos = db.query(top_productos_query, (start_date, end_date))

        return jsonify({
            'ventas_totales': float(ventas_summary['total_ventas'] or 0),
            'pedidos_completados': int(ventas_summary['pedidos_completados'] or 0),
            'productos_vendidos': productos_vendidos,
            'estado_pedidos': estado_pedidos_data,
            'metodos_pago': metodos_data,
            'ventas_detalle': ventas_detalle,
            'ganancias_dia': ganancias_dia,
            'top_productos': top_productos
        })

    except Exception as e:
        print('Error generating reportes:', str(e))
        return jsonify({'error': 'Error al generar reportes'}), 500
    finally:
        db.close()
