// ========================
// Base de datos de productos
// ========================
const productsDatabase = {
    chocolates: [
        {
            id: 9,
            name: 'Almendra con Chocolate',
            description: 'Deliciosa almendra cubierta de chocolate',
            price: 38.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Almendra-Con-Chocolate.jpg'
        },
        {
            id: 10,
            name: 'Arándano con Chocolate',
            description: 'Arándano deshidratado cubierto de chocolate',
            price: 42.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/arandano-con-chocolate.png'
        },
        {
            id: 11,
            name: 'Bola de Coco',
            description: 'Cremoso coco cubierto de chocolate',
            price: 28.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Bola-de-Coco.jpg'
        },
        {
            id: 12,
            name: 'Cacahuate con Chocolate',
            description: 'Cacahuate tostado con chocolate',
            price: 25.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/cacahuate-con-chocolate.png'
        },
        {
            id: 13,
            name: 'Café con Chocolate',
            description: 'Bombón de café cubierto de chocolate',
            price: 32.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Cafe-con-Chocolate.jpg'
        },
        {
            id: 14,
            name: 'Canastilla de Cajeta',
            description: 'Dulce de cajeta en chocolate',
            price: 30.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Canastilla-de-Cajeta.jpg'
        },
        {
            id: 15,
            name: 'Canastilla de Rompope',
            description: 'Delicioso rompope en chocolate',
            price: 30.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/canastilla-de-rompope.png'
        },
        {
            id: 16,
            name: 'Centro de Jalea Fresa',
            description: 'Chocolate con jalea de fresa',
            price: 26.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Centro-de-Jalea-Fresa.jpg'
        },
        {
            id: 17,
            name: 'Centro de Jalea Menta',
            description: 'Chocolate con jalea de menta',
            price: 26.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/centro-de-jalea-menta.png'
        },
        {
            id: 18,
            name: 'Centro de Jalea de Higo',
            description: 'Chocolate con jalea de higo',
            price: 28.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/CentroJalea-de-Higo.jpg'
        },
        {
            id: 19,
            name: 'Cereza Envuelta',
            description: 'Cereza en licor cubierta de chocolate',
            price: 35.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/cereza-envuelta.png'
        },
        {
            id: 20,
            name: 'Cereza sin Envolver',
            description: 'Cereza al natural con chocolate',
            price: 34.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Cereza-sin-Envolver.jpg'
        },
        {
            id: 21,
            name: 'Cremas de Café',
            description: 'Suave crema de café',
            price: 24.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/cremas-de-cafe.png'
        },
        {
            id: 22,
            name: 'Cremas de Cajeta',
            description: 'Cremosa cajeta con chocolate',
            price: 24.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Cremas-de-Cajeta.jpg'
        },
        {
            id: 23,
            name: 'Cremas de Durazno',
            description: 'Delicado sabor a durazno',
            price: 24.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/cremas-de-durazno.png'
        },
        {
            id: 24,
            name: 'Cremas de Fresa',
            description: 'Dulce crema de fresa',
            price: 24.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Cremas-de-Fresa.jpg'
        },
        {
            id: 25,
            name: 'Cremas de Limón',
            description: 'Refrescante crema de limón',
            price: 24.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/cremas-de-limon.png'
        },
        {
            id: 26,
            name: 'Cremas de Menta',
            description: 'Fresca crema de menta',
            price: 24.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Cremas-de-Menta.jpg'
        },
        {
            id: 27,
            name: 'Cremas de Naranja',
            description: 'Cítrica crema de naranja',
            price: 24.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/cremas-de-naranja.png'
        },
        {
            id: 28,
            name: 'Cremas de Piña',
            description: 'Tropical crema de piña',
            price: 24.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/cremas-de-piña.png'
        },
        {
            id: 29,
            name: 'Doble de Nuez',
            description: 'Doble porción de nuez con chocolate',
            price: 40.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/doble-de-nuez.png'
        },
        {
            id: 30,
            name: 'Enjambre de Nuez',
            description: 'Múltiples nueces cubiertas',
            price: 45.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/enajmbre-de-nuez.png'
        },
        {
            id: 31,
            name: 'Esponja Fresa',
            description: 'Malvavisco de fresa con chocolate',
            price: 22.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/esponja-fresa.png'
        },
        {
            id: 32,
            name: 'Nuez con Chocolate',
            description: 'Nuez entera cubierta de chocolate',
            price: 38.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Nuez-con-Chocolate.jpg'
        },
        {
            id: 33,
            name: 'Pasa con Chocolate',
            description: 'Uva pasa con chocolate',
            price: 30.00,
            category: 'chocolates',
            image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Pasa-con-Chocolate.jpg'
        }
    ],
    caramelos: [
        {
            id: 34,
            name: 'Ácido Azucarado',
            description: 'Caramelo ácido con azúcar',
            price: 15.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Acido-Azucarado.jpg'
        },
        {
            id: 35,
            name: 'Ácido Envuelto',
            description: 'Caramelo ácido tradicional',
            price: 15.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Acido-Envuelto.jpg'
        },
        {
            id: 36,
            name: 'Anís Envuelto',
            description: 'Caramelo sabor anís',
            price: 12.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Anis-envuento.jpg'
        },
        {
            id: 37,
            name: 'Barril',
            description: 'Caramelo en forma de barril',
            price: 14.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Barril.jpg'
        },
        {
            id: 38,
            name: 'Cajeta Envuelta',
            description: 'Caramelo de cajeta',
            price: 16.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Cajeta-Envuelta.jpg'
        },
        {
            id: 39,
            name: 'Canela Envuelta',
            description: 'Caramelo sabor canela',
            price: 14.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/CanelaEnvuelta.jpg'
        },
        {
            id: 40,
            name: 'Chicloso de Cacao',
            description: 'Chicloso sabor cacao',
            price: 10.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Chicloso-de-Cacao.jpg'
        },
        {
            id: 41,
            name: 'Chicloso de Café',
            description: 'Chicloso sabor café',
            price: 10.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Chicloso-de-Cafe.jpg'
        },
        {
            id: 42,
            name: 'Chicloso de Crema',
            description: 'Chicloso cremoso',
            price: 10.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Chicloso-de-Crema.jpg'
        },
        {
            id: 43,
            name: 'Chocolate Envuelto',
            description: 'Caramelo de chocolate',
            price: 16.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Chocolate-envuelto.jpg'
        },
        {
            id: 44,
            name: 'Cristal Envuelto',
            description: 'Caramelo cristalino',
            price: 12.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Cristal-Envuelto.jpg'
        },
        {
            id: 45,
            name: 'Cuadro Anís',
            description: 'Caramelo cuadrado de anís',
            price: 13.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Cuadro-Anis.jpg'
        },
        {
            id: 46,
            name: 'Cuadro Canela',
            description: 'Caramelo cuadrado de canela',
            price: 13.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Cuadro-Canela.jpg'
        },
        {
            id: 47,
            name: 'Gomita Fresa Limón',
            description: 'Gomitas de fresa y limón',
            price: 18.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Gomita-fresa-limon.jpg'
        },
        {
            id: 48,
            name: 'Gomita Surtida',
            description: 'Gomitas de varios sabores',
            price: 18.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Gomita-surtida.jpg'
        },
        {
            id: 49,
            name: 'Jalea Corazón',
            description: 'Jalea en forma de corazón',
            price: 20.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Jalea-Corazon.jpg'
        },
        {
            id: 50,
            name: 'Jalea de Durazno',
            description: 'Jalea sabor durazno',
            price: 19.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Jalea-de-durazno.jpg'
        },
        {
            id: 51,
            name: 'Jalea Envuelto',
            description: 'Jalea tradicional envuelta',
            price: 18.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Jalea-envuelto.jpg'
        },
        {
            id: 52,
            name: 'Jalea Gajos de Limón',
            description: 'Jalea con sabor a limón',
            price: 19.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Jalea-Gajos-de-Limon.jpg'
        },
        {
            id: 53,
            name: 'Jalea Gajos de Naranja',
            description: 'Jalea con sabor a naranja',
            price: 19.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Jalea-Gajos-de-Naranja.jpg'
        },
        {
            id: 54,
            name: 'Jalea Uva Naranja',
            description: 'Jalea de uva y naranja',
            price: 19.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Jalea-Uva-Naranja.jpg'
        },
        {
            id: 55,
            name: 'Menta Rayada',
            description: 'Caramelo de menta rayado',
            price: 16.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Menta-Rayada.jpg'
        },
        {
            id: 56,
            name: 'Olímpico',
            description: 'Caramelo olímpico tradicional',
            price: 17.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Olimpico.jpg'
        },
        {
            id: 57,
            name: 'Surtido Macizo',
            description: 'Caramelos macizos surtidos',
            price: 22.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Surtido-Macizo.jpg'
        },
        {
            id: 58,
            name: 'Torino de Cacao',
            description: 'Torino sabor cacao',
            price: 20.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Torino-de-Cacao.jpg'
        },
        {
            id: 59,
            name: 'Torino de Plátano',
            description: 'Torino sabor plátano',
            price: 20.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Torino-de-Platano.jpg'
        },
        {
            id: 60,
            name: 'Yerbabuena Envuelto',
            description: 'Caramelo de yerbabuena',
            price: 14.00,
            category: 'caramelos',
            image: 'img/Caramelos, chiclosos, jaleas y gomitas/Yerba-buena-envuelto.jpg'
        }
    ],
    presentaciones: [
        {
            id: 61,
            name: 'Estuche Cereza Envuelto',
            description: 'Estuche con cerezas envueltas',
            price: 180.00,
            category: 'presentaciones',
            image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/04EstucheCrerezaEnvuelto.jpg'
        },
        {
            id: 62,
            name: 'Marqueta de Mesa Semiamargo',
            description: 'Tablilla grande de chocolate semiamargo',
            price: 95.00,
            category: 'presentaciones',
            image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/marqueta-de-mesa-semiamargo.png'
        },
        {
            id: 63,
            name: 'Tablilla Amargo',
            description: 'Tablilla de chocolate amargo',
            price: 45.00,
            category: 'presentaciones',
            image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/tablilla-amargo.png'
        },
        {
            id: 64,
            name: 'Tablilla Avellana',
            description: 'Tablilla de chocolate con avellana',
            price: 48.00,
            category: 'presentaciones',
            image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/tablilla-avellana.png'
        },
        {
            id: 65,
            name: 'Vitrolero Esponja',
            description: 'Presentación grande de esponjas',
            price: 350.00,
            category: 'presentaciones',
            image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/VitroleroEsponja2.jpg'
        },
        {
            id: 66,
            name: 'Vitrolero Púrpura y Oro',
            description: 'Presentación grande púrpura y oro',
            price: 380.00,
            category: 'presentaciones',
            image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/VITROLEROPURPURA2.jpg'
        }
    ],
    temporalidades: [
        {
            id: 67,
            name: 'Barra Turrón',
            description: 'Deliciosa barra de turrón',
            price: 55.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/BarraTurron.jpg'
        },
        {
            id: 68,
            name: 'Calabaza de Jalea',
            description: 'Calabaza de jalea para Halloween',
            price: 35.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/CalabazadeJalea.jpg'
        },
        {
            id: 69,
            name: 'Calavera de Chocolate',
            description: 'Calavera de chocolate Día de Muertos',
            price: 65.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/calavera-de-chocolate.jpg'
        },
        {
            id: 70,
            name: 'Colación',
            description: 'Tradicional colación navideña',
            price: 45.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/Colacion.jpg'
        },
        {
            id: 71,
            name: 'Huevo de Chocolate',
            description: 'Huevo de chocolate para Pascua',
            price: 85.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/Huevo.jpg'
        },
        {
            id: 72,
            name: 'Huevo Pascua Grande',
            description: 'Huevo grande de Pascua decorado',
            price: 120.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/HuevoPascua2.jpg'
        },
        {
            id: 73,
            name: 'Quebradizo Cacahuate',
            description: 'Quebradizo con cacahuate',
            price: 48.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/QuebradizoCacahuate.jpg'
        },
        {
            id: 74,
            name: 'Quebradizo Combinado',
            description: 'Quebradizo de semillas mixtas',
            price: 50.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/QuebradizoCombinado.jpg'
        },
        {
            id: 75,
            name: 'Quebradizo Nuez',
            description: 'Quebradizo con nuez',
            price: 55.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/QuebradizoNuez.jpg'
        },
        {
            id: 76,
            name: 'Quebradizo Pepita',
            description: 'Quebradizo con pepita',
            price: 48.00,
            category: 'temporalidades',
            image: 'img/Temporalidades/QuebradizoPepita.jpg'
        }
    ]
};

