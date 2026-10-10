'use client';

import Link from 'next/link';

export default function AboutView() {
  return (
    <div className="about-page">
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
          <a href="https://linkedin.com/in/harsh-dev-jha-primus" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </nav>

      <main className="view-page">
        <section className="about-hero">
          <p>Systems Architect & AI Engineer based in New Delhi, India.</p>
          <h1>
            <span>HARSH</span>
            <span>DEV JHA</span>
          </h1>
        </section>

        <section className="about-copy">
          <div className="section-label">Genesis</div>
          <div className="about-copy__body">
            <p className="about-copy__lead">
              Engineering autonomous AI systems, embedded spatial intelligence, and high-performance cross-platform software architectures.
            </p>
            <p>
              I am Harsh Dev Jha (Primus/Inkesk-Dozing), focusing on bridging low-level system design with clean, high-end aesthetic execution. My work spans embedded spatial intelligence models, WebGL spatial mathematics, and patent-grade cross-platform suites.
            </p>
            <p>
              Co-founding member of Eozka (eozkull), driving collaborative open-source modules and next-generation software architectures.
            </p>
          </div>
        </section>

        <section className="about-facts">
          <div className="section-label">Essence</div>
          <dl className="ledger">
            <div className="ledger__row">
              <dt>Core Languages</dt>
              <dd>Python, C++, JavaScript/TypeScript, Dart</dd>
            </div>
            <div className="ledger__row">
              <dt>Specializations</dt>
              <dd>Embedded AI, WebGL Shaders, Spatial Math, Flutter, Next.js</dd>
            </div>
            <div className="ledger__row">
              <dt>Organization</dt>
              <dd>Eozka Engineering Core</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}