/* ==========================================================================
   COSMIC CREATOR PORTFOLIO - CORE APPLICATION LOGIC (ANIME.JS ALIGNED)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons
  lucide.createIcons();

  // Primary State Manager
  const state = {
    currentChapter: 1,
    isSoundMuted: true,
    isExploded: false,
    activeUtility: 'cognition',
    activeEpoch: 0,
    gridHoverDisplacement: 0,
    targetGridDisplacement: 0,
    scrollRatio: 0,
    cameraTarget: new THREE.Vector3(0, 0, 0)
  };

  // Sound Synthesizer Engine (Web Audio API)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.1, volume = 0.03) {
    if (state.isSoundMuted) return;
    try {
      initAudio();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (err) {
      console.warn("Audio Context blocked:", err);
    }
  }

  const sounds = {
    click: () => playTone(650, 'sine', 0.08, 0.015),
    transition: () => {
      playTone(280, 'triangle', 0.2, 0.025);
      setTimeout(() => playTone(400, 'triangle', 0.2, 0.025), 80);
    },
    bang: () => {
      playTone(80, 'sawtooth', 1.0, 0.08);
      setTimeout(() => playTone(160, 'triangle', 0.6, 0.05), 150);
      setTimeout(() => playTone(320, 'sine', 0.5, 0.03), 300);
    },
    warp: () => {
      let now = 0;
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          playTone(900 - (i * 100), 'sine', 0.12, 0.015);
        }, now);
        now += 50;
      }
    }
  };

  /* ==========================================================================
     THREE.JS GRAPHICS SCENE SETUP
     ========================================================================== */
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030308, 0.003);

  // Setup Perspective Camera
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 240);

  // Setup WebGL Renderer
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x030308, 1);

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Lights System
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  const mainPointLight = new THREE.PointLight(0x00f2fe, 1.8, 320);
  mainPointLight.position.set(0, 0, 50);
  scene.add(mainPointLight);

  const accentPointLight = new THREE.PointLight(0xff007f, 1.4, 320);
  accentPointLight.position.set(0, 0, 50);
  scene.add(accentPointLight);

  /* ==========================================================================
     GEOMETRIC SCENE LAYERS
     ========================================================================== */

  // 1. Chapter 1: The Singularity / Big Bang Particles
  const particleCount = 1800;
  const particleGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];
  const particleColors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(0x00f2fe), // Cyan
    new THREE.Color(0x9d4edd), // Purple
    new THREE.Color(0xff007f)  // Magenta
  ];

  for (let i = 0; i < particleCount; i++) {
    // Tight coordinate cluster initially (The Singularity)
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const radius = Math.random() * 3.5;

    particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = radius * Math.cos(phi);

    // Save random directions for explosion
    const speed = 1.0 + Math.random() * 2.5;
    particleVelocities.push(new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.sin(phi) * Math.sin(theta) * speed,
      Math.cos(phi) * speed
    ));

    // Colors selection
    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    particleColors[i * 3] = col.r;
    particleColors[i * 3 + 1] = col.g;
    particleColors[i * 3 + 2] = col.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  const galaxyPoints = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(galaxyPoints);

  // 2. Chapter 2: Cosmic Utilities Meshes
  const utilGroup = new THREE.Group();
  utilGroup.position.set(0, 0, -50);
  scene.add(utilGroup);

  // Cognition Mesh (Torus)
  const cognitionGeometry = new THREE.TorusGeometry(12, 2.8, 16, 80);
  const cognitionMaterial = new THREE.MeshStandardMaterial({
    color: 0x9d4edd,
    wireframe: true,
    emissive: 0x3c096c,
    emissiveIntensity: 0.6
  });
  const cognitionMesh = new THREE.Mesh(cognitionGeometry, cognitionMaterial);
  cognitionMesh.position.set(-38, 0, 0);
  utilGroup.add(cognitionMesh);

  // Database Mesh (Sphere)
  const dbGeometry = new THREE.SphereGeometry(12, 24, 24);
  const dbMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    wireframe: true,
    emissive: 0x0077b6,
    emissiveIntensity: 0.5
  });
  const dbMesh = new THREE.Mesh(dbGeometry, dbMaterial);
  dbMesh.position.set(0, 0, 0);
  utilGroup.add(dbMesh);

  // Automation Mesh (TorusKnot)
  const autoGeometry = new THREE.TorusKnotGeometry(9, 2.2, 80, 16);
  const autoMaterial = new THREE.MeshStandardMaterial({
    color: 0xffb300,
    wireframe: true,
    emissive: 0xcc5a01,
    emissiveIntensity: 0.5
  });
  const autoMesh = new THREE.Mesh(autoGeometry, autoMaterial);
  autoMesh.position.set(38, 0, 0);
  utilGroup.add(autoMesh);

  // Hide utilities group scale initially
  utilGroup.scale.set(0.001, 0.001, 0.001);

  // 3. Chapter 3: Spacetime Grid Plane
  const gridResolution = 24;
  const gridGeometry = new THREE.PlaneGeometry(350, 350, gridResolution, gridResolution);
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.15
  });
  const spacetimeGrid = new THREE.Mesh(gridGeometry, gridMaterial);
  spacetimeGrid.rotation.x = -Math.PI / 2.2;
  spacetimeGrid.position.set(0, -60, -50);
  scene.add(spacetimeGrid);

  // Store original grid vertices
  const originalGridPositions = gridGeometry.attributes.position.array.slice();

  // 4. Chapter 4: Constellation Epoch Stars
  const timelineGroup = new THREE.Group();
  timelineGroup.position.set(0, 0, 50);
  scene.add(timelineGroup);

  const starGeom = new THREE.SphereGeometry(2.5, 16, 16);
  const starMaterial = new THREE.MeshStandardMaterial({ color: 0x00f2fe, emissive: 0x00f2fe });

  const epochStars = [
    { x: -30, y: -10, z: 0 },
    { x: 0, y: 15, z: -20 },
    { x: 35, y: -5, z: 10 }
  ];

  const starMeshes = [];
  epochStars.forEach((pos) => {
    const star = new THREE.Mesh(starGeom, starMaterial);
    star.position.set(pos.x, pos.y, pos.z);
    timelineGroup.add(star);
    starMeshes.push(star);
  });

  // Connect starlight nodes
  const linePoints = epochStars.map(pos => new THREE.Vector3(pos.x, pos.y, pos.z));
  const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x9d4edd, transparent: true, opacity: 0.5 });
  const timelineConnector = new THREE.Line(lineGeom, lineMat);
  timelineGroup.add(timelineConnector);

  timelineGroup.scale.set(0.001, 0.001, 0.001); // Hide initially

  // 5. Chapter 5: Convergence Singularity (Black Hole)
  const singularityGroup = new THREE.Group();
  singularityGroup.position.set(0, 0, 100);
  scene.add(singularityGroup);

  // Black hole core
  const bhCoreGeom = new THREE.SphereGeometry(16, 32, 32);
  const bhCoreMat = new THREE.MeshBasicMaterial({ color: 0x010103 });
  const bhCoreMesh = new THREE.Mesh(bhCoreGeom, bhCoreMat);
  singularityGroup.add(bhCoreMesh);

  // Accretion disk
  const bhRingGeom = new THREE.RingGeometry(18, 38, 64);
  const bhRingMat = new THREE.MeshBasicMaterial({
    color: 0xff007f,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
    wireframe: true
  });
  const bhRingMesh = new THREE.Mesh(bhRingGeom, bhRingMat);
  bhRingMesh.rotation.x = Math.PI / 2.5;
  singularityGroup.add(bhRingMesh);

  singularityGroup.scale.set(0.001, 0.001, 0.001); // Hide initially

  /* ==========================================================================
     INTERACTIONS & TIMELINES
     ========================================================================== */

  // Chapter 1 Singularity click explosion
  const explosionParam = { expansion: 0 };
  
  function triggerBigBang() {
    if (state.isExploded) return;
    state.isExploded = true;
    sounds.bang();

    const triggerBtn = document.getElementById('big-bang-trigger-btn');
    if (triggerBtn) {
      triggerBtn.textContent = 'Singularity Shattered';
      triggerBtn.disabled = true;
      triggerBtn.style.opacity = '0.5';
    }

    // Animate coordinates expansion via anime.js
    anime({
      targets: explosionParam,
      expansion: 1,
      duration: 3500,
      easing: 'easeOutQuart',
      update: () => {
        const positions = galaxyPoints.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const vel = particleVelocities[i];
          positions[i * 3] = vel.x * explosionParam.expansion * 75;
          positions[i * 3 + 1] = vel.y * explosionParam.expansion * 75;
          positions[i * 3 + 2] = vel.z * explosionParam.expansion * 75;
        }
        galaxyPoints.geometry.attributes.position.needsUpdate = true;
      },
      complete: () => {
        // Staggered presentation details
        setTimeout(() => {
          setChapter(2);
          // Scroll to Chapter 2
          const targetSection = document.getElementById('section-2');
          if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
        }, 1200);
      }
    });
  }

  const bigBangBtn = document.getElementById('big-bang-trigger-btn');
  if (bigBangBtn) {
    bigBangBtn.addEventListener('click', triggerBigBang);
  }

  // Visual click on chapter 1 coordinates
  window.addEventListener('click', (e) => {
    if (state.currentChapter === 1 && !state.isExploded) {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        triggerBigBang();
      }
    }
  });

  // Code Display typers (updating right column)
  const codeSnippetDisplay = document.getElementById('code-snippet-display');
  const codeTemplates = {
    1: `createSingularity({
  density: Infinity,
  dimension: 0,
  coordinates: [0, 0, 0],
  status: "PULSATING_CORE"
});`,
    2: `// Chapter 2: Universe Utilities
const Cognitive = deployUtility('CognitiveCore', {
  weights: 'LocalTransformer',
  gasLimit: 85000,
  context: 'StubviScope'
});`,
    3: `// Chapter 3: Spacetime Grid
distortSpacetime(grid, {
  mass: hoverWeight,
  depth: -18,
  resolution: 24,
  metric: 'Schwarzschild'
});`,
    4: `// Chapter 4: Ledger milestones
alignEpoch(Epoch.I, {
  role: 'SystemsArchitect',
  starlight: 'DecentralizedLedger',
  epochIndex: ${state.activeEpoch}
});`,
    5: `// Chapter 5: Convergence collapse
collapseSingularity({
  transmitter: "${document.getElementById('contact-name')?.value || 'Anonymous'}",
  route: "${document.getElementById('contact-email')?.value || '0x0'}",
  payload: "WARPED_SIGNAL",
  collapseRatio: 1.0
});`
  };

  function updateCodeSnippet(chapterNum) {
    if (!codeSnippetDisplay) return;
    const template = codeTemplates[chapterNum];
    
    // Typewriter effect using anime.js stagger
    codeSnippetDisplay.textContent = '';
    let i = 0;
    
    function typeChar() {
      if (i < template.length) {
        codeSnippetDisplay.textContent += template.charAt(i);
        i++;
        // Very rapid typing sound
        if (Math.random() > 0.8) playTone(750, 'sine', 0.05, 0.005);
        setTimeout(typeChar, 10);
      }
    }
    typeChar();
  }

  // Active navigation controllers
  const sections = document.querySelectorAll('.home-section');
  const navDots = document.querySelectorAll('.nav-chapter-btn');
  const currentChapterDisplay = document.getElementById('current-chapter-num');
  const prevBtn = document.getElementById('prev-chapter-global-btn');
  const nextBtn = document.getElementById('next-chapter-global-btn');
  const progressBar = document.querySelector('.scroll-cursor');

  function setChapter(chapterNum) {
    if (chapterNum < 1 || chapterNum > 5) return;
    
    sounds.transition();

    // Sync button statuses
    navDots.forEach(dot => dot.classList.remove('active'));
    const activeDot = document.querySelector(`.nav-chapter-btn[data-chapter="${chapterNum}"]`);
    if (activeDot) activeDot.classList.add('active');

    state.currentChapter = chapterNum;
    if (currentChapterDisplay) currentChapterDisplay.textContent = chapterNum;
    if (prevBtn) prevBtn.disabled = (chapterNum === 1);
    if (nextBtn) nextBtn.disabled = (chapterNum === 5);

    // Coordinate Three.js camera position mapping
    coordinateCameraView(chapterNum);
    updateCodeSnippet(chapterNum);
  }

  // Scroll linked sync trigger (animejs.com style)
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = totalHeight > 0 ? scrollPos / totalHeight : 0;
    
    state.scrollRatio = ratio;
    if (progressBar) {
      progressBar.style.width = `${ratio * 100}%`;
    }

    // Determine current active section
    let activeIndex = 1;
    sections.forEach((sec, idx) => {
      const rect = sec.getBoundingClientRect();
      // If element is past the middle viewport threshold
      if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.45) {
        activeIndex = idx + 1;
      }
    });

    if (state.currentChapter !== activeIndex) {
      setChapter(activeIndex);
    }
  });

  function coordinateCameraView(chapterNum) {
    let targetCamPos = { x: 0, y: 0, z: 240 };
    let lookTarget = new THREE.Vector3(0, 0, 0);

    // Group scales adjustment
    anime({
      targets: utilGroup.scale,
      x: chapterNum === 2 ? 1 : 0.001,
      y: chapterNum === 2 ? 1 : 0.001,
      z: chapterNum === 2 ? 1 : 0.001,
      duration: 800,
      easing: 'easeInOutQuad'
    });

    anime({
      targets: gridMaterial,
      opacity: chapterNum === 3 ? 0.35 : 0.1,
      duration: 800,
      easing: 'easeInOutQuad'
    });

    anime({
      targets: timelineGroup.scale,
      x: chapterNum === 4 ? 1 : 0.001,
      y: chapterNum === 4 ? 1 : 0.001,
      z: chapterNum === 4 ? 1 : 0.001,
      duration: 800,
      easing: 'easeInOutQuad'
    });

    anime({
      targets: singularityGroup.scale,
      x: chapterNum === 5 ? 1 : 0.001,
      y: chapterNum === 5 ? 1 : 0.001,
      z: chapterNum === 5 ? 1 : 0.001,
      duration: 800,
      easing: 'easeInOutQuad'
    });

    switch(chapterNum) {
      case 1:
        targetCamPos = { x: 0, y: 0, z: 240 };
        lookTarget.set(0, 0, 0);
        break;
      case 2:
        targetCamPos = { x: 0, y: 0, z: 65 };
        lookTarget.set(0, 0, -50);
        focusOnUtility(state.activeUtility);
        return;
      case 3:
        targetCamPos = { x: 0, y: 80, z: 120 };
        lookTarget.set(0, -60, -50);
        break;
      case 4:
        targetCamPos = { x: 0, y: 0, z: 110 };
        lookTarget.set(0, 0, 50);
        focusOnEpoch(state.activeEpoch);
        return;
      case 5:
        targetCamPos = { x: 0, y: 0, z: 180 };
        lookTarget.set(0, 0, 100);
        break;
    }

    // Move camera
    anime({
      targets: camera.position,
      x: targetCamPos.x,
      y: targetCamPos.y,
      z: targetCamPos.z,
      duration: 1600,
      easing: 'easeOutCubic'
    });

    anime({
      targets: state.cameraTarget,
      x: lookTarget.x,
      y: lookTarget.y,
      z: lookTarget.z,
      duration: 1600,
      easing: 'easeOutCubic'
    });
  }

  // Zoom into specific utilities (Chapter 2)
  function focusOnUtility(utilName) {
    state.activeUtility = utilName;
    let targetX = 0;
    
    if (utilName === 'cognition') targetX = -38;
    else if (utilName === 'database') targetX = 0;
    else if (utilName === 'automation') targetX = 38;

    sounds.click();

    anime({
      targets: camera.position,
      x: targetX,
      y: 0,
      z: 32,
      duration: 1200,
      easing: 'easeOutQuad'
    });

    anime({
      targets: state.cameraTarget,
      x: targetX,
      y: 0,
      z: -50,
      duration: 1200,
      easing: 'easeOutQuad'
    });

    // Toggle HTML display cards
    document.querySelectorAll('.utility-info-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.utility-select-btn').forEach(btn => btn.classList.remove('active'));

    const activeCard = document.getElementById(`info-${utilName}`);
    const activeBtn = document.getElementById(`util-btn-${utilName}`);
    if (activeCard) activeCard.classList.add('active');
    if (activeBtn) activeBtn.classList.add('active');
  }

  document.querySelectorAll('.utility-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const util = btn.getAttribute('data-utility');
      focusOnUtility(util);
    });
  });

  // Constellation star selection epochs (Chapter 4)
  function focusOnEpoch(epochIndex) {
    state.activeEpoch = epochIndex;
    const starPos = epochStars[epochIndex];

    sounds.click();

    anime({
      targets: camera.position,
      x: starPos.x,
      y: starPos.y,
      z: starPos.z + 28,
      duration: 1400,
      easing: 'easeOutCubic'
    });

    anime({
      targets: state.cameraTarget,
      x: starPos.x,
      y: starPos.y,
      z: starPos.z,
      duration: 1400,
      easing: 'easeOutCubic'
    });

    // Update epoch highlights
    document.querySelectorAll('.epoch-detail-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.epoch-btn').forEach(btn => btn.classList.remove('active'));

    const activeCard = document.getElementById(`epoch-card-${epochIndex}`);
    const activeBtn = document.getElementById(`epoch-btn-${epochIndex}`);
    if (activeCard) activeCard.classList.add('active');
    if (activeBtn) activeBtn.classList.add('active');
  }

  document.querySelectorAll('.epoch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-epoch'), 10);
      focusOnEpoch(idx);
    });
  });

  // Project hover deforms spacetime grid depth (Chapter 3)
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      sounds.click();
      anime({
        targets: state,
        gridHoverDisplacement: 22,
        duration: 400,
        easing: 'easeOutQuad'
      });
    });

    card.addEventListener('mouseleave', () => {
      anime({
        targets: state,
        gridHoverDisplacement: 0,
        duration: 600,
        easing: 'easeOutQuad'
      });
    });
  });

  // Nav buttons click scrolling binding
  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const ch = dot.getAttribute('data-chapter');
      const targetSec = document.getElementById(`section-${ch}`);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('.next-chapter-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextVal = btn.getAttribute('data-next');
      const targetSec = document.getElementById(`section-${nextVal}`);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const prevVal = state.currentChapter - 1;
      const targetSec = document.getElementById(`section-${prevVal}`);
      if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const nextVal = state.currentChapter + 1;
      const targetSec = document.getElementById(`section-${nextVal}`);
      if (targetSec) targetSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Sound Control toggle
  const soundBtn = document.getElementById('sound-toggle-btn');
  soundBtn.addEventListener('click', () => {
    state.isSoundMuted = !state.isSoundMuted;
    if (state.isSoundMuted) {
      soundBtn.innerHTML = '<i data-lucide="volume-x"></i>';
      soundBtn.style.borderColor = '';
      soundBtn.style.color = '';
    } else {
      soundBtn.innerHTML = '<i data-lucide="volume-2"></i>';
      soundBtn.style.borderColor = 'var(--glow-cyan)';
      soundBtn.style.color = 'var(--glow-cyan)';
      initAudio();
      sounds.transition();
    }
    lucide.createIcons();
  });

  // Contact payload singularity collapse (Chapter 5)
  const contactForm = document.getElementById('convergence-form-element');
  const transIndicator = document.getElementById('transmission-state-indicator');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sounds.warp();

    if (transIndicator) {
      transIndicator.textContent = "WARPING COGNITIVE CHANNELS...";
      transIndicator.style.color = "var(--glow-amber)";
    }

    // Animate form elements collapsing
    anime({
      targets: '.convergence-form > *',
      opacity: 0,
      scale: 0.1,
      translateY: -60,
      delay: anime.stagger(80),
      duration: 1000,
      easing: 'easeInBack',
      complete: () => {
        contactForm.style.display = 'none';
        
        // Dynamic explosion/flash on black hole ring
        anime({
          targets: bhRingMesh.scale,
          x: 2.8,
          y: 2.8,
          duration: 600,
          easing: 'easeOutExpo',
          direction: 'alternate'
        });

        anime({
          targets: bhCoreMesh.scale,
          x: 2.5,
          y: 2.5,
          duration: 600,
          easing: 'easeOutExpo',
          direction: 'alternate',
          complete: () => {
            sounds.success();
            if (transIndicator) {
              transIndicator.textContent = "TRANSMISSION COLLAPSED INTO COGNITIVE SINGULARITY";
              transIndicator.style.color = "var(--glow-cyan)";
            }
          }
        });
      }
    });
  });

  /* ==========================================================================
     MAIN RENDER LOOP
     ========================================================================== */
  const clock = new THREE.Clock();

  function renderLoop() {
    requestAnimationFrame(renderLoop);

    const time = clock.getElapsedTime();

    // 1. Align camera target look position
    camera.lookAt(state.cameraTarget);

    // 2. Animate Singularity ball / Galaxy
    if (state.isExploded) {
      galaxyPoints.rotation.z = time * 0.04;
      galaxyPoints.rotation.y = Math.sin(time * 0.01) * 0.08;
    } else {
      galaxyPoints.rotation.z = time * 0.15;
      const positions = galaxyPoints.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const offset = Math.sin(time * 6 + i) * 0.12;
        positions[i * 3] += offset * 0.01;
        positions[i * 3 + 1] += offset * 0.01;
        positions[i * 3 + 2] += offset * 0.01;
      }
      galaxyPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Chapter 2 Utilities rotations
    if (state.currentChapter === 2) {
      cognitionMesh.rotation.y = time * 0.35;
      cognitionMesh.rotation.x = time * 0.15;

      dbMesh.rotation.y = -time * 0.25;
      dbMesh.position.y = Math.sin(time * 1.4) * 1.2;

      autoMesh.rotation.z = time * 0.45;
      autoMesh.rotation.x = time * 0.25;
    }

    // 4. Chapter 3 Grid deformations
    if (state.currentChapter === 3) {
      const positions = gridGeometry.attributes.position.array;
      
      for (let i = 0; i <= gridResolution; i++) {
        for (let j = 0; j <= gridResolution; j++) {
          const idx = (i * (gridResolution + 1) + j) * 3;
          
          const x = originalGridPositions[idx];
          const y = originalGridPositions[idx + 1];
          
          let wave = Math.sin(x * 0.025 + time * 1.5) * 3.5 * Math.cos(y * 0.025 + time * 1.5);
          
          // Hover weight displacement warp
          const distToCenter = Math.sqrt(x*x + y*y);
          if (distToCenter < 100) {
            wave -= (1.0 - (distToCenter / 100)) * state.gridHoverDisplacement * 1.3;
          }

          positions[idx + 2] = wave;
        }
      }
      gridGeometry.attributes.position.needsUpdate = true;
    }

    // 5. Chapter 4 Stars breathing
    if (state.currentChapter === 4) {
      starMeshes.forEach((mesh, index) => {
        mesh.scale.setScalar(1 + Math.sin(time * 2.8 + index) * 0.12);
      });
      timelineGroup.rotation.y = Math.sin(time * 0.08) * 0.08;
    }

    // 6. Chapter 5 Black Hole orbit
    if (state.currentChapter === 5) {
      bhRingMesh.rotation.z = -time * 0.6;
      bhCoreMesh.scale.setScalar(1 + Math.sin(time * 3.5) * 0.025);
    }

    renderer.render(scene, camera);
  }

  renderLoop();

  /* ==========================================================================
     SECURITY DIALOG INITIALIZATION
     ========================================================================== */
  const secDialog = document.getElementById('sec-dialog');
  const secAcceptBtn = document.getElementById('sec-accept-btn');

  setTimeout(() => {
    if (secDialog) secDialog.classList.add('active');
    sounds.click();
  }, 1000);

  if (secAcceptBtn) {
    secAcceptBtn.addEventListener('click', () => {
      sounds.transition();
      if (secDialog) secDialog.classList.remove('active');
      initAudio();
    });
  }
});
