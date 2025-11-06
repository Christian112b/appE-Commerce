// ========================
// Sistema de Comentarios
// ========================

let allComments = [];

// Cargar comentarios al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadComments();
    setupCommentForm();
});

// ========================
// Cargar comentarios desde el servidor
// ========================
function loadComments() {
    const commentsList = document.getElementById('comentariosList');
    const loadingComments = document.getElementById('loadingComments');

    if (!commentsList) return;

    fetch('/getComments')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.comentarios) {
                allComments = data.comentarios;
                renderComments();
            } else {
                showCommentsError('No se pudieron cargar los comentarios');
            }
        })
        .catch(error => {
            console.error('Error al cargar comentarios:', error);
            showCommentsError('Error al cargar los comentarios. Intenta recargar la página.');
        })
        .finally(() => {
            if (loadingComments) {
                loadingComments.style.display = 'none';
            }
        });
}

// ========================
// Renderizar comentarios
// ========================
function renderComments() {
    const commentsList = document.getElementById('comentariosList');
    if (!commentsList) return;

    if (allComments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <i class="fas fa-comments"></i>
                <p>No hay comentarios aún. ¡Sé el primero en compartir tu opinión!</p>
            </div>
        `;
        return;
    }

    commentsList.innerHTML = allComments.map(comment => `
        <div class="comentario-card" data-id="${comment.id_comentario}">
            <div class="comentario-header">
                <div class="comentario-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="comentario-info">
                    <h3 class="comentario-nombre">${escapeHtml(comment.nombre)}</h3>
                    <span class="comentario-fecha">${formatDate(comment.fecha_creacion)}</span>
                </div>
            </div>
            <div class="comentario-body">
                <p>${escapeHtml(comment.comentario)}</p>
            </div>
        </div>
    `).join('');

    // Animar comentarios
    animateComments();
}

// ========================
// Configurar formulario de comentarios
// ========================
function setupCommentForm() {
    const form = document.getElementById('comentarioForm');
    const textarea = document.getElementById('textoComentario');
    const charCount = document.getElementById('charCount');

    if (!form) return;

    // Contador de caracteres
    if (textarea && charCount) {
        textarea.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = length;
            if (length > 900) {
                charCount.parentElement.style.color = '#CD5C5C';
            } else {
                charCount.parentElement.style.color = '#666';
            }
        });
    }

    // Enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombreComentario').value.trim();
        const comentario = document.getElementById('textoComentario').value.trim();

        if (!nombre || !comentario) {
            showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        submitComment(nombre, comentario);
    });
}

// ========================
// Enviar comentario al servidor
// ========================
function submitComment(nombre, comentario) {
    const submitBtn = document.querySelector('#comentarioForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';

    fetch('/addComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre: nombre,
            comentario: comentario
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showNotification('¡Comentario publicado exitosamente!', 'success');
            // Limpiar formulario
            document.getElementById('comentarioForm').reset();
            document.getElementById('charCount').textContent = '0';
            // Recargar comentarios
            loadComments();
        } else {
            showNotification(data.message || 'Error al publicar el comentario', 'error');
        }
    })
    .catch(error => {
        console.error('Error al enviar comentario:', error);
        showNotification('Error al publicar el comentario. Intenta nuevamente.', 'error');
    })
    .finally(() => {
        // Habilitar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

// ========================
// Mostrar error en comentarios
// ========================
function showCommentsError(message) {
    const commentsList = document.getElementById('comentariosList');
    if (commentsList) {
        commentsList.innerHTML = `
            <div class="comments-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// ========================
// Animar comentarios
// ========================
function animateComments() {
    const cards = document.querySelectorAll('.comentario-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ========================
// Utilidades
// ========================
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

