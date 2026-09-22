import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'jsm/loaders/DRACOLoader.js';
import { FontLoader } from 'jsm/loaders/FontLoader.js';
import { TextGeometry } from 'jsm/geometries/TextGeometry.js';
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'jsm/postprocessing/FilmPass.js';
import { ShaderPass } from 'jsm/postprocessing/ShaderPass.js';
import { CSS2DRenderer, CSS2DObject } from 'jsm/renderers/CSS2DRenderer.js';

// Prevent any scroll that may have started since loader.js ran
if (window.lenis) window.lenis.stop();

const w = window.innerWidth;
const h = window.innerHeight;
const isMobile = w <= 768;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcc0000);

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
camera.position.set(0, 0, isMobile ? 11 : 7);

const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    canvas: document.getElementById('hero-canvas'),
    powerPreference: 'high-performance',
});
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(w, h);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '1';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
// Disable touch controls on mobile/tablet so touch events reach the scroll system
if (w <= 1024) controls.enabled = false;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(ambientLight);

const mainSpot = new THREE.SpotLight(0xffffff, 400);
mainSpot.position.set(0, 12, 2);
mainSpot.angle = 0.3;
mainSpot.penumbra = 0.8;
mainSpot.decay = 1.5;
scene.add(mainSpot);

const fillLight = new THREE.PointLight(0xffffff, 40);
fillLight.position.set(0, -4, 4);
scene.add(fillLight);

const eyeLight = new THREE.PointLight(0xffffff, 80);
eyeLight.position.set(0, 0, 5);
scene.add(eyeLight);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
if (!isMobile) {
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.4, 0.1, 0.8));
    composer.addPass(new FilmPass(0.7, 0.3, 1024, false));
}

