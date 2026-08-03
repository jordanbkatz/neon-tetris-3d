import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ActivePiece, GridCell, GRID_SIZE, CameraPreset } from '../game/types';
import { getGhostPieceY } from '../game/polyominoes';

interface ThreeCanvasProps {
  grid: (GridCell)[][][];
  activePiece: ActivePiece | null;
  cameraPreset: CameraPreset;
  orbitAngle: { theta: number; phi: number };
  onOrbitChange: (angle: { theta: number; phi: number }) => void;
  surgeAnimation: number[];
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  grid,
  activePiece,
  cameraPreset,
  orbitAngle,
  onOrbitChange,
  surgeAnimation
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Camera Spherical & Origin Target Refs
  const orbitAngleRef = useRef({ theta: orbitAngle.theta, phi: orbitAngle.phi });
  const sphereRadiusRef = useRef(30);
  const targetOriginRef = useRef({ x: 0, y: GRID_SIZE.Y / 2, z: 0 });
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const isManualCameraRef = useRef(false);

  // Sync prop changes into ref
  useEffect(() => {
    orbitAngleRef.current = orbitAngle;
  }, [orbitAngle]);

  // Track X and Z modifier key states for origin panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const blocksGroupRef = useRef<THREE.Group | null>(null);
  const ghostGroupRef = useRef<THREE.Group | null>(null);
  const activeGroupRef = useRef<THREE.Group | null>(null);

  // Handle Preset View Snaps & Reset Origin
  useEffect(() => {
    isManualCameraRef.current = false;
    targetOriginRef.current = { x: 0, y: GRID_SIZE.Y / 2, z: 0 };
    if (cameraPreset === 'TOP_DOWN') {
      orbitAngleRef.current = { theta: 0, phi: 0.02 };
      sphereRadiusRef.current = 32;
      onOrbitChange({ theta: 0, phi: 0.02 });
    } else if (cameraPreset === 'SIDE_PROFILE') {
      orbitAngleRef.current = { theta: 0, phi: Math.PI / 2 - 0.01 };
      sphereRadiusRef.current = 30;
      onOrbitChange({ theta: 0, phi: Math.PI / 2 - 0.01 });
    } else if (cameraPreset === 'DEFAULT') {
      orbitAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3 };
      sphereRadiusRef.current = 30;
      onOrbitChange({ theta: Math.PI / 4, phi: Math.PI / 3 });
    }
  }, [cameraPreset]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Clean Dark Void Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Groups
    const blocksGroup = new THREE.Group();
    const activeGroup = new THREE.Group();
    const ghostGroup = new THREE.Group();
    scene.add(blocksGroup);
    scene.add(activeGroup);
    scene.add(ghostGroup);
    blocksGroupRef.current = blocksGroup;
    activeGroupRef.current = activeGroup;
    ghostGroupRef.current = ghostGroup;

    // ==========================================
    // SUBTLE WHITE/GREY PRISM BORDER
    // ==========================================
    const prismGroup = new THREE.Group();
    const pW = GRID_SIZE.X;
    const pH = GRID_SIZE.Y;
    const pD = GRID_SIZE.Z;

    // Outer Glass Box
    const glassGeo = new THREE.BoxGeometry(pW, pH, pD);
    const glassMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.06,
      depthWrite: false
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(0, pH / 2, 0);
    prismGroup.add(glassMesh);

