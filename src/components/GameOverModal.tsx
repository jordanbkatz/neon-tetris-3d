import React, { useState } from 'react';
import { GameStats } from '../game/types';
import { submitScore } from '../firebase/firestore';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Send, AlertTriangle, LogIn } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  user: User | null;
  onRestart: () => void;
  onOpenAuth: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  user,
  onRestart,
  onOpenAuth
}) => {
  const [playerName, setPlayerName] = useState(user?.displayName || (user?.email ? user.email.split('@')[0] : 'PLAYER'));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const isSignedIn = user && !user.isAnonymous;

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || submitted || submitting) return;

    setSubmitting(true);
    try {
      await submitScore({
        userId: user.uid,
        playerName: playerName.trim() || 'PLAYER',
        score: stats.score,
        level: stats.level,
        linesCleared: stats.lines,
        maxSurge: stats.maxCombo || 1
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit highscore:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div className="cyber-panel-magenta max-w-md w-full rounded-2xl p-6 relative border border-magenta-500/60 shadow-[0_0_60px_rgba(255,0,127,0.4)] text-center">
        
        {/* Header */}
        <div className="flex justify-center mb-2">
          <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-orbitron text-white glow-magenta tracking-wider mb-1">
          GAME OVER
        </h2>
        <p className="text-xs text-magenta-300 font-rajdhani mb-6">
          THE GRID HAS FILLED UP
        </p>

        {/* Stats Summary Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-magenta-500/30 mb-6 space-y-3">
          <div>
            <div className="text-[10px] text-magenta-400 font-orbitron">FINAL SCORE</div>
            <div className="text-3xl font-bold font-orbitron text-white glow-cyan mt-0.5">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div>
              <div className="text-slate-400 font-orbitron text-[9px]">LEVEL</div>
              <div className="font-bold font-orbitron text-white text-sm">{stats.level}</div>
            </div>
            <div>
              <div className="text-slate-400 font-orbitron text-[9px]">LINES</div>
              <div className="font-bold font-orbitron text-white text-sm">{stats.lines}</div>
            </div>
            <div>
              <div className="text-slate-400 font-orbitron text-[9px]">MAX COMBO</div>
              <div className="font-bold font-orbitron text-yellow-400 text-sm">{stats.maxCombo}x</div>
            </div>
          </div>
        </div>

        {/* High Score Submission Section */}
        {isSignedIn ? (
          !submitted ? (
            <form onSubmit={handleSubmitScore} className="mb-6 space-y-3">
              <div className="text-left">
                <label className="block text-[10px] font-orbitron text-cyan-400 mb-1">
                  ENTER PLAYER NAME FOR LEADERBOARD:
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-white font-orbitron text-sm focus:outline-none focus:border-cyan-400"
                  placeholder="PLAYER NAME"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-orbitron font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" /> SUBMIT SCORE TO LEADERBOARD
              </button>
            </form>
          ) : (
            <div className="p-3 mb-6 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-orbitron flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              SCORE RECORDED ON LEADERBOARD!
            </div>
          )
        ) : (
          <div className="p-4 mb-6 rounded-xl bg-slate-900/90 border border-amber-500/40 text-center space-y-2">
            <div className="text-xs text-amber-300 font-orbitron font-bold flex items-center justify-center gap-1.5">
              <LogIn className="w-4 h-4" /> SIGN IN TO SAVE YOUR SCORE
            </div>
            <p className="text-[11px] text-slate-300 font-rajdhani">
              Scores are only saved to the leaderboard when signed in to an account.
            </p>
            <button
              onClick={onOpenAuth}
              className="mt-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-orbitron font-bold text-xs cursor-pointer shadow transition-all"
            >
              SIGN IN NOW
            </button>
          </div>
        )}

        {/* Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-orbitron font-bold text-sm flex items-center justify-center gap-2 glow-cyan cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> PLAY AGAIN
        </button>

      </div>
    </div>
  );
};
