import React from 'react';
import { SystemId, SystemInfo } from '../types';
import { SYSTEMS_DATA } from '../data/systems';
import { 
  Gamepad2, Disc, Cpu, Box, Layers, Smartphone, 
  Tv, Triangle, CircleDot, Flame, Grid, Sparkles
} from 'lucide-react';
import { playNavTick } from '../utils/audioEffects';

interface SystemFilterBarProps {
  selectedSystem: SystemId | 'all' | 'favorites';
  onSelectSystem: (sys: SystemId | 'all' | 'favorites') => void;
  gamesCountBySystem: Record<string, number>;
}

export const SystemFilterBar: React.FC<SystemFilterBarProps> = ({
  selectedSystem,
  onSelectSystem,
  gamesCountBySystem
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'psp': return <Gamepad2 className="w-3.5 h-3.5" />;
      case 'ps1': return <Disc className="w-3.5 h-3.5" />;
      case 'ps2': return <Cpu className="w-3.5 h-3.5" />;
      case 'gc': return <Box className="w-3.5 h-3.5" />;
      case 'nds': return <Layers className="w-3.5 h-3.5" />;
      case 'gba': return <Smartphone className="w-3.5 h-3.5" />;
      case 'snes': return <Tv className="w-3.5 h-3.5" />;
      case 'n64': return <Triangle className="w-3.5 h-3.5" />;
      case 'dreamcast': return <CircleDot className="w-3.5 h-3.5" />;
      case 'arcade': return <Flame className="w-3.5 h-3.5" />;
      default: return <Grid className="w-3.5 h-3.5" />;
    }
  };

  const handleSelect = (id: SystemId | 'all' | 'favorites') => {
    playNavTick();
    onSelectSystem(id);
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2.5 px-4 sm:px-8 bg-black/20 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-2 min-w-max">
        {/* ALL Platforms */}
        <button
          id="btn-filter-all"
          onClick={() => handleSelect('all')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            selectedSystem === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/20 scale-105'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>All Games</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            selectedSystem === 'all' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'
          }`}>
            {gamesCountBySystem['all'] || 0}
          </span>
        </button>

        {/* Favorites */}
        <button
          id="btn-filter-favorites"
          onClick={() => handleSelect('favorites')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            selectedSystem === 'favorites'
              ? 'bg-amber-400 text-black font-bold shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
          }`}
        >
          <span>★ Favorites</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            selectedSystem === 'favorites' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/40'
          }`}>
            {gamesCountBySystem['favorites'] || 0}
          </span>
        </button>

        {/* Individual System Pills */}
        {SYSTEMS_DATA.map((sys) => {
          const count = gamesCountBySystem[sys.id] || 0;
          const isSelected = selectedSystem === sys.id;

          return (
            <button
              key={sys.id}
              id={`btn-filter-system-${sys.id}`}
              onClick={() => handleSelect(sys.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 border border-white/20'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {getIcon(sys.id)}
              <span>{sys.shortName}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-white/40'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

