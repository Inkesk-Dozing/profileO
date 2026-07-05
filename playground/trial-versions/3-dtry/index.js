import * as THREE from 'three';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'jsm/loaders/DRACOLoader.js';

// Setup dimensions
const w = window.innerWidth;
const h = window.innerHeight;

// Create Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040408);
scene.fog = new THREE.FogExp2(0x040408, 0.02);

// Create Camera
const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
camera.position.set(0, 6, 12);

// Create WebGL Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('webgl-canvas'),
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.6; // Higher exposure for vibrant colors

// Add Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI - 0.05;
controls.minDistance = 2;
controls.maxDistance = 30;

// Setup Lights
// Warm golden sunrise light from the upper-back center
const sunLight = new THREE.DirectionalLight(0xffebd6, 3.0);
sunLight.position.set(0, 15, -10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.bias = -0.0005;
scene.add(sunLight);

// Strong white fill light from the front to illuminate the color textures clearly
const fillLight = new THREE.DirectionalLight(0xffffff, 4.0);
fillLight.position.set(0, 10, 10);
scene.add(fillLight);

// Purple/Pink ambient light reflecting from the sky/flowers
const ambientLight = new THREE.AmbientLight(0x2a1d4a, 2.0);
scene.add(ambientLight);

// Dynamic PointLight for local scene highlights (swaying pink highlight)
const sceneGlow = new THREE.PointLight(0xff4099, 4.0, 18);
sceneGlow.position.set(0, 2, 4);
scene.add(sceneGlow);

// Helper Variables
let modelMesh;
let particleSystem;
const particleCount = 1200;
const particlePositions = [];
const particleVelocities = [];

// Setup Draco Decoder and GLTF Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Get UI progress element
const loadingText = document.getElementById('loading-status');

// Load texture map from 1.png
const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load('1.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
});

// Load GLB Model
gltfLoader.load(
    'ImageToStl.com_1.glb',
    (gltf) => {
        modelMesh = gltf.scene;
        
        // Traverse model to configure lighting, generate UVs, and map texture
        modelMesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                const geometry = child.geometry;
                
                // Force generation of UV coordinates to map texture correctly
                geometry.computeBoundingBox();
                const bbox = geometry.boundingBox;
                const size = new THREE.Vector3();
                bbox.getSize(size);
                const min = bbox.min;
                
                const posAttr = geometry.attributes.position;
                const uvs = [];
                
                for (let i = 0; i < posAttr.count; i++) {
                    const x = posAttr.getX(i);
                    const y = posAttr.getY(i);
                    const z = posAttr.getZ(i);
                    
                    // Correct planar projection: 
                    // image height maps inversely (v = 1.0 - dy) to correct vertical flip
                    let u = (x - min.x) / (size.x || 1);
                    let v = 1.0 - ((y - min.y) / (size.y || 1));
                    
                    uvs.push(u, v);
                }
                
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geometry.attributes.uv.needsUpdate = true;
                
                // Replace monochrome material with textured material
                child.material = new THREE.MeshStandardMaterial({
                    map: colorTexture,
                    roughness: 0.65,
                    metalness: 0.05,
                    side: THREE.DoubleSide
                });
            }
        });

        // Auto-center and Scale the model dynamically
        const box = new THREE.Box3().setFromObject(modelMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Translate model to place its origin in the scene center
        modelMesh.position.sub(center);
        
        // Scale to a standard bounding box of 8 units
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 8;
        const scale = targetSize / maxDim;
        modelMesh.scale.setScalar(scale);

        // Orient the model so the flower spikes are at the bottom (foreground) 
        // and mountain ranges are at the top (background)
        modelMesh.rotation.z = Math.PI; // Flip upside down
        modelMesh.rotation.x = -0.15;   // Tilt slightly backward for presentation

        scene.add(modelMesh);
        
        // Adjust camera target
        controls.target.set(0, 0, 0);

        // Hide loading text and update UI
        if (loadingText) {
            loadingText.textContent = "Status: Rendered Successfully";
            loadingText.style.color = "#ffd700";
            setTimeout(() => {
                loadingText.style.opacity = '0';
            }, 3000);
        }

        // Setup Floating Particles around the model size
        createParticles(targetSize, targetSize);
    },
    (xhr) => {
        if (loadingText) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            loadingText.textContent = `Status: Loading Model (${percent}%)`;
        }
    },
    (error) => {
        console.error('Error loading GLB model:', error);
        if (loadingText) {
            loadingText.textContent = "Status: Failed to load 3D model";
            loadingText.style.color = "#cc0000";
        }
    }
);

