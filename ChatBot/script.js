document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatIcon = document.getElementById('chat-icon');
    const chatbotPopup = document.getElementById('chatbot-popup');
    const closeButton = document.getElementById('close-chatbot');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatBody = document.getElementById('chat-body');
    
    // Predefined Questions and Answers
    const qaDatabase = {
        "informasi kamar": "Kami memiliki beberapa tipe kamar: Standard (Rp 500.000/malam), Deluxe (Rp 800.000/malam), dan Suite (Rp 1.200.000/malam). Semua kamar dilengkapi dengan AC, TV, dan kamar mandi pribadi.",
        "fasilitas hotel": "D' Hotel menyediakan berbagai fasilitas seperti kolam renang, gym, spa, restoran, dan layanan kamar 24 jam. Kami juga menyediakan WiFi gratis di seluruh area hotel.",
        "cara reservasi": "Anda dapat melakukan reservasi melalui website kami, menghubungi nomor (021) 1234-5678, atau melalui email reservation@dhotel.com. Untuk konfirmasi booking, diperlukan deposit sebesar 30% dari total biaya.",
        "lokasi hotel": "D' Hotel berlokasi di Jl. Utama No. 123, Jakarta Pusat. Kami berjarak 10 menit dari pusat kota dan 30 menit dari bandara internasional.",
        "check in": "Waktu check-in adalah pukul 14.00 dan check-out pukul 12.00. Early check-in dan late check-out dapat diatur dengan biaya tambahan.",
        "parkir": "Kami menyediakan parkir gratis untuk semua tamu hotel.",
        "sarapan": "Sarapan prasmanan disajikan setiap hari dari pukul 06.30 hingga 10.00 di restoran hotel.",
        "transportasi": "Kami menyediakan layanan antar-jemput bandara dengan biaya tambahan. Silakan hubungi resepsionis untuk informasi lebih lanjut.",
        "pembayaran": "Kami menerima pembayaran dengan kartu kredit/debit, transfer bank, dan tunai.",
        "pets": "Maaf, kami tidak mengizinkan hewan peliharaan di hotel."
    };

    // Add more keyphrases and their corresponding answers
    const keyphrases = {
        "kamar": "informasi kamar",
        "room": "informasi kamar",
        "harga": "informasi kamar",
        "tipe kamar": "informasi kamar",
        "price": "informasi kamar",
        
        "fasilitas": "fasilitas hotel",
        "facility": "fasilitas hotel",
        "kolam renang": "fasilitas hotel",
        "gym": "fasilitas hotel",
        "spa": "fasilitas hotel",
        "restaurant": "fasilitas hotel",
        
        "reservasi": "cara reservasi",
        "booking": "cara reservasi",
        "pesan": "cara reservasi",
        "reserve": "cara reservasi",
        
        "lokasi": "lokasi hotel",
        "alamat": "lokasi hotel",
        "address": "lokasi hotel",
        "dimana": "lokasi hotel",
        "where": "lokasi hotel",
        
        "check in": "check in",
        "checkout": "check in",
        "jam": "check in",
        
        "parkir": "parkir",
        "parking": "parkir",
        
        "breakfast": "sarapan",
        "sarapan": "sarapan",
        "makan": "sarapan",
        
        "transport": "transportasi",
        "antar jemput": "transportasi",
        "shuttle": "transportasi",
        
        "bayar": "pembayaran",
        "payment": "pembayaran",
        "kartu kredit": "pembayaran",
        
        "hewan": "pets",
        "pet": "pets",
        "kucing": "pets",
        "anjing": "pets"
    };

    // Toggle Chatbot Display
    chatIcon.addEventListener('click', () => {
        chatbotPopup.classList.add('active');
    });

    closeButton.addEventListener('click', () => {
        chatbotPopup.classList.remove('active');
    });

    // Handle Form Submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        
        if (message !== '') {
            // Add user message to chat
            addMessage('user', message);
            messageInput.value = '';
            
            // Show typing indicator
            showThinkingIndicator();
            
            // Process message and respond after a slight delay
            setTimeout(() => {
                processMessage(message);
            }, 1000);
        }
    });

    // Process Quick Questions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('question-option')) {
            const question = e.target.textContent;
            addMessage('user', question);
            
            // Show typing indicator
            showThinkingIndicator();
            
            // Process message and respond after a slight delay
            setTimeout(() => {
                processMessage(question);
            }, 1000);
        }
    });

    // Add Message to Chat
    function addMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        if (type === 'bot') {
            messageDiv.innerHTML = `
                <span class="bot-avatar material-symbols-rounded">support_agent</span>
                <div class="message-text">${text}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-text">${text}</div>
            `;
        }
        
        chatBody.appendChild(messageDiv);
        scrollToBottom();
    }

    // Show Thinking Indicator
    function showThinkingIndicator() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message bot-message thinking';
        thinkingDiv.id = 'thinking-indicator';
        thinkingDiv.innerHTML = `
            <span class="bot-avatar material-symbols-rounded">support_agent</span>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        
        chatBody.appendChild(thinkingDiv);
        scrollToBottom();
    }

    // Remove Thinking Indicator
    function removeThinkingIndicator() {
        const thinkingIndicator = document.getElementById('thinking-indicator');
        if (thinkingIndicator) {
            thinkingIndicator.remove();
        }
    }

    // Process User Message
    function processMessage(message) {
        removeThinkingIndicator();
        
        // Convert message to lowercase for case-insensitive matching
        const lowerMessage = message.toLowerCase();
        
        // Check if the message directly matches a question in the database
        for (const [question, answer] of Object.entries(qaDatabase)) {
            if (lowerMessage.includes(question.toLowerCase())) {
                addMessage('bot', answer);
                return;
            }
        }
        
        // Check for keyphrases in the message
        for (const [keyphrase, questionCategory] of Object.entries(keyphrases)) {
            if (lowerMessage.includes(keyphrase.toLowerCase())) {
                const answer = qaDatabase[questionCategory];
                if (answer) {
                    addMessage('bot', answer);
                    return;
                }
            }
        }
        
        // Default response if no match is found
        addMessage('bot', `Maaf, saya tidak memiliki informasi tentang itu. Bisa Anda tanyakan dengan cara lain atau pilih dari pertanyaan umum di bawah ini: 
        <ul class="quick-questions">
            <li class="question-option">Informasi kamar</li>
            <li class="question-option">Fasilitas hotel</li>
            <li class="question-option">Cara reservasi</li>
            <li class="question-option">Lokasi hotel</li>
        </ul>`);
    }

    // Scroll to Bottom of Chat
    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
});