// ========================
// Chatbot de Chocolates Costanzo
// ========================

class ChatBot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    // Base de conocimientos del bot
    knowledgeBase = {
        saludos: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'qué tal'],
        despedidas: ['adiós', 'hasta luego', 'chao', 'nos vemos', 'bye'],
        productos: ['producto', 'productos', 'qué venden', 'qué tienen', 'catálogo', 'chocolates', 'dulces', 'caramelos'],
        precios: ['precio', 'precios', 'cuánto cuesta', 'valor', 'cuánto vale'],
        envios: ['envío', 'envios', 'entrega', 'entregar', 'tiempo de entrega', 'delivery'],
        horarios: ['horario', 'horarios', 'hora', 'cuando abren', 'abren'],
        ubicacion: ['ubicación', 'dirección', 'donde están', 'sucursal', 'tienda física'],
        pagos: ['pago', 'pagos', 'forma de pago', 'tarjeta', 'efectivo', 'transferencia'],
        contacto: ['contacto', 'teléfono', 'email', 'correo', 'contactar'],
        ayuda: ['ayuda', 'help', 'no entiendo', 'opciones']
    };

    // Respuestas predeterminadas
    responses = {
        saludo: '¡Hola! 👋 Bienvenido a Chocolates Costanzo. ¿En qué puedo ayudarte hoy?',
        despedida: '¡Hasta pronto! 🍫 Gracias por visitar Chocolates Costanzo. ¡Que tengas un dulce día!',
        
        productos: `Contamos con una deliciosa variedad:
🍫 Chocolates envueltos y sin envolver
🍬 Caramelos, chiclosos y gomitas
🎁 Presentaciones especiales y regalos
🎃 Productos de temporada

¿Te gustaría ver alguna categoría en específico?`,

        precios: 'Nuestros precios van desde $18.00 hasta $35.00 pesos según el producto. Los chocolates especiales y presentaciones pueden variar. ¿Te interesa algún producto en particular?',

        envios: `Información de envíos:
📦 San Luis Potosí: 2-3 días hábiles
📦 Resto de México: 5-7 días hábiles
✨ Empaque especial que mantiene la frescura
📍 Rastreo incluido en todos los pedidos`,

        horarios: 'Nuestro sitio web está disponible 24/7 para realizar pedidos. Para contacto directo, estamos disponibles de Lunes a Viernes: 9:00 AM - 6:00 PM',

        ubicacion: 'Nos encontramos en San Luis Potosí, México. Tenemos varias sucursales en la ciudad. ¿Te gustaría más información sobre alguna ubicación específica?',

        pagos: `Aceptamos múltiples formas de pago:
💳 Tarjetas de crédito y débito
🏦 Transferencias bancarias
💵 PayPal
💰 Efectivo contra entrega (solo en SLP)`,

        contacto: `Puedes contactarnos:
📞 Teléfono: +52 (444) 123-4567
📧 Email: contacto@chocolatescostanzo.com
📱 Redes sociales: @chocolatescostanzo

¿En qué más puedo ayudarte?`,

        noEntiendo: 'Disculpa, no estoy seguro de entender. ¿Podrías reformular tu pregunta? También puedes usar las sugerencias rápidas que aparecen abajo. 🙂',

        default: '¡Hola! Soy el asistente virtual de Chocolates Costanzo. Puedo ayudarte con información sobre productos, precios, envíos y más. ¿Qué necesitas saber?'
    };

    // Productos destacados para recomendaciones
    featuredProducts = [
        { name: 'Tornillo', price: '$25.00', description: 'Chocolate macizo con leche' },
        { name: 'Princesa Surtida', price: '$30.00', description: 'Bombón relleno de fondant' },
        { name: 'Duquesa', price: '$28.00', description: 'Sandwich de galleta con jalea' },
        { name: 'Esponja Natural', price: '$22.00', description: 'Malvavisco con chocolate' }
    ];

    init() {
        this.createBotHTML();
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    createBotHTML() {
        const botHTML = `
            <!-- Botón flotante del chatbot -->
            <div class="chatbot-button" id="chatbotButton">
                <i class="fas fa-comments"></i>
                <span class="chatbot-badge">¿Ayuda?</span>
            </div>

            <!-- Ventana del chatbot -->
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div>
                            <h4>Asistente Costanzo</h4>
                            <span class="chatbot-status">En línea</span>
                        </div>
                    </div>
                    <button class="chatbot-close" id="chatbotClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="chatbot-messages" id="chatbotMessages">
                    <!-- Los mensajes se agregarán dinámicamente -->
                </div>

                <div class="chatbot-suggestions" id="chatbotSuggestions">
                    <button class="suggestion-btn" data-message="Ver productos">🍫 Productos</button>
                    <button class="suggestion-btn" data-message="Información de envíos">📦 Envíos</button>
                    <button class="suggestion-btn" data-message="Formas de pago">💳 Pagos</button>
                    <button class="suggestion-btn" data-message="Contacto">📞 Contacto</button>
                </div>

                <div class="chatbot-input-area">
                    <input 
                        type="text" 
                        class="chatbot-input" 
                        id="chatbotInput" 
                        placeholder="Escribe tu pregunta..."
                        autocomplete="off"
                    >
                    <button class="chatbot-send" id="chatbotSend">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', botHTML);
    }

    setupEventListeners() {
        const button = document.getElementById('chatbotButton');
        const closeBtn = document.getElementById('chatbotClose');
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const suggestions = document.querySelectorAll('.suggestion-btn');

        button.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());
        sendBtn.addEventListener('click', () => this.handleSendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSendMessage();
            }
        });

        suggestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                input.value = message;
                this.handleSendMessage();
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');
        const button = document.getElementById('chatbotButton');

        if (this.isOpen) {
            window.classList.add('active');
            button.classList.add('hidden');
            document.getElementById('chatbotInput').focus();
        } else {
            window.classList.remove('active');
            button.classList.remove('hidden');
        }
    }

    addWelcomeMessage() {
        setTimeout(() => {
            this.addMessage(this.responses.default, 'bot');
        }, 500);
    }

    handleSendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();

        if (message === '') return;

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        input.value = '';

        // Simular "escribiendo..."
        this.showTyping();

        // Procesar respuesta después de un delay
        setTimeout(() => {
            this.hideTyping();
            const response = this.processMessage(message);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    }

    processMessage(message) {
        const lowerMessage = message.toLowerCase().trim();

        // Verificar saludos
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.saludos)) {
            return this.responses.saludo;
        }

        // Verificar despedidas
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.despedidas)) {
            return this.responses.despedida;
        }

        // Verificar productos
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.productos)) {
            return this.responses.productos;
        }

        // Verificar precios
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.precios)) {
            return this.responses.precios;
        }

        // Verificar envíos
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.envios)) {
            return this.responses.envios;
        }

        // Verificar horarios
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.horarios)) {
            return this.responses.horarios;
        }

        // Verificar ubicación
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.ubicacion)) {
            return this.responses.ubicacion;
        }

        // Verificar pagos
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.pagos)) {
            return this.responses.pagos;
        }

        // Verificar contacto
        if (this.matchKeywords(lowerMessage, this.knowledgeBase.contacto)) {
            return this.responses.contacto;
        }

        // Producto específico
        if (lowerMessage.includes('tornillo')) {
            return 'El Tornillo es uno de nuestros favoritos 🍫. Es un delicioso chocolate macizo con leche. Precio: $25.00. ¿Te gustaría agregarlo al carrito?';
        }

        if (lowerMessage.includes('princesa')) {
            return 'La Princesa Surtida es exquisita 👑. Bombón de chocolate amargo relleno de fondant y jalea. Precio: $30.00. ¿Te interesa?';
        }

        // Respuesta por defecto
        return this.responses.noEntiendo;
    }

    matchKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;

        const timestamp = new Date().toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.innerHTML = `
            ${sender === 'bot' ? '<div class="message-avatar"><i class="fas fa-robot"></i></div>' : ''}
            <div class="message-content">
                <div class="message-text">${this.formatMessage(text)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animación de entrada
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
    }

    formatMessage(text) {
        // Convertir saltos de línea en <br>
        return text.replace(/\n/g, '<br>');
    }

    showTyping() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Inicializar el chatbot cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new ChatBot();
});

