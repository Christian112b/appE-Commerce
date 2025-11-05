# DIAGRAMAS DE ARQUITECTURA FRONTEND
## Chocolates Costanzo - E-Commerce

**Proyecto:** Sistema de E-Commerce para Chocolates Costanzo  
**Institución:** Universidad Politécnica de San Luis Potosí  
**Versión:** 1.5.0  
**Fecha:** Octubre 2025

---

## ÍNDICE

1. Arquitectura General del Sistema
2. Estructura de Componentes
3. Flujo de Navegación del Usuario
4. Flujo del Sistema de Productos
5. Flujo del Carrito de Compras
6. Flujo de Búsqueda y Filtrado
7. Ciclo de Vida de la Aplicación
8. Integración con APIs Externas
9. Diagrama de Estados del Carrito
10. Estructura de Archivos del Proyecto

---

## 1. ARQUITECTURA GENERAL DEL SISTEMA

```mermaid
graph TB
    subgraph "Capa de Presentación"
        HTML[HTML5<br/>Estructura Semántica]
        CSS[CSS3<br/>Estilos y Animaciones]
    end
    
    subgraph "Capa de Lógica"
        MAIN[main.js<br/>Navegación & UI]
        PRODUCTS[products.js<br/>Productos & Búsqueda]
        CART[cart.js<br/>Carrito de Compras]
        CHATBOT[chatbot.js<br/>Bot Inteligente]
        HISTORIA[historia.js<br/>Carrusel Historia]
        PROMO[promociones.js<br/>Banner Promociones]
        VIDEO[video.js<br/>Control Video]
    end
    
    subgraph "Capa de Datos"
        DB[(Base de Datos<br/>Productos)]
        LS[(LocalStorage<br/>Carrito & Sesión)]
    end
    
    subgraph "APIs Externas"
        MEM0[Mem0 API<br/>Chatbot Memory]
        FONTS[Google Fonts]
        FA[Font Awesome<br/>Iconos]
    end
    
    HTML --> MAIN
    HTML --> PRODUCTS
    HTML --> CART
    HTML --> CHATBOT
    
    CSS --> HTML
    
    MAIN --> LS
    PRODUCTS --> DB
    CART --> LS
    CHATBOT --> MEM0
    
    MAIN --> FONTS
    MAIN --> FA
    
    PRODUCTS --> CART
    MAIN --> HISTORIA
    MAIN --> PROMO
    MAIN --> VIDEO
    
    style HTML fill:#ff8c00,stroke:#8B4513,color:#fff
    style CSS fill:#D2691E,stroke:#8B4513,color:#fff
    style MAIN fill:#FFB347,stroke:#8B4513
    style PRODUCTS fill:#FFB347,stroke:#8B4513
    style CART fill:#FFB347,stroke:#8B4513
    style CHATBOT fill:#FFB347,stroke:#8B4513
    style DB fill:#8B4513,stroke:#333,color:#fff
    style LS fill:#8B4513,stroke:#333,color:#fff
    style MEM0 fill:#CD5C5C,stroke:#333,color:#fff
```

---

## 2. ESTRUCTURA DE COMPONENTES

```mermaid
graph TD
    ROOT[Index.html - Página Principal]
    
    ROOT --> NAV[Navegación Sticky]
    ROOT --> HERO[Hero Slider]
    ROOT --> CAT[Categorías]
    ROOT --> FAV[Favoritos Carousel]
    ROOT --> PROD[Productos]
    ROOT --> PROMO[Promociones Banner]
    ROOT --> HIST[Historia Carousel]
    ROOT --> VIDEO[Video Promocional]
    ROOT --> SOBRE[Sobre Nosotros]
    ROOT --> FAQ[FAQ Accordion]
    ROOT --> CONTACT[Contacto]
    ROOT --> FOOTER[Footer]
    
    ROOT --> CART_SIDE[Cart Sidebar]
    ROOT --> CHATBOT_UI[Chatbot Widget]
    
    NAV --> MENU[Menú Links]
    NAV --> HAMBURGER[Hamburger Mobile]
    NAV --> CART_BTN[Botón Carrito]
    NAV --> ADMIN_LINK[Link Admin]
    
    HERO --> SLIDES[3 Slides]
    HERO --> CONTROLS[Controles Prev/Next]
    HERO --> INDICATORS[Indicadores]
    
    PROD --> SEARCH[Buscador]
    PROD --> FILTERS[Filtros Categoría]
    PROD --> GRID[Grid Productos]
    PROD --> LOADMORE[Cargar Más]
    
    SEARCH --> INPUT[Input Búsqueda]
    SEARCH --> CLEAR[Botón Limpiar]
    SEARCH --> RESULTS_INFO[Info Resultados]
    
    CART_SIDE --> CART_HEADER[Header Carrito]
    CART_SIDE --> CART_ITEMS[Lista Items]
    CART_SIDE --> CART_SUMMARY[Resumen]
    CART_SIDE --> CHECKOUT_BTN[Botón Checkout]
    
    CART_SUMMARY --> SUBTOTAL[Subtotal]
    CART_SUMMARY --> IVA[IVA 16%]
    CART_SUMMARY --> TOTAL[Total]
    
    style ROOT fill:#ff8c00,stroke:#8B4513,color:#fff
    style NAV fill:#FFB347,stroke:#8B4513
    style PROD fill:#FFB347,stroke:#8B4513
    style CART_SIDE fill:#CD5C5C,stroke:#8B4513,color:#fff
    style SEARCH fill:#DAA520,stroke:#8B4513
```

