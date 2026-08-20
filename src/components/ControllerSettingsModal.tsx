import React, { useState, useEffect } from 'react';
import { ControllerMapping } from '../types';
import { Gamepad2, Sliders, Smartphone, X, CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import { playSelectSound, playNavTick, triggerHaptic } from '../utils/audioEffects';

interface ControllerSettingsModalProps {
  config: ControllerMapping;
  onClose: () => void;
  onSaveConfig: (cfg: ControllerMapping) => void;
}

export const ControllerSettingsModal: React.FC<ControllerSettingsModalProps> = ({
  config,
  onClose,
  onSaveConfig
}) => {
  const [localConfig, setLocalConfig] = useState<ControllerMapping>({ ...config });
  const [pressedButtons, setPressedButtons] = useState<Record<string, boolean>>({});
  const [stickPositions, setStickPositions] = useState<{ left: { x: number; y: number } }>({
    left: { x: 0, y: 0 }
  });
  const [gamepadName, setGamepadName] = useState<string>('No Gamepad Connected (Touch & Keyboard Active)');

  // Poll Gamepad API for live visual button feedback
  useEffect(() => {
    let animId: number;
    const poll = () => {
      if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (gp) {
          setGamepadName(gp.id);
          const pressed: Record<string, boolean> = {
            A: !!gp.buttons[0]?.pressed,
            B: !!gp.buttons[1]?.pressed,
            X: !!gp.buttons[2]?.pressed,
            Y: !!gp.buttons[3]?.pressed,
            LB: !!gp.buttons[4]?.pressed,
            RB: !!gp.buttons[5]?.pressed,
            LT: !!gp.buttons[6]?.pressed,
            RT: !!gp.buttons[7]?.pressed,
            Select: !!gp.buttons[8]?.pressed,
            Start: !!gp.buttons[9]?.pressed,
            DPadUp: !!gp.buttons[12]?.pressed,
            DPadDown: !!gp.buttons[13]?.pressed,
            DPadLeft: !!gp.buttons[14]?.pressed,
            DPadRight: !!gp.buttons[15]?.pressed
          };
          setPressedButtons(pressed);
          setStickPositions({
            left: {
              x: Math.abs(gp.axes[0]) > localConfig.analogDeadzone ? gp.axes[0] : 0,
              y: Math.abs(gp.axes[1]) > localConfig.analogDeadzone ? gp.axes[1] : 0
            }
          });
        }
      }
      animId = requestAnimationFrame(poll);
    };
    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, [localConfig.analogDeadzone]);

  const handleSave = () => {
    playSelectSound();
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0a0b10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] text-white flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0b10] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Controller & Input Setup
              </h2>
              <p className="text-xs text-white/50">
                Bluetooth controller mapping, Deadzone calibration, and Touch HUD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Controller Tester */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Gamepad Diagnostic
                </h4>
              </div>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 truncate max-w-[200px]">
                {gamepadName}
              </span>
            </div>

            {/* Visual Controller Map */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className={`p-3 rounded-xl border text-xs font-mono transition-colors ${
                pressedButtons['DPadUp'] || pressedButtons['DPadDown'] || pressedButtons['DPadLeft'] || pressedButtons['DPadRight']
                  ? 'bg-blue-500/30 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                  : 'bg-black/40 border-white/10 text-white/40'
              }`}>
                <span className="block font-bold">D-PAD</span>
                <span className="text-[10px] text-white/30">Directional Hat</span>
              </div>

              <div className={`p-3 rounded-xl border text-xs font-mono transition-colors ${
                pressedButtons['A'] || pressedButtons['B'] || pressedButtons['X'] || pressedButtons['Y']
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'bg-black/40 border-white/10 text-white/40'
              }`}>
                <span className="block font-bold">ACTION (ABXY)</span>
                <span className="text-[10px] text-white/30">Cross/Circle/Square</span>
              </div>

              <div className={`p-3 rounded-xl border text-xs font-mono transition-colors ${
                pressedButtons['LB'] || pressedButtons['RB'] || pressedButtons['LT'] || pressedButtons['RT']
                  ? 'bg-purple-500/30 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-black/40 border-white/10 text-white/40'
              }`}>
                <span className="block font-bold">SHOULDERS</span>
                <span className="text-[10px] text-white/30">L1/R1/L2/R2</span>
              </div>

              <div className={`p-3 rounded-xl border text-xs font-mono transition-colors ${
                Math.abs(stickPositions.left.x) > 0.2 || Math.abs(stickPositions.left.y) > 0.2
                  ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-black/40 border-white/10 text-white/40'
              }`}>
                <span className="block font-bold">ANALOG STICK</span>
                <span className="text-[10px] text-white/30">
                  X:{stickPositions.left.x.toFixed(2)} Y:{stickPositions.left.y.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* On-Screen Touch Controls Customizer */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                On-Screen Virtual Touch Gamepad
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Touch Enable Toggle */}
              <label className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-400/40">
                <span className="text-white/80 font-semibold">Enable Touch Controls</span>
                <input
                  type="checkbox"
                  checked={localConfig.touchControlsEnabled}
                  onChange={(e) => setLocalConfig({ ...localConfig, touchControlsEnabled: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 rounded"
                />
              </label>

              {/* Haptics */}
              <label className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-400/40">
                <span className="text-white/80 font-semibold">Haptic Vibration on Press</span>
                <input
                  type="checkbox"
                  checked={localConfig.touchHaptics}
                  onChange={(e) => setLocalConfig({ ...localConfig, touchHaptics: e.target.checked })}
                  className="w-4 h-4 accent-blue-500 rounded"
                />
              </label>

              {/* Opacity Slider */}
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center text-white/80 mb-1 font-mono">
                  <span>Overlay Opacity</span>
                  <span className="text-blue-400 font-bold">{Math.round(localConfig.touchOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.05}
                  value={localConfig.touchOpacity}
                  onChange={(e) => setLocalConfig({ ...localConfig, touchOpacity: Number(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Analog Deadzone */}
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center text-white/80 mb-1 font-mono">
                  <span>Analog Deadzone Sensitivity</span>
                  <span className="text-blue-400 font-bold">{Math.round(localConfig.analogDeadzone * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={0.35}
                  step={0.05}
                  value={localConfig.analogDeadzone}
                  onChange={(e) => setLocalConfig({ ...localConfig, analogDeadzone: Number(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-white/10 bg-[#0a0b10] flex-shrink-0">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold text-xs uppercase tracking-wider text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-white/20 transition-colors"
          >
            Apply Controller Settings
          </button>
        </div>
      </div>
    </div>
  );
};
