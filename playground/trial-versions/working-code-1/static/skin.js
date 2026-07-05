(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {

        /* ============================================================
           1. NAVBAR — scroll behaviour + active link
        ============================================================ */
        const navWrapper = document.getElementById('navbar');
        const navLinks   = document.querySelectorAll('.nav-links a');
        const sections   = document.querySelectorAll('section[id]');

        let ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Scrolled class
                    if (navWrapper) {
                        navWrapper.classList.toggle('scrolled', window.scrollY > 60);
                    }
                    // Active link
                    let current = '';
                    sections.forEach(sec => {
                        if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
                    });
                    navLinks.forEach(a => {
                        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        /* ============================================================
           2. REVEAL — IntersectionObserver (fires once)
        ============================================================ */
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

        /* ============================================================
           3. COUNTERS — count-up on enter
        ============================================================ */
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el      = entry.target;
                const target  = parseInt(el.dataset.target, 10);
                const duration = 1800;
                const start   = performance.now();

                function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

                (function tick(now) {
                    const elapsed  = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    el.textContent = Math.round(easeOut(progress) * target);
                    if (progress < 1) requestAnimationFrame(tick);
                    else el.textContent = target;
                })(start);

                counterObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

        /* ============================================================
           4. SKILL BARS — animate on enter
        ============================================================ */
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    skillObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.skill-fill').forEach(el => skillObserver.observe(el));

        /* ============================================================
           5. CONTACT FORM
        ============================================================ */
        const form      = document.getElementById('contactForm');
        const statusEl  = document.getElementById('formStatus');
        const submitBtn = document.getElementById('formBtn');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const name    = form.elements['Name']?.value.trim()    || '';
                const email   = form.elements['Email']?.value.trim()   || '';
                const message = form.elements['Message']?.value.trim() || '';

                // Validate
                if (name.length < 2) {
                    showStatus('error', 'Enter a valid name.');
                    return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    showStatus('error', 'Enter a valid email address.');
                    return;
                }
                if (message.length < 10) {
                    showStatus('error', 'Message too short — say more.');
                    return;
                }

                // Simulate send
                submitBtn.disabled = true;
                const origText = submitBtn.innerHTML;
                submitBtn.innerHTML = 'Transmitting... <i class="fa-solid fa-spinner fa-spin"></i>';

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origText;
                    showStatus('success', 'The void acknowledges your presence.');
                    form.reset();
                }, 1400);
            });
        }

        function showStatus(type, msg) {
            if (!statusEl) return;
            statusEl.className = 'form-status ' + type;
            statusEl.textContent = msg;
        }

        /* ============================================================
           6. FOOTER YEAR
        ============================================================ */
        const yearEl = document.getElementById('footerYear');
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        /* ============================================================
           7. STELLAR DUST CANVAS
        ============================================================ */
        const dustCanvas = document.getElementById('dustCanvas');
        if (dustCanvas) {
            const ctx = dustCanvas.getContext('2d');
            let W, H, particles = [];
            let mouse = { x: null, y: null };

            function resize() {
                W = dustCanvas.width  = window.innerWidth;
                H = dustCanvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resize, { passive: true });
            resize();

            window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
            window.addEventListener('mouseout',  ()=> { mouse.x = null;      mouse.y = null; });

            class Particle {
                constructor() { this.reset(); }
                reset() {
                    this.x = Math.random() * W;
                    this.y = Math.random() * H;
                    this.r = Math.random() * 1.2 + 0.3;
                    this.vx = (Math.random() - 0.5) * 0.18;
                    this.vy = (Math.random() - 0.5) * 0.18;
                    this.alpha = Math.random() * 0.4 + 0.08;
                }
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    if (this.x < 0) this.x = W;
                    if (this.x > W) this.x = 0;
                    if (this.y < 0) this.y = H;
                    if (this.y > H) this.y = 0;
                    if (mouse.x !== null) {
                        const dx = mouse.x - this.x;
                        const dy = mouse.y - this.y;
                        if (Math.hypot(dx, dy) < 180) {
                            this.x -= dx * 0.002;
                            this.y -= dy * 0.002;
                        }
                    }
                }
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(200,200,255,${this.alpha})`;
                    ctx.fill();
                }
            }

            for (let i = 0; i < 160; i++) particles.push(new Particle());

            (function loop() {
                ctx.clearRect(0, 0, W, H);
                particles.forEach(p => { p.update(); p.draw(); });
                requestAnimationFrame(loop);
            })();
        }

        /* ============================================================
           8. WEBGL DEEP SPACE BACKGROUND
        ============================================================ */
        const canvas = document.getElementById('glCanvas');
        if (canvas) {
            const gl = canvas.getContext('webgl');
            if (gl) {
                function mkShader(gl, type, src) {
                    const s = gl.createShader(type);
                    gl.shaderSource(s, src);
                    gl.compileShader(s);
                    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                        console.error(gl.getShaderInfoLog(s));
                        gl.deleteShader(s); return null;
                    }
                    return s;
                }

                const vs = `attribute vec2 pos; void main(){ gl_Position=vec4(pos,0,1); }`;
                const fs = `
                    precision highp float;
                    uniform float u_time;
                    uniform vec2 u_res;

                    float hash(vec2 p){
                        p=fract(p*vec2(123.34,456.21));
                        p+=dot(p,p+45.32);
                        return fract(p.x*p.y);
                    }
                    float noise(vec2 p){
                        vec2 i=floor(p), f=fract(p);
                        float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
                        vec2 u=f*f*(3.-2.*f);
                        return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
                    }
                    float fbm(vec2 p){
                        float v=0., a=0.5;
                        for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.; a*=.5; }
                        return v;
                    }
                    void main(){
                        vec2 uv=gl_FragCoord.xy/u_res*2.-1.;
                        uv.x*=u_res.x/u_res.y;
                        float t=u_time*.03;
                        vec2 q=vec2(fbm(uv+.1*t),fbm(uv+vec2(1.2,4.3)));
                        vec2 r=vec2(fbm(uv+4.*q+vec2(1.7,9.2)+.15*t),fbm(uv+4.*q+vec2(8.3,2.8)+.126*t));
                        float f=fbm(uv+4.*r);
                        vec3 col=mix(vec3(0),vec3(.02,.05,.15),clamp(f*f*4.,0.,1.));
                        col=mix(col,vec3(.1,.05,.2),clamp(length(q),0.,1.));
                        col=mix(col,vec3(.8,.8,1.),clamp(length(r.x),0.,1.));
                        gl_FragColor=vec4(col*(f*f*f*1.5+.2*f*f),1.);
                    }
                `;

                const prog = gl.createProgram();
                gl.attachShader(prog, mkShader(gl, gl.VERTEX_SHADER, vs));
                gl.attachShader(prog, mkShader(gl, gl.FRAGMENT_SHADER, fs));
                gl.linkProgram(prog);

                const posLoc = gl.getAttribLocation(prog, 'pos');
                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

                const tLoc = gl.getUniformLocation(prog, 'u_time');
                const rLoc = gl.getUniformLocation(prog, 'u_res');

                function render(now) {
                    canvas.width  = window.innerWidth;
                    canvas.height = window.innerHeight;
                    gl.viewport(0, 0, canvas.width, canvas.height);
                    gl.useProgram(prog);
                    gl.enableVertexAttribArray(posLoc);
                    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
                    gl.uniform1f(tLoc, now * 0.005);
                    gl.uniform2f(rLoc, canvas.width, canvas.height);
                    gl.drawArrays(gl.TRIANGLES, 0, 6);
                    requestAnimationFrame(render);
                }
                requestAnimationFrame(render);
            }
        }

    });
})();
