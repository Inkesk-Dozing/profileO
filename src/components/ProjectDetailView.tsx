'use client';

import Link from 'next/link';

interface ProjectDetailViewProps {
  project: {
    id: string;
    title: string;
    year: string;
    category: string;
    premise: string;
    description?: string;
    role?: string;
    stack?: string;
    image?: string;
    link?: string;
  };
}

export default function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
    <div className="view-shell" style={{ visibility: 'visible', opacity: 1 }}>
      <nav className="view-nav view-nav--dark">
        <Link href="/archive" className="view-back">
          <span className="view-back__arrow">←</span>
          <span>Archive</span>
        </Link>
        <Link href="/archive" className="view-identity">
          Harsh Dev Jha
        </Link>
      </nav>

      <main className="view-page">
        <section className="project-hero">
          <p className="project-hero__meta">{project.year} · {project.category}</p>
          <h1>
            <span>{project.title}</span>
          </h1>
          <div className="project-hero__lower">
            <p className="project-hero__premise">{project.premise}</p>
            <dl className="project-facts">
              <div className="fact-row">
                <dt>Role</dt>
                <dd>{project.role || 'Lead Systems Architect'}</dd>
              </div>
              <div className="fact-row">
                <dt>Stack</dt>
                <dd>{project.stack || 'Python, WebGL, C++'}</dd>
              </div>
            </dl>
          </div>
        </section>

        {project.image && (
          <div className="lead-media" style={{ margin: '40px var(--gutter)' }}>
            <img src={project.image} alt={project.title} />
          </div>
        )}

        <section className="story-section">
          <div className="section-label">Overview</div>
          <div className="story-section__body">
            <div className="story-block">
              <h2>Architecture</h2>
              <p>{project.description || project.premise}</p>
            </div>
            {project.link && (
              <div style={{ marginTop: '24px' }}>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--paper)', textDecoration: 'underline', fontSize: '16px' }}
                >
                  Explore Repository / Documentation ↗
                </a>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}