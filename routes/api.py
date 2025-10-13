
from controllers.dbConnection import DBConnection
from flask import Blueprint, jsonify, request

api_bp = Blueprint('api', __name__)

#Obtener productos de DB
@api_bp.route('/getProducts', methods=['GET'])
def getProducts():

    try:
        db = DBConnection()

        productos = db.query("""
            SELECT id_producto, nombre, descripcion, categoria, precio_unitario, stock, activo, imagen_base64
            FROM costanzo.productos
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
        stock = int(data.get('stock', 0))
        activo = int(data.get('activo', 1))
        imagen_base64 = data.get('imagen_base64')  # puede ser None

        db = DBConnection()

        if imagen_base64:
            query = """
                UPDATE costanzo.productos
                SET nombre = %s,
                    descripcion = %s,
                    categoria = %s,
                    precio_unitario = %s,
                    stock = %s,
                    activo = %s,
                    imagen_base64 = %s
                WHERE id_producto = %s
            """
            params = [nombre, descripcion, categoria, precio_unitario, stock, activo, imagen_base64, id_producto]
        else:
            query = """
                UPDATE costanzo.productos
                SET nombre = %s,
                    descripcion = %s,
                    categoria = %s,
                    precio_unitario = %s,
                    stock = %s,
                    activo = %s
                WHERE id_producto = %s
            """
            params = [nombre, descripcion, categoria, precio_unitario, stock, activo, id_producto]

        db.execute(query, params)
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
        stock = int(data.get('stock', 0))
        activo = int(data.get('activo', 1))
        imagen_base64 = data.get('imagen_base64')  # puede ser None

        db = DBConnection()

        query = """
            INSERT INTO costanzo.productos
            (nombre, descripcion, categoria, precio_unitario, stock, activo, imagen_base64)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params = [nombre, descripcion, categoria, precio_unitario, stock, activo, imagen_base64]

        db.execute(query, params)
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
