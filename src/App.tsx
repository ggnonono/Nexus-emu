import React, { useState, useEffect, useMemo } from 'react';
import { 
  GameItem, CoreConfig, ControllerMapping, SystemId, 
  ViewMode, AppTheme, SaveState 
} from './types';
import { Header } from './components/Header';
import { SystemFilterBar } from './components/SystemFilterBar';
import { GameCard } from './components/GameCard';
import { GameDetailsModal } from './components/GameDetailsModal';
import { GamePlayer } from './components/GamePlayer';
import { CoreManagerModal } from './components/CoreManagerModal';
import { RomImportModal } from './components/RomImportModal';
import { ControllerSettingsModal } from './components/ControllerSettingsModal';
import { ConsoleTvMode } from './components/ConsoleTvMode';
import { 
  loadStoredGames, saveStoredGames, 
  loadStoredCores, saveStoredCores,
  loadStoredController, saveStoredController,
  loadStoredTheme, saveStoredTheme
} from './utils/storage';
import { SYSTEMS_DATA } from './data/systems';
import { 
  Sparkles, Gamepad2, Plus, Layers, Flame, Trophy, Clock, 
  Search, Play, Star, Disc, Cpu, Box, Smartphone, Tv, 
  Triangle, CircleDot, Info, Heart, ChevronRight, Activity
} from 'lucide-react';
import { playSelectSound, playNavTick, triggerHaptic } from './utils/audioEffects';

