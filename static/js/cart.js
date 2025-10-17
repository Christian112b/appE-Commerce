// ========================
// Carrito de Compras
// ========================

// Estado del carrito (se guarda en localStorage)
let cart = []

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

        // Guardar cart en backend
        persistCartToBackend();
    }
}

function persistCartToBackend() {
    fetch('/saveCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.ok) {
                showNotification('No se pudo guardar el carrito.', 'error');
            }
        })
        .catch(err => {
            console.error('Error al guardar el carrito:', err);
        });
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

            cart = items;

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

// ========================
// Agregar uno de producto al carrito
// ========================
function updateQuantity(idProducto, delta) {
    const index = cart.findIndex(p => p.id === idProducto);
    if (index === -1) return;

    cart[index].quantity += delta;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    renderCartItems(cart);
    updateCartTotal(cart);
}

// ========================
// Borrar producto de carrito
// ========================
function removeFromCart(idProducto) {
    const index = cart.findIndex(p => p.id === idProducto);
    if (index === -1) return;

    cart.splice(index, 1); // elimina el producto del array

    renderCartItems(cart);
    updateCartTotal(cart);
}

// // ========================
// // Checkout
// // ========================
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }

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


    document.getElementById('checkoutModal').classList.add('active');
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

function showTab(index) {
    const tabs = document.querySelectorAll('.tab-panel');
    const buttons = document.querySelectorAll('.tab-btn');

    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
        buttons[i].classList.toggle('active', i === index);
    });

    if (index === 2) setupStripeCardForm();
}

function showAddAddressForm() {
    document.getElementById('nuevaDireccionForm').style.display = 'block';
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
    document.querySelectorAll('.address-card').forEach(card => {
        card.classList.remove('selected');
    });

    element.classList.add('selected');

    const isAddCard = element.classList.contains('add');
    document.getElementById('addAddressForm').style.display = isAddCard ? 'block' : 'none';
}

// ========================
// CVargar direcciones desde backend
// ========================
let cachedAddresses = null;

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

            console.log('Fetched addresses:', addresses);


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

    const form = document.getElementById('addAddressForm');
    if (form) {
        container.appendChild(form);
    } else {
        console.warn('Formulario de dirección no encontrado');
    }
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

    // Envío al backend (ajusta la ruta según tu estructura)
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

            showNotification('Address saved successfully!', 'success');
            document.getElementById('addAddressForm').style.display = 'none';
            // Opcional: recargar lista de direcciones
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
  if (cardElement) return; // ya montado

  stripe = Stripe('pk_test_51SJ5IND5jXc8vsskASQHUOlNCi1LBwPW7IuA9j4zf2LkgrTEdkhEPLsGAoApMhmefbN2NOwavsEzKv0jTqJzivOy00CS00jL4x'); // tu clave pública
  const elements = stripe.elements();
  cardElement = elements.create('card');
  cardElement.mount('#card-element');
}

async function submitCheckout() {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

  if (paymentMethod !== 'card') {
    showNotification('Método de pago no implementado aún', 'warning');
    return;
  }

  const total = parseFloat(document.getElementById('checkoutTotalPago').textContent) || 0;
  const amountInCents = Math.round(total * 100);

  console.log('Creando intento de pago:', amountInCents);

  const res = await fetch('/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountInCents })
  });

  const data = await res.json();
  if (!data.clientSecret) {
    showNotification('Error al crear el intento de pago', 'error');
    return;
  }

  const result = await stripe.confirmCardPayment(data.clientSecret, {
    payment_method: {
      card: cardElement
    }
  });

  if (result.error) {
    document.getElementById('card-errors').textContent = result.error.message;
    showNotification('Pago fallido: ' + result.error.message, 'error');
  } else {
    showNotification('Pago exitoso', 'success');
    // Aquí puedes guardar el pedido en tu base de datos
    console.log('ID del pago:', result.paymentIntent.id);
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

    // Cargar carrito inicial
    updateCartUI();
});

document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
  input.addEventListener('change', () => {
    const isCardSelected = document.getElementById('payCard').checked;
    const cardForm = document.getElementById('cardFormContainer');
    if (cardForm) {
      cardForm.style.display = isCardSelected ? 'block' : 'none';
    }
  });
});

document.getElementById('confirmCheckoutBtn').addEventListener('click', submitCheckout);


// Hacer funciones globales para los event handlers inline
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.checkout = checkout;
// window.processCheckout = processCheckout;
// window.finishCheckout = finishCheckout;

