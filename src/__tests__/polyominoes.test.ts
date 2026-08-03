import { POLYOMINO_SHAPES, getRandomPiece, rotatePiece, createEmptyGrid, checkCollision } from '../game/polyominoes';
import { GRID_SIZE } from '../game/types';

describe('neon-tetris-3d polyominoes logic', () => {
  test('POLYOMINO_SHAPES contains expected shapes', () => {
    expect(POLYOMINO_SHAPES.length).toBeGreaterThan(0);
    const types = POLYOMINO_SHAPES.map((s) => s.type);
    expect(types).toContain('I');
    expect(types).toContain('T');
  });

  test('createEmptyGrid creates grid matching GRID_SIZE dimensions', () => {
    const grid = createEmptyGrid();
    expect(grid.length).toBe(GRID_SIZE.X);
    expect(grid[0].length).toBe(GRID_SIZE.Y);
    expect(grid[0][0].length).toBe(GRID_SIZE.Z);
  });

  test('getRandomPiece returns piece within grid boundaries', () => {
    const piece = getRandomPiece();
    expect(piece.x).toBe(Math.floor(GRID_SIZE.X / 2));
    expect(piece.y).toBe(GRID_SIZE.Y - 3);
  });

  test('rotatePiece rotates cells around specified axis', () => {
    const piece = getRandomPiece();
    const rotated = rotatePiece(piece, 'Y');
    expect(rotated.cells).not.toEqual(piece.cells);
  });

  test('checkCollision detects boundary collisons', () => {
    const grid = createEmptyGrid();
    const piece = getRandomPiece();
    // Out of bounds below grid bottom
    expect(checkCollision(piece, grid, 0, -100, 0)).toBe(true);
    // Safe position
    expect(checkCollision(piece, grid, 0, 0, 0)).toBe(false);
  });
});
