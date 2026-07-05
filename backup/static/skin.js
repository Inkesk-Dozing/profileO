document.addEventListener('DOMContentLoaded', () => {

    /* --- Scroll Animations (Muted/Deep Fades) --- */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        // Require more scroll to reveal to enhance the feeling of vastness
        const revealPoint = 50;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };

    setTimeout(revealOnScroll, 100);
    window.addEventListener('scroll', revealOnScroll);


    /* --- Minimal Navbar Link Highlighting --- */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 400)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    /* --- Interactive Stellar Dust Canvas --- */
    const dustCanvas = document.getElementById('dustCanvas');
    if (dustCanvas) {
        const ctx = dustCanvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = { x: null, y: null };

        function resizeDust() {
            width = dustCanvas.width = window.innerWidth;
            height = dustCanvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resizeDust);
        resizeDust();

        // Track mouse for parallax/repulsion
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5; // Very tiny dust
                // Slow drift
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.baseAlpha = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Loop around screen gently
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;

                // Subtle mouse parallax
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 200) {
                        // Repel slightly
                        this.x -= dx * 0.002;
                        this.y -= dy * 0.002;
                    }
                }
            }

            draw() {
                ctx.fillStyle = `rgba(200, 200, 255, ${this.baseAlpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < 150; i++) {
            particles.push(new Particle());
        }

        function animateDust() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateDust);
        }

        animateDust();
    }


    /* --- WebGL Deep Space Background from trial.html --- */
    const canvas = document.getElementById('glCanvas');
    if (canvas) {
        const gl = canvas.getContext('webgl');

        if (gl) {
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

                    // Keep a hypnotic, steady speed for vast space
                    float t = u_time * 0.03; 
                    
                    vec2 q = vec2(fbm(uv + 0.1 * t), fbm(uv + vec2(1.2, 4.3)));
                    vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t), fbm(uv + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t));
                    
                    float f = fbm(uv + 4.0 * r);

                    // Deepened the color palette to true Void / Nebula
                    vec3 color = mix(vec3(0.00, 0.00, 0.00), // True Void Black
                                    vec3(0.02, 0.05, 0.15),  // Deep Nebula Blue
                                    clamp((f*f)*4.0, 0.0, 1.0));

                    color = mix(color,
                                vec3(0.1, 0.05, 0.2),    // Very faint deep violet
                                clamp(length(q), 0.0, 1.0));

                    color = mix(color,
                                vec3(0.8, 0.8, 1.0),     // Distant starlight filaments
                                clamp(length(r.x), 0.0, 1.0));

                    float intensity = f * f * f * 1.5 + 0.2 * f * f; // High contrast
                    gl_FragColor = vec4(color * intensity, 1.0);
                }
            `;

            const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
            const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

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

                gl.uniform1f(timeLocation, time * 0.005); // Global time scaling
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
    }
});
