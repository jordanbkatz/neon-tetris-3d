import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './config';

export interface LeaderboardEntry {
  id?: string;
  userId: string;
  playerName: string;
  score: number;
  level: number;
  linesCleared: number;
  maxSurge: number;
  timestamp?: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  highScore: number;
  totalLinesCleared: number;
  totalGamesPlayed: number;
  unlockedSkins: string[];
}

const LEADERBOARD_COLLECTION = 'neon-tetris-3d_leaderboard';
const USERS_COLLECTION = 'neon-tetris-3d_users';

// Initial fallback mock data if Firestore has 0 entries
const INITIAL_MOCK_LEADERBOARD: Omit<LeaderboardEntry, 'id'>[] = [
  { userId: 'mock1', playerName: 'NEO-RUNNER', score: 2100000, level: 18, linesCleared: 154, maxSurge: 5 },
  { userId: 'mock2', playerName: 'DATA-SLICER', score: 1850000, level: 16, linesCleared: 132, maxSurge: 4 },
  { userId: 'mock3', playerName: 'CYBER-PHANTOM', score: 1420500, level: 14, linesCleared: 110, maxSurge: 4 },
  { userId: 'mock4', playerName: 'GRID-SURGER', score: 1180000, level: 12, linesCleared: 95, maxSurge: 4 },
  { userId: 'mock5', playerName: 'SYNTH-WAVE', score: 940000, level: 10, linesCleared: 78, maxSurge: 3 }
];

export async function submitScore(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const colRef = collection(db, LEADERBOARD_COLLECTION);
    await addDoc(colRef, {
      ...entry,
      timestamp: serverTimestamp()
    });

    // Also update user profile high score if logged in
    if (entry.userId && entry.userId !== 'guest') {
      const userRef = doc(db, USERS_COLLECTION, entry.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const newHighScore = Math.max(data.highScore || 0, entry.score);
        await updateDoc(userRef, {
          highScore: newHighScore,
          totalLinesCleared: (data.totalLinesCleared || 0) + entry.linesCleared,
          totalGamesPlayed: (data.totalGamesPlayed || 0) + 1
        });
      } else {
        await setDoc(userRef, {
          uid: entry.userId,
          displayName: entry.playerName,
          highScore: entry.score,
          totalLinesCleared: entry.linesCleared,
          totalGamesPlayed: 1,
          unlockedSkins: ['neon_default']
        });
      }
    }
  } catch (err) {
    console.error('Failed to submit score to Firestore:', err);
  }
}

export function subscribeToLeaderboard(callback: (entries: LeaderboardEntry[]) => void) {
  const colRef = collection(db, LEADERBOARD_COLLECTION);
  const q = query(colRef, orderBy('score', 'desc'), limit(10));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_MOCK_LEADERBOARD.map((item, idx) => ({ ...item, id: `mock-${idx}` })));
    } else {
      const list: LeaderboardEntry[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as LeaderboardEntry) });
      });
      callback(list);
    }
  }, (err) => {
    console.warn('Firestore subscription fallback to mock data:', err);
    callback(INITIAL_MOCK_LEADERBOARD.map((item, idx) => ({ ...item, id: `mock-${idx}` })));
  });
}
