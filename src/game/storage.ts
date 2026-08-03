import { GameSettings, PersonalStats } from './types';

const STATS_KEY = 'neon-tetris-3d_personal_stats';
const SETTINGS_KEY = 'neon-tetris-3d_game_settings';

export const DEFAULT_SETTINGS: GameSettings = {
  baseSize: 5,
  speed: 'NORMAL'
};

export const DEFAULT_STATS: PersonalStats = {
  highScore: 0,
  totalLinesCleared: 0,
  totalGamesPlayed: 0,
  maxLevel: 1
};

export function getPersonalStats(): PersonalStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return { ...DEFAULT_STATS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to read personal stats:', err);
  }
  return DEFAULT_STATS;
}

export function saveGameResult(score: number, lines: number, level: number): { isNewRecord: boolean; newStats: PersonalStats } {
  const current = getPersonalStats();
  const isNewRecord = score > current.highScore;
  const updated: PersonalStats = {
    highScore: Math.max(current.highScore, score),
    totalLinesCleared: current.totalLinesCleared + lines,
    totalGamesPlayed: current.totalGamesPlayed + 1,
    maxLevel: Math.max(current.maxLevel, level)
  };

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save personal stats:', err);
  }

  return { isNewRecord, newStats: updated };
}

export function getGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to read settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
