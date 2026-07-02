import {
	World,
	createSystem,
	PanelUI,
	PanelDocument,
	UIKitDocument,
	UIKit,
	Follower,
	ScreenSpace,
	eq,
	InputComponent,
	BoxGeometry,
	SphereGeometry,
	CylinderGeometry,
	ConeGeometry,
	OctahedronGeometry,
	TorusGeometry,
	Mesh as MeshComp,
	Object3D,
} from '@iwsdk/core';
import {
	Mesh,
	MeshBasicMaterial,
	MeshStandardMaterial,
	BoxGeometry as ThreeBox,
	SphereGeometry as ThreeSphere,
	CylinderGeometry as ThreeCyl,
	ConeGeometry as ThreeCone,
	OctahedronGeometry as ThreeOcta,
	TorusGeometry as ThreeTorus,
	TorusKnotGeometry as ThreeTorusKnot,
	LineBasicMaterial,
	BufferGeometry,
	Float32BufferAttribute,
	Line,
	Group,
	Color,
	Vector3,
	AdditiveBlending,
	FogExp2,
	AmbientLight,
	DirectionalLight,
	PointLight,
	GridHelper,
	EdgesGeometry,
	LineSegments,
	PlaneGeometry,
} from '@iwsdk/core';

// ===== TYPES & CONFIG =====
type GameState = 'title' | 'modeselect' | 'difficulty' | 'playing' | 'paused' | 'gameover' | 'leaderboard' | 'achievements' | 'settings' | 'stats' | 'skins' | 'help' | 'countdown';
type GameMode = 'classic' | 'speed' | 'zen' | 'daily' | 'marathon' | 'gauntlet' | 'tunnel' | 'practice';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Theme {
	name: string; grid: string; accent: string; bg: string; fog: string; wall: string; gate: string; copter: string; glow: string;
}

const THEMES: Theme[] = [
	{ name: 'HOLODECK', grid: '#00ffff', accent: '#00ffff', bg: '#000a18', fog: '#000a18', wall: '#003366', gate: '#00ffff', copter: '#00ffff', glow: '#00ffff' },
	{ name: 'CRIMSON', grid: '#ff4444', accent: '#ff6666', bg: '#180005', fog: '#180005', wall: '#660022', gate: '#ff4444', copter: '#ff4444', glow: '#ff4444' },
	{ name: 'TOXIC', grid: '#00ff88', accent: '#44ffaa', bg: '#001a08', fog: '#001a08', wall: '#006633', gate: '#00ff88', copter: '#00ff88', glow: '#00ff88' },
	{ name: 'ULTRAVIOLET', grid: '#8844ff', accent: '#aa66ff', bg: '#0a0018', fog: '#0a0018', wall: '#330066', gate: '#8844ff', copter: '#8844ff', glow: '#8844ff' },
	{ name: 'SOLAR', grid: '#ff8800', accent: '#ffaa44', bg: '#180a00', fog: '#180a00', wall: '#663300', gate: '#ff8800', copter: '#ff8800', glow: '#ff8800' },
];

interface Skin { name: string; color: string; unlock: string; check: (s: Stats) => boolean; }
const SKINS: Skin[] = [
	{ name: 'Neon Cyan', color: '#00ffff', unlock: 'Default', check: () => true },
	{ name: 'Solar Flare', color: '#ff4444', unlock: '50 gates', check: s => s.totalGates >= 50 },
	{ name: 'Plasma Pink', color: '#ff44ff', unlock: '5K score', check: s => s.bestScore >= 5000 },
	{ name: 'Frost Wing', color: '#4488ff', unlock: '10 games', check: s => s.games >= 10 },
	{ name: 'Toxic Green', color: '#00ff88', unlock: 'x5 combo', check: s => s.bestCombo >= 5 },
	{ name: 'Royal Gold', color: '#ffaa00', unlock: '500m', check: s => s.bestDistance >= 500 },
	{ name: 'Void Purple', color: '#8844ff', unlock: 'All modes', check: s => s.modesPlayed.size >= 8 },
	{ name: 'Inferno', color: '#ff8844', unlock: '100 gates', check: s => s.totalGates >= 100 },
];

interface Achievement { id: string; name: string; desc: string; check: (s: Stats) => boolean; }
const ACHIEVEMENTS: Achievement[] = [
	{ id: 'first_flight', name: 'First Flight', desc: 'Play your first game', check: s => s.games >= 1 },
	{ id: 'gate_1', name: 'Gate Keeper', desc: 'Pass through 1 gate', check: s => s.totalGates >= 1 },
	{ id: 'gate_10', name: 'Navigator', desc: 'Pass through 10 gates', check: s => s.totalGates >= 10 },
	{ id: 'gate_50', name: 'Ace Pilot', desc: 'Pass through 50 gates', check: s => s.totalGates >= 50 },
	{ id: 'gate_100', name: 'Sky Captain', desc: 'Pass 100 gates', check: s => s.totalGates >= 100 },
	{ id: 'gate_500', name: 'Legend', desc: 'Pass 500 gates total', check: s => s.totalGates >= 500 },
	{ id: 'score_500', name: 'Getting Started', desc: 'Score 500 points', check: s => s.bestScore >= 500 },
	{ id: 'score_1k', name: 'High Flyer', desc: 'Score 1,000 points', check: s => s.bestScore >= 1000 },
	{ id: 'score_5k', name: 'Soaring', desc: 'Score 5,000 points', check: s => s.bestScore >= 5000 },
	{ id: 'score_10k', name: 'Stratosphere', desc: 'Score 10,000', check: s => s.bestScore >= 10000 },
	{ id: 'score_25k', name: 'Exosphere', desc: 'Score 25,000', check: s => s.bestScore >= 25000 },
	{ id: 'combo_3', name: 'Combo Starter', desc: 'Reach x3 combo', check: s => s.bestCombo >= 3 },
	{ id: 'combo_5', name: 'Combo Master', desc: 'Reach x5 combo', check: s => s.bestCombo >= 5 },
	{ id: 'combo_8', name: 'Combo King', desc: 'Reach x8 combo', check: s => s.bestCombo >= 8 },
	{ id: 'combo_10', name: 'Combo God', desc: 'Reach x10 combo', check: s => s.bestCombo >= 10 },
	{ id: 'dist_100', name: 'Explorer', desc: 'Fly 100m', check: s => s.bestDistance >= 100 },
	{ id: 'dist_500', name: 'Voyager', desc: 'Fly 500m', check: s => s.bestDistance >= 500 },
	{ id: 'dist_1k', name: 'Odyssey', desc: 'Fly 1,000m', check: s => s.bestDistance >= 1000 },
	{ id: 'orb_10', name: 'Collector', desc: 'Collect 10 orbs', check: s => s.totalOrbs >= 10 },
	{ id: 'orb_50', name: 'Hoarder', desc: 'Collect 50 orbs', check: s => s.totalOrbs >= 50 },
	{ id: 'orb_100', name: 'Orb Master', desc: 'Collect 100 orbs', check: s => s.totalOrbs >= 100 },
	{ id: 'games_10', name: 'Regular', desc: 'Play 10 games', check: s => s.games >= 10 },
	{ id: 'games_50', name: 'Veteran', desc: 'Play 50 games', check: s => s.games >= 50 },
	{ id: 'games_100', name: 'Dedicated', desc: 'Play 100 games', check: s => s.games >= 100 },
	{ id: 'daily_1', name: 'Daily Pilot', desc: 'Complete 1 daily', check: s => s.dailyDone >= 1 },
	{ id: 'daily_3', name: 'Daily Regular', desc: '3 dailies done', check: s => s.dailyDone >= 3 },
	{ id: 'daily_7', name: 'Weekly Flyer', desc: '7 dailies done', check: s => s.dailyDone >= 7 },
	{ id: 'zen_500', name: 'Zen Master', desc: '500m in Zen', check: s => s.bestZenDist >= 500 },
	{ id: 'marathon_300', name: 'Marathon Hero', desc: '300m Marathon', check: s => s.bestMarathonDist >= 300 },
	{ id: 'gauntlet_200', name: 'Gauntlet Runner', desc: '200m Gauntlet', check: s => s.bestGauntletDist >= 200 },
	{ id: 'tunnel_100', name: 'Tunnel Rat', desc: '100m Tunnel', check: s => s.bestTunnelDist >= 100 },
	{ id: 'all_modes', name: 'Well Rounded', desc: 'Play all 8 modes', check: s => s.modesPlayed.size >= 8 },
	{ id: 'skin_unlock', name: 'Fashionista', desc: 'Unlock a skin', check: s => { let c = 0; SKINS.forEach(sk => { if (sk.check(s)) c++; }); return c >= 2; } },
	{ id: 'theme_all', name: 'Theme Tourist', desc: 'Try all themes', check: s => s.themesUsed.size >= 5 },
	{ id: 'speed_3k', name: 'Speed Demon', desc: '3K in Speed', check: s => s.bestSpeedScore >= 3000 },
	{ id: 'no_orb', name: 'Purist', desc: 'Win without orbs', check: s => s.puristRun },
	{ id: 'close_call', name: 'Close Call', desc: '10 near misses', check: s => s.totalNearMisses >= 10 },
	{ id: 'perfect_10', name: 'Perfect 10', desc: '10 gates no miss', check: s => s.bestGateStreak >= 10 },
	{ id: 'lv_10', name: 'Rank Up', desc: 'Reach Level 10', check: s => s.level >= 10 },
	{ id: 'lv_25', name: 'Rising Star', desc: 'Reach Level 25', check: s => s.level >= 25 },
];

