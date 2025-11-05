# MANUAL DEL DESARROLLADOR FRONTEND
## Chocolates Costanzo - Plataforma E-Commerce

**Proyecto:** Sistema de E-Commerce para Chocolates Costanzo  
**Institución:** Universidad Politécnica de San Luis Potosí  
**Versión:** 1.5.0  
**Fecha:** Octubre 2025  
**Equipo de Desarrollo:** Estudiantes UPSLP - Proyecto Gaman

---

## ÍNDICE

1. Introducción y Arquitectura
2. Estructura del Proyecto Frontend
3. Tecnologías y Dependencias
4. Componentes Principales
5. Sistema de Navegación
6. Sistema de Productos y Búsqueda
7. Carrito de Compras
8. Chatbot Inteligente
9. Sistema de Historia Interactiva
10. Estilos y Diseño Responsivo
11. Flujo de Datos y Estado
12. Glosario Técnico
13. Guía de Extensión y Mantenimiento

---

## 1. INTRODUCCIÓN Y ARQUITECTURA

### Visión General del Sistema

El frontend de Chocolates Costanzo es una aplicación web moderna desarrollada con HTML5, CSS3 y JavaScript vanilla (sin frameworks). La arquitectura sigue el patrón de separación de responsabilidades con módulos independientes para cada funcionalidad.

### Principios de Diseño

- **Mobile-First:** Diseño responsivo que prioriza dispositivos móviles
- **Progressive Enhancement:** Funcionalidades que mejoran según capacidades del navegador
- **Modularidad:** Código organizado en módulos reutilizables
- **Accesibilidad:** Cumplimiento de estándares WCAG 2.1
- **Performance:** Optimización de carga y renderizado

### Arquitectura de Componentes

```
┌─────────────────────────────────────────────────┐
│           INTERFAZ DE USUARIO (UI)              │
├─────────────────────────────────────────────────┤
│  Navegación │ Hero │ Productos │ Carrito │ FAQ  │
├─────────────────────────────────────────────────┤
│              CAPA DE LÓGICA (JS)                │
├─────────────────────────────────────────────────┤
│  products.js │ cart.js │ chatbot.js │ main.js  │
├─────────────────────────────────────────────────┤
│            CAPA DE PRESENTACIÓN (CSS)           │
├─────────────────────────────────────────────────┤
│         styles.css (Variables + Módulos)        │
└─────────────────────────────────────────────────┘
```

---

## 2. ESTRUCTURA DEL PROYECTO FRONTEND

### Árbol de Directorios

```
Comercio-pagweb/
│
├── index.html                 # Página principal
│
├── css/
│   └── styles.css            # Estilos globales y componentes
│
├── js/
│   ├── main.js               # Lógica principal y navegación
│   ├── products.js           # Sistema de productos y búsqueda
│   ├── cart.js               # Carrito de compras
│   ├── chatbot.js            # Chatbot interactivo
│   ├── video.js              # Control de video
│   ├── promociones.js        # Banner de promociones
│   └── historia.js           # Carrusel de historia
│
├── img/                      # Banco de imágenes
│   ├── Caramelos, chiclosos, jaleas y gomitas/
│   ├── Chocolates envueltos, sin envolver y semillas cubiertas/
│   ├── Piezas, Presentaciones, Tablillas y Bolsas/
│   ├── Temporalidades/
│   ├── costanzo.png
│   └── [otras imágenes]
│
└── admin/                    # Panel administrativo
    ├── dashboard.html
    ├── login.html
    └── [archivos admin]
```

### Responsabilidades de Archivos

**index.html**
- Estructura semántica de la página
- Definición de secciones y componentes
- Referencias a recursos externos

**css/styles.css**
- Variables CSS customizadas
- Estilos de componentes
- Media queries para responsividad
- Animaciones y transiciones

**js/main.js**
- Inicialización de la aplicación
- Manejo de navegación
- Control del menú hamburguesa
- Slider del hero
- FAQ accordion
- Formulario de contacto

**js/products.js**
- Base de datos de productos
- Sistema de filtrado por categoría
- Motor de búsqueda
- Renderizado dinámico de productos
- Paginación (load more)

