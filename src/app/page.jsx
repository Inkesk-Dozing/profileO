'use client';

import { useState, useEffect } from 'react';
import GLCanvas from '@/components/GLCanvas';
import DustCanvas from '@/components/DustCanvas';

export default function Home() {
  const [isNonArchiveRoute, setIsNonArchiveRoute] = useState(false);

  useEffect(() => {
    const evaluateRoute = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.replace(/^#\/?/, '');
      const isViewOpen = document.body.classList.contains('view-open');
      const nonArchive = isViewOpen || (hash !== '' && hash !== 'archive');
      setIsNonArchiveRoute(nonArchive);
    };

    evaluateRoute();

    window.addEventListener('hashchange', evaluateRoute);
    window.addEventListener('popstate', evaluateRoute);

    const observer = new MutationObserver(evaluateRoute);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    if (!document.getElementById('inspo-script')) {
      const script = document.createElement('script');
      script.id = 'inspo-script';
      script.src = '/inspo.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      window.removeEventListener('hashchange', evaluateRoute);
      window.removeEventListener('popstate', evaluateRoute);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <GLCanvas />

      {/* DustCanvas rendered EXCLUSIVELY on non-archive routes (about, awards, press, private, project) */}
      {isNonArchiveRoute && <DustCanvas />}

      <div id="app" suppressHydrationWarning />
    </>
  );
}
