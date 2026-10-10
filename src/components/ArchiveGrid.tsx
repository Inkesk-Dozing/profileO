'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { Loader } from './Loader';

export const PROJECTS_DATA = [
  {
    id: 'eozka-core',
    title: 'eOzka Engineering Core',
    shortTitle: 'eOzka Core',
    category: 'eOzka',
    year: '2024 - 2026',
    premise: 'Collaborative engineering organization building production-grade native AI modules, distributed primitives, and spatial architectures.',
    description: 'Founding member and core contributor driving decentralized module compilation, automated pre-commit pipelines, and native C++/Python primitives.',
    image: '/assets/eozka/eozka-landing-logo.svg',
    images: ['/assets/eozka/eozka-landing-logo.svg'],
    role: 'Founding Lead Architect',
    stack: 'TypeScript, Rust, Python, C++',
    link: 'https://github.com/eozkull',
    categories: ['eOzka'],
    highlight: true,
  },
  {
    id: 'navraah',
    title: 'N.A.V.R.A.A.H. Spatial AI',
    shortTitle: 'N.A.V.R.A.A.H.',
    category: 'eOzka',
    year: '2025',
    premise: 'Embedded AI construct for spatial intelligence, real-time bounding box tracking, and threaded audio feedback.',
    description: 'Engineered for safety-critical environments with memory labeling, real-time bounding box tracking, and zero-latency hardware processing.',
    image: '/assets/eozka/eOzka_Monogram.svg',
    images: ['/assets/eozka/eOzka_Monogram.svg'],
    role: 'Lead Architect',
    stack: 'Python, OpenCV, PyTorch, C++',
    link: 'https://github.com/Inkesk-Dozing',
    categories: ['eOzka'],
    highlight: true,
  },
  {
    id: 'multi-app-suite',
    title: 'Multi-App Zenith Suite',
    shortTitle: 'Zenith Suite',
    category: 'eOzka',
    year: '2024',
    premise: 'Suite of 10 fully functional, patent-grade mobile applications built with Flutter and ZenithTheme design system.',
    description: 'Anchored by a unified high-contrast design token engine, cross-platform native execution hooks, and local data persistence.',
    image: '/assets/eozka/eozka-landing-logo.svg',
    images: ['/assets/eozka/eozka-landing-logo.svg'],
    role: 'Creator & Lead Developer',
    stack: 'Flutter, Dart, SQLite, Mobile Architecture',
    link: 'https://github.com/Inkesk-Dozing',
    categories: ['eOzka'],
    highlight: true,
  },
  {
    id: 'stress-calc',
    title: 'Mathematical Stress Calculator',
    shortTitle: 'Stress Calc',
    category: 'Mathematics',
    year: '2024',
    premise: 'Specialized mathematical engine to quantify systemic and individual stress metrics.',
    description: 'Uses localized matrix transformations and statistical frequency algorithms to calculate stress levels across continuous datasets.',
    image: '/assets/eozka/eozka-landing-logo.svg',
    images: ['/assets/eozka/eozka-landing-logo.svg'],
    role: 'Sole Engineer',
    stack: 'Python, NumPy, Mathematical Modeling',
    link: 'https://github.com/Inkesk-Dozing',
    categories: ['Mathematics'],
    highlight: false,
  },
  {
    id: 'academic-notes',
    title: 'Academic Notes Engine',
    shortTitle: 'Notes Engine',
    category: 'Knowledge Base',
    year: '2023',
    premise: 'Version-controlled repository and viewer for university coursework and research papers.',
    description: 'Automated continuous integration pipeline that parses markdown, renders LaTeX math formulas, and indexes notes for fast search.',
    image: '/assets/eozka/eozka-landing-logo.svg',
    images: ['/assets/eozka/eozka-landing-logo.svg'],
    role: 'Maintainer',
    stack: 'Markdown, KaTeX, Shell, Git Automation',
    link: 'https://github.com/Inkesk-Dozing',
    categories: ['Knowledge Base'],
    highlight: false,
  },
  {
    id: 'submergence',
    title: 'The Submergence Portfolio',
    shortTitle: 'Submergence',
    category: 'Spatial WebGL',
    year: '2026',
    premise: 'High-end portfolio engine exploring WebGL nebula shaders, stardust parallax, and 3D spatial infinity grid.',
    description: 'Built with Next.js, React, GSAP, and HTML5 WebGL shader primitives.',
    image: '/assets/eozka/eozka-landing-logo.svg',
    images: ['/assets/eozka/eozka-landing-logo.svg'],
    role: 'Architect & Designer',
    stack: 'Next.js, React, GSAP, WebGL, Vanilla CSS',
    link: 'https://github.com/Inkesk-Dozing/profileo',
    categories: ['Spatial WebGL'],
    highlight: true,
  }
];

