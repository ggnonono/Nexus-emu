import React, { useRef, useState, useEffect, useCallback } from 'react';
import { SystemId, ControllerMapping } from '../types';
import { triggerHaptic } from '../utils/audioEffects';

interface TouchGamepadProps {
  systemId: SystemId;
  config: ControllerMapping;
  onButtonDown: (btn: string) => void;
  onButtonUp: (btn: string) => void;
  onStickMove: (x: number, y: number) => void;
}

export const TouchGamepad: React.FC<TouchGamepadProps> = ({
  systemId,
  config,
  onButtonDown,
  onButtonUp,
  onStickMove
}) => {
  const stickRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isDraggingStick, setIsDraggingStick] = useState(false);
  const [activeTouches, setActiveTouches] = useState<Record<string, boolean>>({});

  const handleStickStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDraggingStick(true);
    updateStickPos(e);
  };

  const updateStickPos = useCallback((e: React.TouchEvent | React.MouseEvent | TouchEvent | MouseEvent) => {
    if (!stickRef.current) return;
    const rect = stickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      // find touch near stick
      let closest = e.touches[0];
      let minDst = 9999;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const dist = Math.hypot(t.clientX - centerX, t.clientY - centerY);
        if (dist < minDst) {
          minDst = dist;
          closest = t;
        }
      }
      clientX = closest.clientX;
      clientY = closest.clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const maxRadius = rect.width * 0.38;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(dist, maxRadius);
    const nx = Math.cos(angle) * (clampedDist / maxRadius);
    const ny = Math.sin(angle) * (clampedDist / maxRadius);

    setStickPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist
    });

    onStickMove(nx, ny);
  }, [onStickMove]);

  const handleStickEnd = useCallback(() => {
    setIsDraggingStick(false);
    setStickPos({ x: 0, y: 0 });
    onStickMove(0, 0);
  }, [onStickMove]);

  useEffect(() => {
    if (!isDraggingStick) return;
    const onMove = (e: TouchEvent | MouseEvent) => updateStickPos(e);
    const onEnd = () => handleStickEnd();
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    return () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
    };
  }, [isDraggingStick, updateStickPos, handleStickEnd]);

  const handleBtnPress = (btnName: string) => {
    if (config.touchHaptics) triggerHaptic(15);
    setActiveTouches((prev) => ({ ...prev, [btnName]: true }));
    onButtonDown(btnName);
  };

  const handleBtnRelease = (btnName: string) => {
    setActiveTouches((prev) => ({ ...prev, [btnName]: false }));
    onButtonUp(btnName);
  };

  const isPlayStation = systemId === 'psp' || systemId === 'ps1' || systemId === 'ps2';
  const isNintendo = systemId === 'nds' || systemId === 'gba' || systemId === 'snes' || systemId === 'gc' || systemId === 'n64';

  const opacityStyle = { opacity: config.touchOpacity };

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-3 md:p-6 overflow-hidden"
      style={opacityStyle}
    >
      {/* Top Shoulder Buttons (L1/R1 / L2/R2) */}
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex gap-2 pointer-events-auto">
          {(systemId === 'ps1' || systemId === 'ps2') && (
            <button
              id="btn-touch-l2"
              onMouseDown={() => handleBtnPress('L2')}
              onMouseUp={() => handleBtnRelease('L2')}
              onTouchStart={() => handleBtnPress('L2')}
              onTouchEnd={() => handleBtnRelease('L2')}
              className={`w-14 h-9 rounded-xl border font-mono font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md flex items-center justify-center backdrop-blur-md ${
                activeTouches['L2'] ? 'bg-blue-600/70 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/40 border-white/20 text-white/70'
              }`}
            >
              L2
            </button>
          )}
          <button
            id="btn-touch-l1"
            onMouseDown={() => handleBtnPress('L1')}
            onMouseUp={() => handleBtnRelease('L1')}
            onTouchStart={() => handleBtnPress('L1')}
            onTouchEnd={() => handleBtnRelease('L1')}
            className={`w-16 h-10 rounded-xl border font-mono font-bold text-sm uppercase tracking-wider transition-transform active:scale-95 shadow-lg flex items-center justify-center backdrop-blur-md ${
              activeTouches['L1'] ? 'bg-blue-600/70 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/40 border-white/20 text-white/80'
            }`}
          >
            {isNintendo && systemId !== 'gc' ? 'L' : 'L1'}
          </button>
        </div>

        {/* Center Quick System Keys (Select / Start / Core Menu) */}
        <div className="flex gap-4 pointer-events-auto items-center">
          <button
            id="btn-touch-select"
            onMouseDown={() => handleBtnPress('SELECT')}
            onMouseUp={() => handleBtnRelease('SELECT')}
            onTouchStart={() => handleBtnPress('SELECT')}
            onTouchEnd={() => handleBtnRelease('SELECT')}
            className={`px-3.5 py-1.5 rounded-full border text-[10px] uppercase font-mono tracking-widest transition-transform active:scale-95 backdrop-blur-md ${
              activeTouches['SELECT'] ? 'bg-amber-500/70 border-amber-300 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-black/40 border-white/20 text-white/60'
            }`}
          >
            SELECT
          </button>
          <button
            id="btn-touch-start"
            onMouseDown={() => handleBtnPress('START')}
            onMouseUp={() => handleBtnRelease('START')}
            onTouchStart={() => handleBtnPress('START')}
            onTouchEnd={() => handleBtnRelease('START')}
            className={`px-3.5 py-1.5 rounded-full border text-[10px] uppercase font-mono tracking-widest transition-transform active:scale-95 backdrop-blur-md ${
              activeTouches['START'] ? 'bg-amber-500/70 border-amber-300 text-white shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'bg-black/40 border-white/20 text-white/60'
            }`}
          >
            START
          </button>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button
            id="btn-touch-r1"
            onMouseDown={() => handleBtnPress('R1')}
            onMouseUp={() => handleBtnRelease('R1')}
            onTouchStart={() => handleBtnPress('R1')}
            onTouchEnd={() => handleBtnRelease('R1')}
            className={`w-16 h-10 rounded-xl border font-mono font-bold text-sm uppercase tracking-wider transition-transform active:scale-95 shadow-lg flex items-center justify-center backdrop-blur-md ${
              activeTouches['R1'] ? 'bg-blue-600/70 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/40 border-white/20 text-white/80'
            }`}
          >
            {isNintendo && systemId !== 'gc' ? 'R' : 'R1'}
          </button>
          {(systemId === 'ps1' || systemId === 'ps2') && (
            <button
              id="btn-touch-r2"
              onMouseDown={() => handleBtnPress('R2')}
              onMouseUp={() => handleBtnRelease('R2')}
              onTouchStart={() => handleBtnPress('R2')}
              onTouchEnd={() => handleBtnRelease('R2')}
              className={`w-14 h-9 rounded-xl border font-mono font-bold text-xs uppercase tracking-wider transition-transform active:scale-95 shadow-md flex items-center justify-center backdrop-blur-md ${
                activeTouches['R2'] ? 'bg-blue-600/70 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/40 border-white/20 text-white/70'
              }`}
            >
              R2
            </button>
          )}
        </div>
      </div>

      {/* Main Bottom Controls (Analog Nub / D-Pad on Left, Face Buttons on Right) */}
      <div className="flex justify-between items-end w-full pb-2">
        {/* Left Side: Analog Stick + D-Pad */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
          {/* Analog Stick Nub */}
          <div
            ref={stickRef}
            onMouseDown={handleStickStart}
            onTouchStart={handleStickStart}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center relative touch-none shadow-2xl cursor-grab active:cursor-grabbing"
          >
            {/* Guide crosshairs */}
            <div className="absolute inset-x-4 top-1/2 h-[1px] bg-white/10" />
            <div className="absolute inset-y-4 left-1/2 w-[1px] bg-white/10" />
            
            {/* Nub Thumb */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border-2 border-blue-400/70 shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all duration-75"
              style={{
                transform: `translate(${stickPos.x}px, ${stickPos.y}px)`
              }}
            >
              <div className="w-4 h-4 rounded-full bg-blue-400/40 shadow-inner" />
            </div>
          </div>

          {/* D-Pad Buttons */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 pointer-events-auto">
            {/* Up */}
            <button
              id="btn-touch-up"
              onMouseDown={() => handleBtnPress('UP')}
              onMouseUp={() => handleBtnRelease('UP')}
              onTouchStart={() => handleBtnPress('UP')}
              onTouchEnd={() => handleBtnRelease('UP')}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-t-xl border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all ${
                activeTouches['UP'] ? 'bg-blue-600/80 border-blue-300 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-black/50 text-white/70'
              }`}
            >
              ▲
            </button>
            {/* Down */}
            <button
              id="btn-touch-down"
              onMouseDown={() => handleBtnPress('DOWN')}
              onMouseUp={() => handleBtnRelease('DOWN')}
              onTouchStart={() => handleBtnPress('DOWN')}
              onTouchEnd={() => handleBtnRelease('DOWN')}
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-b-xl border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all ${
                activeTouches['DOWN'] ? 'bg-blue-600/80 border-blue-300 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-black/50 text-white/70'
              }`}
            >
              ▼
            </button>
            {/* Left */}
            <button
              id="btn-touch-left"
              onMouseDown={() => handleBtnPress('LEFT')}
              onMouseUp={() => handleBtnRelease('LEFT')}
              onTouchStart={() => handleBtnPress('LEFT')}
              onTouchEnd={() => handleBtnRelease('LEFT')}
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-l-xl border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all ${
                activeTouches['LEFT'] ? 'bg-blue-600/80 border-blue-300 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-black/50 text-white/70'
              }`}
            >
              ◀
            </button>
            {/* Right */}
            <button
              id="btn-touch-right"
              onMouseDown={() => handleBtnPress('RIGHT')}
              onMouseUp={() => handleBtnRelease('RIGHT')}
              onTouchStart={() => handleBtnPress('RIGHT')}
              onTouchEnd={() => handleBtnRelease('RIGHT')}
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-r-xl border border-white/20 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all ${
                activeTouches['RIGHT'] ? 'bg-blue-600/80 border-blue-300 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-black/50 text-white/70'
              }`}
            >
              ▶
            </button>
            {/* Center cross hub */}
            <div className="absolute inset-9 bg-neutral-900/60 rounded-md pointer-events-none" />
          </div>
        </div>

        {/* Right Side: Face Action Buttons */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 pointer-events-auto">
          {/* North Button (Triangle / X / Y) */}
          <button
            id="btn-touch-north"
            onMouseDown={() => handleBtnPress('NORTH')}
            onMouseUp={() => handleBtnRelease('NORTH')}
            onTouchStart={() => handleBtnPress('NORTH')}
            onTouchEnd={() => handleBtnRelease('NORTH')}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center text-base font-bold shadow-lg transition-transform active:scale-95 ${
              isPlayStation ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'
            } ${activeTouches['NORTH'] ? 'bg-emerald-500/80 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-95' : 'bg-black/50'}`}
          >
            {isPlayStation ? '▲' : isNintendo ? 'X' : 'Y'}
          </button>

          {/* East Button (Circle / A / B) */}
          <button
            id="btn-touch-east"
            onMouseDown={() => handleBtnPress('EAST')}
            onMouseUp={() => handleBtnRelease('EAST')}
            onTouchStart={() => handleBtnPress('EAST')}
            onTouchEnd={() => handleBtnRelease('EAST')}
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center text-base font-bold shadow-lg transition-transform active:scale-95 ${
              isPlayStation ? 'border-rose-500/40 text-rose-400' : 'border-red-500/40 text-red-400'
            } ${activeTouches['EAST'] ? 'bg-rose-500/80 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)] scale-95' : 'bg-black/50'}`}
          >
            {isPlayStation ? '●' : isNintendo ? 'A' : 'B'}
          </button>

          {/* South Button (Cross / B / A) */}
          <button
            id="btn-touch-south"
            onMouseDown={() => handleBtnPress('SOUTH')}
            onMouseUp={() => handleBtnRelease('SOUTH')}
            onTouchStart={() => handleBtnPress('SOUTH')}
            onTouchEnd={() => handleBtnRelease('SOUTH')}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center text-base font-bold shadow-lg transition-transform active:scale-95 ${
              isPlayStation ? 'border-blue-500/40 text-blue-400' : 'border-amber-500/40 text-amber-400'
            } ${activeTouches['SOUTH'] ? 'bg-blue-500/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-95' : 'bg-black/50'}`}
          >
            {isPlayStation ? '✖' : isNintendo ? 'B' : 'A'}
          </button>

          {/* West Button (Square / Y / X) */}
          <button
            id="btn-touch-west"
            onMouseDown={() => handleBtnPress('WEST')}
            onMouseUp={() => handleBtnRelease('WEST')}
            onTouchStart={() => handleBtnPress('WEST')}
            onTouchEnd={() => handleBtnRelease('WEST')}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center text-base font-bold shadow-lg transition-transform active:scale-95 ${
              isPlayStation ? 'border-purple-500/40 text-purple-400' : 'border-blue-500/40 text-blue-400'
            } ${activeTouches['WEST'] ? 'bg-purple-500/80 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-95' : 'bg-black/50'}`}
          >
            {isPlayStation ? '■' : isNintendo ? 'Y' : 'X'}
          </button>
        </div>
      </div>
    </div>
  );
};
