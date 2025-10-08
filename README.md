# 🍫 Chocolates Costanzo - E-Commerce Website

Sitio web de comercio electrónico para **Chocolates Costanzo**, empresa con 92 años de tradición en San Luis Potosí, México.

## 📋 Descripción del Proyecto

Este es un proyecto académico desarrollado por estudiantes de la **Universidad Politécnica de San Luis Potosí** que implementa una plataforma completa de comercio electrónico para Chocolates Costanzo, incluyendo:

- ✨ Sitio web frontend moderno y responsivo
- 🛒 Sistema de carrito de compras
- 📦 Catálogo de productos con filtros
- 👤 Panel de administración completo
- 📊 Sistema de reportes y ventas
- 🎨 Diseño atractivo con paleta de colores cálidos

## 🎨 Paleta de Colores

- **Café Chocolate** (#8B4513)
- **Café Claro/Naranja** (#D2691E)
- **Naranja Vibrante** (#FF8C00)
- **Naranja Cálido** (#FFB347)
- **Dorado** (#DAA520)
- **Rojo Suave** (#CD5C5C)
- **Crema Claro** (#FFF8DC)

## 🚀 Características Principales

### Frontend (Sitio Público)
- **Página Principal**: Hero slider con animaciones
- **Catálogo de Productos**: 76+ productos organizados por categorías
- **Carrito de Compras**: Sistema completo con localStorage
- **Checkout**: Proceso de compra simulado
- **Secciones**:
  - Productos con filtros dinámicos
  - Favoritos con carrusel
  - Historia de la empresa
  - Sobre Nosotros (UPSLP)
  - Preguntas Frecuentes (FAQ)
  - Contacto

### Backend (Panel Admin)
- **Dashboard**: Estadísticas y métricas en tiempo real
- **Gestión de Productos**: CRUD completo
- **Gestión de Ventas**: Visualización y filtrado
- **Reportes**: Generación de reportes diarios, semanales, mensuales y anuales
- **Gestión de Clientes**: Vista de clientes y sus compras
- **Configuración**: Ajustes de la tienda

## 📁 Estructura del Proyecto

```
Comercio-pagweb/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos del frontend
├── js/
│   ├── main.js            # Funcionalidad principal
│   ├── cart.js            # Sistema de carrito
│   └── products.js        # Gestión de productos
├── admin/
│   ├── login.html         # Login de administración
│   ├── dashboard.html     # Panel de control
│   ├── css/
│   │   └── admin.css      # Estilos del admin
│   └── js/
│       ├── login.js       # Autenticación
│       └── admin.js       # Funcionalidad admin
└── img/                   # Banco de imágenes
    ├── Chocolates envueltos, sin envolver y semillas cubiertas/
    ├── Caramelos, chiclosos, jaleas y gomitas/
    ├── Piezas, Presentaciones, Tablillas y Bolsas/
    └── Temporalidades/
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS, Flexbox, Grid
- **JavaScript (Vanilla)**: Funcionalidad sin frameworks
- **Font Awesome**: Iconografía
- **Google Fonts**: Tipografías Playfair Display & Poppins
- **Chart.js**: Gráficas en el panel admin
- **LocalStorage**: Persistencia de datos

## 🔐 Credenciales de Administración

Para acceder al panel de administración:

```
Usuario: admin
Contraseña: costanzo2024
```

**URL**: `admin/login.html`

## 📦 Instalación y Uso

1. **Clonar o descargar el proyecto**
   ```bash
   git clone [url-del-repositorio]
   cd Comercio-pagweb
   ```

2. **Abrir con un servidor local**
   - Usar Live Server en VSCode
   - O cualquier servidor HTTP local
   - No abrir directamente el archivo HTML (problemas con rutas relativas)

3. **Navegar**
   - Frontend: `index.html`
   - Admin: `admin/login.html`

## 🎯 Funcionalidades Implementadas

### ✅ Frontend
- [x] Menú de navegación sticky con smooth scroll
- [x] Hero slider con 3 slides y controles
- [x] Carrusel de productos favoritos con auto-scroll
- [x] Sistema de categorías clickeables
- [x] Filtros de productos por categoría
- [x] Búsqueda de productos
- [x] Carrito de compras funcional
- [x] Sistema de checkout simulado
- [x] FAQ con accordion
- [x] Formulario de contacto
- [x] Animaciones de scroll
- [x] Diseño 100% responsivo

### ✅ Admin
- [x] Sistema de autenticación
- [x] Dashboard con métricas
- [x] CRUD de productos
- [x] Gestión de ventas
- [x] Generación de reportes
- [x] Gestión de clientes
- [x] Configuración de tienda
- [x] Exportación de datos
- [x] Gráficas con Chart.js

## 📱 Responsividad

El sitio es completamente responsivo y se adapta a:
- 📱 Móviles (< 480px)
- 📱 Tablets (480px - 768px)
- 💻 Laptops (768px - 1024px)
- 🖥️ Escritorio (> 1024px)

## 🎨 Animaciones

- Fade in al scroll
- Parallax en hero section
- Transiciones suaves en botones y cards
- Loading screen
- Notificaciones toast
- Hover effects en productos
- Smooth scrolling

## 🌟 Características Especiales

1. **Carrito Persistente**: Los productos se guardan en localStorage
2. **Lazy Loading**: Imágenes con carga diferida
3. **Scroll to Top**: Botón flotante para volver arriba
4. **Notificaciones**: Sistema de toast notifications
5. **Modal System**: Modales para checkout y gestión de productos
6. **Data Visualization**: Gráficas interactivas en el panel admin

## 📊 Productos

El catálogo incluye 76+ productos divididos en 4 categorías:

1. **Chocolates envueltos, sin envolver y semillas cubiertas** (25 productos)
2. **Caramelos, chiclosos, jaleas y gomitas** (27 productos)
3. **Piezas, Presentaciones, Tablillas y Bolsas** (6 productos)
4. **Temporalidades** (10 productos)

## 🤝 Contribución

Este es un proyecto académico. Para contribuir:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 👨‍🎓 Desarrollado por

**Estudiantes de la Universidad Politécnica de San Luis Potosí**

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## 📞 Contacto

**Chocolates Costanzo**
- 📧 Email: contacto@chocolatescostanzo.com
- 📱 Teléfono: +52 (444) 123-4567
- 📍 Ubicación: San Luis Potosí, México
- 🌐 Web: https://chocolatescostanzo.com

## 🙏 Agradecimientos

- Chocolates Costanzo por permitir usar su marca
- Universidad Politécnica de San Luis Potosí
- Todos los que contribuyeron al proyecto

---

**© 2024 Chocolates Costanzo - Tradición y Sabor desde 1932** 🍫

