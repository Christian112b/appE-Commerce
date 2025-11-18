-- Script SQL para crear la tabla de comentarios
-- Ejecuta este script en tu base de datos MySQL

CREATE TABLE IF NOT EXISTS costanzo.comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    comentario TEXT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo TINYINT(1) DEFAULT 1,
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

