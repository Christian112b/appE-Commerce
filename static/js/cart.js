// ========================
// Carrito de Compras
// ========================

// Estado del carrito (se guarda en localStorage)
let cart = []

// ========================
// Funciones del carrito
// ========================
function addToCart(product) {
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        // Update quantity locally
        existingItem.quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            name: product.name || 'Producto',
            image: product.image || '',
            price: parseFloat(product.price) || 0,
            quantity: 1
        });
    }

    // Save to localStorage immediately
    saveCart();

    // Update UI in real-time
    renderCartItems(cart);
    updateCartTotal(cart);

    // Update checkout button state
    const checkoutBtnEl = document.getElementById('checkoutBtn');
    if (checkoutBtnEl) {
        checkoutBtnEl.disabled = false;
        checkoutBtnEl.classList.remove('disabled');
    }

    // Show success notification
    showNotification('Producto agregado al carrito', 'success');

    // Sync with server in background (don't wait for response)
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
                console.warn('Server sync failed:', data.mensaje);
                // Don't show error to user since local operation succeeded
            }
        })
        .catch(err => {
            console.warn('Server sync error:', err);
            // Don't show error to user since local operation succeeded
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

// ========================
// Load cart from localStorage on page load
// ========================
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('costanzoCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            // Validate cart items (ensure they have required properties)
            cart = cart.filter(item =>
                item.id && item.name && item.price !== undefined && item.quantity > 0
            );
            saveCart(); // Re-save validated cart
        }
    } catch (e) {
        console.warn('Error loading cart from localStorage:', e);
        cart = [];
    }
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
    fetch('/check-session')
        .then(res => res.json())
        .then(data => {
            if (!data.ok) {
                showNotification('Debes iniciar sesión para ver tu carrito.', 'warning');
                return;
            }

            const cartSidebar = document.getElementById('cartSidebar');
            const overlay = document.getElementById('overlay');

            if (cartSidebar && overlay) {
                cartSidebar.classList.toggle('active');
                overlay.classList.toggle('active');

                if (cartSidebar.classList.contains('active')) {
                    // Show cart loading state and then load items
                    const cartItemsContainer = document.getElementById('cartItems');
                    if (cartItemsContainer) {
                        cartItemsContainer.innerHTML = '<div class="cart-loading"><i class="fas fa-spinner fa-spin"></i> Cargando carrito...</div>';
                    }
                    updateCartUI(); // Cargar los productos desde el backend
                }
            }
        })
        .catch(err => {
            console.error('Error al verificar sesión:', err);
            showNotification('No se pudo verificar tu sesión.', 'error');
        });
}


function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');

    if (cartSidebar && overlay) {
        cartSidebar.classList.remove('active');
        overlay.classList.remove('active');

        // Sync cart with server when closing (batch update)
        persistCartToBackend();
    }
}

function persistCartToBackend() {
    return fetch('/saveCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.ok) {
                showNotification('No se pudo guardar el carrito.', 'error');
            }
            return data;
        })
        .catch(err => {
            console.error('Error al guardar el carrito:', err);
            throw err;
        });
}

function clearCartNoRefresh() {
    cart = [];
    saveCart();
}



// ========================
// Obtener los productos del carrito por usuario
// ========================
function updateCartUI() {
    // ensure there's a loading element visible while we fetch
    const loader = document.getElementById('cartLoading');
    if (loader) loader.style.display = 'flex';

    // disable proceed button while loading
    const checkoutBtnEl = document.getElementById('checkoutBtn');
    if (checkoutBtnEl) {
        checkoutBtnEl.disabled = true;
        checkoutBtnEl.classList.add('disabled');
    }

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

            // replace in-memory cart only after we have server-confirmed items
            cart = items;

            renderCartItems(items);
            updateCartTotal(items)

            // re-enable or keep disabled the checkout button depending on item count
            if (checkoutBtnEl) {
                const hasItems = items && items.length > 0;
                checkoutBtnEl.disabled = !hasItems;
                checkoutBtnEl.classList.toggle('disabled', !hasItems);
            }
        })
        .catch(err => {
            if (loader) loader.style.display = 'none';
            console.error('Error al cargar el carrito:', err);
            showNotification('No se pudo cargar el carrito.', 'error');
            if (checkoutBtnEl) { checkoutBtnEl.disabled = true; checkoutBtnEl.classList.add('disabled'); }
        });
}

// Blocking overlay utilities to prevent interaction during processing
function showBlockingOverlay() {
    let block = document.getElementById('blockingOverlay');
    if (!block) {
        block = document.createElement('div');
        block.id = 'blockingOverlay';
        block.style.position = 'fixed';
        block.style.top = '0';
        block.style.left = '0';
        block.style.width = '100%';
        block.style.height = '100%';
        block.style.background = 'rgba(0,0,0,0.35)';
        block.style.zIndex = '9999';
        block.innerHTML = '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:white;font-weight:700"><i class="fas fa-spinner fa-spin"></i> Procesando...</div>';
        document.body.appendChild(block);
    }
    block.style.display = 'block';
}

