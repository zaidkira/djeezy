// IMPORTANT: Replace this with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrLmgGq_jVC5WgZvDwn8jnHv7hDYVLOd80RAbmhuKhNtUErW7vXPAMAOHNAhCqEfth/exec';

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
        // Skip if URL is not configured
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            console.warn('Google Sheets URL not configured. Please set GOOGLE_SCRIPT_URL in script.js');
            console.log('Data that would be sent to Google Sheets:', data);
            return false;
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors', // Changed from no-cors to cors to check response
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response && response.ok) {
                console.log('✅ Data successfully sent to Google Sheets:', data);
                return true;
            } else {
                console.error('❌ Error sending to Google Sheets. Status:', response?.status);
                // Fallback to no-cors mode if CORS fails
                try {
                    await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    console.log('⚠️ Data sent with no-cors mode (response not verifiable):', data);
            return true;
                } catch (fallbackError) {
                    console.error('❌ Fallback also failed:', fallbackError);
                    return false;
                }
            }
        } catch (error) {
            console.error('❌ Error sending to Google Sheets:', error);
            // Try no-cors as fallback
            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                console.log('⚠️ Data sent with no-cors fallback:', data);
                return true;
            } catch (fallbackError) {
                console.error('❌ All attempts failed:', fallbackError);
            return false;
            }
        }
    },

    // Get user location automatically
    getUserLocation: async function() {
        let locationData = {
            latitude: null,
            longitude: null,
            city: null,
            region: null,
            country: null,
            postalCode: null,
            address: null,
            ip: null,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null
        };

        // Try browser geolocation API first
        if (navigator.geolocation) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                });

                locationData.latitude = position.coords.latitude;
                locationData.longitude = position.coords.longitude;

                // Try to reverse geocode to get address
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.latitude}&lon=${locationData.longitude}`);
                    const data = await response.json();
                    if (data.address) {
                        locationData.city = data.address.city || data.address.town || data.address.village || null;
                        locationData.region = data.address.state || data.address.region || null;
                        locationData.country = data.address.country || null;
                        locationData.postalCode = data.address.postcode || null;
                        locationData.address = `${data.address.road || ''} ${data.address.house_number || ''}, ${locationData.city || ''}, ${locationData.region || ''}, ${locationData.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
                    }
                } catch (e) {
                    console.log('Reverse geocoding failed:', e);
                }
            } catch (e) {
                console.log('Geolocation failed:', e);
            }
        }

        // Fallback to IP-based geolocation
        if (!locationData.city) {
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                locationData.ip = ipData.ip;

                const geoResponse = await fetch(`https://ipapi.co/${locationData.ip}/json/`);
                const geoData = await geoResponse.json();
                
                if (geoData.city) locationData.city = geoData.city;
                if (geoData.region) locationData.region = geoData.region;
                if (geoData.country_name) locationData.country = geoData.country_name;
                if (geoData.postal) locationData.postalCode = geoData.postal;
                if (!locationData.address && geoData.city) {
                    locationData.address = `${geoData.city}, ${geoData.region || ''}, ${geoData.country_name || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
                }
            } catch (e) {
                console.log('IP geolocation failed:', e);
            }
        }

        return locationData;
    },

    // Get device and browser information
    getDeviceInfo: function() {
        return {
            platform: navigator.platform || 'Unknown',
            deviceMemory: navigator.deviceMemory || 'Unknown',
            hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'Unknown',
            onLine: navigator.onLine,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null
        };
    },

    // Get comprehensive browser fingerprint
    getBrowserFingerprint: function() {
        let fingerprint = {
            canvasFingerprint: null,
            webglFingerprint: null,
            audioFingerprint: null,
            fonts: [],
            plugins: [],
            mimeTypes: [],
            batteryInfo: null,
            mediaDevices: null,
            webdriver: navigator.webdriver || false,
            vendor: navigator.vendor || '',
            product: navigator.product || '',
            appName: navigator.appName || '',
            appCodeName: navigator.appCodeName || '',
            appVersion: navigator.appVersion || '',
            buildID: navigator.buildID || '',
            oscpu: navigator.oscpu || ''
        };

        // Canvas fingerprinting
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('Browser fingerprint 🔍', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Browser fingerprint 🔍', 4, 17);
            fingerprint.canvasFingerprint = canvas.toDataURL().substring(0, 100);
        } catch (e) {
            console.log('Canvas fingerprint failed:', e);
        }

        // WebGL fingerprinting
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    fingerprint.webglFingerprint = {
                        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                    };
                }
            }
        } catch (e) {
            console.log('WebGL fingerprint failed:', e);
        }

        // Audio fingerprinting
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            oscillator.connect(analyser);
            analyser.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.type = 'triangle';
            oscillator.frequency.value = 10000;
            gainNode.gain.value = 0;
            oscillator.start(0);
            oscillator.stop(0);
            fingerprint.audioFingerprint = 'audio_supported';
            audioContext.close();
        } catch (e) {
            fingerprint.audioFingerprint = 'audio_not_supported';
        }

        // Font detection
        const testFonts = ['Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Trebuchet MS', 'Impact', 'Monaco', 'Menlo', 'Consolas', 'Helvetica', 'Tahoma'];
        const testString = 'mmmmmmmmmmlli';
        const testSize = '72px';
        const baseWidth = {};
        const testWidth = {};
        const span = document.createElement('span');
        span.style.fontSize = testSize;
        span.innerHTML = testString;
        span.style.position = 'absolute';
        span.style.top = '-9999px';
        document.body.appendChild(span);
        
        testFonts.forEach((font) => {
            span.style.fontFamily = font;
            baseWidth[font] = span.offsetWidth;
        });

        testFonts.forEach((font) => {
            span.style.fontFamily = font + ', monospace';
            testWidth[font] = span.offsetWidth;
            if (testWidth[font] !== baseWidth[font]) {
                fingerprint.fonts.push(font);
            }
        });

        document.body.removeChild(span);

        // Plugins
        try {
            for (let i = 0; i < navigator.plugins.length; i++) {
                fingerprint.plugins.push(navigator.plugins[i].name);
            }
        } catch (e) {
            console.log('Plugin detection failed:', e);
        }

        // MIME types
        try {
            for (let i = 0; i < navigator.mimeTypes.length; i++) {
                fingerprint.mimeTypes.push(navigator.mimeTypes[i].type);
            }
        } catch (e) {
            console.log('MIME type detection failed:', e);
        }

        // Battery API
        if (navigator.getBattery) {
            navigator.getBattery().then((battery) => {
                fingerprint.batteryInfo = {
                    charging: battery.charging,
                    level: battery.level,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                };
            }).catch(() => {});
        }

        // Media devices
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                fingerprint.mediaDevices = {
                    videoInputs: devices.filter(d => d.kind === 'videoinput').length,
                    audioInputs: devices.filter(d => d.kind === 'audioinput').length,
                    audioOutputs: devices.filter(d => d.kind === 'audiooutput').length
                };
            }).catch(() => {});
        }

        return fingerprint;
    },

    // Track user behavior patterns
    getUserBehavior: function() {
        const behaviorData = {
            clicks: JSON.parse(localStorage.getItem('clickTracking') || '[]'),
            scrolls: JSON.parse(localStorage.getItem('scrollTracking') || '[]'),
            timeOnPage: Date.now() - parseInt(localStorage.getItem('pageLoadTime') || Date.now()),
            sectionsViewed: JSON.parse(localStorage.getItem('sectionsViewed') || '[]'),
            mouseMovements: JSON.parse(localStorage.getItem('mouseMovements') || '[]'),
            keystrokeCount: parseInt(localStorage.getItem('keystrokeCount') || '0'),
            linksClicked: JSON.parse(localStorage.getItem('linksClicked') || '[]'),
            formsInteracted: JSON.parse(localStorage.getItem('formsInteracted') || '[]'),
            hoveredElements: JSON.parse(localStorage.getItem('hoveredElements') || '[]'),
            pageFocus: parseInt(localStorage.getItem('pageFocusTime') || '0'),
            pageBlur: parseInt(localStorage.getItem('pageBlurTime') || '0')
        };
        return behaviorData;
    },

    // Detect social media and extensions
    detectSocialMedia: function() {
        const socialMedia = {
            facebookLoggedIn: false,
            twitterLoggedIn: false,
            instagramLoggedIn: false,
            linkedinLoggedIn: false
        };

        // Check for social media login indicators
        try {
            if (document.cookie.includes('datr') || document.cookie.includes('sb')) {
                socialMedia.facebookLoggedIn = true;
            }
            if (document.cookie.includes('_twitter_sess') || document.cookie.includes('auth_token')) {
                socialMedia.twitterLoggedIn = true;
            }
            if (document.cookie.includes('sessionid') || document.cookie.includes('csrftoken')) {
                socialMedia.instagramLoggedIn = true;
            }
            if (document.cookie.includes('li_at') || document.cookie.includes('JSESSIONID')) {
                socialMedia.linkedinLoggedIn = true;
            }
        } catch (e) {
            console.log('Social media detection failed:', e);
        }

        return socialMedia;
    },

    // Initialize comprehensive behavior tracking
    initBehaviorTracking: function() {
        // Store page load time
        if (!localStorage.getItem('pageLoadTime')) {
            localStorage.setItem('pageLoadTime', Date.now().toString());
        }

        // Track clicks
        let clickData = [];
        document.addEventListener('click', function(e) {
            const clickInfo = {
                timestamp: Date.now(),
                x: e.clientX,
                y: e.clientY,
                target: e.target.tagName,
                targetId: e.target.id || '',
                targetClass: e.target.className || '',
                targetText: e.target.textContent.substring(0, 50) || ''
            };
            clickData.push(clickInfo);
            if (clickData.length > 100) clickData = clickData.slice(-100);
            localStorage.setItem('clickTracking', JSON.stringify(clickData));
        }, true);

        // Track scrolls
        let scrollData = [];
        let lastScrollTime = Date.now();
        window.addEventListener('scroll', function() {
            const now = Date.now();
            if (now - lastScrollTime > 500) {
                scrollData.push({
                    timestamp: now,
                    scrollY: window.scrollY,
                    scrollX: window.scrollX,
                    scrollPercent: (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                });
                lastScrollTime = now;
                if (scrollData.length > 50) scrollData = scrollData.slice(-50);
                localStorage.setItem('scrollTracking', JSON.stringify(scrollData));
            }
        });

        // Track mouse movements (sample every 2 seconds)
        let mouseData = [];
        let lastMouseTime = Date.now();
        document.addEventListener('mousemove', function(e) {
            const now = Date.now();
            if (now - lastMouseTime > 2000) {
                mouseData.push({
                    timestamp: now,
                    x: e.clientX,
                    y: e.clientY
                });
                lastMouseTime = now;
                if (mouseData.length > 30) mouseData = mouseData.slice(-30);
                localStorage.setItem('mouseMovements', JSON.stringify(mouseData));
            }
        });

        // Track section views (using Intersection Observer)
        const sections = document.querySelectorAll('section, .offer-card, .service-card');
        const sectionsViewed = JSON.parse(localStorage.getItem('sectionsViewed') || '[]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id || entry.target.className;
                    if (!sectionsViewed.includes(sectionId)) {
                        sectionsViewed.push({
                            section: sectionId,
                            timestamp: Date.now(),
                            timeViewed: Date.now()
                        });
                        localStorage.setItem('sectionsViewed', JSON.stringify(sectionsViewed));
                    }
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));

        // Track link clicks
        let linksClicked = [];
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href) {
                linksClicked.push({
                    timestamp: Date.now(),
                    href: link.href,
                    text: link.textContent.substring(0, 50)
                });
                if (linksClicked.length > 20) linksClicked = linksClicked.slice(-20);
                localStorage.setItem('linksClicked', JSON.stringify(linksClicked));
            }
        });

        // Track form interactions
        let formsInteracted = [];
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('focus', function() {
                formsInteracted.push({
                    timestamp: Date.now(),
                    type: element.type || element.tagName,
                    name: element.name || element.id || ''
                });
                if (formsInteracted.length > 20) formsInteracted = formsInteracted.slice(-20);
                localStorage.setItem('formsInteracted', JSON.stringify(formsInteracted));
            });
        });

        // Track keystrokes count (not content)
        let keystrokeCount = parseInt(localStorage.getItem('keystrokeCount') || '0');
        document.addEventListener('keydown', function() {
            keystrokeCount++;
            localStorage.setItem('keystrokeCount', keystrokeCount.toString());
        });

        // Track page focus/blur
        let focusStartTime = Date.now();
        let totalFocusTime = parseInt(localStorage.getItem('pageFocusTime') || '0');
        
        window.addEventListener('focus', function() {
            focusStartTime = Date.now();
        });

        window.addEventListener('blur', function() {
            totalFocusTime += Date.now() - focusStartTime;
            localStorage.setItem('pageFocusTime', totalFocusTime.toString());
        });

        // Track hovers
        let hoveredElements = [];
        document.querySelectorAll('a, button, .offer-card, .service-card').forEach(element => {
            element.addEventListener('mouseenter', function() {
                hoveredElements.push({
                    timestamp: Date.now(),
                    element: element.className || element.id || element.tagName,
                    text: element.textContent.substring(0, 30)
                });
                if (hoveredElements.length > 30) hoveredElements = hoveredElements.slice(-30);
                localStorage.setItem('hoveredElements', JSON.stringify(hoveredElements));
            });
        });
    },

    // Auto-detect email from browser autofill or localStorage
    getAutoEmail: function() {
        // Try to get from hidden input field with autofill (browser might auto-fill it)
        const emailInput = document.getElementById('userEmail');
        if (emailInput && emailInput.value && this.isValidEmail(emailInput.value)) {
            return emailInput.value.trim();
        }
        
        // Try localStorage (from previous visits)
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail && this.isValidEmail(storedEmail)) {
            return storedEmail;
        }

        // Try to detect from any email inputs on the page
        const allEmailInputs = document.querySelectorAll('input[type="email"]');
        for (let input of allEmailInputs) {
            if (input.value && this.isValidEmail(input.value)) {
                return input.value.trim();
            }
        }

        return '';
    },

    // Auto-detect phone from browser autofill or localStorage
    getAutoPhone: function() {
        // Try to get from hidden input field with autofill
        const phoneInput = document.getElementById('userPhone');
        if (phoneInput && phoneInput.value) {
            return phoneInput.value.trim();
        }

        // Try localStorage (from previous visits)
        const storedPhone = localStorage.getItem('userPhone');
        if (storedPhone) {
            return storedPhone;
        }

        // Try to detect from any phone/tel inputs on the page
        const allPhoneInputs = document.querySelectorAll('input[type="tel"], input[name*="phone"], input[id*="phone"]');
        for (let input of allPhoneInputs) {
            if (input.value && input.id !== 'userPhone') {
                return input.value.trim();
            }
        }

        return '';
    },

    // Track user with email - comprehensive data collection
    trackUser: async function(email, name = '', phone = '', category = '', action = 'Cookie Consent') {
        // Get location automatically
        const locationData = await this.getUserLocation();
        
        // Get device info
        const deviceInfo = this.getDeviceInfo();

        // Get browser fingerprint
        const fingerprint = this.getBrowserFingerprint();

        // Get user behavior
        const behavior = this.getUserBehavior();

        // Detect social media
        const socialMedia = this.detectSocialMedia();

        // Get selected plan information if available
        const selectedPlan = localStorage.getItem('selectedPlan') || category || 'Not defined';
        const selectedPlanName = localStorage.getItem('selectedPlanName') || '';
        const selectedPlanPrice = localStorage.getItem('selectedPlanPrice') || '';
        const planSelectedDate = localStorage.getItem('planSelectedDate') || '';

        // Calculate interest score based on behavior
        let interestScore = 0;
        if (behavior.clicks.length > 10) interestScore += 20;
        if (behavior.scrolls.length > 5) interestScore += 15;
        if (behavior.sectionsViewed.length > 3) interestScore += 25;
        if (selectedPlan !== 'Not defined') interestScore += 30;
        if (behavior.hoveredElements.length > 5) interestScore += 10;

        // Predict user intent based on behavior
        let predictedIntent = 'Browsing';
        if (selectedPlan.includes('Gamer')) predictedIntent = 'High-speed Internet Interest';
        else if (selectedPlan.includes('Équilibré')) predictedIntent = 'Balanced Plan Interest';
        else if (selectedPlan.includes('Appels')) predictedIntent = 'Calling Plan Interest';
        else if (behavior.timeOnPage > 60000) predictedIntent = 'Engaged Visitor';
        else if (behavior.clicks.length > 5) predictedIntent = 'Active Explorer';

        const userData = {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('fr-FR'),
            time: new Date().toLocaleTimeString('fr-FR'),
            email: email || 'Not provided',
            name: name || 'Not provided',
            phone: phone || 'Not provided',
            category: selectedPlan,
            selectedPlan: selectedPlanName || 'Not selected',
            selectedPlanPrice: selectedPlanPrice || 'Not provided',
            planSelectedDate: planSelectedDate || 'Not provided',
            action: action,
            cookiesAccepted: localStorage.getItem('cookiesAccepted') === 'true',
            // Location information
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            city: locationData.city,
            region: locationData.region,
            country: locationData.country,
            postalCode: locationData.postalCode,
            address: locationData.address,
            ip: locationData.ip,
            timezone: locationData.timezone,
            // Browser information
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            screenColorDepth: window.screen.colorDepth,
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            referrer: document.referrer || 'Direct',
            // Device information
            platform: deviceInfo.platform,
            deviceMemory: deviceInfo.deviceMemory,
            hardwareConcurrency: deviceInfo.hardwareConcurrency,
            maxTouchPoints: deviceInfo.maxTouchPoints,
            cookieEnabled: deviceInfo.cookieEnabled,
            doNotTrack: deviceInfo.doNotTrack,
            onLine: deviceInfo.onLine,
            connection: deviceInfo.connection ? JSON.stringify(deviceInfo.connection) : 'Unknown',
            // Additional data
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio || 1,
            sessionId: localStorage.getItem('sessionId') || null,
            // Browser Fingerprint
            canvasFingerprint: fingerprint.canvasFingerprint,
            webglVendor: fingerprint.webglFingerprint?.vendor || '',
            webglRenderer: fingerprint.webglFingerprint?.renderer || '',
            audioFingerprint: fingerprint.audioFingerprint,
            availableFonts: fingerprint.fonts.join(', ') || '',
            plugins: fingerprint.plugins.join(', ') || '',
            mimeTypes: fingerprint.mimeTypes.length || 0,
            webdriver: fingerprint.webdriver,
            vendor: fingerprint.vendor,
            product: fingerprint.product,
            // User Behavior
            clicksCount: behavior.clicks.length,
            clicksData: JSON.stringify(behavior.clicks.slice(-10)), // Last 10 clicks
            scrollsCount: behavior.scrolls.length,
            scrollMaxDepth: behavior.scrolls.length > 0 ? Math.max(...behavior.scrolls.map(s => s.scrollPercent || 0)) : 0,
            timeOnPageSeconds: Math.floor(behavior.timeOnPage / 1000),
            sectionsViewedCount: behavior.sectionsViewed.length,
            sectionsViewed: JSON.stringify(behavior.sectionsViewed),
            mouseMovementsCount: behavior.mouseMovements.length,
            keystrokeCount: behavior.keystrokeCount,
            linksClickedCount: behavior.linksClicked.length,
            linksClicked: JSON.stringify(behavior.linksClicked.slice(-5)),
            formsInteractedCount: behavior.formsInteracted.length,
            hoveredElementsCount: behavior.hoveredElements.length,
            hoveredElements: JSON.stringify(behavior.hoveredElements.slice(-10)),
            pageFocusTime: Math.floor(behavior.pageFocus / 1000),
            // Social Media Detection
            facebookDetected: socialMedia.facebookLoggedIn,
            twitterDetected: socialMedia.twitterLoggedIn,
            instagramDetected: socialMedia.instagramLoggedIn,
            linkedinDetected: socialMedia.linkedinLoggedIn,
            // Predictions
            interestScore: interestScore,
            predictedIntent: predictedIntent,
            engagementLevel: interestScore > 50 ? 'High' : interestScore > 25 ? 'Medium' : 'Low',
            // Battery Info
            batteryLevel: fingerprint.batteryInfo?.level || '',
            batteryCharging: fingerprint.batteryInfo?.charging || false,
            // Media Devices
            videoInputs: fingerprint.mediaDevices?.videoInputs || 0,
            audioInputs: fingerprint.mediaDevices?.audioInputs || 0,
            audioOutputs: fingerprint.mediaDevices?.audioOutputs || 0
        };

        // Save to localStorage
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        localStorage.setItem('userPhone', phone);
        if (locationData.city) localStorage.setItem('userCity', locationData.city);
        if (locationData.country) localStorage.setItem('userCountry', locationData.country);
        if (locationData.ip) localStorage.setItem('userIP', locationData.ip);

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

// Show cookie banner on page load and initialize comprehensive tracking
window.addEventListener('DOMContentLoaded', function() {
    // Initialize behavior tracking immediately (always track for analysis)
    CookieManager.initBehaviorTracking();

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

// Accept cookies - automatically collect email, phone, address, and selected plan without asking
async function acceptCookies() {
    // Automatically collect data without asking user
    const email = CookieManager.getAutoEmail() || document.getElementById('userEmail')?.value?.trim() || '';
    const phone = CookieManager.getAutoPhone() || '';
    
    // Get selected plan from localStorage (if user clicked on a plan before accepting cookies)
    const selectedPlan = localStorage.getItem('selectedPlan') || localStorage.getItem('userCategory') || '';
    
    // Validate email only if provided
    if (email && !CookieManager.isValidEmail(email)) {
        // If invalid, just skip email collection
        console.warn('Invalid email detected, skipping email collection');
    }

    localStorage.setItem('cookiesAccepted', 'true');
    localStorage.setItem('consentDate', new Date().toISOString());

    // Automatically track user with all available data (email, phone, address, and selected plan)
    await CookieManager.trackUser(email || '', '', phone || '', selectedPlan || '', 'Cookie Accepted');

    // Show success message
    document.getElementById('successMessage').style.display = 'block';

    setTimeout(() => {
        document.getElementById('cookieBanner').classList.remove('show');
        document.getElementById('analyticsIndicator').classList.add('show');
        document.getElementById('cookieStatus').textContent = 'Status: Acceptés ✓';
        if (selectedPlan) {
            document.getElementById('userCategory').textContent = `Catégorie: ${selectedPlan}`;
        }
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

// Track offer card clicks - store selected plan in localStorage
document.addEventListener('DOMContentLoaded', function() {
    const offerCards = document.querySelectorAll('.offer-card');

    offerCards.forEach((card) => {
        const subscribeBtn = card.querySelector('.btn-primary');

        subscribeBtn.addEventListener('click', function(e) {
            e.preventDefault();

            let category = '';
            let planName = '';
            const title = card.querySelector('h3').textContent;
            const price = card.querySelector('.offer-price')?.textContent || '';

            if (title.includes('Gamer')) {
                category = 'Gamers - Internet Haute Vitesse';
                planName = 'Forfait Gamer Pro';
            } else if (title.includes('Équilibré')) {
                category = 'Utilisateurs Standards - Usage Équilibré';
                planName = 'Forfait Équilibré';
            } else if (title.includes('Appels')) {
                category = 'Appels Prioritaires - Internet Minimal';
                planName = 'Forfait Appels Illimités';
            }

            // Store selected plan in localStorage for cookie tracking
            localStorage.setItem('selectedPlan', category);
            localStorage.setItem('selectedPlanName', planName);
            localStorage.setItem('selectedPlanPrice', price);
            localStorage.setItem('planSelectedDate', new Date().toISOString());

            // Also track immediately if cookies already accepted
            if (localStorage.getItem('cookiesAccepted') === 'true') {
                const email = CookieManager.getAutoEmail() || '';
                const phone = CookieManager.getAutoPhone() || '';
                CookieManager.trackUser(email, '', phone, category, 'Plan Selected');
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

// Test function for Google Sheets integration
// Call this from browser console: testGoogleSheets()
window.testGoogleSheets = async function() {
    console.log('🧪 Testing Google Sheets integration...');
    console.log('Google Sheets URL:', GOOGLE_SCRIPT_URL);
    
    const testData = {
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR'),
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        category: 'Test Category',
        selectedPlan: 'Test Plan',
        selectedPlanPrice: '100 DA',
        planSelectedDate: new Date().toISOString(),
        action: 'Test',
        cookiesAccepted: true,
        test: true,
        message: 'This is a test entry to verify Google Sheets integration'
    };
    
    console.log('📤 Sending test data:', testData);
    
    try {
        const result = await CookieManager.sendToGoogleSheets(testData);
        if (result) {
            console.log('✅ Test successful! Check your Google Sheet for the test entry.');
            console.log('💡 Look for a row with email: test@example.com and action: Test');
        } else {
            console.error('❌ Test failed. Check the error messages above.');
        }
        return result;
    } catch (error) {
        console.error('❌ Test error:', error);
        return false;
    }
};

// Make it accessible globally
window.CookieManager = CookieManager;
