export interface DustParticle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  baseAlpha: number;
}

export interface DustCanvasState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  particles: DustParticle[];
  mouse: { x: number | null; y: number | null };
  rafId: number;
  resizeHandler: () => void;
  mouseMoveHandler: (e: MouseEvent) => void;
  mouseOutHandler: () => void;
}

export function createDustParticles(count: number, width: number, height: number): DustParticle[] {
  const particles: DustParticle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      baseAlpha: Math.random() * 0.4 + 0.15,
    });
  }
  return particles;
}

export function updateDustParticles(
  particles: DustParticle[],
  width: number,
  height: number,
  mouse: { x: number | null; y: number | null }
): void {
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 200) {
        p.x -= dx * 0.002;
        p.y -= dy * 0.002;
      }
    }
  });
}

export function drawDustParticles(
  ctx: CanvasRenderingContext2D,
  particles: DustParticle[]
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  particles.forEach((p) => {
    ctx.fillStyle = `rgba(200, 200, 255, ${p.baseAlpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function initDustCanvas(canvas: HTMLCanvasElement, particleCount?: number): DustCanvasState | null {
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!ctx) return null;

  const count = particleCount ?? (typeof window !== 'undefined' 
    ? (window.innerWidth < 640 ? 60 : window.innerWidth < 1024 ? 100 : 150)
    : 150);

  const state: DustCanvasState = {
    canvas,
    ctx,
    width: window.innerWidth,
    height: window.innerHeight,
    particles: createDustParticles(count, window.innerWidth, window.innerHeight),
    mouse: { x: null, y: null },
    rafId: 0,
    resizeHandler: () => {},
    mouseMoveHandler: () => {},
    mouseOutHandler: () => {},
  };

  canvas.width = state.width;
  canvas.height = state.height;

  state.resizeHandler = () => {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = state.width;
    canvas.height = state.height;
    const newCount = window.innerWidth < 640 ? 60 : window.innerWidth < 1024 ? 100 : 150;
    state.particles = createDustParticles(newCount, state.width, state.height);
  };

  state.mouseMoveHandler = (e: MouseEvent) => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
  };

  state.mouseOutHandler = () => {
    state.mouse.x = null;
    state.mouse.y = null;
  };

  window.addEventListener('resize', state.resizeHandler);
  window.addEventListener('mousemove', state.mouseMoveHandler);
  window.addEventListener('mouseout', state.mouseOutHandler);

  return state;
}

export function animateDustCanvas(state: DustCanvasState): void {
  const animate = () => {
    updateDustParticles(state.particles, state.width, state.height, state.mouse);
    drawDustParticles(state.ctx, state.particles);
    state.rafId = requestAnimationFrame(animate);
  };
  state.rafId = requestAnimationFrame(animate);
}

export function disposeDustCanvas(state: DustCanvasState): void {
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
  }
  window.removeEventListener('resize', state.resizeHandler);
  window.removeEventListener('mousemove', state.mouseMoveHandler);
  window.removeEventListener('mouseout', state.mouseOutHandler);
  state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
}