---

## 3. FLUJO DE NAVEGACIÓN DEL USUARIO

```mermaid
flowchart TD
    START([Usuario Ingresa al Sitio])
    
    START --> LOAD[Carga index.html]
    LOAD --> INIT[Inicialización JS]
    
    INIT --> LOAD_CART[Cargar Carrito desde LocalStorage]
    INIT --> RENDER_PRODUCTS[Renderizar Productos]
    INIT --> INIT_HERO[Iniciar Hero Slider]
    INIT --> INIT_CHATBOT[Iniciar Chatbot]
    
    RENDER_PRODUCTS --> BROWSE{Usuario Navega}
    
    BROWSE -->|Explora Categorías| FILTER[Aplicar Filtro]
    BROWSE -->|Busca Producto| SEARCH[Usar Buscador]
    BROWSE -->|Scroll Down| SECTIONS[Ver Secciones]
    BROWSE -->|Click Producto| ADD_CART[Agregar al Carrito]
    
    FILTER --> UPDATE_VIEW[Actualizar Vista]
    SEARCH --> UPDATE_VIEW
    UPDATE_VIEW --> BROWSE
    
    ADD_CART --> CART_UPDATE[Actualizar Carrito]
    CART_UPDATE --> NOTIFY[Mostrar Notificación]
    NOTIFY --> BROWSE
    
    SECTIONS -->|Historia| VIEW_HISTORY[Ver Carrusel Historia]
    SECTIONS -->|Promociones| VIEW_PROMO[Ver Promociones]
    SECTIONS -->|Video| WATCH_VIDEO[Reproducir Video]
    SECTIONS -->|FAQ| READ_FAQ[Leer Preguntas]
    SECTIONS -->|Contacto| FILL_FORM[Llenar Formulario]
    
    VIEW_HISTORY --> BROWSE
    VIEW_PROMO --> BROWSE
    WATCH_VIDEO --> BROWSE
    READ_FAQ --> BROWSE
    FILL_FORM --> SUBMIT{Enviar?}
    
    SUBMIT -->|Sí| CONFIRM[Confirmación]
    SUBMIT -->|No| BROWSE
    CONFIRM --> BROWSE
    
    BROWSE -->|Ir a Carrito| OPEN_CART[Abrir Sidebar Carrito]
    OPEN_CART --> REVIEW[Revisar Items]
    REVIEW --> MODIFY{Modificar?}
    
    MODIFY -->|Cambiar Cantidad| UPDATE_QTY[Actualizar Cantidad]
    MODIFY -->|Eliminar| REMOVE_ITEM[Eliminar Item]
    MODIFY -->|Checkout| CHECKOUT[Proceso de Pago]
    MODIFY -->|Cerrar| BROWSE
    
    UPDATE_QTY --> REVIEW
    REMOVE_ITEM --> REVIEW
    
    CHECKOUT --> FILL_CHECKOUT[Llenar Datos]
    FILL_CHECKOUT --> VALIDATE{Datos Válidos?}
    
    VALIDATE -->|No| FILL_CHECKOUT
    VALIDATE -->|Sí| CONFIRM_ORDER[Confirmar Pedido]
    
    CONFIRM_ORDER --> SUCCESS[Pedido Exitoso]
    SUCCESS --> CLEAR_CART[Limpiar Carrito]
    CLEAR_CART --> END([Fin del Flujo])
    
    BROWSE -->|Usar Chatbot| CHAT[Interactuar con Bot]
    CHAT --> BROWSE
    
    style START fill:#8B4513,stroke:#333,color:#fff
    style END fill:#8B4513,stroke:#333,color:#fff
    style BROWSE fill:#ff8c00,stroke:#8B4513,color:#fff
    style CHECKOUT fill:#CD5C5C,stroke:#8B4513,color:#fff
    style SUCCESS fill:#2ecc71,stroke:#27ae60,color:#fff
```

---

## 4. FLUJO DEL SISTEMA DE PRODUCTOS

