document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();

        // Quitar clase activa del menú
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');

        // Ocultar todas las secciones (usar display none para evitar que se muestren partes)
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar la sección correspondiente
        const targetId = 'section-' + this.getAttribute('data-section');
        const sectionToShow = document.getElementById(targetId);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
            sectionToShow.scrollIntoView({ behavior: 'smooth' });
        }

        // Guardar en localStorage para restaurar después
        localStorage.setItem('ultimaSeccion', targetId);
    });
});

document.querySelector('[data-section="productos"]').addEventListener('click', () => {
    document.querySelectorAll('.card-section').forEach(sec => sec.style.display = 'none');
    const productosCard = document.getElementById('productosCard');
    productosCard.style.display = 'block';

    showLoading('loadingProducts')

    loadProducts();

    // Asegura que los filtros ya están en el DOM antes de asignar el evento
    setTimeout(() => {
        const btn = document.getElementById('applyFiltersBtn');
        if (btn) btn.onclick = applyProductFilters;
    }, 100); // pequeño delay si es necesario
});

document.querySelector('[data-section="cupones"]').addEventListener('click', () => {
    document.querySelectorAll('.card-section').forEach(sec => sec.style.display = 'none');
    const cuponesCard = document.getElementById('section-cupones');
    cuponesCard.style.display = 'block';

    showLoading('loadingCoupons')

    loadCoupons();

    // Asegura que los filtros ya están en el DOM antes de asignar el evento
    setTimeout(() => {
        const btn = document.getElementById('applyCouponFiltersBtn');
        if (btn) btn.onclick = applyCouponFilters;
    }, 100);

    // Update coupon type help text
    document.getElementById('couponType').addEventListener('change', function() {
        const helpText = document.getElementById('couponValueHelp');
        if (this.value === 'porcentaje') {
            helpText.textContent = 'Para porcentaje: 10 = 10%';
        } else {
            helpText.textContent = 'Para monto fijo: 50 = $50.00';
        }
    });
});

document.querySelector('[data-section="pagos"]').addEventListener('click', () => {
    document.querySelectorAll('.card-section').forEach(sec => sec.style.display = 'none');
    const pagosCard = document.getElementById('section-pagos');
    pagosCard.style.display = 'block';

    showLoading('loadingPagos')

    loadPagos();

    // Asegura que los filtros ya están en el DOM antes de asignar el evento
    setTimeout(() => {
        const btn = document.getElementById('applyPagoFiltersBtn');
        if (btn) btn.onclick = applyPagoFilters;
    }, 100);
});

document.querySelector('[data-section="inventario"]').addEventListener('click', () => {
    document.querySelectorAll('.card-section').forEach(sec => sec.style.display = 'none');
    const inventarioCard = document.getElementById('section-inventario');
    inventarioCard.style.display = 'block';

    showLoading('loadingInventario')

    loadInventario();

    // Asegura que los filtros ya están en el DOM antes de asignar el evento
    setTimeout(() => {
        const btn = document.getElementById('applyInventarioFiltersBtn');
        if (btn) btn.onclick = applyInventarioFilters;
    }, 100);
});

document.querySelector('[data-section="usuarios"]').addEventListener('click', () => {
    document.querySelectorAll('.card-section').forEach(sec => sec.style.display = 'none');
    const usuariosCard = document.getElementById('section-usuarios');
    usuariosCard.style.display = 'block';

    showLoading('loadingUsuarios')

    loadUsuarios();

    // Asegura que los filtros ya están en el DOM antes de asignar el evento
    setTimeout(() => {
        const btn = document.getElementById('applyUsuarioFiltersBtn');
        if (btn) btn.onclick = applyUsuarioFilters;
    }, 100);
});

document.querySelector('[data-section="reportes"]').addEventListener('click', () => {
    document.querySelectorAll('.card-section').forEach(sec => sec.style.display = 'none');
    const reportesCard = document.getElementById('section-reportes');
    reportesCard.style.display = 'block';

    showLoading('loadingReportes')

    generarReportes();

    // Asegura que los elementos ya están en el DOM
    setTimeout(() => {
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            initCharts();
        }
    }, 100);
});

document.querySelector('[data-section="dashboard"]').addEventListener('click', () => {
    document.querySelectorAll('.card-section').forEach(sec => sec.style.display = 'none');
    const dashboardCard = document.getElementById('section-dashboard');
    dashboardCard.style.display = 'block';

    loadDashboardData();
});

document.querySelector('[data-section="productos"]').addEventListener('click', () => {
    document.querySelectorAll('.card-section').forEach(sec => sec.style.display = 'none');
    const productosCard = document.getElementById('section-productos');
    productosCard.style.display = 'block';

    showLoading('loadingProducts')

    loadProducts();

    // Asegura que los filtros ya están en el DOM antes de asignar el evento
    setTimeout(() => {
        const btn = document.getElementById('applyProductoFiltersBtn');
        if (btn) btn.onclick = applyProductoFilters;
    }, 100);
});