interface Stats {
	games: number; bestScore: number; totalScore: number; bestDistance: number;
	totalGates: number; totalOrbs: number; bestCombo: number; playTime: number;
	level: number; xp: number; modesPlayed: Set<string>; themesUsed: Set<string>;
	dailyDone: number; bestZenDist: number; bestMarathonDist: number;
	bestGauntletDist: number; bestTunnelDist: number; bestSpeedScore: number;
	puristRun: boolean; totalNearMisses: number; bestGateStreak: number;
	unlockedAchs: Set<string>; selectedSkin: number; selectedTheme: number;
}

interface LeaderEntry { score: number; distance: number; mode: string; date: string; }

// ===== SEEDED PRNG =====
function mulberry32(a: number) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function dateSeed(): number { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

// ===== AUDIO =====
class AudioManager {
	private ctx: AudioContext | null = null;
	private master = 1; private sfxVol = 1; private musicVol = 1;
	private droneGain: GainNode | null = null;
	private arpGain: GainNode | null = null;

	init() {
		if (this.ctx) return;
		this.ctx = new AudioContext();
		this.startMusic();
	}

	setMaster(v: number) { this.master = v; this.updateMusic(); }
	setSfx(v: number) { this.sfxVol = v; }
	setMusic(v: number) { this.musicVol = v; this.updateMusic(); }
	getMaster() { return this.master; }
	getSfx() { return this.sfxVol; }
	getMusic() { return this.musicVol; }

	private updateMusic() {
		if (this.droneGain) this.droneGain.gain.value = 0.06 * this.musicVol * this.master;
		if (this.arpGain) this.arpGain.gain.value = 0.04 * this.musicVol * this.master;
	}

	private startMusic() {
		if (!this.ctx) return;
		const c = this.ctx;
		this.droneGain = c.createGain();
		this.droneGain.gain.value = 0.06 * this.musicVol * this.master;
		this.droneGain.connect(c.destination);
		const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
		lp.connect(this.droneGain);
		const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55; o1.connect(lp); o1.start();
		const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 82.5; o2.connect(lp); o2.start();
		const o3 = c.createOscillator(); o3.type = 'sine'; o3.frequency.value = 110; o3.connect(lp); o3.start();
		const lfo = c.createOscillator(); lfo.frequency.value = 0.15;
		const lfoG = c.createGain(); lfoG.gain.value = 50; lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start();

		// Arpeggiator
		this.arpGain = c.createGain();
		this.arpGain.gain.value = 0.04 * this.musicVol * this.master;
		this.arpGain.connect(c.destination);
		const notes = [220, 261.6, 329.6, 392, 440, 392, 329.6, 261.6];
		let ni = 0;
		setInterval(() => {
			if (!this.ctx || !this.arpGain) return;
			const osc = this.ctx.createOscillator();
			osc.type = 'triangle';
			osc.frequency.value = notes[ni % notes.length];
			const g = this.ctx.createGain();
			g.gain.setValueAtTime(0.08, this.ctx.currentTime);
			g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
			osc.connect(g); g.connect(this.arpGain!);
			osc.start(); osc.stop(this.ctx.currentTime + 0.35);
			ni++;
		}, 60000 / 110 / 2);
	}

	private playSfx(freq: number, type: OscillatorType, dur: number, vol: number = 0.15) {
		if (!this.ctx) return;
		const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = freq * (0.95 + Math.random() * 0.1);
		const g = this.ctx.createGain(); g.gain.setValueAtTime(vol * this.sfxVol * this.master, this.ctx.currentTime);
		g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
		o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + dur + 0.05);
	}

	thrust() { this.playSfx(180, 'sawtooth', 0.08, 0.06); }
	gatePass() {
		if (!this.ctx) return;
		const base = [523, 659, 784, 1047];
		base.forEach((f, i) => { setTimeout(() => this.playSfx(f, 'sine', 0.15, 0.12), i * 60); });
	}
	orbCollect() { this.playSfx(880, 'sine', 0.2, 0.1); this.playSfx(1100, 'triangle', 0.15, 0.08); }
	wallHit() { this.playSfx(120, 'sawtooth', 0.3, 0.2); this.playSfx(80, 'square', 0.2, 0.15); }
	countdownTick() { this.playSfx(660, 'sine', 0.1, 0.1); }
	countdownGo() { this.playSfx(880, 'sine', 0.2, 0.15); this.playSfx(1100, 'sine', 0.15, 0.1); }
	click() { this.playSfx(500, 'sine', 0.05, 0.06); }
	gameStart() { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.playSfx(f, 'triangle', 0.2, 0.1), i * 80)); }
	gameOver() { [440, 392, 330, 262].forEach((f, i) => setTimeout(() => this.playSfx(f, 'triangle', 0.25, 0.12), i * 100)); }
	achievement() { [660, 784, 880, 1047, 1175].forEach((f, i) => setTimeout(() => this.playSfx(f, 'sine', 0.15, 0.08), i * 70)); }
	comboUp() { this.playSfx(660 + Math.random() * 200, 'triangle', 0.12, 0.08); }
	nearMiss() { this.playSfx(440, 'square', 0.08, 0.04); }
	levelUp() { [523, 659, 784, 880, 1047, 1175].forEach((f, i) => setTimeout(() => this.playSfx(f, 'sine', 0.15, 0.1), i * 60)); }
}