// Productos favoritos del carrusel
const favoritosProducts = [
    { id: 1, name: 'Tornillo', description: 'Delicioso chocolate macizo con leche', price: 25.00, image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/02Tornillo.jpg' },
    { id: 2, name: 'Princesa Surtida', description: 'Bombón de chocolate amargo relleno de fondant y jalea', price: 30.00, image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/09PrincesaSurtida.jpg' },
    { id: 3, name: 'Duquesa', description: 'Irresistible sandwich de galleta con jalea y chocolate', price: 28.00, image: 'img/Piezas, Presentaciones, Tablillas y Bolsas/DUQUESA-PRESENTACIONES.jpg' },
    { id: 4, name: 'Esponja Natural', description: 'Suave malvavisco cubierto de chocolate amargo', price: 22.00, image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/Esponja-Natural.jpg' },
    { id: 5, name: 'Figuras', description: 'Tradicional chocolate macizo semiamargo', price: 20.00, image: 'img/Chocolates envueltos, sin envolver y semillas cubiertas/figura.png' },
    { id: 6, name: 'Menta Blanca', description: 'Delicioso caramelo aireado sabor menta', price: 18.00, image: 'img/Caramelos, chiclosos, jaleas y gomitas/Menta-Blanca.jpg' },
    { id: 7, name: 'Nuez Encanelada', description: 'Sabrosa nuez cubierta con jarabe de cajeta y canela', price: 35.00, image: 'img/Temporalidades/nuez-encanelada.png' },
    { id: 8, name: 'Púrpura y Oro', description: 'Exquisito chocolate crocante relleno de cacahuate', price: 32.00, image: 'img/Caramelos, chiclosos, jaleas y gomitas/Purupura-y-Oro-Envuelto.jpg' }
];

// Combinar todos los productos
const allProducts = [
    ...favoritosProducts,
    ...productsDatabase.chocolates,
    ...productsDatabase.caramelos,
    ...productsDatabase.presentaciones,
    ...productsDatabase.temporalidades
];

// ========================
// Estado de la aplicación
// ========================
let currentFilter = 'todos';
let displayedProducts = 12;
let searchQuery = '';

// ========================
// Funciones de renderizado
// ========================
function renderProducts(filter = 'todos', limit = 12, search = '') {
    const grid = document.getElementById('productosGrid');
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    if (!grid) return;
    
    let products = allProducts;
    
    // Aplicar búsqueda por texto
    if (search.trim() !== '') {
        const searchLower = search.toLowerCase();
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            p.description.toLowerCase().includes(searchLower)
        );
    }
    
    // Aplicar filtro de categoría
    if (filter !== 'todos') {
        products = products.filter(p => p.category === filter || p.image.includes(filter));
    }
    
    // Mostrar información de resultados de búsqueda
    if (searchResultsInfo) {
        if (search.trim() !== '') {
            searchResultsInfo.style.display = 'block';
            searchResultsInfo.querySelector('p').textContent = 
                `Se encontraron ${products.length} producto${products.length !== 1 ? 's' : ''} para "${search}"`;
        } else {
            searchResultsInfo.style.display = 'none';
        }
    }
    
    // Limitar productos mostrados
    const productsToShow = products.slice(0, limit);
    
    // Renderizar productos
    if (productsToShow.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda o categoría</p>
            </div>
        `;
    } else {
        grid.innerHTML = productsToShow.map(product => `
            <div class="product-card" data-category="${product.category || 'chocolates'}">
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
    }
    
    // Actualizar botón "Cargar más"
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        if (products.length <= limit) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
    
    // Reattach event listeners
    attachAddToCartListeners();
    
    // Animación de entrada
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
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const product = {
                id: parseInt(this.dataset.id),
                name: this.dataset.name,
                price: parseFloat(this.dataset.price),
                image: this.dataset.image,
                quantity: 1
            };
            addToCart(product);
            showNotification('Producto agregado al carrito');
        });
    });
}

