import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from '../firebase/config';
import { X, UserCheck, ShieldAlert, LogOut, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, user }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="cyber-panel max-w-md w-full rounded-2xl p-6 relative border border-cyan-500/50 shadow-[0_0_40px_rgba(0,243,255,0.25)]">
        
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold font-orbitron text-white glow-cyan">
              PLAYER ACCOUNT
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {user && !user.isAnonymous ? (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30">
              <div className="text-xs text-cyan-400 font-orbitron">SIGNED IN ACCOUNT</div>
              <div className="text-lg font-bold font-orbitron text-white mt-1">
                {user.displayName || user.email}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">UID: {user.uid}</div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-orbitron text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> SIGN OUT
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <p className="text-xs text-slate-300 font-rajdhani">
              Sign in to save your high scores to the global leaderboard!
            </p>

            {/* Google Sign In Option */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-orbitron font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              SIGN IN WITH GOOGLE
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] text-slate-500 font-orbitron">OR</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-[10px] font-orbitron text-slate-400 mb-1">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-orbitron text-xs focus:outline-none focus:border-cyan-400"
                    placeholder="player@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-orbitron text-slate-400 mb-1">PASSWORD</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-orbitron text-xs focus:outline-none focus:border-cyan-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-orbitron font-bold text-xs flex items-center justify-center gap-2 shadow-lg glow-cyan cursor-pointer active:scale-95 transition-all"
              >
                {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN WITH EMAIL'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-cyan-400 hover:underline font-rajdhani cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
