import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from controllers.dbConnection import DBConnection
from datetime import datetime

class Order:
    def __init__(self, id_pedido=None, id_usuario=None, fecha_pedido=None, estado=None,
                 total=None, id_direccion=None, metodo_pago=None, numero_pedido=None):
        self.id_pedido = id_pedido
        self.id_usuario = id_usuario
        self.fecha_pedido = fecha_pedido
        self.estado = estado
        self.total = total
        self.id_direccion = id_direccion
        self.metodo_pago = metodo_pago
        self.numero_pedido = numero_pedido

    @staticmethod
    def create_order(id_usuario, cart_items, total, id_direccion, metodo_pago):
        """Create a new order from cart items"""
        db = DBConnection()
        try:
            # Generate order number
            numero_pedido = f"CC-{datetime.now().strftime('%Y%m%d%H%M%S')}"

            # Insert order
            db.execute("""
                INSERT INTO costanzo.pedidos (id_usuario, fecha_pedido, estado, total, id_direccion, metodo_pago, numero_pedido)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (id_usuario, datetime.now(), 'pendiente', total, id_direccion, metodo_pago, numero_pedido))

            order_id = db.cursor.lastrowid

            # Insert order items
            for item in cart_items:
                db.execute("""
                    INSERT INTO costanzo.pedido_items (id_pedido, id_producto, cantidad, precio_unitario)
                    VALUES (%s, %s, %s, %s)
                """, (order_id, item['id'], item['quantity'], item['price']))

            return order_id, numero_pedido
        except Exception as e:
            print(f"Error creating order: {e}")
            return None, None
        finally:
            db.close()

    @staticmethod
    def get_user_orders(user_id):
        """Get all orders for a user"""
        db = DBConnection()
        try:
            orders = db.query("""
                SELECT
                    p.id_pedido,
                    p.numero_pedido,
                    p.fecha_pedido,
                    p.estado,
                    p.total,
                    p.metodo_pago,
                    d.alias as direccion_alias,
                    d.calle,
                    d.colonia,
                    d.ciudad,
                    d.estado,
                    d.cp
                FROM costanzo.pedidos p
                LEFT JOIN costanzo.direcciones d ON p.id_direccion = d.id_direccion
                WHERE p.id_usuario = %s
                ORDER BY p.fecha_pedido DESC
            """, (user_id,))

            # Get items for each order
            for order in orders:
                items = db.query("""
                    SELECT
                        pi.cantidad,
                        pi.precio_unitario,
                        pr.nombre,
                        pr.imagen_base64
                    FROM costanzo.pedido_items pi
                    JOIN costanzo.productos pr ON pi.id_producto = pr.id_producto
                    WHERE pi.id_pedido = %s
                """, (order['id_pedido'],))
                order['items'] = items

            return orders
        finally:
            db.close()

    @staticmethod
    def get_order_by_id(order_id):
        """Get order by ID"""
        db = DBConnection()
        try:
            order = db.query("""
                SELECT
                    p.id_pedido,
                    p.numero_pedido,
                    p.fecha_pedido,
                    p.estado,
                    p.total,
                    p.metodo_pago,
                    p.id_usuario,
                    d.alias as direccion_alias,
                    d.calle,
                    d.colonia,
                    d.ciudad,
                    d.estado,
                    d.cp
                FROM costanzo.pedidos p
                LEFT JOIN costanzo.direcciones d ON p.id_direccion = d.id_direccion
                WHERE p.id_pedido = %s
            """, (order_id,))

            if order:
                # Get items
                items = db.query("""
                    SELECT
                        pi.cantidad,
                        pi.precio_unitario,
                        pr.nombre,
                        pr.imagen_base64
                    FROM costanzo.pedido_items pi
                    JOIN costanzo.productos pr ON pi.id_producto = pr.id_producto
                    WHERE pi.id_pedido = %s
                """, (order_id,))
                order[0]['items'] = items
                return order[0]

            return None
        finally:
            db.close()

    @staticmethod
    def update_order_status(order_id, new_status):
        """Update order status"""
        db = DBConnection()
        try:
            db.execute("""
                UPDATE costanzo.pedidos
                SET estado = %s
                WHERE id_pedido = %s
            """, (new_status, order_id))
            return True
        except Exception as e:
            print(f"Error updating order status: {e}")
            return False
        finally:
            db.close()