const activeSwitch = document.getElementById('productActive');
const activeLabel = document.getElementById('activeLabel');

activeSwitch.addEventListener('change', () => {
    activeLabel.textContent = activeSwitch.checked ? 'Sí' : 'No';
    activeLabel.style.color = activeSwitch.checked ? 'green' : 'red';
});

document.getElementById('productImage').addEventListener('change', e => {
    const file = e.target.files[0];
    const preview = document.getElementById('productPreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
});

document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    if (id) {
        updateProduct();  // edición
    } else {
        insertProduct();  // nuevo
    }
});




// ========================
// Cargar productos
// ========================

let allProducts = [];

function loadProducts() {

    fetch('/getProducts')
        .then(res => res.json())
        .then(data => {
            allProducts = data.productos; // Guardamos todos los productos
            renderProductTable(allProducts);
            renderCategoryFilter(data.categorias);
        })
        .finally(() => hideLoading('loadingProducts'));
}


function renderCategoryFilter(categorias) {

    const select = document.getElementById('filterCategoria');
    if (!select) return;

    select.innerHTML = '<option value="">Todas</option>';

    categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function renderProductTable(products) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';

    products.forEach(prod => {
        const row = document.createElement('tr');
        const precio = parseFloat(prod.precio_unitario);

        row.innerHTML = `
            <td>${prod.id_producto}</td>
            <td>${prod.nombre}</td>
            <td>${prod.descripcion}</td>
            <td>${prod.categoria ?? 'Sin categoría'}</td>
            <td>$${isNaN(precio) ? 'N/A' : precio.toFixed(2)}</td>
            <td>${prod.stock}</td>
            <td>${prod.activo ? 'Sí' : 'No'}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editProduct(${prod.id_producto})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${prod.id_producto})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}



// ========================
// Editar producto
// ========================
function editProduct(id) {
    const product = allProducts.find(p => p.id_producto === id);

    if (!product) return;

    // Aquí puedes abrir el formulario y rellenarlo
    openProductForm(product);
}

// ========================
// Abrir modal de productos
// ========================
function openProductForm(product = null) {
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    const form = document.getElementById('productForm');


    form.reset();
    document.getElementById('productId').value = product?.id_producto || '';
    document.getElementById('productName').value = product?.nombre || '';
    document.getElementById('productCategory').value = product?.categoria || '';
    document.getElementById('productDescription').value = product?.descripcion || '';
    document.getElementById('productPrice').value = product?.precio_unitario || '';
    document.getElementById('productStock').value = product?.stock || '';
    activeSwitch.checked = product?.activo === 1;
    activeSwitch.dispatchEvent(new Event('change'));

    const preview = document.getElementById('productPreview');

    if (product?.imagen_base64) {
        preview.src = `data:image/jpeg;base64,${product.imagen_base64}`;
        preview.style.display = 'block';
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }

    modal.show();
}

function updateProduct() {
    const id = document.getElementById('productId').value;
    const nombre = document.getElementById('productName').value.trim();
    const categoria = document.getElementById('productCategory').value;
    const descripcion = document.getElementById('productDescription').value.trim();
    const precio = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const activo = document.getElementById('productActive').checked ? 1 : 0;
    const imagenInput = document.getElementById('productImage');
    const file = imagenInput.files[0];

    const producto = {
        id_producto: id,
        nombre,
        categoria,
        descripcion,
        precio_unitario: precio,
        stock,
        activo
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            producto.imagen_base64 = reader.result.split(',')[1];
            sendUpdate(producto);
        };
        reader.readAsDataURL(file);
    } else {
        sendUpdate(producto);
    }

    function sendUpdate(data) {
        fetch('/updateProduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }
                return res.json();
            })
            .then(response => {
                if (!response.success) {
                    throw new Error(response.message || 'Error desconocido');
                }
                loadProducts()
                bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            })
            .catch(err => {
                console.error('Error al actualizar producto:', err.message || err);
                alert('Hubo un problema al actualizar el producto.');
            });
    }

}


// ========================
// Insertar producto
// ========================
function insertProduct() {
    const nombre = document.getElementById('productName').value.trim();
    const categoria = document.getElementById('productCategory').value;
    const descripcion = document.getElementById('productDescription').value.trim();
    const precio = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const activo = document.getElementById('productActive').checked ? 1 : 0;
    const imagenInput = document.getElementById('productImage');
    const file = imagenInput.files[0];

    const producto = {
        nombre,
        categoria,
        descripcion,
        precio_unitario: precio,
        stock,
        activo
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            producto.imagen_base64 = reader.result.split(',')[1];
            sendInsert(producto);
        };
        reader.readAsDataURL(file);
    } else {
        sendInsert(producto);
    }

    function sendInsert(data) {
        fetch('/insertProduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(async res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const response = await res.json();
            if (!response.success) throw new Error(response.message);
            loadProducts()
            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        })
        .catch(err => {
            console.error('Error al insertar producto:', err.message || err);
            alert('Hubo un problema al agregar el producto.');
        });
    }
}





// ========================
// Borrar producto
// ========================
function deleteProduct(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    fetch('/deleteProduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto: id })
    })
    .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const response = await res.json();
        if (!response.success) throw new Error(response.message);
        loadProducts(); // recarga tabla
    })
    .catch(err => {
        console.error('Error al eliminar producto:', err.message || err);
        alert('Hubo un problema al eliminar el producto.');
    });
}







// ========================
// Filtros para la tabla
// ========================
function applyProductFilters() {
    const filterActiveEl = document.getElementById('filterActive');
    // const filterStockEl = document.getElementById('filterStock');
    const filterCategoriaEl = document.getElementById('filterCategoria');


    if (!filterActiveEl || !filterCategoriaEl) {
        console.warn('Filtros no disponibles en el DOM');
        return;
    }

    const activo = filterActiveEl.value;
    const categoria = filterCategoriaEl.value;

    let filtered = [...allProducts];

    if (activo !== '') {
        const activoBool = parseInt(activo) === 1;
        filtered = filtered.filter(p => p.activo === activoBool || p.activo === parseInt(activo));
    }

    // if (stockMin !== '') {
    //     filtered = filtered.filter(p => p.stock >= parseInt(stockMin));
    // }

    if (categoria !== '') {
        filtered = filtered.filter(p => p.categoria === categoria);
    }

    renderProductTable(filtered);
}




// ========================
// Mostrar y quitar loading
// ========================

function showLoading(id) {
    const modal = new bootstrap.Modal(document.getElementById(id));
    modal.show();
    return modal;
}

function hideLoading(id) {
    const modalEl = document.getElementById(id);
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) {
        modalInstance.hide();
    }
}






function showProductosCard() {
    document.getElementById('productosCard').style.display = 'block';
}

function hideProductosCard() {
    document.getElementById('productosCard').style.display = 'none';
}

// ========================
// Coupons Management
// ========================

let allCoupons = [];

function loadCoupons() {
    fetch('/get-coupons')
        .then(res => res.json())
        .then(data => {
            allCoupons = data;
            renderCouponTable(allCoupons);
        })
        .finally(() => hideLoading('loadingCoupons'));
}

function renderCouponTable(coupons) {
    const tbody = document.getElementById('couponTableBody');
    tbody.innerHTML = '';

    coupons.forEach(coupon => {
        const row = document.createElement('tr');
        const startDate = coupon.fecha_inicio ? new Date(coupon.fecha_inicio).toLocaleString('es-MX') : 'N/A';
        const endDate = coupon.fecha_fin ? new Date(coupon.fecha_fin).toLocaleString('es-MX') : 'N/A';
        const valorDisplay = coupon.tipo === 'porcentaje' ? `${coupon.valor}%` : `$${parseFloat(coupon.valor).toFixed(2)}`;

        row.innerHTML = `
            <td>${coupon.id_descuento}</td>
            <td>${coupon.nombre}</td>
            <td>${coupon.tipo === 'porcentaje' ? 'Porcentaje' : 'Monto fijo'}</td>
            <td>${valorDisplay}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>${coupon.activo ? 'Sí' : 'No'}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editCoupon(${coupon.id_descuento})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCoupon(${coupon.id_descuento})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openCouponForm(coupon = null) {
    const modal = new bootstrap.Modal(document.getElementById('couponModal'));
    const form = document.getElementById('couponForm');
    const title = document.getElementById('couponModalTitle');

    form.reset();
    document.getElementById('couponId').value = coupon?.id_descuento || '';
    document.getElementById('couponName').value = coupon?.nombre || '';
    document.getElementById('couponType').value = coupon?.tipo || 'porcentaje';
    document.getElementById('couponValue').value = coupon?.valor || '';
    document.getElementById('couponActive').checked = coupon?.activo !== 0;

    if (coupon?.fecha_inicio) {
        const startDate = new Date(coupon.fecha_inicio);
        document.getElementById('couponStartDate').value = startDate.toISOString().slice(0, 16);
    } else {
        document.getElementById('couponStartDate').value = '';
    }

    if (coupon?.fecha_fin) {
        const endDate = new Date(coupon.fecha_fin);
        document.getElementById('couponEndDate').value = endDate.toISOString().slice(0, 16);
    } else {
        document.getElementById('couponEndDate').value = '';
    }

    title.textContent = coupon ? 'Editar Cupón' : 'Nuevo Cupón';
    modal.show();
}

function editCoupon(id) {
    const coupon = allCoupons.find(c => c.id_descuento === id);
    if (coupon) {
        openCouponForm(coupon);
    }
}

function saveCoupon() {
    const formData = new FormData(document.getElementById('couponForm'));
    const data = {
        id_descuento: document.getElementById('couponId').value || null,
        nombre: document.getElementById('couponName').value.trim(),
        tipo: document.getElementById('couponType').value,
        valor: parseFloat(document.getElementById('couponValue').value),
        fecha_inicio: document.getElementById('couponStartDate').value || null,
        fecha_fin: document.getElementById('couponEndDate').value || null,
        activo: document.getElementById('couponActive').checked
    };

    fetch('/save-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            loadCoupons();
            bootstrap.Modal.getInstance(document.getElementById('couponModal')).hide();
            alert('Cupón guardado correctamente');
        } else {
            alert('Error: ' + response.message);
        }
    })
    .catch(err => {
        console.error('Error saving coupon:', err);
        alert('Error al guardar el cupón');
    });
}

function deleteCoupon(id) {
    if (!confirm('¿Estás seguro de que deseas desactivar este cupón? (Se puede reactivar editándolo)')) return;

    fetch('/delete-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_descuento: id })
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            loadCoupons();
            alert('Cupón desactivado correctamente');
        } else {
            alert('Error: ' + response.message);
        }
    })
    .catch(err => {
        console.error('Error deactivating coupon:', err);
        alert('Error al desactivar el cupón');
    });
}

