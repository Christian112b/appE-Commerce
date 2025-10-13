document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();

        // Quitar clase activa del menú
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');

        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar la sección correspondiente
        const targetId = 'section-' + this.getAttribute('data-section');
        const sectionToShow = document.getElementById(targetId);
        if (sectionToShow) {
            sectionToShow.classList.add('active');
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
// Dropdown func
// ========================
function toggleAdminDropdown() {
    const menu = document.getElementById('adminDropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

