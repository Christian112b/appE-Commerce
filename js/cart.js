// ========================
// Carrito de Compras
// ========================

// Estado del carrito (se guarda en localStorage)
let cart = JSON.parse(localStorage.getItem('costanzoCart')) || [];

// ========================
// Funciones del carrito
// ========================
function addToCart(product) {
    // Buscar si el producto ya existe en el carrito
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('costanzoCart', JSON.stringify(cart));
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// ========================
// UI del carrito
// ========================
function updateCartUI() {
    updateCartCount();
    renderCartItems();
    updateCartTotal();
}

function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const count = getCartItemCount();
        cartCount.textContent = count;
        
        // Animación
        cartCount.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 200);
    }
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <p style="font-size: 0.9rem; color: #808080;">Agrega productos para comenzar tu compra</p>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateCartTotal() {
    const cartTotal = document.getElementById('cartTotal');
    if (cartTotal) {
        cartTotal.textContent = `$${getCartTotal().toFixed(2)}`;
    }
}

// ========================
// Toggle del carrito
// ========================
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar && overlay) {
        cartSidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar && overlay) {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// ========================
// Checkout
// ========================
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Aquí iría la lógica de checkout real
    // Por ahora, mostraremos un resumen
    const total = getCartTotal();
    const itemCount = getCartItemCount();
    
    const confirmation = confirm(
        `Resumen de tu pedido:\n\n` +
        `Productos: ${itemCount}\n` +
        `Total: $${total.toFixed(2)}\n\n` +
        `¿Deseas proceder con la compra?`
    );
    
    if (confirmation) {
        // Simular procesamiento
        showCheckoutModal();
    }
}

function showCheckoutModal() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="checkout-modal-content">
            <div class="checkout-header">
                <h2>Finalizar Compra</h2>
                <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form class="checkout-form" onsubmit="processCheckout(event)">
                <h3>Información de Envío</h3>
                <div class="form-group">
                    <label>Nombre Completo *</label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>Correo Electrónico *</label>
                    <input type="email" required>
                </div>
                <div class="form-group">
                    <label>Teléfono *</label>
                    <input type="tel" required>
                </div>
                <div class="form-group">
                    <label>Dirección Completa *</label>
                    <textarea rows="3" required></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Ciudad *</label>
                        <input type="text" required>
                    </div>
                    <div class="form-group">
                        <label>Código Postal *</label>
                        <input type="text" required>
                    </div>
                </div>
                
                <h3>Método de Pago</h3>
                <div class="payment-methods">
                    <label class="payment-option">
                        <input type="radio" name="payment" value="card" checked>
                        <span><i class="fas fa-credit-card"></i> Tarjeta de Crédito/Débito</span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="payment" value="transfer">
                        <span><i class="fas fa-university"></i> Transferencia Bancaria</span>
                    </label>
                    <label class="payment-option">
                        <input type="radio" name="payment" value="cash">
                        <span><i class="fas fa-money-bill-wave"></i> Pago en Efectivo (contra entrega)</span>
                    </label>
                </div>
                
                <div class="checkout-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>$${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Envío:</span>
                        <span>$50.00</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>$${(getCartTotal() + 50).toFixed(2)}</span>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">
                    Confirmar Pedido <i class="fas fa-arrow-right"></i>
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Estilos del modal
    const style = document.createElement('style');
    style.textContent = `
        .checkout-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
            overflow-y: auto;
        }
        
        .checkout-modal-content {
            background: white;
            max-width: 600px;
            width: 100%;
            border-radius: 20px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .checkout-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, #8B4513, #D2691E);
            color: white;
            border-radius: 20px 20px 0 0;
        }
        
        .checkout-header h2 {
            color: white;
            margin: 0;
        }
        
        .close-modal {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
        }
        
        .checkout-form {
            padding: 2rem;
        }
        
        .checkout-form h3 {
            color: #8B4513;
            margin: 1.5rem 0 1rem 0;
            font-size: 1.3rem;
        }
        
        .checkout-form h3:first-child {
            margin-top: 0;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #5C4033;
            font-weight: 500;
        }
        
        .payment-methods {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }
        
        .payment-option {
            display: flex;
            align-items: center;
            padding: 1rem;
            background: #FFF8DC;
            border: 2px solid transparent;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .payment-option:hover {
            border-color: #FF8C00;
        }
        
        .payment-option input[type="radio"] {
            margin-right: 0.75rem;
        }
        
        .payment-option span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #5C4033;
            font-weight: 500;
        }
        
        .payment-option i {
            color: #D2691E;
            font-size: 1.2rem;
        }
        
        .checkout-summary {
            background: #FFF8DC;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            color: #5C4033;
        }
        
        .summary-row.total {
            font-size: 1.3rem;
            font-weight: 700;
            color: #8B4513;
            padding-top: 0.75rem;
            border-top: 2px solid #D2691E;
            margin-top: 0.75rem;
            margin-bottom: 0;
        }
        
        @media (max-width: 600px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

function processCheckout(event) {
    event.preventDefault();
    
    // Simular procesamiento
    const modal = event.target.closest('.checkout-modal');
    
    // Mostrar mensaje de éxito
    modal.innerHTML = `
        <div class="checkout-modal-content">
            <div class="checkout-success">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>¡Pedido Realizado con Éxito!</h2>
                <p>Gracias por tu compra en Chocolates Costanzo</p>
                <p>Recibirás un correo de confirmación con los detalles de tu pedido y el número de seguimiento.</p>
                <div class="order-number">
                    <strong>Número de pedido:</strong> #CC-${Date.now()}
                </div>
                <button class="btn btn-primary" onclick="finishCheckout()">
                    Continuar Comprando
                </button>
            </div>
        </div>
    `;
    
    // Agregar estilos
    const style = document.createElement('style');
    style.textContent = `
        .checkout-success {
            padding: 3rem 2rem;
            text-align: center;
        }
        
        .success-icon {
            width: 100px;
            height: 100px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.5s ease;
        }
        
        .success-icon i {
            font-size: 3rem;
            color: white;
        }
        
        .checkout-success h2 {
            color: #8B4513;
            margin-bottom: 1rem;
        }
        
        .checkout-success p {
            color: #5C4033;
            margin-bottom: 1rem;
            line-height: 1.6;
        }
        
        .order-number {
            background: #FFF8DC;
            padding: 1rem;
            border-radius: 10px;
            margin: 1.5rem 0;
            color: #8B4513;
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Limpiar carrito
    clearCart();
    closeCart();
}

function finishCheckout() {
    document.querySelector('.checkout-modal').remove();
    document.body.style.overflow = '';
}

// ========================
// Event Listeners
// ========================
document.addEventListener('DOMContentLoaded', function() {
    // Botón del carrito
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
    }
    
    // Botón de cerrar carrito
    const closeCartBtn = document.getElementById('closeCart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    // Overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', closeCart);
    }
    
    // Botón de checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    // Cargar carrito inicial
    updateCartUI();
});

// Hacer funciones globales para los event handlers inline
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.checkout = checkout;
window.processCheckout = processCheckout;
window.finishCheckout = finishCheckout;

