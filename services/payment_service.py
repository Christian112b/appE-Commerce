import stripe
import os
from controllers.dbConnection import DBConnection
from models.cart import Cart
from models.product import Product
from datetime import datetime
from pytz import timezone

class PaymentService:
    def __init__(self):
        self.stripe_api_key = os.getenv("STRIPE_PRIVATE_KEY")
        if self.stripe_api_key:
            stripe.api_key = self.stripe_api_key

    def create_payment_intent(self, amount_cents, method_id, user_id=None, address_id=None, coupon_id=None):
        """Create Stripe PaymentIntent for card payments"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='mxn',
                automatic_payment_methods={'enabled': True}
            )

            # Log successful payment creation
            self._log_payment_creation(intent.id, method_id, amount_cents/100, user_id, 'exitoso')

            return {
                'clientSecret': intent.client_secret,
                'ok': True,
                'status': 'exitoso'
            }

        except Exception as e:
            print(f'Error creating PaymentIntent: {e}')
            self._log_payment_error(str(e), user_id)
            return {'error': str(e)}, 400

    def process_offline_payment(self, amount_cents, method_id, user_id=None, address_id=None, coupon_id=None):
        """Process offline payments (transfer, cash, OXXO, SPEI)"""
        try:
            # Log offline payment creation
            self._log_payment_creation(None, method_id, amount_cents/100, user_id, 'pendiente')

            # Clear user's cart
            if user_id:
                self._clear_user_cart(user_id)

            return {
                'ok': True,
                'status': 'pendiente',
                'closeModal': True
            }

        except Exception as e:
            print(f'Error processing offline payment: {e}')
            return {'error': str(e)}, 500

    def confirm_card_payment(self, payment_intent_id, user_id=None, address_id=None, coupon_id=None):
        """Confirm successful card payment and process order"""
        try:
            # Clear user's cart
            if user_id:
                self._clear_user_cart(user_id)

            return {
                'ok': True,
                'status': 'exitoso',
                'closeModal': True
            }

        except Exception as e:
            print(f'Error confirming card payment: {e}')
            return {'error': str(e)}, 500

    def validate_coupon(self, coupon_name):
        """Validate coupon by name"""
        db = DBConnection()
        try:
            # Use Mexico timezone for validation
            mexico_tz = timezone('America/Mexico_City')
            now_mexico = datetime.now(mexico_tz)

            coupon = db.query(
                "SELECT id_descuento, nombre, tipo, valor FROM costanzo.cupones WHERE LOWER(nombre) = LOWER(%s) AND activo = 1 AND (fecha_inicio IS NULL OR fecha_inicio <= %s) AND (fecha_fin IS NULL OR fecha_fin >= %s)",
                (coupon_name, now_mexico, now_mexico)
            )

            if coupon:
                return {
                    'ok': True,
                    'cupon': coupon[0]
                }
            else:
                return {
                    'ok': False,
                    'mensaje': 'Cupón no encontrado o no válido.'
                }
        except Exception as e:
            print(f'Error validating coupon: {e}')
            return {
                'ok': False,
                'mensaje': 'Error interno del servidor.'
            }
        finally:
            db.close()

    def _log_payment_creation(self, intent_id, method_id, amount, user_id, status):
        """Log payment creation in database"""
        db = DBConnection()
        try:
            db.execute(
                "INSERT INTO costanzo.logpagos (id_intento_pago, id_metodo_pago, monto, fecha_pago, estado_pago) VALUES (%s, %s, %s, %s, %s)",
                (intent_id, method_id, amount, datetime.now(), status)
            )

            # Log activity
            descripcion = f"Pago {status} creado metodo={method_id} monto={amount}" + (f" intent_id={intent_id}" if intent_id else "")
            db.execute(
                "INSERT INTO costanzo.logactividad (id_usuario, accion, descripcion, fecha_evento) VALUES (%s, %s, %s, %s)",
                (user_id, 'CREACION_PAGO', descripcion, datetime.now())
            )
        except Exception as e:
            print(f'Error logging payment: {e}')
        finally:
            db.close()

    def _log_payment_error(self, error_msg, user_id):
        """Log payment error"""
        db = DBConnection()
        try:
            db.execute(
                "INSERT INTO costanzo.logactividad (id_usuario, accion, descripcion, fecha_evento) VALUES (%s, %s, %s, %s)",
                (user_id, 'create_payment_error', f"Error creando PaymentIntent: {error_msg}", datetime.now())
            )
        except Exception as e:
            print(f'Error logging payment error: {e}')
        finally:
            db.close()

    def _clear_user_cart(self, user_id):
        """Clear user's cart after successful payment"""
        try:
            cart_id = Cart.get_or_create_cart(user_id)
            Cart.clear_cart(cart_id)
        except Exception as e:
            print(f'Error clearing cart: {e}')

    def deduct_inventory(self, cart_items):
        """Deduct inventory for purchased items"""
        try:
            for item in cart_items:
                Product.reduce_stock(item['id'], item['quantity'])
            return True
        except Exception as e:
            print(f'Error deducting inventory: {e}')
            return False