```mermaid
flowchart TD
    START([Iniciar App])
    
    START --> LOAD_DB[Cargar Base de Datos de Productos]
    
    LOAD_DB --> DB_LOADED{76 Productos<br/>Cargados}
    
    DB_LOADED --> CATEGORIES[4 Categorías<br/>Definidas]
    
    CATEGORIES --> CHOC[Chocolates<br/>25 productos]
    CATEGORIES --> CARA[Caramelos<br/>27 productos]
    CATEGORIES --> PRES[Presentaciones<br/>6 productos]
    CATEGORIES --> TEMP[Temporalidades<br/>10 productos]
    
    CHOC --> COMBINE[Combinar con<br/>Favoritos]
    CARA --> COMBINE
    PRES --> COMBINE
    TEMP --> COMBINE
    
    COMBINE --> ALL_PRODUCTS[allProducts Array<br/>84 productos totales]
    
    ALL_PRODUCTS --> INIT_STATE[Inicializar Estado]
    
    INIT_STATE --> FILTER_STATE[currentFilter = 'todos']
    INIT_STATE --> DISPLAY_STATE[displayedProducts = 12]
    INIT_STATE --> SEARCH_STATE[searchQuery = '']
    
    FILTER_STATE --> RENDER{Renderizar Productos}
    DISPLAY_STATE --> RENDER
    SEARCH_STATE --> RENDER
    
    RENDER --> APPLY_SEARCH{¿Hay búsqueda?}
    
    APPLY_SEARCH -->|Sí| FILTER_BY_TEXT[Filtrar por Texto<br/>nombre o descripción]
    APPLY_SEARCH -->|No| APPLY_CATEGORY
    
    FILTER_BY_TEXT --> APPLY_CATEGORY{¿Filtro categoría?}
    
    APPLY_CATEGORY -->|Sí| FILTER_CAT[Filtrar por<br/>Categoría]
    APPLY_CATEGORY -->|No| LIMIT
    
    FILTER_CAT --> LIMIT[Limitar a<br/>displayedProducts]
    
    LIMIT --> CHECK_RESULTS{¿Hay productos?}
    
    CHECK_RESULTS -->|No| NO_RESULTS[Mostrar Mensaje<br/>'Sin Resultados']
    CHECK_RESULTS -->|Sí| GENERATE_HTML[Generar HTML<br/>Dinámico]
    
    GENERATE_HTML --> INSERT_DOM[Insertar en DOM]
    INSERT_DOM --> ATTACH_LISTENERS[Adjuntar Event<br/>Listeners]
    ATTACH_LISTENERS --> ANIMATE[Animar Entrada]
    
    NO_RESULTS --> DISPLAY
    ANIMATE --> DISPLAY[Mostrar Productos]
    
    DISPLAY --> WAIT_ACTION{Esperar Acción}
    
    WAIT_ACTION -->|Búsqueda| UPDATE_SEARCH[Actualizar searchQuery]
    WAIT_ACTION -->|Filtro| UPDATE_FILTER[Actualizar currentFilter]
    WAIT_ACTION -->|Load More| INCREASE[displayedProducts += 12]
    WAIT_ACTION -->|Add to Cart| ADD_CART[Agregar a Carrito]
    
    UPDATE_SEARCH --> RENDER
    UPDATE_FILTER --> RENDER
    INCREASE --> RENDER
    ADD_CART --> WAIT_ACTION
    
    style START fill:#8B4513,stroke:#333,color:#fff
    style ALL_PRODUCTS fill:#ff8c00,stroke:#8B4513,color:#fff
    style RENDER fill:#FFB347,stroke:#8B4513
    style DISPLAY fill:#2ecc71,stroke:#27ae60,color:#fff
```

---

## 5. FLUJO DEL CARRITO DE COMPRAS

```mermaid
stateDiagram-v2
    [*] --> CarritoVacio
    
    CarritoVacio --> CarritoConItems: Agregar Producto
    
    CarritoConItems --> CarritoConItems: Agregar Más Productos
    CarritoConItems --> CarritoConItems: Incrementar Cantidad
    CarritoConItems --> CarritoConItems: Decrementar Cantidad
    CarritoConItems --> CarritoConItems: Eliminar Producto (otros items)
    CarritoConItems --> CarritoVacio: Eliminar Último Producto
    CarritoConItems --> CarritoVacio: Limpiar Carrito
    
    CarritoConItems --> ProcesandoCheckout: Click Checkout
    
    ProcesandoCheckout --> LlenandoDatos: Abrir Modal
    LlenandoDatos --> ValidandoDatos: Enviar Formulario
    
    ValidandoDatos --> LlenandoDatos: Datos Inválidos
    ValidandoDatos --> ConfirmandoOrden: Datos Válidos
    
    ConfirmandoOrden --> PedidoConfirmado: Confirmar
    ConfirmandoOrden --> CarritoConItems: Cancelar
    
    PedidoConfirmado --> CarritoVacio: Limpiar Carrito
    
    CarritoVacio --> [*]
    PedidoConfirmado --> [*]
    
    note right of CarritoVacio
        cart = []
        Total: $0.00
    end note
    
    note right of CarritoConItems
        cart.length > 0
        Calcular:
        - Subtotal
        - IVA (16%)
        - Total
        Guardar en LocalStorage
    end note
    
    note right of PedidoConfirmado
        Generar número de orden
        Mostrar confirmación
        Enviar notificación
    end note
```

