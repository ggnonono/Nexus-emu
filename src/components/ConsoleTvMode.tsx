import React, { useState, useEffect } from 'react';
import { GameItem } from '../types';
import { SYSTEMS_DATA } from '../data/systems';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Star, Clock, Trophy, Heart, Gamepad2, Info, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { playNavTick, playSelectSound, triggerHaptic } from '../utils/audioEffects';

interface ConsoleTvModeProps {
  games: GameItem[];
  onLaunchGame: (game: GameItem) => void;
  onOpenDetails: (game: GameItem) => void;
  onExitTvMode: () => void;
}

export const ConsoleTvMode: React.FC<ConsoleTvModeProps> = ({
  games,
  onLaunchGame,
  onOpenDetails,
  onExitTvMode
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedGame = games[selectedIndex] || games[0];
  const system = SYSTEMS_DATA.find((s) => s.id === selectedGame?.systemId);

  // Keyboard navigation for TV big picture mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        e.preventDefault();
        playNavTick();
        setSelectedIndex((prev) => (prev + 1) % games.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        e.preventDefault();
        playNavTick();
        setSelectedIndex((prev) => (prev - 1 + games.length) % games.length);
      } else if (e.key === 'Enter' || e.key === 'Space') {
        e.preventDefault();
        if (selectedGame) {
          playSelectSound();
          onLaunchGame(selectedGame);
        }
      } else if (e.key === 'Escape') {
        onExitTvMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [games.length, selectedGame, onLaunchGame, onExitTvMode]);

  if (!selectedGame) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Animated Wallpaper */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedGame.id}
            src={selectedGame.bannerUrl || selectedGame.coverUrl}
            alt={selectedGame.title}
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 0.35, scale: 1.0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full object-cover filter blur-md brightness-50"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/40" />
      </div>

      {/* TV Header Bar */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">NEXUS CORE Big Picture</h1>
            <p className="text-xs text-white/50 font-mono">Use D-Pad / Arrow keys to navigate</p>
          </div>
        </div>

        <button
          onClick={onExitTvMode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Exit TV Mode (ESC)</span>
        </button>
      </div>

      {/* Center Game Showcase Info */}
      <div className="relative z-10 px-8 sm:px-16 max-w-4xl space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedGame.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* System Badge */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider uppercase shadow-md ${system?.badgeBg || 'bg-blue-600'}`}>
                {system?.name}
              </span>
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                Core: {selectedGame.core}
              </span>
            </div>

            {/* Game Title */}
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {selectedGame.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-white/70 max-w-2xl leading-relaxed line-clamp-2">
              {selectedGame.description}
            </p>

            {/* Meta Tags */}
            <div className="flex items-center gap-6 text-xs font-mono text-white/50 pt-2">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold">{selectedGame.rating.toFixed(1)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{Math.round(selectedGame.playtimeMinutes / 60)}h {selectedGame.playtimeMinutes % 60}m</span>
              </span>
              <span>{selectedGame.year} • {selectedGame.developer}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => {
                  playSelectSound();
                  onLaunchGame(selectedGame);
                }}
                className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-black text-sm uppercase tracking-wider text-white shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-white/20 transition-transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>PRESS ENTER TO PLAY</span>
              </button>

              <button
                onClick={() => {
                  playSelectSound();
                  onOpenDetails(selectedGame);
                }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-white/80 hover:text-white transition-colors"
              >
                <Info className="w-4 h-4 text-blue-400" />
                <span>Game Details</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Horizontal Carousel Shelf */}
      <div className="relative z-10 px-8 pb-10 pt-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
          {games.map((g, index) => {
            const isSel = index === selectedIndex;
            return (
              <motion.div
                key={g.id}
                onClick={() => {
                  playNavTick();
                  setSelectedIndex(index);
                }}
                animate={{
                  scale: isSel ? 1.12 : 0.95,
                  y: isSel ? -10 : 0
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`relative flex-shrink-0 w-32 sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden border-2 cursor-pointer transition-shadow shadow-xl ${
                  isSel
                    ? 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-4 ring-blue-500/20'
                    : 'border-white/10 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={g.coverUrl}
                  alt={g.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                <div className="absolute bottom-2 inset-x-2">
                  <p className="text-[11px] font-bold text-white truncate text-center">
                    {g.title}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
