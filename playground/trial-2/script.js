/* ==========================================================================
   Harsh Dev Jha Portfolio - Main Interactive Core
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Execute Initialization Loops
    initThemeEngine();
    initNavbarScroll();
    initWebGLBackground();
    initParticleBackground();
    initKineticGrid();
    initCursorSparks();
    initCursorGlow();
    initScrollReveal();
    initGlobalSearch();
    initNotableCarousel();
    initContactForm();
});

/* ==========================================================================
   Theme Engine (Dark/Light Persistence)
   ========================================================================== */
function initThemeEngine() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const body = document.body;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        body.classList.add('light-mode');
    }

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        
        // Save state
        const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', currentTheme);
    });
}

/* ==========================================================================
   Navbar Style on Scroll
   ========================================================================== */
function initNavbarScroll() {
    const header = document.getElementById('navHeader');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   Interactive Particle Background (Canvas Engine)
   ========================================================================== */
function initParticleBackground() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let animationFrameId;
    
    // Config properties
    const connectionDistance = 110;
    const mouseRadius = 150;
    const mouse = { x: null, y: null, active: false };
    
    // Scale particles based on viewport width
    function getParticleCount() {
        const width = window.innerWidth;
        if (width < 768) return 40;
        if (width < 1200) return 80;
        return 120;
    }
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        spawnParticles(getParticleCount());
    }
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2 + 1;
            
            // Subtle color differences
            this.color = Math.random() > 0.4 ? 'primary' : 'secondary';
        }
        
        update() {
            // Screen boundaries wrap-around
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
            
            // Cursor Attraction / Repulsion physics
            if (mouse.active && mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < mouseRadius) {
                    // Pull particles closer to cursor
                    const force = (mouseRadius - dist) / mouseRadius;
                    this.vx += (dx / dist) * force * 0.03;
                    this.vy += (dy / dist) * force * 0.03;
                    
                    // Friction limit to avoid infinite acceleration
                    const speed = Math.hypot(this.vx, this.vy);
                    if (speed > 1.5) {
                        this.vx = (this.vx / speed) * 1.5;
                        this.vy = (this.vy / speed) * 1.5;
                    }
                }
            }
            
            this.x += this.vx;
            this.y += this.vy;
        }
        
        draw() {
            // Get current accent color from CSS variables
            const isLight = document.body.classList.contains('light-mode');
            let colorStr;
            
            if (this.color === 'primary') {
                colorStr = isLight ? 'rgba(79, 70, 229, 0.45)' : 'rgba(99, 102, 241, 0.5)';
            } else {
                colorStr = isLight ? 'rgba(8, 145, 178, 0.45)' : 'rgba(6, 182, 212, 0.5)';
            }
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = colorStr;
            ctx.fill();
        }
    }
    
    function spawnParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    
    function drawConnections() {
        const isLight = document.body.classList.contains('light-mode');
        const lineColorRGB = isLight ? '79, 70, 229' : '99, 102, 241';
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${lineColorRGB}, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawConnections();
        animationFrameId = requestAnimationFrame(animate);
    }
    
    // Mouse Event Listeners on Canvas
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });
    
    // Throttle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 200);
    });
    
    // Initialization
    resizeCanvas();
    animate();
}

/* ==========================================================================
   Cursor Glow Tracker
   ========================================================================== */
function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    
    window.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
}

/* ==========================================================================
   Scroll Reveal & Navigation Link Observers
   ========================================================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const skillBars = document.querySelectorAll('.skill-progress-bar');
    
    // Section reveal on scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    reveals.forEach(el => revealObserver.observe(el));
    
    // Active navigation highlight observer
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.4 });
    
    sections.forEach(sec => navObserver.observe(sec));
    
    // Skills progress animation observer
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillBars.forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width;
                });
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    const skillsSection = document.getElementById('Skills');
    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }

    // Scroll to Top float button display
    const b2t = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            b2t.classList.add('show');
        } else {
            b2t.classList.remove('show');
        }
    });

    b2t.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ==========================================================================
   Global Site Search & Filter System
   ========================================================================== */
function initGlobalSearch() {
    const searchInput = document.getElementById('siteSearch');
    const projectCards = document.querySelectorAll('.project-card');
    const carouselCards = document.querySelectorAll('.carousel-card');
    const skillWrappers = document.querySelectorAll('.skill-bar-wrapper');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Filter helper
        function evaluateMatch(element, queryText) {
            if (!queryText) return true;
            
            // Check custom tag attributes
            const tags = element.getAttribute('data-tags') || '';
            const skillAttr = element.getAttribute('data-skill') || '';
            const textContent = element.textContent.toLowerCase();
            
            return tags.toLowerCase().includes(queryText) || 
                   skillAttr.toLowerCase().includes(queryText) || 
                   textContent.includes(queryText);
        }
        
        // Apply filter to Project Cards
        projectCards.forEach(card => {
            if (evaluateMatch(card, query)) {
                card.classList.remove('filtered-out');
            } else {
                card.classList.add('filtered-out');
            }
        });
        
        // Apply filter to Carousel Cards
        carouselCards.forEach(card => {
            if (evaluateMatch(card, query)) {
                card.classList.remove('filtered-out');
            } else {
                card.classList.add('filtered-out');
            }
        });

        // Apply filter to Skills
        skillWrappers.forEach(wrapper => {
            if (evaluateMatch(wrapper, query)) {
                wrapper.classList.remove('filtered-out');
            } else {
                wrapper.classList.add('filtered-out');
            }
        });
    });
}

