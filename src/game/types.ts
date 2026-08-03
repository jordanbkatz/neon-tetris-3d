export const GRID_SIZE = {
  X: 10,
  Y: 14,
  Z: 10
};

export type BlockType = 'I' | 'T' | 'L' | 'Z' | 'CUBE' | 'CORNER' | 'CROSS' | 'CORRUPTION' | 'CORE_POWERUP';

export interface BlockCell {
  x: number;
  y: number;
  z: number;
  color: string;
  isCorruption?: boolean;
  isPowerup?: boolean;
}

export interface PieceShape {
  type: BlockType;
  cells: { x: number; y: number; z: number }[];
  color: string;
  glowColor: string;
}

export interface ActivePiece {
  type: BlockType;
  cells: { x: number; y: number; z: number }[];
  color: string;
  glowColor: string;
  x: number; // grid position
  y: number; // grid position
  z: number; // grid position
  isPowerup?: boolean;
}

export type GridCell = {
  filled: boolean;
  color: string;
  isCorruption?: boolean;
} | null;

export type CameraPreset = 'DEFAULT' | 'TOP_DOWN' | 'SIDE_PROFILE' | 'DYNAMIC_ORBIT';

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  battery: number;
  isZeroG: boolean;
  zeroGTimer: number;
  maxCombo: number;
}

export type FallSpeed = 'SLOW' | 'NORMAL' | 'FAST' | 'HYPER';

export interface GameSettings {
  baseSize: number;
  speed: FallSpeed;
}

export interface PersonalStats {
  highScore: number;
  totalLinesCleared: number;
  totalGamesPlayed: number;
  maxLevel: number;
}

