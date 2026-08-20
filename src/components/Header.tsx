import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, Search, Plus, Cpu, SlidersHorizontal, Tv, 
  Volume2, VolumeX, Moon, Sun, BatteryMedium, Wifi, 
  Sparkles, Layers, RefreshCw, Activity, Terminal
} from 'lucide-react';
import { ViewMode, AppTheme } from '../types';
import { playSelectSound, playNavTick, isSoundEnabled, setSoundEnabled } from '../utils/audioEffects';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCoreManager: () => void;
  onOpenRomImporter: () => void;
  onOpenControllerSettings: () => void;
  activeTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  gameCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  onOpenCoreManager,
  onOpenRomImporter,
  onOpenControllerSettings,
  activeTheme,
  onThemeChange,
  gameCount
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [hasGamepad, setHasGamepad] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(32);
  const [gpuUsage, setGpuUsage] = useState(45);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  // Subtle telemetry fluctuation for realistic hardware immersion
  useEffect(() => {
    const teleInterval = setInterval(() => {
      setCpuUsage(Math.floor(28 + Math.random() * 8));
      setGpuUsage(Math.floor(40 + Math.random() * 12));
    }, 4000);
    return () => clearInterval(teleInterval);
  }, []);

  useEffect(() => {
    const checkGp = () => {
      if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
        const gps = navigator.getGamepads();
        setHasGamepad(!!gps[0]);
      }
    };
    window.addEventListener('gamepadconnected', checkGp);
    window.addEventListener('gamepaddisconnected', checkGp);
    checkGp();
    return () => {
      window.removeEventListener('gamepadconnected', checkGp);
      window.removeEventListener('gamepaddisconnected', checkGp);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSelectSound();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-black/30 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-3 text-white transition-all">
      {/* Top Device Bar (Handheld/Android status indicators & Telemetry) */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/5 text-[11px] font-mono text-white/50 tracking-wider">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-blue-400 font-bold tracking-widest text-[10px] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block shadow-[0_0_6px_#60a5fa]" />
            NEXUS CORE OS v3.4
          </span>
          <span className="hidden sm:inline-block text-white/20">|</span>
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-medium text-white/50 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <span className="text-white/30">CPU:</span>
              <span className="text-blue-300 font-bold">{cpuUsage}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-white/30">GPU:</span>
              <span className="text-purple-300 font-bold">{gpuUsage}%</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-white/30">TEMP:</span>
              <span className="text-emerald-400 font-bold">42°C</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          {hasGamepad ? (
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_5px_#22c55e]" />
              <Gamepad2 className="w-3 h-3" />
              <span>Gamepad 1</span>
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1.5 text-white/40">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]" />
              <span>Touch / Keyb Ready</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-white/60">
            <Wifi className="w-3 h-3 text-blue-400" />
            <span>Vulkan 1.3</span>
          </span>
          <span className="flex items-center gap-1 text-white/60">
            <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            <span>98%</span>
          </span>
          <span className="text-white font-bold">{timeStr || '10:45 PM'}</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-3">
            {/* Glowing Nexus Core Icon */}
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/20">
              <div className="w-4 h-4 border-2 border-white rounded-[4px] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#ffffff]" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tighter text-white flex items-center gap-2">
                <span>NEXUS CORE</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest font-semibold">
                  Unified
                </span>
              </h1>
              <p className="text-[11px] text-white/40 font-medium">
                {gameCount} Games Ready • Multi-Core Engine
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              id="btn-header-import-mobile"
              onClick={() => {
                playSelectSound();
                onOpenRomImporter();
              }}
              className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              title="Add Game / ROM"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              id="btn-header-tv-mobile"
              onClick={() => {
                playSelectSound();
                onViewModeChange(viewMode === 'console-tv' ? 'grid' : 'console-tv');
              }}
              className={`p-2 rounded-xl border transition-all ${
                viewMode === 'console-tv'
                  ? 'bg-blue-600/30 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
                  : 'bg-white/5 border-white/10 text-white/60'
              }`}
              title="Console TV Big Picture"
            >
              <Tv className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Search Input */}
        <div className="relative w-full md:w-80 lg:w-96">
          <div className="h-9 w-full bg-white/5 rounded-full border border-white/10 flex items-center px-3.5 gap-2.5 transition-all focus-within:border-blue-500/50 focus-within:bg-white/10 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.25)]">
            <div className="w-3.5 h-3.5 border border-white/40 rounded-full flex items-center justify-center flex-shrink-0">
              <Search className="w-2.5 h-2.5 text-white/60" />
            </div>
            <input
              id="input-game-search"
              type="text"
              placeholder="Search Library (PSP, PS1, N64, DC...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-white/40 focus:outline-none font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-[10px] font-mono text-white/40 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
              >
                ESC
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & Navigation Modules */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* ROM Importer Button */}
          <button
            id="btn-header-add-rom"
            onClick={() => {
              playSelectSound();
              onOpenRomImporter();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-white/10 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add ROM</span>
          </button>

          {/* Core Manager */}
          <button
            id="btn-header-core-manager"
            onClick={() => {
              playSelectSound();
              onOpenCoreManager();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all hover:border-white/20"
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Cores & BIOS</span>
          </button>

          {/* Controller Settings */}
          <button
            id="btn-header-controller"
            onClick={() => {
              playSelectSound();
              onOpenControllerSettings();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all hover:border-white/20"
            title="Controller Mapping & Touch Gamepad"
          >
            <Gamepad2 className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-header-sound"
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundOn
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
                : 'bg-rose-950/40 border-rose-800 text-rose-400'
            }`}
            title={soundOn ? 'UI Sounds On' : 'UI Sounds Muted'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Console TV Big Picture Toggle */}
          <button
            id="btn-header-tv-mode"
            onClick={() => {
              playSelectSound();
              onViewModeChange(viewMode === 'console-tv' ? 'grid' : 'console-tv');
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
              viewMode === 'console-tv'
                ? 'bg-blue-600/30 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white'
            }`}
            title="Big Picture / Console TV Mode"
          >
            <Tv className="w-4 h-4 text-blue-400" />
            <span>TV Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};

