// ========================
// Verificar autenticación
// ========================
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }
    
    initializeDashboard();
});

// ========================
// Inicialización
// ========================
function initializeDashboard() {
    setupNavigation();
    setupSidebar();
    loadDashboardData();
    loadProducts();
    loadSales();
    loadClients();
    setupCharts();
}

// ========================
// Navegación entre secciones
// ========================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Agregar active al clickeado
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            const sectionId = this.dataset.section;
            const section = document.getElementById(`section-${sectionId}`);
            if (section) {
                section.classList.add('active');
                
                // Actualizar título
                const pageTitle = document.getElementById('pageTitle');
                if (pageTitle) {
                    pageTitle.textContent = this.querySelector('span').textContent;
                }
            }
        });
    });
}

// ========================
// Sidebar mobile
// ========================
function setupSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// ========================
// Datos del Dashboard
// ========================
function loadDashboardData() {
    // Cargar pedidos recientes
    const recentOrdersTable = document.getElementById('recentOrdersTable');
    if (!recentOrdersTable) return;
    
    const recentOrders = [
        { id: 'CC-00145', client: 'María González', products: 5, total: 580.00, status: 'completed', date: '2024-10-07' },
        { id: 'CC-00144', client: 'Juan Pérez', products: 3, total: 320.00, status: 'processing', date: '2024-10-07' },
        { id: 'CC-00143', client: 'Ana Martínez', products: 8, total: 890.00, status: 'pending', date: '2024-10-06' },
        { id: 'CC-00142', client: 'Carlos López', products: 2, total: 180.00, status: 'completed', date: '2024-10-06' },
        { id: 'CC-00141', client: 'Laura Sánchez', products: 6, total: 650.00, status: 'completed', date: '2024-10-05' }
    ];
    
    recentOrdersTable.innerHTML = recentOrders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.client}</td>
            <td>${order.products}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge ${order.status}">${getStatusText(order.status)}</span></td>
            <td>${formatDate(order.date)}</td>
        </tr>
    `).join('');
}

// ========================
// Gestión de Productos
// ========================
let productsData = [];

function loadProducts() {
    // Simular carga de productos
    productsData = [
        { id: 1, name: 'Tornillo', category: 'chocolates', price: 25.00, stock: 150, status: 'active', image: '../img/Piezas, Presentaciones, Tablillas y Bolsas/02Tornillo.jpg' },
        { id: 2, name: 'Princesa Surtida', category: 'chocolates', price: 30.00, stock: 120, status: 'active', image: '../img/Piezas, Presentaciones, Tablillas y Bolsas/09PrincesaSurtida.jpg' },
        { id: 3, name: 'Duquesa', category: 'chocolates', price: 28.00, stock: 100, status: 'active', image: '../img/Piezas, Presentaciones, Tablillas y Bolsas/DUQUESA-PRESENTACIONES.jpg' },
        { id: 4, name: 'Esponja Natural', category: 'chocolates', price: 22.00, stock: 200, status: 'active', image: '../img/Chocolates envueltos, sin envolver y semillas cubiertas/Esponja-Natural.jpg' },
        { id: 5, name: 'Figuras', category: 'chocolates', price: 20.00, stock: 180, status: 'active', image: '../img/Chocolates envueltos, sin envolver y semillas cubiertas/figura.png' },
        { id: 6, name: 'Menta Blanca', category: 'caramelos', price: 18.00, stock: 250, status: 'active', image: '../img/Caramelos, chiclosos, jaleas y gomitas/Menta-Blanca.jpg' },
        { id: 7, name: 'Nuez Encanelada', category: 'temporalidades', price: 35.00, stock: 80, status: 'active', image: '../img/Temporalidades/nuez-encanelada.png' },
        { id: 8, name: 'Púrpura y Oro', category: 'caramelos', price: 32.00, stock: 90, status: 'active', image: '../img/Caramelos, chiclosos, jaleas y gomitas/Purupura-y-Oro-Envuelto.jpg' },
        { id: 9, name: 'Almendra con Chocolate', category: 'chocolates', price: 38.00, stock: 75, status: 'active', image: '../img/Chocolates envueltos, sin envolver y semillas cubiertas/Almendra-Con-Chocolate.jpg' },
        { id: 10, name: 'Tablilla Amargo', category: 'presentaciones', price: 45.00, stock: 60, status: 'active', image: '../img/Piezas, Presentaciones, Tablillas y Bolsas/tablilla-amargo.png' }
    ];
    
    renderProductsTable();
}

function renderProductsTable(filter = '') {
    const productsTable = document.getElementById('productsTable');
    if (!productsTable) return;
    
    let filteredProducts = productsData;
    
    // Aplicar filtro de categoría
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter && categoryFilter.value) {
        filteredProducts = filteredProducts.filter(p => p.category === categoryFilter.value);
    }
    
    // Aplicar filtro de búsqueda
    if (filter) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(filter.toLowerCase())
        );
    }
    
    productsTable.innerHTML = filteredProducts.map(product => `
        <tr>
            <td><strong>#${product.id}</strong></td>
            <td><img src="${product.image}" alt="${product.name}" class="product-img"></td>
            <td><strong>${product.name}</strong></td>
            <td>${getCategoryText(product.category)}</td>
            <td><strong>$${product.price.toFixed(2)}</strong></td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${product.status}">${product.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filtros de productos
