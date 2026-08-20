import { GameItem } from '../types';

export const DEFAULT_GAMES: GameItem[] = [
  // PPSSPP
  {
    id: 'psp-wipeout-pure',
    title: 'WipEout Pure FX',
    systemId: 'psp',
    core: 'PPSSPP Standalone (Vulkan)',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    year: 2005,
    developer: 'Studio Liverpool',
    publisher: 'Sony Computer Entertainment',
    genre: ['Anti-Gravity Racing', 'Sci-Fi', 'Electronic'],
    rating: 4.9,
    description: 'Blistering fast anti-gravity racing running in crisp 60 FPS at 3x native resolution on the PPSSPP core with FXAA and custom audio latency.',
    fileSize: '742 MB',
    fileName: 'WipEout_Pure_USA.cso',
    playtimeMinutes: 185,
    lastPlayed: Date.now() - 1000 * 60 * 45,
    isFavorite: true,
    completionStatus: 'playing',
    demoType: 'psp-3d',
    saveStates: [
      { id: 's1', gameId: 'psp-wipeout-pure', slotNumber: 1, timestamp: Date.now() - 1000 * 60 * 60 * 2, playtimeSeconds: 7200, notes: 'Zone Mode 45 - Mach 1 Speed' },
      { id: 's2', gameId: 'psp-wipeout-pure', slotNumber: 2, timestamp: Date.now() - 1000 * 60 * 60 * 24, playtimeSeconds: 3600, notes: 'Sebenco Peak Gold Medal' }
    ],
    cheats: [
      { id: 'c1', name: 'Infinite Shield Energy', code: '_C1 Inf Shield\n_L 0x2034A010 0x00000064', enabled: false, description: 'Shield never depletes during weapon bombardment' },
      { id: 'c2', name: 'Unlock All Zone Craft', code: '_C1 Unlock Zone Ships\n_L 0x2034A120 0x00000001', enabled: true, description: 'Unlock prototype stealth and supersonic vehicles' },
      { id: 'c3', name: 'Always 60 FPS Lock', code: '_C1 60 FPS Hack\n_L 0x2001A040 0x00000001', enabled: true, description: 'Forces high framerate rendering pipeline' }
    ],
    achievements: [
      { id: 'a1', title: 'Supersonic Ace', description: 'Survive 30 consecutive speed zones without crashing', points: 25, icon: 'Zap', unlocked: true, unlockedAt: Date.now() - 1000 * 60 * 60 * 2 },
      { id: 'a2', title: 'Vector Class Champion', description: 'Finish first place in all Gold leagues', points: 50, icon: 'Trophy', unlocked: true, unlockedAt: Date.now() - 1000 * 60 * 60 * 24 },
      { id: 'a3', title: 'Perfect Line', description: 'Complete a lap without touching any wall barriers', points: 15, icon: 'Shield', unlocked: false }
    ]
  },
  {
    id: 'psp-god-of-war-ghost',
    title: 'God of War: Ghost of Sparta',
    systemId: 'psp',
    core: 'PPSSPP Standalone (Vulkan)',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    year: 2010,
    developer: 'Ready at Dawn / Santa Monica',
    publisher: 'Sony Computer Entertainment',
    genre: ['Action-Adventure', 'Hack and Slash', 'Mythology'],
    rating: 4.8,
    description: 'Experience Kratos journey to discover the origins of his brother Deimos with stunning visual effects upscaled to 1080p Vulkan.',
    fileSize: '1.2 GB',
    fileName: 'God_of_War_Ghost_of_Sparta.iso',
    playtimeMinutes: 420,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 5,
    isFavorite: true,
    completionStatus: 'beaten',
    demoType: 'psp-3d',
    saveStates: [
      { id: 's3', gameId: 'psp-god-of-war-ghost', slotNumber: 1, timestamp: Date.now() - 1000 * 60 * 60 * 36, playtimeSeconds: 21600, notes: 'Domain of Death - Final Battle' }
    ],
    cheats: [
      { id: 'c4', name: 'Max Red Orbs (999,999)', code: '_C1 Max Orbs\n_L 0x20349000 0x000F423F', enabled: false },
      { id: 'c5', name: 'Infinite Thera’s Bane (Fire Blades)', code: '_C1 Inf Fire\n_L 0x20349004 0x00000064', enabled: true }
    ],
    achievements: [
      { id: 'a4', title: 'Spartan Blood', description: 'Perform a 500-hit continuous combo', points: 30, icon: 'Flame', unlocked: true },
      { id: 'a5', title: 'Godlike Might', description: 'Acquire the Arms of Sparta shield and spear', points: 20, icon: 'Shield', unlocked: true }
    ]
  },

  // DuckStation (PS1)
  {
    id: 'ps1-castlevania-sotn',
    title: 'Castlevania: Symphony of the Night',
    systemId: 'ps1',
    core: 'DuckStation (PGXP)',
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    year: 1997,
    developer: 'Konami',
    publisher: 'Konami',
    genre: ['Metroidvania', 'Action RPG', 'Gothic Fantasy'],
    rating: 5.0,
    description: 'The crowning masterpiece of 2D action RPGs. Enhanced in DuckStation with 24-bit true color palette, anti-dither filters, and PGXP precision.',
    fileSize: '480 MB',
    fileName: 'Castlevania_SotN.chd',
    playtimeMinutes: 340,
    lastPlayed: Date.now() - 1000 * 60 * 120,
    isFavorite: true,
    completionStatus: 'playing',
    demoType: 'ps1-lowpoly',
    saveStates: [
      { id: 's4', gameId: 'ps1-castlevania-sotn', slotNumber: 1, timestamp: Date.now() - 1000 * 60 * 300, playtimeSeconds: 15400, notes: 'Inverted Castle - Colosseum 189.4%' }
    ],
    cheats: [
      { id: 'c6', name: 'Have Crissaegrim Sword', code: '80097CB8 0054', enabled: false, description: 'Equip the legendary wind whirlwind blade' },
      { id: 'c7', name: 'Infinite Heart Points', code: '80097C26 03E7', enabled: true }
    ],
    achievements: [
      { id: 'a6', title: 'What is a Man?', description: 'Defeat Dracula in the prologue without taking damage', points: 20, icon: 'Award', unlocked: true },
      { id: 'a7', title: 'Flip The World', description: 'Enter the Inverted Castle', points: 40, icon: 'Layers', unlocked: true },
      { id: 'a8', title: '200.6% Map Master', description: 'Discover every single room in both castles', points: 100, icon: 'Map', unlocked: false }
    ]
  },
  {
    id: 'ps1-metal-gear-solid',
    title: 'Metal Gear Solid (Tactical Espionage)',
    systemId: 'ps1',
    core: 'DuckStation (PGXP)',
    coverUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    year: 1998,
    developer: 'Konami Computer Entertainment Japan',
    publisher: 'Konami',
    genre: ['Stealth Action', 'Cinematic', 'Military'],
    rating: 4.9,
    description: 'Solid Snake infiltrates Shadow Moses Island. Running with DuckStation PGXP perspective texture correction eliminating PS1 polygon jitter.',
    fileSize: '650 MB',
    fileName: 'Metal_Gear_Solid_Disc1.chd',
    playtimeMinutes: 290,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 8,
    isFavorite: true,
    completionStatus: 'beaten',
    demoType: 'ps1-lowpoly',
    saveStates: [
      { id: 's5', gameId: 'ps1-metal-gear-solid', slotNumber: 1, timestamp: Date.now() - 1000 * 60 * 60 * 48, playtimeSeconds: 12000, notes: 'Psycho Mantis Boss Fight Controller Port 2' }
    ],
    cheats: [
      { id: 'c8', name: 'Infinite SOCOM & FAMAS Ammo', code: '800B653C 00FF', enabled: true },
      { id: 'c9', name: 'Stealth Camouflage Always On', code: '800B6570 0001', enabled: false }
    ],
    achievements: [
      { id: 'a9', title: 'Mind Over Matter', description: 'Defeat Psycho Mantis using alternate controller slot', points: 30, icon: 'Brain', unlocked: true },
      { id: 'a10', title: 'Big Boss Rank', description: 'Complete the entire mission with zero alerts and zero kills', points: 100, icon: 'Crown', unlocked: false }
    ]
  },

  // PCSX2 (PS2)
  {
    id: 'ps2-shadow-colossus',
    title: 'Shadow of the Colossus',
    systemId: 'ps2',
    core: 'PCSX2 / AetherSX2',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    year: 2005,
    developer: 'Team Ico / Japan Studio',
    publisher: 'Sony Computer Entertainment',
    genre: ['Action-Adventure', 'Artistic', 'Boss Rush'],
    rating: 4.9,
    description: 'Wander and Agro explore the Forbidden Lands to conquer 16 colossal titans. Features Vulkan 16:9 widescreen patch and 60 FPS fix.',
    fileSize: '1.8 GB',
    fileName: 'Shadow_of_the_Colossus.iso',
    playtimeMinutes: 510,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 12,
    isFavorite: true,
    completionStatus: 'playing',
    demoType: 'psp-3d',
    saveStates: [],
    cheats: [
      { id: 'c10', name: 'Infinite Grip Stamina', code: 'patch=1,EE,00329014,extended,000000FF', enabled: true },
      { id: 'c11', name: 'Super Jump on Agro', code: 'patch=1,EE,00329088,extended,00000001', enabled: false }
    ],
    achievements: [
      { id: 'a11', title: 'The Wanderer Path', description: 'Slay the first Colossus Valus on the southern cliff', points: 15, icon: 'Shield', unlocked: true },
      { id: 'a12', title: 'Avian Slayer', description: 'Defeat Avion the fifth Colossus mid-flight in the lake', points: 35, icon: 'Flame', unlocked: true }
    ]
  },

  // MelonDS (NDS)
  {
    id: 'nds-pokemon-heartgold',
    title: 'Pokémon HeartGold & SoulSilver',
    systemId: 'nds',
    core: 'MelonDS 3D',
    coverUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    year: 2009,
    developer: 'Game Freak',
    publisher: 'The Pokémon Company / Nintendo',
    genre: ['JRPG', 'Adventure', 'Creature Collector'],
    rating: 4.9,
    description: 'Journey across Johto and Kanto with your partner Pokémon walking behind you. Dual touch-screen emulation with instant stylus gestures.',
    fileSize: '128 MB',
    fileName: 'Pokemon_HeartGold.nds',
    playtimeMinutes: 1240,
    lastPlayed: Date.now() - 1000 * 60 * 20,
    isFavorite: true,
    completionStatus: 'playing',
    demoType: 'nds-dualtouch',
    saveStates: [
      { id: 's6', gameId: 'nds-pokemon-heartgold', slotNumber: 1, timestamp: Date.now() - 1000 * 60 * 60 * 4, playtimeSeconds: 74000, notes: 'Mt. Silver - Ready to challenge Red' }
    ],
    cheats: [
      { id: 'c12', name: 'Fast Text Speed & Fast Surf', code: '9206A292 0000D000\n1206A292 0000E000\nD2000000 00000000', enabled: true },
      { id: 'c13', name: '100% Catch Rate Master Pokeball', code: '9224673A 00002801\n1224673A 00004280\nD2000000 00000000', enabled: false }
    ],
    achievements: [
      { id: 'a13', title: 'Johto League Champion', description: 'Defeat Lance and enter the Hall of Fame', points: 50, icon: 'Trophy', unlocked: true },
      { id: 'a14', title: 'Legend of Mt. Silver', description: 'Defeat Pokémon Trainer Red on the summit', points: 100, icon: 'Crown', unlocked: false }
    ]
  },

  // mGBA (GBA)
  {
    id: 'gba-metroid-fusion',
    title: 'Metroid Fusion',
    systemId: 'gba',
    core: 'mGBA Core',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    year: 2002,
    developer: 'Nintendo R&D1',
    publisher: 'Nintendo',
    genre: ['Sci-Fi Action', 'Metroidvania', 'Horror'],
    rating: 4.8,
    description: 'Samus Aran battles the lethal SA-X parasite aboard the BSL research station. Cycle-accurate mGBA audio with crisp GBA LCD shader.',
    fileSize: '16 MB',
    fileName: 'Metroid_Fusion.gba',
    playtimeMinutes: 320,
    lastPlayed: Date.now() - 1000 * 60 * 180,
    isFavorite: true,
    completionStatus: 'beaten',
    demoType: 'gba-platformer',
    saveStates: [],
    cheats: [
      { id: 'c14', name: 'Infinite Missiles & Super Missiles', code: '02038760 03E7', enabled: false },
      { id: 'c15', name: 'Always Maximum Energy Tanks', code: '02038758 03E7', enabled: true }
    ],
    achievements: [
      { id: 'a15', title: 'Predator & Prey', description: 'Escape the SA-X encounter in Sector 2 without being spotted', points: 25, icon: 'Eye', unlocked: true },
      { id: 'a16', title: 'Under 2 Hours Speedrun', description: 'Beat the entire mission in under 2 hours', points: 75, icon: 'Timer', unlocked: false }
    ]
  },

  // GameCube (Dolphin)
  {
    id: 'gc-super-smash-melee',
    title: 'Super Smash Bros. Melee',
    systemId: 'gc',
    core: 'Dolphin Core (UberShaders)',
    coverUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    year: 2001,
    developer: 'HAL Laboratory',
    publisher: 'Nintendo',
    genre: ['Fighting', 'Party', 'Competitive Platform Fighter'],
    rating: 4.9,
    description: 'Lightning-fast competitive combat with responsive input latency, widescreen 16:9 patch, and texture filtering on Dolphin Core.',
    fileSize: '1.3 GB',
    fileName: 'Super_Smash_Bros_Melee.rvz',
    playtimeMinutes: 890,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 2,
    isFavorite: true,
    completionStatus: 'playing',
    demoType: 'arcade-shooter',
    saveStates: [],
    cheats: [
      { id: 'c16', name: 'Unlock All 25 Characters & All Stages', code: '0415A708 00000001\n0415A70C 00000001', enabled: true },
      { id: 'c17', name: 'UCF 0.84 Universal Controller Fix', code: '0408A5E4 4E800020', enabled: true }
    ],
    achievements: [
      { id: 'a17', title: 'Target Smash Master', description: 'Clear all 25 Target Tests under 15 seconds each', points: 50, icon: 'Target', unlocked: true },
      { id: 'a18', title: 'Final Destination No Items', description: 'Defeat Crazy Hand on Very Hard with 1 stock', points: 60, icon: 'Flame', unlocked: false }
    ]
  },

  // SNES (Snes9x)
  {
    id: 'snes-chrono-trigger',
    title: 'Chrono Trigger',
    systemId: 'snes',
    core: 'Snes9x Current',
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    year: 1995,
    developer: 'Square Co.',
    publisher: 'Square Co.',
    genre: ['JRPG', 'Time Travel', 'Turn-Based Combat'],
    rating: 5.0,
    description: 'Timeless masterpiece spanning 65M BC to the End of Time. Rendered with Blargg NTSC composite scanline filter for authentic CRT vibe.',
    fileSize: '4.2 MB',
    fileName: 'Chrono_Trigger.sfc',
    playtimeMinutes: 980,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 18,
    isFavorite: true,
    completionStatus: 'completed',
    demoType: 'snes-space',
    saveStates: [],
    cheats: [
      { id: 'c18', name: 'Infinite Gold (9,999,999G)', code: '7E02C47F\n7E02C596\n7E02C698', enabled: false },
      { id: 'c19', name: 'All Dual & Triple Techs Unlocked', code: '7E2800FF', enabled: true }
    ],
    achievements: [
      { id: 'a19', title: 'Beyond the Ruins', description: 'Witness the post-apocalyptic future in 2300 AD', points: 20, icon: 'Clock', unlocked: true },
      { id: 'a20', title: 'Dream Project Ending', description: 'Defeat Lavos at the Millennial Fair in New Game+', points: 100, icon: 'Crown', unlocked: true }
    ]
  },

  // Sega Dreamcast (Flycast)
  {
    id: 'dc-crazy-taxi',
    title: 'Crazy Taxi Arcade',
    systemId: 'dreamcast',
    core: 'Flycast Per-Pixel',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    year: 1999,
    developer: 'Hitmaker / Sega',
    publisher: 'Sega',
    genre: ['Arcade Driving', 'Punk Rock', 'Score Attack'],
    rating: 4.7,
    description: 'Crazy stunts, insane fares, and high-speed drift physics running at 60 FPS VGA 480p on Flycast core.',
    fileSize: '410 MB',
    fileName: 'Crazy_Taxi_USA.chd',
    playtimeMinutes: 190,
    lastPlayed: Date.now() - 1000 * 60 * 60 * 72,
    isFavorite: false,
    completionStatus: 'playing',
    demoType: 'arcade-shooter',
    saveStates: [],
    cheats: [
      { id: 'c20', name: 'Infinite Passenger Timer', code: '02345000 000000FF', enabled: false },
      { id: 'c21', name: 'Crazy Bus Vehicle Unlocked', code: '02345010 00000001', enabled: true }
    ],
    achievements: [
      { id: 'a21', title: 'Awesome S-Class License', description: 'Earn over $10,000 in a single 10-minute shift', points: 40, icon: 'DollarSign', unlocked: true }
    ]
  }
];