const BarrelDistortionShader = {
    uniforms: {
        tDiffuse: { value: null },
        strength: { value: 0.15 }
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float strength;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv - 0.5;
      float dist = dot(uv, uv);
      uv *= 1.0 + strength * dist;
      uv += 0.5;
      vec2 edge = smoothstep(0.0, 0.02, uv) * smoothstep(1.0, 0.98, uv);
      float edgeFactor = edge.x * edge.y;
      vec4 color = texture2D(tDiffuse, clamp(uv, 0.0, 1.0));
      gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), color, edgeFactor);
    }
  `
};

const barrelPass = new ShaderPass(BarrelDistortionShader);
if (!isMobile) composer.addPass(barrelPass);

let hand;
const eyes = [];
const items = [];
const year = ['1', '9', '8', '4'];
let mouse = { x: 0, y: 0 };

const ropeOffsets = [
    new THREE.Vector3(-0.15, -0.9, 0.09),
    new THREE.Vector3(0.05, -0.95, 0.19),
    new THREE.Vector3(0.2, -0.9, 0.09),
    new THREE.Vector3(0.4, -0.65, 0.05),
];
const ropeLines = [];

const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333, metalness: 0.1, roughness: 0.9
    });
    year.forEach((letter, i) => {
        const textGeo = new TextGeometry(letter, {
            font, size: 0.8, height: 0.1, curveSegments: 12,
            bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02
        });
        textGeo.center();
        const textMesh = new THREE.Mesh(textGeo, textMaterial);
        scene.add(textMesh);
        items.push(textMesh);
    });
});

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const handLoadPromise = new Promise((resolve) => {
    gltfLoader.load('./models/hand.glb', (gltf) => {
        hand = gltf.scene;
        hand.scale.setScalar(isMobile ? 3.2 : 4.5);
        hand.rotation.set(Math.PI, Math.PI, Math.PI);
        hand.position.y = 10;
        scene.add(hand);

        ropeOffsets.forEach(() => {
            const geo = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, -1.2, 0),
            ]);
            const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff }));
            scene.add(line);
            ropeLines.push(line);
        });

        // Tell loader.js to animate hand in once the loader hides
        window._onLoaderHidden = () => {
            window.gsap.to(hand.position, { y: 2.5, duration: 3, ease: 'power4.out' });
        };

        resolve();
    });
});

// Hand off the load promise to loader.js — it will hide the loader when ready
if (window._loaderSetHandPromise) window._loaderSetHandPromise(handLoadPromise);

function createBigBrotherEye() {
    const eyeGroup = new THREE.Group();

    // Sclera — aged, institutional grey-white, matte
    const eyeBall = new THREE.Mesh(
        new THREE.SphereGeometry(4, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xb0aca0, roughness: 0.95, metalness: 0.0 })
    );
    eyeGroup.add(eyeBall);

    // Limbal ring — dark rim separating sclera from iris
    const limbus = new THREE.Mesh(
        new THREE.CircleGeometry(2.08, 64),
        new THREE.MeshStandardMaterial({ color: 0x070705, side: THREE.DoubleSide })
    );
    limbus.position.z = 3.83;
    eyeBall.add(limbus);

    // Iris — deep charcoal, cold and still
    const iris = new THREE.Mesh(
        new THREE.CircleGeometry(1.72, 64),
        new THREE.MeshStandardMaterial({ color: 0x0e0e0b, roughness: 0.22, metalness: 0.04, side: THREE.DoubleSide })
    );
    iris.position.z = 3.87;
    eyeBall.add(iris);

    // Pupil — pure void
    const pupil = new THREE.Mesh(
        new THREE.CircleGeometry(0.52, 32),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    pupil.position.z = 3.92;
    eyeBall.add(pupil);

    // Glint — cold fluorescent lamp reflection, off-centre
    const glint = new THREE.Mesh(
        new THREE.CircleGeometry(0.16, 16),
        new THREE.MeshBasicMaterial({ color: 0xd8e4f0, transparent: true, opacity: 0.60 })
    );
    glint.position.set(0.30, 0.30, 3.93);
    eyeBall.add(glint);

    // Cornea — barely-there cold glassy dome
    const cornea = new THREE.Mesh(
        new THREE.SphereGeometry(4.05, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0xc8d4e8, transparent: true, opacity: 0.06, shininess: 160, specular: 0xddeeff })
    );
    eyeGroup.add(cornea);

    return eyeGroup;
}

// 6 eyes — two close and dominant, two mid-distance, two deep in darkness
const eyePositions = [
    [-7, 4, -6],
    [6, 3, -7],
    [-3, -2, -9],
    [5, -1, -11],
    [-9, 1, -13],
    [1, 6, -15],
];

// Larger near, smaller far — reinforces depth
const eyeScales = [0.50, 0.46, 0.36, 0.34, 0.26, 0.22];

if (!isMobile) {
    eyePositions.forEach((pos, i) => {
        const eye = createBigBrotherEye();
        eye.scale.setScalar(eyeScales[i]);
        eye.position.set(...pos);
        scene.add(eye);
        eyes.push(eye);
    });
}


window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / w) * 2 - 1;
    mouse.y = -(e.clientY / h) * 2 + 1;
});

function animate(time) {
    requestAnimationFrame(animate);
    if (window.lenis) window.lenis.raf(time);
    controls.update();

    if (hand) {
        hand.rotation.y += (mouse.x * 0.3 + Math.PI - hand.rotation.y) * 0.05;
        hand.rotation.x += ((-mouse.y * 0.15 + Math.PI) - hand.rotation.x) * 0.05;

        ropeOffsets.forEach((offset, i) => {
            const worldPos = offset.clone().applyMatrix4(hand.matrixWorld);
            const endPos = worldPos.clone();
            endPos.y -= 1.2;
            const positions = ropeLines[i].geometry.attributes.position;
            positions.setXYZ(0, worldPos.x, worldPos.y, worldPos.z);
            positions.setXYZ(1, endPos.x, endPos.y, endPos.z);
            positions.needsUpdate = true;
            if (items[i]) items[i].position.set(endPos.x, endPos.y - 0.4, endPos.z);
        });
    }

    const mouse3D = new THREE.Vector3(mouse.x * 10, mouse.y * 10, 0);
    eyes.forEach(eye => eye.lookAt(mouse3D));

    if (isMobile) {
        renderer.render(scene, camera);
    } else {
        composer.render();
    }
    labelRenderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const nw = window.innerWidth, nh = window.innerHeight;
    const aspect = nw / nh;

    camera.aspect = aspect;
    // Pull camera back on portrait to keep hand in frame
    camera.position.z = aspect < 0.75 ? 12 : aspect < 1.1 ? 9 : 7;
    camera.updateProjectionMatrix();

    renderer.setSize(nw, nh);
    composer.setSize(nw, nh);
    labelRenderer.setSize(nw, nh);
    grainCanvas.width = Math.ceil(nw / grainRes);
    grainCanvas.height = Math.ceil(nh / grainRes);

    if (typeof bookCamera !== 'undefined' && typeof bookRenderer !== 'undefined') {
        bookCamera.aspect = aspect;
        bookCamera.updateProjectionMatrix();
        bookRenderer.setSize(nw, nh);
    }

    // Rescale hand for new orientation
    if (hand) {
        hand.scale.setScalar(aspect < 0.75 ? 3.0 : aspect < 1.1 ? 3.8 : 4.5);
    }
});

// Sayfa yüksekliğini orjinaldeki gibi 4 katına çekiyoruz, scroll kilidini kırıyoruz
document.body.style.height = isMobile ? '900vh' : '1200vh';
window.gsap.registerPlugin(window.ScrollTrigger, window.DrawSVGPlugin);
if (window.SplitText) window.gsap.registerPlugin(window.SplitText);

const grainCanvas = document.createElement('canvas');
grainCanvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;opacity:0;image-rendering:pixelated;';
document.body.appendChild(grainCanvas);
const grainCtx = grainCanvas.getContext('2d');
const grainRes = isMobile ? 4 : 1;
grainCanvas.width = Math.ceil(window.innerWidth / grainRes);
grainCanvas.height = Math.ceil(window.innerHeight / grainRes);

if (!isMobile) {
    (function drawGrain() {
        const img = grainCtx.createImageData(grainCanvas.width, grainCanvas.height);
        for (let i = 0; i < img.data.length; i += 4) {
            const v = (Math.random() * 255) | 0;
            img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
            img.data[i + 3] = 255;
        }
        grainCtx.putImageData(img, 0, 0);
        requestAnimationFrame(drawGrain);
    })();
}

function typeWriter(element, text, speed, callback) {
    let i = 0;
    element.textContent = '';
    const timer = setInterval(() => {
        element.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(timer);
            if (callback) callback();
        }
    }, speed);
}

let section2Shown = false;
let section3Shown = false;
let section4Shown = false;
let section6Shown = false;
let section7Shown = false;
let section8Shown = false;
let heroShown = true;
let textSplit = false;

function initSplitText() {
    if (textSplit) return;
    textSplit = true;
    const targets = [
        document.querySelector('#s2-quote p'),
        ...document.querySelectorAll('.s2-corner-text')
    ];
    targets.forEach(el => {
        if (!el) return;
        const words = el.textContent.trim().split(' ');
        el.innerHTML = words.map(w =>
            `<span style="display:inline-block;overflow:hidden;vertical-align:bottom;line-height:1.15;"><span class="s2-sw" style="display:inline-block;transform:translateY(110%);">${w}</span></span>`
        ).join(' ');
    });
}

function animateTextIn() {
    initSplitText();
    window.gsap.to('.s2-sw', { y: 0, duration: 0.7, stagger: 0.04, ease: 'power3.out', delay: 0.2 });
}

function animateTextOut() {
    window.gsap.set('.s2-sw', { y: '110%' });
}

let globalTransitionLock = false;

const _preventTouch = e => e.preventDefault();

function lockScroll() {
    globalTransitionLock = true;
    if (window.lenis) window.lenis.stop();
    document.addEventListener('touchmove', _preventTouch, { passive: false });
}

function releaseLock() {
    globalTransitionLock = false;
    document.removeEventListener('touchmove', _preventTouch);
    if (window.lenis) window.lenis.start();
    window.dispatchEvent(new Event('scroll'));
}

function glitchTransition(onMidpoint) {
    lockScroll();
    const canvas = document.getElementById('hero-canvas');
    const tl = window.gsap.timeline({ onComplete: releaseLock });
    tl.to(canvas, { skewX: 10, duration: 0.05, ease: 'none' })
        .to(canvas, { skewX: -8, duration: 0.05, ease: 'none' })
        .to(canvas, { skewX: 5, duration: 0.05, ease: 'none' })
        .to(canvas, { skewX: 0, duration: 0.05, ease: 'none' })
        .to(canvas, { opacity: 0, duration: 0.1, ease: 'none' })
        .add(() => { try { onMidpoint(); } catch (e) { } })
        .to(canvas, { skewX: -5, duration: 0.05, ease: 'none' })
        .to(canvas, { skewX: 3, duration: 0.05, ease: 'none' })
        .to(canvas, { skewX: 0, opacity: 1, duration: 0.1, ease: 'none' });
}

function staticTransition(onMidpoint) {
    lockScroll();
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:500;pointer-events:none;image-rendering:pixelated;';
    canvas.width = Math.max(1, Math.floor(window.innerWidth / 4));
    canvas.height = Math.max(1, Math.floor(window.innerHeight / 4));
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let frame = 0;
    let midpointCalled = false;

    function drawStatic() {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const v = Math.random() * 255;
            imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = v;
            imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        frame++;
        if (frame === 8 && !midpointCalled) {
            midpointCalled = true;
            try { onMidpoint(); } catch (e) { }
        }
        if (frame < 16) {
            requestAnimationFrame(drawStatic);
        } else {
            if (canvas.parentNode) document.body.removeChild(canvas);
            releaseLock();
        }
    }
    drawStatic();
}

function curtainTransition(onMidpoint) {
    if (window.lenis) window.lenis.stop();
    document.addEventListener('touchmove', _preventTouch, { passive: false });
    const overlay = document.createElement('div');
    overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: #000000;
    z-index: 9999;
    pointer-events: all;
    opacity: 0;
  `;
    document.body.appendChild(overlay);

    let midpointCalled = false;

    const tl = window.gsap.timeline({
        onComplete: () => {
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
            document.body.style.pointerEvents = '';
            document.removeEventListener('touchmove', _preventTouch);
            if (window.lenis) window.lenis.start();
        }
    });

    document.body.style.pointerEvents = 'none';

    tl.to(overlay, {
        opacity: 1,
        duration: 2.5,
        ease: 'power1.inOut',
        onComplete: () => {
            if (!midpointCalled) {
                midpointCalled = true;
                onMidpoint();
            }
        }
    })
        .to(overlay, {
            opacity: 0,
            duration: 3,
            ease: 'power1.inOut'
        }, '+=0.5');
}

