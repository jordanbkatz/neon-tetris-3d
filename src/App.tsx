import React, { useState, useEffect, useCallback } from 'react';
import { 
  GRID_SIZE, 
  ActivePiece, 
  GridCell, 
  CameraPreset, 
  GameStats 
} from './game/types';
import { 
  getRandomPiece, 
  rotatePiece, 
  checkCollision, 
  createEmptyGrid, 
  generateCorruptionBlocks,
  getGhostPieceY 
} from './game/polyominoes';
import { audioEngine } from './game/audioEngine';
import { auth, onAuthStateChanged, User } from './firebase/config';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HUD } from './components/HUD';
import { ControlBar } from './components/ControlBar';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AuthModal } from './components/AuthModal';
import { GameOverModal } from './components/GameOverModal';
import { HomePage } from './components/HomePage';

// Vector projection for camera-relative screen directions
function getScreenRelativeMove(dir: 'LEFT' | 'RIGHT' | 'IN' | 'OUT', theta: number): { dx: number; dz: number } {
  const cx = Math.sin(theta);
  const cz = Math.cos(theta);

  const vx = -cx;
  const vz = -cz;

  const rx = -vz;
  const rz = vx;

  const fx = vx;
  const fz = vz;

  let moveX = 0;
  let moveZ = 0;

  if (dir === 'RIGHT' || dir === 'LEFT') {
    if (Math.abs(rx) >= Math.abs(rz)) {
      moveX = Math.sign(rx);
    } else {
      moveZ = Math.sign(rz);
    }
    if (dir === 'LEFT') {
      moveX = -moveX;
      moveZ = -moveZ;
    }
  } else {
    if (Math.abs(fx) >= Math.abs(fz)) {
      moveX = Math.sign(fx);
    } else {
      moveZ = Math.sign(fz);
    }
    if (dir === 'OUT') {
      moveX = -moveX;
      moveZ = -moveZ;
    }
  }

  return { dx: moveX, dz: moveZ };
}

