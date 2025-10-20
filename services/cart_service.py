"""
Cart Service Module

Este módulo contiene la lógica de negocio para operaciones del carrito de compras.
Proporciona una interfaz limpia para manejar todas las operaciones relacionadas
con el carrito de compras, separando la lógica de negocio de los controladores HTTP.

Uso típico:
    from services.cart_service import CartService

    # Agregar producto al carrito
    success, message = CartService.add_to_cart(user_id, product_id)

    # Obtener items del carrito
    success, items = CartService.get_cart_items(user_id)

Funcionalidades:
- ✅ Agregar productos al carrito
- ✅ Obtener items del carrito formateados
- ✅ Actualizar cantidades
- ✅ Remover productos
- ✅ Guardar estado del carrito
- ✅ Limpiar carrito después de compra

Dependencias:
- models.cart.Cart: Modelo de datos del carrito
- models.product.Product: Modelo de productos
"""

import stripe
from controllers.dbConnection import DBConnection
from models.cart import Cart
from models.product import Product
from datetime import datetime
from pytz import timezone


class CartService:
    """
    Servicio de Carrito de Compras

    Maneja toda la lógica de negocio relacionada con el carrito de compras,
    proporcionando una interfaz consistente y reutilizable.
    """

    def __init__(self):
        """Inicializar el servicio de carrito"""
        pass

    @staticmethod
    def add_to_cart(user_id: int, product_id: int) -> tuple[bool, str]:
        """
        Agregar un producto al carrito del usuario

        Args:
            user_id (int): ID del usuario
            product_id (int): ID del producto a agregar

        Returns:
            tuple[bool, str]: (éxito, mensaje)

        Raises:
            Exception: Si ocurre un error interno

        Example:
            >>> success, message = CartService.add_to_cart(1, 123)
            >>> print(message)
            'Producto agregado al carrito'
        """
        try:
            # Obtener o crear carrito para el usuario
            cart_id = Cart.get_or_create_cart(user_id)

            # Agregar item al carrito
            success = Cart.add_item(cart_id, product_id)

            # Retornar resultado con mensaje apropiado
            message = "Producto agregado al carrito" if success else "Error al agregar producto"
            return success, message

        except Exception as e:
            print(f"Error in add_to_cart service: {e}")
            return False, "Error interno del servidor"

    @staticmethod
    def get_cart_items(user_id: int) -> tuple[bool, list]:
        """
        Obtener los items del carrito formateados para el frontend

        Args:
            user_id (int): ID del usuario

        Returns:
            tuple[bool, list]: (éxito, lista_de_items)

        Example:
            >>> success, items = CartService.get_cart_items(1)
            >>> print(items[0]['name'])
            'Chocolate Amargo'
        """
        try:
            # Obtener carrito del usuario
            cart_id = Cart.get_or_create_cart(user_id)
            raw_items = Cart.get_cart_items(cart_id)

            # Formatear items para el frontend
            items = []
            for item in raw_items:
                # Convertir imagen base64 a formato data URL
                imagen_base64 = item['imagen_base64']
                imagen_final = f"data:image/png;base64,{imagen_base64}" if imagen_base64 else None

                # Crear objeto de item formateado
                items.append({
                    'id': item['id_producto'],
                    'name': item['nombre'],
                    'image': imagen_final,
                    'price': item['precio_unitario'],
                    'quantity': item['cantidad']
                })

            return True, items

        except Exception as e:
            print(f"Error in get_cart_items service: {e}")
            return False, []

    @staticmethod
    def get_cart_items(user_id):
        """Get formatted cart items for user"""
        try:
            cart_id = Cart.get_or_create_cart(user_id)
            raw_items = Cart.get_cart_items(cart_id)

            # Format items for frontend
            items = []
            for item in raw_items:
                imagen_base64 = item['imagen_base64']
                imagen_final = f"data:image/png;base64,{imagen_base64}" if imagen_base64 else None

                items.append({
                    'id': item['id_producto'],
                    'name': item['nombre'],
                    'image': imagen_final,
                    'price': item['precio_unitario'],
                    'quantity': item['cantidad']
                })

            return True, items
        except Exception as e:
            print(f"Error in get_cart_items service: {e}")
            return False, []

    @staticmethod
    def update_cart_quantity(user_id: int, product_id: int, quantity: int) -> tuple[bool, str]:
        """
        Actualizar la cantidad de un producto en el carrito

        Args:
            user_id (int): ID del usuario
            product_id (int): ID del producto
            quantity (int): Nueva cantidad (debe ser >= 0)

        Returns:
            tuple[bool, str]: (éxito, mensaje)

        Example:
            >>> success, message = CartService.update_cart_quantity(1, 123, 5)
            >>> print(message)
            'Cantidad actualizada'
        """
        try:
            # Validar cantidad
            if quantity < 0:
                return False, "La cantidad no puede ser negativa"

            cart_id = Cart.get_or_create_cart(user_id)
            success = Cart.update_item_quantity(cart_id, product_id, quantity)
            return success, "Cantidad actualizada" if success else "Error al actualizar cantidad"
        except Exception as e:
            print(f"Error in update_cart_quantity service: {e}")
            return False, "Error interno del servidor"

    @staticmethod
    def remove_from_cart(user_id: int, product_id: int) -> tuple[bool, str]:
        """
        Remover un producto del carrito

        Args:
            user_id (int): ID del usuario
            product_id (int): ID del producto a remover

        Returns:
            tuple[bool, str]: (éxito, mensaje)

        Example:
            >>> success, message = CartService.remove_from_cart(1, 123)
            >>> print(message)
            'Producto removido del carrito'
        """
        try:
            cart_id = Cart.get_or_create_cart(user_id)
            success = Cart.remove_item(cart_id, product_id)
            return success, "Producto removido del carrito" if success else "Error al remover producto"
        except Exception as e:
            print(f"Error in remove_from_cart service: {e}")
            return False, "Error interno del servidor"

    @staticmethod
    def save_cart(user_id: int, items: list) -> tuple[bool, str]:
        """
        Guardar el estado del carrito desde el frontend

        Args:
            user_id (int): ID del usuario
            items (list): Lista de items del carrito desde el frontend

        Returns:
            tuple[bool, str]: (éxito, mensaje)

        Example:
            >>> items = [{'id': 123, 'quantity': 2, 'price': 15.50}]
            >>> success, message = CartService.save_cart(1, items)
        """
        try:
            success = Cart.save_cart_from_frontend(user_id, items)
            return success, "Carrito guardado" if success else "Error al guardar carrito"
        except Exception as e:
            print(f"Error in save_cart service: {e}")
            return False, "Error interno del servidor"

    @staticmethod
    def clear_cart_after_purchase(user_id: int) -> bool:
        """
        Limpiar el carrito después de una compra exitosa

        Args:
            user_id (int): ID del usuario

        Returns:
            bool: True si se limpió exitosamente

        Example:
            >>> success = CartService.clear_cart_after_purchase(1)
            >>> print("Carrito limpiado" if success else "Error al limpiar")
        """
        try:
            cart_id = Cart.get_or_create_cart(user_id)
            success = Cart.clear_cart(cart_id)
            return success
        except Exception as e:
            print(f"Error in clear_cart_after_purchase service: {e}")
            return False

    @staticmethod
    def get_cart_total(user_id: int) -> tuple[bool, dict]:
        """
        Calcular el total del carrito incluyendo subtotal, IVA y envío

        Args:
            user_id (int): ID del usuario

        Returns:
            tuple[bool, dict]: (éxito, {'subtotal': float, 'iva': float, 'envio': float, 'total': float})

        Example:
            >>> success, totals = CartService.get_cart_total(1)
            >>> print(f"Total: ${totals['total']:.2f}")
        """
        try:
            success, items = CartService.get_cart_items(user_id)
            if not success:
                return False, {}

            # Calcular subtotal
            subtotal = sum(item['price'] * item['quantity'] for item in items)
            iva = subtotal * 0.16  # IVA 16%
            envio = 50.00  # Costo fijo de envío
            total = subtotal + iva + envio

            return True, {
                'subtotal': round(subtotal, 2),
                'iva': round(iva, 2),
                'envio': envio,
                'total': round(total, 2)
            }

        except Exception as e:
            print(f"Error in get_cart_total service: {e}")
            return False, {}