// ========================
// Variables globales
// ========================
let currentSlide = 0;
const slides = [];
let slideInterval;

// ========================
// Navegación
// ========================
function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    // Scroll navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Active link on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Cerrar menú móvil
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
    
    // Hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// ========================
// Hero Slider
// ========================
function setupHeroSlider() {
    const slidesElements = document.querySelectorAll('.hero-slide');
    const heroIndicators = document.querySelector('.hero-indicators');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    
    if (slidesElements.length === 0) return;
    
    // Guardar slides en array
    slidesElements.forEach((slide, index) => {
        slides.push(slide);
        
        // Crear indicador
        const indicator = document.createElement('div');
        indicator.className = 'hero-indicator';
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        heroIndicators.appendChild(indicator);
    });
    
    // Navegación
    if (prevBtn) {
        prevBtn.addEventListener('click', () => changeSlide(-1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changeSlide(1));
    }
    
    // Auto slide
    startAutoSlide();
    
    // Pausar en hover
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', stopAutoSlide);
        heroSection.addEventListener('mouseleave', startAutoSlide);
    }
}

function changeSlide(direction) {
    currentSlide += direction;
    
    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    } else if (currentSlide >= slides.length) {
        currentSlide = 0;
    }
    
    updateSlide();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlide();
}

function updateSlide() {
    // Actualizar slides
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlide) {
            slide.classList.add('active');
        }
    });
    
    // Actualizar indicadores
    const indicators = document.querySelectorAll('.hero-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index === currentSlide) {
            indicator.classList.add('active');
        }
    });
}

function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// ========================
// Carrusel de Favoritos
// ========================
function setupFavoritosCarousel() {
    const carousel = document.getElementById('favoritosCarousel');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    if (!carousel) return;
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: -320,
                behavior: 'smooth'
            });
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        });
    }
    
    // Auto scroll
    let autoScrollInterval = setInterval(() => {
        if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 10) {
            carousel.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        } else {
            carousel.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        }
    }, 4000);
    
    // Pausar auto scroll en hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });
    
    carousel.addEventListener('mouseleave', () => {
        autoScrollInterval = setInterval(() => {
            if (carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 10) {
                carousel.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
                carousel.scrollBy({
                    left: 320,
                    behavior: 'smooth'
                });
            }
        }, 4000);
    });
}

// ========================
// FAQ Accordion
// ========================
function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Cerrar otros items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle actual item
            item.classList.toggle('active');
        });
    });
}

// ========================
// Formulario de Contacto
// ========================
function setupContactForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envío
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Mensaje Enviado!';
                submitBtn.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                    form.reset();
                    
                    // Mostrar notificación
                    showNotification('¡Gracias por contactarnos! Te responderemos pronto.');
                }, 2000);
            }, 1500);
        });
    }
}

// ========================
// Animaciones de Scroll
// ========================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos
    const animatedElements = document.querySelectorAll(
        '.category-card, .product-card, .sobre-nosotros-card, .faq-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ========================
// Parallax Effect
// ========================
function setupParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // Hero parallax
        const heroBg = document.querySelector('.hero-slide.active .hero-bg');
        if (heroBg) {
            heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// ========================
// Lazy Loading Images
// ========================
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ========================
// Smooth Scroll to Top
// ========================
function setupScrollToTop() {
    // Crear botón
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #8B4513, #D2691E);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 16px rgba(139, 69, 19, 0.3);
    `;
    
    document.body.appendChild(scrollBtn);
    
    // Mostrar/ocultar botón
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.pointerEvents = 'all';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.pointerEvents = 'none';
        }
    });
    
    // Scroll to top
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================
// Cursor personalizado (opcional)
// ========================
function setupCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid #D2691E;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
        display: none;
    `;
    
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.display = 'block';
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // Ampliar en hover de botones
    const interactiveElements = document.querySelectorAll('a, button, .product-card');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.background = 'rgba(210, 105, 30, 0.2)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'transparent';
        });
    });
}

// ========================
// Notificación helper
// ========================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, ${type === 'success' ? '#2ecc71, #27ae60' : '#8B4513, #D2691E'});
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ========================
// Animaciones CSS adicionales
// ========================
function injectAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }
        
        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        .scroll-to-top:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4) !important;
        }
        
        .scroll-to-top:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);
}

// ========================
// Loading Screen (opcional)
// ========================
function setupLoadingScreen() {
    const logoPath = document.getElementById('loader-logo-path')?.dataset.src || 'static/assets/costanzo.png';

    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <img src="${logoPath}" alt="Chocolates Costanzo" class="loader-logo">
            <div class="loader-spinner"></div>
            <p>Cargando dulzura...</p>
        </div>
    `;

    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: linear-gradient(135deg, #FFF8DC, #FFFFFF);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        transition: opacity 0.5s ease;
    `;

    const loaderContent = `
        <style>
            .loader-content {
                text-align: center;
            }

            .loader-logo {
                width: 120px;
                height: auto;
                margin-bottom: 2rem;
                animation: pulse 2s ease-in-out infinite;
            }

            .loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #F5F5F5;
                border-top: 4px solid #D2691E;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }

            .loader-content p {
                color: #8B4513;
                font-size: 1.2rem;
                font-weight: 600;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.05); opacity: 0.8; }
            }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', loaderContent);
    document.body.insertBefore(loader, document.body.firstChild);

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 800);
    });
}

// ========================
// Dropdown func
// ========================
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}





// ========================
// Inicialización
// ========================
document.addEventListener('DOMContentLoaded', function() {
    setupLoadingScreen();
    setupNavigation();
    setupHeroSlider();
    setupFavoritosCarousel();
    setupFAQ();
    setupContactForm();
    setupScrollAnimations();
    setupParallax();
    setupLazyLoading();
    setupScrollToTop();
    injectAnimations();
    
    // Opcional: descomentar para cursor personalizado
    // setupCustomCursor();
    
    console.log('%c🍫 Chocolates Costanzo - Sitio Web Cargado 🍫', 'color: #D2691E; font-size: 20px; font-weight: bold;');
    console.log('%cDesarrollado por estudiantes de la Universidad Politécnica de San Luis Potosí', 'color: #8B4513; font-size: 12px;');
});

// Hacer funciones globales
window.showNotification = showNotification;