---

## 6. FLUJO DE BÚSQUEDA Y FILTRADO

```mermaid
sequenceDiagram
    participant Usuario
    participant Input as Input Búsqueda
    participant Debounce as Debounce Timer
    participant Logic as Lógica Búsqueda
    participant Products as Array Productos
    participant Filters as Filtros Categoría
    participant DOM as Grid DOM
    participant UI as Actualización UI
    
    Usuario->>Input: Escribe texto
    Input->>Debounce: Reiniciar timer (300ms)
    
    Note over Debounce: Espera 300ms sin cambios
    
    Debounce->>Logic: Ejecutar búsqueda
    Logic->>Products: Obtener todos los productos
    
    alt Hay texto de búsqueda
        Logic->>Products: Filtrar por nombre/descripción
        Products-->>Logic: Productos filtrados
    else Sin búsqueda
        Products-->>Logic: Todos los productos
    end
    
    Logic->>Filters: ¿Hay filtro activo?
    
    alt Filtro activo != 'todos'
        Filters->>Products: Filtrar por categoría
        Products-->>Logic: Productos filtrados
    else Filtro = 'todos'
        Products-->>Logic: Sin filtro categoría
    end
    
    Logic->>Logic: Limitar a displayedProducts
    
    alt Sin resultados
        Logic->>DOM: Insertar mensaje "Sin Resultados"
        DOM->>UI: Mostrar ícono de búsqueda
        UI->>Usuario: Sugerir otros términos
    else Hay resultados
        Logic->>DOM: Generar HTML productos
        DOM->>UI: Renderizar grid
        UI->>UI: Mostrar contador resultados
        UI->>UI: Adjuntar listeners "Agregar"
        UI->>UI: Animar entrada (stagger)
        UI->>Usuario: Mostrar productos
    end
    
    Usuario->>Input: Click botón limpiar (X)
    Input->>Logic: searchQuery = ''
    Logic->>DOM: Re-renderizar sin filtro
    DOM->>Usuario: Mostrar todos (filtro actual)
```

---

## 7. CICLO DE VIDA DE LA APLICACIÓN

```mermaid
graph TD
    START([Usuario Carga Página])
    
    START --> PARSE_HTML[Navegador Parsea HTML]
    PARSE_HTML --> LOAD_CSS[Cargar styles.css]
    PARSE_HTML --> LOAD_JS[Cargar Scripts JS]
    
    LOAD_CSS --> APPLY_STYLES[Aplicar Estilos]
    
    LOAD_JS --> MAIN_JS[main.js]
    LOAD_JS --> PRODUCTS_JS[products.js]
    LOAD_JS --> CART_JS[cart.js]
    LOAD_JS --> CHATBOT_JS[chatbot.js]
    LOAD_JS --> HISTORIA_JS[historia.js]
    LOAD_JS --> PROMO_JS[promociones.js]
    LOAD_JS --> VIDEO_JS[video.js]
    
    MAIN_JS --> DOM_READY{DOMContentLoaded}
    PRODUCTS_JS --> DOM_READY
    CART_JS --> DOM_READY
    CHATBOT_JS --> DOM_READY
    HISTORIA_JS --> DOM_READY
    PROMO_JS --> DOM_READY
    VIDEO_JS --> DOM_READY
    
    DOM_READY --> INIT_MAIN[Inicializar main.js]
    DOM_READY --> INIT_PRODUCTS[Inicializar products.js]
    DOM_READY --> INIT_CART[Inicializar cart.js]
    DOM_READY --> INIT_CHATBOT[Inicializar chatbot.js]
    
    INIT_MAIN --> SETUP_NAV[Setup Navegación]
    INIT_MAIN --> SETUP_HERO[Setup Hero Slider]
    INIT_MAIN --> SETUP_FAQ[Setup FAQ]
    INIT_MAIN --> SETUP_SCROLL[Setup Scroll Spy]
    
    INIT_PRODUCTS --> RENDER_PRODUCTS[Renderizar Productos]
    INIT_PRODUCTS --> SETUP_FILTERS[Setup Filtros]
    INIT_PRODUCTS --> SETUP_SEARCH[Setup Búsqueda]
    INIT_PRODUCTS --> SETUP_LOADMORE[Setup Load More]
    INIT_PRODUCTS --> SETUP_CATEGORIES[Setup Categorías]
    
    INIT_CART --> LOAD_STORAGE[Cargar desde LocalStorage]
    INIT_CART --> UPDATE_CART_UI[Actualizar UI Carrito]
    INIT_CART --> SETUP_CART_LISTENERS[Setup Listeners]
    
    INIT_CHATBOT --> CREATE_WIDGET[Crear Widget]
    INIT_CHATBOT --> SETUP_MESSAGES[Setup Mensajes]
    INIT_CHATBOT --> INIT_MEM0[Conectar Mem0 API]
    
    SETUP_NAV --> AUTO_START_HERO[Auto-start Hero]
    SETUP_HERO --> AUTO_START_HERO
    
    AUTO_START_HERO --> READY[App Lista]
    RENDER_PRODUCTS --> READY
    UPDATE_CART_UI --> READY
    CREATE_WIDGET --> READY
    
    READY --> INTERACTIVE[Estado Interactivo]
    
    INTERACTIVE --> USER_EVENTS[Escuchar Eventos Usuario]
    
    USER_EVENTS --> CLICK_EVENT[Click]
    USER_EVENTS --> INPUT_EVENT[Input]
    USER_EVENTS --> SCROLL_EVENT[Scroll]
    USER_EVENTS --> HOVER_EVENT[Hover]
    
    CLICK_EVENT --> HANDLE_CLICK[Manejar Click]
    INPUT_EVENT --> HANDLE_INPUT[Manejar Input]
    SCROLL_EVENT --> HANDLE_SCROLL[Manejar Scroll]
    HOVER_EVENT --> HANDLE_HOVER[Manejar Hover]
    
    HANDLE_CLICK --> UPDATE_STATE[Actualizar Estado]
    HANDLE_INPUT --> UPDATE_STATE
    HANDLE_SCROLL --> UPDATE_STATE
    HANDLE_HOVER --> UPDATE_STATE
    
    UPDATE_STATE --> UPDATE_UI[Actualizar UI]
    UPDATE_UI --> SAVE_STATE[Guardar Estado<br/>LocalStorage]
    
    SAVE_STATE --> USER_EVENTS
    
    style START fill:#8B4513,stroke:#333,color:#fff
    style READY fill:#2ecc71,stroke:#27ae60,color:#fff
    style INTERACTIVE fill:#ff8c00,stroke:#8B4513,color:#fff
```