// ========================
// Filtros de productos
// ========================
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos
            filterBtns.forEach(b => b.classList.remove('active'));
            // Agregar clase active al clickeado
            this.classList.add('active');
            
            // Obtener filtro
            currentFilter = this.dataset.filter;
            displayedProducts = 12;
            
            // Renderizar productos filtrados
            renderProducts(currentFilter, displayedProducts, searchQuery);
        });
    });
}

// ========================
// Búsqueda de productos
// ========================
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    if (!searchInput) return;
    
    // Evento de búsqueda con debounce
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchQuery = this.value;
        
        // Mostrar/ocultar botón de limpiar
        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        }
        
        // Búsqueda con delay para mejor rendimiento
        searchTimeout = setTimeout(() => {
            displayedProducts = 12;
            renderProducts(currentFilter, displayedProducts, searchQuery);
        }, 300);
    });
    
    // Limpiar búsqueda
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchQuery = '';
            this.style.display = 'none';
            displayedProducts = 12;
            renderProducts(currentFilter, displayedProducts, searchQuery);
            searchInput.focus();
        });
    }
    
    // Búsqueda al presionar Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchQuery = this.value;
            displayedProducts = 12;
            renderProducts(currentFilter, displayedProducts, searchQuery);
        }
    });
}

// ========================
// Cargar más productos
// ========================
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            displayedProducts += 12;
            renderProducts(currentFilter, displayedProducts, searchQuery);
        });
    }
}

// ========================
// Categorías clickeables
// ========================
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
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

// ========================
// Inicialización
// ========================
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    setupFilters();
    setupSearch();
    setupLoadMore();
    setupCategoryCards();
});

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

