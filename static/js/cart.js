// ========================
// Carrito de Compras
// ========================

// Estado del carrito (se guarda en localStorage)
let cart = JSON.parse(localStorage.getItem('costanzoCart')) || [];

// ========================
// Funciones del carrito
// ========================
function addToCart(product) {

    fetch('/addCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_producto: product.id,
        })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.ok) {
                showNotification(data.mensaje, 'error');
            } else {
                // updateCartUI(); // ✅ Recargar carrito
                showNotification(data.mensaje, 'success');
            }
        })
        .catch(err => {
            console.error('Error al agregar al carrito:', err);
            showNotification('Error de conexión con el servidor.', 'error');
        });
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

function getCartSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartIVA() {
    return getCartSubtotal() * 0.16; // IVA 16%
}

function getCartTotal() {
    return getCartSubtotal() + getCartIVA();
}

function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// // ========================
// // UI del carrito
// // ========================

// ========================
// Toggle del carrito
// ========================
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');

    if (cartSidebar && overlay) {
        cartSidebar.classList.toggle('active');
        overlay.classList.toggle('active');

        if (cartSidebar.classList.contains('active')) {
            updateCartUI(); // Cargar los productos desde el backend
        }
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
// Obtener los productos del carrito por usuario
// ========================
function updateCartUI() {

    const loader = document.getElementById('cartLoading');
    if (loader) loader.style.display = 'flex';

    fetch('/getItemsCart')
        .then(res => res.json())
        .then(data => {
            if (loader) loader.style.display = 'none';
            if (!data.ok) {
                showNotification(data.mensaje, 'error');
                return;
            }

            const items = (data.items || []).map(item => ({
                id: item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity
            }));

            renderCartItems(items);
            updateCartTotal(items)
        })
        .catch(err => {
            if (loader) loader.style.display = 'none';
            console.error('Error al cargar el carrito:', err);
            showNotification('No se pudo cargar el carrito.', 'error');
        });
}

// ========================
// Mostrar los productos del carrito por usuario
// ========================
function renderCartItems(items) {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    if (!items || items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
                <p style="font-size: 0.9rem; color: #808080;">Agrega productos para comenzar tu compra</p>
            </div>
        `;
        return;
    }


    cartItemsContainer.innerHTML = items.map(item => {
        const imageSrc = item.image
            ? (item.image.startsWith('data:image') ? item.image : `/static/img/${item.image}`)
            : '/static/img/default.png'; // imagen por defecto si es null

        return `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${imageSrc}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="remove-item" onclick="removeFromCart(${item.id})" title="Eliminar producto">
                            <i class="fas fa-trash-alt" style="font-family: 'Font Awesome 6 Free'; font-weight: 900;"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========================
// Precio resultante de productos del carro
// ========================

function updateCartTotal(items) {
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartIVA = document.getElementById('cartIVA');
    const cartTotal = document.getElementById('cartTotal');

    // Calcular subtotal sumando precio * cantidad
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    if (cartSubtotal) {
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }
    if (cartIVA) {
        cartIVA.textContent = `$${iva.toFixed(2)}`;
    }
    if (cartTotal) {
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
}


// // ========================
// // Checkout
// // ========================
// function checkout() {
//     if (cart.length === 0) {
//         alert('Tu carrito está vacío');
//         return;
//     }

//     // Aquí iría la lógica de checkout real
//     // Por ahora, mostraremos un resumen
//     const total = getCartTotal();
//     const itemCount = getCartItemCount();

//     const confirmation = confirm(
//         `Resumen de tu pedido:\n\n` +
//         `Productos: ${itemCount}\n` +
//         `Total: $${total.toFixed(2)}\n\n` +
//         `¿Deseas proceder con la compra?`
//     );

//     if (confirmation) {
//         // Simular procesamiento
//         showCheckoutModal();
//     }
// }

// function showCheckoutModal() {
//     const modal = document.createElement('div');
//     modal.className = 'checkout-modal';
//     modal.innerHTML = `
//         <div class="checkout-modal-content">
//             <div class="checkout-header">
//                 <h2>Finalizar Compra</h2>
//                 <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">
//                     <i class="fas fa-times"></i>
//                 </button>
//             </div>
//             <form class="checkout-form" onsubmit="processCheckout(event)" id="checkoutForm">
//                 <h3>Información de Envío</h3>
//                 <div class="form-group">
//                     <label>Nombre Completo *</label>
//                     <input type="text" name="nombre" required minlength="3" pattern="[A-Za-zÀ-ÿ\s]+" title="Solo letras y espacios">
//                 </div>
//                 <div class="form-group">
//                     <label>Correo Electrónico *</label>
//                     <input type="email" name="email" required pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Ingrese un correo válido">
//                 </div>
//                 <div class="form-group">
//                     <label>Teléfono *</label>
//                     <input type="tel" name="telefono" required pattern="[0-9]{10}" minlength="10" maxlength="10" title="Ingrese 10 dígitos">
//                 </div>
//                 <div class="form-group">
//                     <label>Dirección Completa *</label>
//                     <textarea name="direccion" rows="3" required minlength="10"></textarea>
//                 </div>
//                 <div class="form-row">
//                     <div class="form-group">
//                         <label>Ciudad *</label>
//                         <input type="text" name="ciudad" required minlength="3">
//                     </div>
//                     <div class="form-group">
//                         <label>Código Postal *</label>
//                         <input type="text" name="cp" required pattern="[0-9]{5}" minlength="5" maxlength="5" title="Ingrese 5 dígitos">
//                     </div>
//                 </div>

//                 <h3>Método de Pago</h3>
//                 <div class="payment-methods">
//                     <label class="payment-option">
//                         <input type="radio" name="payment" value="card" checked required>
//                         <span><i class="fas fa-credit-card"></i> Tarjeta de Crédito/Débito</span>
//                     </label>
//                     <label class="payment-option">
//                         <input type="radio" name="payment" value="transfer" required>
//                         <span><i class="fas fa-university"></i> Transferencia Bancaria</span>
//                     </label>
//                     <label class="payment-option">
//                         <input type="radio" name="payment" value="cash" required>
//                         <span><i class="fas fa-money-bill-wave"></i> Pago en Efectivo (contra entrega)</span>
//                     </label>
//                 </div>

//                 <div class="checkout-summary">
//                     <div class="summary-row">
//                         <span>Subtotal:</span>
//                         <span>$${getCartSubtotal().toFixed(2)}</span>
//                     </div>
//                     <div class="summary-row">
//                         <span>IVA (16%):</span>
//                         <span>$${getCartIVA().toFixed(2)}</span>
//                     </div>
//                     <div class="summary-row">
//                         <span>Envío:</span>
//                         <span>$50.00</span>
//                     </div>
//                     <div class="summary-row total">
//                         <span>Total:</span>
//                         <span>$${(getCartTotal() + 50).toFixed(2)}</span>
//                     </div>
//                 </div>

//                 <button type="submit" class="btn btn-primary btn-block">
//                     Confirmar Pedido <i class="fas fa-arrow-right"></i>
//                 </button>
//             </form>
//         </div>
//     `;

//     document.body.appendChild(modal);

//     // Estilos del modal
//     const style = document.createElement('style');
//     style.textContent = `
//         .checkout-modal {
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100vh;
//             background: rgba(0, 0, 0, 0.8);
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             z-index: 10000;
//             padding: 1rem;
//             overflow-y: auto;
//         }

//         .checkout-modal-content {
//             background: white;
//             max-width: 600px;
//             width: 100%;
//             border-radius: 20px;
//             max-height: 90vh;
//             overflow-y: auto;
//         }

//         .checkout-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             padding: 1.5rem;
//             background: linear-gradient(135deg, #8B4513, #D2691E);
//             color: white;
//             border-radius: 20px 20px 0 0;
//         }

//         .checkout-header h2 {
//             color: white;
//             margin: 0;
//         }

//         .close-modal {
//             background: rgba(255, 255, 255, 0.2);
//             color: white;
//             width: 35px;
//             height: 35px;
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             cursor: pointer;
//             border: none;
//         }

//         .checkout-form {
//             padding: 2rem;
//         }

//         .checkout-form h3 {
//             color: #8B4513;
//             margin: 1.5rem 0 1rem 0;
//             font-size: 1.3rem;
//         }

//         .checkout-form h3:first-child {
//             margin-top: 0;
//         }

//         .form-row {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 1rem;
//         }

//         .form-group label {
//             display: block;
//             margin-bottom: 0.5rem;
//             color: #5C4033;
//             font-weight: 500;
//         }

//         .payment-methods {
//             display: flex;
//             flex-direction: column;
//             gap: 0.75rem;
//             margin-bottom: 1.5rem;
//         }

//         .payment-option {
//             display: flex;
//             align-items: center;
//             padding: 1rem;
//             background: #FFF8DC;
//             border: 2px solid transparent;
//             border-radius: 10px;
//             cursor: pointer;
//             transition: all 0.3s ease;
//         }

//         .payment-option:hover {
//             border-color: #FF8C00;
//         }

//         .payment-option input[type="radio"] {
//             margin-right: 0.75rem;
//         }

//         .payment-option span {
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//             color: #5C4033;
//             font-weight: 500;
//         }

//         .payment-option i {
//             color: #D2691E;
//             font-size: 1.2rem;
//         }

//         .checkout-summary {
//             background: #FFF8DC;
//             padding: 1.5rem;
//             border-radius: 10px;
//             margin-bottom: 1.5rem;
//         }

//         .summary-row {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 0.75rem;
//             color: #5C4033;
//         }

//         .summary-row.total {
//             font-size: 1.3rem;
//             font-weight: 700;
//             color: #8B4513;
//             padding-top: 0.75rem;
//             border-top: 2px solid #D2691E;
//             margin-top: 0.75rem;
//             margin-bottom: 0;
//         }

//         @media (max-width: 600px) {
//             .form-row {
//                 grid-template-columns: 1fr;
//             }
//         }
//     `;
//     document.head.appendChild(style);

//     // Prevenir scroll del body
//     document.body.style.overflow = 'hidden';
// }

// function processCheckout(event) {
//     event.preventDefault();

//     // Simular procesamiento
//     const modal = event.target.closest('.checkout-modal');

//     // Mostrar mensaje de éxito
//     modal.innerHTML = `
//         <div class="checkout-modal-content">
//             <div class="checkout-success">
//                 <div class="success-icon">
//                     <i class="fas fa-check-circle"></i>
//                 </div>
//                 <h2>¡Pedido Realizado con Éxito!</h2>
//                 <p>Gracias por tu compra en Chocolates Costanzo</p>
//                 <p>Recibirás un correo de confirmación con los detalles de tu pedido y el número de seguimiento.</p>
//                 <div class="order-number">
//                     <strong>Número de pedido:</strong> #CC-${Date.now()}
//                 </div>
//                 <button class="btn btn-primary" onclick="finishCheckout()">
//                     Continuar Comprando
//                 </button>
//             </div>
//         </div>
//     `;

//     // Agregar estilos
//     const style = document.createElement('style');
//     style.textContent = `
//         .checkout-success {
//             padding: 3rem 2rem;
//             text-align: center;
//         }

//         .success-icon {
//             width: 100px;
//             height: 100px;
//             margin: 0 auto 1.5rem;
//             background: linear-gradient(135deg, #2ecc71, #27ae60);
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             animation: scaleIn 0.5s ease;
//         }

//         .success-icon i {
//             font-size: 3rem;
//             color: white;
//         }

//         .checkout-success h2 {
//             color: #8B4513;
//             margin-bottom: 1rem;
//         }

//         .checkout-success p {
//             color: #5C4033;
//             margin-bottom: 1rem;
//             line-height: 1.6;
//         }

//         .order-number {
//             background: #FFF8DC;
//             padding: 1rem;
//             border-radius: 10px;
//             margin: 1.5rem 0;
//             color: #8B4513;
//         }

//         @keyframes scaleIn {
//             from {
//                 transform: scale(0);
//             }
//             to {
//                 transform: scale(1);
//             }
//         }
//     `;
//     document.head.appendChild(style);

//     // Limpiar carrito
//     clearCart();
//     closeCart();
// }

// function finishCheckout() {
//     document.querySelector('.checkout-modal').remove();
//     document.body.style.overflow = '';
// }

// ========================
// Event Listeners
// ========================
document.addEventListener('DOMContentLoaded', function () {
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

