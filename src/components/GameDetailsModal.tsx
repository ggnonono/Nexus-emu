import React, { useState } from 'react';
import { GameItem, CoreConfig, SaveState, CheatCode } from '../types';
import { SYSTEMS_DATA } from '../data/systems';
import { 
  Play, Heart, Star, Clock, HardDrive, Cpu, Zap, 
  Trophy, Sliders, X, CheckCircle2, ChevronRight,
  Shield, Edit3, Trash2, Download, Plus
} from 'lucide-react';
import { playSelectSound, triggerHaptic, playAchievementSound } from '../utils/audioEffects';

interface GameDetailsModalProps {
  game: GameItem;
  cores: CoreConfig[];
  onClose: () => void;
  onLaunchGame: (game: GameItem, selectedCoreName?: string) => void;
  onUpdateGame: (updated: GameItem) => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  cores,
  onClose,
  onLaunchGame,
  onUpdateGame
}) => {
  const system = SYSTEMS_DATA.find((s) => s.id === game.systemId);
  const [selectedCore, setSelectedCore] = useState<string>(game.core);
  const [activeTab, setActiveTab] = useState<'overview' | 'saves' | 'cheats' | 'achievements'>('overview');
  const [cheats, setCheats] = useState<CheatCode[]>(game.cheats || []);
  const [newCheatName, setNewCheatName] = useState('');
  const [newCheatCode, setNewCheatCode] = useState('');
  const [showAddCheat, setShowAddCheat] = useState(false);

  const handleLaunch = () => {
    playSelectSound();
    triggerHaptic(20);
    onLaunchGame(game, selectedCore);
  };

  const handleToggleFavorite = () => {
    triggerHaptic(15);
    const updated = { ...game, isFavorite: !game.isFavorite };
    onUpdateGame(updated);
  };

  const handleCoreChange = (coreName: string) => {
    playSelectSound();
    setSelectedCore(coreName);
    const updated = { ...game, core: coreName };
    onUpdateGame(updated);
  };

  const handleToggleCheat = (cheatId: string) => {
    triggerHaptic(15);
    const updatedCheats = cheats.map((c) =>
      c.id === cheatId ? { ...c, enabled: !c.enabled } : c
    );
    setCheats(updatedCheats);
    onUpdateGame({ ...game, cheats: updatedCheats });
  };

  const handleAddCustomCheat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheatName.trim() || !newCheatCode.trim()) return;
    const newCheat: CheatCode = {
      id: 'cheat-' + Date.now(),
      name: newCheatName.trim(),
      code: newCheatCode.trim(),
      enabled: true
    };
    const updated = [...cheats, newCheat];
    setCheats(updated);
    onUpdateGame({ ...game, cheats: updated });
    setNewCheatName('');
    setNewCheatCode('');
    setShowAddCheat(false);
    playAchievementSound();
  };

  const handleDeleteSaveState = (stateId: string) => {
    const updatedSaves = game.saveStates.filter((s) => s.id !== stateId);
    onUpdateGame({ ...game, saveStates: updatedSaves });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0a0b10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] text-white flex flex-col my-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          id="btn-modal-close"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner with Parallax Artwork */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black flex-shrink-0">
          <img
            src={game.bannerUrl || game.coverUrl}
            alt={game.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/60 to-transparent" />

          {/* Hero Floating Content */}
          <div className="absolute bottom-4 inset-x-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex gap-4 items-end">
              <img
                src={game.coverUrl}
                alt={game.title}
                referrerPolicy="no-referrer"
                className="w-24 h-32 sm:w-28 sm:h-38 rounded-2xl object-cover shadow-2xl border-2 border-white/20 -mb-2 bg-black flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${system?.badgeBg || 'bg-blue-600'}`}>
                    {system?.shortName}
                  </span>
                  <span className="text-xs font-mono text-white/50">
                    {game.year} • {game.developer}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight line-clamp-1">
                  {game.title}
                </h2>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {game.genre.map((g) => (
                    <span key={g} className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-medium text-white/80 border border-white/5">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch & Favorite Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-details-fav"
                onClick={handleToggleFavorite}
                className={`p-3 rounded-2xl border transition-all ${
                  game.isFavorite
                    ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${game.isFavorite ? 'fill-black' : ''}`} />
              </button>

              <button
                id="btn-details-play"
                onClick={handleLaunch}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-black text-sm uppercase tracking-wider text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/20 transition-all active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>LAUNCH GAME</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-white/10 bg-[#0a0b10] flex-shrink-0 text-sm font-semibold text-white/50">
          {[
            { id: 'overview', label: 'Overview & Specs' },
            { id: 'saves', label: `Save States (${game.saveStates?.length || 0})` },
            { id: 'cheats', label: `Cheats / GameShark (${cheats.length})` },
            { id: 'achievements', label: `Achievements (${game.achievements?.length || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playSelectSound();
                setActiveTab(tab.id as any);
              }}
              className={`pb-3 relative transition-colors ${
                activeTab === tab.id ? 'text-blue-400 font-bold' : 'hover:text-white'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left 2 Cols: Description & Details */}
              <div className="md:col-span-2 space-y-5">
                <div>
                  <h4 className="text-xs uppercase font-mono font-bold text-blue-400 tracking-wider mb-1.5">
                    Synopsis
                  </h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Core Selector Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Active Emulation Core
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Vulkan JIT Loaded
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {system?.availableCores.map((cName) => (
                      <button
                        key={cName}
                        onClick={() => handleCoreChange(cName)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          selectedCore === cName
                            ? 'bg-blue-600/20 border-blue-400 text-blue-300 font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                            : 'bg-black/30 border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="line-clamp-1">{cName}</span>
                        {selectedCore === cName && <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Technical File Specs */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                  <h4 className="font-mono uppercase font-bold text-white/80 tracking-wider border-b border-white/10 pb-2">
                    ROM Information
                  </h4>

                  <div className="space-y-2 font-mono text-white/50">
                    <div className="flex justify-between">
                      <span>ROM File:</span>
                      <span className="text-white/80 text-right truncate max-w-[140px]">{game.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>File Size:</span>
                      <span className="text-white/80">{game.fileSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Playtime:</span>
                      <span className="text-blue-400 font-bold">
                        {Math.round(game.playtimeMinutes / 60)}h {game.playtimeMinutes % 60}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Publisher:</span>
                      <span className="text-white/80">{game.publisher}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-amber-400 uppercase">{game.completionStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saves Tab */}
          {activeTab === 'saves' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold uppercase text-neutral-300">
                  Visual Save State Manager
                </h4>
                <span className="text-xs font-mono text-cyan-400">
                  {game.saveStates?.length || 0} / 10 Slots
                </span>
              </div>

              {(!game.saveStates || game.saveStates.length === 0) ? (
                <div className="p-8 rounded-2xl bg-neutral-900/50 border border-dashed border-white/10 text-center space-y-2">
                  <Clock className="w-8 h-8 text-neutral-500 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-300">No Save States Yet</p>
                  <p className="text-xs text-neutral-500">
                    Press the Save icon during gameplay to create instant state snapshots.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {game.saveStates.map((st) => (
                    <div
                      key={st.id}
                      className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold">
                            Slot #{st.slotNumber}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {new Date(st.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 font-medium mt-1">
                          {st.notes || 'Instant Quick State'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLaunch()}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteSaveState(st.id)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/60 text-neutral-400 hover:text-rose-300 transition-colors"
                          title="Delete slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cheats Tab */}
          {activeTab === 'cheats' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-neutral-300">
                    GameShark & Action Replay Codes
                  </h4>
                  <p className="text-xs text-neutral-500">Inject memory hacks directly into the emulation core</p>
                </div>
                <button
                  onClick={() => setShowAddCheat(!showAddCheat)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Code</span>
                </button>
              </div>

              {/* Add Custom Cheat Form */}
              {showAddCheat && (
                <form onSubmit={handleAddCustomCheat} className="p-4 rounded-2xl bg-neutral-900 border border-purple-500/30 space-y-3">
                  <h5 className="text-xs font-bold text-purple-300 uppercase">New Cheat Entry</h5>
                  <input
                    type="text"
                    placeholder="Cheat Title (e.g. Max Gold / Unlimited Ammo)"
                    value={newCheatName}
                    onChange={(e) => setNewCheatName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400"
                    required
                  />
                  <textarea
                    placeholder="Hex Memory Code (e.g. 80097CB8 0054 or _C1 Inf HP...)"
                    value={newCheatCode}
                    onChange={(e) => setNewCheatCode(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-white/10 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-purple-400"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCheat(false)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                    >
                      Save Cheat
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {cheats.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-neutral-100">{c.name}</h5>
                      {c.description && <p className="text-[11px] text-neutral-400 mt-0.5">{c.description}</p>}
                      <pre className="text-[10px] font-mono text-purple-400 mt-1 bg-black/40 px-2 py-1 rounded inline-block">
                        {c.code}
                      </pre>
                    </div>

                    <input
                      type="checkbox"
                      checked={c.enabled}
                      onChange={() => handleToggleCheat(c.id)}
                      className="w-5 h-5 accent-purple-500 rounded cursor-pointer flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-neutral-300">
                    RetroAchievements
                  </h4>
                  <p className="text-xs text-neutral-500">Live achievement triggers verified with core memory inspector</p>
                </div>
              </div>

              {(!game.achievements || game.achievements.length === 0) ? (
                <div className="p-8 rounded-2xl bg-neutral-900/50 border border-dashed border-white/10 text-center space-y-2">
                  <Trophy className="w-8 h-8 text-neutral-500 mx-auto" />
                  <p className="text-sm font-semibold text-neutral-300">No Achievements Set</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {game.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                        ach.unlocked
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                          : 'bg-neutral-900/60 border-white/10 text-neutral-400 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          ach.unlocked ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className={`text-xs font-bold ${ach.unlocked ? 'text-white' : 'text-neutral-300'}`}>
                            {ach.title}
                          </h5>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{ach.description}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono flex-shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          ach.unlocked ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-neutral-800 text-neutral-500'
                        }`}>
                          +{ach.points} PTS
                        </span>
                        {ach.unlocked && (
                          <span className="block text-[10px] text-emerald-400 mt-1">Unlocked ✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