function applyCouponFilters() {
    const filterActiveEl = document.getElementById('filterCouponActive');
    const filterTypeEl = document.getElementById('filterCouponType');

    if (!filterActiveEl || !filterTypeEl) {
        console.warn('Coupon filters not available in DOM');
        return;
    }

    const activo = filterActiveEl.value;
    const tipo = filterTypeEl.value;

    let filtered = [...allCoupons];

    if (activo !== '') {
        const activoBool = parseInt(activo) === 1;
        filtered = filtered.filter(c => c.activo === activoBool);
    }

    if (tipo !== '') {
        filtered = filtered.filter(c => c.tipo === tipo);
    }

    renderCouponTable(filtered);
}

// ========================
// Pagos Management
// ========================

let allPagos = [];

function loadPagos() {
    fetch('/get-pagos')
        .then(res => res.json())
        .then(data => {
            allPagos = data;
            renderPagoTable(allPagos);
            updatePagoSummary(allPagos);
        })
        .finally(() => hideLoading('loadingPagos'));
}

function renderPagoTable(pagos) {
    const tbody = document.getElementById('pagoTableBody');
    tbody.innerHTML = '';

    const metodoMap = {
        1: 'Tarjeta de Crédito',
        4: 'Transferencia Bancaria',
        5: 'Efectivo en Tienda',
        6: 'OXXO',
        7: 'SPEI'
    };

    pagos.forEach(pago => {
        const row = document.createElement('tr');
        const fechaPago = pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleString('es-MX') : 'N/A';
        const metodo = metodoMap[pago.id_metodo_pago] || `Método ${pago.id_metodo_pago}`;

        row.innerHTML = `
            <td>${pago.id_pago}</td>
            <td>${pago.id_intento_pago || 'N/A'}</td>
            <td>${metodo}</td>
            <td>$${parseFloat(pago.monto).toFixed(2)}</td>
            <td>${fechaPago}</td>
            <td>
                <span class="badge ${getEstadoBadgeClass(pago.estado_pago)}">
                    ${pago.estado_pago}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getEstadoBadgeClass(estado) {
    switch (estado) {
        case 'exitoso': return 'bg-success';
        case 'pendiente': return 'bg-warning';
        case 'fallido': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function updatePagoSummary(pagos) {
    const summary = {
        exitosos: { total: 0, count: 0 },
        pendientes: { total: 0, count: 0 },
        fallidos: { total: 0, count: 0 },
        general: { total: 0, count: 0 }
    };

    pagos.forEach(pago => {
        const monto = parseFloat(pago.monto) || 0;
        summary.general.total += monto;
        summary.general.count++;

        switch (pago.estado_pago) {
            case 'exitoso':
                summary.exitosos.total += monto;
                summary.exitosos.count++;
                break;
            case 'pendiente':
                summary.pendientes.total += monto;
                summary.pendientes.count++;
                break;
            case 'fallido':
                summary.fallidos.total += monto;
                summary.fallidos.count++;
                break;
        }
    });

    document.getElementById('totalExitosos').textContent = `$${summary.exitosos.total.toFixed(2)}`;
    document.getElementById('countExitosos').textContent = `${summary.exitosos.count} pagos`;

    document.getElementById('totalPendientes').textContent = `$${summary.pendientes.total.toFixed(2)}`;
    document.getElementById('countPendientes').textContent = `${summary.pendientes.count} pagos`;

    document.getElementById('totalFallidos').textContent = `$${summary.fallidos.total.toFixed(2)}`;
    document.getElementById('countFallidos').textContent = `${summary.fallidos.count} pagos`;

    document.getElementById('totalGeneral').textContent = `$${summary.general.total.toFixed(2)}`;
    document.getElementById('countGeneral').textContent = `${summary.general.count} pagos`;
}

function applyPagoFilters() {
    const filterEstadoEl = document.getElementById('filterPagoEstado');
    const filterMetodoEl = document.getElementById('filterPagoMetodo');
    const filterFechaEl = document.getElementById('filterPagoFecha');

    if (!filterEstadoEl || !filterMetodoEl || !filterFechaEl) {
        console.warn('Pago filters not available in DOM');
        return;
    }

    const estado = filterEstadoEl.value;
    const metodo = filterMetodoEl.value;
    const fecha = filterFechaEl.value;

    let filtered = [...allPagos];

    if (estado !== '') {
        filtered = filtered.filter(p => p.estado_pago === estado);
    }

    if (metodo !== '') {
        filtered = filtered.filter(p => p.id_metodo_pago == metodo);
    }

    if (fecha !== '') {
        const filterDate = new Date(fecha);
        const nextDay = new Date(filterDate);
        nextDay.setDate(nextDay.getDate() + 1);

        filtered = filtered.filter(p => {
            const pagoDate = new Date(p.fecha_pago);
            return pagoDate >= filterDate && pagoDate < nextDay;
        });
    }

    renderPagoTable(filtered);
    updatePagoSummary(filtered);
}

// ========================
// Inventario Management
// ========================

let allInventario = [];
let allProductos = [];

function loadInventario() {
    fetch('/get-inventario')
        .then(res => res.json())
        .then(data => {
            allInventario = data;
            renderInventarioTable(allInventario);
            updateInventarioSummary(allInventario);
        })
        .finally(() => hideLoading('loadingInventario'));
}

function loadProductosForInventario() {
    return fetch('/get-productos-simple')
        .then(res => res.json())
        .then(data => {
            allProductos = data;
            const select = document.getElementById('inventarioProducto');
            if (select) {
                select.innerHTML = '<option value="">Seleccione un producto...</option>';
                data.forEach(producto => {
                    const option = document.createElement('option');
                    option.value = producto.id_producto;
                    option.textContent = producto.nombre;
                    select.appendChild(option);
                });
            }
        });
}

function renderInventarioTable(inventario) {
    const tbody = document.getElementById('inventarioTableBody');
    tbody.innerHTML = '';

    inventario.forEach(item => {
        const row = document.createElement('tr');
        const fechaActualizacion = item.fecha_actualizacion ? new Date(item.fecha_actualizacion).toLocaleString('es-MX') : 'N/A';
        const estado = item.cantidad_actual <= item.cantidad_minima ? 'bajo' : 'normal';
        const estadoClass = estado === 'bajo' ? 'text-danger' : 'text-success';
        const estadoText = estado === 'bajo' ? 'Stock Bajo' : 'Normal';

        row.innerHTML = `
            <td>${item.id_inventario}</td>
            <td>${item.nombre_producto}</td>
            <td>${item.cantidad_actual}</td>
            <td>${item.cantidad_minima}</td>
            <td>${item.ubicacion || 'N/A'}</td>
            <td>${fechaActualizacion}</td>
            <td><span class="${estadoClass}">${estadoText}</span></td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editInventario(${item.id_inventario})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteInventario(${item.id_inventario})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getEstadoBadgeClass(estado) {
    switch (estado) {
        case 'exitoso': return 'bg-success';
        case 'pendiente': return 'bg-warning';
        case 'fallido': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function updateInventarioSummary(inventario) {
    const summary = {
        totalProductos: inventario.length,
        productosStockBajo: 0,
        totalUnidades: 0
    };

    inventario.forEach(item => {
        summary.totalUnidades += item.cantidad_actual;
        if (item.cantidad_actual <= item.cantidad_minima) {
            summary.productosStockBajo++;
        }
    });

    document.getElementById('totalProductos').textContent = summary.totalProductos;
    document.getElementById('productosStockBajo').textContent = summary.productosStockBajo;
    document.getElementById('totalUnidades').textContent = summary.totalUnidades;
}

function openInventarioForm(inventario = null) {
    const modal = new bootstrap.Modal(document.getElementById('inventarioModal'));
    const form = document.getElementById('inventarioForm');
    const title = document.getElementById('inventarioModalTitle');

    form.reset();
    document.getElementById('inventarioId').value = inventario?.id_inventario || '';

    // Load products if not loaded yet
    if (allProductos.length === 0) {
        loadProductosForInventario().then(() => {
            if (inventario) {
                document.getElementById('inventarioProducto').value = inventario.id_producto;
            }
        });
    } else {
        document.getElementById('inventarioProducto').value = inventario?.id_producto || '';
    }

    document.getElementById('inventarioCantidadActual').value = inventario?.cantidad_actual || '';
    document.getElementById('inventarioCantidadMinima').value = inventario?.cantidad_minima || '';
    document.getElementById('inventarioUbicacion').value = inventario?.ubicacion || '';

    title.textContent = inventario ? 'Editar Registro de Inventario' : 'Nuevo Registro de Inventario';
    modal.show();
}

function editInventario(id) {
    const inventario = allInventario.find(i => i.id_inventario === id);
    if (inventario) {
        openInventarioForm(inventario);
    }
}

function saveInventario() {
    const formData = new FormData(document.getElementById('inventarioForm'));
    const data = {
        id_inventario: document.getElementById('inventarioId').value || null,
        id_producto: document.getElementById('inventarioProducto').value,
        cantidad_actual: parseInt(document.getElementById('inventarioCantidadActual').value),
        cantidad_minima: parseInt(document.getElementById('inventarioCantidadMinima').value),
        ubicacion: document.getElementById('inventarioUbicacion').value.trim()
    };

    fetch('/save-inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            loadInventario();
            bootstrap.Modal.getInstance(document.getElementById('inventarioModal')).hide();
            alert('Registro de inventario guardado correctamente');
        } else {
            alert('Error: ' + response.message);
        }
    })
    .catch(err => {
        console.error('Error saving inventario:', err);
        alert('Error al guardar el registro de inventario');
    });
}

function deleteInventario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro de inventario?')) return;

    fetch('/delete-inventario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_inventario: id })
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            loadInventario();
            alert('Registro de inventario eliminado correctamente');
        } else {
            alert('Error: ' + response.message);
        }
    })
    .catch(err => {
        console.error('Error deleting inventario:', err);
        alert('Error al eliminar el registro de inventario');
    });
}

