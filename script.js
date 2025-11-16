// IMPORTANT: Replace this with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

let selectedOfferCategory = '';

// Cookie Management System
const CookieManager = {
    // Validate email
    isValidEmail: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Send data to Google Sheets
    sendToGoogleSheets: async function(data) {
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('Data sent to Google Sheets:', data);
            return true;
        } catch (error) {
            console.error('Error sending to Google Sheets:', error);
            return false;
        }
    },

    // Track user with email
    trackUser: function(email, name = '', phone = '', category = '', action = 'Cookie Consent') {
        const userData = {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR'),
            email: email || 'Not provided',
            name: name || 'Not provided',
            phone: phone || 'Not provided',
            category: category || 'Not defined',
            action: action,
            cookiesAccepted: localStorage.getItem('cookiesAccepted') === 'true',
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || 'Direct',
        };

        // Save to localStorage
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        localStorage.setItem('userPhone', phone);

        // Send to Google Sheets
        this.sendToGoogleSheets(userData);

        return userData;
    },

    // Track offer interest
    trackOfferInterest: function(category, email, name = '', phone = '') {
        this.trackUser(email, name, phone, category, 'Offer Interest');
        localStorage.setItem('userCategory', category);
    }
};

// Show cookie banner on page load
window.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('cookiesAccepted') === null) {
        document.getElementById('cookieBanner').classList.add('show');
    } else if (localStorage.getItem('cookiesAccepted') === 'true') {
        document.getElementById('analyticsIndicator').classList.add('show');
        document.getElementById('cookieStatus').textContent = 'Status: Acceptés ✓';

        const savedCategory = localStorage.getItem('userCategory');
        if (savedCategory) {
            document.getElementById('userCategory').textContent = `Catégorie: ${savedCategory}`;
        }

        trackVisitDuration();
    }
});

// Accept cookies
function acceptCookies() {
    const email = document.getElementById('userEmail').value.trim();

    if (email && !CookieManager.isValidEmail(email)) {
        document.getElementById('emailError').style.display = 'block';
        return;
    }

    localStorage.setItem('cookiesAccepted', 'true');
    localStorage.setItem('consentDate', new Date().toISOString());

    // Track user with email if provided
    CookieManager.trackUser(email, '', '', '', 'Cookie Accepted');

    // Show success message
    document.getElementById('successMessage').style.display = 'block';

    setTimeout(() => {
        document.getElementById('cookieBanner').classList.remove('show');
        document.getElementById('analyticsIndicator').classList.add('show');
        document.getElementById('cookieStatus').textContent = 'Status: Acceptés ✓';
        trackVisitDuration();
    }, 1500);
}

// Decline cookies
function declineCookies() {
    localStorage.setItem('cookiesAccepted', 'false');
    document.getElementById('cookieBanner').classList.remove('show');

    // Still track the decline (without email)
    CookieManager.trackUser('', '', '', '', 'Cookie Declined');
}

// Track visit duration
function trackVisitDuration() {
    const startTime = Date.now();
    setInterval(() => {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('visitTime').textContent = `Temps de visite: ${duration}s`;
    }, 1000);
}

// Show email modal for offer interest
function showEmailModal(category) {
    selectedOfferCategory = category;
    document.getElementById('emailModal').classList.add('show');
    document.getElementById('modalError').style.display = 'none';
    document.getElementById('modalSuccess').style.display = 'none';
}

// Close email modal
function closeEmailModal() {
    document.getElementById('emailModal').classList.remove('show');
    document.getElementById('modalEmail').value = '';
    document.getElementById('modalName').value = '';
    document.getElementById('modalPhone').value = '';
}

// Submit offer interest
function submitOfferInterest() {
    const email = document.getElementById('modalEmail').value.trim();
    const name = document.getElementById('modalName').value.trim();
    const phone = document.getElementById('modalPhone').value.trim();

    if (!CookieManager.isValidEmail(email)) {
        document.getElementById('modalError').style.display = 'block';
        return;
    }

    // Track offer interest
    CookieManager.trackOfferInterest(selectedOfferCategory, email, name, phone);

    // Update analytics display
    document.getElementById('userCategory').textContent = `Catégorie: ${selectedOfferCategory}`;
    document.getElementById('lastInteraction').textContent = `Dernière interaction: ${new Date().toLocaleTimeString()}`;

    // Show success message
    document.getElementById('modalSuccess').style.display = 'block';
    document.getElementById('modalError').style.display = 'none';

    setTimeout(() => {
        closeEmailModal();
    }, 2000);
}

// Track offer card clicks
document.addEventListener('DOMContentLoaded', function() {
    const offerCards = document.querySelectorAll('.offer-card');

    offerCards.forEach((card) => {
        const subscribeBtn = card.querySelector('.btn-primary');

        subscribeBtn.addEventListener('click', function(e) {
            e.preventDefault();

            let category = '';
            const title = card.querySelector('h3').textContent;

            if (title.includes('Gamer')) {
                category = 'Gamers - Internet Haute Vitesse';
            } else if (title.includes('Équilibré')) {
                category = 'Utilisateurs Standards - Usage Équilibré';
            } else if (title.includes('Appels')) {
                category = 'Appels Prioritaires - Internet Minimal';
            }

            // Show email modal
            showEmailModal(category);
        });
    });
});

// Make functions globally available
window.CookieManager = CookieManager;