export default function App() {
  // State management
  const [games, setGames] = useState<GameItem[]>(loadStoredGames);
  const [cores, setCores] = useState<CoreConfig[]>(loadStoredCores);
  const [controllerConfig, setControllerConfig] = useState<ControllerMapping>(loadStoredController);
  const [theme, setTheme] = useState<AppTheme>(loadStoredTheme);
  
  const [selectedSystem, setSelectedSystem] = useState<SystemId | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Active Modals & Player State
  const [activeGameForDetails, setActiveGameForDetails] = useState<GameItem | null>(null);
  const [activeGameForPlay, setActiveGameForPlay] = useState<GameItem | null>(null);
  const [showCoreManager, setShowCoreManager] = useState(false);
  const [showRomImporter, setShowRomImporter] = useState(false);
  const [showControllerSettings, setShowControllerSettings] = useState(false);

  // Sync state to local persistence
  useEffect(() => {
    saveStoredGames(games);
  }, [games]);

  useEffect(() => {
    saveStoredCores(cores);
  }, [cores]);

  useEffect(() => {
    saveStoredController(controllerConfig);
  }, [controllerConfig]);

  useEffect(() => {
    saveStoredTheme(theme);
  }, [theme]);

  // Compute game counts per platform
  const gamesCountBySystem = useMemo(() => {
    const counts: Record<string, number> = {
      all: games.length,
      favorites: games.filter((g) => g.isFavorite).length
    };
    SYSTEMS_DATA.forEach((s) => {
      counts[s.id] = games.filter((g) => g.systemId === s.id).length;
    });
    return counts;
  }, [games]);

  // Filtered games list
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // System filter
      if (selectedSystem === 'favorites' && !game.isFavorite) return false;
      if (selectedSystem !== 'all' && selectedSystem !== 'favorites' && game.systemId !== selectedSystem) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesCore = game.core.toLowerCase().includes(q);
        const matchesGenre = game.genre.some((g) => g.toLowerCase().includes(q));
        const matchesDev = game.developer.toLowerCase().includes(q);
        return matchesTitle || matchesCore || matchesGenre || matchesDev;
      }
      return true;
    });
  }, [games, selectedSystem, searchQuery]);

  // Recently played games (up to 4)
  const recentlyPlayedGames = useMemo(() => {
    return [...games]
      .filter((g) => g.lastPlayed)
      .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
      .slice(0, 4);
  }, [games]);

  // Hero Featured Game (Most played or first recent)
  const heroFeaturedGame = useMemo(() => {
    if (recentlyPlayedGames.length > 0) return recentlyPlayedGames[0];
    return games[0] || null;
  }, [recentlyPlayedGames, games]);

  // Handlers
  const handleLaunchGame = (game: GameItem, selectedCoreName?: string) => {
    const coreToUse = selectedCoreName || game.core;
    const updatedGame = { ...game, core: coreToUse, lastPlayed: Date.now() };
    
    // Update game in list
    setGames((prev) => prev.map((g) => (g.id === game.id ? updatedGame : g)));
    setActiveGameForDetails(null);
    setActiveGameForPlay(updatedGame);
  };

  const handleToggleFavorite = (gameId: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, isFavorite: !g.isFavorite } : g))
    );
  };

  const handleUpdateGame = (updated: GameItem) => {
    setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    if (activeGameForDetails?.id === updated.id) {
      setActiveGameForDetails(updated);
    }
  };

  const handleAddGame = (newGame: GameItem) => {
    setGames((prev) => [newGame, ...prev]);
  };

  const handleUpdateCore = (updatedCore: CoreConfig) => {
    setCores((prev) => prev.map((c) => (c.id === updatedCore.id ? updatedCore : c)));
  };

  const handleSaveState = (saveState: SaveState) => {
    setGames((prev) =>
      prev.map((g) => {
        if (g.id === saveState.gameId) {
          const existingStates = g.saveStates || [];
          return {
            ...g,
            saveStates: [saveState, ...existingStates.slice(0, 9)]
          };
        }
        return g;
      })
    );
  };

  const handleClosePlayer = (updatedGame: GameItem) => {
    setGames((prev) => prev.map((g) => (g.id === updatedGame.id ? updatedGame : g)));
    setActiveGameForPlay(null);
  };

  // Find active core object for current playable game
  const activeCoreConfig = useMemo(() => {
    if (!activeGameForPlay) return cores[0];
    const match = cores.find((c) => c.systemId === activeGameForPlay.systemId);
    return match || cores[0];
  }, [activeGameForPlay, cores]);

  // Color mappings for system dots
  const getSystemDotColor = (sysId: string) => {
    switch (sysId) {
      case 'ps1': return 'bg-blue-500 shadow-[0_0_8px_#3b82f6]';
      case 'psp': return 'bg-orange-500 shadow-[0_0_8px_#f97316]';
      case 'n64': return 'bg-red-500 shadow-[0_0_8px_#ef4444]';
      case 'dreamcast': return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
      case 'ps2': return 'bg-indigo-500 shadow-[0_0_8px_#6366f1]';
      case 'gc': return 'bg-purple-500 shadow-[0_0_8px_#a855f7]';
      case 'nds': return 'bg-teal-500 shadow-[0_0_8px_#14b8a6]';
      case 'gba': return 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
      case 'snes': return 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]';
      case 'arcade': return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
      default: return 'bg-blue-400';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#08080a] text-[#e0e0e0] flex flex-col selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
      {/* Immersive UI Ambient Glowing Orbs Background */}
      <div className="fixed -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Universal App Header */}
      <Header
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCoreManager={() => setShowCoreManager(true)}
        onOpenRomImporter={() => setShowRomImporter(true)}
        onOpenControllerSettings={() => setShowControllerSettings(true)}
        activeTheme={theme}
        onThemeChange={setTheme}
        gameCount={games.length}
      />

      {/* System Core Filter Bar (Mobile & Quick-touch pill bar) */}
      <SystemFilterBar
        selectedSystem={selectedSystem}
        onSelectSystem={setSelectedSystem}
        gamesCountBySystem={gamesCountBySystem}
      />

      {/* Main Structural Body: Sidebar + Library Canvas */}
      <div className="relative z-10 flex-1 flex w-full max-w-[1600px] mx-auto overflow-hidden">
        {/* Immersive Desktop Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-md p-4 hidden lg:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Navigation Group */}
            <div>
              <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2 font-mono">
                Library View
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    playNavTick();
                    setSelectedSystem('all');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    selectedSystem === 'all'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    <span>All Games</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">{games.length}</span>
                </button>

                <button
                  onClick={() => {
                    playNavTick();
                    setSelectedSystem('favorites');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    selectedSystem === 'favorites'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4" />
                    <span>Favorites</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">
                    {gamesCountBySystem['favorites'] || 0}
                  </span>
                </button>

                <button
                  onClick={() => {
                    playSelectSound();
                    setViewMode('console-tv');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tracking-wide text-white/60 hover:text-white hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Tv className="w-4 h-4 text-purple-400" />
                    <span>Console TV Big Picture</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded">
                    TV
                  </span>
                </button>
              </div>
            </div>

            {/* Systems & Emulation Cores Group */}
            <div>
              <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2 font-mono">
                Emulated Systems
              </div>
              <div className="space-y-1 max-h-[340px] overflow-y-auto no-scrollbar pr-1">
                {SYSTEMS_DATA.map((sys) => {
                  const isSel = selectedSystem === sys.id;
                  const count = gamesCountBySystem[sys.id] || 0;
                  return (
                    <button
                      key={sys.id}
                      onClick={() => {
                        playNavTick();
                        setSelectedSystem(sys.id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isSel
                          ? 'bg-white/10 text-white font-semibold border border-white/15'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${getSystemDotColor(sys.id)}`} />
                        <span className="truncate">{sys.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Motivational Quote banner / Core Status */}
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-white/10 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>UNIFIED ARCHITECTURE</span>
            </div>
            <p className="text-[11px] text-white/70 italic leading-relaxed">
              "One hub to rule all cores. No mess, just pure gaming."
            </p>
            <div className="text-[10px] text-white/40 font-mono">
              10 Cores Active & Synced
            </div>
          </div>
        </aside>

        {/* Main Content Showcase & Grid Area */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 overflow-y-auto no-scrollbar max-w-full">
          {/* Hero Featured & Quick-Resume Banner (When on 'all' with no search filter) */}
          {selectedSystem === 'all' && !searchQuery.trim() && heroFeaturedGame && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-widest uppercase text-white/50 flex items-center gap-2 font-mono">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Featured Quick Launch • Resume Game</span>
                </h2>
              </div>

              {/* Glowing Hero Showcase Card */}
              <div className="group relative rounded-2xl overflow-hidden border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.2)] bg-[#0d0e14] transition-all duration-300">
                <div className="flex flex-col md:flex-row h-auto md:h-64">
                  {/* Left Media Image Container */}
                  <div className="relative w-full md:w-2/5 h-48 md:h-full overflow-hidden bg-black/60">
                    <img
                      src={heroFeaturedGame.bannerUrl || heroFeaturedGame.coverUrl}
                      alt={heroFeaturedGame.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase text-white shadow-md backdrop-blur-md bg-blue-600 border border-white/20">
                        {SYSTEMS_DATA.find((s) => s.id === heroFeaturedGame.systemId)?.shortName || 'PSP'}
                      </span>
                    </div>
                  </div>

                  {/* Right Game Details & Actions */}
                  <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono">
                        <span>CORE: {heroFeaturedGame.core}</span>
                        <span>•</span>
                        <span className="text-purple-400">{heroFeaturedGame.developer}</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight line-clamp-1">
                        {heroFeaturedGame.title}
                      </h3>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed max-w-xl">
                        {heroFeaturedGame.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{heroFeaturedGame.rating.toFixed(1)}</span>
                        </span>
                        <span className="flex items-center gap-1 text-blue-300">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{Math.round(heroFeaturedGame.playtimeMinutes / 60)}h {heroFeaturedGame.playtimeMinutes % 60}m</span>
                        </span>
                        <span>{heroFeaturedGame.year}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          id="btn-hero-launch"
                          onClick={() => {
                            playSelectSound();
                            triggerHaptic(25);
                            handleLaunchGame(heroFeaturedGame);
                          }}
                          className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/20 transition-all active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>LAUNCH GAME</span>
                        </button>
                        <button
                          id="btn-hero-details"
                          onClick={() => {
                            playSelectSound();
                            setActiveGameForDetails(heroFeaturedGame);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all"
                        >
                          <Info className="w-3.5 h-3.5 text-blue-400" />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Main Games Grid Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>
                    {selectedSystem === 'all'
                      ? 'Unified Gaming Library'
                      : selectedSystem === 'favorites'
                      ? 'Favorite Titles'
                      : `${SYSTEMS_DATA.find((s) => s.id === selectedSystem)?.name} Games`}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-blue-400 font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    {filteredGames.length}
                  </span>
                </h2>
              </div>

              <button
                id="btn-main-add-rom"
                onClick={() => {
                  playSelectSound();
                  setShowRomImporter(true);
                }}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all hover:border-white/20"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Import ROM</span>
              </button>
            </div>

            {filteredGames.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-3">
                <Search className="w-10 h-10 text-white/30 mx-auto" />
                <h3 className="text-sm font-bold text-white/80">No matching ROMs found</h3>
                <p className="text-xs text-white/40 max-w-sm mx-auto">
                  No games match your current filter or search criteria. Try clearing the search or add a new ROM file.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSystem('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-colors mt-2"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onSelectGame={setActiveGameForDetails}
                    onLaunchGame={handleLaunchGame}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Immersive Controller Status / Shortcut Footer Bar */}
      <footer className="relative z-20 h-[54px] bg-black/40 border-t border-white/10 px-4 sm:px-8 flex items-center justify-between text-xs font-medium tracking-wide backdrop-blur-md text-white/70">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-[10px] font-bold text-blue-300">
              A
            </span>
            <span className="text-white/60 text-[11px]">Launch</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-5 h-5 rounded-full bg-red-600/30 border border-red-400/50 flex items-center justify-center text-[10px] font-bold text-red-300">
              B
            </span>
            <span className="text-white/60 text-[11px]">Details</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono">
            <span className="w-5 h-5 rounded-full bg-green-600/30 border border-green-400/50 flex items-center justify-center text-[10px] font-bold text-green-300">
              X
            </span>
            <span className="text-white/60 text-[11px]">Save States</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono">
            <span className="w-5 h-5 rounded-full bg-amber-600/30 border border-amber-400/50 flex items-center justify-center text-[10px] font-bold text-amber-300">
              Y
            </span>
            <span className="text-white/60 text-[11px]">Search</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-white/40">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_#22c55e] animate-pulse" />
            <span className="hidden sm:inline">Engine Running</span>
          </div>
          <span>•</span>
          <span className="text-white/60">{filteredGames.length} of {games.length} Loaded</span>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {/* Game Details View */}
      {activeGameForDetails && (
        <GameDetailsModal
          game={activeGameForDetails}
          cores={cores}
          onClose={() => setActiveGameForDetails(null)}
          onLaunchGame={handleLaunchGame}
          onUpdateGame={handleUpdateGame}
        />
      )}

      {/* Fullscreen Interactive Game Player */}
      {activeGameForPlay && (
        <GamePlayer
          game={activeGameForPlay}
          core={activeCoreConfig}
          controllerConfig={controllerConfig}
          onClose={handleClosePlayer}
          onSaveState={handleSaveState}
        />
      )}

      {/* Core Manager Modal */}
      {showCoreManager && (
        <CoreManagerModal
          cores={cores}
          onClose={() => setShowCoreManager(false)}
          onUpdateCore={handleUpdateCore}
        />
      )}

      {/* ROM Importer Modal */}
      {showRomImporter && (
        <RomImportModal
          onClose={() => setShowRomImporter(false)}
          onAddGame={handleAddGame}
        />
      )}

      {/* Controller Settings Modal */}
      {showControllerSettings && (
        <ControllerSettingsModal
          config={controllerConfig}
          onClose={() => setShowControllerSettings(false)}
          onSaveConfig={setControllerConfig}
        />
      )}

      {/* Console TV Big Picture View */}
      {viewMode === 'console-tv' && (
        <ConsoleTvMode
          games={filteredGames.length > 0 ? filteredGames : games}
          onLaunchGame={handleLaunchGame}
          onOpenDetails={(game) => {
            setViewMode('grid');
            setActiveGameForDetails(game);
          }}
          onExitTvMode={() => setViewMode('grid')}
        />
      )}
    </div>
  );
}