function glitchTransitionEl(outEl, inEl, onMidpoint) {
    lockScroll();
    window.gsap.set(inEl, { opacity: 0 });
    const tl = window.gsap.timeline({ onComplete: releaseLock });
    tl.to(outEl, { skewX: 10, duration: 0.05, ease: 'none' })
        .to(outEl, { skewX: -8, duration: 0.05, ease: 'none' })
        .to(outEl, { skewX: 5, duration: 0.05, ease: 'none' })
        .to(outEl, { skewX: 0, duration: 0.05, ease: 'none' })
        .to(outEl, { opacity: 0, duration: 0.1, ease: 'none' })
        .add(() => { try { onMidpoint(); } catch (e) { } })
        .to(inEl, { skewX: -5, duration: 0.05, ease: 'none' })
        .to(inEl, { skewX: 3, duration: 0.05, ease: 'none' })
        .to(inEl, { skewX: 0, opacity: 1, duration: 0.1, ease: 'none' });
}

function glitchTransitionReverse(onMidpoint) {
    lockScroll();
    const canvas = document.getElementById('hero-canvas');
    const s2 = document.getElementById('section-2');
    canvas.style.visibility = 'visible';
    window.gsap.set(canvas, { opacity: 0, skewX: 0 });
    const tl = window.gsap.timeline({ onComplete: releaseLock });
    tl.to(s2, { skewX: 10, duration: 0.05, ease: 'none' })
        .to(s2, { skewX: -8, duration: 0.05, ease: 'none' })
        .to(s2, { skewX: 5, duration: 0.05, ease: 'none' })
        .to(s2, { skewX: 0, duration: 0.05, ease: 'none' })
        .to(s2, { opacity: 0, duration: 0.1, ease: 'none' })
        .add(() => { try { onMidpoint(); } catch (e) { } })
        .to(canvas, { skewX: -5, duration: 0.05, ease: 'none' })
        .to(canvas, { skewX: 3, duration: 0.05, ease: 'none' })
        .to(canvas, { skewX: 0, opacity: 1, duration: 0.1, ease: 'none' });
}