document.addEventListener('DOMContentLoaded', function() {
    const categoryFilter = document.getElementById('categoryFilter');
    const productSearch = document.getElementById('productSearch');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => renderProductsTable());
    }
    
    if (productSearch) {
        productSearch.addEventListener('input', (e) => renderProductsTable(e.target.value));
    }
});

// ========================
// Modal de Productos
// ========================
let currentProductId = null;

function showProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    modal.classList.add('active');
    overlay.classList.add('active');
    
    if (productId) {
        // Editar producto
        currentProductId = productId;
        modalTitle.textContent = 'Editar Producto';
        
        const product = productsData.find(p => p.id === productId);
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productActive').checked = product.status === 'active';
        }
    } else {
        // Nuevo producto
        currentProductId = null;
        modalTitle.textContent = 'Nuevo Producto';
        form.reset();
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('modalOverlay');
    
    modal.classList.remove('active');
    overlay.classList.remove('active');
    currentProductId = null;
}

function editProduct(id) {
    showProductModal(id);
}

function deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productsData = productsData.filter(p => p.id !== id);
        renderProductsTable();
        showNotification('Producto eliminado correctamente', 'success');
    }
}

// Form submit
document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                id: currentProductId || Date.now(),
                name: document.getElementById('productName').value,
                category: document.getElementById('productCategory').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('productStock').value),
                image: document.getElementById('productImage').value,
                status: document.getElementById('productActive').checked ? 'active' : 'inactive'
            };
            
            if (currentProductId) {
                // Actualizar
                const index = productsData.findIndex(p => p.id === currentProductId);
                if (index !== -1) {
                    productsData[index] = formData;
                    showNotification('Producto actualizado correctamente', 'success');
                }
            } else {
                // Crear nuevo
                productsData.push(formData);
                showNotification('Producto creado correctamente', 'success');
            }
            
            renderProductsTable();
            closeProductModal();
        });
    }
});

// ========================
// Gestión de Ventas
// ========================
let salesData = [];

function loadSales() {
    salesData = [
        { id: 'CC-00145', client: 'María González', products: 5, subtotal: 530.00, shipping: 50.00, total: 580.00, status: 'completed', date: '2024-10-07' },
        { id: 'CC-00144', client: 'Juan Pérez', products: 3, subtotal: 270.00, shipping: 50.00, total: 320.00, status: 'processing', date: '2024-10-07' },
        { id: 'CC-00143', client: 'Ana Martínez', products: 8, subtotal: 840.00, shipping: 50.00, total: 890.00, status: 'pending', date: '2024-10-06' },
        { id: 'CC-00142', client: 'Carlos López', products: 2, subtotal: 130.00, shipping: 50.00, total: 180.00, status: 'completed', date: '2024-10-06' },
        { id: 'CC-00141', client: 'Laura Sánchez', products: 6, subtotal: 600.00, shipping: 50.00, total: 650.00, status: 'completed', date: '2024-10-05' },
        { id: 'CC-00140', client: 'Pedro Ramírez', products: 4, subtotal: 400.00, shipping: 50.00, total: 450.00, status: 'cancelled', date: '2024-10-05' }
    ];
    
    renderSalesTable();
}

