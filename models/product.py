from controllers.dbConnection import DBConnection

class Product:
    def __init__(self, id_producto=None, nombre=None, descripcion=None, precio_unitario=None,
                 imagen_base64=None, activo=None, categoria=None):
        self.id_producto = id_producto
        self.nombre = nombre
        self.descripcion = descripcion
        self.precio_unitario = precio_unitario
        self.imagen_base64 = imagen_base64
        self.activo = activo
        self.categoria = categoria

    @staticmethod
    def get_all_active():
        """Get all active products with inventory information"""
        db = DBConnection()
        try:
            products = db.query("""
                SELECT p.*, i.cantidad_disponible
                FROM productos p
                LEFT JOIN inventario i ON p.id_producto = i.id_producto
                WHERE p.activo = 1
                ORDER BY p.nombre
            """)
            return products
        finally:
            db.close()

    @staticmethod
    def get_by_id(product_id):
        """Get product by ID with inventory"""
        db = DBConnection()
        try:
            product = db.query("""
                SELECT p.*, i.cantidad_disponible
                FROM productos p
                LEFT JOIN inventario i ON p.id_producto = i.id_producto
                WHERE p.id_producto = %s AND p.activo = 1
            """, (product_id,))
            return product[0] if product else None
        finally:
            db.close()

    @staticmethod
    def update_stock(product_id, new_quantity):
        """Update product stock in inventory"""
        db = DBConnection()
        try:
            # Check if inventory record exists
            existing = db.query("SELECT id_inventario FROM inventario WHERE id_producto = %s", (product_id,))

            if existing:
                db.execute(
                    "UPDATE inventario SET cantidad_disponible = %s WHERE id_producto = %s",
                    (new_quantity, product_id)
                )
            else:
                db.execute(
                    "INSERT INTO inventario (id_producto, cantidad_disponible) VALUES (%s, %s)",
                    (product_id, new_quantity)
                )
            return True
        except Exception as e:
            print(f"Error updating stock: {e}")
            return False
        finally:
            db.close()

    @staticmethod
    def reduce_stock(product_id, quantity):
        """Reduce stock after purchase"""
        db = DBConnection()
        try:
            db.execute("""
                UPDATE inventario
                SET cantidad_disponible = cantidad_disponible - %s
                WHERE id_producto = %s AND cantidad_disponible >= %s
            """, (quantity, product_id, quantity))
            return db.cursor.rowcount > 0
        except Exception as e:
            print(f"Error reducing stock: {e}")
            return False
        finally:
            db.close()