function hideBlockingOverlay() {
    const block = document.getElementById('blockingOverlay');
    if (block) block.style.display = 'none';
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

// ========================
// Agregar uno de producto al carrito (LOCAL - sin server requests)
// ========================
function updateQuantity(idProducto, delta) {
    const index = cart.findIndex(p => p.id === idProducto);
    if (index === -1) return;

    // Update local cart
    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    // Save to localStorage immediately
    saveCart();

    // Update UI in real-time
    renderCartItems(cart);
    updateCartTotal(cart);

    // Update checkout button state
    const checkoutBtnEl = document.getElementById('checkoutBtn');
    if (checkoutBtnEl) {
        const hasItems = cart && cart.length > 0;
        checkoutBtnEl.disabled = !hasItems;
        checkoutBtnEl.classList.toggle('disabled', !hasItems);
    }
}

// ========================
// Borrar producto de carrito (LOCAL - sin server requests)
// ========================
function removeFromCart(idProducto) {
    const index = cart.findIndex(p => p.id === idProducto);
    if (index === -1) return;

    // Remove from local cart
    cart.splice(index, 1);

    // Save to localStorage immediately
    saveCart();

    // Update UI in real-time
    renderCartItems(cart);
    updateCartTotal(cart);

    // Update checkout button state
    const checkoutBtnEl = document.getElementById('checkoutBtn');
    if (checkoutBtnEl) {
        const hasItems = cart && cart.length > 0;
        checkoutBtnEl.disabled = !hasItems;
        checkoutBtnEl.classList.toggle('disabled', !hasItems);
    }
}

// // ========================
// // Checkout
// // ========================
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }

    // Sync cart with server before checkout
    persistCartToBackend().then(() => {
        getAddresses();
        // fetchAddresses(true); // fuerza recarga

        const checkoutItemsContainer = document.getElementById('checkoutItems');
        checkoutItemsContainer.innerHTML = cart.map(item => {
            const price = parseFloat(item.price) || 0;
            const total = price * item.quantity;

            return `
            <div class="checkout-item">
                <img src="${item.image || '/static/img/default.png'}" alt="${item.name}">
                <div class="checkout-item-info">
                    <h4>${item.name}</h4>
                    <p>Cantidad: ${item.quantity}</p>
                    <p>Precio unitario: $${price.toFixed(2)}</p>
                    <p>Total: $${total.toFixed(2)}</p>
                </div>
            </div>
        `;
        }).join('');

        const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const iva = subtotal * 0.16;
        const envio = 50.00; // costo fijo de envío
        const totalResumen = subtotal + iva;
        const totalPago = subtotal + iva + envio;


        document.getElementById('checkoutSubtotalResumen').textContent = subtotal.toFixed(2);
        document.getElementById('checkoutIVAResumen').textContent = iva.toFixed(2);
        document.getElementById('checkoutTotalResumen').textContent = totalResumen.toFixed(2);

        document.getElementById('checkoutSubtotalPago').textContent = subtotal.toFixed(2);
        document.getElementById('checkoutIVAPago').textContent = iva.toFixed(2);
        document.getElementById('checkoutEnvioPago').textContent = envio.toFixed(2);
        document.getElementById('checkoutTotalPago').textContent = totalPago.toFixed(2);


        const modalEl = document.getElementById('checkoutModal');
        if (modalEl) {
            modalEl.classList.add('active');
            // reset tabs to the first panel when opening
            showTab(0);
        }
    }).catch(err => {
        console.error('Error syncing cart before checkout:', err);
        showNotification('Error al sincronizar carrito. Intenta de nuevo.', 'error');
    });
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
}

function confirmCheckout() {
    // Aquí puedes hacer el POST a /procesarCompra o similar
    closeCheckoutModal();
    showNotification('¡Compra realizada con éxito!', 'success');

    // // Limpiar carrito en memoria y UI
    // renderCartItems(cart);
    // updateCartTotal(cart);

    // También puedes hacer un fetch para guardar o registrar la compra
}



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

function showTab(index, event) {
    // showTab called
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    const tabs = modal.querySelectorAll('.tab-panel');
    const buttons = modal.querySelectorAll('.tab-btn');

    tabs.forEach((tab, i) => {
        const isActive = i === index;
        tab.classList.toggle('active', isActive);
        if (buttons[i]) buttons[i].classList.toggle('active', isActive);
        // force show/hide inline to avoid other CSS or global selectors interfering
        try { tab.style.display = isActive ? 'block' : 'none'; } catch (e) { /* ignore */ }
    });

    if (index === 2) {
        // entering payment tab -> lazy render contents and set visibility of card form only when card selected
        renderPaymentTabIfNeeded();
        const cardFormContainer = document.getElementById('cardFormContainer');
        const isCardSelected = document.getElementById('payCard') && document.getElementById('payCard').checked;
        if (cardFormContainer) cardFormContainer.style.display = isCardSelected ? 'block' : 'none';
        // Only initialize Stripe elements if card payment is selected
        if (isCardSelected) setupStripeCardForm();
        // log the payment tab HTML for debugging (trimmed)
        const payTab = document.getElementById('tabMetodosPago');
    // payment tab HTML logged during debugging, omitted now
        setupStripeCardForm();
        // Force the active tab to be visually on top in case CSS is hiding it
        try {
            const modalBox = document.querySelector('#checkoutModal .modal-box');
            if (modalBox) modalBox.style.zIndex = '99999';
            if (payTab) {
                payTab.style.zIndex = '100000';
                payTab.style.position = 'relative';
                payTab.style.opacity = '1';
                payTab.style.visibility = 'visible';
                // log computed style and rect for debugging
                try {
                    // removed deep debug logging
                } catch (e) { /* ignore */ }
            }
        } catch (e) { console.warn('[cart] could not force styles on payment tab', e); }
    }
    const tabsArr = Array.from(tabs);
    if (index === tabsArr.length - 1) {
        recalcCheckoutTotals();
        buildConfirmSummary();
        updateFooterButtonsForTab();
        // log confirm tab HTML for debugging (trimmed)
        const confirmTab = document.getElementById('tabConfirmar');
        try {
            if (confirmTab) {
                confirmTab.style.zIndex = '100000';
                confirmTab.style.position = 'relative';
                confirmTab.style.opacity = '1';
                confirmTab.style.visibility = 'visible';
            }
        } catch (e) { /* ignore */ }
    } else {
        updateFooterButtonsForTab();
    }
}

