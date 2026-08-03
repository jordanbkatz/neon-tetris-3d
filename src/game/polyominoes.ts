import { GRID_SIZE, BlockType, PieceShape, ActivePiece, GridCell } from './types';

export const POLYOMINO_SHAPES: PieceShape[] = [
  // I-Piece 3D (Cyan) - 4 cells
  {
    type: 'I',
    color: '#00f3ff',
    glowColor: '#00f3ff',
    cells: [
      { x: 0, y: 0, z: -1 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 2 }
    ]
  },
  // T-Piece 3D (Magenta) - 4 cells
  {
    type: 'T',
    color: '#ff007f',
    glowColor: '#ff007f',
    cells: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 }
    ]
  },
  // L-Piece 3D (Orange) - 4 cells
  {
    type: 'L',
    color: '#ff6600',
    glowColor: '#ff6600',
    cells: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 2, z: 0 },
      { x: 1, y: 0, z: 0 }
    ]
  },
  // Z-Piece 3D (Lime) - 4 cells
  {
    type: 'Z',
    color: '#10b981',
    glowColor: '#10b981',
    cells: [
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 }
    ]
  },
  // Cube 2x2x1 (Yellow) - 4 cells
  {
    type: 'CUBE',
    color: '#f59e0b',
    glowColor: '#f59e0b',
    cells: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 1, z: 0 }
    ]
  },
  // Corner 3D 2x2x2 (Purple) - 4 cells
  {
    type: 'CORNER',
    color: '#8b5cf6',
    glowColor: '#8b5cf6',
    cells: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 0, y: 0, z: 1 }
    ]
  },
  // Cross 3D (Pink) - 5 cells
  {
    type: 'CROSS',
    color: '#ec4899',
    glowColor: '#ec4899',
    cells: [
      { x: 0, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
      { x: 0, y: 0, z: 1 }
    ]
  }
];

export function getRandomPiece(level: number = 1): ActivePiece {
  const template = POLYOMINO_SHAPES[Math.floor(Math.random() * POLYOMINO_SHAPES.length)];
  return {
    type: template.type,
    color: template.color,
    glowColor: template.glowColor,
    cells: template.cells.map(c => ({ ...c })),
    x: Math.floor(GRID_SIZE.X / 2),
    y: GRID_SIZE.Y - 3,
    z: Math.floor(GRID_SIZE.Z / 2)
  };
}

export function rotatePiece(piece: ActivePiece, axis: 'X' | 'Y' | 'Z'): ActivePiece {
  const newCells = piece.cells.map(cell => {
    let { x, y, z } = cell;
    if (axis === 'X') {
      const ny = -z;
      const nz = y;
      y = ny;
      z = nz;
    } else if (axis === 'Y') {
      const nx = z;
      const nz = -x;
      x = nx;
      z = nz;
    } else if (axis === 'Z') {
      const nx = -y;
      const ny = x;
      x = nx;
      y = ny;
    }
    return { x, y, z };
  });

  return {
    ...piece,
    cells: newCells
  };
}

export function checkCollision(piece: ActivePiece, grid: (GridCell)[][][], offsetX = 0, offsetY = 0, offsetZ = 0): boolean {
  for (const cell of piece.cells) {
    const gx = piece.x + cell.x + offsetX;
    const gy = piece.y + cell.y + offsetY;
    const gz = piece.z + cell.z + offsetZ;

    if (gx < 0 || gx >= GRID_SIZE.X || gz < 0 || gz >= GRID_SIZE.Z || gy < 0) {
      return true;
    }
    if (gy >= GRID_SIZE.Y) {
      continue;
    }

    if (grid[gx][gy][gz] !== null && grid[gx][gy][gz]?.filled) {
      return true;
    }
  }
  return false;
}

export function getGhostPieceY(piece: ActivePiece, grid: (GridCell)[][][]): number {
  let dropY = 0;
  while (!checkCollision(piece, grid, 0, dropY - 1, 0)) {
    dropY--;
  }
  return piece.y + dropY;
}

export function createEmptyGrid(): (GridCell)[][][] {
  const grid: (GridCell)[][][] = [];
  for (let x = 0; x < GRID_SIZE.X; x++) {
    grid[x] = [];
    for (let y = 0; y < GRID_SIZE.Y; y++) {
      grid[x][y] = [];
      for (let z = 0; z < GRID_SIZE.Z; z++) {
        grid[x][y][z] = null;
      }
    }
  }
  return grid;
}

export function generateCorruptionBlocks(grid: (GridCell)[][][], count: number = 2) {
  let added = 0;
  let attempts = 0;
  while (added < count && attempts < 50) {
    attempts++;
    const rx = Math.floor(Math.random() * GRID_SIZE.X);
    const ry = Math.floor(Math.random() * 3);
    const rz = Math.floor(Math.random() * GRID_SIZE.Z);
    if (!grid[rx][ry][rz]) {
      grid[rx][ry][rz] = {
        filled: true,
        color: '#7c3aed',
        isCorruption: true
      };
      added++;
    }
  }
}