/* ==========================================================================
   Notable Works Slider / Carousel Controls
   ========================================================================== */
function initNotableCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.querySelector('.carousel-controls .btn-prev');
    const nextBtn = document.querySelector('.carousel-controls .btn-next');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    let isDragging = false;
    let startX;
    let scrollLeftVal;
    
    // Navigation clicking
    prevBtn.addEventListener('click', () => {
        const cardWidth = track.querySelector('.carousel-card').offsetWidth + 30;
        track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        const cardWidth = track.querySelector('.carousel-card').offsetWidth + 30;
        track.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
    
    // Drag gestures
    track.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeftVal = track.scrollLeft;
    });
    
    track.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    track.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed scaling
        track.scrollLeft = scrollLeftVal - walk;
    });
}

/* ==========================================================================
   Contact Form Validation & Toast Feedback
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const nameInput = document.getElementById('formName');
    const emailInput = document.getElementById('formEmail');
    const messageInput = document.getElementById('formMessage');
    
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    
    function showToast(message, isError = false) {
        toastMsg.textContent = message;
        
        // Reset color coding
        if (isError) {
            toast.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            toast.querySelector('.toast-icon').className = 'fa-solid fa-triangle-exclamation toast-icon';
            toast.querySelector('.toast-icon').style.color = '#ef4444';
        } else {
            toast.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            toast.querySelector('.toast-icon').className = 'fa-solid fa-circle-check toast-icon';
            toast.querySelector('.toast-icon').style.color = '#10b981';
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    function validateField(input, validationFn, errorMsgElement) {
        const isValid = validationFn(input.value.trim());
        const group = input.parentElement;
        
        if (!isValid) {
            group.classList.add('invalid');
            return false;
        } else {
            group.classList.remove('invalid');
            return true;
        }
    }
    
    // Remove error class on focus/input
    [nameInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('input', () => {
            input.parentElement.classList.remove('invalid');
        });
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Running validations
        const isNameValid = validateField(nameInput, val => val.length > 0);
        const isEmailValid = validateField(emailInput, val => validateEmail(val));
        const isMsgValid = validateField(messageInput, val => val.length > 0);
        
        if (isNameValid && isEmailValid && isMsgValid) {
            // Simulated submission success
            showToast('Transmission completed. The core has recorded your intent.');
            form.reset();
        } else {
            showToast('Form contains errors. Please verify your vector streams.', true);
        }
    });
}

/* ==========================================================================
   WebGL Deep Space Background Shader
   ========================================================================== */