function applyInventarioFilters() {
    const filterProductoEl = document.getElementById('filterInventarioProducto');
    const filterEstadoEl = document.getElementById('filterInventarioEstado');
    const filterUbicacionEl = document.getElementById('filterInventarioUbicacion');

    if (!filterProductoEl || !filterEstadoEl || !filterUbicacionEl) {
        console.warn('Inventario filters not available in DOM');
        return;
    }

    const producto = filterProductoEl.value.toLowerCase().trim();
    const estado = filterEstadoEl.value;
    const ubicacion = filterUbicacionEl.value.toLowerCase().trim();

    let filtered = [...allInventario];

    if (producto !== '') {
        filtered = filtered.filter(i => i.nombre_producto.toLowerCase().includes(producto));
    }

    if (estado !== '') {
        if (estado === 'bajo') {
            filtered = filtered.filter(i => i.cantidad_actual <= i.cantidad_minima);
        } else if (estado === 'normal') {
            filtered = filtered.filter(i => i.cantidad_actual > i.cantidad_minima);
        }
    }

    if (ubicacion !== '') {
        filtered = filtered.filter(i => (i.ubicacion || '').toLowerCase().includes(ubicacion));
    }

    renderInventarioTable(filtered);
    updateInventarioSummary(filtered);
}