function renderSalesTable() {
    const salesTable = document.getElementById('salesTable');
    if (!salesTable) return;
    
    let filteredSales = salesData;
    
    // Aplicar filtro de estado
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter && statusFilter.value) {
        filteredSales = filteredSales.filter(s => s.status === statusFilter.value);
    }
    
    salesTable.innerHTML = filteredSales.map(sale => `
        <tr>
            <td><strong>${sale.id}</strong></td>
            <td>${sale.client}</td>
            <td>${sale.products}</td>
            <td>$${sale.subtotal.toFixed(2)}</td>
            <td>$${sale.shipping.toFixed(2)}</td>
            <td><strong>$${sale.total.toFixed(2)}</strong></td>
            <td><span class="status-badge ${sale.status}">${getStatusText(sale.status)}</span></td>
            <td>${formatDate(sale.date)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-edit" onclick="viewSale('${sale.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewSale(id) {
    alert(`Ver detalles de la venta ${id}`);
}

function exportSales() {
    showNotification('Exportando ventas...', 'info');
    setTimeout(() => {
        showNotification('Ventas exportadas correctamente', 'success');
    }, 1500);
}

// Filtro de ventas
document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', renderSalesTable);
    }
});

// ========================
// Gestión de Clientes
// ========================
function loadClients() {
    const clientsTable = document.getElementById('clientsTable');
    if (!clientsTable) return;
    
    const clients = [
        { id: 1, name: 'María González', email: 'maria@example.com', phone: '444-123-4567', orders: 12, totalSpent: 3580.00, date: '2024-01-15' },
        { id: 2, name: 'Juan Pérez', email: 'juan@example.com', phone: '444-234-5678', orders: 8, totalSpent: 2340.00, date: '2024-02-20' },
        { id: 3, name: 'Ana Martínez', email: 'ana@example.com', phone: '444-345-6789', orders: 15, totalSpent: 4650.00, date: '2024-01-10' },
        { id: 4, name: 'Carlos López', email: 'carlos@example.com', phone: '444-456-7890', orders: 5, totalSpent: 1280.00, date: '2024-03-05' },
        { id: 5, name: 'Laura Sánchez', email: 'laura@example.com', phone: '444-567-8901', orders: 10, totalSpent: 3120.00, date: '2024-02-14' }
    ];
    
    clientsTable.innerHTML = clients.map(client => `
        <tr>
            <td><strong>#${client.id}</strong></td>
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>${client.phone}</td>
            <td>${client.orders}</td>
            <td><strong>$${client.totalSpent.toFixed(2)}</strong></td>
            <td>${formatDate(client.date)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-edit" onclick="viewClient(${client.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function viewClient(id) {
    alert(`Ver detalles del cliente #${id}`);
}

// ========================
// Reportes
// ========================
function generateReport(type) {
    const reportTypes = {
        daily: 'Diario',
        weekly: 'Semanal',
        monthly: 'Mensual',
        yearly: 'Anual'
    };
    
    showNotification(`Generando reporte ${reportTypes[type]}...`, 'info');
    
    setTimeout(() => {
        const reportsList = document.getElementById('reportsList');
        if (reportsList) {
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item';
            reportItem.style.cssText = `
                padding: 1rem;
                background: var(--bg-primary);
                border-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            `;
            reportItem.innerHTML = `
                <div>
                    <strong>Reporte ${reportTypes[type]}</strong>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">
                        Generado el ${new Date().toLocaleDateString('es-MX')}
                    </p>
                </div>
                <button class="btn btn-secondary" onclick="downloadReport()">
                    <i class="fas fa-download"></i> Descargar
                </button>
            `;
            reportsList.insertBefore(reportItem, reportsList.firstChild);
        }
        showNotification('Reporte generado correctamente', 'success');
    }, 2000);
}

function downloadReport() {
    showNotification('Descargando reporte...', 'info');
}

// ========================
// Charts
// ========================
function setupCharts() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'],
            datasets: [{
                label: 'Ventas 2024',
                data: [12500, 15200, 13800, 16500, 18200, 17500, 19800, 21000, 20500, 22300],
                borderColor: '#D2691E',
                backgroundColor: 'rgba(210, 105, 30, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// ========================
// Utilidades
// ========================
function getStatusText(status) {
    const statusTexts = {
        'pending': 'Pendiente',
        'processing': 'En proceso',
        'completed': 'Completado',
        'cancelled': 'Cancelado',
        'active': 'Activo',
        'inactive': 'Inactivo'
    };
    return statusTexts[status] || status;
}

function getCategoryText(category) {
    const categories = {
        'chocolates': 'Chocolates',
        'caramelos': 'Caramelos',
        'presentaciones': 'Presentaciones',
        'temporalidades': 'Temporalidades'
    };
    return categories[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        window.location.href = 'login.html';
    }
}

// ========================
// Hacer funciones globales
// ========================
window.showProductModal = showProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewSale = viewSale;
window.exportSales = exportSales;
window.viewClient = viewClient;
window.generateReport = generateReport;
window.downloadReport = downloadReport;
window.logout = logout;

// Agregar estilos para animaciones
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

