import React from 'react';
import { GameStats, ActivePiece } from '../game/types';
import { Volume2, VolumeX, Trophy, User as UserIcon, Zap, Home } from 'lucide-react';
import { User } from 'firebase/auth';

interface HUDProps {
  stats: GameStats;
  nextQueue: ActivePiece[];
  holdPiece: ActivePiece | null;
  user: User | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onActivateZeroG: () => void;
  onReturnHome: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  nextQueue,
  holdPiece,
  user,
  isMuted,
  onToggleMute,
  onOpenLeaderboard,
  onOpenAuth,
  onActivateZeroG,
  onReturnHome
}) => {
  const isSignedIn = user && !user.isAnonymous;

  return (
    <div className="absolute top-0 left-0 w-full z-20 p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* Sleek Minimalist Stats */}
        <div className="cyber-panel px-4 py-2 rounded-full flex items-center gap-4 sm:gap-6 border-cyan-500/30">
          <button
            onClick={onReturnHome}
            className="p-1 rounded-full hover:bg-cyan-950/80 text-cyan-400 hover:text-white transition-colors cursor-pointer"
            title="Return to Home Screen"
          >
            <Home className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-cyan-900/40" />

          <div>
            <span className="text-[9px] text-cyan-400 font-orbitron tracking-widest mr-2">LVL</span>
            <span className="text-lg font-bold text-white font-orbitron">{stats.level}</span>
          </div>

          <div className="h-4 w-px bg-cyan-900/40" />

          <div>
            <span className="text-[9px] text-cyan-400 font-orbitron tracking-widest mr-2">LINES</span>
            <span className="text-lg font-bold text-white font-orbitron">{stats.lines}</span>
          </div>

          <div className="h-4 w-px bg-cyan-900/40" />

          <div>
            <span className="text-[9px] text-magenta-400 font-orbitron tracking-widest mr-2">SCORE</span>
            <span className="text-lg font-bold text-magenta-400 font-orbitron glow-magenta">
              {stats.score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Minimalist Queue / Hold / Actions */}
        <div className="flex items-center gap-3">
          
          {/* Hold & Next Mini Indicators */}
          <div className="cyber-panel px-3 py-1.5 rounded-full hidden sm:flex items-center gap-3 text-xs font-orbitron">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400">HOLD</span>
              <span className="font-bold" style={{ color: holdPiece?.color || '#475569' }}>
                {holdPiece ? holdPiece.type : '-'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400">NEXT</span>
              <span className="font-bold" style={{ color: nextQueue[0]?.color || '#00f3ff' }}>
                {nextQueue[0] ? nextQueue[0].type : '-'}
              </span>
            </div>
          </div>

          {/* Zero-G Pill */}
          <button
            onClick={onActivateZeroG}
            disabled={stats.battery < 100 || stats.isZeroG}
            className={`px-3 py-1.5 rounded-full border text-xs font-orbitron flex items-center gap-1 transition-all cursor-pointer ${
              stats.battery >= 100 && !stats.isZeroG
                ? 'bg-yellow-500 text-black border-yellow-300 font-bold animate-pulse'
                : 'cyber-panel text-slate-400 border-slate-700 opacity-80 cursor-not-allowed'
            }`}
          >
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>{stats.isZeroG ? 'ZERO-G' : `${Math.round(stats.battery)}%`}</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-full cyber-panel hover:border-cyan-400 text-cyan-400 transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="p-2 rounded-full cyber-panel hover:border-yellow-400 text-yellow-400 transition-colors cursor-pointer"
              title="Leaderboard"
            >
              <Trophy className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAuth}
              className={`p-2 rounded-full cyber-panel transition-colors cursor-pointer ${
                isSignedIn ? 'hover:border-emerald-400 text-emerald-400' : 'hover:border-magenta-400 text-magenta-400'
              }`}
              title={isSignedIn ? `Signed in as ${user.displayName || user.email}` : "Sign In"}
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