function mobileTransition(onMidpoint) {
    globalTransitionLock = true;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:9999;pointer-events:none;opacity:0;transition:opacity 0.25s linear;';
    document.body.appendChild(overlay);
    void overlay.offsetHeight; // force reflow so initial opacity:0 is painted
    overlay.style.opacity = '1';
    setTimeout(() => {
        try { onMidpoint(); } catch (e) { }
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) document.body.removeChild(overlay);
            globalTransitionLock = false;
            window.dispatchEvent(new Event('scroll'));
        }, 270);
    }, 270);
}

function _transition(cb) {
    if (isMobile) mobileTransition(cb); else glitchTransition(cb);
}

function _transitionEl(outEl, inEl, cb) {
    if (isMobile) {
        mobileTransition(() => {
            if (outEl) outEl.style.opacity = '0';
            if (inEl) inEl.style.opacity = '1';
            cb();
        });
    } else {
        glitchTransitionEl(outEl, inEl, cb);
    }
}

function _transitionReverse(cb) {
    if (isMobile) {
        mobileTransition(cb);
    } else {
        glitchTransitionReverse(cb);
    }
}

// ----------------------------------------------------
// GERÇEK DÜZELTME: MATEMATİKSEL NORMALİZASYON DİNLEYİCİSİ
// ----------------------------------------------------
let s6LastScrollY = 0;
window.addEventListener('scroll', () => {
    if (s6Active) {
        s6Velocity = Math.min(Math.abs(window.scrollY - s6LastScrollY) / 20, 3);
    }
    s6LastScrollY = window.scrollY;

    const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);

    // KESİN ÇÖZÜM: Her sahneye tam olarak doğrusal ve eşit tetiklenme payı veriyoruz (%20'lik dilimler)

    // Sahneler arası oransal eşitleme sınırları
    const boundary_1_to_2 = 0.11;
    const boundary_2_to_3 = isMobile ? 0.19 : 0.27;
    const boundary_3_to_4 = isMobile ? 0.30 : 0.33;
    const boundary_4_to_6 = isMobile ? 0.40 : 0.44;
    const boundary_6_to_7 = isMobile ? 0.80 : 0.70;

    // Go to section 2
    if (progress > boundary_1_to_2 && !section2Shown && !globalTransitionLock) {
        section2Shown = true;
        heroShown = false;
        const s2 = document.getElementById('section-2');
        _transition(() => {
            if (!isMobile) document.getElementById('hero-canvas').style.visibility = 'hidden';
            if (s2) { s2.style.opacity = '1'; s2.style.pointerEvents = 'auto'; }
            grainCanvas.style.opacity = '0.12';
            const paths = [...document.querySelectorAll('#s2-prisoners path')];
            paths.forEach(p => {
                try {
                    const len = p.getTotalLength();
                    p.style.fill = 'none'; p.style.stroke = 'black'; p.style.strokeWidth = '2';
                    p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
                } catch (e) { }
            });
            window.gsap.to(paths, { strokeDashoffset: 0, duration: 0.25, stagger: 0.0015, ease: 'power2.inOut' });
            animateTextIn();
        });
    }

    // Go to section 3
    if (progress > boundary_2_to_3 && section2Shown && !section3Shown && !section4Shown && !globalTransitionLock) {
        section3Shown = true;
        const s2 = document.getElementById('section-2');
        const s3 = document.getElementById('section-3');
        _transitionEl(s2, s3, () => {
            if (s2) s2.style.pointerEvents = 'none';
            animateTextOut();
            if (s3) s3.style.pointerEvents = 'auto';
            window.gsap.fromTo('#section-3-inner',
                { scale: 0.1, rotation: 720, opacity: 0 },
                { scale: 1, rotation: 0, opacity: 1, duration: 1.8, ease: 'power4.out' }
            );
            window.gsap.from('#s3-headline', { rotation: -1, y: 20, duration: 0.8, ease: 'power2.out', delay: 0.5 });
            typeWriter(document.getElementById('s3-headline'), 'OCEANIA WINS WAR\nPEACE RESTORED', 80);
        });
    }

    // Go back from section 3 to section 2
    if (progress < (boundary_2_to_3 - 0.05) && section3Shown && !globalTransitionLock) {
        section3Shown = false;
        const s2 = document.getElementById('section-2');
        const s3 = document.getElementById('section-3');
        _transitionEl(s3, s2, () => {
            if (s3) { s3.style.pointerEvents = 'none'; document.getElementById('s3-headline').textContent = ''; }
            if (s2) s2.style.pointerEvents = 'auto';
            animateTextIn();
        });
    }

    // Go to section 4
    if (progress > boundary_3_to_4 && section3Shown && !section4Shown && !globalTransitionLock) {
        section4Shown = true;
        const s3 = document.getElementById('section-3');
        const s4 = document.getElementById('section-4');
        _transitionEl(s3, s4, () => {
            if (s3) s3.style.pointerEvents = 'none';
            if (s4) s4.style.pointerEvents = 'auto';
            const s4Paths = [...document.querySelectorAll('#s4-woman path')];
            s4Paths.forEach(p => {
                p.style.fill = 'none'; p.style.stroke = '#000000'; p.style.strokeWidth = '85';
                try { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; } catch (e) { }
            });
            const s4tl = window.gsap.timeline({ delay: 0.2 });
            s4tl.to(s4Paths, { strokeDashoffset: 0, duration: 0.5, stagger: 0.00125, ease: 'none' })
                .add(() => {
                    const textEl = document.getElementById('s4-text');
                    if (textEl && !textEl.dataset.split) {
                        textEl.dataset.split = '1';
                        const words = textEl.textContent.trim().split(/\s+/);
                        textEl.innerHTML = words.map(w =>
                            `<div style="overflow:hidden;display:inline-block;"><span class="s4w" style="font-family:'Bebas Neue',sans-serif;font-size:clamp(32px,5.5vw,96px);color:#ffffff;font-weight:900;display:inline-block;transform:translateY(110%) skewY(6deg);">${w}</span></div>`
                        ).join(' ');
                    }
                    window.gsap.set('#s4-text', { opacity: 1 });
                    window.gsap.to('.s4w', { y: 0, skewY: 0, duration: 0.7, stagger: 0.06, ease: 'power4.out' });
                });
        });
    }

    // Go back from section 4 to section 3
    if (progress < (boundary_3_to_4 - 0.05) && section4Shown && !globalTransitionLock) {
        section4Shown = false;
        const s4 = document.getElementById('section-4');
        const s3 = document.getElementById('section-3');
        _transitionEl(s4, s3, () => {
            if (s4) s4.style.pointerEvents = 'none';
            if (s3) s3.style.pointerEvents = 'auto';
            document.querySelectorAll('#s4-woman path').forEach(p => {
                try { p.style.strokeDashoffset = p.getTotalLength(); } catch (e) { }
            });
            window.gsap.set('#s4-text', { opacity: 0 });
            const textEl4 = document.getElementById('s4-text');
            if (textEl4 && textEl4.dataset.split) {
                delete textEl4.dataset.split;
                textEl4.innerHTML = '"WHO CONTROLS THE PAST CONTROLS THE FUTURE. WHO CONTROLS THE PRESENT CONTROLS THE PAST."';
            }
        });
    }

    // Go to section 6
    if (progress > boundary_4_to_6 && section4Shown && !section6Shown && !globalTransitionLock) {
        section6Shown = true;
        staticTransition(() => {
            document.getElementById('section-4').style.opacity = '0';
            document.getElementById('section-4').style.pointerEvents = 'none';
            document.getElementById('section-6').style.opacity = '1';
            document.getElementById('section-6').style.pointerEvents = 'auto';
            s6Active = true;
            initS6Texts();
            animateS6Texts();
            showThoughtcrime();
        });
    }

    // Go back from section 6 to section 4
    if (progress < (boundary_4_to_6 - 0.05) && section6Shown && !section7Shown && !globalTransitionLock) {
        section6Shown = false;
        s6Active = false;
        const s6 = document.getElementById('section-6');
        const s4 = document.getElementById('section-4');
        _transitionEl(s6, s4, () => {
            if (s6) s6.style.pointerEvents = 'none';
            if (s4) s4.style.pointerEvents = 'auto';
            s6LeftY = 0;
            s6RightY = 0;
            const leftText = document.getElementById('s6-left-text');
            const rightText = document.getElementById('s6-right-text');
            if (leftText) leftText.style.transform = 'translateY(0)';
            if (rightText) rightText.style.transform = 'translateY(0)';
        });
    }

    // Go to section 7
    if (progress > boundary_6_to_7 && section6Shown && !section7Shown && !globalTransitionLock) {
        section7Shown = true;
        s6Active = false;
        staticTransition(() => {
            const s6 = document.getElementById('section-6');
            const s7 = document.getElementById('section-7');
            if (s6) { s6.style.opacity = '0'; s6.style.pointerEvents = 'none'; }
            if (s7) { s7.style.opacity = '1'; s7.style.pointerEvents = 'auto'; }
            initS7();
        });
    }

    // Go back from section 7 to section 6
    if (progress < (boundary_6_to_7 - 0.05) && section7Shown && !globalTransitionLock) {
        section7Shown = false;
        const s7 = document.getElementById('section-7');
        const s6 = document.getElementById('section-6');
        _transitionEl(s7, s6, () => {
            if (s7) { s7.style.pointerEvents = 'none'; }
            if (s6) { s6.style.opacity = '1'; s6.style.pointerEvents = 'auto'; }
            s6Active = true;
            animateS6Texts();
            resetS7();
        });
    }

    // Update section 7 progress while inside it
    if (section7Shown) {
        const s7Progress = Math.max(0, Math.min(1, (progress - boundary_6_to_7) / (1 - boundary_6_to_7)));
        updateS7(s7Progress);
    }

    // Go to section 8
    if (progress > 0.98 && !section8Shown) {
        section8Shown = true;
        curtainTransition(() => {
            document.querySelectorAll('section').forEach(s => {
                s.style.opacity = '0';
                s.style.pointerEvents = 'none';
            });
            if (!isMobile) document.getElementById('hero-canvas').style.visibility = 'hidden';
            document.getElementById('section-8').style.opacity = '1';
            document.getElementById('section-8').style.pointerEvents = 'auto';
            const ct = document.getElementById('cursor-text');
            if (ct) ct.style.display = 'none';
            startSection8Animation();
        });
    }

    // Go back from section 8 to section 7
    if (progress < 0.93 && section8Shown) {
        section8Shown = false;
        curtainTransition(() => {
            document.getElementById('section-8').style.opacity = '0';
            document.getElementById('section-8').style.pointerEvents = 'none';
            const s7 = document.getElementById('section-7');
            if (s7) { s7.style.opacity = '1'; s7.style.pointerEvents = 'auto'; }
            const ct = document.getElementById('cursor-text');
            if (ct) ct.style.display = '';
        });
    }

    // Go back to hero
    if (progress < (boundary_1_to_2 - 0.05) && !heroShown && !globalTransitionLock) {
        heroShown = true;
        section2Shown = false;
        _transitionReverse(() => {
            document.getElementById('section-2').style.opacity = '0';
            document.getElementById('section-2').style.pointerEvents = 'none';
            grainCanvas.style.opacity = '0';
            animateTextOut();
            const paths = [...document.querySelectorAll('#s2-prisoners path')];
            paths.forEach(p => {
                try {
                    const len = p.getTotalLength();
                    p.style.strokeDashoffset = len;
                } catch (e) { }
            });
        });
    }
});

