import React from 'react';
import { GameItem, SystemInfo } from '../types';
import { SYSTEMS_DATA } from '../data/systems';
import { Play, Star, Clock, Heart, Disc, Gamepad2, Info, Sparkles } from 'lucide-react';
import { playSelectSound, triggerHaptic } from '../utils/audioEffects';

interface GameCardProps {
  game: GameItem;
  onSelectGame: (game: GameItem) => void;
  onLaunchGame: (game: GameItem) => void;
  onToggleFavorite: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite
}) => {
  const system = SYSTEMS_DATA.find((s) => s.id === game.systemId);

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSelectSound();
    triggerHaptic(20);
    onLaunchGame(game);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    onToggleFavorite(game.id);
  };

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={() => {
        playSelectSound();
        onSelectGame(game);
      }}
      className="group relative flex flex-col rounded-2xl bg-[#0e0f14]/80 backdrop-blur-md border border-white/5 hover:border-blue-500/50 overflow-hidden shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer text-white"
    >
      {/* Boxart Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/60">
        <img
          src={game.coverUrl}
          alt={game.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f14] via-[#0e0f14]/30 to-transparent" />

        {/* Top Badges (System & Favorite) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase text-white shadow-md backdrop-blur-md border border-white/10 ${system?.badgeBg || 'bg-blue-600'}`}>
            {system?.shortName || game.systemId.toUpperCase()}
          </span>

          <button
            id={`btn-fav-${game.id}`}
            onClick={handleFav}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
              game.isFavorite
                ? 'bg-amber-400/90 border-amber-300 text-black scale-110 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                : 'bg-black/60 border-white/10 text-white/50 hover:text-white hover:scale-105'
            }`}
            title={game.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${game.isFavorite ? 'fill-black' : ''}`} />
          </button>
        </div>

        {/* Hover Launch Overlay Button */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button
            id={`btn-launch-card-${game.id}`}
            onClick={handleLaunch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-white/20 transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
        <div>
          <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
            {game.title}
          </h3>
          <p className="text-[11px] text-white/40 font-mono mt-0.5 line-clamp-1">
            Core: <span className="text-white/70 font-semibold">{game.core.split(' ')[0]}</span> • {game.year}
          </p>
        </div>

        {/* Bottom Metrics (Rating, Playtime, Save states count) */}
        <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-2 border-t border-white/5">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1 text-white/40">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>{Math.round(game.playtimeMinutes / 60)}h {game.playtimeMinutes % 60}m</span>
          </div>

          {game.saveStates && game.saveStates.length > 0 && (
            <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              {game.saveStates.length} Saves
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