// Ensure modal-level delegation for payment method changes (works even if radios are added later)
document.addEventListener('click', function (e) {
    const modal = document.getElementById('checkoutModal');
    if (!modal || !modal.classList.contains('active')) return;
    // If a payment radio was clicked
    const target = e.target;
    if (!target) return;
    if (target.matches && target.matches('input[name="paymentMethod"]')) {
    // payment method selected
        const cardForm = document.getElementById('cardFormContainer');
        const cardRow = document.getElementById('cardRow');
        const isCard = document.getElementById('payCard') && document.getElementById('payCard').checked;
        if (cardForm) cardForm.style.display = isCard ? 'block' : 'none';
        if (cardRow) cardRow.style.display = isCard ? 'flex' : 'none';
        if (isCard) {
            // card selected -> ensure Stripe elements are ready
            setupStripeCardForm();
        }
    }
});

// Next button moves to next tab; on last tab it stays
function nextTab() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    const tabs = Array.from(modal.querySelectorAll('.tab-panel'));
    const activeIndex = tabs.findIndex(t => t.classList.contains('active'));
    const nextIndex = Math.min(activeIndex + 1, tabs.length - 1);
    showTab(nextIndex);
    if (nextIndex === tabs.length - 1) buildConfirmSummary();
}

document.addEventListener('DOMContentLoaded', function () {
    const nextBtn = document.getElementById('nextCheckoutBtn');
    if (nextBtn) nextBtn.addEventListener('click', nextTab);
    // Wire coupon apply button
    const applyBtn = document.getElementById('applyCouponBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const code = (document.getElementById('couponInput') || { value: '' }).value.trim();
            applyBtn.disabled = true;
            validateAndApplyCoupon(code).finally(() => { applyBtn.disabled = false; recalcCheckoutTotals(); });
        });
    }
    // Hide footer Next when in last tab
    const footerNext = document.getElementById('nextCheckoutBtn');
    const tabContent = document.querySelector('.tab-content');
    if (footerNext) {
        const modal = document.getElementById('checkoutModal');
        const updateFooter = () => {
            if (!modal) return;
            const tabs = Array.from(modal.querySelectorAll('.tab-panel'));
            const activeIndex = tabs.findIndex(t => t.classList.contains('active'));
            footerNext.style.display = (activeIndex === tabs.length - 1) ? 'none' : '';
        };
        // run initially and whenever tabs change (observe modal tab content if present)
        updateFooter();
        const modalTabContent = modal ? modal.querySelector('.tab-content') : null;
        if (modalTabContent) {
            const obs = new MutationObserver(updateFooter);
            obs.observe(modalTabContent, { subtree: true, attributes: true, childList: true });
        }
    }
});

// Coupons: load and validate client-side (backend returns full list)
let availableCoupons = [];
async function loadCoupons() {
    try {
        const res = await fetch('/get-discounts');
        availableCoupons = await res.json();
    } catch (err) {
        console.error('Error loading coupons', err);
        availableCoupons = [];
    }
}

function validateAndApplyCoupon(code) {
    const messageEl = document.getElementById('couponMessage');
    if (!messageEl) return;
    if (!code) {
        messageEl.textContent = '';
        window.selectedCoupon = null;
        return;
    }
    // Show loading modal while validating
    const loading = document.getElementById('couponLoadingModal');
    if (loading) loading.style.display = 'flex';

    // Get current user ID first
    return fetch('/check-session')
        .then(res => res.json())
        .then(sessionData => {
            if (!sessionData.ok || !sessionData.user_id) {
                throw new Error('Usuario no autenticado');
            }
            const userId = sessionData.user_id;

            // Now validate the coupon code first to get coupon_id
            return fetch('/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coupon_name: code })
            })
            .then(res => res.json())
            .then(data => {
                if (!data.ok) {
                    messageEl.textContent = data.mensaje || 'Cupón no válido';
                    messageEl.classList.add('invalid');
                    window.selectedCoupon = null;
                    return;
                }

                const coupon = data.cupon;

                // Now check if user has already used this coupon
                return fetch('/check-coupon-usage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        coupon_id: coupon.id_descuento
                    })
                })
                .then(res => res.json())
                .then(usageData => {
                    if (usageData.used && usageData.usage_date) {
                        messageEl.textContent = `Ya has usado este cupón anteriormente (${new Date(usageData.usage_date).toLocaleDateString('es-MX')})`;
                        messageEl.classList.add('invalid');
                        window.selectedCoupon = null;
                        return;
                    }

                    // Coupon is valid and not used before - apply it
                    const subtotal = parseFloat(getCartSubtotal()) || 0;
                    let descuento = 0;
                    if (coupon.tipo === 'porcentaje') descuento = subtotal * (coupon.valor / 100);
                    else descuento = parseFloat(coupon.valor || 0);

                    messageEl.textContent = `Descuento aplicado: $${descuento.toFixed(2)}`;
                    messageEl.classList.remove('invalid');
                    window.selectedCoupon = coupon.id_descuento;
                });
            });
        })
    .then(res => res.json())
    .then(usageData => {
        // Now validate the coupon code
        return fetch('/validate-coupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coupon_name: code })
        })
        .then(res => res.json())
        .then(data => {
            if (!data.ok) {
                messageEl.textContent = data.mensaje || 'Cupón no válido';
                messageEl.classList.add('invalid');
                window.selectedCoupon = null;
                return;
            }

            const coupon = data.cupon;

            // Check if user has already used this coupon
            if (usageData.used && usageData.usage_date) {
                messageEl.textContent = `Ya has usado este cupón anteriormente (${new Date(usageData.usage_date).toLocaleDateString('es-MX')})`;
                messageEl.classList.add('invalid');
                window.selectedCoupon = null;
                return;
            }

            // Calculate discount for display
            const subtotal = parseFloat(getCartSubtotal()) || 0;
            let descuento = 0;
            if (coupon.tipo === 'porcentaje') descuento = subtotal * (coupon.valor / 100);
            else descuento = parseFloat(coupon.valor || 0);

            messageEl.textContent = `Descuento aplicado: $${descuento.toFixed(2)}`;
            messageEl.classList.remove('invalid');
            window.selectedCoupon = coupon.id_descuento;
        });
    })
    .catch(err => {
        console.error('Error validating coupon', err);
        messageEl.textContent = 'Error validando cupón';
        messageEl.classList.add('invalid');
        window.selectedCoupon = null;
        throw err;
    })
    .finally(() => {
        if (loading) loading.style.display = 'none';
    });
}