// ========================
// Usuarios Management
// ========================

let allUsuarios = [];

function loadUsuarios() {
    fetch('/get-usuarios')
        .then(res => res.json())
        .then(data => {
            allUsuarios = data;
            renderUsuarioTable(allUsuarios);
            updateUsuarioSummary(allUsuarios);
        })
        .finally(() => hideLoading('loadingUsuarios'));
}

function renderUsuarioTable(usuarios) {
    const tbody = document.getElementById('usuarioTableBody');
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        const fechaRegistro = usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleString('es-MX') : 'N/A';
        const tipoUsuario = usuario.tipo_usuario === 1 ? 'Administrador' : 'Usuario Regular';
        const tipoClass = usuario.tipo_usuario === 1 ? 'text-danger' : 'text-primary';

        row.innerHTML = `
            <td>${usuario.id_usuario}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.apellido}</td>
            <td>${usuario.correo}</td>
            <td>${usuario.telefono || 'N/A'}</td>
            <td><span class="${tipoClass}">${tipoUsuario}</span></td>
            <td>${fechaRegistro}</td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editUsuario(${usuario.id_usuario})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUsuario(${usuario.id_usuario})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateUsuarioSummary(usuarios) {
    const summary = {
        totalUsuarios: usuarios.length,
        usuariosRegulares: 0,
        usuariosAdmin: 0
    };

    usuarios.forEach(usuario => {
        if (usuario.tipo_usuario === 0) {
            summary.usuariosRegulares++;
        } else if (usuario.tipo_usuario === 1) {
            summary.usuariosAdmin++;
        }
    });

    document.getElementById('totalUsuarios').textContent = summary.totalUsuarios;
    document.getElementById('usuariosRegulares').textContent = summary.usuariosRegulares;
    document.getElementById('usuariosAdmin').textContent = summary.usuariosAdmin;
}

function openUsuarioForm(usuario = null) {
    const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    const form = document.getElementById('usuarioForm');
    const title = document.getElementById('usuarioModalTitle');
    const passwordSection = document.getElementById('passwordSection');

    form.reset();
    document.getElementById('usuarioId').value = usuario?.id_usuario || '';
    document.getElementById('usuarioNombre').value = usuario?.nombre || '';
    document.getElementById('usuarioApellido').value = usuario?.apellido || '';
    document.getElementById('usuarioCorreo').value = usuario?.correo || '';
    document.getElementById('usuarioTelefono').value = usuario?.telefono || '';
    document.getElementById('usuarioTipo').value = usuario?.tipo_usuario || 0;

    // Show password field only for new users
    if (usuario) {
        passwordSection.style.display = 'none';
        document.getElementById('usuarioPassword').required = false;
    } else {
        passwordSection.style.display = 'block';
        document.getElementById('usuarioPassword').required = true;
    }

    title.textContent = usuario ? 'Editar Usuario' : 'Nuevo Usuario';
    modal.show();
}

function editUsuario(id) {
    const usuario = allUsuarios.find(u => u.id_usuario === id);
    if (usuario) {
        openUsuarioForm(usuario);
    }
}

function saveUsuario() {
    const formData = new FormData(document.getElementById('usuarioForm'));
    const data = {
        id_usuario: document.getElementById('usuarioId').value || null,
        nombre: document.getElementById('usuarioNombre').value.trim(),
        apellido: document.getElementById('usuarioApellido').value.trim(),
        correo: document.getElementById('usuarioCorreo').value.trim(),
        telefono: document.getElementById('usuarioTelefono').value.trim(),
        tipo_usuario: parseInt(document.getElementById('usuarioTipo').value),
        password: document.getElementById('usuarioPassword').value
    };

    fetch('/save-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            loadUsuarios();
            bootstrap.Modal.getInstance(document.getElementById('usuarioModal')).hide();
            alert('Usuario guardado correctamente');
        } else {
            alert('Error: ' + response.message);
        }
    })
    .catch(err => {
        console.error('Error saving usuario:', err);
        alert('Error al guardar el usuario');
    });
}

function deleteUsuario(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;

    fetch('/delete-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: id })
    })
    .then(res => res.json())
    .then(response => {
        if (response.success) {
            loadUsuarios();
            alert('Usuario eliminado correctamente');
        } else {
            alert('Error: ' + response.message);
        }
    })
    .catch(err => {
        console.error('Error deleting usuario:', err);
        alert('Error al eliminar el usuario');
    });
}

function applyUsuarioFilters() {
    const filterNombreEl = document.getElementById('filterUsuarioNombre');
    const filterCorreoEl = document.getElementById('filterUsuarioCorreo');
    const filterTipoEl = document.getElementById('filterUsuarioTipo');

    if (!filterNombreEl || !filterCorreoEl || !filterTipoEl) {
        console.warn('Usuario filters not available in DOM');
        return;
    }

    const nombre = filterNombreEl.value.toLowerCase().trim();
    const correo = filterCorreoEl.value.toLowerCase().trim();
    const tipo = filterTipoEl.value;

    let filtered = [...allUsuarios];

    if (nombre !== '') {
        filtered = filtered.filter(u => (u.nombre + ' ' + u.apellido).toLowerCase().includes(nombre));
    }

    if (correo !== '') {
        filtered = filtered.filter(u => u.correo.toLowerCase().includes(correo));
    }

    if (tipo !== '') {
        filtered = filtered.filter(u => u.tipo_usuario == tipo);
    }

    renderUsuarioTable(filtered);
    updateUsuarioSummary(filtered);
}

// ========================
// Reportes Management
// ========================

let reportesData = {};

function generarReportes() {
    const periodo = document.getElementById('reportePeriodo').value;

    fetch(`/get-reportes?periodo=${periodo}`)
        .then(res => res.json())
        .then(data => {
            reportesData = data;

            // Update summary cards
            document.getElementById('reporteVentasTotales').textContent = `$${data.ventas_totales.toFixed(2)}`;
            document.getElementById('reportePedidosCompletados').textContent = data.pedidos_completados;
            document.getElementById('reporteProductosVendidos').textContent = data.productos_vendidos;
            document.getElementById('reporteCuponesUsados').textContent = data.cupones_usados;

            // Update detailed table
            renderReporteVentasTable(data.ventas_detalle);

            // Update charts
            updateCharts(data);
        })
        .finally(() => hideLoading('loadingReportes'));
}

function renderReporteVentasTable(ventas) {
    const tbody = document.getElementById('reporteVentasTableBody');
    tbody.innerHTML = '';

    ventas.forEach(venta => {
        const row = document.createElement('tr');
        const fecha = venta.fecha_pago ? new Date(venta.fecha_pago).toLocaleString('es-MX') : 'N/A';

        // Map payment method IDs to names
        const metodoMap = {
            1: 'Tarjeta de Crédito',
            4: 'Transferencia Bancaria',
            5: 'Efectivo en Tienda',
            6: 'OXXO',
            7: 'SPEI'
        };
        const metodoNombre = metodoMap[venta.id_metodo_pago] || 'Desconocido';

        const estadoClass = venta.estado_pago === 'exitoso' ? 'text-success' : 'text-warning';
        const estadoText = venta.estado_pago === 'exitoso' ? 'Exitoso' : 'Pendiente';

        row.innerHTML = `
            <td>${fecha}</td>
            <td>${venta.id_pago}</td>
            <td>${metodoNombre}</td>
            <td>$${parseFloat(venta.monto).toFixed(2)}</td>
            <td><span class="${estadoClass}">${estadoText}</span></td>
            <td>${venta.productos_cantidad || 0}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateCharts(data) {
    // Payment methods chart
    const metodosCtx = document.getElementById('chartMetodosPago');
    if (metodosCtx && data.metodos_pago) {
        const metodoLabels = data.metodos_pago.map(m => {
            const metodoMap = {
                1: 'Tarjeta',
                4: 'Transferencia',
                5: 'Efectivo',
                6: 'OXXO',
                7: 'SPEI'
            };
            return metodoMap[m.id_metodo_pago] || 'Otro';
        });
        const metodoData = data.metodos_pago.map(m => m.total);

        if (window.metodosChart) window.metodosChart.destroy();
        window.metodosChart = new Chart(metodosCtx, {
            type: 'pie',
            data: {
                labels: metodoLabels,
                datasets: [{
                    data: metodoData,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Distribución por Método de Pago'
                    }
                }
            }
        });
    }

    // Products sold chart (simplified - would need actual product sales data)
    const productosCtx = document.getElementById('chartProductosVendidos');
    if (productosCtx) {
        // Mock data for demonstration - in real implementation, get actual top products
        const productosLabels = ['Producto A', 'Producto B', 'Producto C', 'Producto D', 'Producto E'];
        const productosData = [45, 32, 28, 19, 15];

        if (window.productosChart) window.productosChart.destroy();
        window.productosChart = new Chart(productosCtx, {
            type: 'bar',
            data: {
                labels: productosLabels,
                datasets: [{
                    label: 'Unidades Vendidas',
                    data: productosData,
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Productos Más Vendidos'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function initCharts() {
    // Initialize Chart.js if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            console.log('Chart.js loaded');
        };
        document.head.appendChild(script);
    }
}

function exportarReporte(formato) {
    // Simple export functionality - in a real implementation, this would generate actual files
    if (formato === 'pdf') {
        alert('Funcionalidad de exportación a PDF próximamente disponible');
    } else if (formato === 'excel') {
        alert('Funcionalidad de exportación a Excel próximamente disponible');
    }
}

// ========================
// Dashboard Data Loading
// ========================

function loadDashboardData() {
    fetch('/get-dashboard-data')
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                console.error('Error loading dashboard data:', data.error);
                return;
            }

            // Update stat cards
            document.getElementById('ventasHoyValue').textContent = `$${data.ventas_hoy.toFixed(2)}`;
            document.getElementById('pedidosValue').textContent = data.pedidos_hoy;
            document.getElementById('productosValue').textContent = data.total_productos;
            document.getElementById('clientesValue').textContent = data.total_usuarios;

            // Update recent orders table
            renderRecentOrders(data.pedidos_recientes);
        })
        .catch(err => {
            console.error('Error loading dashboard data:', err);
        });
}

function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;

    tbody.innerHTML = '';

    orders.forEach(order => {
        const row = document.createElement('tr');
        const fecha = order.fecha_pago ? new Date(order.fecha_pago).toLocaleString('es-MX') : 'N/A';
        const cliente = order.nombre && order.apellido ? `${order.nombre} ${order.apellido}` : 'Cliente Anónimo';
        const estadoClass = order.estado_pago === 'exitoso' ? 'text-success' : 'text-warning';
        const estadoText = order.estado_pago === 'exitoso' ? 'Completado' : 'Pendiente';

        row.innerHTML = `
            <td>${order.id_pago}</td>
            <td>${cliente}</td>
            <td>${order.productos || 0}</td>
            <td>$${parseFloat(order.monto).toFixed(2)}</td>
            <td><span class="${estadoClass}">${estadoText}</span></td>
            <td>${fecha}</td>
        `;
        tbody.appendChild(row);
    });
}

// ========================
// Dropdown func
// ========================
function toggleAdminDropdown() {
    const menu = document.getElementById('adminDropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

