import re
from datetime import datetime

class ValidationError(Exception):
    pass

class Validators:
    @staticmethod
    def validate_email(email):
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValidationError("Formato de email inválido")
        return email.lower().strip()

    @staticmethod
    def validate_password(password):
        """Validate password strength"""
        if len(password) < 8:
            raise ValidationError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r'[A-Z]', password):
            raise ValidationError("La contraseña debe contener al menos una letra mayúscula")
        if not re.search(r'[a-z]', password):
            raise ValidationError("La contraseña debe contener al menos una letra minúscula")
        if not re.search(r'\d', password):
            raise ValidationError("La contraseña debe contener al menos un número")
        return password

    @staticmethod
    def validate_name(name):
        """Validate name format"""
        if len(name.strip()) < 2:
            raise ValidationError("El nombre debe tener al menos 2 caracteres")
        if not re.match(r"^[A-Za-zÀ-ÿ\s]+$", name.strip()):
            raise ValidationError("El nombre solo puede contener letras y espacios")
        return name.strip()

    @staticmethod
    def validate_product_quantity(quantity):
        """Validate product quantity"""
        try:
            qty = int(quantity)
            if qty < 1:
                raise ValidationError("La cantidad debe ser mayor a 0")
            if qty > 999:
                raise ValidationError("La cantidad máxima permitida es 999")
            return qty
        except (ValueError, TypeError):
            raise ValidationError("Cantidad inválida")

    @staticmethod
    def validate_price(price):
        """Validate price format"""
        try:
            p = float(price)
            if p < 0:
                raise ValidationError("El precio no puede ser negativo")
            if p > 999999.99:
                raise ValidationError("El precio máximo permitido es 999,999.99")
            return round(p, 2)
        except (ValueError, TypeError):
            raise ValidationError("Precio inválido")

    @staticmethod
    def validate_coupon_name(name):
        """Validate coupon name"""
        if not name or len(name.strip()) < 2:
            raise ValidationError("El nombre del cupón debe tener al menos 2 caracteres")
        if len(name.strip()) > 50:
            raise ValidationError("El nombre del cupón no puede exceder 50 caracteres")
        return name.strip()

    @staticmethod
    def validate_address_data(alias, calle, colonia, ciudad, estado, cp):
        """Validate address data"""
        if not all([alias, calle, colonia, ciudad, estado, cp]):
            raise ValidationError("Todos los campos de dirección son requeridos")

        if len(alias.strip()) < 2 or len(alias.strip()) > 50:
            raise ValidationError("El alias debe tener entre 2 y 50 caracteres")

        if len(calle.strip()) < 5 or len(calle.strip()) > 100:
            raise ValidationError("La calle debe tener entre 5 y 100 caracteres")

        if not re.match(r'^\d{5}$', cp.strip()):
            raise ValidationError("El código postal debe tener exactamente 5 dígitos")

        return {
            'alias': alias.strip(),
            'calle': calle.strip(),
            'colonia': colonia.strip(),
            'ciudad': ciudad.strip(),
            'estado': estado.strip(),
            'cp': cp.strip()
        }

    @staticmethod
    def sanitize_string(text, max_length=255):
        """Sanitize string input"""
        if not text:
            return ""
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>]', '', str(text).strip())
        return sanitized[:max_length] if len(sanitized) > max_length else sanitized