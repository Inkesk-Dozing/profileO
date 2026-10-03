'use client';

import { useState, useEffect, useRef } from 'react';

export const PROJECTS_DATA = [
  {
    id: 'navraah',
    title: 'N.A.V.R.A.A.H.',
    category: 'Spatial AI',
    year: '2025',
    premise: 'Embedded AI construct for spatial intelligence, real-time bounding box tracking, and threaded audio feedback.',
    description: 'Engineered for safety-critical environments with memory labeling, real-time bounding box tracking, and zero-latency hardware processing.',
    image: '/Assets/playground/trial-versions/working-code-1/static/skin.js',
    role: 'Lead Architect',
    stack: 'Python, OpenCV, PyTorch, C++',
    link: 'https://github.com/Inkesk-Dozing'
  },
  {
    id: 'eozka',
    title: 'Eozka Engineering Core',
    category: 'Infrastructure',
    year: '2024',
    premise: 'Collaborative engineering organization building robust, production-grade native modules and shared architectures.',
    description: 'Founding member and core contributor driving decentralized module compilation, automated pre-commit pipelines, and native C++/Python primitives.',
    role: 'Founding Lead',
    stack: 'TypeScript, Rust, Python, C++',
    link: 'https://github.com/eozkull'
  },
  {
    id: 'multi-app-suite',
    title: 'Multi-App Zenith Suite',
    category: 'Cross-Platform',
    year: '2024',
    premise: 'Suite of 10 fully functional, patent-grade mobile applications built with Flutter and ZenithTheme design system.',
    description: 'Anchored by a unified high-contrast design token engine, cross-platform native execution hooks, and local data persistence.',
    role: 'Creator & Lead Developer',
    stack: 'Flutter, Dart, SQLite, Mobile Architecture',
    link: 'https://github.com/Inkesk-Dozing'
  },
  {
    id: 'stress-calc',
    title: 'Mathematical Stress Calculator',
    category: 'Mathematics',
    year: '2024',
    premise: 'Specialized mathematical engine to quantify systemic and individual stress metrics.',
    description: 'Uses localized matrix transformations and statistical frequency algorithms to calculate stress levels across continuous datasets.',
    role: 'Sole Engineer',
    stack: 'Python, NumPy, Mathematical Modeling',
    link: 'https://github.com/Inkesk-Dozing'
  },
  {
    id: 'academic-notes',
    title: 'Academic Notes Engine',
    category: 'Knowledge Base',
    year: '2023',
    premise: 'Version-controlled repository and viewer for university coursework and research papers.',
    description: 'Automated continuous integration pipeline that parses markdown, renders LaTeX math formulas, and indexes notes for fast search.',
    role: 'Maintainer',
    stack: 'Markdown, KaTeX, Shell, Git Automation',
    link: 'https://github.com/Inkesk-Dozing'
  },
  {
    id: 'submergence',
    title: 'The Submergence Portfolio',
    category: 'Spatial WebGL',
    year: '2026',
    premise: 'High-end portfolio engine exploring WebGL nebula shaders, stardust parallax, and 3D spatial infinity grid.',
    description: 'Built with Next.js, React, GSAP, and HTML5 WebGL shader primitives.',
    role: 'Architect & Designer',
    stack: 'Next.js, React, GSAP, WebGL, Vanilla CSS',
    link: 'https://github.com/Inkesk-Dozing/profileo'
  }
];

export default function ArchiveGrid({ onSelectProject, onSelectRoute }) {
  const [filter, setFilter] = useState('All');
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [focusedIndex, setFocusedIndex] = useState(0);

  const filteredProjects = filter === 'All'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.category.toLowerCase() === filter.toLowerCase());

  const handlePointerDown = (e) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({
      x: dragStart.current.panX + dx,
      y: dragStart.current.panY + dy
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleWheel = (e) => {
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8
      }));
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="experience">
      <div
        className="stage"
        data-dragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="world"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px)`
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
              padding: '120px 8vw',
              maxWidth: '1400px',
              margin: '0 auto',
              pointerEvents: 'auto'
            }}
          >
            {filteredProjects.map((project, idx) => (
              <div
                key={project.id}
                className="tile"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '320px',
                  borderRadius: '12px',
                  background: 'rgba(20, 20, 25, 0.75)',
                  border: '1px solid rgba(240, 239, 233, 0.15)',
                  backdropFilter: 'blur(10px)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectProject(project)}
                onMouseEnter={() => setFocusedIndex(idx)}
              >
                <div>
                  <div
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--silver)',
                      marginBottom: '8px'
                    }}
                  >
                    {project.category} · {project.year}
                  </div>
                  <h3
                    style={{
                      fontSize: '24px',
                      fontFamily: 'Junicode, Georgia, serif',
                      fontWeight: 400,
                      margin: '0 0 12px',
                      color: 'var(--paper)'
                    }}
                  >
                    {project.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.4',
                      color: 'var(--page-grey)',
                      margin: 0
                    }}
                  >
                    {project.premise}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '20px',
                    borderTop: '1px solid rgba(240, 239, 233, 0.1)',
                    paddingTop: '12px'
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--silver)' }}>{project.role}</span>
                  <span style={{ fontSize: '14px', color: 'var(--paper)' }}>Observe ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="focus-reticle" />

      <div className="filter-dock">
        <div className="filters">
          {['All', 'Spatial AI', 'Infrastructure', 'Cross-Platform', 'Mathematics', 'Knowledge Base', 'Spatial WebGL'].map((cat) => (
            <button
              key={cat}
              aria-pressed={filter === cat}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="instruction">DRAG / SCROLL TO NAVIGATE MATRIX</p>
      <p className="focus-readout">
        {filteredProjects[focusedIndex] ? filteredProjects[focusedIndex].title : 'Harsh Dev Jha Archive'}
      </p>
      <p className="depth">{filteredProjects.length} ENTRIES</p>
    </div>
  );
}
