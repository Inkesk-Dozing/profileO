'use client';

import Link from 'next/link';

export default function PressView() {
  const pressItems = [
    {
      index: '01',
      outlet: 'Tech Chronicles',
      title: 'Harsh Dev Jha on Building N.A.V.R.A.A.H. Spatial Intelligence & Embedded Vision',
      url: 'https://github.com/Inkesk-Dozing'
    },
    {
      index: '02',
      outlet: 'Systems Quarterly',
      title: 'The Architecture of Eozka: Collaborative Engineering & Native Primitives',
      url: 'https://github.com/eozkull'
    },
    {
      index: '03',
      outlet: 'Design & Code Digest',
      title: 'Vast Spatial Grids and WebGL Shaders: Blending Mathematics with User Interfaces',
      url: '#'
    }
  ];

  return (
    <div className="press-page">
      <nav className="view-nav view-nav--dark">
        <Link href="/archive" className="view-back">
          <span className="view-back__arrow">←</span>
          <span>Archive</span>
        </Link>
        <Link href="/archive" className="view-identity">
          Harsh Dev Jha
        </Link>
        <div className="view-links">
          <a href="https://github.com/Inkesk-Dozing" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </nav>

      <main className="view-page">
        <section className="press-copy">
          <div className="section-label">Press & Media</div>
          <div className="press-list">
            {pressItems.map((item, idx) => (
              <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="press-item">
                <span className="press-item__index">{item.index}</span>
                <div>
                  <span className="press-item__outlet">{item.outlet}</span>
                  <span className="press-item__title">{item.title}</span>
                </div>
                <span className="press-item__arrow">↗</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}