    // Clean Subtle White/Grey Outer Border Edges
    const edgesGeo = new THREE.EdgesGeometry(glassGeo);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0xd1d5db, linewidth: 1.5, transparent: true, opacity: 0.7 });
    const edgesLine = new THREE.LineSegments(edgesGeo, edgesMat);
    edgesLine.position.set(0, pH / 2, 0);
    prismGroup.add(edgesLine);

    // Bottom & Top Grid Rings
    const baseGrid = new THREE.GridHelper(pW, pW, 0xe5e7eb, 0x374151);
    baseGrid.position.set(0, 0, 0);
    (baseGrid.material as THREE.Material).transparent = true;
    (baseGrid.material as THREE.Material).opacity = 0.35;
    prismGroup.add(baseGrid);

    const topGrid = new THREE.GridHelper(pW, pW, 0xe5e7eb, 0x374151);
    topGrid.position.set(0, pH, 0);
    (topGrid.material as THREE.Material).transparent = true;
    (topGrid.material as THREE.Material).opacity = 0.2;
    prismGroup.add(topGrid);

    scene.add(prismGroup);

    // 60 FPS Animation Loop with Dynamic Target Origin
    let animationFrameId: number;
    let autoOrbitAngle = orbitAngleRef.current.theta;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (cameraRef.current) {
        let currentTheta = orbitAngleRef.current.theta;
        let currentPhi = orbitAngleRef.current.phi;

        if (cameraPreset === 'DYNAMIC_ORBIT' && !isManualCameraRef.current) {
          autoOrbitAngle += 0.004;
          currentTheta = autoOrbitAngle;
          currentPhi = Math.PI / 3;
          orbitAngleRef.current.theta = currentTheta;
          orbitAngleRef.current.phi = currentPhi;
        }

        const radius = sphereRadiusRef.current;
        const origin = targetOriginRef.current; // Panning origin (X, Y, Z)

        // Spherical position offset from origin
        const x = origin.x + radius * Math.sin(currentPhi) * Math.sin(currentTheta);
        const y = origin.y + radius * Math.cos(currentPhi);
        const z = origin.z + radius * Math.sin(currentPhi) * Math.cos(currentTheta);

        cameraRef.current.position.set(x, y, z);
        cameraRef.current.lookAt(origin.x, origin.y, origin.z);
      }

      if (activeGroupRef.current && activeGroupRef.current.userData.targetPos) {
        const targetPos = activeGroupRef.current.userData.targetPos;
        activeGroupRef.current.position.lerp(targetPos, 0.35);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, [cameraPreset]);

  // Trackpad 2-Finger Drag / Modifier Key Panning (Z for Y-up/down, X for Base Plane) & Zoom
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      isManualCameraRef.current = true;

      const isZ = keysPressedRef.current['z'];
      const isX = keysPressedRef.current['x'];

      if (e.ctrlKey) {
        // Pinch to Zoom
        const zoomDelta = e.deltaY * 0.18;
        sphereRadiusRef.current = Math.max(10, Math.min(65, sphereRadiusRef.current + zoomDelta));
      } else if (isZ) {
        // Holding 'Z': Translate Target Origin UP / DOWN (Y Axis)
        targetOriginRef.current.y -= e.deltaY * 0.03;
      } else if (isX) {
        // Holding 'X': Translate Target Origin along the Base Plane (X and Z Axes)
        const theta = orbitAngleRef.current.theta;
        const dx = (e.deltaX * Math.cos(theta) - e.deltaY * Math.sin(theta)) * 0.03;
        const dz = (e.deltaX * Math.sin(theta) + e.deltaY * Math.cos(theta)) * 0.03;
        targetOriginRef.current.x += dx;
        targetOriginRef.current.z += dz;
      } else {
        // Normal 2-Finger Drag: Rotate Orbit on Sphere
        const sensitivity = 0.005;
        const newTheta = orbitAngleRef.current.theta + e.deltaX * sensitivity;
        const newPhi = Math.max(0.01, Math.min(Math.PI - 0.01, orbitAngleRef.current.phi + e.deltaY * sensitivity));

        orbitAngleRef.current = { theta: newTheta, phi: newPhi };
        onOrbitChange({ theta: newTheta, phi: newPhi });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [onOrbitChange]);

  // Mouse Left-Click & Drag (Rotate on Sphere or Pan Origin if holding Z or X)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    isManualCameraRef.current = true;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    const isZ = keysPressedRef.current['z'];
    const isX = keysPressedRef.current['x'];

    if (isZ) {
      // Hold Z + Drag: Pan Origin vertically (Y axis)
      targetOriginRef.current.y -= deltaY * 0.05;
    } else if (isX) {
      // Hold X + Drag: Pan Origin along base plane (X and Z axes)
      const theta = orbitAngleRef.current.theta;
      const dx = (-deltaX * Math.cos(theta) + deltaY * Math.sin(theta)) * 0.05;
      const dz = (-deltaX * Math.sin(theta) - deltaY * Math.cos(theta)) * 0.05;
      targetOriginRef.current.x += dx;
      targetOriginRef.current.z += dz;
    } else {
      // Rotate Orbit
      const sensitivity = 0.006;
      const newTheta = orbitAngleRef.current.theta - deltaX * sensitivity;
      const newPhi = Math.max(0.01, Math.min(Math.PI - 0.01, orbitAngleRef.current.phi + deltaY * sensitivity));

      orbitAngleRef.current = { theta: newTheta, phi: newPhi };
      onOrbitChange({ theta: newTheta, phi: newPhi });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Render SOLID SEAMLESS BRICKS (No gap separation, BoxGeometry 1.0 x 1.0 x 1.0)
  useEffect(() => {
    if (!blocksGroupRef.current || !activeGroupRef.current || !ghostGroupRef.current) return;

    const bGroup = blocksGroupRef.current;
    const aGroup = activeGroupRef.current;
    const gGroup = ghostGroupRef.current;

    while (bGroup.children.length > 0) bGroup.remove(bGroup.children[0]);
    while (aGroup.children.length > 0) aGroup.remove(aGroup.children[0]);
    while (gGroup.children.length > 0) gGroup.remove(gGroup.children[0]);

    // Full 1.0 size for zero gap between adjacent cells in a brick!
    const boxGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const pW = GRID_SIZE.X;
    const pH = GRID_SIZE.Y;
    const pD = GRID_SIZE.Z;
    const originOffset = { x: -pW / 2 + 0.5, y: 0.5, z: -pD / 2 + 0.5 };

    // 1. Static Locked Solid Bricks (No gap separation)
    for (let x = 0; x < GRID_SIZE.X; x++) {
      for (let y = 0; y < GRID_SIZE.Y; y++) {
        for (let z = 0; z < GRID_SIZE.Z; z++) {
          const cell = grid[x][y][z];
          if (cell && cell.filled) {
            const isCorrupt = cell.isCorruption;
            const mat = new THREE.MeshBasicMaterial({
              color: isCorrupt ? '#7c3aed' : cell.color
            });

            const mesh = new THREE.Mesh(boxGeo, mat);
            mesh.position.set(x + originOffset.x, y + originOffset.y, z + originOffset.z);

            const edges = new THREE.EdgesGeometry(boxGeo);
            const lineMat = new THREE.LineBasicMaterial({
              color: isCorrupt ? '#c084fc' : '#ffffff',
              linewidth: 1
            });
            mesh.add(new THREE.LineSegments(edges, lineMat));
            bGroup.add(mesh);
          }
        }
      }
    }

    // 2. Active Piece (No gap separation)
    if (activePiece) {
      const activeColor = activePiece.isPowerup ? '#fbbf24' : activePiece.color;
      activePiece.cells.forEach(cell => {
        const gx = activePiece.x + cell.x;
        const gy = activePiece.y + cell.y;
        const gz = activePiece.z + cell.z;

        if (gy < GRID_SIZE.Y) {
          const mat = new THREE.MeshBasicMaterial({
            color: activeColor
          });

          const mesh = new THREE.Mesh(boxGeo, mat);
          mesh.position.set(gx + originOffset.x, gy + originOffset.y, gz + originOffset.z);

          const edges = new THREE.EdgesGeometry(boxGeo);
          mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#ffffff' })));
          aGroup.add(mesh);
        }
      });

      // 3. Ghost Piece Landing Projection
      const ghostY = getGhostPieceY(activePiece, grid);
      activePiece.cells.forEach(cell => {
        const gx = activePiece.x + cell.x;
        const gy = ghostY + cell.y;
        const gz = activePiece.z + cell.z;

        if (gy < GRID_SIZE.Y && gy >= 0) {
          const ghostGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
          const edges = new THREE.EdgesGeometry(ghostGeo);
          const lineMat = new THREE.LineBasicMaterial({
            color: activePiece.glowColor,
            transparent: true,
            opacity: 0.65
          });
          const wire = new THREE.LineSegments(edges, lineMat);
          wire.position.set(gx + originOffset.x, gy + originOffset.y, gz + originOffset.z);
          gGroup.add(wire);
        }
      });
    }
  }, [grid, activePiece]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden touch-none select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};
