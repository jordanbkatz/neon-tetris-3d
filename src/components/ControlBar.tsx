import React, { useState } from 'react';
import { GameStats, CameraPreset } from '../game/types';
import { RotateCw, ArrowDown, Camera, HelpCircle, X } from 'lucide-react';

interface ControlBarProps {
  onRotate: (axis: 'X' | 'Y' | 'Z') => void;
  onMove: (dx: number, dy: number, dz: number) => void;
  onHardDrop: () => void;
  onHold: () => void;
  cameraPreset: CameraPreset;
  onSetCameraPreset: (preset: CameraPreset) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onRotate,
  onMove,
  onHardDrop,
  onHold,
  cameraPreset,
  onSetCameraPreset
}) => {
  const [showKeybindHelp, setShowKeybindHelp] = useState(false);

  return (
    <div className="absolute bottom-8 left-0 w-full z-20 px-4 pointer-events-none">
      {/* Keybind Help Modal */}
      {showKeybindHelp && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="cyber-panel max-w-lg w-full rounded-2xl p-6 relative border border-cyan-500/50 shadow-[0_0_40px_rgba(0,243,255,0.25)] text-left">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
              <h3 className="text-lg font-bold font-orbitron text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                GAME CONTROLS & KEYBINDS
              </h3>
              <button
                onClick={() => setShowKeybindHelp(false)}
                className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-rajdhani text-slate-200">
              {/* Perspective Controls Highlight */}
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/50 space-y-2">
                <div className="font-orbitron font-bold text-cyan-400 text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4" /> CAMERA & PERSPECTIVE KEYBINDS
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-mono bg-cyan-900/80 px-2 py-0.5 rounded text-cyan-200 font-bold border border-cyan-500/40">C</span>
                    <span className="ml-2">Cycle View Presets</span>
                  </div>
                  <div>
                    <span className="font-mono bg-cyan-900/80 px-2 py-0.5 rounded text-cyan-200 font-bold border border-cyan-500/40">Mouse Drag</span>
                    <span className="ml-2">Rotate Perspective Orbit</span>
                  </div>
                  <div>
                    <span className="font-mono bg-cyan-900/80 px-2 py-0.5 rounded text-cyan-200 font-bold border border-cyan-500/40">Z + Drag</span>
                    <span className="ml-2">Pan Vertical Height</span>
                  </div>
                  <div>
                    <span className="font-mono bg-cyan-900/80 px-2 py-0.5 rounded text-cyan-200 font-bold border border-cyan-500/40">X + Drag</span>
                    <span className="ml-2">Pan Horizontal Plane</span>
                  </div>
                  <div>
                    <span className="font-mono bg-cyan-900/80 px-2 py-0.5 rounded text-cyan-200 font-bold border border-cyan-500/40">Pinch / Wheel</span>
                    <span className="ml-2">Zoom In / Out</span>
                  </div>
                </div>
              </div>

              {/* Movement & Rotation Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="font-orbitron font-bold text-magenta-400 text-xs">PIECE ROTATION</div>
                  <div><span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white font-bold">W / S</span> Pitch (X-Axis)</div>
                  <div><span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white font-bold">A / D</span> Yaw (Y-Axis)</div>
                  <div><span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white font-bold">Q / E</span> Roll (Z-Axis)</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="font-orbitron font-bold text-yellow-400 text-xs">MOVEMENT & ACTIONS</div>
                  <div><span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white font-bold">Arrow Keys</span> Camera-Relative Move</div>
                  <div><span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white font-bold">Spacebar</span> Hard Drop</div>
                  <div><span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-white font-bold">Shift</span> Hold Piece</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-cyan-500/20 text-center">
              <button
                onClick={() => setShowKeybindHelp(false)}
                className="px-6 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-orbitron font-bold text-xs cursor-pointer"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto cyber-panel px-4 py-2.5 rounded-full flex items-center justify-between gap-3 pointer-events-auto shadow-2xl border border-cyan-500/30">
        
        {/* Rotations */}
        <div className="flex items-center gap-1.5 text-xs font-orbitron">
          <span className="text-[10px] text-cyan-400 font-bold mr-1 hidden sm:inline">ROTATE:</span>
          <button
            onClick={() => onRotate('X')}
            className="px-2.5 py-1 rounded-full bg-cyan-950/50 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 active:scale-95 transition-all cursor-pointer"
            title="Pitch [W / S]"
          >
            PITCH [W/S]
          </button>
          <button
            onClick={() => onRotate('Y')}
            className="px-2.5 py-1 rounded-full bg-cyan-950/50 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 active:scale-95 transition-all cursor-pointer"
            title="Yaw [A / D]"
          >
            YAW [A/D]
          </button>
          <button
            onClick={() => onRotate('Z')}
            className="px-2.5 py-1 rounded-full bg-cyan-950/50 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 active:scale-95 transition-all cursor-pointer"
            title="Roll [Q / E]"
          >
            ROLL [Q/E]
          </button>
        </div>

        {/* View Presets & Perspective Help */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-cyan-400 font-bold mr-0.5 hidden md:inline">CAMERA [C]:</span>
          {(['DEFAULT', 'TOP_DOWN', 'DYNAMIC_ORBIT'] as CameraPreset[]).map(preset => (
            <button
              key={preset}
              onClick={() => onSetCameraPreset(preset)}
              className={`px-2.5 py-1 rounded-full text-[9px] font-orbitron transition-all cursor-pointer ${
                cameraPreset === preset
                  ? 'bg-magenta-600 text-white font-bold shadow-[0_0_10px_#ff007f]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
              title={`Switch camera view [Shortcut: C key] (${preset})`}
            >
              {preset === 'TOP_DOWN' ? 'TOP' : preset === 'DYNAMIC_ORBIT' ? 'ORBIT' : 'DEFAULT'}
            </button>
          ))}

          <button
            onClick={() => setShowKeybindHelp(true)}
            className="p-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-cyan-100 transition-colors cursor-pointer"
            title="View Camera & Keybind Controls"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onHold}
            className="px-3 py-1 rounded-full bg-amber-950/50 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-orbitron font-bold active:scale-95 cursor-pointer"
            title="Hold Piece [Shift]"
          >
            HOLD
          </button>
          <button
            onClick={onHardDrop}
            className="px-3.5 py-1 rounded-full bg-gradient-to-r from-magenta-600 to-pink-500 text-white text-xs font-orbitron font-bold glow-magenta shadow-md active:scale-95 flex items-center gap-1 cursor-pointer"
            title="Hard Drop [Space]"
          >
            <ArrowDown className="w-3 h-3" /> DROP
          </button>
        </div>

      </div>
    </div>
  );
};