export function App() {
  // Navigation State: 'HOME' vs 'GAME'
  const [currentView, setCurrentView] = useState<'HOME' | 'GAME'>('HOME');

  // Game State
  const [grid, setGrid] = useState<(GridCell)[][][]>(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [nextQueue, setNextQueue] = useState<ActivePiece[]>([]);
  const [holdPiece, setHoldPiece] = useState<ActivePiece | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lines: 0,
    level: 1,
    battery: 50,
    isZeroG: false,
    zeroGTimer: 0,
    maxCombo: 1
  });

  // Camera State
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('DEFAULT');
  const [orbitAngle, setOrbitAngle] = useState({ theta: Math.PI / 4, phi: Math.PI / 3 });
  const [surgeAnimation, setSurgeAnimation] = useState<number[]>([]);

  // UI Modals
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize Auth Listener & Pieces
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));

    const q1 = getRandomPiece(1);
    const q2 = getRandomPiece(1);
    const q3 = getRandomPiece(1);
    setActivePiece(q1);
    setNextQueue([q2, q3]);

    return () => unsub();
  }, []);

  // Lock Piece & Calculate Standard Tetris Scoring
  const lockPiece = useCallback((piece: ActivePiece) => {
    audioEngine.playDropSound();

    const newGrid = grid.map(xArr => xArr.map(yArr => [...yArr]));
    let overflow = false;

    // 1. Calculate points based on brick placement (number of cells in piece)
    const placedCellCount = piece.cells.length;
    const placementPoints = placedCellCount * 10 * stats.level;

    piece.cells.forEach(cell => {
      const gx = piece.x + cell.x;
      const gy = piece.y + cell.y;
      const gz = piece.z + cell.z;

      if (gy >= GRID_SIZE.Y) {
        overflow = true;
      } else if (gx >= 0 && gx < GRID_SIZE.X && gz >= 0 && gz < GRID_SIZE.Z && gy >= 0) {
        newGrid[gx][gy][gz] = {
          filled: true,
          color: piece.color,
          isCorruption: false
        };
      }
    });

    if (overflow) {
      audioEngine.playGameOverSound();
      setIsGameOver(true);
      return;
    }

    // 2. Check for cleared horizontal layers (10x10 full layers)
    const clearedLayers: number[] = [];

    for (let y = 0; y < GRID_SIZE.Y; y++) {
      let isFullLayer = true;
      for (let x = 0; x < GRID_SIZE.X; x++) {
        for (let z = 0; z < GRID_SIZE.Z; z++) {
          if (!newGrid[x][y][z] || !newGrid[x][y][z]?.filled) {
            isFullLayer = false;
            break;
          }
        }
        if (!isFullLayer) break;
      }

      if (isFullLayer) {
        clearedLayers.push(y);
      }
    }

    let lineClearBonus = 0;
    const count = clearedLayers.length;

    if (count > 0) {
      setSurgeAnimation(clearedLayers);
      audioEngine.playSurgeSound(count);

      // Clear full layers & collapse grid down
      for (const yClear of clearedLayers.sort((a, b) => b - a)) {
        for (let x = 0; x < GRID_SIZE.X; x++) {
          for (let z = 0; z < GRID_SIZE.Z; z++) {
            for (let y = yClear; y < GRID_SIZE.Y - 1; y++) {
              newGrid[x][y][z] = newGrid[x][y + 1][z];
            }
            newGrid[x][GRID_SIZE.Y - 1][z] = null;
          }
        }
      }

      // Classic Tetris Bonus Multiplier: Single = 100, Double = 300, Triple = 500, Tetris (4+) = 800+
      const lineMultiplierMap: { [key: number]: number } = { 1: 100, 2: 300, 3: 500, 4: 800 };
      const baseBonus = lineMultiplierMap[count] || (count * 250);
      lineClearBonus = baseBonus * stats.level;
    }

    const totalAddedPoints = placementPoints + lineClearBonus;
    const newLines = stats.lines + count;
    const newLevel = Math.floor(newLines / 8) + 1;
    const batteryCharge = Math.min(100, stats.battery + count * 25);

    setStats(prev => ({
      ...prev,
      score: prev.score + totalAddedPoints,
      lines: newLines,
      level: newLevel,
      battery: batteryCharge,
      maxCombo: Math.max(prev.maxCombo, count)
    }));

    if (newLevel > 3 && count >= 2) {
      generateCorruptionBlocks(newGrid, 1);
    }

    setGrid(newGrid);

    const nextPiece = nextQueue[0];
    const newQ2 = getRandomPiece(stats.level);
    setActivePiece(nextPiece);
    setNextQueue([nextQueue[1], newQ2]);
    setCanHold(true);

    if (checkCollision(nextPiece, newGrid)) {
      audioEngine.playGameOverSound();
      setIsGameOver(true);
    }
  }, [grid, nextQueue, stats.level, stats.lines, stats.battery, stats.maxCombo]);

  const dropTick = useCallback(() => {
    if (currentView !== 'GAME' || isGameOver || isPaused || !activePiece) return;

    if (!checkCollision(activePiece, grid, 0, -1, 0)) {
      setActivePiece(prev => prev ? { ...prev, y: prev.y - 1 } : null);
    } else {
      lockPiece(activePiece);
    }
  }, [activePiece, currentView, grid, isGameOver, isPaused, lockPiece]);

  useEffect(() => {
    if (currentView !== 'GAME' || isGameOver || isPaused) return;

    const intervalTime = stats.isZeroG 
      ? 1400 
      : Math.max(120, 800 - (stats.level - 1) * 60);

    const timer = setInterval(() => {
      dropTick();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [dropTick, currentView, isGameOver, isPaused, stats.level, stats.isZeroG]);

  // Screen/Camera Relative Movement Helper
  const handleRelativeMove = (dir: 'LEFT' | 'RIGHT' | 'IN' | 'OUT') => {
    if (currentView !== 'GAME' || isGameOver || !activePiece) return;
    const { dx, dz } = getScreenRelativeMove(dir, orbitAngle.theta);
    if (!checkCollision(activePiece, grid, dx, 0, dz)) {
      setActivePiece(prev => prev ? { ...prev, x: prev.x + dx, z: prev.z + dz } : null);
      audioEngine.playMoveSound();
    }
  };

  const handleRotate = (axis: 'X' | 'Y' | 'Z') => {
    if (currentView !== 'GAME' || isGameOver || !activePiece) return;
    const rotated = rotatePiece(activePiece, axis);
    if (!checkCollision(rotated, grid)) {
      setActivePiece(rotated);
      audioEngine.playRotateSound();
    }
  };

  const handleHardDrop = () => {
    if (currentView !== 'GAME' || isGameOver || !activePiece) return;
    const landingY = getGhostPieceY(activePiece, grid);
    const droppedPiece = { ...activePiece, y: landingY };
    lockPiece(droppedPiece);
  };

  const handleHold = () => {
    if (currentView !== 'GAME' || isGameOver || !canHold || !activePiece) return;

    audioEngine.playRotateSound();
    if (!holdPiece) {
      setHoldPiece(activePiece);
      const nextPiece = nextQueue[0];
      const newQ2 = getRandomPiece(stats.level);
      setActivePiece(nextPiece);
      setNextQueue([nextQueue[1], newQ2]);
    } else {
      const temp = activePiece;
      setActivePiece({
        ...holdPiece,
        x: Math.floor(GRID_SIZE.X / 2),
        y: GRID_SIZE.Y - 3,
        z: Math.floor(GRID_SIZE.Z / 2)
      });
      setHoldPiece(temp);
    }
    setCanHold(false);
  };

  const handleActivateZeroG = () => {
    if (stats.battery < 100 || stats.isZeroG) return;

    audioEngine.playZeroGSound();
    setStats(prev => ({ ...prev, isZeroG: true, battery: 0 }));

    setTimeout(() => {
      setStats(prev => ({ ...prev, isZeroG: false }));
    }, 12000);
  };

  // Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentView !== 'GAME' || isGameOver) return;

      const key = e.key.toLowerCase();

      switch (key) {
        // WASD Rotations
        case 'w':
        case 's':
          handleRotate('X');
          break;
        case 'a':
        case 'd':
          handleRotate('Y');
          break;
        case 'q':
        case 'e':
          handleRotate('Z');
          break;

        // Camera-Relative Arrow Movement
        case 'arrowleft':
          handleRelativeMove('LEFT');
          break;
        case 'arrowright':
          handleRelativeMove('RIGHT');
          break;
        case 'arrowup':
          handleRelativeMove('IN');
          break;
        case 'arrowdown':
          handleRelativeMove('OUT');
          break;

        case ' ':
          e.preventDefault();
          handleHardDrop();
          break;
        case 'shift':
          e.preventDefault();
          handleHold();
          break;
        case 'z':
          handleActivateZeroG();
          break;
        case 'c':
          const presets: CameraPreset[] = ['DEFAULT', 'TOP_DOWN', 'SIDE_PROFILE', 'DYNAMIC_ORBIT'];
          const idx = presets.indexOf(cameraPreset);
          setCameraPreset(presets[(idx + 1) % presets.length]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePiece, currentView, grid, isGameOver, cameraPreset, stats.battery, orbitAngle]);

  const handleStartGame = () => {
    const freshGrid = createEmptyGrid();
    setGrid(freshGrid);
    const q1 = getRandomPiece(1);
    const q2 = getRandomPiece(1);
    const q3 = getRandomPiece(1);
    setActivePiece(q1);
    setNextQueue([q2, q3]);
    setHoldPiece(null);
    setCanHold(true);
    setIsGameOver(false);
    setStats({
      score: 0,
      lines: 0,
      level: 1,
      battery: 50,
      isZeroG: false,
      zeroGTimer: 0,
      maxCombo: 1
    });
    setCurrentView('GAME');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex flex-col">
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <ThreeCanvas
          grid={grid}
          activePiece={activePiece}
          cameraPreset={cameraPreset}
          orbitAngle={orbitAngle}
          onOrbitChange={setOrbitAngle}
          surgeAnimation={surgeAnimation}
        />
      </div>

      {/* Render Home Page vs Active Game HUD/Controls */}
      {currentView === 'HOME' ? (
        <HomePage
          user={user}
          onStartGame={handleStartGame}
          onOpenAuth={() => setShowAuth(true)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(audioEngine.toggleMute())}
        />
      ) : (
        <>
          {/* Top HUD */}
          <HUD
            stats={stats}
            nextQueue={nextQueue}
            holdPiece={holdPiece}
            user={user}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(audioEngine.toggleMute())}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenAuth={() => setShowAuth(true)}
            onActivateZeroG={handleActivateZeroG}
            onReturnHome={() => setCurrentView('HOME')}
          />

          {/* Bottom Control Bar */}
          <ControlBar
            onRotate={handleRotate}
            onMove={(dx, dy, dz) => {
              if (dx < 0) handleRelativeMove('LEFT');
              else if (dx > 0) handleRelativeMove('RIGHT');
              else if (dz < 0) handleRelativeMove('IN');
              else if (dz > 0) handleRelativeMove('OUT');
            }}
            onHardDrop={handleHardDrop}
            onHold={handleHold}
            cameraPreset={cameraPreset}
            onSetCameraPreset={setCameraPreset}
          />
        </>
      )}

      {/* Modals */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        user={user}
      />

      <GameOverModal
        isOpen={isGameOver}
        stats={stats}
        user={user}
        onRestart={handleStartGame}
        onOpenAuth={() => {
          setIsGameOver(false);
          setShowAuth(true);
        }}
      />

      {/* MANDATORY FOOTER */}
      <footer className="absolute bottom-0 left-0 w-full z-30 py-1 bg-black/95 border-t border-black text-center text-[10px] font-orbitron uppercase tracking-widest text-slate-400">
        <a 
          href="https://jordankatz.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-cyan-400 transition-colors"
        >
          a Jordan Katz project
        </a>
      </footer>
    </div>
  );
}

export default App;
