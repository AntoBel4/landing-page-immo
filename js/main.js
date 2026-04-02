/* ============================================
   RENTRER DES MANDATS - Landing Page JS
   Runtime, lead capture, and CTA safeguards
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    const CONFIG = {
        webhookLeadUrl: 'https://n8n.rentrerdesmandats.fr/webhook/lead-capture',
        stripePaymentLink: 'https://buy.stripe.com/28E6oI3FE7vL7r5cHk5Rm00',
        supportEmail: 'contact@rentrerdesmandats.fr',
        consentVersion: 'landing-2026-03-31',
        analytics: {},
        ...window.__RDM_CONFIG
    };

    const CONSENT_TEXT = "J'accepte de recevoir la checklist gratuite, les emails de suivi associes et les informations commerciales liees a l'offre RentrerDesMandats.";
    const header = document.querySelector('.header');
    const buyButton = document.getElementById('buyButton');
    const successModal = document.getElementById('successModal');
    const landingAttribution = initializeAttribution();

    window.closeModal = function () {
        if (successModal) {
            successModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    window.showModal = function () {
        if (successModal) {
            successModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.addEventListener('scroll', function () {
        if (!header) {
            return;
        }

        header.style.boxShadow = window.pageYOffset > 100 ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none';
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
            const targetSelector = anchor.getAttribute('href');
            if (!targetSelector || targetSelector === '#') {
                return;
            }

            const target = document.querySelector(targetSelector);
            if (!target) {
                return;
            }

            event.preventDefault();
            const headerOffset = header ? header.offsetHeight : 0;
            const targetPosition = target.offsetTop - headerOffset - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });

    document.querySelectorAll('.faq-question').forEach(function (button) {
        button.addEventListener('click', function () {
            const faqItem = button.parentElement;
            const isActive = faqItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(function (item) {
                item.classList.remove('active');
            });

            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });

    [document.getElementById('leadForm'), document.getElementById('leadFormModal')].forEach(function (form) {
        if (!form) {
            return;
        }

        form.addEventListener('submit', function (event) {
            handleLeadSubmit(event, form);
        });
    });

    if (successModal) {
        successModal.addEventListener('click', function (event) {
            if (event.target === successModal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeModal();
            if (typeof window.closeLeadModal === 'function') {
                window.closeLeadModal();
            }
        }
    });

    if (buyButton) {
        const livePaymentLink = getLivePaymentLink();

        if (livePaymentLink) {
            buyButton.href = livePaymentLink;
            buyButton.addEventListener('click', function () {
                trackEvent('buy_button_clicked', {
                    price: getButtonPrice(buyButton),
                    destination: 'stripe_payment_link',
                    ...getAnalyticsAttribution()
                });
            });
        } else {
            const supportMailto = getSupportMailto();
            buyButton.href = supportMailto;
            buyButton.setAttribute('target', '_blank');
            buyButton.setAttribute('rel', 'noopener noreferrer');
            buyButton.querySelector('span').textContent = 'Recevoir le lien de paiement';
            buyButton.classList.add('btn-buy-fallback');
            trackEvent('checkout_link_missing', { fallback: 'mailto' });
        }
    }

    const observer = new IntersectionObserver(function (entries, instance) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                instance.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    document.querySelectorAll('.problem-card, .gpt-card, .step, .bonus-item, .faq-item').forEach(function (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(element);
    });

    injectStyle(`
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `);

    injectStyle(`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `);

    injectStyle(`
        .btn-buy-fallback {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .hero-packaging {
            max-width: 760px;
            margin: -0.5rem auto 2rem;
            text-align: center;
            color: #334155;
            font-size: 1rem;
            line-height: 1.6;
        }

        .video-label {
            margin-top: 1rem;
            max-width: 20rem;
            text-align: center;
            color: #0f172a;
            font-size: 0.95rem;
            line-height: 1.5;
        }

        .pricing-disclaimer {
            margin-top: 1rem;
            font-size: 0.9rem;
            line-height: 1.6;
            color: #475569;
        }

        .consent-check {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-top: 1rem;
            font-size: 0.9rem;
            line-height: 1.5;
        }

        .lead-form .consent-check {
            color: rgba(255, 255, 255, 0.82);
        }

        .lead-form-modal .consent-check {
            color: #475569;
        }

        .consent-check input {
            margin-top: 0.2rem;
            flex: 0 0 auto;
        }

        .consent-check a {
            color: inherit;
            text-decoration: underline;
        }

        .form-status {
            min-height: 1.25rem;
            margin-top: 0.75rem;
            font-size: 0.9rem;
        }

        .form-status[data-tone="success"] {
            color: #22c55e;
        }

        .form-status[data-tone="error"] {
            color: #f87171;
        }
    `);

    initializeAnalytics();
    retryPendingLeads();

    console.log('%cRentrerDesMandats', 'font-size: 24px; font-weight: bold; color: #0047AB;');
    console.log('%cLanding runtime active', 'font-size: 12px; color: #666;');

    async function handleLeadSubmit(event, form) {
        event.preventDefault();

        const emailInput = form.querySelector('input[type="email"]');
        const consentInput = form.querySelector('input[name="consent"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const statusEl = form.querySelector('[data-form-status]');
        const email = emailInput ? emailInput.value.trim() : '';

        resetStatus(statusEl);

        if (!email || !isValidEmail(email)) {
            shakeElement(emailInput);
            updateStatus(statusEl, "Saisissez un email valide pour recevoir le guide.", 'error');
            return;
        }

        if (!consentInput || !consentInput.checked) {
            shakeElement(consentInput);
            updateStatus(statusEl, "Le consentement email est requis pour envoyer le guide.", 'error');
            return;
        }

        const originalButtonHtml = submitButton ? submitButton.innerHTML : '';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>Envoi en cours...</span>';
        }

        const payload = {
            email,
            source: form.id === 'leadFormModal' ? 'landing-modal' : 'landing-inline',
            timestamp: new Date().toISOString(),
            attribution: getLeadAttributionPayload(),
            consent: {
                accepted: true,
                acceptedAt: new Date().toISOString(),
                version: CONFIG.consentVersion,
                text: CONSENT_TEXT
            },
            page_url: window.location.href,
            user_agent: navigator.userAgent
        };

        try {
            const response = await fetch(CONFIG.webhookLeadUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Webhook error');
            }

            onLeadCaptured(form, emailInput, consentInput, statusEl, payload);
        } catch (error) {
            console.error('Lead submission error:', error);
            storeLeadLocally(payload);
            onLeadCaptured(form, emailInput, consentInput, statusEl, payload);
            updateStatus(statusEl, "Le guide est en file d'envoi. Si besoin, contactez le support.", 'success');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHtml;
            }
        }
    }

    function onLeadCaptured(form, emailInput, consentInput, statusEl, payload) {
        if (emailInput) {
            emailInput.value = '';
        }

        if (consentInput) {
            consentInput.checked = false;
        }

        if (form.id === 'leadFormModal' && typeof window.closeLeadModal === 'function') {
            window.closeLeadModal();
        }

        updateStatus(statusEl, 'Demande envoyee. Verifiez votre boite mail.', 'success');
        showModal();
        trackEvent('lead_captured', {
            email_domain: payload.email.split('@')[1] || '',
            source: payload.source,
            consent_version: payload.consent.version,
            ...getAnalyticsAttribution()
        });
    }

    function getLivePaymentLink() {
        if (!CONFIG.stripePaymentLink) {
            return '';
        }

        return /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/.test(CONFIG.stripePaymentLink)
            ? CONFIG.stripePaymentLink
            : '';
    }

    function getSupportMailto() {
        const supportEmail = CONFIG.supportEmail || 'contact@rentrerdesmandats.fr';
        const subject = encodeURIComponent('Demande de lien de paiement - Kit RentrerDesMandats 2026');
        const body = encodeURIComponent("Bonjour,\n\nJe souhaite recevoir le lien de paiement du Kit RentrerDesMandats 2026 au tarif de lancement 67 EUR si l'offre est encore active.\n\nMerci.");
        return `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    }

    function getButtonPrice(button) {
        const rawPrice = button.getAttribute('data-price-eur');
        const parsedPrice = Number.parseFloat(rawPrice || '');
        return Number.isFinite(parsedPrice) ? parsedPrice : 0;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function initializeAttribution() {
        const sessionKey = 'rdm_attribution_v1';
        const existing = readStoredAttribution(sessionKey);
        const currentTouch = extractAttributionFromLocation();
        const sessionId = existing.session_id || generateSessionId();
        const landingPath = `${window.location.pathname}${window.location.hash || ''}`;

        const nextAttribution = {
            session_id: sessionId,
            first_touch_url: existing.first_touch_url || window.location.href,
            first_referrer: existing.first_referrer || document.referrer || '',
            first_touch_at: existing.first_touch_at || new Date().toISOString(),
            latest_touch_url: window.location.href,
            latest_referrer: document.referrer || '',
            landing_path: landingPath,
            ...existing,
            ...currentTouch
        };

        sessionStorage.setItem(sessionKey, JSON.stringify(nextAttribution));
        return nextAttribution;
    }

    function readStoredAttribution(sessionKey) {
        try {
            return JSON.parse(sessionStorage.getItem(sessionKey) || '{}');
        } catch (error) {
            return {};
        }
    }

    function extractAttributionFromLocation() {
        const params = new URLSearchParams(window.location.search);
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        const values = {};

        utmKeys.forEach(function (key) {
            const value = params.get(key);
            if (value) {
                values[key] = value;
            }
        });

        if (!values.utm_source && document.referrer) {
            values.referrer_host = getHostFromUrl(document.referrer);
        }

        return values;
    }

    function getHostFromUrl(url) {
        try {
            return new URL(url).hostname;
        } catch (error) {
            return '';
        }
    }

    function generateSessionId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }

        return `rdm-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
    }

    function getLeadAttributionPayload() {
        return {
            ...landingAttribution,
            latest_touch_at: new Date().toISOString()
        };
    }

    function getAnalyticsAttribution() {
        return normalizeAnalyticsProps({
            utm_source: landingAttribution.utm_source || '',
            utm_medium: landingAttribution.utm_medium || '',
            utm_campaign: landingAttribution.utm_campaign || '',
            utm_content: landingAttribution.utm_content || '',
            utm_term: landingAttribution.utm_term || '',
            referrer_host: landingAttribution.referrer_host || getHostFromUrl(landingAttribution.latest_referrer || ''),
            session_id: landingAttribution.session_id || ''
        });
    }

    function shakeElement(element) {
        if (!element) {
            return;
        }

        element.style.animation = 'shake 0.5s ease';
        element.style.borderColor = '#ff6b6b';

        window.setTimeout(function () {
            element.style.animation = '';
            element.style.borderColor = '';
        }, 500);
    }

    function updateStatus(statusEl, message, tone) {
        if (!statusEl) {
            return;
        }

        statusEl.textContent = message;
        statusEl.dataset.tone = tone;
    }

    function resetStatus(statusEl) {
        if (!statusEl) {
            return;
        }

        statusEl.textContent = '';
        statusEl.dataset.tone = '';
    }

    function storeLeadLocally(payload) {
        const leads = JSON.parse(localStorage.getItem('pending_leads') || '[]');
        leads.push(payload);
        localStorage.setItem('pending_leads', JSON.stringify(leads));
    }

    async function retryPendingLeads() {
        const leads = JSON.parse(localStorage.getItem('pending_leads') || '[]');
        if (!leads.length) {
            return;
        }

        const remainingLeads = [];

        for (const lead of leads) {
            try {
                const response = await fetch(CONFIG.webhookLeadUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...lead,
                        retry_at: new Date().toISOString(),
                        source: `${lead.source || 'landing-page'}-retry`
                    })
                });

                if (!response.ok) {
                    throw new Error('Retry failed');
                }
            } catch (error) {
                remainingLeads.push(lead);
            }
        }

        localStorage.setItem('pending_leads', JSON.stringify(remainingLeads));
    }

    function trackEvent(eventName, eventData) {
        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', eventName, eventData);
        }

        if (typeof window.plausible === 'function') {
            window.plausible(eventName, { props: normalizeAnalyticsProps(eventData) });
        }

        if (typeof window.fbq !== 'undefined') {
            window.fbq('trackCustom', eventName, eventData);
        }

        console.log('Event tracked:', eventName, eventData);
    }

    function injectStyle(cssText) {
        const style = document.createElement('style');
        style.textContent = cssText;
        document.head.appendChild(style);
    }

    function initializeAnalytics() {
        const analytics = CONFIG.analytics || {};
        const provider = String(analytics.provider || '').toLowerCase();

        if (provider === 'plausible') {
            loadPlausible(analytics);
            return;
        }

        if (provider === 'ga4') {
            loadGa4(analytics);
        }
    }

    function loadPlausible(analytics) {
        if (!analytics.plausibleDomain) {
            console.warn('Plausible analytics skipped: missing domain.');
            return;
        }

        if (document.querySelector('script[data-rdm-analytics="plausible"]')) {
            return;
        }

        const script = document.createElement('script');
        script.defer = true;
        script.dataset.domain = analytics.plausibleDomain;
        script.dataset.rdmAnalytics = 'plausible';
        script.src = analytics.plausibleScriptUrl || 'https://plausible.io/js/script.js';
        document.head.appendChild(script);
    }

    function loadGa4(analytics) {
        if (!analytics.gaMeasurementId) {
            console.warn('GA4 analytics skipped: missing measurement ID.');
            return;
        }

        if (document.querySelector('script[data-rdm-analytics="ga4-loader"]')) {
            return;
        }

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
        };

        const script = document.createElement('script');
        script.async = true;
        script.dataset.rdmAnalytics = 'ga4-loader';
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analytics.gaMeasurementId)}`;
        document.head.appendChild(script);

        window.gtag('js', new Date());
        window.gtag('config', analytics.gaMeasurementId, {
            anonymize_ip: true
        });
    }

    function normalizeAnalyticsProps(eventData) {
        const props = {};

        Object.entries(eventData || {}).forEach(function ([key, value]) {
            if (value === null || typeof value === 'undefined') {
                return;
            }

            props[key] = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
                ? value
                : JSON.stringify(value);
        });

        return props;
    }
});
