
from controllers.dbConnection import DBConnection
from flask import Blueprint, jsonify

api_bp = Blueprint('api', __name__)

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
