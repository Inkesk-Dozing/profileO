/**
 * THE UNCREATED SOURCE — Interactive Layer
 * Author: Harsh Dev Jha (Primus)
 *
 * Security: No innerHTML injection. No eval(). 
 * All DOM mutations use textContent or safe DOM API.
 * Event listeners bound via addEventListener only.
 */

(function () {
    'use strict';

    /* =========================================================
       UTILITY
    ========================================================= */

    /**
     * Safely run a function once the DOM is ready.
     * @param {Function} fn
     */
    function domReady(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        }
    }

    /**
     * Input sanitizer — strips HTML characters from a string.
     * Used for any string that will be reflected into the DOM as text.
     * @param {string} str
     * @returns {string}
     */
    function sanitize(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Validate email with a strict pattern.
     * @param {string} email
     * @returns {boolean}
     */
    function isValidEmail(email) {
        const pattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    }

    /* =========================================================
       NAVBAR — Scroll behavior + Hamburger
    ========================================================= */

    function initNavbar() {
        const navWrapper = document.getElementById('navWrapper');
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        const navLinks = document.querySelectorAll('.nav-links a');

        if (!navWrapper) return;

        // Scroll: add .scrolled class
        let ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(function () {
                    if (window.scrollY > 40) {
                        navWrapper.classList.add('scrolled');
                    } else {
                        navWrapper.classList.remove('scrolled');
                    }
                    updateActiveNavLink();
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });

        // Active nav link based on current scroll position
        function updateActiveNavLink() {
            const sections = document.querySelectorAll('section[id]');
            let currentId = '';
            sections.forEach(function (section) {
                const top = section.getBoundingClientRect().top;
                if (top <= 120) {
                    currentId = section.id;
                }
            });
            navLinks.forEach(function (link) {
                const href = link.getAttribute('href');
                link.classList.toggle('active', href === '#' + currentId);
            });
        }

        // Hamburger toggle
        if (hamburgerBtn && mobileMenu) {
            hamburgerBtn.addEventListener('click', function () {
                const isOpen = mobileMenu.classList.contains('open');
                mobileMenu.classList.toggle('open', !isOpen);
                hamburgerBtn.classList.toggle('open', !isOpen);
                hamburgerBtn.setAttribute('aria-expanded', String(!isOpen));
                // Prevent body scroll when menu is open
                document.body.style.overflow = isOpen ? '' : 'hidden';
            });

            // Close on mobile link click
            mobileLinks.forEach(function (link) {
                link.addEventListener('click', function () {
                    mobileMenu.classList.remove('open');
                    hamburgerBtn.classList.remove('open');
                    hamburgerBtn.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                });
            });

            // Close on Escape key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    hamburgerBtn.classList.remove('open');
                    hamburgerBtn.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    /* =========================================================
       SCROLL REVEAL — IntersectionObserver
    ========================================================= */

    function initScrollReveal() {
        const targets = document.querySelectorAll('.reveal');
        if (!targets.length) return;

        // Performance: use threshold of 0.15 (15% visible)
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Fire once
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        targets.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* =========================================================
       COUNTER ANIMATION
    ========================================================= */

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target) || target <= 0) return;

        const duration = 1800;
        const startTime = performance.now();
        const startValue = 0;

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function tick(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const currentValue = Math.round(startValue + (target - startValue) * easedProgress);

            el.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(tick);
    }

    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (counter) {
            observer.observe(counter);
        });
    }

    /* =========================================================
       SKILL BAR ANIMATIONS
    ========================================================= */

    function initSkillBars() {
        const fills = document.querySelectorAll('.skill-fill');
        if (!fills.length) return;

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const fill = entry.target;
                    const width = parseFloat(fill.getAttribute('data-width'));
                    if (!isNaN(width)) {
                        // Apply transform via style (safe — no string interpolation from user input)
                        fill.style.transform = 'scaleX(' + Math.min(Math.max(width, 0), 1) + ')';
                        fill.classList.add('animated');
                    }
                    observer.unobserve(fill);
                }
            });
        }, { threshold: 0.3 });

        fills.forEach(function (fill) {
            observer.observe(fill);
        });
    }

    /* =========================================================
       PROJECT CARD — Mouse tracking glow effect
    ========================================================= */

    function initProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
                const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
                card.style.setProperty('--mx', x + '%');
                card.style.setProperty('--my', y + '%');
            }, { passive: true });
        });
    }

    /* =========================================================
       CONTACT FORM — Validation & Submit
    ========================================================= */

    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const statusEl = document.getElementById('formStatus');
        const submitBtn = document.getElementById('formSubmitBtn');
        const btnText = document.getElementById('formBtnText');
        const btnIcon = document.getElementById('formBtnIcon');

        function setStatus(type, msg) {
            if (!statusEl) return;
            statusEl.className = 'form-status ' + type;
            // Safe: textContent, not innerHTML
            statusEl.textContent = sanitize(msg);
        }

        function setLoading(isLoading) {
            if (!submitBtn || !btnText || !btnIcon) return;
            submitBtn.disabled = isLoading;
            if (isLoading) {
                btnText.textContent = 'Sending...';
                btnIcon.className = 'fa-solid fa-spinner fa-spin';
            } else {
                btnText.textContent = 'Send Message';
                btnIcon.className = 'fa-solid fa-paper-plane';
            }
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Clear previous status
            if (statusEl) {
                statusEl.className = 'form-status';
                statusEl.textContent = '';
            }

            // Collect + validate
            const nameVal = (form.elements['name'] ? form.elements['name'].value : '').trim();
            const emailVal = (form.elements['email'] ? form.elements['email'].value : '').trim();
            const subjectVal = (form.elements['subject'] ? form.elements['subject'].value : '').trim();
            const messageVal = (form.elements['message'] ? form.elements['message'].value : '').trim();

            if (!nameVal || nameVal.length < 2) {
                setStatus('error', 'Please enter your name (minimum 2 characters).');
                if (form.elements['name']) form.elements['name'].focus();
                return;
            }

            if (!emailVal || !isValidEmail(emailVal)) {
                setStatus('error', 'Please enter a valid email address.');
                if (form.elements['email']) form.elements['email'].focus();
                return;
            }

            if (!subjectVal || subjectVal.length < 3) {
                setStatus('error', 'Please enter a subject (minimum 3 characters).');
                if (form.elements['subject']) form.elements['subject'].focus();
                return;
            }

            if (!messageVal || messageVal.length < 10) {
                setStatus('error', 'Your message must be at least 10 characters.');
                if (form.elements['message']) form.elements['message'].focus();
                return;
            }

            // Production note: wire to Formspree / EmailJS / backend here.
            // For now: simulate send with graceful confirmation.
            setLoading(true);

            var timer = setTimeout(function () {
                setLoading(false);
                setStatus('success', 'Message received. I\'ll be in touch soon.');
                form.reset();
                // Clear timer reference for GC
                clearTimeout(timer);
            }, 1500);
        });
    }

    /* =========================================================
       FOOTER YEAR
    ========================================================= */

    function initFooterYear() {
        var yearEl = document.getElementById('footerYear');
        if (yearEl) {
            // Safe: textContent
            yearEl.textContent = new Date().getFullYear().toString();
        }
    }

    /* =========================================================
       SMOOTH SCROLL POLYFILL (for buttons/links)
    ========================================================= */

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                var target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /* =========================================================
       INIT
    ========================================================= */

    domReady(function () {
        initNavbar();
        initScrollReveal();
        initCounters();
        initSkillBars();
        initProjectCards();
        initContactForm();
        initFooterYear();
        initSmoothScroll();
    });

})(); // IIFE — no global scope pollution