**js/cart.js**
- Estado del carrito
- Operaciones CRUD del carrito
- Cálculo de totales e IVA
- Persistencia en localStorage
- UI del sidebar del carrito

**js/chatbot.js**
- Lógica conversacional
- Integración con API de Mem0
- Manejo de contexto
- UI del chatbot

---

## 3. TECNOLOGÍAS Y DEPENDENCIAS

### Tecnologías Core

**HTML5**
- Elementos semánticos (section, nav, article, etc.)
- Atributos de accesibilidad (ARIA)
- Lazy loading de imágenes
- Formularios validados

**CSS3**
- Custom Properties (Variables CSS)
- Flexbox y CSS Grid
- Animaciones y transformaciones
- Media Queries
- Gradientes lineales

**JavaScript ES6+**
- Arrow functions
- Template literals
- Destructuring
- Promises y Async/Await
- Modules pattern
- Array methods (map, filter, reduce)
- Event delegation
- LocalStorage API

### Librerías Externas

**Font Awesome 6.4.0**
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```
Uso: Iconografía en toda la aplicación

**Google Fonts**
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
- Playfair Display: Títulos y elementos destacados
- Poppins: Texto general y UI

**Mem0 API** (Chatbot)
- URL: https://api.mem0.ai/v1/
- Propósito: Memoria persistente para chatbot
- Autenticación: API Key

---

## 4. COMPONENTES PRINCIPALES

### 4.1 Sistema de Navegación

**Ubicación:** index.html (líneas 14-47) + js/main.js

**Funcionalidad:**
La barra de navegación es un componente sticky que permanece visible al hacer scroll. Incluye:
- Logo responsive
- Menú de navegación
- Contador de carrito
- Enlace a panel admin
- Menú hamburguesa (mobile)

**Código Clave:**

```javascript
// Navegación sticky
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});
```

**Estados:**
- Normal: Fondo blanco, sombra suave
- Scrolled: Fondo semi-transparente, sombra prominente
- Mobile: Menu desplegable lateral

**CSS Relevante:**
```css
.navbar {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    transition: all 0.3s ease;
}
```

---

### 4.2 Hero Slider

**Ubicación:** index.html (líneas 49-82) + js/main.js

**Descripción:**
Carrusel automático de 3 slides con imágenes de fondo, títulos animados y CTAs.

**Características:**
- Auto-play cada 5 segundos
- Controles manuales (prev/next)
- Indicadores de posición
- Transiciones suaves
- Pausable al hover

**Estructura de Datos:**
```javascript
const heroSlides = [
    {
        image: 'img/productos.jpg',
        title: 'Tradición y Frescura',
        subtitle: '92 años llevando sabor desde San Luis Potosí',
        cta: 'Explorar Productos'
    },
    // ... más slides
];
```

**Lógica Principal:**
```javascript
function nextSlide() {
    slides[currentSlide].classList.remove('active');
    indicators[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}
```

---

### 4.3 Sistema de Categorías

**Ubicación:** index.html (líneas 84-119)

**Funcionalidad:**
Tarjetas interactivas que filtran productos al hacer click.

**Categorías:**
1. Chocolates Envueltos
2. Caramelos y Gomitas
3. Presentaciones y Bolsas
4. Temporalidades

**Interacción:**
Al hacer click en una categoría:
1. Scroll suave a sección de productos
2. Activación del filtro correspondiente
3. Renderizado de productos filtrados

**Código:**
```javascript
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                const filterBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
                if (filterBtn) filterBtn.click();
            }, 800);
        });
    });
}
```

---

## 5. SISTEMA DE NAVEGACIÓN

### Scroll Suave

Implementado mediante:
```css
html {
    scroll-behavior: smooth;
}
```

### Active Link Tracking

El sistema detecta la sección visible y marca el enlace correspondiente:

```javascript
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});
```

### Menú Hamburguesa (Mobile)

**Toggle:**
```javascript
hamburger.addEventListener('click', function() {
    this.classList.toggle('active');
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
});
```

**Cierre automático al click:**
```javascript
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
    });
});
```

---

## 6. SISTEMA DE PRODUCTOS Y BÚSQUEDA

### 6.1 Base de Datos de Productos

**Estructura:**
```javascript
const productsDatabase = {
    chocolates: [
        {
            id: 9,
            name: 'Almendra con Chocolate',
            description: 'Deliciosa almendra cubierta de chocolate',
            price: 38.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos.../Almendra-Con-Chocolate.jpg'
        },
        // ... más productos
    ],
    caramelos: [...],
    presentaciones: [...],
    temporalidades: [...]
};
```

**Total de Productos:** 76 productos únicos + 8 favoritos

### 6.2 Motor de Búsqueda

**Características:**
- Búsqueda en tiempo real con debounce (300ms)
- Búsqueda por nombre y descripción
- Case-insensitive
- Combinable con filtros de categoría
- Botón de limpieza rápida

**Implementación:**

```javascript
let searchQuery = '';

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchQuery = this.value;
        
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        
        searchTimeout = setTimeout(() => {
            displayedProducts = 12;
            renderProducts(currentFilter, displayedProducts, searchQuery);
        }, 300);
    });
}
```

**Lógica de Filtrado:**
```javascript
function renderProducts(filter = 'todos', limit = 12, search = '') {
    let products = allProducts;
    
    // Búsqueda por texto
    if (search.trim() !== '') {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            p.description.toLowerCase().includes(searchLower)
        );
    }
    
    // Filtro por categoría
    if (filter !== 'todos') {
        products = products.filter(p => p.category === filter);
    }
    
    // Renderizar...
}
```

### 6.3 Sistema de Filtros

**Filtros Disponibles:**
- Todos
- Chocolates
- Caramelos
- Presentaciones
- Temporalidades

**Interacción:**
```javascript
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            displayedProducts = 12;
            renderProducts(currentFilter, displayedProducts, searchQuery);
        });
    });
}
```

### 6.4 Renderizado Dinámico

**Proceso:**
1. Filtrar productos según criterios
2. Limitar a productos visibles
3. Generar HTML dinámicamente
4. Insertar en el DOM
5. Adjuntar event listeners
6. Animar entrada

**Template de Producto:**
```javascript
grid.innerHTML = productsToShow.map(product => `
    <div class="product-card" data-category="${product.category}">
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <div class="product-overlay">
                <button class="btn-icon add-to-cart" 
                        data-id="${product.id}" 
                        data-name="${product.name}" 
                        data-price="${product.price}" 
                        data-image="${product.image}">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
    </div>
`).join('');
```

### 6.5 Paginación (Load More)

**Funcionamiento:**
- Muestra 12 productos inicialmente
- Botón "Cargar Más" agrega 12 productos adicionales
- Se oculta cuando no hay más productos

```javascript
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.addEventListener('click', function() {
        displayedProducts += 12;
        renderProducts(currentFilter, displayedProducts, searchQuery);
    });
}
```

### 6.6 Animaciones de Productos

**Entrada escalonada:**
```javascript
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
```

---

## 7. CARRITO DE COMPRAS

### 7.1 Arquitectura del Carrito

**Estado Global:**
```javascript
let cart = [];
```

**Estructura de Item:**
```javascript
{
    id: 1,
    name: "Tornillo",
    price: 25.00,
    image: "img/.../02Tornillo.jpg",
    quantity: 2
}
```

### 7.2 Operaciones CRUD

**Agregar Producto:**
```javascript
function addToCart(product) {
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    updateCart();
    saveCart();
}
```

**Actualizar Cantidad:**
```javascript
function updateQuantity(productId, change) {
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity += change;
        if (product.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
            saveCart();
        }
    }
}
```

**Eliminar Producto:**
```javascript
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveCart();
}
```

**Vaciar Carrito:**
```javascript
function clearCart() {
    cart = [];
    updateCart();
    saveCart();
}
```

### 7.3 Cálculos Financieros

**Subtotal:**
```javascript
function calculateSubtotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}
```

**IVA (16%):**
```javascript
function calculateIVA() {
    return calculateSubtotal() * 0.16;
}
```

**Total:**
```javascript
function calculateTotal() {
    return calculateSubtotal() + calculateIVA();
}
```

### 7.4 Persistencia (LocalStorage)

**Guardar:**
```javascript
function saveCart() {
    localStorage.setItem('chocolatesCostanzoCart', JSON.stringify(cart));
}
```

**Cargar:**
```javascript
function loadCart() {
    const savedCart = localStorage.getItem('chocolatesCostanzoCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}
```

### 7.5 UI del Carrito

**Sidebar Toggle:**
```javascript
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}
```

**Renderizado de Items:**
```javascript
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
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
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}
```

### 7.6 Contador de Badge

**Actualización:**
```javascript
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}
```

---

## 8. CHATBOT INTELIGENTE

### 8.1 Arquitectura del Chatbot

**Componentes:**
- UI flotante (botón + ventana)
- Sistema de mensajes
- Integración con Mem0 API
- Sugerencias predefinidas
- Indicador de escritura

### 8.2 Integración con Mem0

**Configuración:**
```javascript
const MEM0_API_KEY = 'tu-api-key';
const MEM0_API_URL = 'https://api.mem0.ai/v1/';
const USER_ID = 'user_chocolates_costanzo';
```

**Envío de Mensaje:**
```javascript
async function sendMessageToMem0(message) {
    try {
        const response = await fetch(`${MEM0_API_URL}chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${MEM0_API_KEY}`
            },
            body: JSON.stringify({
                messages: [{
                    role: "user",
                    content: message
                }],
                user_id: USER_ID
            })
        });
        
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error:', error);
        return "Lo siento, no pude procesar tu mensaje.";
    }
}
```

### 8.3 UI del Chatbot

**Toggle Ventana:**
```javascript
function toggleChatbot() {
    const chatbotWindow = document.querySelector('.chatbot-window');
    const chatbotButton = document.querySelector('.chatbot-button');
    
    chatbotWindow.classList.toggle('active');
    chatbotButton.classList.toggle('hidden');
}
```

**Agregar Mensaje:**
```javascript
function addMessage(message, isUser = false) {
    const messagesContainer = document.querySelector('.chatbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `chatbot-message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const time = new Date().toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
        ${!isUser ? '<div class="message-avatar"><i class="fas fa-robot"></i></div>' : ''}
        <div class="message-content">
            <div class="message-text">${message}</div>
            <div class="message-time">${time}</div>
        </div>
        ${isUser ? '<div class="message-avatar"><i class="fas fa-user"></i></div>' : ''}
    `;
    
    messagesContainer.appendChild(messageElement);
    setTimeout(() => messageElement.style.opacity = '1', 100);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
```

### 8.4 Sugerencias Rápidas

**Implementación:**
```javascript
const quickSuggestions = [
    "¿Qué productos tienen?",
    "¿Cuánto cuesta el envío?",
    "¿Tienen promociones?",
    "¿Dónde están ubicados?"
];

function createSuggestions() {
    const suggestionsContainer = document.querySelector('.chatbot-suggestions');
    suggestionsContainer.innerHTML = quickSuggestions.map(suggestion => `
        <button class="suggestion-btn" onclick="sendSuggestion('${suggestion}')">
            ${suggestion}
        </button>
    `).join('');
}
```

---

## 9. SISTEMA DE HISTORIA INTERACTIVA

### 9.1 Carrusel de Historia

**Slides:**
- Los Orígenes (1920-1930)
- Expansión (1935)
- Continuidad Familiar (1966)
- Nueva Alianza (1993)
- Franquicias (2014)
- Nueva Planta (2020)
- Presente (Hoy)

**Navegación:**
```javascript
let currentHistoriaSlide = 0;
const historiaSlides = document.querySelectorAll('.historia-slide');
const indicators = document.querySelectorAll('.indicator');

function showHistoriaSlide(index) {
    historiaSlides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    historiaSlides[index].classList.add('active');
    indicators[index].classList.add('active');
}

function nextHistoriaSlide() {
    currentHistoriaSlide = (currentHistoriaSlide + 1) % historiaSlides.length;
    showHistoriaSlide(currentHistoriaSlide);
}

function prevHistoriaSlide() {
    currentHistoriaSlide = (currentHistoriaSlide - 1 + historiaSlides.length) % historiaSlides.length;
    showHistoriaSlide(currentHistoriaSlide);
}
```

**Indicadores Clickeables:**
```javascript
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        currentHistoriaSlide = index;
        showHistoriaSlide(index);
    });
});
```

---

## 10. ESTILOS Y DISEÑO RESPONSIVO

### 10.1 Sistema de Variables CSS

**Paleta de Colores:**
```css
:root {
    --color-primary: #8B4513;        /* Café chocolate */
    --color-secondary: #D2691E;      /* Café claro */
    --color-accent: #FF8C00;         /* Naranja vibrante */
    --color-warm: #FFB347;           /* Naranja cálido */
    --color-golden: #DAA520;         /* Dorado */
    --color-red: #CD5C5C;            /* Rojo suave */
    --color-dark-brown: #5C4033;     /* Café oscuro */
    --color-light-cream: #FFF8DC;    /* Crema claro */
}
```

**Espaciado:**
```css
:root {
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 2rem;
    --spacing-lg: 4rem;
    --spacing-xl: 6rem;
}
```

**Sombras:**
```css
:root {
    --shadow-sm: 0 2px 8px rgba(139, 69, 19, 0.1);
    --shadow-md: 0 4px 16px rgba(139, 69, 19, 0.15);
    --shadow-lg: 0 8px 32px rgba(139, 69, 19, 0.2);
}
```

### 10.2 Breakpoints Responsivos

**Mobile First:**
```css
/* Mobile: < 768px (default) */

/* Tablet: 768px - 1024px */
@media (max-width: 1024px) {
    .historia-content {
        grid-template-columns: 1fr;
    }
}

/* Mobile: < 768px */
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        flex-direction: column;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
}

/* Small Mobile: < 480px */
@media (max-width: 480px) {
    .hero-title {
        font-size: 2rem;
    }
    
    .btn {
        padding: 0.75rem 1.5rem;
    }
}
```

### 10.3 Animaciones Globales

**Fade In:**
```css
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 1s ease-out;
}
```

**Slide In:**
```css
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
```

### 10.4 Utilidades de Diseño

**Botones:**
```css
.btn-primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: var(--color-white);
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
```

**Cards:**
```css
.product-card:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-lg);
}
```

---

## 11. FLUJO DE DATOS Y ESTADO

### 11.1 Diagrama de Flujo General

```
Usuario Interactúa
       │
       ├─► Navega Secciones
       │   └─► Scroll Tracking → Active Link Update
       │
       ├─► Busca Productos
       │   └─► Input Event → Debounce → Filter → Render
       │
       ├─► Filtra Categoría
       │   └─► Click Event → Update Filter → Render
       │
       ├─► Agrega al Carrito
       │   └─► Click → Add to Cart → Update UI → Save LocalStorage
       │
       └─► Usa Chatbot
           └─► Send Message → API Call → Display Response
```

### 11.2 Estado de la Aplicación

**Variables Globales:**
```javascript
// Navegación
let currentSlide = 0;
let currentHistoriaSlide = 0;

// Productos
let currentFilter = 'todos';
let displayedProducts = 12;
let searchQuery = '';

// Carrito
let cart = [];

// Chatbot
let chatHistory = [];
```

### 11.3 Ciclo de Vida de Eventos

**Inicialización:**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // 1. Cargar carrito desde localStorage
    loadCart();
    
    // 2. Inicializar componentes
    initHeroSlider();
    setupNavigation();
    renderProducts();
    setupFilters();
    setupSearch();
    setupCategoryCards();
    
    // 3. Inicializar chatbot
    initChatbot();
    
    // 4. Setup event listeners
    setupEventListeners();
});
```

---

## 12. GLOSARIO TÉCNICO

### Términos Frontend

**SPA (Single Page Application)**
Aplicación web que carga una única página HTML y actualiza dinámicamente el contenido sin recargar la página completa.

**Lazy Loading**
Técnica de optimización que retrasa la carga de recursos no críticos hasta que sean necesarios.

**Debounce**
Patrón que limita la frecuencia con la que se ejecuta una función, esperando a que termine la actividad del usuario.

**Event Delegation**
Patrón que adjunta un único event listener a un elemento padre en lugar de múltiples listeners a elementos hijos.

**LocalStorage**
API del navegador que permite almacenar datos de forma persistente en el cliente (hasta 5-10MB).

**CSS Custom Properties (Variables CSS)**
Variables nativas de CSS que permiten reutilizar valores en toda la hoja de estilos.

**Flexbox**
Modelo de layout CSS para diseñar interfaces flexibles en una dimensión.

**CSS Grid**
Modelo de layout CSS para crear layouts bidimensionales complejos.

**Media Query**
Regla CSS que aplica estilos basados en características del dispositivo (ancho, orientación, etc.).

**Semantic HTML**
Uso de elementos HTML que describen su significado (section, article, nav, etc.).

**ARIA (Accessible Rich Internet Applications)**
Especificación para mejorar la accesibilidad de aplicaciones web.

**Template Literal**
Strings de JavaScript que permiten interpolación de expresiones usando ${}.

**Arrow Function**
Sintaxis compacta de función en JavaScript (=>) que mantiene el contexto de this.

**Promise**
Objeto JavaScript que representa la eventual completación o falla de una operación asíncrona.

**Async/Await**
Sintaxis para trabajar con Promises de forma más legible y sincrónica.

**Destructuring**
Sintaxis JavaScript para extraer valores de arrays u objetos en variables distintas.

**Spread Operator**
Operador (...) que expande elementos de un iterable.

**Module Pattern**
Patrón de diseño que encapsula código relacionado en un módulo independiente.

---

## 13. GUÍA DE EXTENSIÓN Y MANTENIMIENTO

### 13.1 Agregar Nuevos Productos

**Paso 1:** Agregar imágenes
```
img/[categoria]/nombre-producto.jpg
```

**Paso 2:** Actualizar base de datos en products.js
```javascript
productsDatabase.chocolates.push({
    id: 77,  // ID único incremental
    name: 'Nuevo Chocolate',
    description: 'Descripción del producto',
    price: 45.00,
    category: 'chocolates',
    image: 'img/Chocolates envueltos.../Nuevo-Chocolate.jpg'
});
```

**Paso 3:** Guardar y probar

### 13.2 Agregar Nueva Categoría

**Paso 1:** Crear carpeta de imágenes
```
img/Nueva Categoria/
```

**Paso 2:** Agregar en productsDatabase
```javascript
const productsDatabase = {
    // ... categorías existentes
    nuevaCategoria: [
        {
            id: 100,
            name: 'Producto 1',
            description: 'Descripción',
            price: 50.00,
            category: 'nuevaCategoria',
            image: 'img/Nueva Categoria/producto1.jpg'
        }
    ]
};
```

**Paso 3:** Actualizar allProducts
```javascript
const allProducts = [
    ...favoritosProducts,
    ...productsDatabase.chocolates,
    ...productsDatabase.caramelos,
    ...productsDatabase.presentaciones,
    ...productsDatabase.temporalidades,
    ...productsDatabase.nuevaCategoria  // Agregar aquí
];
```

**Paso 4:** Agregar filtro en HTML
```html
<button class="filter-btn" data-filter="nuevaCategoria">Nueva Categoría</button>
```

**Paso 5:** Agregar tarjeta de categoría
```html
<div class="category-card" data-category="nuevaCategoria">
    <div class="category-icon">
        <i class="fas fa-[icono]"></i>
    </div>
    <h3>Nueva Categoría</h3>
    <p>Descripción de la categoría</p>
