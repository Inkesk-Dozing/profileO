# Component and Feature Specifications

This document outlines the purpose, dependencies, and computational complexity of the components powering the Cosmic Creator Portfolio.

---

## 1. Particle Big Bang Galaxy (Chapter 1)

- **Purpose**: Generates a compact cluster of 1,500 particle instances. Upon click, it executes a programmatic explosion, translating vertices outwards in spherical coordinate trajectories to form a spiral galaxy.
- **Dependencies**: Three.js `BufferGeometry`, `Points`.
- **Complexity**:
  - Time Complexity: $O(N)$ per frame update, where $N$ is the number of particles ($N = 1500$).
  - Space Complexity: $O(N)$ storing position vectors and velocity offsets in Float32 arrays.

---

## 2. Cosmic Utility Orbital Geometries (Chapter 2)

- **Purpose**: Instantiates three distinct Three.js geometric meshes (Sphere, Torus, Knot). Applies continuous quaternions and orbit paths.
- **Dependencies**: Three.js Mesh Geometries (`TorusGeometry`, `SphereGeometry`), MeshStandardMaterial.
- **Complexity**:
  - Time Complexity: $O(1)$ per frame for rigid body matrix transformations (handled on the GPU).
  - Space Complexity: $O(V)$ vertex memory where $V$ is the combined mesh vertex count.

---

## 3. Spacetime Lattice Grid Displacement (Chapter 3)

- **Purpose**: Renders a flat horizontal grid plane. Displaces the Y-coordinates of vertices based on proximity to active project elements and scroll speed to simulate "spacetime warping."
- **Dependencies**: Three.js `PlaneGeometry`, custom displacement mathematics.
- **Complexity**:
  - Time Complexity: $O(V)$ where $V$ is the resolution grid vertices ($20 \times 20 = 400$ vertices).
  - Space Complexity: $O(V)$ storing dynamic vertex elevations.

---

## 4. Black Hole Singularity Attraction (Chapter 5)

- **Purpose**: Simulates gravitational pull towards a central coordinate. Warps canvas dimensions and bends contact input field vectors towards the singularity coordinate.
- **Dependencies**: Three.js ShaderMaterial or dynamic Canvas rendering context.
- **Complexity**:
  - Time Complexity: $O(1)$ calculations.
  - Space Complexity: $O(1)$.
