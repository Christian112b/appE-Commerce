from controllers.dbConnection import DBConnection
from datetime import datetime
from pytz import timezone

class Cart:
    def __init__(self, id_carrito=None, id_usuario=None, fecha_creacion=None):
        self.id_carrito = id_carrito
        self.id_usuario = id_usuario
        self.fecha_creacion = fecha_creacion

    @staticmethod
    def get_or_create_cart(user_id):
        """Get existing cart or create new one for user"""
        db = DBConnection()
        try:
            # Check if user has an active cart
            cart = db.query("SELECT id_carrito FROM carritocompra WHERE id_usuario = %s", (user_id,))

            if cart:
                return cart[0]['id_carrito']
            else:
                # Create new cart
                db.execute(
                    "INSERT INTO carritocompra (id_usuario, fecha_creacion) VALUES (%s, %s)",
                    (user_id, datetime.now())
                )
                return db.cursor.lastrowid
        finally:
            db.close()

    @staticmethod
    def get_cart_items(cart_id):
        """Get all items in a cart with product details"""
        db = DBConnection()
        try:
            items = db.query("""
                SELECT
                    ci.id_item,
                    ci.id_producto,
                    ci.cantidad,
                    ci.precio_unitario,
                    p.nombre,
                    p.imagen_base64
                FROM carrito_items ci
                JOIN productos p ON ci.id_producto = p.id_producto
                WHERE ci.id_carrito = %s
                ORDER BY ci.id_item
            """, (cart_id,))
            return items
        finally:
            db.close()

    @staticmethod
    def add_item(cart_id, product_id, quantity=1):
        """Add item to cart or update quantity if exists"""
        db = DBConnection()
        try:
            # Get product price
            product = db.query("SELECT precio_unitario FROM productos WHERE id_producto = %s", (product_id,))
            if not product:
                return False

            price = product[0]['precio_unitario']

            # Check if item already exists in cart
            existing = db.query(
                "SELECT id_item, cantidad FROM carrito_items WHERE id_carrito = %s AND id_producto = %s",
                (cart_id, product_id)
            )

            if existing:
                # Update quantity
                new_quantity = existing[0]['cantidad'] + quantity
                db.execute(
                    "UPDATE carrito_items SET cantidad = %s WHERE id_item = %s",
                    (new_quantity, existing[0]['id_item'])
                )
            else:
                # Insert new item
                db.execute(
                    "INSERT INTO carrito_items (id_carrito, id_producto, cantidad, precio_unitario) VALUES (%s, %s, %s, %s)",
                    (cart_id, product_id, quantity, price)
                )
            return True
        except Exception as e:
            return False
        finally:
            db.close()

    @staticmethod
    def update_item_quantity(cart_id, product_id, new_quantity):
        """Update quantity of an item in cart"""
        db = DBConnection()
        try:
            if new_quantity <= 0:
                # Remove item if quantity is 0 or less
                db.execute(
                    "DELETE FROM carrito_items WHERE id_carrito = %s AND id_producto = %s",
                    (cart_id, product_id)
                )
            else:
                # Update quantity
                db.execute(
                    "UPDATE carrito_items SET cantidad = %s WHERE id_carrito = %s AND id_producto = %s",
                    (new_quantity, cart_id, product_id)
                )
            return True
        except Exception as e:
            return False
        finally:
            db.close()

    @staticmethod
    def remove_item(cart_id, product_id):
        """Remove item from cart"""
        db = DBConnection()
        try:
            db.execute(
                "DELETE FROM carrito_items WHERE id_carrito = %s AND id_producto = %s",
                (cart_id, product_id)
            )
            return True
        except Exception as e:
            return False
        finally:
            db.close()

    @staticmethod
    def clear_cart(cart_id):
        """Remove all items from cart"""
        db = DBConnection()
        try:
            db.execute("DELETE FROM carrito_items WHERE id_carrito = %s", (cart_id,))
            return True
        except Exception as e:
            return False
        finally:
            db.close()

    @staticmethod
    def save_cart_from_frontend(user_id, items):
        """Save cart items from frontend localStorage"""
        db = DBConnection()
        try:
            # Get or create cart
            cart_id = Cart.get_or_create_cart(user_id)

            # Clear existing items
            db.execute("DELETE FROM carrito_items WHERE id_carrito = %s", (cart_id,))

            # Insert new items
            for item in items:
                db.execute("""
                    INSERT INTO carrito_items (id_carrito, id_producto, cantidad, precio_unitario)
                    VALUES (%s, %s, %s, %s)
                """, (cart_id, item['id'], item['quantity'], item['price']))

            return True
        except Exception as e:
            return False
        finally:
            db.close()

    @staticmethod
    def get_cart_total(cart_id):
        """Calculate total value of cart"""
        db = DBConnection()
        try:
            result = db.query("""
                SELECT SUM(ci.cantidad * ci.precio_unitario) as total
                FROM carrito_items ci
                WHERE ci.id_carrito = %s
            """, (cart_id,))

            return result[0]['total'] if result and result[0]['total'] else 0
        finally:
            db.close()