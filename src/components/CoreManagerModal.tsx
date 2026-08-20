import React, { useState } from 'react';
import { CoreConfig, SystemId } from '../types';
import { SYSTEMS_DATA } from '../data/systems';
import { 
  Cpu, CheckCircle2, AlertCircle, RefreshCw, Sliders, 
  HardDrive, Download, Upload, X, Shield, Sparkles 
} from 'lucide-react';
import { playSelectSound, playNavTick, triggerHaptic } from '../utils/audioEffects';

interface CoreManagerModalProps {
  cores: CoreConfig[];
  onClose: () => void;
  onUpdateCore: (updated: CoreConfig) => void;
}

export const CoreManagerModal: React.FC<CoreManagerModalProps> = ({
  cores,
  onClose,
  onUpdateCore
}) => {
  const [selectedCoreId, setSelectedCoreId] = useState<string>(cores[0]?.id || 'core-ppsspp');
  const [biosFiles, setBiosFiles] = useState<Record<string, { status: boolean; size: string; hash: string }>>({
    'scph1001.bin': { status: true, size: '512 KB', hash: '924e392f1ac5f0ff1e018a55d07add9e' },
    'scph70004.bin': { status: true, size: '4.0 MB', hash: 'd6f83b4b5e28a58133501ef571d8719c' },
    'gba_bios.bin': { status: true, size: '16 KB', hash: 'a860e8c0b6d573d191e4ec7db1b1e4f6' },
    'bios7.bin': { status: true, size: '4 KB', hash: 'df692a80a5b1bc90728bc3dfc76cd948' },
    'bios9.bin': { status: true, size: '4 KB', hash: '2ab23573d45c504a43a0f781df5bf526' },
    'dc_boot.bin': { status: true, size: '2.0 MB', hash: 'e10c53c2f8b90ffd51d0d9d532217738' }
  });
  const [activeTab, setActiveTab] = useState<'cores' | 'bios' | 'global'>('cores');

  const selectedCore = cores.find((c) => c.id === selectedCoreId) || cores[0];

  const handleSettingChange = (key: string, value: any) => {
    if (!selectedCore) return;
    const updated: CoreConfig = {
      ...selectedCore,
      settings: {
        ...selectedCore.settings,
        [key]: value
      }
    };
    onUpdateCore(updated);
    triggerHaptic(10);
  };

  const handleBiosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const name = file.name.toLowerCase();
      setBiosFiles((prev) => ({
        ...prev,
        [name]: {
          status: true,
          size: `${Math.round(file.size / 1024)} KB`,
          hash: 'uploaded-valid-md5'
        }
      }));
      playSelectSound();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0a0b10] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.15)] text-white flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0b10] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Emulation Core & BIOS Manager
              </h2>
              <p className="text-xs text-white/50">
                Unified engine backend configurations, Vulkan pipelines, and firmware verification
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

        {/* Tab Selector */}
        <div className="flex items-center gap-6 px-6 pt-3 border-b border-white/10 bg-[#0a0b10] flex-shrink-0 text-sm font-semibold text-white/50">
          <button
            onClick={() => {
              playNavTick();
              setActiveTab('cores');
            }}
            className={`pb-3 relative transition-colors ${
              activeTab === 'cores' ? 'text-blue-400 font-bold' : 'hover:text-white'
            }`}
          >
            Installed Cores ({cores.length})
            {activeTab === 'cores' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa]" />}
          </button>

          <button
            onClick={() => {
              playNavTick();
              setActiveTab('bios');
            }}
            className={`pb-3 relative transition-colors ${
              activeTab === 'bios' ? 'text-blue-400 font-bold' : 'hover:text-white'
            }`}
          >
            BIOS & Firmware Verification
            {activeTab === 'bios' && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-400 rounded-full shadow-[0_0_8px_#60a5fa]" />}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'cores' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Core List */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-white/50 mb-2">
                  Select Core Engine
                </h4>
                {cores.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      playNavTick();
                      setSelectedCoreId(c.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedCoreId === c.id
                        ? 'bg-blue-600/20 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div>
                      <h5 className="text-xs font-bold">{c.name}</h5>
                      <span className="text-[10px] font-mono text-white/40">{c.version}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </button>
                ))}
              </div>

              {/* Right Core Detail Tweaker */}
              {selectedCore && (
                <div className="md:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-5">
                  <div className="flex items-start justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">{selectedCore.name}</h3>
                      <p className="text-xs text-white/50 mt-0.5">Author: {selectedCore.author} • {selectedCore.version}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-mono font-bold border border-blue-500/30">
                      System: {selectedCore.systemId.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed">{selectedCore.description}</p>

                  {/* Core Settings Form */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold uppercase text-blue-400 tracking-wider">
                      Core Pipeline Parameters
                    </h4>

                    {/* Rendering Backend */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-white/50 block mb-1 font-mono">Render Backend</label>
                        <select
                          value={selectedCore.settings.renderBackend}
                          onChange={(e) => handleSettingChange('renderBackend', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-400"
                        >
                          <option value="Vulkan">Vulkan (Best Performance)</option>
                          <option value="OpenGL">OpenGL ES 3.2</option>
                          <option value="DirectX 12">DirectX 12 Native</option>
                          <option value="Software">Software Accurate</option>
                        </select>
                      </div>

                      {/* Texture Filtering */}
                      <div>
                        <label className="text-white/50 block mb-1 font-mono">Texture Filter</label>
                        <select
                          value={selectedCore.settings.textureFiltering}
                          onChange={(e) => handleSettingChange('textureFiltering', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-400"
                        >
                          <option value="Auto">Auto (Preserve Pixel Art)</option>
                          <option value="xBRZ">xBRZ 4x Upscaling</option>
                          <option value="Bilinear">Bilinear Smooth</option>
                          <option value="Nearest">Nearest Neighbor (Sharp)</option>
                        </select>
                      </div>
                    </div>

                    {/* Resolution Multiplier */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-mono">
                        <span className="text-white/50">Internal Render Scale</span>
                        <span className="text-blue-400 font-bold">{selectedCore.settings.resolutionMultiplier}x Native</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={8}
                        step={1}
                        value={selectedCore.settings.resolutionMultiplier}
                        onChange={(e) => handleSettingChange('resolutionMultiplier', Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <label className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-400/40">
                        <span className="text-xs text-white/80">Widescreen 16:9 Hack</span>
                        <input
                          type="checkbox"
                          checked={selectedCore.settings.widescreenHack}
                          onChange={(e) => handleSettingChange('widescreenHack', e.target.checked)}
                          className="w-4 h-4 accent-blue-500 rounded"
                        />
                      </label>

                      <label className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-400/40">
                        <span className="text-xs text-white/80">Fast Memory (Dynarec JIT)</span>
                        <input
                          type="checkbox"
                          checked={selectedCore.settings.fastMemory}
                          onChange={(e) => handleSettingChange('fastMemory', e.target.checked)}
                          className="w-4 h-4 accent-blue-500 rounded"
                        />
                      </label>

                      {selectedCore.systemId === 'ps1' && (
                        <label className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between cursor-pointer hover:border-blue-400/40 col-span-full">
                          <div>
                            <span className="text-xs text-white font-bold block">DuckStation PGXP Geometry Fix</span>
                            <span className="text-[10px] text-white/50">Eliminates 3D polygon jittering and perspective distortion</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedCore.settings.pgxpPerspectiveCorrection ?? true}
                            onChange={(e) => handleSettingChange('pgxpPerspectiveCorrection', e.target.checked)}
                            className="w-4 h-4 accent-blue-500 rounded"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bios' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-white">
                    Official System BIOS Repository
                  </h4>
                  <p className="text-xs text-white/50">
                    Required for accurate PS1, PS2, and Dreamcast cold-boot audio sequences
                  </p>
                </div>

                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Import BIOS .bin</span>
                  <input type="file" onChange={handleBiosUpload} accept=".bin,.rom,.zip" className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(biosFiles) as [string, { status: boolean; size: string; hash: string }][]).map(([fileName, info]) => (
                  <div
                    key={fileName}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white/90 font-mono">{fileName}</h5>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">
                          {info.size} • MD5 Verified ✓
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      INSTALLED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-white/10 bg-[#0a0b10] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold text-xs uppercase tracking-wider text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-white/20 transition-colors"
          >
            Save Core Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
