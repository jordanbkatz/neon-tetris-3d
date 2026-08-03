import React, { useEffect, useState } from 'react';
import { Play, Trophy, User as UserIcon, HelpCircle, Volume2, VolumeX, Camera } from 'lucide-react';
import { User } from 'firebase/auth';
import { subscribeToLeaderboard, LeaderboardEntry } from '../firebase/firestore';

interface HomePageProps {
  user: User | null;
  onStartGame: () => void;
  onOpenAuth: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  onStartGame,
  onOpenAuth,
  isMuted,
  onToggleMute
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToLeaderboard((data) => {
      setLeaderboard(data.slice(0, 5));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isSignedIn = user && !user.isAnonymous;

  return (
    <div className="relative z-20 w-full min-h-screen flex flex-col items-center justify-between p-4 md:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
      
      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <h1 className="text-xl md:text-2xl font-black font-orbitron text-white tracking-wider glow-cyan">
            NEON 3D TETRIS
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl cyber-panel hover:border-cyan-400 text-cyan-400 transition-colors cursor-pointer"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenAuth}
            className="px-4 py-2 rounded-xl cyber-panel hover:border-magenta-400 text-white font-orbitron text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserIcon className="w-4 h-4 text-magenta-400" />
            {isSignedIn ? (user.displayName || user.email?.split('@')[0] || 'ACCOUNT') : 'SIGN IN'}
          </button>
        </div>
      </header>

      {/* Main Hero & Content Grid */}
      <main className="w-full max-w-5xl my-auto py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Title & CTA */}
        <div className="md:col-span-7 space-y-6 text-left">
          <div className="inline-block px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-orbitron text-xs font-semibold">
            3D BLOCK STACKING ACTION
          </div>

          <h2 className="text-4xl md:text-6xl font-black font-orbitron text-white leading-tight tracking-tight">
            STACK, ROTATE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-magenta-400 to-yellow-400 glow-magenta">
              & CLEAR ROWS
            </span>
          </h2>

          <p className="text-sm md:text-base font-rajdhani text-slate-300 max-w-xl leading-relaxed">
            Experience classic Tetris expanded into full 3D space. Rotate shapes along all 3 axes, score points for placing bricks and clearing complete 10x10 layers!
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStartGame}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-magenta-600 hover:from-cyan-400 hover:to-magenta-500 text-white font-orbitron font-black text-lg tracking-wider flex items-center gap-3 shadow-[0_0_30px_rgba(0,243,255,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" /> PLAY NOW
            </button>

            {!isSignedIn && (
              <button
                onClick={onOpenAuth}
                className="px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-200 font-orbitron font-bold text-sm transition-all cursor-pointer"
              >
                SIGN IN TO SAVE SCORES
              </button>
            )}
          </div>

          {/* Quick Keybind Guide Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs font-rajdhani text-slate-300">
            <div className="font-orbitron font-bold text-cyan-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4" /> PERSPECTIVE & CAMERA CONTROLS
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
              <div><strong className="text-white font-mono">Press C:</strong> Cycle Camera Views</div>
              <div><strong className="text-white font-mono">Mouse Drag:</strong> Rotate Perspective</div>
              <div><strong className="text-white font-mono">Z + Drag:</strong> Pan Camera Height</div>
              <div><strong className="text-white font-mono">X + Drag:</strong> Pan Base Plane</div>
            </div>
          </div>
        </div>

        {/* Right Column: Embedded Leaderboard */}
        <div className="md:col-span-5 w-full">
          <div className="cyber-panel-magenta rounded-2xl p-5 border border-magenta-500/40 shadow-[0_0_40px_rgba(255,0,127,0.2)]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-magenta-500/30">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                <h3 className="font-orbitron font-bold text-white text-base">LEADERBOARD</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-orbitron">TOP PLAYERS</span>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="py-8 text-center text-cyan-400 font-orbitron text-xs animate-pulse">
                  LOADING LEADERBOARD...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-orbitron text-xs">
                  NO SCORES YET. SIGN IN AND START A GAME!
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.id || index}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`font-orbitron font-bold w-5 text-center ${
                        index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <div className="font-orbitron font-bold text-white text-xs truncate max-w-[120px]">
                          {entry.playerName}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          LVL {entry.level} • {entry.linesCleared} lines
                        </div>
                      </div>
                    </div>
                    <div className="font-orbitron font-bold text-cyan-400 text-sm">
                      {entry.score.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-400 font-rajdhani">
                Sign in to save your score to the global leaderboard.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Spacer for bottom footer */}
      <div className="h-6" />
    </div>
  );
};
