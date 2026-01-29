/* ============================================
   RENTRER DES MANDATS - Landing Page JS
   Interactions + Webhook n8n Integration
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // === CONFIGURATION ===
    const CONFIG = {
        // Remplacer par ton webhook n8n réel
        webhookLeadUrl: 'https://n8n.rentrerdesmandats.fr/webhook/lead',
        // Remplacer par ton Payment Link Stripe réel
        stripePaymentLink: 'https://buy.stripe.com/XXXXXXXXXXXXXXX'
    };

    // === HEADER SCROLL EFFECT ===
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });

    // === SMOOTH SCROLL FOR ANCHOR LINKS ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === LEAD FORM SUBMISSION ===
    const leadForm = document.getElementById('leadForm');
    
    if (leadForm) {
        leadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();
            const submitBtn = leadForm.querySelector('button[type="submit"]');
            
            // Validation basique
            if (!email || !isValidEmail(email)) {
                shakeElement(emailInput);
                return;
            }
            
            // Disable button and show loading
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Envoi en cours...</span>';
            
            try {
                // Envoi vers webhook n8n
                const response = await fetch(CONFIG.webhookLeadUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        source: 'landing-page',
                        timestamp: new Date().toISOString(),
                        page_url: window.location.href,
                        user_agent: navigator.userAgent
                    })
                });
                
                if (response.ok) {
                    // Success
                    showModal();
                    emailInput.value = '';
                    
                    // Track conversion (si analytics)
                    trackEvent('lead_captured', { email_domain: email.split('@')[1] });
                } else {
                    throw new Error('Webhook error');
                }
                
            } catch (error) {
                console.error('Lead submission error:', error);
                
                // Fallback: afficher quand même le success (le webhook rattrapera)
                // et stocker en localStorage pour retry
                storeLeadLocally(email);
                showModal();
                emailInput.value = '';
            }
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        });
    }

    // === STRIPE PAYMENT LINK ===
    const buyButton = document.getElementById('buyButton');
    
    if (buyButton) {
        // Remplacer le placeholder par le vrai lien
        buyButton.href = CONFIG.stripePaymentLink;
        
        buyButton.addEventListener('click', function(e) {
            // Track click
            trackEvent('buy_button_clicked', { price: 47 });
        });
    }

    // === FAQ ACCORDION ===
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // === MODAL FUNCTIONS ===
    window.showModal = function() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // Close modal on backdrop click
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // === ANIMATION ON SCROLL ===
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.problem-card, .gpt-card, .step, .bonus-item, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Add animation class
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // === UTILITY FUNCTIONS ===
    
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function shakeElement(element) {
        element.style.animation = 'shake 0.5s ease';
        element.style.borderColor = '#ff6b6b';
        
        setTimeout(() => {
            element.style.animation = '';
            element.style.borderColor = '';
        }, 500);
    }

    // Add shake animation
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(shakeStyle);

    function storeLeadLocally(email) {
        // Fallback storage pour retry ultérieur
        const leads = JSON.parse(localStorage.getItem('pending_leads') || '[]');
        leads.push({
            email: email,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('pending_leads', JSON.stringify(leads));
    }

    function trackEvent(eventName, eventData = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, eventData);
        }
        
        // Console log pour debug
        console.log('Event tracked:', eventName, eventData);
    }

    // === RETRY PENDING LEADS ===
    async function retryPendingLeads() {
        const leads = JSON.parse(localStorage.getItem('pending_leads') || '[]');
        
        if (leads.length === 0) return;
        
        const successfulIndices = [];
        
        for (let i = 0; i < leads.length; i++) {
            try {
                const response = await fetch(CONFIG.webhookLeadUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: leads[i].email,
                        source: 'landing-page-retry',
                        timestamp: leads[i].timestamp,
                        retry_at: new Date().toISOString()
                    })
                });
                
                if (response.ok) {
                    successfulIndices.push(i);
                }
            } catch (error) {
                console.log('Retry failed for:', leads[i].email);
            }
        }
        
        // Remove successful leads
        const remainingLeads = leads.filter((_, index) => !successfulIndices.includes(index));
        localStorage.setItem('pending_leads', JSON.stringify(remainingLeads));
    }

    // Retry on page load
    retryPendingLeads();

    // === COUNTDOWN TIMER (Optional - uncomment if needed) ===
    /*
    function initCountdown(targetDate) {
        const countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;
        
        function updateCountdown() {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;
            
            if (diff <= 0) {
                countdownEl.innerHTML = 'Offre expirée';
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            countdownEl.innerHTML = `${days}j ${hours}h ${minutes}m ${seconds}s`;
        }
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
    
    // Uncomment and set target date if needed:
    // initCountdown('2026-08-11T00:00:00');
    */

    // === CONSOLE BRANDING ===
    console.log('%c🏠 RentrerDesMandats', 'font-size: 24px; font-weight: bold; color: #0047AB;');
    console.log('%cKit Mandataire 2026 - Landing Page', 'font-size: 12px; color: #666;');

});
