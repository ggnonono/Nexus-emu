import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameItem, CoreConfig, ControllerMapping, SaveState } from '../types';
import { TouchGamepad } from './TouchGamepad';
import { 
  Play, Pause, FastForward, Rewind, Camera, Save, RotateCcw, 
  Settings2, Maximize2, Minimize2, X, Volume2, VolumeX, Sparkles,
  Zap, Shield, HelpCircle, Layers, Sliders
} from 'lucide-react';
import { 
  playGameBootSound, playAchievementSound, playSelectSound, 
  playNavTick, triggerHaptic 
} from '../utils/audioEffects';
import confetti from 'canvas-confetti';

interface GamePlayerProps {
  game: GameItem;
  core: CoreConfig;
  controllerConfig: ControllerMapping;
  onClose: (updatedGame: GameItem) => void;
  onSaveState: (state: SaveState) => void;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({
  game,
  core,
  controllerConfig,
  onClose,
  onSaveState
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ndsTouchCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [fastForwardRate, setFastForwardRate] = useState<number>(1);
  const [isRewinding, setIsRewinding] = useState(false);
  const [fps, setFps] = useState(60);
  const [activeShader, setActiveShader] = useState<string>(core.settings.shader || 'CRT-Trinitron');
  const [resolutionMultiplier, setResolutionMultiplier] = useState<number>(core.settings.resolutionMultiplier || 3);
  const [showHud, setShowHud] = useState(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showCheatsDrawer, setShowCheatsDrawer] = useState(false);
  const [activeCheats, setActiveCheats] = useState(game.cheats);
  const [notification, setNotification] = useState<string | null>('Booting core: ' + core.name);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volumeMuted, setVolumeMuted] = useState(false);
  const [playSessionSeconds, setPlaySessionSeconds] = useState(0);

  // Virtual Gamepad state for engine input
  const inputState = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    btnNorth: false,
    btnEast: false,
    btnSouth: false,
    btnWest: false,
    btnL1: false,
    btnR1: false,
    btnL2: false,
    btnR2: false,
    btnSelect: false,
    btnStart: false,
    stickX: 0,
    stickY: 0
  });

  // Game specific state engines
  const gameStateRef = useRef<any>({
    // Generic
    time: 0,
    score: 0,
    health: 100,
    maxHealth: 100,
    energy: 100,
    speed: 0,
    posX: 0,
    posY: 0,
    velX: 0,
    velY: 0,
    isGrounded: false,
    projectiles: [] as any[],
    particles: [] as any[],
    enemies: [] as any[],
    checkpointTime: 45.0,
    lap: 1,
    // History buffer for rewind capability
    historyBuffer: [] as any[]
  });

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  // Play boot sound on mount
  useEffect(() => {
    playGameBootSound();
    showToast(`Loaded ${game.title} on ${core.name}`);
  }, [game.title, core.name]);

  // Track playtime session
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaySessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Gamepad API (Physical Controller support)
  useEffect(() => {
    let animFrame: number;
    const pollGamepad = () => {
      if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[0];
        if (gp) {
          const deadzone = controllerConfig.analogDeadzone;
          const stickX = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
          const stickY = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;
          
          inputState.current.stickX = stickX;
          inputState.current.stickY = stickY;

          // Standard Gamepad layout
          inputState.current.btnSouth = !!gp.buttons[0]?.pressed; // A / Cross
          inputState.current.btnEast = !!gp.buttons[1]?.pressed;  // B / Circle
          inputState.current.btnWest = !!gp.buttons[2]?.pressed;  // X / Square
          inputState.current.btnNorth = !!gp.buttons[3]?.pressed; // Y / Triangle
          inputState.current.btnL1 = !!gp.buttons[4]?.pressed;
          inputState.current.btnR1 = !!gp.buttons[5]?.pressed;
          inputState.current.btnL2 = !!gp.buttons[6]?.pressed;
          inputState.current.btnR2 = !!gp.buttons[7]?.pressed;
          inputState.current.btnSelect = !!gp.buttons[8]?.pressed;
          inputState.current.btnStart = !!gp.buttons[9]?.pressed;
          inputState.current.up = !!gp.buttons[12]?.pressed || stickY < -0.4;
          inputState.current.down = !!gp.buttons[13]?.pressed || stickY > 0.4;
          inputState.current.left = !!gp.buttons[14]?.pressed || stickX < -0.4;
          inputState.current.right = !!gp.buttons[15]?.pressed || stickX > 0.4;
        }
      }
      animFrame = requestAnimationFrame(pollGamepad);
    };
    animFrame = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animFrame);
  }, [controllerConfig.analogDeadzone]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === controllerConfig.dpadLeft) inputState.current.left = true;
      if (code === controllerConfig.dpadRight) inputState.current.right = true;
      if (code === controllerConfig.dpadUp) inputState.current.up = true;
      if (code === controllerConfig.dpadDown) inputState.current.down = true;
      if (code === controllerConfig.btnSouth) inputState.current.btnSouth = true;
      if (code === controllerConfig.btnEast) inputState.current.btnEast = true;
      if (code === controllerConfig.btnNorth) inputState.current.btnNorth = true;
      if (code === controllerConfig.btnWest) inputState.current.btnWest = true;
      if (code === controllerConfig.btnL1) inputState.current.btnL1 = true;
      if (code === controllerConfig.btnR1) inputState.current.btnR1 = true;
      if (code === 'Space') {
        inputState.current.btnSouth = true;
      }
      if (code === 'KeyF') {
        // Toggle fast forward shortcut
        toggleFastForward();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === controllerConfig.dpadLeft) inputState.current.left = false;
      if (code === controllerConfig.dpadRight) inputState.current.right = false;
      if (code === controllerConfig.dpadUp) inputState.current.up = false;
      if (code === controllerConfig.dpadDown) inputState.current.down = false;
      if (code === controllerConfig.btnSouth) inputState.current.btnSouth = false;
      if (code === controllerConfig.btnEast) inputState.current.btnEast = false;
      if (code === controllerConfig.btnNorth) inputState.current.btnNorth = false;
      if (code === controllerConfig.btnWest) inputState.current.btnWest = false;
      if (code === controllerConfig.btnL1) inputState.current.btnL1 = false;
      if (code === controllerConfig.btnR1) inputState.current.btnR1 = false;
      if (code === 'Space') {
        inputState.current.btnSouth = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controllerConfig]);

  // Touch gamepad callbacks
  const handleTouchButtonDown = (btn: string) => {
    if (btn === 'UP') inputState.current.up = true;
    if (btn === 'DOWN') inputState.current.down = true;
    if (btn === 'LEFT') inputState.current.left = true;
    if (btn === 'RIGHT') inputState.current.right = true;
    if (btn === 'SOUTH') inputState.current.btnSouth = true;
    if (btn === 'EAST') inputState.current.btnEast = true;
    if (btn === 'NORTH') inputState.current.btnNorth = true;
    if (btn === 'WEST') inputState.current.btnWest = true;
    if (btn === 'L1') inputState.current.btnL1 = true;
    if (btn === 'R1') inputState.current.btnR1 = true;
    if (btn === 'L2') inputState.current.btnL2 = true;
    if (btn === 'R2') inputState.current.btnR2 = true;
    if (btn === 'SELECT') inputState.current.btnSelect = true;
    if (btn === 'START') inputState.current.btnStart = true;
  };

  const handleTouchButtonUp = (btn: string) => {
    if (btn === 'UP') inputState.current.up = false;
    if (btn === 'DOWN') inputState.current.down = false;
    if (btn === 'LEFT') inputState.current.left = false;
    if (btn === 'RIGHT') inputState.current.right = false;
    if (btn === 'SOUTH') inputState.current.btnSouth = false;
    if (btn === 'EAST') inputState.current.btnEast = false;
    if (btn === 'NORTH') inputState.current.btnNorth = false;
    if (btn === 'WEST') inputState.current.btnWest = false;
    if (btn === 'L1') inputState.current.btnL1 = false;
    if (btn === 'R1') inputState.current.btnR1 = false;
    if (btn === 'L2') inputState.current.btnL2 = false;
    if (btn === 'R2') inputState.current.btnR2 = false;
    if (btn === 'SELECT') inputState.current.btnSelect = false;
    if (btn === 'START') inputState.current.btnStart = false;
  };

  const handleTouchStickMove = (x: number, y: number) => {
    inputState.current.stickX = x;
    inputState.current.stickY = y;
    inputState.current.left = x < -0.3;
    inputState.current.right = x > 0.3;
    inputState.current.up = y < -0.3;
    inputState.current.down = y > 0.3;
  };

  // Main Graphics Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Calculate FPS
      frameCount++;
      if (now - fpsTimer >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        fpsTimer = now;
      }

      if (canvasRef.current && isPlaying) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Rewind logic
          if (isRewinding) {
            const history = gameStateRef.current.historyBuffer;
            if (history.length > 0) {
              const previousState = history.pop();
              Object.assign(gameStateRef.current, previousState);
            }
          } else {
            // Save snapshot for rewind buffer (keep up to 180 frames = 3 seconds)
            if (gameStateRef.current.historyBuffer.length > 180) {
              gameStateRef.current.historyBuffer.shift();
            }
            gameStateRef.current.historyBuffer.push({
              time: gameStateRef.current.time,
              score: gameStateRef.current.score,
              health: gameStateRef.current.health,
              speed: gameStateRef.current.speed,
              posX: gameStateRef.current.posX,
              posY: gameStateRef.current.posY,
              velX: gameStateRef.current.velX,
              velY: gameStateRef.current.velY,
              checkpointTime: gameStateRef.current.checkpointTime,
              lap: gameStateRef.current.lap
            });
          }

          // Step state by fast forward multiplier
          const stepMultiplier = isRewinding ? -1 : fastForwardRate;
          const effectiveDelta = Math.min(delta * stepMultiplier, 0.1);

          // Clear frame
          ctx.fillStyle = '#060709';
          ctx.fillRect(0, 0, width, height);

          // Render corresponding demo engine
          const demoType = game.demoType || (game.systemId === 'psp' ? 'psp-3d' : game.systemId === 'ps1' ? 'ps1-lowpoly' : game.systemId === 'nds' ? 'nds-dualtouch' : game.systemId === 'gba' ? 'gba-platformer' : 'snes-space');

          if (demoType === 'psp-3d') {
            renderPsp3dEngine(ctx, width, height, effectiveDelta);
          } else if (demoType === 'ps1-lowpoly') {
            renderPs1LowPolyEngine(ctx, width, height, effectiveDelta);
          } else if (demoType === 'nds-dualtouch') {
            renderNdsDuelEngine(ctx, width, height, effectiveDelta);
          } else if (demoType === 'gba-platformer') {
            renderGbaPlatformerEngine(ctx, width, height, effectiveDelta);
          } else if (demoType === 'snes-space') {
            renderSnesMode7Engine(ctx, width, height, effectiveDelta);
          } else {
            renderArcadeEngine(ctx, width, height, effectiveDelta);
          }

          // Apply Post-Processing Shaders (Scanlines, CRT curvature, LCD grid)
          applyShaderOverlay(ctx, width, height, activeShader);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, fastForwardRate, isRewinding, activeShader, game.demoType, game.systemId]);

  // Engine: PSP 3D Anti-Gravity Tunnel Racer (WipEout style)
  const renderPsp3dEngine = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const s = gameStateRef.current;
    s.time += dt;

    // Handle ship input
    const steer = (inputState.current.left ? -1 : 0) + (inputState.current.right ? 1 : 0) + inputState.current.stickX;
    const accel = inputState.current.btnSouth || inputState.current.btnR1; // Cross or R1
    const airbrake = inputState.current.btnL1 ? -1 : inputState.current.btnR1 ? 1 : 0;
    const turbo = inputState.current.btnNorth; // Triangle boost

    const targetSpeed = accel ? (turbo ? 850 : 540) : 220;
    s.speed += (targetSpeed - s.speed) * dt * 3;
    s.posX += (steer * 450 + airbrake * 200) * dt;
    s.posX = Math.max(-width * 0.38, Math.min(width * 0.38, s.posX));

    s.checkpointTime -= dt;
    if (s.checkpointTime <= 0) {
      s.checkpointTime = 45.0;
      s.lap += 1;
      playAchievementSound();
      showToast('Checkpoint Clear! +45s [Lap ' + s.lap + ']');
    }

    // 3D Perspective Grid & Tunnel
    const horizonY = height * 0.48;
    const speedFactor = s.speed / 500;

    // Cyberpunk gradient background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0a0a23');
    skyGrad.addColorStop(0.7, '#1b1442');
    skyGrad.addColorStop(1, '#ff007f');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonY);

    // Neon Cyber Sun
    ctx.beginPath();
    ctx.arc(width / 2, horizonY - 20, 60, Math.PI, 0);
    ctx.fillStyle = '#ffde59';
    ctx.shadowColor = '#ff597b';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ground Tunnel
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, '#100c2a');
    groundGrad.addColorStop(1, '#050410');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // Perspective Rings / Road Lines
    const numRings = 14;
    ctx.lineWidth = 2;
    for (let i = 0; i < numRings; i++) {
      const z = ((s.time * speedFactor * 4 + i) % numRings) / numRings;
      const ringY = horizonY + Math.pow(z, 2.2) * (height - horizonY);
      const ringWidth = Math.pow(z, 2.0) * width * 1.3;
      const alpha = Math.min(1, z * 1.5);

      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.moveTo((width - ringWidth) / 2 + s.posX * (1 - z), ringY);
      ctx.lineTo((width + ringWidth) / 2 + s.posX * (1 - z), ringY);
      ctx.stroke();

      // Side Neon Track Barriers
      ctx.fillStyle = i % 2 === 0 ? `rgba(255, 0, 128, ${alpha})` : `rgba(0, 240, 255, ${alpha})`;
      const leftX = (width - ringWidth) / 2 + s.posX * (1 - z);
      const rightX = (width + ringWidth) / 2 + s.posX * (1 - z);
      ctx.fillRect(leftX - 8 * z, ringY - 14 * z, 8 * z, 14 * z);
      ctx.fillRect(rightX, ringY - 14 * z, 8 * z, 14 * z);
    }

    // Speed Particles / Starfield
    if (Math.random() < 0.4) {
      s.particles.push({
        x: width / 2 + (Math.random() - 0.5) * width * 0.8,
        y: horizonY + Math.random() * (height - horizonY) * 0.4,
        z: 0.1,
        speed: 1.2 + Math.random() * 2
      });
    }

    ctx.fillStyle = '#ffffff';
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.z += p.speed * dt * speedFactor;
      const py = horizonY + Math.pow(p.z, 2) * (height - horizonY);
      const px = p.x + (p.x - width / 2) * p.z * 1.5;
      ctx.fillRect(px, py, Math.max(1, p.z * 4), Math.max(1, p.z * 4));
      if (p.z >= 1.2 || py > height) {
        s.particles.splice(i, 1);
      }
    }

    // Draw 3D Futuristic Craft (FEISAR / AG-Systems style)
    const shipX = width / 2 + s.posX * 0.15;
    const shipY = height * 0.76;
    const rollAngle = steer * 0.28;

    ctx.save();
    ctx.translate(shipX, shipY);
    ctx.rotate(rollAngle);

    // Jet Engine Thruster Glow & Particles
    const thrusterColor = turbo ? '#ff0055' : '#00ffff';
    ctx.shadowColor = thrusterColor;
    ctx.shadowBlur = turbo ? 35 : 18;
    ctx.fillStyle = thrusterColor;
    ctx.beginPath();
    ctx.ellipse(0, 18, 14, 6 + Math.sin(s.time * 30) * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ship Hull (Sleek Geometric Vector Craft)
    ctx.fillStyle = '#0f2444';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;

    // Main fuselage
    ctx.beginPath();
    ctx.moveTo(0, -38); // Nose
    ctx.lineTo(26, 12);
    ctx.lineTo(38, 16);
    ctx.lineTo(34, 24);
    ctx.lineTo(8, 20);
    ctx.lineTo(0, 22);
    ctx.lineTo(-8, 20);
    ctx.lineTo(-34, 24);
    ctx.lineTo(-38, 16);
    ctx.lineTo(-26, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Canopy Glass
    ctx.fillStyle = '#ff0077';
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(8, -2);
    ctx.lineTo(0, 4);
    ctx.lineTo(-8, -2);
    ctx.closePath();
    ctx.fill();

    // Wingtip Decals
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(28, 14, 8, 3);
    ctx.fillRect(-36, 14, 8, 3);

    ctx.restore();

    // On-screen PSP In-Game HUD
    renderInGameHud(ctx, width, height, {
      title: 'ZONE 32 • MACH 1.4',
      speed: Math.round(s.speed) + ' KM/H',
      timer: s.checkpointTime.toFixed(1) + 's',
      lap: 'LAP ' + s.lap + '/3',
      shield: 'SHIELD 100%',
      coreBadge: 'PPSSPP • Vulkan 3x • 60 FPS'
    });
  };

  // Engine: PS1 Low-Poly 3D Dungeon Crawler (Castlevania/MGS style)
  const renderPs1LowPolyEngine = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const s = gameStateRef.current;
    s.time += dt;

    // Input movements
    const moveX = (inputState.current.left ? -1 : 0) + (inputState.current.right ? 1 : 0) + inputState.current.stickX;
    const moveZ = (inputState.current.up ? 1 : 0) + (inputState.current.down ? -1 : 0) - inputState.current.stickY;
    const attack = inputState.current.btnWest || inputState.current.btnSouth; // Square or Cross

    s.posX += moveX * 180 * dt;
    s.posY += moveZ * 180 * dt;
    s.posX = Math.max(-160, Math.min(160, s.posX));
    s.posY = Math.max(-100, Math.min(100, s.posY));

    // Spawn / update bats
    if (s.enemies.length < 3 && Math.random() < 0.03) {
      s.enemies.push({
        x: (Math.random() - 0.5) * 300,
        y: 80 + Math.random() * 80,
        hp: 20,
        vx: (Math.random() - 0.5) * 60
      });
    }

    // 3D Gothic corridor wireframe / low poly tiles
    const cx = width / 2;
    const cy = height * 0.52;

    // PS1 Dithered dark background
    ctx.fillStyle = '#080811';
    ctx.fillRect(0, 0, width, height);

    // Floor Checkerboard
    for (let z = 6; z >= 1; z--) {
      const zDepth = z * 40 - (s.posY % 40);
      const scale = 240 / (zDepth + 100);
      const nextScale = 240 / (zDepth + 140);

      const y1 = cy + 40 * scale;
      const y2 = cy + 40 * nextScale;

      ctx.fillStyle = z % 2 === 0 ? '#1b1b2f' : '#141423';
      ctx.beginPath();
      ctx.moveTo(cx - 300 * scale + s.posX * scale, y1);
      ctx.lineTo(cx + 300 * scale + s.posX * scale, y1);
      ctx.lineTo(cx + 300 * nextScale + s.posX * nextScale, y2);
      ctx.lineTo(cx - 300 * nextScale + s.posX * nextScale, y2);
      ctx.fill();

      // Gothic Stone Columns
      ctx.fillStyle = '#2d2d44';
      ctx.strokeStyle = '#4e4e73';
      ctx.lineWidth = 1.5;
      const colX1 = cx - 240 * scale + s.posX * scale;
      const colX2 = cx + 240 * scale + s.posX * scale;
      ctx.fillRect(colX1, cy - 140 * scale, 30 * scale, 180 * scale);
      ctx.fillRect(colX2, cy - 140 * scale, 30 * scale, 180 * scale);
    }

    // Render Enemies (Gothic Vampire Bats)
    for (let i = s.enemies.length - 1; i >= 0; i--) {
      const bat = s.enemies[i];
      bat.x += bat.vx * dt;
      if (bat.x > 180 || bat.x < -180) bat.vx *= -1;

      const batScale = 240 / (bat.y + 120);
      const bx = cx + bat.x * batScale;
      const by = cy - 40 * batScale + Math.sin(s.time * 8 + i) * 15;

      // Low-poly PS1 bat
      ctx.fillStyle = '#ff2a5f';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 20 * batScale, by - 12 * batScale + Math.sin(s.time * 15) * 10);
      ctx.lineTo(bx - 12 * batScale, by + 8 * batScale);
      ctx.lineTo(bx + 12 * batScale, by + 8 * batScale);
      ctx.lineTo(bx + 20 * batScale, by - 12 * batScale + Math.sin(s.time * 15) * 10);
      ctx.closePath();
      ctx.fill();

      // Check player attack collision
      if (attack && Math.abs(bat.x - s.posX) < 45 && Math.abs(bat.y - (s.posY + 80)) < 60) {
        s.score += 150;
        triggerHaptic(25);
        playAchievementSound();
        showToast('Demon Bat Slain! +150 EXP');
        s.enemies.splice(i, 1);
      }
    }

    // Render Player Character (Alucard / Solid Snake style low-poly hero)
    const px = cx;
    const py = cy + 50;

    ctx.save();
    ctx.translate(px, py);

    // Cape & Armor
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#c5a059'; // Gold trim
    ctx.lineWidth = 2;

    // Body
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.lineTo(14, -20);
    ctx.lineTo(10, 15);
    ctx.lineTo(-10, 15);
    ctx.lineTo(-14, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Cape Swell
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-12, -22);
    ctx.lineTo(-26 + Math.sin(s.time * 8) * 8, 20);
    ctx.lineTo(0, 15);
    ctx.lineTo(26 + Math.cos(s.time * 8) * 8, 20);
    ctx.lineTo(12, -22);
    ctx.closePath();
    ctx.fill();

    // Attack Slash Blade Effect
    if (attack) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(15, -15, 38, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    renderInGameHud(ctx, width, height, {
      title: 'MARBLE GALLERY 189.4%',
      speed: 'HP 100/100',
      timer: 'MP 85/99',
      lap: 'EXP ' + s.score,
      shield: 'DUCKSTATION PGXP',
      coreBadge: 'DuckStation • PGXP Widescreen • 4K'
    });
  };

  // Engine: Nintendo DS Dual Touch Screen (MelonDS style)
  const renderNdsDuelEngine = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const s = gameStateRef.current;
    s.time += dt;

    // Split canvas vertically into Top Screen (3D battle arena) and Bottom Screen (Touch Stylus commands)
    const midY = height / 2;
    const screenGap = 12;

    // TOP SCREEN (Battle Arena)
    ctx.fillStyle = '#0a192f';
    ctx.fillRect(0, 0, width, midY - screenGap / 2);

    // Battle background gradient
    const battleGrad = ctx.createLinearGradient(0, 0, 0, midY);
    battleGrad.addColorStop(0, '#1e3a8a');
    battleGrad.addColorStop(0.6, '#3b82f6');
    battleGrad.addColorStop(1, '#93c5fd');
    ctx.fillStyle = battleGrad;
    ctx.fillRect(8, 8, width - 16, midY - screenGap / 2 - 16);

    // Battle Grass platform
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(width * 0.3, midY * 0.75, width * 0.22, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(width * 0.72, midY * 0.45, width * 0.18, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Enemy Pokemon (Lugia / Dragon)
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    const ex = width * 0.72;
    const ey = midY * 0.42 + Math.sin(s.time * 4) * 6;
    ctx.beginPath();
    ctx.arc(ex, ey, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Wings
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + 35, ey - 20 + Math.sin(s.time * 6) * 10);
    ctx.lineTo(ex + 20, ey + 10);
    ctx.fill();
    ctx.stroke();

    // Player Pokemon (Typhlosion / Charizard)
    const px = width * 0.3;
    const py = midY * 0.72 + Math.sin(s.time * 3) * 4;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(px, py, 28, 0, Math.PI * 2);
    ctx.fill();
    // Fire flames
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(px - 14, py - 14, 12 + Math.sin(s.time * 12) * 4, 0, Math.PI * 2);
    ctx.fill();

    // Health Box Top Screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.roundRect(16, 16, 170, 48, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('TYPHLOSION Lv.85', 26, 34);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(26, 42, 140, 6);

    // DIVIDER BAR (DS Hinge)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, midY - screenGap / 2, width, screenGap);
    ctx.fillStyle = '#475569';
    ctx.fillRect(width / 2 - 40, midY - 2, 80, 4);

    // BOTTOM TOUCH SCREEN (Stylus Menu Commands)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, midY + screenGap / 2, width, midY - screenGap / 2);

    // 4 Stylus Command Buttons (FIGHT, BAG, POKEMON, RUN)
    const btnW = (width - 48) / 2;
    const btnH = (midY - screenGap - 48) / 2;
    const topY = midY + screenGap / 2 + 16;
    const botY = topY + btnH + 12;

    const commands = [
      { name: '⚔️ FIGHT', color: '#ef4444', x: 16, y: topY },
      { name: '🎒 BAG', color: '#f59e0b', x: 24 + btnW, y: topY },
      { name: '🐾 POKÉMON', color: '#10b981', x: 16, y: botY },
      { name: '🏃 RUN', color: '#3b82f6', x: 24 + btnW, y: botY }
    ];

    commands.forEach((c) => {
      ctx.fillStyle = c.color;
      ctx.roundRect(c.x, c.y, btnW, btnH, 12);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.name, c.x + btnW / 2, c.y + btnH / 2 + 5);
    });

    ctx.textAlign = 'start';

    // Touch Stylus indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '11px monospace';
    ctx.fillText('Touch screen active • Stylus gesture ready', 20, height - 12);
  };

  // Engine: GBA 16-bit Metroidvania Platformer
  const renderGbaPlatformerEngine = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const s = gameStateRef.current;
    s.time += dt;

    // Movement & Gravity Physics
    const moveX = (inputState.current.left ? -1 : 0) + (inputState.current.right ? 1 : 0) + inputState.current.stickX;
    const jump = inputState.current.btnSouth; // A / Jump
    const shoot = inputState.current.btnWest || inputState.current.btnNorth; // B / Shoot

    s.velX = moveX * 220;
    s.posX += s.velX * dt;
    s.posX = Math.max(30, Math.min(width - 30, s.posX));

    // Gravity
    s.velY += 800 * dt;
    s.posY += s.velY * dt;

    const floorY = height * 0.75;
    if (s.posY >= floorY) {
      s.posY = floorY;
      s.velY = 0;
      s.isGrounded = true;
    }

    if (jump && s.isGrounded) {
      s.velY = -420;
      s.isGrounded = false;
      playNavTick();
    }

    // Shoot projectile
    if (shoot && (s.projectiles.length === 0 || s.time - s.projectiles[s.projectiles.length - 1].spawnTime > 0.18)) {
      s.projectiles.push({
        x: s.posX + (moveX < 0 ? -20 : 20),
        y: s.posY - 18,
        vx: moveX < 0 ? -500 : 500,
        spawnTime: s.time
      });
      playNavTick();
    }

    // Update projectiles
    for (let i = s.projectiles.length - 1; i >= 0; i--) {
      const p = s.projectiles[i];
      p.x += p.vx * dt;
      if (p.x < 0 || p.x > width) {
        s.projectiles.splice(i, 1);
      }
    }

    // Background: Sci-Fi Space Station Sector
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, width, height);

    // GBA LCD Grid tiles
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, floorY + 16, width, height - floorY);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, floorY + 14, width, 4);

    // Metallic Pipe tiles
    for (let x = 0; x < width; x += 48) {
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, floorY + 18, 44, 30);
    }

    // Floating Platform
    ctx.fillStyle = '#0284c7';
    ctx.roundRect(width * 0.35, floorY - 80, 160, 16, 4);
    ctx.fill();

    // Render Projectiles (Plasma Beam)
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    s.projectiles.forEach((p: any) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Render Samus / Power Suit Sprite
    ctx.save();
    ctx.translate(s.posX, s.posY);

    // Power Suit Body
    ctx.fillStyle = '#ea580c'; // Orange armor
    ctx.strokeStyle = '#15803d'; // Green visor
    ctx.lineWidth = 2;

    // Helmet & Visor
    ctx.beginPath();
    ctx.arc(0, -32, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(moveX < 0 ? -8 : 0, -34, 8, 4);

    // Torso & Arm Cannon
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-8, -22, 16, 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(moveX < 0 ? -16 : 8, -18, 10, 8); // Arm Cannon

    // Legs
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(-8, -2, 6, 16);
    ctx.fillRect(2, -2, 6, 16);

    ctx.restore();

    renderInGameHud(ctx, width, height, {
      title: 'BSL STATION - SECTOR 1',
      speed: 'ENERGY 99',
      timer: 'MISSILES 45',
      lap: 'mGBA CORE',
      shield: 'GBA LCD FILTER',
      coreBadge: 'mGBA • 16-bit Cycle Accurate'
    });
  };

  // Engine: SNES Mode-7 Space Shooter
  const renderSnesMode7Engine = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const s = gameStateRef.current;
    s.time += dt;

    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);

    // Mode-7 Rolling Starfield
    for (let i = 0; i < 60; i++) {
      const sx = (Math.sin(i * 123 + s.time * 0.5) * 0.5 + 0.5) * width;
      const sy = ((i * 37 + s.time * 200) % height);
      const sz = (i % 3) + 1;
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#38bdf8';
      ctx.fillRect(sx, sy, sz, sz);
    }

    // Space Fighter Jet
    const fx = width / 2 + (inputState.current.left ? -120 : inputState.current.right ? 120 : 0) * dt * 5;
    const fy = height * 0.78;

    ctx.save();
    ctx.translate(fx, fy);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(24, 15);
    ctx.lineTo(0, 5);
    ctx.lineTo(-24, 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    renderInGameHud(ctx, width, height, {
      title: 'CHRONO TIME WARP',
      speed: '12,000 BC',
      timer: 'EPOCH WINGS',
      lap: 'SNES9X',
      shield: 'MODE-7 READY',
      coreBadge: 'Snes9x • Mode 7 High-Res'
    });
  };

  // Engine: Classic Arcade / Bullet Combat
  const renderArcadeEngine = (ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) => {
    const s = gameStateRef.current;
    s.time += dt;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Neon grid lines
    ctx.strokeStyle = '#1e293b';
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    renderInGameHud(ctx, width, height, {
      title: 'ARCADE MASTER',
      speed: 'SCORE 45,900',
      timer: 'CREDIT 02',
      lap: 'WAVE 04',
      shield: 'INSERT COIN',
      coreBadge: 'FinalBurn Neo • 60 FPS'
    });
  };

  // Post-processing Shaders (Scanlines, CRT Trinitron, LCD-Grid, Bilinear)
  const applyShaderOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, shader: string) => {
    if (shader === 'None') return;

    if (shader === 'Scanlines' || shader === 'CRT-Trinitron') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1.2);
      }

      if (shader === 'CRT-Trinitron') {
        // CRT Vignette glow
        const radGrad = ctx.createRadialGradient(
          width / 2, height / 2, width * 0.35,
          width / 2, height / 2, width * 0.75
        );
        radGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (shader === 'LCD-Grid') {
      // GameBoy / NDS pixel grid
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let x = 0; x < width; x += 3) {
        ctx.fillRect(x, 0, 1, height);
      }
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }
    }
  };

  // In-game HUD overlay generator
  const renderInGameHud = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    hud: { title: string; speed: string; timer: string; lap: string; shield: string; coreBadge: string }
  ) => {
    if (!showHud) return;

    // Top status pill
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.roundRect(14, 14, 280, 36, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(hud.title, 26, 36);

    // Top right Core badge & FPS
    const rightText = `${fps} FPS • ${hud.coreBadge}`;
    ctx.font = '11px monospace';
    const textWidth = ctx.measureText(rightText).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.roundRect(width - textWidth - 32, 14, textWidth + 20, 36, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = fps >= 55 ? '#22c55e' : '#f59e0b';
    ctx.fillText(rightText, width - textWidth - 22, 36);
  };

  // Toggle Fast Forward rate (1x -> 2x -> 4x -> 8x -> 1x)
  const toggleFastForward = () => {
    playSelectSound();
    const rates = [1, 2, 4, 8];
    const nextIdx = (rates.indexOf(fastForwardRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setFastForwardRate(nextRate);
    showToast(`Fast Forward: ${nextRate}x Speed`);
  };

  // Save State Action
  const handleQuickSave = () => {
    playSelectSound();
    const newSave: SaveState = {
      id: 'save-' + Date.now(),
      gameId: game.id,
      slotNumber: (game.saveStates?.length || 0) + 1,
      timestamp: Date.now(),
      playtimeSeconds: playSessionSeconds,
      notes: `Quick State #${(game.saveStates?.length || 0) + 1} (${fps} FPS)`
    };
    onSaveState(newSave);
    showToast(`State saved to Slot #${newSave.slotNumber}!`);
  };

  // Take Screenshot
  const handleTakeScreenshot = () => {
    playSelectSound();
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${game.title.replace(/\s+/g, '_')}_Screenshot.png`;
      a.click();
      showToast('Screenshot saved to device gallery!');
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Close player and update playtime
  const handleClose = () => {
    playSelectSound();
    const updated: GameItem = {
      ...game,
      playtimeMinutes: game.playtimeMinutes + Math.round(playSessionSeconds / 60),
      lastPlayed: Date.now()
    };
    onClose(updated);
  };

  return (
    <div
      ref={containerRef}
      id="game-player-root"
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <div className="relative z-40 flex items-center justify-between px-4 py-3 bg-[#0a0b10]/90 backdrop-blur-md border-b border-white/10 text-white">
        <div className="flex items-center gap-3">
          <button
            id="btn-player-back"
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Quit</span>
          </button>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>{game.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono uppercase shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                {core.name}
              </span>
            </h2>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Pause / Resume */}
          <button
            id="btn-player-pause"
            onClick={() => {
              playSelectSound();
              setIsPlaying(!isPlaying);
            }}
            className={`p-2 rounded-xl border transition-colors ${
              !isPlaying ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title={isPlaying ? 'Pause' : 'Resume'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Fast Forward */}
          <button
            id="btn-player-fastforward"
            onClick={toggleFastForward}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-colors ${
              fastForwardRate > 1
                ? 'bg-blue-500/30 border-blue-400 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)] animate-pulse'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Fast Forward Speed"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{fastForwardRate}x</span>
          </button>

          {/* Rewind */}
          <button
            id="btn-player-rewind"
            onMouseDown={() => setIsRewinding(true)}
            onMouseUp={() => setIsRewinding(false)}
            onTouchStart={() => setIsRewinding(true)}
            onTouchEnd={() => setIsRewinding(false)}
            className={`p-2 rounded-xl border transition-colors ${
              isRewinding ? 'bg-rose-500/40 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Hold to Rewind Gameplay"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {/* Quick Save */}
          <button
            id="btn-player-save"
            onClick={handleQuickSave}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Quick Save State"
          >
            <Save className="w-4 h-4" />
          </button>

          {/* Screenshot */}
          <button
            id="btn-player-screenshot"
            onClick={handleTakeScreenshot}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Capture Screenshot"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Cheats Drawer Toggle */}
          <button
            id="btn-player-cheats"
            onClick={() => setShowCheatsDrawer(!showCheatsDrawer)}
            className={`p-2 rounded-xl border transition-colors ${
              showCheatsDrawer ? 'bg-purple-500/30 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="GameShark / Cheats"
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Core Settings Drawer */}
          <button
            id="btn-player-settings"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-xl border transition-colors ${
              showSettingsDrawer ? 'bg-blue-500/30 border-blue-400 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            }`}
            title="Core Graphics & Shaders"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            id="btn-player-fullscreen"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-[#08080a] overflow-hidden">
        {/* Toast Notification */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-[#0a0b10]/95 border border-blue-400/50 text-blue-300 text-xs font-mono font-medium shadow-[0_0_20px_rgba(59,130,246,0.3)] backdrop-blur-md flex items-center gap-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* The Emulator Play Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className="w-full h-full object-contain max-h-screen bg-black"
        />

        {/* On-screen Touch Gamepad Overlay */}
        {controllerConfig.touchControlsEnabled && (
          <TouchGamepad
            systemId={game.systemId}
            config={controllerConfig}
            onButtonDown={handleTouchButtonDown}
            onButtonUp={handleTouchButtonUp}
            onStickMove={handleTouchStickMove}
          />
        )}

        {/* Settings / Shaders Slideout Drawer */}
        {showSettingsDrawer && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0a0b10]/95 border-l border-white/10 backdrop-blur-xl z-50 p-5 overflow-y-auto text-white flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold tracking-wide uppercase flex items-center gap-2 text-blue-400">
                  <Sliders className="w-4 h-4" />
                  <span>Core & Video Settings</span>
                </h3>
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shaders */}
              <div>
                <label className="text-xs font-semibold text-white/80 mb-2 block">
                  CRT & Display Shader
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['None', 'CRT-Trinitron', 'Scanlines', 'LCD-Grid'].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setActiveShader(s);
                        showToast(`Shader: ${s}`);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-colors ${
                        activeShader === s
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Resolution */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-white/80">
                    Internal Resolution
                  </label>
                  <span className="text-xs font-mono text-blue-400">{resolutionMultiplier}x Native</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={resolutionMultiplier}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setResolutionMultiplier(val);
                    showToast(`Internal Resolution: ${val}x`);
                  }}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 font-mono mt-1">
                  <span>1x (240p)</span>
                  <span>3x (720p)</span>
                  <span>6x (4K)</span>
                </div>
              </div>

              {/* Graphics Backend */}
              <div>
                <label className="text-xs font-semibold text-white/80 mb-1.5 block">
                  Rendering Backend
                </label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono flex items-center justify-between">
                  <span className="text-white/80">{core.settings.renderBackend} Pipeline</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">Active</span>
                </div>
              </div>

              {/* Toggle HUD */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs text-white/80">Display In-Game HUD</span>
                <input
                  type="checkbox"
                  checked={showHud}
                  onChange={(e) => setShowHud(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold text-xs uppercase tracking-wider text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-white/20 transition-colors mt-4"
            >
              Apply & Close
            </button>
          </div>
        )}

        {/* Cheats Drawer */}
        {showCheatsDrawer && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0a0b10]/95 border-l border-white/10 backdrop-blur-xl z-50 p-5 overflow-y-auto text-white flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold tracking-wide uppercase flex items-center gap-2 text-purple-400">
                  <Zap className="w-4 h-4" />
                  <span>GameShark / Cheats</span>
                </h3>
                <button
                  onClick={() => setShowCheatsDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeCheats.length === 0 ? (
                <p className="text-xs text-white/40 py-6 text-center">No cheat codes registered for this ROM.</p>
              ) : (
                <div className="space-y-3">
                  {activeCheats.map((cheat) => (
                    <div
                      key={cheat.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{cheat.name}</h4>
                        {cheat.description && (
                          <p className="text-[11px] text-white/50 mt-0.5">{cheat.description}</p>
                        )}
                        <span className="text-[9px] font-mono text-purple-400 block mt-1">Code: {cheat.code.split('\n')[0]}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={cheat.enabled}
                        onChange={(e) => {
                          const updated = activeCheats.map((c) =>
                            c.id === cheat.id ? { ...c, enabled: e.target.checked } : c
                          );
                          setActiveCheats(updated);
                          showToast(`${cheat.name}: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
                        }}
                        className="w-4 h-4 accent-purple-500 rounded cursor-pointer mt-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCheatsDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 font-bold text-xs uppercase tracking-wider text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-white/20 transition-colors mt-4"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
