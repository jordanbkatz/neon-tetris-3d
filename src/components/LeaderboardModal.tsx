import React, { useEffect, useState } from 'react';
import { subscribeToLeaderboard, LeaderboardEntry } from '../firebase/firestore';
import { X, Trophy, Award } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    const unsubscribe = subscribeToLeaderboard((data) => {
      setEntries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="cyber-panel-magenta max-w-2xl w-full rounded-2xl p-6 relative border border-magenta-500/50 shadow-[0_0_50px_rgba(255,0,127,0.3)] max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-magenta-500/30 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400 animate-pulse" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-orbitron text-white glow-magenta">
                LEADERBOARD
              </h2>
              <p className="text-xs text-magenta-300 font-rajdhani">
                GLOBAL HIGH SCORES & TOP PLAYERS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-cyan-400 font-orbitron animate-pulse">
              LOADING LEADERBOARD SCORES...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-orbitron">
              NO HIGH SCORES YET. SIGN IN AND PLAY TO BE THE FIRST!
            </div>
          ) : (
            entries.map((entry, index) => {
              const isTop3 = index < 3;
              const rankColor = index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500';

              return (
                <div
                  key={entry.id || index}
                  className={`p-3 rounded-lg flex items-center justify-between border transition-all ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-950/40 border-yellow-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-magenta-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`font-orbitron font-bold text-lg w-8 text-center ${rankColor}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-white text-sm sm:text-base flex items-center gap-2">
                        {entry.playerName}
                        {isTop3 && <Award className={`w-4 h-4 ${rankColor}`} />}
                      </div>
                      <div className="text-[10px] text-slate-400 flex gap-3">
                        <span>LEVEL {entry.level}</span>
                        <span>LINES: {entry.linesCleared}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-orbitron font-bold text-cyan-400 glow-cyan text-base sm:text-lg">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">PTS</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-magenta-500/20 text-center">
          <p className="text-[11px] text-slate-400 font-rajdhani">
            Sign in to submit your high scores to the global leaderboard.
          </p>
        </div>

      </div>
    </div>
  );
};
