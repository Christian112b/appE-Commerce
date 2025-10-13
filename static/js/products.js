// ========================
// Base de datos de productos
// ========================
let allProducts = []; // global para mantener los productos cargados
let currentLimit = 12;

// ========================
// Inicialización
// ========================
document.addEventListener('DOMContentLoaded', function () {
    fetchProducts();         // Cargar productos desde el servidor
    setupFilters();          // Inicializar filtros
    setupLoadMore();         // Inicializar botón "Cargar más"
    setupCategoryCards();    // Inicializar tarjetas de categoría
});

// ========================
// Función para obtener productos del servidor
// ========================
function fetchProducts() {
    fetch('/getProducts')
        .then(res => res.json())
        .then(data => {
            allProducts = data.productos ?? [];
            renderProducts('todos', currentLimit);
        });
}

// ========================
// Funcion para renderizar los productos
// ========================
function renderProducts(filter = 'todos', limit = 12) {
    const grid = document.getElementById('productosGrid');

    if (!grid) return;

    let products = allProducts;

    // Aplicar filtro
    if (filter !== 'todos') {
        products = allProducts.filter(p =>
            (p.categoria && p.categoria.toLowerCase() === filter.toLowerCase()) ||
            (p.imagen_base64 && p.imagen_base64.includes(filter))
        );
    }

    // Limitar productos mostrados
    const productsToShow = products.slice(0, limit);

    // Renderizar productos
    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-category="${product.categoria || 'chocolates'}">
            <div class="product-image">
                <img src="${product.imagen_base64 
                    ? `data:image/jpeg;base64,${product.imagen_base64}` 
                    : 'placeholder.jpg'}" 
                    alt="${product.nombre}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn-icon add-to-cart" 
                            data-id="${product.id_producto}" 
                            data-name="${product.nombre}" 
                            data-price="${product.precio_unitario}" 
                            data-image="${product.imagen_base64}">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.nombre}</h3>
                <p>${product.descripcion}</p>
                <div class="product-price">$${parseFloat(product.precio_unitario).toFixed(2)}</div>
            </div>
        </div>
    `).join('');

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = products.length > limit ? 'block' : 'none';
    }

    attachAddToCartListeners();
    animateProducts();
}




function animateProducts() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function attachAddToCartListeners() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const product = {
                id: parseInt(this.dataset.id),
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image,
                quantity: 1
            };
            addToCart(product);
        });
    });
}

// ========================
// Filtros de productos
// ========================
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remover clase active de todos
            filterBtns.forEach(b => b.classList.remove('active'));
            // Agregar clase active al clickeado
            this.classList.add('active');

            // Obtener filtro
            currentFilter = this.dataset.filter;
            displayedProducts = 12;

            // Renderizar productos filtrados
            renderProducts(currentFilter, displayedProducts);
        });
    });
}

// ========================
// Cargar más productos
// ========================
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            displayedProducts += 12;
            renderProducts(currentFilter, displayedProducts);
        });
    }
}

// ========================
// Categorías clickeables
// ========================
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function () {
            const category = this.dataset.category;

            // Navegar a la sección de productos
            document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });

            // Aplicar filtro después de un delay
            setTimeout(() => {
                const filterBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
                if (filterBtn) {
                    filterBtn.click();
                }
            }, 800);
        });
    });
}

// ========================
// Notificación
// ========================
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #8B4513, #D2691E);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(139, 69, 19, 0.3);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}



// Agregar estilos para las animaciones de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

