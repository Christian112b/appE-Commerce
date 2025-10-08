// ========================
// Promociones Ticker Animation
// ========================

document.addEventListener('DOMContentLoaded', function() {
    const promocionesContent = document.querySelector('.promociones-content');
    
    if (promocionesContent) {
        // Duplicar el contenido para crear un loop continuo
        const originalContent = promocionesContent.innerHTML;
        promocionesContent.innerHTML = originalContent + originalContent;
        
        // Ajustar la animación basada en el ancho del contenido
        const contentWidth = promocionesContent.scrollWidth / 2; // Dividir por 2 porque duplicamos el contenido
        const containerWidth = promocionesContent.parentElement.offsetWidth;
        const totalDistance = contentWidth + containerWidth;
        
        // Aplicar la animación con duración basada en la distancia
        const duration = Math.max(15, (totalDistance / 50)); // Mínimo 15 segundos
        promocionesContent.style.animationDuration = `${duration}s`;
        
        // Pausar animación al hacer hover
        const promocionesSection = document.querySelector('.promociones');
        if (promocionesSection) {
            promocionesSection.addEventListener('mouseenter', function() {
                promocionesContent.style.animationPlayState = 'paused';
            });
            
            promocionesSection.addEventListener('mouseleave', function() {
                promocionesContent.style.animationPlayState = 'running';
            });
        }
    }
});
