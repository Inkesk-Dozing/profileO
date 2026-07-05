# Cosmic State Synchronization API Specification

This document details the internal API contract used to coordinate state between the HTML DOM layer and the Three.js WebGL graphics canvas.

## State Interface Spec

```typescript
interface UniverseState {
  currentChapter: number;      // Active slide (1 to 5)
  isSingularityExploded: boolean; // Triggers Big Bang in Chapter 1
  activeUtility: string | null;  // Identifies hovered 3D geometric mesh
  spacetimeDisplacement: number; // Factor matching scroll velocity
  isSoundMuted: boolean;        // Audio configuration
}
```

## Internal Synchronization Events

### 1. `chapterChange`
Dispatched when shifting sections. Signals Three.js camera to interpolate position.
- **Payload**: `{ chapter: number, targetCamPos: { x: number, y: number, z: number } }`

### 2. `triggerBigBang`
Signals the galaxy particle buffer to shift vertex positions from a singular coordinate outward.
- **Payload**: `{ coordinates: { x: number, y: number, z: number }, force: number }`

### 3. `setUtilityFocus`
Updates standard materials to glow when hovered in 3D.
- **Payload**: `{ utilityId: string | null }`