</div>
```

### 13.3 Modificar Estilos

**Cambiar colores:**
```css
:root {
    --color-primary: #NUEVO_COLOR;
}
```
Todos los componentes se actualizarán automáticamente.

**Agregar nuevas animaciones:**
```css
@keyframes miAnimacion {
    from { /* estado inicial */ }
    to { /* estado final */ }
}

.mi-elemento {
    animation: miAnimacion 1s ease-in-out;
}
```

### 13.4 Agregar Nuevas Secciones

**Paso 1:** Crear HTML
```html
<section class="mi-seccion" id="mi-seccion">
    <div class="container">
        <h2 class="section-title">Mi Nueva Sección</h2>
        <!-- Contenido -->
    </div>
</section>
```

**Paso 2:** Agregar al menú
```html
<li><a href="#mi-seccion" class="nav-link">Mi Sección</a></li>
```

**Paso 3:** Agregar estilos
```css
.mi-seccion {
    padding: var(--spacing-lg) 0;
    background: var(--color-white);
}
```

**Paso 4:** Agregar funcionalidad (opcional)
```javascript
function setupMiSeccion() {
    // Lógica específica
}

// En DOMContentLoaded
setupMiSeccion();
```

### 13.5 Optimización de Performance

**Imágenes:**
- Usar formatos modernos (WebP)
- Comprimir imágenes (TinyPNG, ImageOptim)
- Implementar lazy loading
- Usar dimensiones apropiadas

**JavaScript:**
- Minimizar manipulación del DOM
- Usar event delegation
- Implementar debounce/throttle
- Evitar loops innecesarios

**CSS:**
- Minimizar selectores complejos
- Usar CSS Grid/Flexbox en lugar de floats
- Evitar !important
- Agrupar reglas similares

### 13.6 Debugging

**Console Logging:**
```javascript
console.log('Variable:', variable);
console.table(array);
console.error('Error:', error);
```

**Breakpoints:**
```javascript
debugger; // Pausa la ejecución
```

**Network Tab:**
Monitorear llamadas API y carga de recursos

**Performance Tab:**
Identificar cuellos de botella de rendimiento

### 13.7 Testing Manual

**Checklist:**
- [ ] Navegación funciona en todas las secciones
- [ ] Búsqueda retorna resultados correctos
- [ ] Filtros funcionan individualmente y combinados
- [ ] Carrito agrega/elimina/actualiza correctamente
- [ ] LocalStorage persiste entre sesiones
- [ ] Responsive en mobile, tablet, desktop
- [ ] Chatbot responde apropiadamente
- [ ] Formularios validan correctamente
- [ ] Animaciones fluidas sin lag
- [ ] Sin errores en consola

### 13.8 Mejores Prácticas

**Nomenclatura:**
- Variables: camelCase (productName)
- Constantes: UPPER_SNAKE_CASE (API_KEY)
- Funciones: camelCase verbos (getUserData)
- Clases CSS: kebab-case (product-card)
- IDs: camelCase (productGrid)

**Comentarios:**
```javascript
// Comentario de línea simple

