-- Schema for SQLite database

-- Usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo INTEGER DEFAULT 1,
    is_admin INTEGER DEFAULT 0
);

-- Direcciones table
CREATE TABLE IF NOT EXISTS direcciones (
    id_direccion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    alias TEXT NOT NULL,
    calle TEXT NOT NULL,
    colonia TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    estado TEXT NOT NULL,
    cp TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Productos table
CREATE TABLE IF NOT EXISTS productos (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio_unitario REAL NOT NULL,
    imagen_base64 TEXT,
    activo INTEGER DEFAULT 1,
    categoria TEXT
);

-- Inventario table
CREATE TABLE IF NOT EXISTS inventario (
    id_inventario INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto INTEGER UNIQUE NOT NULL,
    cantidad_actual INTEGER DEFAULT 0,
    cantidad_minima INTEGER DEFAULT 0,
    ubicacion TEXT,
    fecha_actualizacion DATETIME,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Pedidos table
CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado TEXT DEFAULT 'pendiente',
    total REAL NOT NULL,
    direccion_envio TEXT,
    metodo_pago TEXT,
    notas TEXT,
    numero_pedido TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Pedido_detalles table
CREATE TABLE IF NOT EXISTS pedido_detalles (
    id_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Carritocompra table
CREATE TABLE IF NOT EXISTS carritocompra (
    id_carrito INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Carrito_items table
CREATE TABLE IF NOT EXISTS carrito_items (
    id_item INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carrito INTEGER NOT NULL,
    id_producto INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    FOREIGN KEY (id_carrito) REFERENCES carritocompra(id_carrito),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Cupones table
CREATE TABLE IF NOT EXISTS cupones (
    id_descuento INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    activo INTEGER DEFAULT 1
);

-- Logpagos table
CREATE TABLE IF NOT EXISTS logpagos (
    id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
    id_intento_pago TEXT,
    id_metodo_pago INTEGER,
    monto REAL NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_pago TEXT NOT NULL,
    id_usuario INTEGER,
    cupon_id INTEGER,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (cupon_id) REFERENCES cupones(id_descuento)
);

-- Logactividad table
CREATE TABLE IF NOT EXISTS logactividad (
    id_log INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER,
    accion TEXT NOT NULL,
    descripcion TEXT,
    fecha_evento DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_origen TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Mensajes_contacto table
CREATE TABLE IF NOT EXISTS mensajes_contacto (
    id_mensaje INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    asunto TEXT,
    mensaje TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado TEXT DEFAULT 'nuevo'
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES productos(id_producto)
);

-- Descuentospromociones table
CREATE TABLE IF NOT EXISTS descuentospromociones (
    id_descuento INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL NOT NULL,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    activo INTEGER DEFAULT 1
);

-- Cupon_uso table
CREATE TABLE IF NOT EXISTS cupon_uso (
    id_uso_cupon INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_descuento INTEGER NOT NULL,
    id_pago INTEGER,
    fecha_uso DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_descuento) REFERENCES descuentospromociones(id_descuento),
    FOREIGN KEY (id_pago) REFERENCES logpagos(id_pago)
);

-- Ventas_productos table
CREATE TABLE IF NOT EXISTS ventas_productos (
    id_venta_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    id_producto INTEGER NOT NULL,
    total_vendido INTEGER DEFAULT 0,
    fecha_ultima_venta DATETIME,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);