---

## 8. INTEGRACIÓN CON APIs EXTERNAS

```mermaid
graph LR
    subgraph "Frontend Application"
        CHATBOT_UI[Chatbot UI]
        FONTS_UI[Textos con Fuentes]
        ICONS_UI[Iconos UI]
    end
    
    subgraph "APIs Externas"
        MEM0_API[Mem0 API<br/>api.mem0.ai/v1/]
        GOOGLE_FONTS[Google Fonts API<br/>fonts.googleapis.com]
        FONT_AWESOME[Font Awesome CDN<br/>cdnjs.cloudflare.com]
    end
    
    CHATBOT_UI -->|POST /chat/| MEM0_API
    MEM0_API -->|JSON Response| CHATBOT_UI
    
    FONTS_UI -->|Request Fonts| GOOGLE_FONTS
    GOOGLE_FONTS -->|.woff2 Files| FONTS_UI
    
    ICONS_UI -->|Request Icons| FONT_AWESOME
    FONT_AWESOME -->|.css + Fonts| ICONS_UI
    
    subgraph "Request Headers"
        AUTH[Authorization: Token API_KEY]
        CONTENT[Content-Type: application/json]
    end
    
    CHATBOT_UI --> AUTH
    CHATBOT_UI --> CONTENT
    
    subgraph "Response Data"
        CHAT_RESPONSE[response: string<br/>memory: array]
        FONT_DATA[Font Files: Poppins, Playfair]
        ICON_DATA[Icon Classes: fa-*]
    end
    
    MEM0_API --> CHAT_RESPONSE
    GOOGLE_FONTS --> FONT_DATA
    FONT_AWESOME --> ICON_DATA
    
    style MEM0_API fill:#CD5C5C,stroke:#333,color:#fff
    style GOOGLE_FONTS fill:#4285F4,stroke:#333,color:#fff
    style FONT_AWESOME fill:#339AF0,stroke:#333,color:#fff
    style CHATBOT_UI fill:#FFB347,stroke:#8B4513
```

---

## 9. DIAGRAMA DE ESTADOS DEL CARRITO