function initWebGLBackground() {
    const canvas = document.getElementById('glCanvas');
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vsSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fsSource = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;

        float hash(vec2 p) {
            p = fract(p * vec2(123.34, 456.21));
            p += dot(p, p + 45.32);
            return fract(p.x * p.y);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 6; i++) {
                v += a * noise(p);
                p *= 2.0;
                a *= 0.5;
            }
            return v;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            uv = uv * 2.0 - 1.0;
            uv.x *= u_resolution.x / u_resolution.y;

            // Steady, hypnotic rate of movement
            float t = u_time * 0.03; 
            
            vec2 q = vec2(fbm(uv + 0.1 * t), fbm(uv + vec2(1.2, 4.3)));
            vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t), fbm(uv + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t));
            
            float f = fbm(uv + 4.0 * r);

            // True deep space nebula shades
            vec3 color = mix(vec3(0.00, 0.00, 0.00), // Void Black
                            vec3(0.02, 0.04, 0.12),  // Deep Nebula Blue
                            clamp((f*f)*4.0, 0.0, 1.0));

            color = mix(color,
                        vec3(0.08, 0.03, 0.16),    // Dark purple
                        clamp(length(q), 0.0, 1.0));

            color = mix(color,
                        vec3(0.6, 0.6, 0.8),     // Stellar dust lines
                        clamp(length(r.x), 0.0, 1.0));

            float intensity = f * f * f * 1.5 + 0.2 * f * f;
            gl_FragColor = vec4(color * intensity, 1.0);
        }
    `;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return;
    }

    const positionAttributeLocation = gl.getAttribLocation(program, "position");
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    function render(time) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(program);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1f(timeLocation, time * 0.005);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

/* ==========================================================================
   Kinetic Dot-Matrix Ripple Grid (Anime.js Style)
   ========================================================================== */
function initKineticGrid() {
    const canvas = document.getElementById('kineticGrid');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let dots = [];
    const spacing = 35; 
    const minRadius = 1.2;
    const mouseRadius = 180;
    const mouse = { x: null, y: null };
    
    // Wave variables
    let waveSource = { x: null, y: null };
    let waveProgress = 0;
    const waveSpeed = 9;
    const maxWaveRadius = 700;
    let waveActive = false;

    function resizeGrid() {
        const parent = canvas.parentElement;
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        buildGrid();
    }

    class Dot {
        constructor(x, y) {
            this.baseX = x;
            this.baseY = y;
            this.x = x;
            this.y = y;
            this.radius = minRadius;
            this.alpha = 0.15;
        }

        update() {
            let dx = mouse.x - this.baseX;
            let dy = mouse.y - this.baseY;
            let distance = Math.hypot(dx, dy);

            let scale = 1;
            let offsetX = 0;
            let offsetY = 0;
            
            if (mouse.x !== null && distance < mouseRadius) {
                const force = (mouseRadius - distance) / mouseRadius;
                scale = 1 + force * 2.8; 
                offsetX = -(dx / distance) * force * 14;
                offsetY = -(dy / distance) * force * 14;
                this.alpha = 0.15 + force * 0.45;
            } else {
                this.alpha = 0.15;
            }

            if (waveActive) {
                const waveDist = Math.hypot(this.baseX - waveSource.x, this.baseY - waveSource.y);
                const waveWidth = 80;
                
                if (Math.abs(waveDist - waveProgress) < waveWidth) {
                    const waveForce = (waveWidth - Math.abs(waveDist - waveProgress)) / waveWidth;
                    
                    scale += waveForce * 3.5;
                    this.alpha = Math.min(1.0, this.alpha + waveForce * 0.7);
                    
                    const wdx = this.baseX - waveSource.x;
                    const wdy = this.baseY - waveSource.y;
                    const wdist = Math.hypot(wdx, wdy) || 1;
                    offsetX += (wdx / wdist) * waveForce * 22;
                    offsetY += (wdy / wdist) * waveForce * 22;
                }
            }

            this.x = this.baseX + offsetX;
            this.y = this.baseY + offsetY;
            this.radius = minRadius * scale;
        }

        draw() {
            const isLight = document.body.classList.contains('light-mode');
            let colorStr;
            
            if (isLight) {
                colorStr = `rgba(79, 70, 229, ${this.alpha * 0.7})`; 
            } else {
                colorStr = (this.baseX + this.baseY) % (spacing * 2) === 0
                    ? `rgba(6, 182, 212, ${this.alpha})` 
                    : `rgba(217, 70, 239, ${this.alpha})`; 
            }

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = colorStr;
            ctx.fill();
        }
    }

    function buildGrid() {
        dots = [];
        const cols = Math.floor(canvas.width / spacing);
        const rows = Math.floor(canvas.height / spacing);
        
        const startX = (canvas.width - (cols * spacing)) / 2 + spacing / 2;
        const startY = (canvas.height - (rows * spacing)) / 2 + spacing / 2;

        for (let i = 0; i <= cols; i++) {
            for (let j = 0; j <= rows; j++) {
                dots.push(new Dot(startX + i * spacing, startY + j * spacing));
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (waveActive) {
            waveProgress += waveSpeed;
            if (waveProgress > maxWaveRadius) {
                waveActive = false;
                waveProgress = 0;
            }
        }

        dots.forEach(dot => {
            dot.update();
            dot.draw();
        });

        requestAnimationFrame(animate);
    }

    canvas.parentElement.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.parentElement.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    canvas.parentElement.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        waveSource.x = e.clientX - rect.left;
        waveSource.y = e.clientY - rect.top;
        waveProgress = 0;
        waveActive = true;
    });

    resizeGrid();
    animate();

    window.addEventListener('resize', resizeGrid);
}

/* ==========================================================================
   Cursor Spark Particle Trail System (Cosmic Sparkles)
   ========================================================================== */
function initCursorSparks() {
    const canvas = document.createElement('canvas');
    canvas.id = 'sparkCanvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-2'; // Placed directly above nebula shader
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let sparks = [];
    const maxSparks = 60; 

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Spark {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2.8 + 1.2;
            this.vx = (Math.random() - 0.5) * 2.2;
            this.vy = (Math.random() - 0.5) * 2.2;
            this.alpha = 1.0;
            this.decay = Math.random() * 0.025 + 0.015;
            this.color = Math.random() > 0.5 ? 'rgba(6, 182, 212,' : 'rgba(217, 70, 239,'; 
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
            this.size = Math.max(0, this.size - 0.05);
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
    }

    window.addEventListener('mousemove', (e) => {
        if (sparks.length < maxSparks) {
            sparks.push(new Spark(e.clientX, e.clientY));
            sparks.push(new Spark(e.clientX, e.clientY));
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i];
            s.update();
            if (s.alpha <= 0 || s.size <= 0) {
                sparks.splice(i, 1);
            } else {
                s.draw();
            }
        }
        
        requestAnimationFrame(animate);
    }
    animate();
}
