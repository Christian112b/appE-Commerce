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
    def create_order(id_usuario, cart_items, total, direccion_envio, metodo_pago, estado='pendiente'):
        """Create a new order from cart items"""
        db = DBConnection()
        try:
            print(f"DEBUG: Creating order for user {id_usuario}, total {total}, items: {len(cart_items)}, estado: {estado}")
            # Insert order
            db.execute("""
                INSERT INTO costanzo.pedidos (id_usuario, fecha_pedido, estado, total, direccion_envio, metodo_pago)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (id_usuario, datetime.now(), estado, total, direccion_envio, metodo_pago))

            order_id = db.cursor.lastrowid
            print(f"DEBUG: Order inserted with ID {order_id}")

            # Insert order items
            for item in cart_items:
                subtotal = item['quantity'] * item['price']
                print(f"DEBUG: Inserting item {item['id']}, qty {item['quantity']}, price {item['price']}, subtotal {subtotal}")
                db.execute("""
                    INSERT INTO costanzo.pedido_detalles (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                    VALUES (%s, %s, %s, %s, %s)
                """, (order_id, item['id'], item['quantity'], item['price'], subtotal))

            db.commit()
            print(f"DEBUG: Order creation completed successfully: {order_id}")
            return order_id, f"Pedido-{order_id}"
        except Exception as e:
            db.rollback()
            print(f"DEBUG: Error creating order: {e}")
            return None, None

    @staticmethod
    def get_user_orders(user_id):
        """Get all orders for a user"""
        db = DBConnection()
        try:
            orders = db.query("""
                SELECT
                    p.id_pedido,
                    p.fecha_pedido,
                    p.estado,
                    p.total,
                    p.metodo_pago,
                    p.direccion_envio,
                    p.notas
                FROM costanzo.pedidos p
                WHERE p.id_usuario = %s
                ORDER BY p.fecha_pedido DESC
            """, (user_id,))

            # Get items for each order
            for order in orders:
                try:
                    items = db.query("""
                        SELECT
                            pd.cantidad,
                            pd.precio_unitario,
                            pd.subtotal,
                            pr.nombre,
                            pr.imagen_base64
                        FROM costanzo.pedido_detalles pd
                        JOIN costanzo.productos pr ON pd.id_producto = pr.id_producto
                        WHERE pd.id_pedido = %s
                    """, (order['id_pedido'],))
                    order['items'] = items
                except Exception as e:
                    print(f"Error getting items for order {order['id_pedido']}: {e}")
                    order['items'] = []

            return orders
        except Exception as e:
            print(f"Error getting user orders: {e}")
            return []

    @staticmethod
    def get_order_by_id(order_id):
        """Get order by ID"""
        db = DBConnection()
        order = db.query("""
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                p.total,
                p.metodo_pago,
                p.direccion_envio,
                p.id_usuario
            FROM costanzo.pedidos p
            WHERE p.id_pedido = %s
        """, (order_id,))

        if order:
            # Get items
            items = db.query("""
                SELECT
                    pd.cantidad,
                    pd.precio_unitario,
                    pd.subtotal,
                    pr.nombre,
                    pr.imagen_base64
                FROM costanzo.pedido_detalles pd
                JOIN costanzo.productos pr ON pd.id_producto = pr.id_producto
                WHERE pd.id_pedido = %s
            """, (order_id,))
            order[0]['items'] = items
            return order[0]

        return None

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