'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation({ currentRoute, onSelectRoute }) {
  const pathname = usePathname();

  const handleRouteClick = (e, route) => {
    if (onSelectRoute) {
      e.preventDefault();
      onSelectRoute(route);
    }
  };

  const activeRoute = currentRoute || (pathname === '/' ? 'archive' : pathname.replace('/', ''));

  return (
    <header className="archive-header">
      <a
        className="identity"
        href="#archive"
        onClick={(e) => handleRouteClick(e, 'archive')}
        aria-label="Harsh Dev Jha, return to archive"
      >
        <h1 className="identity__name">
          <span>Harsh</span>
          <span>Dev Jha</span>
        </h1>
        <div className="identity__role">Systems Architect & AI Engineer</div>
      </a>

      <nav className="primary-nav">
        <a
          href="#archive"
          data-route="archive"
          aria-current={activeRoute === 'archive' ? 'page' : undefined}
          onClick={(e) => handleRouteClick(e, 'archive')}
        >
          Archive
        </a>
        <a
          href="#about"
          data-route="about"
          aria-current={activeRoute === 'about' ? 'page' : undefined}
          onClick={(e) => handleRouteClick(e, 'about')}
        >
          About
        </a>
        <a
          href="#awards"
          data-route="awards"
          aria-current={activeRoute === 'awards' ? 'page' : undefined}
          onClick={(e) => handleRouteClick(e, 'awards')}
        >
          Awards
        </a>
        <a
          href="#press"
          data-route="press"
          aria-current={activeRoute === 'press' ? 'page' : undefined}
          onClick={(e) => handleRouteClick(e, 'press')}
        >
          Press
        </a>
        <a
          href="#private"
          data-route="private"
          aria-current={activeRoute === 'private' ? 'page' : undefined}
          onClick={(e) => handleRouteClick(e, 'private')}
        >
          Private
        </a>
      </nav>
    </header>
  );
}