// ------------------------------
// Chat widget script (appended)
// ------------------------------
(function() {
    // Try proxy endpoint first, fall back to direct n8n webhook if proxy not available
    // The proxy will forward requests to the n8n webhook defined by the
    // environment variable `N8N_WEBHOOK_URL` on the server. This avoids CORS.
    const PROXY_URL = '/api/chat';
    const N8N_WEBHOOK_URL = 'https://zaidkira.app.n8n.cloud/webhook/djeezy-chat';
    let useDirectWebhook = false; // Will be set to true if proxy returns 404

    const chatWidget = document.getElementById('chat-widget');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.querySelector('.typing-indicator');
    // Support both possible toggle IDs: legacy `chat-toggle` and new `chatToggleBtn`.
    const chatToggle = document.getElementById('chatToggleBtn') || document.getElementById('chat-toggle') || null;

    // Require only the elements necessary for sending/receiving messages.
    // The toggle is optional because the page may manage open/close separately.
    if (!chatWidget || !chatMessages || !chatInput || !sendButton) return;

    // Initial state: widget closed
    chatWidget.classList.add('chat-closed');
    chatWidget.setAttribute('aria-hidden', 'true');
    chatToggle.setAttribute('aria-pressed', 'false');

    function openChat() {
        document.body.classList.add('chat-open');
        chatWidget.classList.remove('chat-closed');
        chatWidget.setAttribute('aria-hidden', 'false');
        chatToggle.setAttribute('aria-pressed', 'true');
        // focus input after short delay to allow animation/layout
        setTimeout(() => chatInput.focus(), 200);
    }

    function closeChat() {
        document.body.classList.remove('chat-open');
        chatWidget.classList.add('chat-closed');
        chatWidget.setAttribute('aria-hidden', 'true');
        chatToggle.setAttribute('aria-pressed', 'false');
    }

    // Toggle on button click
    chatToggle.addEventListener('click', function() {
        const isOpen = document.body.classList.contains('chat-open');
        if (isOpen) closeChat(); else openChat();
    });

    // Close chat when pressing Escape
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeChat(); });

    // Generate unique session ID for this user
    let sessionId = localStorage.getItem('djeezy_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('djeezy_session_id', sessionId);
    }

    // Detect text direction (RTL for Arabic)
    function detectDirection(text) {
        const arabicPattern = /[\u0600-\u06FF]/;
        return arabicPattern.test(text) ? 'rtl' : 'ltr';
    }

    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        contentDiv.setAttribute('dir', detectDirection(text));

        messageDiv.appendChild(contentDiv);
        // insert before typing indicator
        const typingEl = document.querySelector('.typing-indicator');
        chatMessages.insertBefore(messageDiv, typingEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function setTyping(isTyping) {
        if (isTyping) typingIndicator.classList.add('active');
        else typingIndicator.classList.remove('active');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        chatInput.disabled = true;
        sendButton.disabled = true;

        addMessage(message, true);
        chatInput.value = '';
        setTyping(true);

        // First attempt: try proxy, or direct webhook if proxy unavailable
        try {
            const url = useDirectWebhook ? N8N_WEBHOOK_URL : PROXY_URL;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sendMessage', sessionId: sessionId, chatInput: message })
            });

            // If CORS blocked or network error occurred, this will likely throw and be caught below.
            if (response && response.ok) {
                // Try parsing JSON; if parsing fails, fall back to generic success message
                let data = null;
                try { data = await response.json(); } catch (e) { /* parsing failed or opaque */ }
                setTyping(false);
                if (data && data.output) addMessage(data.output, false);
                else addMessage('✅ Message envoyé — réponse indisponible.', false);

                return;
            }

            // If proxy returns 404, switch to direct webhook for next time
            if (response && response.status === 404 && !useDirectWebhook) {
                console.warn('Proxy endpoint not found (404), switching to direct webhook');
                useDirectWebhook = true;
                // Retry with direct webhook immediately
                try {
                    const directResponse = await fetch(N8N_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'sendMessage', sessionId: sessionId, chatInput: message })
                    });
                    if (directResponse && directResponse.ok) {
                        let data = null;
                        try { data = await directResponse.json(); } catch (e) { }
                        setTyping(false);
                        if (data && data.output) addMessage(data.output, false);
                        else addMessage('✅ Message envoyé — réponse indisponible.', false);
                        return;
                    }
                } catch (e) {
                    // Will fall through to no-cors fallback
                }
            }

            // Non-OK status (e.g., 4xx/5xx). Throw to trigger fallback handling below.
            throw new Error('Network response was not ok: ' + (response ? response.status : 'no response'));

        } catch (err) {
            console.warn('Primary fetch failed, attempting fallback (no-cors):', err);

            // Fallback: try sending with no-cors mode. Response will be opaque and unreadable,
            // but the request may still reach the server (useful when server doesn't send CORS headers).
            try {
                const url = useDirectWebhook ? N8N_WEBHOOK_URL : PROXY_URL;
                await fetch(url, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'sendMessage', sessionId: sessionId, chatInput: message })
                });

                // We can't read the server response in no-cors mode; assume it reached the server.
                setTyping(false);
                addMessage('✅ Message envoyé (mode restreint). La réponse serveur n\'a pas pu être récupérée.', false);

            } catch (err2) {
                console.error('Fallback (no-cors) also failed:', err2);
                setTyping(false);
                addMessage('عذراً، لا يمكن الاتصال بالخادم.\nImpossible de se connecter au serveur.\nUnable to connect to server.', false);
            }
        } finally {
            chatInput.disabled = false;
            sendButton.disabled = false;
            chatInput.focus();
        }
    }

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') sendMessage(); });

    // note: input is focused when chat is opened via the toggle
})();
