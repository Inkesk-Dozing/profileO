# Architecture Design - Cosmic Creator Portfolio

This document maps the component system interaction, WebGL rendering context, and animation sheets powering the cosmic creator portfolio site.

## System Workflow & Component Map

The site runs as a single-page interactive application, orchestrating Three.js scenes, custom GLSL displacement mathematics, Theatre.js timelines, and Anime.js triggers.

```mermaid
graph TD
    User([User interaction]) --> UI[DOM Interface / Scroll / Hover / Click]
    UI --> Controller[app.js Controller]
    Controller --> WebGL[Three.js WebGL Renderer]
    WebGL --> Particles[Three.js Galaxy Particle System]
    WebGL --> Meshes[3D Orbiting Skill Geometries]
    WebGL --> Spacetime[Deformable Space Mesh Grid]
    Controller --> TheatreTimelines[Theatre.js / Animation Timelines]
    TheatreTimelines --> AnimeUpdate[Fluid HTML Transitions & Camera Tweens]
```

## Section Sequence & Visual Chapters

```mermaid
graph LR
    C1[Chapter 1: The Singularity] --> C2[Chapter 2: Utilities of the Universe]
    C2 --> C3[Chapter 3: Fabric of Spacetime]
    C3 --> C4[Chapter 4: Timeline of the Creator]
    C4 --> C5[Chapter 5: The Convergence]
```

## Component Architecture

- **`index.html`**: Host structural DOM nodes, 3D WebGL `<canvas>` elements, and external script references (Three.js, Theatre.js, Anime.js).
- **`styles.css`**: Design tokens, space dark backgrounds, neon custom properties (`--glow-purple`, `--glow-cyan`, `--glow-amber`), glass overlay cards, and responsive positioning rules.
- **`app.js`**:
  - `UniverseController`: Manages window scroll progress, active chapter state, and sound generation.
  - `ThreeEngine`: Orchestrates the Three.js scene, cameras, perspective matrices, point lights, and rendering loop.
  - `ParticleGalaxy (Chapter 1)`: Populates and updates 1,500+ stars using math displacement to simulate the Big Bang shatter.
  - `OrbitingGeometries (Chapter 2)`: Generates floating 3D shapes (torus, sphere, knot) orbiting in Three.js space.
  - `SpacetimeLattice (Chapter 3)`: Renders a mesh plane representing physical spacetime, displacing vertices dynamically on scroll.
  - `SingularityWarp (Chapter 5)`: Animates a mathematical gravity well (black hole simulation) that bends coordinates towards the center.