/**
 * Comentario de bloque
 * Descripción de función compleja
 * @param {string} name - Nombre del usuario
 * @returns {object} Datos del usuario
 */
function getUserData(name) {
    // ...
}
```

**Estructura de Código:**
```javascript
// ========================
// Nombre del Módulo
// ========================

// Variables y constantes

// Funciones principales

// Event listeners

// Inicialización
```

---

## ANEXOS

### A. Estructura Completa de Archivos

```
index.html                      # 738 líneas
css/styles.css                  # 2354 líneas
js/main.js                      # ~400 líneas
js/products.js                  # 890 líneas
js/cart.js                      # ~300 líneas
js/chatbot.js                   # ~250 líneas
js/historia.js                  # ~150 líneas
js/promociones.js               # ~100 líneas
js/video.js                     # ~50 líneas
```

### B. Métricas del Proyecto

- **Total de archivos frontend:** 12
- **Total de líneas de código:** ~5,232
- **Productos en base de datos:** 76
- **Categorías:** 4
- **Secciones principales:** 10
- **Archivos de imagen:** 76+
- **Breakpoints responsive:** 3

### C. Recursos Externos

**CDNs:**
- Font Awesome 6.4.0
- Google Fonts (Playfair Display, Poppins)

**APIs:**
- Mem0 API (Chatbot)

### D. Compatibilidad de Navegadores

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

**Características modernas usadas:**
- CSS Grid
- CSS Variables
- Flexbox
- ES6+ (Arrow Functions, Template Literals)
- Async/Await
- LocalStorage

---

## CONTACTO Y SOPORTE

**Equipo de Desarrollo:**
Estudiantes de Ingeniería en Tecnologías de la Información
Universidad Politécnica de San Luis Potosí

**Proyecto:** Comercio Electrónico - Chocolates Costanzo
**Fecha:** Octubre 2025
**Versión:** 1.5.0

---

**Fin del Manual del Desarrollador Frontend**

Este documento es una guía completa para entender, mantener y extender la plataforma e-commerce de Chocolates Costanzo. Para consultas adicionales o contribuciones, contacte al equipo de desarrollo.

