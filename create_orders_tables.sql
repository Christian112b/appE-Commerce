-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS costanzo.pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
    direccion_envio TEXT,
    metodo_pago VARCHAR(50),
    notas TEXT,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES costanzo.usuarios(id_usuario)
);

-- Crear tabla de detalle de pedidos
CREATE TABLE IF NOT EXISTS costanzo.pedido_detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES costanzo.pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES costanzo.productos(id_producto)
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_pedidos_usuario ON costanzo.pedidos(id_usuario);
CREATE INDEX idx_pedidos_fecha ON costanzo.pedidos(fecha_pedido);
CREATE INDEX idx_pedidos_estado ON costanzo.pedidos(estado);
CREATE INDEX idx_pedido_detalle_pedido ON costanzo.pedido_detalle(id_pedido);