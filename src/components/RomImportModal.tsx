import React, { useState } from 'react';
import { GameItem, SystemId } from '../types';
import { SYSTEMS_DATA } from '../data/systems';
import { 
  Upload, Sparkles, FolderPlus, X, CheckCircle2, 
  HelpCircle, Image as ImageIcon, Zap, Disc
} from 'lucide-react';
import { playSelectSound, playAchievementSound, triggerHaptic } from '../utils/audioEffects';

interface RomImportModalProps {
  onClose: () => void;
  onAddGame: (game: GameItem) => void;
}

export const RomImportModal: React.FC<RomImportModalProps> = ({
  onClose,
  onAddGame
}) => {
  const [title, setTitle] = useState('');
  const [systemId, setSystemId] = useState<SystemId>('psp');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('450 MB');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80');
  const [year, setYear] = useState(2005);
  const [developer, setDeveloper] = useState('PlayStation Studios');
  const [genre, setGenre] = useState('Action, Adventure');
  const [description, setDescription] = useState('Custom imported ROM ready to run on the unified emulation core.');
  const [isDragging, setIsDragging] = useState(false);

  // Auto-detect system based on file extension
  const detectSystemFromExtension = (filename: string): SystemId => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.cso') || lower.endsWith('.pbp')) return 'psp';
    if (lower.endsWith('.chd') || lower.endsWith('.cue') || lower.endsWith('.bin')) return 'ps1';
    if (lower.endsWith('.nds') || lower.endsWith('.dsi')) return 'nds';
    if (lower.endsWith('.gba') || lower.endsWith('.gbc') || lower.endsWith('.gb')) return 'gba';
    if (lower.endsWith('.sfc') || lower.endsWith('.smc')) return 'snes';
    if (lower.endsWith('.z64') || lower.endsWith('.n64')) return 'n64';
    if (lower.endsWith('.gcm') || lower.endsWith('.rvz')) return 'gc';
    if (lower.endsWith('.cdi') || lower.endsWith('.gdi')) return 'dreamcast';
    if (lower.endsWith('.iso')) return 'psp';
    return 'psp';
  };

  const handleFileDrop = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' ');
    const detectedSys = detectSystemFromExtension(file.name);
    
    setTitle(cleanName);
    setFileName(file.name);
    setSystemId(detectedSys);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    playSelectSound();
    triggerHaptic(20);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const sysObj = SYSTEMS_DATA.find((s) => s.id === systemId);
    const newGame: GameItem = {
      id: `custom-rom-${Date.now()}`,
      title: title.trim(),
      systemId: systemId,
      core: sysObj?.defaultCore || 'PPSSPP Standalone (Vulkan)',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
      bannerUrl: bannerUrl || coverUrl,
      year: Number(year) || 2005,
      developer: developer || 'Unknown Developer',
      publisher: sysObj?.manufacturer || 'Custom',
      genre: genre.split(',').map((g) => g.trim()),
      rating: 4.8,
      description: description || 'Imported ROM playable with custom controls and shaders.',
      fileSize: fileSize || '350 MB',
      fileName: fileName || `${title.replace(/\s+/g, '_')}.iso`,
      isCustomRom: true,
      playtimeMinutes: 0,
      isFavorite: false,
      completionStatus: 'playing',
      saveStates: [],
      cheats: [],
      achievements: [
        { id: 'custom-ach-1', title: 'First Boot', description: 'Boot up this custom title', points: 10, icon: 'Zap', unlocked: true }
      ]
    };

    onAddGame(newGame);
    playAchievementSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0a0b10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] text-white flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0b10] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Import ROM / Game File
              </h2>
              <p className="text-xs text-white/50">
                Add .iso, .cso, .chd, .pbp, .gba, .nds, .sfc or custom backups to your library
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileDrop(e.dataTransfer.files);
            }}
            className={`p-6 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'border-white/15 bg-white/5 hover:border-blue-400/40 hover:bg-white/10'
            }`}
          >
            <input
              type="file"
              id="rom-file-input"
              onChange={(e) => handleFileDrop(e.target.files)}
              className="hidden"
              accept=".iso,.cso,.chd,.pbp,.gba,.nds,.sfc,.smc,.z64,.n64,.gcm,.rvz,.cdi,.zip"
            />
            <label htmlFor="rom-file-input" className="cursor-pointer block space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Drag and drop your ROM file here, or <span className="text-blue-400 underline">Browse</span>
                </p>
                <p className="text-[11px] text-white/50 font-mono mt-0.5">
                  Supports ISO, CSO, CHD, PBP, GBA, NDS, SFC, Z64, RVZ
                </p>
              </div>
            </label>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Title */}
            <div className="sm:col-span-2">
              <label className="text-white/80 font-semibold block mb-1">Game Title</label>
              <input
                type="text"
                placeholder="e.g. Gran Turismo Portable"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400 font-medium"
                required
              />
            </div>

            {/* Target Platform Core */}
            <div>
              <label className="text-white/80 font-semibold block mb-1">Platform / System Core</label>
              <select
                value={systemId}
                onChange={(e) => setSystemId(e.target.value as SystemId)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-400"
              >
                {SYSTEMS_DATA.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.defaultCore.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Release Year */}
            <div>
              <label className="text-white/80 font-semibold block mb-1">Release Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Developer */}
            <div>
              <label className="text-white/80 font-semibold block mb-1">Developer</label>
              <input
                type="text"
                placeholder="e.g. Polyphony Digital"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="text-white/80 font-semibold block mb-1">Genre(s)</label>
              <input
                type="text"
                placeholder="e.g. Racing, Simulation"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Cover Art URL */}
            <div className="sm:col-span-2">
              <label className="text-white/80 font-semibold block mb-1">Cover Artwork Image URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs placeholder-white/30 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-white/20 transition-transform active:scale-95"
            >
              Add To Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