interface TileData {
  tile: HTMLElement;
  frame: (typeof PROJECTS_DATA)[0] | null;
  row: number;
  col: number;
  dispRow: number;
  dispCol: number;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  scale: number;
  opacity: number;
  focusDepth: number;
}

export default function ArchiveGrid() {
  const experienceRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const filterProjectsRef = useRef<HTMLDivElement>(null);
  const focusReadoutRef = useRef<HTMLParagraphElement>(null);
  const depthRef = useRef<HTMLParagraphElement>(null);
  const projectJumpSelectRef = useRef<HTMLSelectElement>(null);

  const [tiles, setTiles] = useState<TileData[]>([]);
  const [filter, setFilter] = useState('All');
  const [pan, setPan] = useState({ x: 0, y: 0, z: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0, panZ: 0 });
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(3);
  const [cellWidth, setCellWidth] = useState(340);
  const [cellHeight, setCellHeight] = useState(207);

  const filteredProjects = filter === 'All'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter(p => p.category === filter);

  const categories = ['All', ...new Set(PROJECTS_DATA.map(p => p.category))];

  const calculateLayout = useCallback(() => {
    if (!stageRef.current) return;
    const width = stageRef.current.clientWidth;
    const height = stageRef.current.clientHeight;
    const isMobile = width <= 700;
    const cw = isMobile ? Math.min(width * 0.78, 315) : Math.min(width * 0.3, 470);
    const ch = cw * 0.61;
    const gapX = isMobile ? 14 : 24;
    const gapY = isMobile ? 5 : 6;
    const c = Math.max(1, Math.floor((width + gapX) / (cw + gapX)));
    const r = Math.max(1, Math.ceil(filteredProjects.length / c));
    const radiusX = isMobile ? Math.max(width * 4.1, 1450) : Math.max(width * 1.9, 2200);
    const radiusY = isMobile ? Math.max(height * 0.94, 700) : Math.max(height * 1.25, 980);
    const baseDepth = isMobile ? -610 : -820;
    const far = isMobile ? 2350 : 3100;

    setCellWidth(cw);
    setCellHeight(ch);
    setCols(c);
    setRows(r);

    return { cw, ch, c, r, radiusX, radiusY, baseDepth, far, gapX, gapY, isMobile };
  }, [filteredProjects.length]);

  useEffect(() => {
    const layout = calculateLayout();
    if (!layout) return;

    const { c, r, cw, ch, baseDepth, radiusX, radiusY, isMobile, gapX, gapY } = layout;
    const newTiles: TileData[] = [];

    for (let i = 0; i < c * r; i++) {
      const col = i % c;
      const row = Math.floor(i / c);
      const projectIndex = i % filteredProjects.length;
      const project = filteredProjects[projectIndex];

      const tile = document.createElement('button');
      tile.className = 'tile';
      tile.type = 'button';
      tile.tabIndex = -1;
      tile.dataset.row = String(row);
      tile.dataset.column = String(col);
      tile.setAttribute('aria-label', `Open ${project.title}`);

      const cx = (col - (c - 1) / 2) * (cw + gapX);
      const cy = (row - (r - 1) / 2) * (ch + gapY);
      const angleX = (cy / radiusY) * Math.PI / 2;
      const angleY = (cx / radiusX) * Math.PI / 2;
      const depth = baseDepth - row * 200;

      const tx = Math.sin(angleY) * radiusX;
      const tz = Math.cos(angleY) * radiusX + depth;
      const ty = Math.sin(angleX) * radiusY;

      newTiles.push({
        tile,
        frame: project,
        row,
        col,
        dispRow: row,
        dispCol: col,
        x: tx,
        y: ty,
        z: tz,
        rotX: -angleX,
        rotY: -angleY,
        scale: 1,
        opacity: 1,
        focusDepth: 1 / 0,
      });

      renderTile(tile, project, true);
    }

    setTiles(newTiles);
  }, [filteredProjects, calculateLayout]);

  const renderTile = (tile: HTMLElement, project: typeof PROJECTS_DATA[0], eager = false) => {
    tile.dataset.project = project.id;
    tile.dataset.categories = project.categories.join('|');
    tile.innerHTML = `
      <span class="tile__surface">
        ${project.image ? `<img src="${project.image}" alt="${project.title}" draggable="false" decoding="async" loading="${eager ? 'eager' : 'lazy'}" fetchpriority="${eager ? 'high' : 'low'}" style="width:100%;height:100%;object-fit:cover;filter:grayscale(1) brightness(.75) contrast(1.08) blur(.7px);transform:scale(1.04);transition:filter .36s cubic-bezier(.16,1,.3,1)">` : ''}
        <span class="tile__label">${project.shortTitle}</span>
      </span>
    `;
  };

  useEffect(() => {
    const layout = calculateLayout();
    if (!layout || !worldRef.current) return;

    const { c, r, cw, ch, radiusX, radiusY, baseDepth, gapX, gapY, isMobile } = layout;
    const perspective = isMobile ? 780 : 1120;

    if (stageRef.current) {
      stageRef.current.style.perspective = `${perspective}px`;
    }

    tiles.forEach((tileData, i) => {
      const col = i % c;
      const row = Math.floor(i / c);
      const cx = (col - (c - 1) / 2) * (cw + gapX);
      const cy = (row - (r - 1) / 2) * (ch + gapY);
      const angleX = (cy / radiusY) * Math.PI / 2;
      const angleY = (cx / radiusX) * Math.PI / 2;
      const depth = baseDepth - row * 200;

      const tx = Math.sin(angleY) * radiusX + pan.x;
      const tz = Math.cos(angleY) * radiusX + depth + pan.z;
      const ty = Math.sin(angleX) * radiusY + pan.y;

      const transform = `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${-angleX}rad) rotateY(${-angleY}rad) scale(${tileData.scale})`;
      tileData.tile.style.transform = transform;
      tileData.tile.style.width = `${cw}px`;
      tileData.tile.style.height = `${ch}px`;
      tileData.x = tx;
      tileData.y = ty;
      tileData.z = tz;
      tileData.rotX = -angleX;
      tileData.rotY = -angleY;
    });
  }, [tiles, pan, calculateLayout]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target !== stageRef.current && !stageRef.current?.contains(e.target as Node)) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      panZ: pan.z,
    });
    stageRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPan({
      x: dragStart.panX + dx,
      y: dragStart.panY + dy,
      z: dragStart.panZ,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    stageRef.current?.releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setPan(prev => ({
        ...prev,
        z: Math.max(-2000, Math.min(0, prev.z - e.deltaY * 0.5)),
      }));
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const handleFilterChange = (cat: string) => {
    setFilter(cat);
    setPan({ x: 0, y: 0, z: 0 });
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    if (focusReadoutRef.current && filteredProjects[index]) {
      focusReadoutRef.current.textContent = `${filteredProjects[index].shortTitle} · ${filteredProjects[index].year}`;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      const maxIndex = filteredProjects.length - 1;
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(i => Math.min(i + 1, maxIndex));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(i => Math.max(i - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(i => Math.min(i + cols, maxIndex));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(i => Math.max(i - cols, 0));
          break;
        case 'Enter':
        case ' ':
          if (filteredProjects[focusedIndex]) {
            window.location.href = `/project/${filteredProjects[focusedIndex].id}`;
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, filteredProjects, cols]);

  useEffect(() => {
    if (depthRef.current) {
      depthRef.current.textContent = `↓ ${String(filteredProjects.length).padStart(3, '0')}`;
    }
  }, [filteredProjects.length]);

  useEffect(() => {
    if (focusReadoutRef.current && filteredProjects[focusedIndex]) {
      focusReadoutRef.current.textContent = `${filteredProjects[focusedIndex].shortTitle} · ${filteredProjects[focusedIndex].year}`;
    }
  }, [focusedIndex, filteredProjects]);

  const handleProjectJump = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id) {
      window.location.href = `/project/${id}`;
    }
  };

  if (isLoading) {
    return (
      <Loader ref={loaderRef} isLoading={isLoading} />
    );
  }

  return (
    <div className="experience" ref={experienceRef} aria-label="Harsh Dev Jha portfolio archive">
      <header className="archive-header">
        <a className="identity" href="/archive" aria-label="Harsh Dev Jha, return to archive">
          <h1 className="identity__name"><span>Harsh Dev</span><span>Jha</span></h1>
          <span className="identity__role">Systems Architect & AI Engineer</span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="/archive" data-route="archive" aria-current="page">Archive</a>
          <a href="/about" data-route="about">About</a>
          <a href="/awards" data-route="awards">Awards</a>
          <a href="/press" data-route="press">Press</a>
          <a href="/private" data-route="private">Private</a>
          <a href="https://github.com/Inkesk-Dozing" target="_blank" rel="noopener">GitHub ↗</a>
          <a href="https://linkedin.com/in/harsh-dev-jha-primus" target="_blank" rel="noopener">LinkedIn ↗</a>
        </nav>
      </header>

      <div
        className="stage"
        ref={stageRef}
        data-dragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        aria-label="Scroll down through the work. Drag to shift the view."
      >
        <div className="world" ref={worldRef}>
          {tiles.map((tileData, i) => (
            <button
              key={tileData.frame?.id || i}
              ref={(el) => { if (el) tileData.tile = el; }}
              className="tile"
              data-row={tileData.row}
              data-column={tileData.col}
              tabIndex={i === focusedIndex ? 0 : -1}
              onFocus={() => handleFocus(i)}
              onMouseEnter={() => handleFocus(i)}
              onClick={() => tileData.frame && (window.location.href = `/project/${tileData.frame.id}`)}
              style={{
                width: cellWidth,
                height: cellHeight,
              }}
            >
              {tileData.frame && (
                <>
                  <span className="tile__surface">
                    {tileData.frame.image && (
                      <img
                        src={tileData.frame.image}
                        alt={tileData.frame.title}
                        draggable="false"
                        decoding="async"
                        loading={i < cols * rows ? 'eager' : 'lazy'}
                        fetchPriority={i < cols * rows ? 'high' : 'low'}
                      />
                    )}
                    <span className="tile__label">{tileData.frame.shortTitle}</span>
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
        <span className="focus-reticle" aria-hidden="true" />
      </div>

      <div className="filter-dock">
        <nav className="filters" aria-label="Filter work">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              data-filter={cat}
              aria-pressed={filter === cat}
              onClick={() => handleFilterChange(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
        <nav className="filter-projects" aria-label="Projects in selected category" ref={filterProjectsRef} hidden>
          {filteredProjects.map(project => (
            <button
              key={project.id}
              onClick={() => window.location.href = `/project/${project.id}`}
            >
              <span>{project.shortTitle}</span>
              <span>{project.year}</span>
            </button>
          ))}
        </nav>
      </div>

      <p className="instruction">Scroll down · Drag to shift</p>
      <p className="focus-readout" ref={focusReadoutRef} aria-live="polite">
        {filteredProjects[focusedIndex] ? `${filteredProjects[focusedIndex].shortTitle} · ${filteredProjects[focusedIndex].year}` : 'Harsh Dev Jha Archive'}
      </p>
      <p className="depth" ref={depthRef} aria-hidden="true">↓ 000</p>

      <label className="project-jump" htmlFor="project-jump">
        <span className="sr-only">Open project</span>
        <select id="project-jump" ref={projectJumpSelectRef} onChange={handleProjectJump}>
          <option value="">Choose a project</option>
          {PROJECTS_DATA.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </label>
    </div>
  );
}