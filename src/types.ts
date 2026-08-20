export type SystemId = 
  | 'psp'
  | 'ps1'
  | 'ps2'
  | 'gc'
  | 'nds'
  | '3ds'
  | 'gba'
  | 'snes'
  | 'nes'
  | 'n64'
  | 'dreamcast'
  | 'arcade';

export interface SystemInfo {
  id: SystemId;
  name: string;
  shortName: string;
  manufacturer: string;
  year: number;
  icon: string;
  color: string;
  badgeBg: string;
  defaultCore: string;
  availableCores: string[];
  supportedExtensions: string[];
  biosRequired: boolean;
  biosName?: string;
  biosFound?: boolean;
  description: string;
}

export interface SaveState {
  id: string;
  gameId: string;
  slotNumber: number;
  timestamp: number;
  thumbnailUrl?: string;
  playtimeSeconds: number;
  notes?: string;
}

export interface CheatCode {
  id: string;
  name: string;
  code: string;
  description?: string;
  enabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameItem {
  id: string;
  title: string;
  systemId: SystemId;
  core: string;
  coverUrl: string;
  bannerUrl: string;
  year: number;
  developer: string;
  publisher: string;
  genre: string[];
  rating: number; // 0 to 5
  description: string;
  fileSize: string;
  fileName: string;
  romData?: string; // Base64 or Blob URL if custom uploaded
  isCustomRom?: boolean;
  playtimeMinutes: number;
  lastPlayed?: number;
  isFavorite: boolean;
  completionStatus: 'backlog' | 'playing' | 'beaten' | 'completed' | 'dropped';
  saveStates: SaveState[];
  cheats: CheatCode[];
  achievements: Achievement[];
  demoType?: 'psp-3d' | 'ps1-lowpoly' | 'gba-platformer' | 'nds-dualtouch' | 'snes-space' | 'arcade-shooter';
}

export interface CoreConfig {
  id: string;
  name: string;
  systemId: SystemId;
  version: string;
  author: string;
  description: string;
  installed: boolean;
  status: 'active' | 'ready' | 'update-available';
  settings: {
    resolutionMultiplier: number; // 1x to 8x
    renderBackend: 'Vulkan' | 'OpenGL' | 'DirectX 12' | 'Software';
    textureFiltering: 'Auto' | 'Bilinear' | 'Nearest' | 'xBRZ';
    shader: 'None' | 'CRT-Trinitron' | 'Scanlines' | 'LCD-Grid' | 'SharpBilinear' | 'xBRZ-4x';
    frameSkip: number; // 0 to 4
    widescreenHack: boolean;
    pgxpPerspectiveCorrection?: boolean; // For DuckStation
    fastMemory: boolean;
    audioLatencyMs: number;
  };
}

export interface ControllerMapping {
  dpadUp: string;
  dpadDown: string;
  dpadLeft: string;
  dpadRight: string;
  btnNorth: string; // Triangle / X / Y
  btnEast: string;  // Circle / A / B
  btnSouth: string; // Cross / B / A
  btnWest: string;  // Square / Y / X
  btnL1: string;
  btnR1: string;
  btnL2: string;
  btnR2: string;
  btnL3: string;
  btnR3: string;
  btnSelect: string;
  btnStart: string;
  btnHome: string;
  touchControlsEnabled: boolean;
  touchOpacity: number;
  touchHaptics: boolean;
  touchScale: number;
  analogDeadzone: number;
}

export type ViewMode = 'grid' | 'list' | 'console-tv';
export type AppTheme = 'dark-oled' | 'playstation-classic' | 'psp-silver' | 'cyberpunk-amber' | 'emerald-gameboy';