```mermaid
stateDiagram-v2
    [*] --> Inicializando
    
    Inicializando --> Cargando: DOMContentLoaded
    
    Cargando --> Vacio: LocalStorage vacío
    Cargando --> ConItems: LocalStorage con datos
    
    state Vacio {
        [*] --> MostrandoVacio
        MostrandoVacio --> MostrandoIcono: Renderizar
        MostrandoIcono --> EsperandoAccion
    }
    
    state ConItems {
        [*] --> RenderizandoItems
        RenderizandoItems --> CalculandoSubtotal
        CalculandoSubtotal --> CalculandoIVA
        CalculandoIVA --> CalculandoTotal
        CalculandoTotal --> MostrandoResumen
        MostrandoResumen --> ActualizandoBadge
        ActualizandoBadge --> ListoParaInteractuar
    }
    
    Vacio --> ConItems: addToCart()
    
    ConItems --> ConItems: updateQuantity(+1)
    ConItems --> ConItems: updateQuantity(-1) && qty > 0
    ConItems --> Vacio: updateQuantity(-1) && qty == 0
    ConItems --> Vacio: removeFromCart() && cart.length == 0
    ConItems --> ConItems: removeFromCart() && cart.length > 0
    ConItems --> Vacio: clearCart()
    
    ConItems --> ProcesandoCheckout: Click Checkout
    
    state ProcesandoCheckout {
        [*] --> MostrandoModal
        MostrandoModal --> ValidandoFormulario
        ValidandoFormulario --> MostrandoErrores: Inválido
        MostrandoErrores --> ValidandoFormulario
        ValidandoFormulario --> GenerandoOrden: Válido
        GenerandoOrden --> MostrandoConfirmacion
    }
    
    ProcesandoCheckout --> ConItems: Cancelar
    ProcesandoCheckout --> Vacio: Confirmar Orden
    
    Vacio --> [*]: Usuario sale
    ConItems --> [*]: Usuario sale
    
    note right of Vacio
        cart = []
        badge = 0
        subtotal = $0
        iva = $0
        total = $0
    end note
    
    note right of ConItems
        cart.length > 0
        badge = sum(quantities)
        subtotal = sum(price * qty)
        iva = subtotal * 0.16
        total = subtotal + iva
        LocalStorage actualizado
    end note
```

---

## 10. ESTRUCTURA DE ARCHIVOS DEL PROYECTO

```mermaid
graph TD
    ROOT[Comercio-pagweb/]
    
    ROOT --> HTML[index.html]
    ROOT --> CSS_DIR[css/]
    ROOT --> JS_DIR[js/]
    ROOT --> IMG_DIR[img/]
    ROOT --> ADMIN_DIR[admin/]
    ROOT --> DOCS[Documentación]
    
    CSS_DIR --> STYLES[styles.css<br/>2450+ líneas]
    
    JS_DIR --> MAIN_JS[main.js<br/>Navegación & UI]
    JS_DIR --> PRODUCTS_JS[products.js<br/>Productos & Búsqueda]
    JS_DIR --> CART_JS[cart.js<br/>Carrito]
    JS_DIR --> CHATBOT_JS[chatbot.js<br/>Bot]
    JS_DIR --> HISTORIA_JS[historia.js<br/>Carrusel]
    JS_DIR --> PROMO_JS[promociones.js<br/>Banner]
    JS_DIR --> VIDEO_JS[video.js<br/>Video]
    
    IMG_DIR --> CAT1[Caramelos.../]
    IMG_DIR --> CAT2[Chocolates.../]
    IMG_DIR --> CAT3[Piezas.../]
    IMG_DIR --> CAT4[Temporalidades/]
    IMG_DIR --> GENERAL[Imágenes Generales]
    
    CAT1 --> IMG1[30 imágenes]
    CAT2 --> IMG2[23 imágenes]
    CAT3 --> IMG3[8 imágenes]
    CAT4 --> IMG4[11 imágenes]
    
    ADMIN_DIR --> ADMIN_HTML[dashboard.html<br/>login.html]
    ADMIN_DIR --> ADMIN_CSS[admin.css]
    ADMIN_DIR --> ADMIN_JS[admin.js<br/>login.js]
    
    DOCS --> README[README.md]
    DOCS --> DEV_DOC[dev_documentation.txt<br/>1750+ líneas]
    DOCS --> MANUAL[MANUAL_DESARROLLADOR_FRONTEND.md<br/>1460 líneas]
    DOCS --> DIAGRAMS[DIAGRAMAS_ARQUITECTURA_FRONTEND.md<br/>Este archivo]
    DOCS --> INSTRUCTIONS[INSTRUCCIONES_DE_USO.txt]
    DOCS --> CHATBOT_INST[CHATBOT_INSTRUCCIONES.txt]
    
    style ROOT fill:#8B4513,stroke:#333,color:#fff
    style HTML fill:#ff8c00,stroke:#8B4513,color:#fff
    style CSS_DIR fill:#D2691E,stroke:#8B4513,color:#fff
    style JS_DIR fill:#FFB347,stroke:#8B4513
    style IMG_DIR fill:#DAA520,stroke:#8B4513
    style DOCS fill:#2ecc71,stroke:#27ae60,color:#fff
```

---

## 11. FLUJO DE RENDERIZADO DE PRODUCTOS

