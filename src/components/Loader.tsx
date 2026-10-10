'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoaderProps {
  ref: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
}

export function Loader({ ref, isLoading }: LoaderProps) {
  useEffect(() => {
    if (!isLoading) return;
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({ delay: 0.3 });
    tl.to(el.querySelector('.boot-bar__fill'), { scaleX: 1, duration: 1.2, ease: 'power3.out' })
      .to(el.querySelector('.loader__name span:first-child'), { y: 0, duration: 1, ease: 'power3.out' }, '-=0.6')
      .to(el.querySelector('.loader__name span:last-child'), { y: 0, duration: 1, ease: 'power3.out' }, '-=0.8')
      .to(el.querySelector('.loader__role'), { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .to(el.querySelector('.loader__hint'), { opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .to(el, { opacity: 0, duration: 0.6, ease: 'power3.inOut', delay: 0.5, onComplete: () => {
        el.classList.add('is-done');
      }});
  }, [isLoading, ref]);

  if (!isLoading) return null;

  return (
    <div className="loader" ref={ref} aria-label="Harsh Dev Jha — enter the archive">
      <div className="loader__boot" aria-hidden="true">
        <span className="boot-bar"><span className="boot-bar__fill"></span></span>
      </div>
      <div className="loader__name" aria-hidden="true"><span>Harsh Dev</span><span>Jha</span></div>
      <p className="loader__role">Systems Architect & AI Engineer</p>
      <p className="loader__hint">Scroll down to enter matrix ↓</p>
    </div>
  );
}