// SECTION 6 — Book scene
const bookScene = new THREE.Scene();

const bookCamera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
bookCamera.position.set(0, 0, 5);

const bookRenderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: true,
    canvas: document.getElementById('book-canvas'),
    powerPreference: 'high-performance',
});
bookRenderer.setSize(w, h);
bookRenderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
bookRenderer.setClearColor(0x000000, 0);
bookRenderer.toneMapping = THREE.ACESFilmicToneMapping;
bookRenderer.toneMappingExposure = 1.2;

const bookLight = new THREE.SpotLight(0xffffff, 100);
bookLight.position.set(0, 8, 5);
bookLight.angle = 0.4;
bookLight.penumbra = 0.8;
bookScene.add(bookLight);

const bookAmbient = new THREE.AmbientLight(0xffffff, 0.1);
bookScene.add(bookAmbient);

let bookModel = null;

const bookLoader = new GLTFLoader();
bookLoader.setDRACOLoader(dracoLoader);
bookLoader.load('./the-book.glb', (gltf) => {
    bookModel = gltf.scene;
    bookModel.scale.setScalar(isMobile ? 1.1 : 2);
    bookModel.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.9,
                metalness: 0.1,
            });
        }
    });
    bookScene.add(bookModel);
});

let s6LeftY = 0;
let s6RightY = 0;
let s6Active = false;
let s6Velocity = 0;
let s6LeftLoopH = 0;
let s6RightLoopH = 0;
let s6Initialized = false;
let s6TiltX = 0;
let s6TiltZ = 0;

