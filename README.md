# Jordan's Tetris

A full 3D spatial puzzle game built with WebGL (Three.js), React, TypeScript, and Firebase.

## Subproject Info

- **Subproject Slug**: `neon-tetris-3d`
- **Game Title**: Jordan's Tetris
- **Firebase Project ID**: `portfolio-800ba`
- **Firestore Collections**:
  - `neon-tetris-3d_leaderboard`: Global real-time highscore leaderboard
  - `neon-tetris-3d_users`: User profile & persistent stats

## Setup & Running

```bash
cd neon-stack-core-surge
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

## Controls & Features

- **3D Spatial Polyominoes**: Solid 3D bricks with 0-gap separation.
- **3D Rotations (WASD)**: Pitch ($W/S$), Yaw ($A/D$), Roll ($Q/E$).
- **Camera-Relative Movement (Arrow Keys)**: Left is ALWAYS left on screen!
- **Trackpad & Mouse Origin Panning**:
  - Dragging trackpad/mouse rotates around origin center.
  - Hold `Z` key + drag: Pans origin target UP / DOWN ($Y$-axis).
  - Hold `X` key + drag: Pans origin target along the base plane ($X/Z$-plane).
  - Trackpad Pinch: Zooms in and out.
- **Firebase Auth & Firestore**: Live global leaderboards and user score tracking.

---
a Jordan Katz project - [jordankatz.dev](https://jordankatz.dev)
