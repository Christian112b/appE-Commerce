document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();

        // Quitar clase activa del menú
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');

        // Ocultar todas las secciones
        document.querySelectorAll('.card-section').forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar la sección correspondiente
        const target = this.getAttribute('data-section') + 'Card';
        const sectionToShow = document.getElementById(target);
        if (sectionToShow) {
            sectionToShow.style.display = 'block';
        }
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

    console.log(categorias)

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
        `;
        tbody.appendChild(row);
    });
}



// ========================
// Filtros para la tabla
// ========================
function applyProductFilters() {
    const filterActiveEl = document.getElementById('filterActive');
    // const filterStockEl = document.getElementById('filterStock');
    const filterCategoriaEl = document.getElementById('filterCategoria');

    console.log({ filterActiveEl, filterCategoriaEl });

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
// Dropdown func
// ========================
function toggleAdminDropdown() {
    const menu = document.getElementById('adminDropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