function initS6Texts() {
    if (s6Initialized) return;
    s6Initialized = true;
    const leftText = document.getElementById('s6-left-text');
    const rightText = document.getElementById('s6-right-text');
    if (leftText) {
        const orig = leftText.innerHTML;
        leftText.innerHTML = orig + orig + orig;
    }
    if (rightText) {
        const orig = rightText.innerHTML;
        rightText.innerHTML = orig + orig + orig;
    }
    requestAnimationFrame(() => {
        if (leftText) s6LeftLoopH = leftText.scrollHeight / 3;
        if (rightText) {
            s6RightLoopH = rightText.scrollHeight / 3;
            // Pre-position right column so it starts scrolling downward from the correct copy
            rightText.style.transform = `translateY(${-2 * s6RightLoopH}px)`;
        }
    });
}

function animateS6Texts() {
    if (!s6Active) return;
    const speed = 1.2 + s6Velocity * 4;
    s6Velocity *= 0.90;

    // Left column scrolls UP
    s6LeftY += speed;
    if (s6LeftLoopH > 0 && s6LeftY >= s6LeftLoopH) s6LeftY -= s6LeftLoopH;

    // Right column scrolls DOWN (opposite direction)
    s6RightY += speed * 0.6;
    if (s6RightLoopH > 0 && s6RightY >= s6RightLoopH) s6RightY -= s6RightLoopH;

    const blur = Math.min(s6Velocity * 1.8, 3.5);
    const leftText = document.getElementById('s6-left-text');
    const rightText = document.getElementById('s6-right-text');

    if (leftText) {
        leftText.style.filter = blur > 0.1 ? `blur(${blur}px)` : '';
        leftText.style.transform = `translateY(-${s6LeftY}px)`;
    }
    if (rightText && s6RightLoopH > 0) {
        rightText.style.filter = blur > 0.1 ? `blur(${blur}px)` : '';
        // Translate from -2*loopH upward as s6RightY grows → content moves DOWN visually
        rightText.style.transform = `translateY(${-2 * s6RightLoopH + s6RightY}px)`;
    }
    requestAnimationFrame(animateS6Texts);
}

function animateBook() {
    requestAnimationFrame(animateBook);
    if (!s6Active) return;
    if (bookModel) {
        bookModel.rotation.y += 0.005 + s6Velocity * 0.08;
        bookModel.rotation.x += (s6TiltX - bookModel.rotation.x) * 0.04;
        bookModel.rotation.z += (s6TiltZ - bookModel.rotation.z) * 0.04;
    }
    bookRenderer.render(bookScene, bookCamera);
}
animateBook();

// Section 6 mouse: book follows cursor
document.getElementById('section-6').addEventListener('mousemove', (e) => {
    if (!s6Active) return;
    const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    s6TiltX = ny * 0.45;
    s6TiltZ = -nx * 0.25;
});

document.getElementById('section-6').addEventListener('mouseleave', () => {
    s6TiltX = 0;
    s6TiltZ = 0;
});

function showThoughtcrime() {
    setTimeout(() => {
        window.gsap.to('#s6-thoughtcrime', {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
                setTimeout(() => {
                    window.gsap.to('#s6-thoughtcrime', { opacity: 0, duration: 0.5 });
                }, 3000);
            }
        });
    }, 8000);
}

// ===== SECTION 7 — CARD STACKING =====

const S7_COUNT = 9;

const s7Starts = [
    { x: -window.innerWidth * 1.9, y: -window.innerHeight * 1.6 },
    { x: window.innerWidth * 1.9, y: window.innerHeight * 1.6 },
    { x: window.innerWidth * 1.9, y: -window.innerHeight * 1.6 },
    { x: -window.innerWidth * 1.9, y: window.innerHeight * 1.6 },
    { x: -window.innerWidth * 2.0, y: 0 },
    { x: window.innerWidth * 2.0, y: 0 },
    { x: 0, y: -window.innerHeight * 2.0 },
    { x: 0, y: window.innerHeight * 2.0 },
    { x: -window.innerWidth * 1.9, y: -window.innerHeight * 0.8 },
];