// Create floating particles reflecting sunlight over the terrain
function createParticles(w, h) {
    const particleGeometry = new THREE.BufferGeometry();
    
    for (let i = 0; i < particleCount; i++) {
        const px = (Math.random() - 0.5) * w * 1.6;
        const py = (Math.random() - 0.5) * h * 1.6;
        const pz = (Math.random() - 0.5) * w * 1.6;
        
        particlePositions.push(px, py, pz);
        
        particleVelocities.push(
            (Math.random() - 0.5) * 0.008,
            (Math.random() - 0.5) * 0.008,
            (Math.random() - 0.5) * 0.008
        );
    }
    
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    
    // Soft circular glowing particle texture using canvas
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const pGlow = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    pGlow.addColorStop(0, 'rgba(255, 235, 180, 1)');
    pGlow.addColorStop(0.3, 'rgba(255, 200, 100, 0.45)');
    pGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
    pCtx.fillStyle = pGlow;
    pCtx.fillRect(0, 0, 16, 16);
    
    const pTexture = new THREE.CanvasTexture(pCanvas);
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.14,
        map: pTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
}

// Reset Camera tween
document.getElementById('reset-btn').addEventListener('click', () => {
    let startPos = camera.position.clone();
    let targetPos = new THREE.Vector3(0, 5, 12);
    
    let startTarget = controls.target.clone();
    let targetCenter = new THREE.Vector3(0, 0, 0);
    
    let duration = 40;
    let frame = 0;
    
    function animateReset() {
        frame++;
        const t = frame / duration;
        const ease = t * (2 - t);
        
        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(startTarget, targetCenter, ease);
        controls.update();
        
        if (frame < duration) {
            requestAnimationFrame(animateReset);
        }
    }
    animateReset();
});

// Window resize handler
window.addEventListener('resize', () => {
    const nw = window.innerWidth;
    const nh = window.innerHeight;
    
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    
    renderer.setSize(nw, nh);
});

// Render/Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const elapsedTime = clock.getElapsedTime();
    
    // Update Orbit Controls
    controls.update();
    
    // Animate the 3D model with a clear rotation and sway (wind/float effect)
    if (modelMesh) {
        modelMesh.rotation.y = elapsedTime * 0.16; // Increased rotation speed
        modelMesh.rotation.x = -0.15 + Math.sin(elapsedTime * 0.8) * 0.08; // Increased sway speed
        modelMesh.rotation.z = Math.cos(elapsedTime * 0.6) * 0.04;
    }
    
    // Animate Particles (Dust drift)
    if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            const idx = i * 3;
            
            // Add velocity
            positions[idx] += particleVelocities[idx];
            positions[idx + 1] += particleVelocities[idx + 1];
            positions[idx + 2] += particleVelocities[idx + 2];
            
            positions[idx] += Math.sin(elapsedTime * 0.5 + i) * 0.002;
            positions[idx + 1] += Math.cos(elapsedTime * 0.4 + i) * 0.002;
            
            // Boundary checks
            if (Math.abs(positions[idx]) > 8 || Math.abs(positions[idx + 1]) > 8 || Math.abs(positions[idx + 2]) > 8) {
                positions[idx] = (Math.random() - 0.5) * 8;
                positions[idx + 1] = (Math.random() - 0.5) * 8;
                positions[idx + 2] = (Math.random() - 0.5) * 8;
            }
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // Dynamic light movement sways the glow
    sceneGlow.position.x = Math.sin(elapsedTime * 0.4) * 3;
    sceneGlow.position.y = 1 + Math.cos(elapsedTime * 0.5) * 1;
    sceneGlow.position.z = 4 + Math.cos(elapsedTime * 0.3) * 2;
    
    renderer.render(scene, camera);
}

animate();
