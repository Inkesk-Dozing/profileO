'use client';

import { useEffect, useRef, useCallback } from 'react';
import { initWebGLNebula, startWebGLNebulaLoop, disposeWebGLNebula, resizeWebGLNebula, WebGLNebula } from './webgl-shader';
import { initDustCanvas, animateDustCanvas, disposeDustCanvas, DustCanvasState } from './dust-particles';

interface DustCanvasProps {
  className?: string;
  webglOpacity?: number;
  dustOpacity?: number;
}

function getParticleCount(): number {
  if (typeof window === 'undefined') return 150;
  const width = window.innerWidth;
  if (width < 640) return 60;
  if (width < 1024) return 100;
  return 150;
}

export function DustCanvas({ 
  className = '', 
  webglOpacity = 1, 
  dustOpacity = 0.85 
}: DustCanvasProps) {
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);
  const nebulaRef = useRef<WebGLNebula | null>(null);
  const dustStateRef = useRef<DustCanvasState | null>(null);
  const isMountedRef = useRef(true);
  const prefersReducedMotion = useRef(false);

  const handleResize = useCallback(() => {
    if (nebulaRef.current) {
      resizeWebGLNebula(nebulaRef.current);
    }
    if (dustStateRef.current) {
      const state = dustStateRef.current;
      state.width = window.innerWidth;
      state.height = window.innerHeight;
      state.canvas.width = state.width;
      state.canvas.height = state.height;
      state.particles = state.particles.map(() => ({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        size: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        baseAlpha: Math.random() * 0.4 + 0.15,
      }));
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const webglCanvas = webglCanvasRef.current;
    const dustCanvas = dustCanvasRef.current;

    if (!webglCanvas || !dustCanvas) return;

    webglCanvas.style.opacity = String(webglOpacity);
    dustCanvas.style.opacity = String(dustOpacity);

    const nebula = initWebGLNebula(webglCanvas);
    if (nebula) {
      nebulaRef.current = nebula;
      startWebGLNebulaLoop(nebula);
    }

    const dustState = initDustCanvas(dustCanvas, getParticleCount());
    if (dustState) {
      dustStateRef.current = dustState;
      if (!prefersReducedMotion.current) {
        animateDustCanvas(dustState);
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      
      if (nebulaRef.current) {
        disposeWebGLNebula(nebulaRef.current);
        nebulaRef.current = null;
      }
      
      if (dustStateRef.current) {
        disposeDustCanvas(dustStateRef.current);
        dustStateRef.current = null;
      }
    };
  }, [handleResize, webglOpacity, dustOpacity]);

  return (
    <div className={`dust-canvas-container ${className}`} aria-hidden="true">
      <canvas
        ref={webglCanvasRef}
        className="dust-canvas-webgl"
        aria-hidden="true"
        style={{ willChange: 'transform, opacity' }}
      />
      <canvas
        ref={dustCanvasRef}
        className="dust-canvas-particles"
        aria-hidden="true"
        style={{ willChange: 'transform, opacity' }}
      />
    </div>
  );
}

export default DustCanvas;