const s7Rotations = [-6, 5, -8, 4, -3, 7, -5, 3, 0];
const s7Offsets = [
    { x: 8, y: -12 },
    { x: -10, y: 8 },
    { x: 6, y: -8 },
    { x: -8, y: 12 },
    { x: 12, y: -6 },
    { x: -6, y: 8 },
    { x: 4, y: -4 },
    { x: -4, y: 4 },
    { x: 0, y: 0 },
];

let s7Triggered = new Array(S7_COUNT).fill(false);
let s7ClimaxDone = false;
let s7Ready = false;
let s7MathFlashing = false;

function initS7() {
    s7Triggered = new Array(S7_COUNT).fill(false);
    s7ClimaxDone = false;
    s7Ready = false;
    s7MathFlashing = false;
    window.gsap.set('#s7-math', { opacity: 0, scale: 3, x: 0, y: 0 });
    document.getElementById('section-7').style.background = '#cc0000';
    for (let i = 0; i < S7_COUNT; i++) {
        const card = document.getElementById(`s7-card-${i + 1}`);
        if (card) {
            card.style.filter = '';
            window.gsap.set(card, {
                x: s7Starts[i].x,
                y: s7Starts[i].y,
                rotation: 0,
                rotateX: 0,
                rotateY: 0,
                zIndex: i + 1
            });
        }
    }
}

function resetS7() {
    document.getElementById('s7-cards-wrapper').classList.remove('s7-alive');
    document.getElementById('s7-math').classList.remove('s7-alive');
    initS7();
}

function s7FlyCard(i) {
    const card = document.getElementById(`s7-card-${i + 1}`);
    if (!card) return;
    window.gsap.to(card, {
        x: s7Offsets[i].x,
        y: s7Offsets[i].y,
        rotation: s7Rotations[i],
        duration: 0.9,
        ease: 'back.out(1.15)',
        onComplete: () => {
            if (i === S7_COUNT - 1) {
                s7Ready = true;
                s7Climax();
            }
        }
    });
}

function s7Climax() {
    if (s7ClimaxDone) return;
    s7ClimaxDone = true;
    const s7El = document.getElementById('section-7');
    window.gsap.timeline()
        .to(s7El, { filter: 'hue-rotate(180deg) saturate(4) brightness(2)', duration: 0.05 })
        .to(s7El, { filter: 'hue-rotate(-90deg) saturate(5) brightness(0.2)', duration: 0.05 })
        .to(s7El, { filter: 'hue-rotate(60deg)  saturate(2) brightness(1.8)', duration: 0.05 })
        .to(s7El, { filter: 'none', duration: 0.07 })
        .to('#s7-math', { opacity: 1, scale: 1, duration: 0.55, ease: 'expo.out', delay: 0.05 })
        .add(() => {
            document.getElementById('s7-cards-wrapper').classList.add('s7-alive');
            document.getElementById('s7-math').classList.add('s7-alive');
        });
}

function updateS7(p) {
    // Fade background from red to black over first 30% of section 7
    const bgT = Math.min(1, p / 0.3);
    const r = Math.round(204 * (1 - bgT));
    document.getElementById('section-7').style.background = `rgb(${r},0,0)`;

    for (let i = 0; i < S7_COUNT; i++) {
        const thresh = i / (S7_COUNT + 1);
        if (!s7Triggered[i] && p > thresh) {
            s7Triggered[i] = true;
            s7FlyCard(i);
        }
    }
}

function s7HandleInteraction(nx, ny, clientX, clientY) {
    if (!s7Ready) return;
    const dist = Math.sqrt(nx * nx + ny * ny);
    const glow = Math.max(0, 1 - dist * 0.8);

    // Cold interrogation lamp — clinical, harsh, no warmth
    const spotlight = document.getElementById('s7-spotlight');
    if (spotlight && clientX !== undefined) {
        spotlight.style.background =
            `radial-gradient(circle 190px at ${clientX}px ${clientY}px, rgba(255,252,220,0.30) 0%, rgba(255,240,200,0.09) 50%, transparent 72%)`;
    }

    // Top 3 cards — mechanical surveillance-camera pan, slower
    [6, 7, 8].forEach((idx, i) => {
        const card = document.getElementById(`s7-card-${idx + 1}`);
        if (!card) return;
        const d = (i + 1) / 3;
        window.gsap.to(card, {
            rotateX: -ny * 14 * d,
            rotateY: nx * 14 * d,
            x: s7Offsets[idx].x - nx * 30 * d,
            y: s7Offsets[idx].y - ny * 30 * d,
            duration: 0.9,
            ease: 'power2.out',
            overwrite: 'auto'
        });
        card.style.filter = `brightness(${0.78 + glow * 0.38 * d}) contrast(1.25) saturate(0.82)`;
    });

    // Lower cards — dull surveillance footage, very slow drift
    [0, 1, 2, 3, 4, 5].forEach((idx) => {
        const card = document.getElementById(`s7-card-${idx + 1}`);
        if (!card) return;
        window.gsap.to(card, {
            x: s7Offsets[idx].x + nx * 6,
            y: s7Offsets[idx].y + ny * 6,
            duration: 1.9,
            ease: 'power1.out',
            overwrite: 'auto'
        });
        card.style.filter = 'brightness(0.70) contrast(1.22) saturate(0.65)';
    });

    // Math text — cold white inner glow + red propaganda halo, sluggish
    const math = document.getElementById('s7-math');
    window.gsap.to(math, {
        x: nx * 13,
        y: ny * 13,
        duration: 1.0,
        ease: 'power1.out',
        overwrite: 'auto'
    });
    if (math) {
        math.style.textShadow =
            `0 0 ${6 + glow * 16}px rgba(255,255,255,${0.5 + glow * 0.5}),` +
            `0 0 ${38 + glow * 75}px rgba(204,0,0,${0.55 + glow * 0.45}),` +
            `0 0 ${110 + glow * 130}px rgba(204,0,0,${0.08 + glow * 0.22})`;
    }

    // Reality correction — cursor near centre briefly reveals 2+2=4
    if (dist < 0.22 && !s7MathFlashing && math) {
        s7MathFlashing = true;
        const orig = math.textContent;
        math.textContent = '2+2=4';
        setTimeout(() => {
            if (math) math.textContent = orig;
            setTimeout(() => { s7MathFlashing = false; }, 2200);
        }, 130);
    }
}