```mermaid
flowchart LR
    START([Llamar renderProducts])
    
    START --> PARAMS{Recibir Parámetros}
    
    PARAMS --> FILTER_PARAM[filter = 'todos']
    PARAMS --> LIMIT_PARAM[limit = 12]
    PARAMS --> SEARCH_PARAM[search = '']
    
    FILTER_PARAM --> GET_PRODUCTS[products = allProducts]
    LIMIT_PARAM --> GET_PRODUCTS
    SEARCH_PARAM --> GET_PRODUCTS
    
    GET_PRODUCTS --> SEARCH_CHECK{search != ''}
    
    SEARCH_CHECK -->|Sí| SEARCH_FILTER[Filtrar por texto<br/>nombre.includes OR<br/>description.includes]
    SEARCH_CHECK -->|No| CATEGORY_CHECK
    
    SEARCH_FILTER --> CATEGORY_CHECK{filter != 'todos'}
    
    CATEGORY_CHECK -->|Sí| CATEGORY_FILTER[Filtrar por<br/>category == filter]
    CATEGORY_CHECK -->|No| SLICE
    
    CATEGORY_FILTER --> SLICE[Slice 0 to limit]
    
    SLICE --> CHECK_LENGTH{length == 0}
    
    CHECK_LENGTH -->|Sí| NO_RESULTS[HTML = No Results<br/>Icon + Message]
    CHECK_LENGTH -->|No| MAP_PRODUCTS[Map products to HTML]
    
    MAP_PRODUCTS --> TEMPLATE[Template Literal<br/>product-card]
    
    TEMPLATE --> CARD_STRUCTURE[div.product-card<br/>- product-image<br/>- product-overlay<br/>- btn add-to-cart<br/>- product-info]
    
    CARD_STRUCTURE --> JOIN[join array to string]
    
    NO_RESULTS --> INSERT_DOM[grid.innerHTML = html]
    JOIN --> INSERT_DOM
    
    INSERT_DOM --> UPDATE_LOADMORE{products.length > limit}
    
    UPDATE_LOADMORE -->|Sí| SHOW_BTN[Mostrar botón<br/>Load More]
    UPDATE_LOADMORE -->|No| HIDE_BTN[Ocultar botón<br/>Load More]
    
    SHOW_BTN --> ATTACH[Adjuntar Event Listeners<br/>add-to-cart buttons]
    HIDE_BTN --> ATTACH
    
    ATTACH --> ANIMATE[Animar Entrada<br/>Stagger animation<br/>50ms delay cada card]
    
    ANIMATE --> END([Renderizado Completo])
    
    style START fill:#8B4513,stroke:#333,color:#fff
    style END fill:#2ecc71,stroke:#27ae60,color:#fff
    style MAP_PRODUCTS fill:#ff8c00,stroke:#8B4513,color:#fff
    style ANIMATE fill:#FFB347,stroke:#8B4513
```

---

## 12. INTERACCIÓN CHATBOT CON MEM0

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Chatbot UI
    participant Input as Input Field
    participant Logic as Chatbot Logic
    participant API as Mem0 API
    participant Memory as Memory Storage
    participant Response as Response Handler
    
    U->>UI: Click en botón chatbot
    UI->>UI: Mostrar ventana
    UI->>U: Mensaje bienvenida
    
    U->>Input: Escribe mensaje
    Input->>Logic: Capturar texto
    
    Logic->>UI: Mostrar mensaje usuario
    Logic->>UI: Mostrar "escribiendo..."
    
    Logic->>API: POST /chat/<br/>{messages, user_id}
    
    Note over API: Procesa mensaje<br/>Consulta memoria<br/>Genera respuesta
    
    API->>Memory: Buscar contexto previo
    Memory-->>API: Conversaciones anteriores
    
    API->>API: Generar respuesta con IA
    
    API-->>Response: JSON {response, memory}
    
    Response->>UI: Ocultar "escribiendo..."
    Response->>UI: Mostrar respuesta bot
    
    UI->>U: Respuesta visible
    
    U->>Input: ¿Otra pregunta?
    
    alt Usuario continúa conversación
        Input->>Logic: Nuevo mensaje
        Logic->>API: Incluir contexto anterior
    else Usuario cierra chatbot
        U->>UI: Click cerrar
        UI->>UI: Ocultar ventana
    end
    
    Note over Memory: La memoria persiste<br/>entre sesiones<br/>por user_id
