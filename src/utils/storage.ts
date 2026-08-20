import { GameItem, CoreConfig, ControllerMapping, AppTheme } from '../types';
import { DEFAULT_GAMES } from '../data/defaultGames';
import { INITIAL_CORES } from '../data/systems';

const STORAGE_KEYS = {
  GAMES: 'omnicore_games_v1',
  CORES: 'omnicore_cores_v1',
  CONTROLLER: 'omnicore_controller_v1',
  THEME: 'omnicore_theme_v1',
  SOUND: 'omnicore_sound_v1'
};

export const DEFAULT_CONTROLLER_CONFIG: ControllerMapping = {
  dpadUp: 'ArrowUp',
  dpadDown: 'ArrowDown',
  dpadLeft: 'ArrowLeft',
  dpadRight: 'ArrowRight',
  btnNorth: 'KeyI', // Triangle / X
  btnEast: 'KeyL',  // Circle / A
  btnSouth: 'KeyK', // Cross / B
  btnWest: 'KeyJ',  // Square / Y
  btnL1: 'KeyQ',
  btnR1: 'KeyE',
  btnL2: 'KeyU',
  btnR2: 'KeyO',
  btnL3: 'KeyZ',
  btnR3: 'KeyC',
  btnSelect: 'KeyN',
  btnStart: 'KeyM',
  btnHome: 'Escape',
  touchControlsEnabled: true,
  touchOpacity: 0.75,
  touchHaptics: true,
  touchScale: 1.0,
  analogDeadzone: 0.15
};

export function loadStoredGames(): GameItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAMES);
    if (!raw) return DEFAULT_GAMES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_GAMES;
  } catch {
    return DEFAULT_GAMES;
  }
}

export function saveStoredGames(games: GameItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  } catch (err) {
    console.warn('Failed to save games to localStorage', err);
  }
}

export function loadStoredCores(): CoreConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CORES);
    if (!raw) return INITIAL_CORES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CORES;
  } catch {
    return INITIAL_CORES;
  }
}

export function saveStoredCores(cores: CoreConfig[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CORES, JSON.stringify(cores));
  } catch (err) {
    console.warn('Failed to save cores to localStorage', err);
  }
}

export function loadStoredController(): ControllerMapping {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTROLLER);
    if (!raw) return DEFAULT_CONTROLLER_CONFIG;
    return { ...DEFAULT_CONTROLLER_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONTROLLER_CONFIG;
  }
}

export function saveStoredController(config: ControllerMapping) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTROLLER, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save controller config', err);
  }
}

export function loadStoredTheme(): AppTheme {
  try {
    const t = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme;
    if (t) return t;
  } catch {
    // Ignore
  }
  return 'dark-oled';
}

export function saveStoredTheme(theme: AppTheme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.warn('Failed to save theme', err);
  }
}