function buildConfirmSummary() {
    const subtotal = parseFloat(document.getElementById('checkoutSubtotalPago').textContent) || 0;
    const iva = parseFloat(document.getElementById('checkoutIVAPago').textContent) || 0;
    const envio = parseFloat(document.getElementById('checkoutEnvioPago').textContent) || 0;
    const total = parseFloat(document.getElementById('checkoutTotalPago').textContent) || 0;
    const selectedAddress = document.querySelector('.address-card.selected');
    const addrText = selectedAddress ? selectedAddress.innerText.replace(/\n/g,' ').trim() : 'No seleccionado';
    const method = document.querySelector('input[name="paymentMethod"]:checked');
    const methodText = method ? method.nextElementSibling ? method.nextElementSibling.textContent : method.value : '-';

    // Update confirmation tab with detailed breakdown
    document.getElementById('confirmSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('confirmIVA').textContent = `$${iva.toFixed(2)}`;
    document.getElementById('confirmEnvio').textContent = `$${envio.toFixed(2)}`;
    document.getElementById('confirmTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('confirmAddress').textContent = addrText;
    document.getElementById('confirmMethod').textContent = methodText;

    // Handle discount row in confirmation
    const discountRow = document.getElementById('confirmDiscountRow');
    const discountAmount = document.getElementById('checkoutDiscountPago');
    if (discountAmount && discountAmount.textContent !== '-$0.00' && discountAmount.style.display !== 'none') {
        document.getElementById('confirmDiscount').textContent = discountAmount.textContent;
        if (discountRow) discountRow.style.display = 'flex';
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }

    // if card element, show last4 placeholder
    const cardLast4 = window.cardLast4 || 'XXXX';
    document.getElementById('confirmCardLast4').textContent = `**** **** **** ${cardLast4}`;
}

// Recalculate checkout totals and update DOM (applies coupon visually if selected)
function recalcCheckoutTotals() {
    const subtotal = getCartSubtotal();
    const iva = subtotal * 0.16;
    const envio = 50.00;
    let totalPago = subtotal + iva + envio;

    // If a coupon is applied, compute discount and subtract (frontend only)
    let descuento = 0;
    if (window.selectedCoupon && availableCoupons.length) {
        const found = availableCoupons.find(c => c.id_descuento == window.selectedCoupon);
        if (found) {
            if (found.tipo === 'porcentaje') descuento = subtotal * (found.valor / 100);
            else descuento = parseFloat(found.valor || 0);
            totalPago = Math.max(0, totalPago - descuento);
            const discountText = found.tipo === 'porcentaje' ? `${found.valor}%` : `$${found.valor}`;
            document.getElementById('couponMessage').textContent = `Descuento aplicado: ${discountText}`;
            document.getElementById('couponMessage').style.color = '#1a512b';
        }
    }

    document.getElementById('checkoutSubtotalResumen').textContent = subtotal.toFixed(2);
    document.getElementById('checkoutIVAResumen').textContent = iva.toFixed(2);
    document.getElementById('checkoutTotalResumen').textContent = (subtotal + iva).toFixed(2);

    document.getElementById('checkoutSubtotalPago').textContent = subtotal.toFixed(2);
    document.getElementById('checkoutIVAPago').textContent = iva.toFixed(2);
    document.getElementById('checkoutEnvioPago').textContent = envio.toFixed(2);

    // Add discount row if coupon is applied
    const discountRow = document.getElementById('checkoutDiscountRow');
    if (descuento > 0) {
        if (!discountRow) {
            const summary = document.querySelector('.checkout-summary');
            const newRow = document.createElement('div');
            newRow.className = 'summary-row';
            newRow.id = 'checkoutDiscountRow';
            newRow.innerHTML = `<span>Descuento:</span><span id="checkoutDiscountPago">-$0.00</span>`;
            summary.insertBefore(newRow, summary.querySelector('.summary-row.total'));
        }
        document.getElementById('checkoutDiscountPago').textContent = `-${descuento.toFixed(2)}`;
    } else if (discountRow) {
        discountRow.remove();
    }

    document.getElementById('checkoutTotalPago').textContent = totalPago.toFixed(2);
}

// Load coupons on modal open
document.addEventListener('DOMContentLoaded', loadCoupons);

// Get current user ID for coupon usage tracking
document.addEventListener('DOMContentLoaded', function() {
    fetch('/check-session')
        .then(res => res.json())
        .then(data => {
            if (data.ok && data.user_id) {
                window.currentUserId = data.user_id;
            }
        })
        .catch(err => console.warn('Could not get user session:', err));
});

function showAddAddressForm() {
    const nueva = document.getElementById('nuevaDireccionForm') || document.getElementById('addAddressForm') || document.getElementById('addAddressForm');
    if (nueva) {
        nueva.style.display = 'block';
    } else {
        console.warn('Formulario de nueva dirección no encontrado (expected id: nuevaDireccionForm or addAddressForm)');
    }
}

// Simulación de direcciones guardadas
function cargarDireccionesSimuladas() {
    const direcciones = [
        { id: 1, direccion: 'Av. Universidad 123', telefono: '4441234567' },
        { id: 2, direccion: 'Calle Real 456', telefono: '4447654321' }
    ];

    const select = document.getElementById('direccionSelect');
    select.innerHTML = '';

    direcciones.forEach(dir => {
        const option = document.createElement('option');
        option.value = dir.id;
        option.textContent = `${dir.direccion} (${dir.telefono})`;
        select.appendChild(option);
    });
}

// ========================
// Seleccionar dirección
// ========================
function selectAddress(element) {
    // Remove selected from previous cards safely
    const cards = document.querySelectorAll('.address-card');
    if (cards && cards.length) {
        cards.forEach(card => card.classList.remove('selected'));
    }

    if (!element) return;
    element.classList.add('selected');

    const isAddCard = element.classList && element.classList.contains('add');
    const addForm = document.getElementById('addAddressForm') || document.getElementById('nuevaDireccionForm');
    if (addForm) {
        addForm.style.display = isAddCard ? 'block' : 'none';
    }
}

// ========================
// CVargar direcciones desde backend
// ========================
let cachedAddresses = null;

// Lazy render the payment tab contents only when needed
function renderPaymentTabIfNeeded() {
    const tab = document.getElementById('tabMetodosPago');
    if (!tab) return;
    // If already rendered (has a payment-methods child), skip
    if (tab.querySelector('.payment-methods')) return;

    // Rendering payment tab content lazily

    tab.innerHTML = `
        <div class="payment-methods">
            <h3>Método de pago</h3>
            <div class="payment-option">
                <input type="radio" id="payCard" name="paymentMethod" value="card">
                <label for="payCard">Tarjeta de Crédito/Débito</label>
            </div>
            <div class="payment-option">
                <input type="radio" id="payTransfer" name="paymentMethod" value="transfer">
                <label for="payTransfer">Transferencia Bancaria</label>
            </div>
            <div class="payment-option">
                <input type="radio" id="payCash" name="paymentMethod" value="cash">
                <label for="payCash">Pago en Efectivo (contra entrega)</label>
            </div>
        </div>

        <div class="checkout-summary">
            <div class="summary-row"><span>Subtotal:</span><span id="checkoutSubtotalPago">$0.00</span></div>
            <div class="summary-row"><span>IVA (16%):</span><span id="checkoutIVAPago">$0.00</span></div>
            <div class="summary-row"><span>Envío:</span><span id="checkoutEnvioPago">$50.00</span></div>
            <div class="summary-row total"><span>Total:</span><span id="checkoutTotalPago">$0.00</span></div>
        </div>

        <div id="cardFormContainer" style="display: none; margin-top: 1rem;">
            <h4>Datos de la tarjeta</h4>
            <div id="card-element" style="padding: 1rem; border: 1px solid #ccc; border-radius: 6px;"></div>
            <div id="card-errors" style="color: red; margin-top: 0.5rem;"></div>
        </div>

        <div id="savedCardSummary" style="margin-top:0.8rem; display:none;">
            <div style="font-weight:700;">Tarjeta guardada:</div>
            <div id="savedCardDisplay" class="card-item" style="margin-top:0.4rem;">**** **** **** <span id="savedCardLast4">XXXX</span></div>
        </div>

        <div style="margin-top:1rem; display:flex; gap:0.5rem; align-items:center;">
            <input type="text" id="couponInput" placeholder="Ingresa código de cupón" style="flex:1; padding:0.5rem; border-radius:6px; border:1px solid #ccc;">
            <button id="applyCouponBtn" class="btn btn-secondary">Aplicar</button>
        </div>
        <div id="couponMessage" style="margin-top:0.5rem;color:#5c3a21; font-weight:600;"></div>

        <div id="couponLoadingModal" class="coupon-loading-overlay" style="display:none;">
            <div class="coupon-loading-box" style="max-width:220px; min-height:80px; align-items:center; justify-content:center; text-align:center;">
                <div style="font-size:1.1rem; color:#5c3a21;"><i class="fas fa-spinner fa-spin"></i> Verificando...</div>
            </div>
        </div>
    `;

    // Wire events for newly created controls
    const paymentRadios = tab.querySelectorAll('input[name="paymentMethod"]');
    if (paymentRadios && paymentRadios.length) {
        paymentRadios.forEach(r => r.addEventListener('change', () => {
            const cardForm = document.getElementById('cardFormContainer');
            const cardRow = document.getElementById('cardRow');
            const isCard = document.getElementById('payCard') && document.getElementById('payCard').checked;
            if (cardForm) cardForm.style.display = isCard ? 'block' : 'none';
            if (cardRow) cardRow.style.display = isCard ? 'flex' : 'none';
            if (isCard) setupStripeCardForm();
            else {
                const cardErrors = document.getElementById('card-errors');
                if (cardErrors) cardErrors.textContent = '';
            }
            // update confirm summary when changing method
            buildConfirmSummary();
        }));
    }

    // Show saved card if we have last4
    const savedSummary = document.getElementById('savedCardSummary');
    const savedDisplay = document.getElementById('savedCardDisplay');
    const savedLast4 = document.getElementById('savedCardLast4');
    if (savedSummary && savedDisplay && savedLast4) {
        const last4 = window.cardLast4 || null;
        if (last4 && last4 !== 'XXXX') {
            savedLast4.textContent = last4;
            savedSummary.style.display = 'block';
            savedDisplay.addEventListener('click', () => {
                const payCard = document.getElementById('payCard');
                if (payCard) {
                    payCard.checked = true;
                    const cardForm = document.getElementById('cardFormContainer');
                    if (cardForm) cardForm.style.display = 'block';
                    setupStripeCardForm();
                    buildConfirmSummary();
                }
            });
        } else {
            savedSummary.style.display = 'none';
        }
    }

    const applyBtn = document.getElementById('applyCouponBtn');
    if (applyBtn) applyBtn.addEventListener('click', () => {
        const code = (document.getElementById('couponInput') || { value: '' }).value.trim();
        applyBtn.disabled = true;
        validateAndApplyCoupon(code).finally(() => { applyBtn.disabled = false; recalcCheckoutTotals(); buildConfirmSummary(); });
    });
}

function getAddresses(force = false) {
    // Si ya hay direcciones en caché y no se fuerza recarga, usar las guardadas
    if (cachedAddresses && !force) {
        renderAddressCards(cachedAddresses);
        return;
    }

    fetch('/getAddresses')
        .then(res => res.json())
        .then(data => {
            const addresses = data.direcciones || [];

            // fetched addresses


            // Guardar en caché
            cachedAddresses = addresses;

            // Renderizar en DOM
            renderAddressCards(addresses);
        })
        .catch(err => {
            console.error('Error fetching addresses:', err);
            showNotification('No se pudieron cargar las direcciones.', 'error');
        });
}

function renderAddressCards(addresses) {
    const container = document.getElementById('addressList');
    container.innerHTML = '';

    const saved = document.createElement('div');
    saved.id = 'savedAddresses';
    // make saved addresses scrollable if many
    saved.style.maxHeight = '220px';
    saved.style.overflowY = 'auto';
    saved.style.paddingRight = '6px';

    if (addresses.length === 0) {
        saved.innerHTML = `
      <div class="no-address-message">
        <p><strong>No hay direcciones guardadas.</strong></p>
        <p>Agrega una nueva abajo.</p>
      </div>
      <hr>
    `;
    } else {
        addresses.forEach(addr => {
            const card = document.createElement('div');
            card.className = 'address-card';
            card.onclick = () => selectAddress(card);
            card.innerHTML = `
        <p><strong>${addr.alias || 'Dirección'}</strong></p>
        <p>${addr.calle}</p>
        <p>${addr.colonia}, ${addr.ciudad}, ${addr.estado}</p>
        <p>C.P. ${addr.cp}</p>
      `;
            saved.appendChild(card);
        });

        saved.appendChild(document.createElement('hr'));
    }

    container.appendChild(saved);

    const addCard = document.createElement('div');
    addCard.className = 'address-card add';
    addCard.onclick = () => selectAddress(addCard);
    addCard.innerHTML = `<p><strong>Agregar nueva dirección</strong></p>`;
    container.appendChild(addCard);
    // Ensure the add address form exists; if not, create it dynamically
    let form = document.getElementById('addAddressForm');
    if (!form) {
        form = document.createElement('div');
        form.id = 'addAddressForm';
        form.style.display = 'none';
        form.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="alias">Alias</label>
                    <input type="text" id="alias" name="alias" maxlength="50" required>
                </div>
                <div class="form-group">
                    <label for="postalCode">Código Postal</label>
                    <input type="text" id="postalCode" name="postalCode" maxlength="10" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="street">Calle</label>
                    <input type="text" id="street" name="street" maxlength="100" required>
                </div>
                <div class="form-group">
                    <label for="neighborhood">Colonia</label>
                    <input type="text" id="neighborhood" name="neighborhood" maxlength="100" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="city">Ciudad</label>
                    <input type="text" id="city" name="city" maxlength="100" required>
                </div>
                <div class="form-group">
                    <label for="state">Estado</label>
                    <input type="text" id="state" name="state" maxlength="100" required>
                </div>
            </div>
            <button type="button" onclick="submitNewAddress()" class="btn-confirm">Guardar dirección</button>
        `;
    }
    container.appendChild(form);
}






// ========================
// Enviar nueva dirección
// ========================
function submitNewAddress() {
    const payload = {
        alias: document.getElementById('alias').value.trim(),
        street: document.getElementById('street').value.trim(),
        neighborhood: document.getElementById('neighborhood').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        postalCode: document.getElementById('postalCode').value.trim()
    };

    // Validación básica
    for (const key in payload) {
        if (!payload[key]) {
            showNotification(`Please complete the field: ${key}`, 'warning');
            return;
        }
    }

    // Envío al backend (ruta correcta)
    fetch('/api/address/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (!data.ok) {
                showNotification(data.message || 'Error saving address', 'error');
                return;
            }

            showNotification('Dirección guardada correctamente!', 'success');
            document.getElementById('addAddressForm').style.display = 'none';
            // Recargar lista de direcciones automáticamente
            getAddresses(true); // true para forzar recarga
        })
        .catch(err => {
            console.error('Error:', err);
            showNotification('Could not save address.', 'error');
        });
}

function getSelectedPaymentMethod() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked');
    return selected ? selected.value : null;
}



// Llamar al abrir el modal


// ========================
// Test de Stripe
// ========================
let stripe, cardElement;

function setupStripeCardForm() {
    // setupStripeCardForm called; check if cardElement exists
    if (cardElement) return; // already mounted

    // Ensure Stripe.js is available. If not, wait for the script to load (or inject it).
    if (typeof Stripe === 'undefined') {
        const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
        if (existing) {
            // Stripe script already present, waiting load
            existing.addEventListener('load', setupStripeCardForm);
            return;
        }

        // Inject script and wait for it to load
        const s = document.createElement('script');
        s.src = 'https://js.stripe.com/v3/';
    s.onload = function(){ /* Stripe script injected and loaded */ setupStripeCardForm(); };
        document.head.appendChild(s);
        return;
    }

    // Make sure the card form container is visible so Stripe can mount properly
    const cardFormContainer = document.getElementById('cardFormContainer');
    if (cardFormContainer) cardFormContainer.style.display = 'block';

    try {
        stripe = Stripe('pk_test_51SJ5IND5jXc8vsskASQHUOlNCi1LBwPW7IuA9j4zf2LkgrTEdkhEPLsGAoApMhmefbN2NOwavsEzKv0jTqJzivOy00CS00jL4x'); // public key
        const elements = stripe.elements();
        cardElement = elements.create('card');
        cardElement.mount('#card-element');
    } catch (err) {
        console.error('Error initializing Stripe elements:', err);
    }
}

async function submitCheckout() {
    let confirmBtn = document.getElementById('confirmCheckoutBtn');
    // If confirm button is not present in DOM (we moved it to footer), try finalCheckoutBtn
    if (!confirmBtn) confirmBtn = document.getElementById('finalCheckoutBtn');
    const selectedPaymentInput = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedPaymentInput) {
        showNotification('Por favor selecciona un método de pago antes de finalizar.', 'warning');
        return;
    }
    const paymentMethod = selectedPaymentInput.value;

    // Mapeo de métodos a id_metodo_pago (según tu lista)
    const methodMap = {
        'card': 1,      // Tarjeta de Crédito
        'transfer': 4,  // Transferencia Bancaria
        'cash': 5       // Efectivo en Tienda
        // si más métodos: 'oxxo':6, 'spei':7, 'mercadopago':8, 'paypal':3
    };

    const total = parseFloat(document.getElementById('checkoutTotalPago').textContent) || 0;
    const amountInCents = Math.round(total * 100);

    // Mostrar loading en el botón y bloquear UI
    const originalBtnHtml = confirmBtn ? confirmBtn.innerHTML : '';
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    }
    showBlockingOverlay();

    try {
        const payload = { amount: amountInCents, method_id: methodMap[paymentMethod] || null };
        if (window.selectedCoupon) payload.cupon_id = window.selectedCoupon;
        const res = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        // Caso offline (pendiente)
        if (data && data.status === 'pendiente') {
            // Record coupon usage if payment was successful (even if pending)
            if (window.selectedCoupon) {
                try {
                    await fetch('/record-coupon-usage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: window.currentUserId || null,
                            coupon_id: window.selectedCoupon,
                            payment_id: data.payment_id || null
                        })
                    });
                } catch (e) {
                    console.warn('Error recording coupon usage:', e);
                }
            }

            showNotification('Pedido creado y pendiente de pago. Revisa las instrucciones para completar el pago.', 'info');
            // ocultar loading y cerrar modal(s)
            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = originalBtnHtml; }
            hideBlockingOverlay();
            if (data.closeModal) {
                // limpiar memoria local del carrito antes de cerrar
                clearCartNoRefresh();
                closeCheckoutModal();
                // persist empty cart to backend to avoid restore
                try { await persistCartToBackend(); } catch(e){/* ignore */}
                closeCart();
            }
            return;
        }

        // Para pagos con tarjeta: esperamos clientSecret y usar Stripe
        if (!data || !data.clientSecret) {
            showNotification('Error al crear el intento de pago', 'error');
            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = originalBtnHtml; }
            hideBlockingOverlay();
            return;
        }

        // If payment method is card, ensure Stripe and card element are ready
        if (paymentMethod === 'card') {
            if (!stripe || !cardElement) {
                showNotification('Formulario de tarjeta no inicializado', 'error');
                if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = originalBtnHtml; }
                hideBlockingOverlay();
                return;
            }
        }

        const result = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: { card: cardElement }
        });

        if (result.error) {
            // Pago fallido: quitar loading, mantener modal abierto
            const cardErrors = document.getElementById('card-errors');
            if (cardErrors) cardErrors.textContent = result.error.message || '';
            showNotification('Pago fallido: ' + (result.error.message || ''), 'error');
            if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = originalBtnHtml; }
            hideBlockingOverlay();
            return;
        }

        // Pago exitoso: Record coupon usage
        if (window.selectedCoupon) {
            try {
                const paymentIntentId = result.paymentIntent ? result.paymentIntent.id : null;
                await fetch('/record-coupon-usage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: window.currentUserId || null,
                        coupon_id: window.selectedCoupon,
                        payment_id: paymentIntentId
                    })
                });
            } catch (e) {
                console.warn('Error recording coupon usage:', e);
            }
        }

        // Pago exitoso: intentar extraer últimos 4 dígitos (si aplica)
        try {
            let last4 = 'XXXX';
            if (result && result.paymentIntent && result.paymentIntent.charges && result.paymentIntent.charges.data && result.paymentIntent.charges.data.length) {
                const charge = result.paymentIntent.charges.data[0];
                if (charge && charge.payment_method_details && charge.payment_method_details.card && charge.payment_method_details.card.last4) {
                    last4 = charge.payment_method_details.card.last4;
                }
            }
            window.cardLast4 = last4;
        } catch (e) {
            console.warn('No se pudo obtener last4 del paymentIntent', e);
            window.cardLast4 = window.cardLast4 || 'XXXX';
        }

        // Pago exitoso: quitar loading, cerrar modal(s)
        showNotification('Pago exitoso', 'success');
        if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = originalBtnHtml; }
        hideBlockingOverlay();
        if (data.closeModal) {
            // limpiar memoria local del carrito antes de cerrar
            clearCartNoRefresh();
            closeCheckoutModal();
            try { await persistCartToBackend(); } catch(e){/* ignore */}
            closeCart();
        }

        // actualizar la sección de confirmación con el last4
        buildConfirmSummary();

        // If payment tab is rendered, update saved card display
        try {
            const savedSummary = document.getElementById('savedCardSummary');
            const savedLast4 = document.getElementById('savedCardLast4');
            if (savedLast4) savedLast4.textContent = window.cardLast4 || 'XXXX';
            if (savedSummary && window.cardLast4 && window.cardLast4 !== 'XXXX') savedSummary.style.display = 'block';
        } catch (e) { /* ignore */ }

    } catch (err) {
        console.error('Error en checkout:', err);
        showNotification('Error procesando el pago. Intenta de nuevo.', 'error');
        if (confirmBtn) { confirmBtn.disabled = false; confirmBtn.innerHTML = originalBtnHtml; }
        hideBlockingOverlay();
    }
}





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

    // Wire payment method radio change handlers reliably
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    if (paymentRadios && paymentRadios.length) {
        paymentRadios.forEach(input => {
            input.addEventListener('change', () => {
                const cardForm = document.getElementById('cardFormContainer');
                const isCard = document.getElementById('payCard') && document.getElementById('payCard').checked;
                if (cardForm) cardForm.style.display = isCard ? 'block' : 'none';
                // If selecting card, initialize Stripe mount; if switching away, clear card errors
                if (isCard) {
                    setupStripeCardForm();
                } else {
                    const cardErrors = document.getElementById('card-errors');
                    if (cardErrors) cardErrors.textContent = '';
                }
                // Update card row visibility in confirm tab
                const cardRow = document.getElementById('cardRow');
                if (cardRow) cardRow.style.display = isCard ? 'flex' : 'none';
            });
        });
        // run once to set initial state
        const initialCardForm = document.getElementById('cardFormContainer');
        const initialCardRow = document.getElementById('cardRow');
        if (initialCardForm) {
            const isCard = document.getElementById('payCard') && document.getElementById('payCard').checked;
            initialCardForm.style.display = isCard ? 'block' : 'none';
            if (initialCardRow) initialCardRow.style.display = isCard ? 'flex' : 'none';
        }
    }

    // Footer finalize button
    const finalBtn = document.getElementById('finalCheckoutBtn');
    if (finalBtn) finalBtn.addEventListener('click', submitCheckout);

    // Load cart from localStorage first, then sync with server
    loadCartFromStorage();

    // Update UI with local cart data immediately
    renderCartItems(cart);
    updateCartTotal(cart);

    // Then sync with server in background
    updateCartUI();
});

// When checkout modal becomes the confirm tab, show final button and hide next
function updateFooterButtonsForTab() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    const tabs = Array.from(modal.querySelectorAll('.tab-panel'));
    const activeIndex = tabs.findIndex(t => t.classList.contains('active'));
    const footerNext = document.getElementById('nextCheckoutBtn');
    const finalBtn = document.getElementById('finalCheckoutBtn');
    if (activeIndex === tabs.length - 1) {
        if (footerNext) footerNext.style.display = 'none';
        if (finalBtn) finalBtn.style.display = '';
    } else {
        if (footerNext) footerNext.style.display = '';
        if (finalBtn) finalBtn.style.display = 'none';
    }
}

// Observe tab changes inside the modal to update footer
const modalTabContent = (document.getElementById('checkoutModal') || {}).querySelector ? document.getElementById('checkoutModal').querySelector('.tab-content') : null;
if (modalTabContent) {
    const mo = new MutationObserver(updateFooterButtonsForTab);
    mo.observe(modalTabContent, { subtree: true, attributes: true, childList: true });
}

// confirmCheckoutBtn listener is added inside DOMContentLoaded earlier if present


// Hacer funciones globales para los event handlers inline
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.checkout = checkout;
// window.processCheckout = processCheckout;
// window.finishCheckout = finishCheckout;