```

---

## 13. RESPONSIVE DESIGN - BREAKPOINTS

```mermaid
graph TD
    SCREEN[Tamaño de Pantalla]
    
    SCREEN --> LARGE{> 1024px}
    SCREEN --> MEDIUM{768px - 1024px}
    SCREEN --> SMALL{480px - 768px}
    SCREEN --> XSMALL{< 480px}
    
    LARGE --> L_NAV[Nav: Horizontal<br/>Full menu visible]
    LARGE --> L_HERO[Hero: 100vh<br/>Font 4rem]
    LARGE --> L_GRID[Grid: 4 columnas]
    LARGE --> L_CART[Cart: 400px sidebar]
    LARGE --> L_HISTORY[Historia: 2 columnas]
    
    MEDIUM --> M_NAV[Nav: Horizontal<br/>Menu colapsado]
    MEDIUM --> M_HERO[Hero: 80vh<br/>Font 3rem]
    MEDIUM --> M_GRID[Grid: 3 columnas]
    MEDIUM --> M_CART[Cart: 350px sidebar]
    MEDIUM --> M_HISTORY[Historia: 1 columna]
    
    SMALL --> S_NAV[Nav: Hamburger<br/>Fixed sidebar]
    SMALL --> S_HERO[Hero: 70vh<br/>Font 2.5rem]
    SMALL --> S_GRID[Grid: 2 columnas]
    SMALL --> S_CART[Cart: Full width]
    SMALL --> S_HISTORY[Historia: Stack vertical]
    
    XSMALL --> X_NAV[Nav: Hamburger<br/>Full width menu]
    XSMALL --> X_HERO[Hero: 60vh<br/>Font 2rem]
    XSMALL --> X_GRID[Grid: 1 columna]
    XSMALL --> X_CART[Cart: Full screen]
    XSMALL --> X_HISTORY[Historia: Compact]
    
    L_NAV --> DISPLAY[Renderizar Apropiadamente]
    M_NAV --> DISPLAY
    S_NAV --> DISPLAY
    X_NAV --> DISPLAY
    
    style SCREEN fill:#8B4513,stroke:#333,color:#fff
    style LARGE fill:#2ecc71,stroke:#27ae60,color:#fff
    style MEDIUM fill:#3498db,stroke:#2980b9,color:#fff
    style SMALL fill:#f39c12,stroke:#e67e22,color:#fff
    style XSMALL fill:#e74c3c,stroke:#c0392b,color:#fff
```

---

## 14. PERFORMANCE Y OPTIMIZACIÓN

```mermaid
graph TD
    START[Carga de Página]
    
    START --> CRITICAL[Critical Path]
    START --> DEFERRED[Deferred Load]
    
    CRITICAL --> HTML[HTML Parse]
    CRITICAL --> CSS[CSS Parse & Apply]
    CRITICAL --> JS_CRITICAL[JS Critical<br/>DOMContentLoaded]
    
    HTML --> FCP[First Contentful Paint]
    CSS --> FCP
    
    FCP --> LCP[Largest Contentful Paint<br/>Hero Image]
    
    DEFERRED --> LAZY_IMG[Lazy Load Images<br/>loading='lazy']
    DEFERRED --> FONTS[Web Fonts<br/>Async Load]
    DEFERRED --> ANALYTICS[Analytics Scripts<br/>Si hay]
    
    JS_CRITICAL --> INIT[Inicializar App]
    
    INIT --> RENDER_ABOVE[Render Above Fold]
    INIT --> DEBOUNCE[Debounce Search<br/>300ms]
    INIT --> THROTTLE[Throttle Scroll<br/>Si necesario]
    
    RENDER_ABOVE --> INTERACTIVE[Time to Interactive]
    
    INTERACTIVE --> USER_READY[Usuario puede interactuar]
    
    LAZY_IMG --> BACKGROUND[Carga en background]
    FONTS --> BACKGROUND
    
    BACKGROUND --> COMPLETE[Carga Completa]
    
    subgraph "Optimizaciones Aplicadas"
        OPT1[Lazy Loading Imágenes]
        OPT2[Debounce en Búsqueda]
        OPT3[Event Delegation]
        OPT4[LocalStorage Cache]
        OPT5[CSS Variables]
        OPT6[Minificación Posible]
    end
    
    USER_READY --> OPT1
    USER_READY --> OPT2
    USER_READY --> OPT3
    USER_READY --> OPT4
    
    style START fill:#8B4513,stroke:#333,color:#fff
    style FCP fill:#3498db,stroke:#2980b9,color:#fff
    style LCP fill:#2ecc71,stroke:#27ae60,color:#fff
    style INTERACTIVE fill:#f39c12,stroke:#e67e22,color:#fff
    style USER_READY fill:#2ecc71,stroke:#27ae60,color:#fff
```

---

## USO DE ESTOS DIAGRAMAS

### Visualización en GitHub
Los diagramas Mermaid se renderizan automáticamente en GitHub, GitLab y otras plataformas.

### Visualización en VSCode
Instalar extensión: "Markdown Preview Mermaid Support"

### Exportar como Imágenes
Usar herramientas como:
- mermaid.live (online)
- mermaid-cli (npm)
- Extensión VSCode con export

### Actualización
Estos diagramas deben actualizarse cuando:
- Se agreguen nuevas funcionalidades
- Cambie la arquitectura
- Se modifiquen flujos principales
- Se integren nuevas APIs

---

**Fin de los Diagramas de Arquitectura Frontend**

Estos diagramas proporcionan una visualización completa de la arquitectura, flujos y componentes del sistema e-commerce de Chocolates Costanzo.