// ===== STATE MANAGER =====
class GameStateManager {
	stats: Stats;
	leaderboard: LeaderEntry[] = [];

	constructor() {
		const raw = localStorage.getItem('neon-copter-stats');
		if (raw) {
			const p = JSON.parse(raw);
			this.stats = {
				...p,
				modesPlayed: new Set(p.modesPlayed || []),
				themesUsed: new Set(p.themesUsed || []),
				unlockedAchs: new Set(p.unlockedAchs || []),
			};
		} else {
			this.stats = {
				games: 0, bestScore: 0, totalScore: 0, bestDistance: 0,
				totalGates: 0, totalOrbs: 0, bestCombo: 0, playTime: 0,
				level: 1, xp: 0, modesPlayed: new Set(), themesUsed: new Set(),
				dailyDone: 0, bestZenDist: 0, bestMarathonDist: 0,
				bestGauntletDist: 0, bestTunnelDist: 0, bestSpeedScore: 0,
				puristRun: false, totalNearMisses: 0, bestGateStreak: 0,
				unlockedAchs: new Set(), selectedSkin: 0, selectedTheme: 0,
			};
		}
		const lb = localStorage.getItem('neon-copter-lb');
		if (lb) this.leaderboard = JSON.parse(lb);
	}

	save() {
		const s = { ...this.stats, modesPlayed: [...this.stats.modesPlayed], themesUsed: [...this.stats.themesUsed], unlockedAchs: [...this.stats.unlockedAchs] };
		localStorage.setItem('neon-copter-stats', JSON.stringify(s));
		localStorage.setItem('neon-copter-lb', JSON.stringify(this.leaderboard));
	}

	addXP(amount: number): boolean {
		this.stats.xp += amount;
		const needed = 100 + this.stats.level * 50;
		if (this.stats.xp >= needed) {
			this.stats.xp -= needed;
			this.stats.level++;
			return true;
		}
		return false;
	}

	addLeaderEntry(e: LeaderEntry) {
		this.leaderboard.push(e);
		this.leaderboard.sort((a, b) => b.score - a.score);
		if (this.leaderboard.length > 20) this.leaderboard.length = 20;
	}
}

// ===== OBSTACLE TYPES =====
interface GateObj { topMesh: Mesh; botMesh: Mesh; gapY: number; gapH: number; x: number; passed: boolean; }
interface OrbObj { mesh: Mesh; x: number; y: number; collected: boolean; }

// ===== PARTICLE POOL =====
class ParticlePool {
	particles: { mesh: Mesh; vx: number; vy: number; vz: number; life: number; maxLife: number; }[] = [];
	scene: any;

	constructor(scene: any, max: number) {
		this.scene = scene;
		for (let i = 0; i < max; i++) {
			const m = new Mesh(new ThreeSphere(0.02, 4, 4), new MeshBasicMaterial({ color: 0x00ffff, transparent: true, blending: AdditiveBlending }));
			m.visible = false;
			scene.add(m);
			this.particles.push({ mesh: m, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1 });
		}
	}

	burst(x: number, y: number, z: number, count: number, color: number, speed: number = 2) {
		let spawned = 0;
		for (const p of this.particles) {
			if (p.life <= 0 && spawned < count) {
				p.mesh.position.set(x, y, z);
				const a = Math.random() * Math.PI * 2;
				const elev = (Math.random() - 0.5) * Math.PI;
				const s = speed * (0.5 + Math.random() * 0.5);
				p.vx = Math.cos(a) * Math.cos(elev) * s;
				p.vy = Math.sin(elev) * s + 1;
				p.vz = Math.sin(a) * Math.cos(elev) * s;
				p.life = 0.6 + Math.random() * 0.4;
				p.maxLife = p.life;
				(p.mesh.material as MeshBasicMaterial).color.setHex(color);
				p.mesh.visible = true;
				spawned++;
			}
		}
	}

	update(dt: number) {
		for (const p of this.particles) {
			if (p.life > 0) {
				p.life -= dt;
				p.mesh.position.x += p.vx * dt;
				p.mesh.position.y += p.vy * dt;
				p.mesh.position.z += p.vz * dt;
				p.vy -= 4 * dt;
				(p.mesh.material as MeshBasicMaterial).opacity = Math.max(0, p.life / p.maxLife);
				if (p.life <= 0) p.mesh.visible = false;
			}
		}
	}
}

