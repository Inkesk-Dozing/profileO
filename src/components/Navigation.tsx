'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const routes = [
    { href: '/archive', label: 'Archive', key: 'archive' },
    { href: '/about', label: 'About', key: 'about' },
    { href: '/awards', label: 'Awards', key: 'awards' },
    { href: '/press', label: 'Press', key: 'press' },
    { href: '/private', label: 'Private', key: 'private' },
  ];

  return (
    <header className="archive-header">
      <Link
        className="identity"
        href="/archive"
        aria-label="Harsh Dev Jha, return to archive"
      >
        <h1 className="identity__name">
          <span>Harsh</span>
          <span>Dev Jha</span>
        </h1>
        <div className="identity__role">Systems Architect & AI Engineer</div>
      </Link>

      <nav className="primary-nav">
        {routes.map((route) => (
          <Link
            key={route.key}
            href={route.href}
            data-route={route.key}
            aria-current={pathname === route.href ? 'page' : undefined}
          >
            {route.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}