document.getElementById('section-7').addEventListener('mousemove', (e) => {
    const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    s7HandleInteraction(nx, ny, e.clientX, e.clientY);
});

document.getElementById('section-7').addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const nx = (t.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const ny = (t.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    s7HandleInteraction(nx, ny, t.clientX, t.clientY);
}, { passive: true });

// ===== SECTION 8 — CLOSING =====
function startSection8Animation() {
    const quoteEl = document.getElementById('s8-quote');

    // Reset everything for re-entry
    window.gsap.set(['#s8-author', '#s8-holm', '#s8-url'], { opacity: 0 });
    window.gsap.set('#s8-divider', { width: '0px' });
    quoteEl.style.opacity = '1';

    // Revert any previous split before re-splitting
    if (quoteEl._splitInstance) {
        quoteEl._splitInstance.revert();
    }

    const split = new window.SplitText(quoteEl, { type: 'chars,words,lines', linesClass: 's8-line' });
    quoteEl._splitInstance = split;

    window.gsap.set(split.chars, { opacity: 0, y: 60, rotationX: -90, transformOrigin: '50% 50% -20px' });

    const tl = window.gsap.timeline();

    // Phase 1 — silence before the storm: long pause
    tl.to({}, { duration: 0.4 })

        // Phase 2 — chars rise line by line with rotationX flip
        .to(split.chars, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 1.4,
            stagger: { amount: 2.2, from: 'start' },
            ease: 'power4.out',
        })

        // Phase 3 — author fades in as whisper
        .to('#s8-author', { opacity: 1, duration: 1.8, ease: 'power2.out' }, '-=0.4')

        // Phase 5 — thin line draws across
        .to('#s8-divider', { width: '200px', duration: 1.6, ease: 'expo.inOut' }, '+=0.6')

        // Phase 6 — credits materialise
        .to('#s8-holm', { opacity: 1, duration: 1.2, ease: 'power2.out' }, '+=0.2')
        .to('#s8-url', { opacity: 1, duration: 1, ease: 'power2.out' }, '+=0.2');
}

// ===== SECTION 4 — PORTRAIT FOLLOWS CURSOR =====
document.getElementById('section-2').addEventListener('mousemove', (e) => {
    const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

    window.gsap.to('#s2-prisoners', {
        rotateY: nx * 10,
        rotateX: -ny * 6,
        duration: 1.1,
        ease: 'power2.out',
        overwrite: 'auto'
    });

    const vignette = document.getElementById('s2-vignette');
    if (vignette) {
        vignette.style.background =
            `radial-gradient(circle 420px at ${e.clientX}px ${e.clientY}px,` +
            ` rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 100%)`;
    }
});

document.getElementById('section-2').addEventListener('mouseleave', () => {
    window.gsap.to('#s2-prisoners', {
        rotateY: 0, rotateX: 0,
        duration: 1.4, ease: 'power3.out', overwrite: 'auto'
    });
    const vignette = document.getElementById('s2-vignette');
    if (vignette) vignette.style.background = 'none';
});

document.getElementById('section-4').addEventListener('mousemove', (e) => {
    const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

    // Portrait leans TOWARD cursor — Big Brother is watching
    window.gsap.to('#s4-woman', {
        rotateY: nx * 10,
        rotateX: -ny * 6,
        duration: 1.1,
        ease: 'power2.out',
        overwrite: 'auto'
    });

    // Darkness closes in from the cursor's position
    const vignette = document.getElementById('s4-vignette');
    if (vignette) {
        vignette.style.background =
            `radial-gradient(circle 420px at ${e.clientX}px ${e.clientY}px,` +
            ` rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 100%)`;
    }
});

document.getElementById('section-4').addEventListener('mouseleave', () => {
    window.gsap.to('#s4-woman', {
        rotateY: 0, rotateX: 0,
        duration: 1.4, ease: 'power3.out', overwrite: 'auto'
    });
    const vignette = document.getElementById('s4-vignette');
    if (vignette) vignette.style.background = 'none';
});

// CURSOR VE DİĞER YAN ÖZELLİKLER
const cursorText = document.getElementById('cursor-text');
const words = ['THOUGHTCRIME', 'DOUBLETHINK'];
let wordIndex = 0;
if (cursorText) {
    cursorText.textContent = words[0];
    cursorText.style.opacity = '0';
    let cursorShown = false;
    window.addEventListener('mousemove', (e) => {
        cursorText.style.left = e.clientX + 'px';
        cursorText.style.top = e.clientY + 'px';
        if (!cursorShown) {
            cursorShown = true;
            cursorText.style.opacity = '1';
        }
    });
    setInterval(() => {
        if (!cursorShown) return;
        wordIndex = wordIndex === 0 ? 1 : 0;
        window.gsap.to(cursorText, {
            opacity: 0, duration: 0.2,
            onComplete: () => {
                cursorText.textContent = words[wordIndex];
                window.gsap.to(cursorText, { opacity: 1, duration: 0.2 });
            }
        });
    }, 600);
}