// ===== MAIN GAME =====
async function main() {
	const container = document.getElementById('app') as HTMLDivElement;
	const world = await World.create(container, {
		xr: { offer: 'once' },
	});

	const audio = new AudioManager();
	const gsm = new GameStateManager();
	let state: GameState = 'title';
	let mode: GameMode = 'classic';
	let difficulty: Difficulty = 'medium';
	let theme = THEMES[gsm.stats.selectedTheme] || THEMES[0];
	let skinIdx = gsm.stats.selectedSkin || 0;

	// Game vars
	let copterY = 0;
	let copterVY = 0;
	let distance = 0;
	let score = 0;
	let lives = 3;
	let combo = 0;
	let maxCombo = 0;
	let gatesPassed = 0;
	let orbsCollected = 0;
	let gateStreak = 0;
	let nearMisses = 0;
	let gameTime = 0;
	let gameSpeed = 3;
	let thrustInput = false;
	let countdownVal = 3;
	let countdownTimer = 0;
	let toastTimer = 0;
	let toastText = '';
	let comboDecay = 0;
	let achPage = 0;
	let dailyRng: (() => number) | null = null;

	const gates: GateObj[] = [];
	const orbs: OrbObj[] = [];
	let nextGateX = 8;
	const COPTER_X = 0;
	const GRAVITY = -12;
	const THRUST = 18;

	// ===== SCENE SETUP =====
	const scene = world.scene;
	scene.fog = new FogExp2(new Color(theme.bg).getHex(), 0.04);
	scene.add(new AmbientLight(0x222244, 0.3));
	const dirLight = new DirectionalLight(0xffffff, 0.4);
	dirLight.position.set(5, 10, 5);
	scene.add(dirLight);
	const accentLight1 = new PointLight(new Color(theme.accent).getHex(), 1, 20);
	accentLight1.position.set(0, 3, -2);
	scene.add(accentLight1);
	const accentLight2 = new PointLight(new Color(theme.accent).getHex(), 0.6, 15);
	accentLight2.position.set(-3, -1, -3);
	scene.add(accentLight2);

	// Grid floor + ceiling
	const gridFloor = new GridHelper(40, 40, new Color(theme.grid), new Color(theme.grid));
	gridFloor.position.y = -4;
	(gridFloor.material as any).opacity = 0.15;
	(gridFloor.material as any).transparent = true;
	scene.add(gridFloor);
	const gridCeiling = new GridHelper(40, 40, new Color(theme.grid), new Color(theme.grid));
	gridCeiling.position.y = 4;
	(gridCeiling.material as any).opacity = 0.1;
	(gridCeiling.material as any).transparent = true;
	scene.add(gridCeiling);

	// Floating decorations
	const decos: Mesh[] = [];
	for (let i = 0; i < 14; i++) {
		const geos = [new ThreeBox(0.3, 0.3, 0.3), new ThreeSphere(0.15, 6, 6), new ThreeTorus(0.2, 0.05, 6, 12), new ThreeCone(0.15, 0.3, 6)];
		const geo = geos[i % 4];
		const mat = new MeshBasicMaterial({ color: new Color(theme.accent), wireframe: true, transparent: true, opacity: 0.2 });
		const m = new Mesh(geo, mat);
		m.position.set((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 6, -5 - Math.random() * 15);
		scene.add(m);
		decos.push(m);
	}

	// Ambient particles
	const ambientParts: Mesh[] = [];
	for (let i = 0; i < 40; i++) {
		const m = new Mesh(new ThreeSphere(0.01, 4, 4), new MeshBasicMaterial({ color: new Color(theme.accent), transparent: true, blending: AdditiveBlending, opacity: 0.3 }));
		m.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 8, -2 - Math.random() * 18);
		scene.add(m);
		ambientParts.push(m);
	}

	// Particle pool
	const particles = new ParticlePool(scene, 150);

	// ===== COPTER =====
	const copterGroup = new Group();
	scene.add(copterGroup);
	const skinColor = new Color(SKINS[skinIdx].color);

	// Body
	const bodyMat = new MeshStandardMaterial({ color: skinColor, emissive: skinColor, emissiveIntensity: 0.4 });
	const body = new Mesh(new ThreeBox(0.5, 0.2, 0.2), bodyMat);
	copterGroup.add(body);
	const bodyWire = new LineSegments(new EdgesGeometry(body.geometry), new LineBasicMaterial({ color: skinColor, transparent: true, opacity: 0.6 }));
	copterGroup.add(bodyWire);
	// Glow
	const glowMat = new MeshBasicMaterial({ color: skinColor, transparent: true, opacity: 0.15, blending: AdditiveBlending });
	const glow = new Mesh(new ThreeSphere(0.35, 8, 8), glowMat);
	copterGroup.add(glow);
	// Rotor
	const rotorMat = new MeshBasicMaterial({ color: skinColor, transparent: true, opacity: 0.5 });
	const rotor = new Mesh(new ThreeBox(0.6, 0.02, 0.06), rotorMat);
	rotor.position.y = 0.15;
	copterGroup.add(rotor);
	// Tail
	const tail = new Mesh(new ThreeCone(0.06, 0.2, 4), new MeshStandardMaterial({ color: skinColor, emissive: skinColor, emissiveIntensity: 0.3 }));
	tail.position.set(-0.3, 0, 0);
	tail.rotation.z = Math.PI / 2;
	copterGroup.add(tail);
	// Cockpit
	const cockpit = new Mesh(new ThreeSphere(0.08, 6, 6), new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 }));
	cockpit.position.set(0.18, 0.06, 0);
	copterGroup.add(cockpit);
	// Light
	const copterLight = new PointLight(skinColor.getHex(), 0.8, 5);
	copterGroup.add(copterLight);

	// Copter trail
	const trailParts: Mesh[] = [];
	for (let i = 0; i < 25; i++) {
		const m = new Mesh(new ThreeSphere(0.015, 4, 4), new MeshBasicMaterial({ color: skinColor, transparent: true, blending: AdditiveBlending, opacity: 0 }));
		scene.add(m);
		trailParts.push(m);
	}
	let trailIdx = 0;
	let trailTimer = 0;

	// ===== GATE MANAGEMENT =====
	function createGate(x: number, gapY: number, gapH: number): GateObj {
		const wallColor = new Color(theme.wall);
		const gateColor = new Color(theme.gate);
		const topH = 4 - (gapY + gapH / 2);
		const botH = 4 + (gapY - gapH / 2);
		const topMesh = new Mesh(new ThreeBox(0.15, topH, 1.5), new MeshStandardMaterial({ color: wallColor, emissive: wallColor, emissiveIntensity: 0.3, transparent: true, opacity: 0.7 }));
		topMesh.position.set(x, 4 - topH / 2, 0);
		const topWire = new LineSegments(new EdgesGeometry(topMesh.geometry), new LineBasicMaterial({ color: gateColor }));
		topMesh.add(topWire);
		scene.add(topMesh);

		const botMesh = new Mesh(new ThreeBox(0.15, botH, 1.5), new MeshStandardMaterial({ color: wallColor, emissive: wallColor, emissiveIntensity: 0.3, transparent: true, opacity: 0.7 }));
		botMesh.position.set(x, -4 + botH / 2, 0);
		const botWire = new LineSegments(new EdgesGeometry(botMesh.geometry), new LineBasicMaterial({ color: gateColor }));
		botMesh.add(botWire);
		scene.add(botMesh);

		// Gate ring glow
		const ring = new Mesh(new ThreeTorus(gapH / 2 * 0.7, 0.02, 6, 16), new MeshBasicMaterial({ color: gateColor, transparent: true, opacity: 0.3, blending: AdditiveBlending }));
		ring.position.set(x, gapY, 0);
		ring.rotation.y = Math.PI / 2;
		scene.add(ring);
		(topMesh as any)._ring = ring;

		return { topMesh, botMesh, gapY, gapH, x, passed: false };
	}

	function createOrb(x: number, y: number): OrbObj {
		const mat = new MeshBasicMaterial({ color: 0xff44ff, transparent: true, blending: AdditiveBlending, opacity: 0.8 });
		const mesh = new Mesh(new ThreeSphere(0.12, 8, 8), mat);
		mesh.position.set(x, y, 0);
		const orbGlow = new Mesh(new ThreeSphere(0.2, 6, 6), new MeshBasicMaterial({ color: 0xff44ff, transparent: true, opacity: 0.15, blending: AdditiveBlending }));
		mesh.add(orbGlow);
		scene.add(mesh);
		return { mesh, x, y, collected: false };
	}

	function spawnGate() {
		const rng = dailyRng || Math.random;
		let gapH = 2.0;
		if (difficulty === 'easy') gapH = 2.6;
		if (difficulty === 'hard') gapH = 1.5;
		if (mode === 'tunnel') gapH *= 0.7;
		if (mode === 'gauntlet') gapH = Math.max(1.0, gapH - distance * 0.001);
		const gapY = (rng() - 0.5) * (6 - gapH);
		gates.push(createGate(nextGateX, gapY, gapH));

		// Random orb between gates
		if (rng() < 0.4) {
			const orbX = nextGateX - 1.5 - rng() * 2;
			const orbY = (rng() - 0.5) * 5;
			orbs.push(createOrb(orbX, orbY));
		}

		let spacing = 4 + rng() * 3;
		if (difficulty === 'easy') spacing += 1.5;
		if (difficulty === 'hard') spacing -= 1;
		if (mode === 'tunnel') spacing -= 1;
		nextGateX += spacing;
	}

	function clearObstacles() {
		for (const g of gates) {
			scene.remove(g.topMesh); scene.remove(g.botMesh);
			const ring = (g.topMesh as any)._ring;
			if (ring) scene.remove(ring);
		}
		gates.length = 0;
		for (const o of orbs) { scene.remove(o.mesh); }
		orbs.length = 0;
		nextGateX = 8;
	}

	// ===== UI SETUP =====
	const panelConfigs = [
		{ name: 'title', config: './ui/title.json', screen: true },
		{ name: 'modeselect', config: './ui/modeselect.json', screen: true },
		{ name: 'difficulty', config: './ui/difficulty.json', screen: true },
		{ name: 'hud', config: './ui/hud.json', follower: true },
		{ name: 'pause', config: './ui/pause.json', screen: true },
		{ name: 'gameover', config: './ui/gameover.json', screen: true },
		{ name: 'leaderboard', config: './ui/leaderboard.json', screen: true },
		{ name: 'achievements', config: './ui/achievements.json', screen: true },
		{ name: 'settings', config: './ui/settings.json', screen: true },
		{ name: 'stats', config: './ui/stats.json', screen: true },
		{ name: 'skins', config: './ui/skins.json', screen: true },
		{ name: 'help', config: './ui/help.json', screen: true },
		{ name: 'countdown', config: './ui/countdown.json', follower: true },
		{ name: 'toast', config: './ui/toast.json', follower: true },
	];

	const panelEntities: Record<string, any> = {};
	for (const pc of panelConfigs) {
		const e = world.createEntity();
		e.addComponent(PanelUI, { config: pc.config });
		if (pc.follower) {
			e.addComponent(Follower, { target: world.player.head });
			const ov = e.getVectorView(Follower, 'offsetPosition');
			if (pc.name === 'hud') { ov[0] = 0; ov[1] = 0.25; ov[2] = -0.8; }
			else if (pc.name === 'countdown') { ov[0] = 0; ov[1] = 0; ov[2] = -0.6; }
			else if (pc.name === 'toast') { ov[0] = 0; ov[1] = -0.25; ov[2] = -0.7; }
		}
		if (pc.screen) {
			e.addComponent(ScreenSpace, {});
		}
		panelEntities[pc.name] = e;
	}

	// Helper
	const getDoc = (name: string) => {
		const e = panelEntities[name];
		if (!e) return undefined;
		try { return e.getValue(PanelDocument, 'document') as UIKitDocument | undefined; } catch { return undefined; }
	};
	const setText = (name: string, id: string, text: string) => {
		const doc = getDoc(name);
		if (!doc) return;
		const el = doc.getElementById(id) as UIKit.Text | undefined;
		el?.setProperties({ text });
	};

	function showPanel(name: string) {
		for (const [k, e] of Object.entries(panelEntities)) {
			const doc = getDoc(k);
			if (doc) {
				const root = doc.getElementById('root') || (doc as any).root;
			}
			try {
				const o = e.object3D;
				if (o) o.visible = false;
			} catch {}
		}
		// Show requested + always-visible panels
		const show = [name];
		if (state === 'playing') show.push('hud');
		if (toastTimer > 0) show.push('toast');
		for (const s of show) {
			try {
				const o = panelEntities[s]?.object3D;
				if (o) o.visible = true;
			} catch {}
		}
	}

	function showUI(s: GameState) {
		state = s;
		for (const [k, e] of Object.entries(panelEntities)) {
			try {
				const o = e.object3D;
				if (o) o.visible = false;
			} catch {}
		}
		const visible: string[] = [];
		switch (s) {
			case 'title': visible.push('title'); break;
			case 'modeselect': visible.push('modeselect'); break;
			case 'difficulty': visible.push('difficulty'); break;
			case 'playing': visible.push('hud'); break;
			case 'paused': visible.push('pause'); break;
			case 'gameover': visible.push('gameover'); break;
			case 'leaderboard': visible.push('leaderboard'); break;
			case 'achievements': visible.push('achievements'); break;
			case 'settings': visible.push('settings'); break;
			case 'stats': visible.push('stats'); break;
			case 'skins': visible.push('skins'); break;
			case 'help': visible.push('help'); break;
			case 'countdown': visible.push('countdown'); break;
		}
		if (state === 'playing' && toastTimer > 0) visible.push('toast');
		for (const v of visible) {
			try { const o = panelEntities[v]?.object3D; if (o) o.visible = true; } catch {}
		}
	}

	function showToast(msg: string) {
		toastText = msg;
		toastTimer = 2.0;
		setText('toast', 'toast-text', msg);
		try { const o = panelEntities['toast']?.object3D; if (o) o.visible = true; } catch {}
	}

	// ===== GAME FLOW =====
	function startGame() {
		audio.init();
		copterY = 0; copterVY = 0; distance = 0; score = 0; combo = 0; maxCombo = 0;
		gatesPassed = 0; orbsCollected = 0; gateStreak = 0; nearMisses = 0; gameTime = 0;
		comboDecay = 0;

		lives = mode === 'marathon' ? 1 : mode === 'zen' || mode === 'practice' ? 999 : 3;
		gameSpeed = difficulty === 'easy' ? 2.5 : difficulty === 'hard' ? 4 : 3;
		if (mode === 'speed') gameSpeed = 4;
		if (mode === 'gauntlet') gameSpeed = 2.5;

		if (mode === 'daily') dailyRng = mulberry32(dateSeed());
		else dailyRng = null;

		clearObstacles();
		for (let i = 0; i < 5; i++) spawnGate();

		copterGroup.visible = true;
		gsm.stats.modesPlayed.add(mode);
		gsm.stats.themesUsed.add(theme.name);

		countdownVal = 3;
		countdownTimer = 1;
		state = 'countdown';
		showUI('countdown');
		setText('countdown', 'countdown-text', '3');
		audio.countdownTick();
	}

	function endGame() {
		state = 'gameover';
		audio.gameOver();

		// Update stats
		gsm.stats.games++;
		gsm.stats.totalScore += score;
		if (score > gsm.stats.bestScore) gsm.stats.bestScore = score;
		if (distance > gsm.stats.bestDistance) gsm.stats.bestDistance = distance;
		gsm.stats.totalGates += gatesPassed;
		gsm.stats.totalOrbs += orbsCollected;
		if (maxCombo > gsm.stats.bestCombo) gsm.stats.bestCombo = maxCombo;
		gsm.stats.playTime += gameTime;
		gsm.stats.totalNearMisses += nearMisses;
		if (gateStreak > gsm.stats.bestGateStreak) gsm.stats.bestGateStreak = gateStreak;
		if (orbsCollected === 0 && gatesPassed >= 5) gsm.stats.puristRun = true;
		if (mode === 'zen' && distance > gsm.stats.bestZenDist) gsm.stats.bestZenDist = distance;
		if (mode === 'marathon' && distance > gsm.stats.bestMarathonDist) gsm.stats.bestMarathonDist = distance;
		if (mode === 'gauntlet' && distance > gsm.stats.bestGauntletDist) gsm.stats.bestGauntletDist = distance;
		if (mode === 'tunnel' && distance > gsm.stats.bestTunnelDist) gsm.stats.bestTunnelDist = distance;
		if (mode === 'speed' && score > gsm.stats.bestSpeedScore) gsm.stats.bestSpeedScore = score;
		if (mode === 'daily') gsm.stats.dailyDone++;

		const leveled = gsm.addXP(Math.floor(score / 10) + gatesPassed * 5);
		if (leveled) {
			audio.levelUp();
			showToast('LEVEL UP! Lv ' + gsm.stats.level);
		}

		gsm.addLeaderEntry({ score, distance: Math.floor(distance), mode, date: new Date().toLocaleDateString() });

		// Check achievements
		checkAchievements();

		gsm.save();

		// Update game over panel
		setText('gameover', 'go-mode', mode.toUpperCase());
		setText('gameover', 'go-score', String(score));
		setText('gameover', 'go-distance', Math.floor(distance) + 'm');
		setText('gameover', 'go-gates', String(gatesPassed));
		setText('gameover', 'go-combo', 'x' + maxCombo);
		setText('gameover', 'go-orbs', String(orbsCollected));

		copterGroup.visible = false;
		showUI('gameover');
	}

	function checkAchievements() {
		for (const a of ACHIEVEMENTS) {
			if (!gsm.stats.unlockedAchs.has(a.id) && a.check(gsm.stats)) {
				gsm.stats.unlockedAchs.add(a.id);
				audio.achievement();
				showToast(a.name + '!');
			}
		}
	}

	function updateLeaderboardPanel() {
		for (let i = 0; i < 10; i++) {
			const e = gsm.leaderboard[i];
			const text = e ? `#${i + 1}  ${e.score}  ${e.distance}m  ${e.mode}` : '--';
			setText('leaderboard', `lb-row-${i}`, text);
		}
	}

	function updateAchievementsPanel() {
		const start = achPage * 15;
		for (let i = 0; i < 15; i++) {
			const a = ACHIEVEMENTS[start + i];
			if (a) {
				const unlocked = gsm.stats.unlockedAchs.has(a.id);
				setText('achievements', `ach-${i}`, `${unlocked ? '[X]' : '[ ]'} ${a.name} - ${a.desc}`);
			} else {
				setText('achievements', `ach-${i}`, '--');
			}
		}
		const totalPages = Math.ceil(ACHIEVEMENTS.length / 15);
		setText('achievements', 'ach-page', `${achPage + 1}/${totalPages}`);
	}

	function updateStatsPanel() {
		const s = gsm.stats;
		setText('stats', 'stat-games', String(s.games));
		setText('stats', 'stat-best', String(s.bestScore));
		setText('stats', 'stat-total', String(s.totalScore));
		setText('stats', 'stat-dist', s.bestDistance + 'm');
		setText('stats', 'stat-gates', String(s.totalGates));
		setText('stats', 'stat-orbs', String(s.totalOrbs));
		setText('stats', 'stat-combo', 'x' + s.bestCombo);
		setText('stats', 'stat-time', Math.floor(s.playTime) + 's');
		setText('stats', 'stat-level', String(s.level));
		setText('stats', 'stat-achs', s.unlockedAchs.size + '/' + ACHIEVEMENTS.length);
	}

	function updateSkinsPanel() {
		for (let i = 0; i < SKINS.length; i++) {
			const sk = SKINS[i];
			const unlocked = sk.check(gsm.stats);
			const equipped = i === skinIdx;
			const prefix = equipped ? '[ * ]' : unlocked ? '[   ]' : '[ ? ]';
			const suffix = unlocked ? sk.name : sk.name + ' - ' + sk.unlock;
			setText('skins', `skin-${i}`, `${prefix} ${suffix}`);
		}
	}

	function applySkin(idx: number) {
		skinIdx = idx;
		gsm.stats.selectedSkin = idx;
		const c = new Color(SKINS[idx].color);
		bodyMat.color.copy(c); bodyMat.emissive.copy(c);
		(bodyWire.material as LineBasicMaterial).color.copy(c);
		glowMat.color.copy(c);
		rotorMat.color.copy(c);
		(tail.material as MeshStandardMaterial).color.copy(c);
		(tail.material as MeshStandardMaterial).emissive.copy(c);
		copterLight.color.copy(c);
		for (const t of trailParts) (t.material as MeshBasicMaterial).color.copy(c);
	}

	// ===== GAME SYSTEM =====
	class CopterGameSystem extends createSystem({
		uiTitle: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/title.json')] },
		uiMode: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/modeselect.json')] },
		uiDiff: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/difficulty.json')] },
		uiHud: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/hud.json')] },
		uiPause: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/pause.json')] },
		uiGameover: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/gameover.json')] },
		uiLeaderboard: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/leaderboard.json')] },
		uiAch: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/achievements.json')] },
		uiSettings: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/settings.json')] },
		uiStats: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/stats.json')] },
		uiSkins: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/skins.json')] },
		uiHelp: { required: [PanelUI, PanelDocument], where: [eq(PanelUI, 'config', './ui/help.json')] },
	}) {
		private bound = false;

		init() {
			const bindPanel = (queryName: string, bindings: Record<string, () => void>) => {
				(this.queries as any)[queryName].subscribe('qualify', (entity: any) => {
					const doc = entity.getValue(PanelDocument, 'document') as UIKitDocument;
					if (!doc) return;
					for (const [id, fn] of Object.entries(bindings)) {
						const el = doc.getElementById(id) as UIKit.Text | undefined;
						el?.addEventListener('click', () => { audio.click(); fn(); });
					}
				});
			};

			bindPanel('uiTitle', {
				'btn-play': () => { showUI('modeselect'); },
				'btn-scores': () => { updateLeaderboardPanel(); showUI('leaderboard'); },
				'btn-achievements': () => { achPage = 0; updateAchievementsPanel(); showUI('achievements'); },
				'btn-stats': () => { updateStatsPanel(); showUI('stats'); },
				'btn-skins': () => { updateSkinsPanel(); showUI('skins'); },
				'btn-settings': () => { showUI('settings'); },
				'btn-help': () => { showUI('help'); },
			});

			bindPanel('uiMode', {
				'btn-classic': () => { mode = 'classic'; showUI('difficulty'); },
				'btn-speed': () => { mode = 'speed'; showUI('difficulty'); },
				'btn-zen': () => { mode = 'zen'; showUI('difficulty'); },
				'btn-daily': () => { mode = 'daily'; showUI('difficulty'); },
				'btn-marathon': () => { mode = 'marathon'; showUI('difficulty'); },
				'btn-gauntlet': () => { mode = 'gauntlet'; showUI('difficulty'); },
				'btn-tunnel': () => { mode = 'tunnel'; showUI('difficulty'); },
				'btn-practice': () => { mode = 'practice'; showUI('difficulty'); },
				'btn-mode-back': () => { showUI('title'); },
			});

			bindPanel('uiDiff', {
				'btn-easy': () => { difficulty = 'easy'; startGame(); },
				'btn-medium': () => { difficulty = 'medium'; startGame(); },
				'btn-hard': () => { difficulty = 'hard'; startGame(); },
				'btn-diff-back': () => { showUI('modeselect'); },
			});

			bindPanel('uiPause', {
				'btn-resume': () => { state = 'playing'; showUI('playing'); },
				'btn-quit': () => { copterGroup.visible = false; clearObstacles(); showUI('title'); },
			});

			bindPanel('uiGameover', {
				'btn-rematch': () => { startGame(); },
				'btn-menu': () => { clearObstacles(); showUI('title'); },
			});

			bindPanel('uiLeaderboard', { 'btn-lb-back': () => { showUI('title'); } });

			bindPanel('uiAch', {
				'btn-ach-prev': () => { if (achPage > 0) { achPage--; updateAchievementsPanel(); } },
				'btn-ach-next': () => { if ((achPage + 1) * 15 < ACHIEVEMENTS.length) { achPage++; updateAchievementsPanel(); } },
				'btn-ach-back': () => { showUI('title'); },
			});

			bindPanel('uiSettings', {
				'btn-master-up': () => { audio.setMaster(Math.min(1, audio.getMaster() + 0.1)); setText('settings', 'master-vol', String(Math.round(audio.getMaster() * 100))); },
				'btn-master-down': () => { audio.setMaster(Math.max(0, audio.getMaster() - 0.1)); setText('settings', 'master-vol', String(Math.round(audio.getMaster() * 100))); },
				'btn-sfx-up': () => { audio.setSfx(Math.min(1, audio.getSfx() + 0.1)); setText('settings', 'sfx-vol', String(Math.round(audio.getSfx() * 100))); },
				'btn-sfx-down': () => { audio.setSfx(Math.max(0, audio.getSfx() - 0.1)); setText('settings', 'sfx-vol', String(Math.round(audio.getSfx() * 100))); },
				'btn-music-up': () => { audio.setMusic(Math.min(1, audio.getMusic() + 0.1)); setText('settings', 'music-vol', String(Math.round(audio.getMusic() * 100))); },
				'btn-music-down': () => { audio.setMusic(Math.max(0, audio.getMusic() - 0.1)); setText('settings', 'music-vol', String(Math.round(audio.getMusic() * 100))); },
				'btn-theme-prev': () => {
					gsm.stats.selectedTheme = (gsm.stats.selectedTheme - 1 + THEMES.length) % THEMES.length;
					theme = THEMES[gsm.stats.selectedTheme];
					setText('settings', 'theme-name', theme.name);
					gsm.save();
				},
				'btn-theme-next': () => {
					gsm.stats.selectedTheme = (gsm.stats.selectedTheme + 1) % THEMES.length;
					theme = THEMES[gsm.stats.selectedTheme];
					setText('settings', 'theme-name', theme.name);
					gsm.save();
				},
				'btn-settings-back': () => { showUI('title'); },
			});

			bindPanel('uiStats', { 'btn-stats-back': () => { showUI('title'); } });

			bindPanel('uiSkins', {
				'skin-0': () => { if (SKINS[0].check(gsm.stats)) { applySkin(0); updateSkinsPanel(); gsm.save(); } },
				'skin-1': () => { if (SKINS[1].check(gsm.stats)) { applySkin(1); updateSkinsPanel(); gsm.save(); } },
				'skin-2': () => { if (SKINS[2].check(gsm.stats)) { applySkin(2); updateSkinsPanel(); gsm.save(); } },
				'skin-3': () => { if (SKINS[3].check(gsm.stats)) { applySkin(3); updateSkinsPanel(); gsm.save(); } },
				'skin-4': () => { if (SKINS[4].check(gsm.stats)) { applySkin(4); updateSkinsPanel(); gsm.save(); } },
				'skin-5': () => { if (SKINS[5].check(gsm.stats)) { applySkin(5); updateSkinsPanel(); gsm.save(); } },
				'skin-6': () => { if (SKINS[6].check(gsm.stats)) { applySkin(6); updateSkinsPanel(); gsm.save(); } },
				'skin-7': () => { if (SKINS[7].check(gsm.stats)) { applySkin(7); updateSkinsPanel(); gsm.save(); } },
				'btn-skins-back': () => { showUI('title'); },
			});

			bindPanel('uiHelp', { 'btn-help-back': () => { showUI('title'); } });
		}

		update(delta: number, time: number) {
			if (!this.bound) {
				this.bound = true;
				showUI('title');
				copterGroup.visible = false;
			}

			const dt = Math.min(delta, 0.05);

			// Keyboard input
			const kb = (world.input as any).keyboard;
			if (kb) {
				const spaceDown = kb.getKeyPressed('Space');
				const clickDown = kb.getKeyPressed('KeyF'); // placeholder
				thrustInput = spaceDown;

				if (kb.getKeyDown('Escape') || kb.getKeyDown('KeyP')) {
					if (state === 'playing') { state = 'paused'; showUI('paused'); }
					else if (state === 'paused') { state = 'playing'; showUI('playing'); }
				}
				if (state === 'gameover' && kb.getKeyDown('KeyR')) startGame();
			}

			// Mouse input
			try {
				const pointer = (world.input as any).pointer;
				if (pointer && state === 'playing') {
					if (pointer.isDown || pointer.pressed) thrustInput = true;
				}
			} catch {}

			// XR input
			const xr = (world.input as any).xr;
			if (xr) {
				try {
					const rt = xr.getButtonValue(InputComponent.Trigger);
					if (rt > 0.3) thrustInput = true;
					if (xr.getButtonDown(InputComponent.B_Button)) {
						if (state === 'playing') { state = 'paused'; showUI('paused'); }
						else if (state === 'paused') { state = 'playing'; showUI('playing'); }
					}
				} catch {}
			}

			// Countdown
			if (state === 'countdown') {
				countdownTimer -= dt;
				if (countdownTimer <= 0) {
					countdownVal--;
					if (countdownVal > 0) {
						countdownTimer = 1;
						setText('countdown', 'countdown-text', String(countdownVal));
						audio.countdownTick();
					} else {
						setText('countdown', 'countdown-text', 'FLY!');
						audio.countdownGo();
						audio.gameStart();
						setTimeout(() => {
							state = 'playing';
							showUI('playing');
						}, 500);
					}
				}
			}

			// Toast
			if (toastTimer > 0) {
				toastTimer -= dt;
				if (toastTimer <= 0) {
					try { const o = panelEntities['toast']?.object3D; if (o) o.visible = false; } catch {}
				}
			}

			// ===== GAME UPDATE =====
			if (state === 'playing') {
				gameTime += dt;

				// Thrust
				if (thrustInput) {
					copterVY += THRUST * dt;
					audio.thrust();
				}
				copterVY += GRAVITY * dt;
				copterVY = Math.max(-8, Math.min(8, copterVY));
				copterY += copterVY * dt;

				// Speed increase for gauntlet
				if (mode === 'gauntlet') {
					gameSpeed = Math.min(8, 2.5 + distance * 0.005);
				}

				distance += gameSpeed * dt;

				// Move copter visual
				copterGroup.position.set(COPTER_X, copterY, -2);
				copterGroup.rotation.z = copterVY * 0.03;

				// Rotor spin
				rotor.rotation.y += dt * 30;

				// Glow pulse
				glowMat.opacity = 0.1 + Math.sin(time * 4) * 0.05;

				// Trail
				trailTimer += dt;
				if (trailTimer > 0.03) {
					trailTimer = 0;
					const tp = trailParts[trailIdx % trailParts.length];
					tp.position.copy(copterGroup.position);
					tp.position.x -= 0.3;
					(tp.material as MeshBasicMaterial).opacity = 0.4;
					trailIdx++;
				}
				for (const t of trailParts) {
					const mat = t.material as MeshBasicMaterial;
					if (mat.opacity > 0) mat.opacity -= dt * 0.8;
				}

				// Move gates and orbs relative to copter (scroll world)
				const scrollDx = -gameSpeed * dt;
				for (const g of gates) {
					g.x += scrollDx;
					g.topMesh.position.x = g.x;
					g.botMesh.position.x = g.x;
					const ring = (g.topMesh as any)._ring;
					if (ring) ring.position.x = g.x;
				}
				for (const o of orbs) {
					o.x += scrollDx;
					o.mesh.position.x = o.x;
					o.mesh.rotation.y += dt * 2;
				}

				// Gate collision & pass check
				for (const g of gates) {
					if (!g.passed && g.x < COPTER_X) {
						const inGap = copterY > (g.gapY - g.gapH / 2 + 0.15) && copterY < (g.gapY + g.gapH / 2 - 0.15);
						if (inGap) {
							g.passed = true;
							gatesPassed++;
							combo++;
							gateStreak++;
							if (combo > maxCombo) maxCombo = combo;
							comboDecay = 2.5;
							const pts = 100 * Math.min(combo, 10);
							score += pts;
							audio.gatePass();
							particles.burst(g.x, g.gapY, -2, 20, new Color(theme.gate).getHex());
							if (combo > 1) audio.comboUp();
						} else {
							// Near miss check
							const nearTop = Math.abs(copterY - (g.gapY + g.gapH / 2)) < 0.3;
							const nearBot = Math.abs(copterY - (g.gapY - g.gapH / 2)) < 0.3;
							if (nearTop || nearBot) {
								nearMisses++;
								audio.nearMiss();
							}
						}
					}

					// Wall collision
					if (Math.abs(g.x - COPTER_X) < 0.3) {
						const aboveGap = copterY > (g.gapY + g.gapH / 2 - 0.15);
						const belowGap = copterY < (g.gapY - g.gapH / 2 + 0.15);
						if ((aboveGap || belowGap) && !g.passed) {
							g.passed = true;
							lives--;
							combo = 0;
							gateStreak = 0;
							audio.wallHit();
							particles.burst(COPTER_X, copterY, -2, 25, 0xff4444, 3);
							if (mode !== 'zen' && mode !== 'practice' && lives <= 0) {
								endGame();
								return;
							}
						}
					}
				}

				// Floor/ceiling collision
				if (copterY < -3.5 || copterY > 3.5) {
					copterY = Math.max(-3.5, Math.min(3.5, copterY));
					copterVY = 0;
					if (mode !== 'zen' && mode !== 'practice') {
						lives--;
						combo = 0;
						gateStreak = 0;
						audio.wallHit();
						particles.burst(COPTER_X, copterY, -2, 15, 0xff4444);
						if (lives <= 0) { endGame(); return; }
					}
				}

				// Orb collection
				for (const o of orbs) {
					if (!o.collected) {
						const dx = o.x - COPTER_X;
						const dy = o.mesh.position.y - copterY;
						if (Math.sqrt(dx * dx + dy * dy) < 0.3) {
							o.collected = true;
							o.mesh.visible = false;
							orbsCollected++;
							score += 50 * Math.min(combo, 10);
							audio.orbCollect();
							particles.burst(o.x, o.mesh.position.y, -2, 12, 0xff44ff);
						}
					}
				}

				// Combo decay
				if (combo > 0) {
					comboDecay -= dt;
					if (comboDecay <= 0) { combo = 0; }
				}

				// Spawn new gates
				const furthestGate = gates.length > 0 ? gates[gates.length - 1].x : 0;
				if (furthestGate < 20) spawnGate();

				// Cleanup old gates/orbs
				while (gates.length > 0 && gates[0].x < -5) {
					const g = gates.shift()!;
					scene.remove(g.topMesh); scene.remove(g.botMesh);
					const ring = (g.topMesh as any)._ring;
					if (ring) scene.remove(ring);
				}
				while (orbs.length > 0 && orbs[0].x < -5) {
					const o = orbs.shift()!;
					scene.remove(o.mesh);
				}

				// Speed mode timer
				if (mode === 'speed') {
					const remaining = 60 - gameTime;
					if (remaining <= 0) { endGame(); return; }
					setText('hud', 'hud-time', Math.ceil(remaining) + 's');
				} else {
					setText('hud', 'hud-time', Math.floor(gameTime) + 's');
				}

				// Update HUD
				setText('hud', 'hud-score', String(score));
				setText('hud', 'hud-distance', Math.floor(distance) + 'm');
				setText('hud', 'hud-combo', 'x' + Math.min(combo, 10));
				setText('hud', 'hud-lives', mode === 'zen' || mode === 'practice' ? '--' : String(lives));
				setText('hud', 'hud-mode', mode.toUpperCase());

				thrustInput = false;
			}

			// Decorations animation
			for (let i = 0; i < decos.length; i++) {
				decos[i].rotation.x += dt * 0.3 * (i % 2 === 0 ? 1 : -1);
				decos[i].rotation.y += dt * 0.2;
				decos[i].position.y += Math.sin(time * 0.5 + i) * dt * 0.1;
			}

			// Ambient particles
			for (let i = 0; i < ambientParts.length; i++) {
				const ap = ambientParts[i];
				ap.position.x += Math.sin(time * 0.3 + i * 0.7) * dt * 0.05;
				ap.position.y += Math.cos(time * 0.2 + i * 0.5) * dt * 0.03;
				(ap.material as MeshBasicMaterial).opacity = 0.2 + Math.sin(time + i) * 0.1;
			}

			// Particles
			particles.update(dt);
		}
	}

	world.registerSystem(CopterGameSystem);
}

main();
