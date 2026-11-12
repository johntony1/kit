// sound.ts
// Small sounds for interfaces, made on the fly with the Web Audio API: no files to load.
// Each cue is named for what happens on screen and is built the way real sounds are:
//
//   taps and clicks   three short noise bands (a bright snap, a body, a low thump) and a
//                     tone whose pitch drops in the first few ms, like something being struck
//   bells and dings   a fundamental, a slightly detuned twin (the slow beat of a real bell),
//                     and inharmonic overtones that die away first, struck by a soft noise tick
//   swells            filtered noise that sweeps with a linear rise: air, paper, a drawer
//
//   import { play } from "./sound";
//   play("tick");                 // on a tab change
//   play("detent", { gap: 40 });  // on every step of a wheel, at most every 40 ms
//
// Sounds start after the first click or key press (browsers require it), and can be switched
// off; the choice is remembered. Free to use in anything.

type Tone = {
  /** start frequency in Hz (for noise: the filter frequency) */
  hz: number;
  /** glide to this frequency */
  to?: number;
  /** reach `to` after this many ms, then hold (default: over the whole tone) */
  glide?: number;
  /** length in ms */
  ms: number;
  /** start delay in ms */
  at?: number;
  /** peak volume */
  vol?: number;
  wave?: OscillatorType;
  /** filtered noise instead of a tone */
  noise?: BiquadFilterType;
  q?: number;
  /** lowpass the tone at this frequency */
  cut?: number;
  /** attack in ms */
  atk?: number;
  /** linear attack: a swell rather than a hit */
  lin?: boolean;
};

/* ── building blocks ──────────────────────────────────────────────────────── */

/** something small being struck: snap, body, thump, and a tone that drops as it hits */
const strikeTap = (o: { snap: number; body: number; thump: number; tone: number; vol?: number; at?: number }): Tone[] => {
  const v = o.vol ?? 1, at = o.at ?? 0;
  return [
    { hz: o.snap, ms: 5, vol: 0.085 * v, noise: "bandpass", q: 1.1, atk: 1, at },
    { hz: o.body, ms: 13, vol: 0.17 * v, noise: "bandpass", q: 3.2, atk: 1, at },
    { hz: o.thump, ms: 24, vol: 0.26 * v, noise: "bandpass", q: 2.4, atk: 2, at },
    { hz: o.tone, to: o.tone * 0.66, glide: 16, ms: 22, vol: 0.026 * v, atk: 1, at },
  ];
};

/** a small bell: fundamental, a detuned twin, inharmonic overtones, a soft strike */
const bell = (hz: number, o: { ms?: number; vol?: number; at?: number } = {}): Tone[] => {
  const ms = o.ms ?? 520, v = o.vol ?? 1, at = o.at ?? 0;
  return [
    { hz: Math.min(5000, hz * 2.6), ms: 5, vol: 0.022 * v, noise: "lowpass", q: -3, atk: 1, at },
    { hz, ms, vol: 0.03 * v, atk: 3, at },
    { hz: hz * 1.0035, ms: ms * 0.93, vol: 0.015 * v, atk: 3, at },
    { hz: hz * 2.76, ms: ms * 0.45, vol: 0.0085 * v, atk: 3, at },
    { hz: hz * 5.4, ms: ms * 0.27, vol: 0.0028 * v, atk: 3, at },
  ];
};

/** air moving: band of noise sweeping from `from` to `to` with a linear swell */
const air = (from: number, to: number, ms: number, o: { vol?: number; q?: number; at?: number; atk?: number } = {}): Tone =>
  ({ hz: from, to, glide: ms * 0.8, ms, vol: o.vol ?? 0.12, noise: "bandpass", q: o.q ?? 1.3, atk: o.atk ?? ms * 0.45, lin: true, at: o.at });

/* ── the cues ─────────────────────────────────────────────────────────────── */

export const CUES = {
  /** a light press on a button */
  tap: strikeTap({ snap: 3300, body: 1350, thump: 300, tone: 540 }),
  /** a key press while typing */
  key: strikeTap({ snap: 4100, body: 1650, thump: 330, tone: 620, vol: 0.8 }),
  /** a tab, a segment, an option changes */
  tick: [
    { hz: 2700, ms: 7, vol: 0.13, noise: "bandpass", q: 2.2, atk: 1 },
    { hz: 700, to: 450, glide: 18, ms: 22, vol: 0.026, atk: 1 },
  ],
  /** one step of a wheel, a ruler or a slider: a tiny ratchet */
  detent: [
    { hz: 3600, ms: 4, vol: 0.075, noise: "bandpass", q: 2.6, atk: 1 },
    { hz: 1250, to: 900, glide: 8, ms: 12, vol: 0.012, atk: 1 },
  ],
  /** a switch latches on / lets go */
  on: [
    { hz: 2900, ms: 6, vol: 0.1, noise: "bandpass", q: 2, atk: 1 },
    { hz: 300, to: 430, glide: 40, ms: 90, vol: 0.04, wave: "sine", cut: 1300, atk: 6 },
  ],
  off: [
    { hz: 2300, ms: 6, vol: 0.085, noise: "bandpass", q: 2, atk: 1 },
    { hz: 340, to: 250, glide: 50, ms: 90, vol: 0.034, wave: "sine", cut: 800, atk: 6 },
  ],
  /** something opens up: air rises and a soft note blooms */
  open: [
    air(640, 1550, 115),
    { hz: 587.33, ms: 230, vol: 0.012, atk: 50, lin: true },
    { hz: 1174.66, ms: 140, vol: 0.004, atk: 50, lin: true },
  ],
  /** something folds away: air falls, a low note, a small catch at the end */
  close: [
    air(1450, 560, 80, { vol: 0.115, atk: 20 }),
    { hz: 293.66, ms: 110, vol: 0.013, atk: 3 },
    { hz: 380, ms: 26, vol: 0.12, noise: "bandpass", q: 2, atk: 1, at: 60 },
  ],
  /** something slides along (a drawer, a handle, a row) */
  slide: [air(1700, 2500, 110, { vol: 0.022, q: 1, atk: 20 })],
  /** something settles into place */
  land: [
    { hz: 1050, ms: 28, vol: 0.06, noise: "lowpass", q: -3, atk: 2 },
    { hz: 165, to: 118, glide: 30, ms: 75, vol: 0.05, wave: "sine", cut: 700, atk: 3 },
    { hz: 3100, ms: 7, vol: 0.02, noise: "bandpass", q: 4, atk: 1, at: 4 },
  ],
  /** a small burst: a like, a dot burst, confetti */
  pop: [
    { hz: 640, to: 990, ms: 36, vol: 0.05, wave: "sine", atk: 3 },
    { hz: 3300, ms: 6, vol: 0.035, noise: "bandpass", q: 3, atk: 1 },
  ],
  /** done: paid, sent, saved. Two bells, a fifth apart */
  chime: [...bell(659.25, { ms: 300, vol: 1.1 }), ...bell(987.77, { ms: 620, at: 95 })],
  /** a task is ticked off: a quick tap into a bright bell */
  check: [
    { hz: 2900, ms: 6, vol: 0.09, noise: "bandpass", q: 2, atk: 1 },
    { hz: 523.25, to: 540, glide: 20, ms: 70, vol: 0.022, wave: "triangle", cut: 1800, atk: 2 },
    ...bell(783.99, { ms: 360, vol: 0.9, at: 55 }),
  ],
  /** copied to the clipboard: two clean notes */
  copy: [
    { hz: 932.33, ms: 70, vol: 0.026, cut: 2400, atk: 4 },
    { hz: 1244.51, ms: 160, vol: 0.021, cut: 2600, atk: 4, at: 55 },
  ],
  /** a card turns over: a swish, then it slaps down */
  flip: [
    air(900, 2800, 250, { vol: 0.03, q: 1, atk: 70 }),
    { hz: 3300, ms: 11, vol: 0.07, noise: "bandpass", q: 4, atk: 1, at: 270 },
    { hz: 260, to: 190, glide: 14, ms: 28, vol: 0.04, wave: "triangle", cut: 1200, atk: 1, at: 272 },
  ],
  /** cards fan out: a ripple of edges, then the air they move */
  fan: [
    ...[0, 24, 46, 71, 95].map((at, i) => ({ hz: [2650, 2950, 2750, 3250, 3050][i], ms: 9, vol: 0.05 - i * 0.006, noise: "bandpass" as const, q: 3, atk: 1, at })),
    air(1800, 2600, 120, { vol: 0.012, q: 1, atk: 20 }),
  ],
  /** a page or a sheet of paper turns */
  rustle: [
    air(1600, 3600, 280, { vol: 0.05, q: 0.8, atk: 110 }),
    { hz: 4300, ms: 11, vol: 0.03, noise: "bandpass", q: 3, atk: 1, at: 130 },
    { hz: 3100, ms: 13, vol: 0.028, noise: "bandpass", q: 3, atk: 1, at: 205 },
    { hz: 1100, ms: 26, vol: 0.04, noise: "lowpass", q: -3, atk: 2, at: 270 },
  ],
  /** a file drops in */
  drop: [
    { hz: 260, to: 470, glide: 50, ms: 100, vol: 0.04, wave: "sine", cut: 1600, atk: 4 },
    { hz: 1100, ms: 26, vol: 0.05, noise: "lowpass", q: -3, atk: 2, at: 80 },
    { hz: 150, to: 110, glide: 25, ms: 60, vol: 0.035, wave: "sine", cut: 600, atk: 3, at: 82 },
  ],
  /** something is removed: it falls away with a breath of air */
  remove: [
    { hz: 520, to: 255, glide: 90, ms: 130, vol: 0.038, wave: "sine", cut: 1200, atk: 3 },
    air(2200, 800, 110, { vol: 0.04, q: 1, atk: 12 }),
  ],
  /** a receipt printer feeds paper: a motor hum under a run of tiny ticks */
  print: [
    { hz: 118, ms: 1300, vol: 0.026, wave: "sawtooth", cut: 420, atk: 60, lin: true },
    { hz: 236, ms: 1300, vol: 0.008, wave: "square", cut: 600, atk: 60, lin: true },
    ...Array.from({ length: 22 }, (_, i) => ({ hz: 3600 + ((i * 397) % 900), ms: 5, vol: 0.05 - (i % 3) * 0.01, noise: "bandpass" as const, q: 3, atk: 1, at: 40 + i * 55 })),
  ],
  /** a page transition sweeps across */
  whoosh: [
    air(380, 1800, 320, { vol: 0.1, q: 1, atk: 140 }),
    { hz: 520, ms: 300, vol: 0.035, noise: "lowpass", q: 0.7, atk: 110, lin: true },
    air(1800, 600, 240, { vol: 0.05, q: 1, atk: 30, at: 300 }),
  ],
  /** fire catches: a bed of hiss under scattered pops */
  crackle: [
    { hz: 3200, ms: 1000, vol: 0.02, noise: "highpass", q: 0.5, atk: 200, lin: true },
    { hz: 400, ms: 900, vol: 0.03, noise: "lowpass", q: 0.7, atk: 250, lin: true },
    ...Array.from({ length: 22 }, (_, i) => ({ hz: 1800 + ((i * 1733) % 3200), ms: 4 + (i % 3) * 3, vol: 0.09 - (i % 4) * 0.018, noise: "bandpass" as const, q: 2.5, atk: 1, at: (i * 97 + (i % 5) * 31) % 950 })),
  ],
  /** a ripple of light: a water drop */
  bloop: [
    { hz: 1250, to: 430, glide: 60, ms: 140, vol: 0.045, wave: "sine", cut: 2600, atk: 2 },
    { hz: 2500, to: 900, glide: 40, ms: 60, vol: 0.008, wave: "sine", atk: 2 },
    { hz: 1900, ms: 6, vol: 0.025, noise: "bandpass", q: 3, atk: 1 },
  ],
  /** a heavy cube or deck turns over and lands */
  roll: [
    air(300, 1300, 280, { vol: 0.06, q: 0.9, atk: 120 }),
    { hz: 1000, ms: 30, vol: 0.06, noise: "lowpass", q: -3, atk: 2, at: 290 },
    { hz: 120, to: 82, glide: 40, ms: 120, vol: 0.06, wave: "sine", cut: 600, atk: 3, at: 290 },
  ],
  /** play / pause */
  play: [
    { hz: 2600, ms: 6, vol: 0.07, noise: "bandpass", q: 2, atk: 1 },
    { hz: 392, to: 523.25, glide: 40, ms: 120, vol: 0.036, wave: "sine", cut: 1400, atk: 4 },
  ],
  pause: [
    { hz: 2200, ms: 6, vol: 0.06, noise: "bandpass", q: 2, atk: 1 },
    { hz: 440, to: 330, glide: 40, ms: 110, vol: 0.032, wave: "sine", cut: 1100, atk: 4 },
  ],
} satisfies Record<string, Tone[]>;

export type Cue = keyof typeof CUES;

/** cues that repeat fast get a little pitch drift so a run of them does not sound machine-made */
const VARY: Partial<Record<Cue, number>> = { detent: 0.05, tick: 0.025, key: 0.06, tap: 0.02, slide: 0.06, pop: 0.05 };

/** level trims in dB on top of the +12 dB master, measured offline so every cue peaks
 * near the same level (clicks about -14 dBFS, ratchets and slides a little under) */
const TRIM: Partial<Record<Cue, number>> = { tap: -0.9, key: -0.3, tick: -3.3, detent: 2.7, on: 1.4, off: 1.1, close: -0.3, slide: 7.2, pop: -0.4, chime: -2.7, check: -0.6, copy: 3, flip: 2.6, fan: 8.1, rustle: 0.6, drop: 1.2, remove: -1.1, print: 2.6, whoosh: 1, crackle: 0.5, bloop: -0.9, roll: -2.2, play: 1.7, pause: 1.2 };

const KEY = "effects-sound";
let ctx: AudioContext | null = null;
let out: AudioNode | null = null;
let unlocked = false;
let primed = false;
// sound is always on: the site has no switch for it (an older stored "off" is ignored)
let on = true;
const subs = new Set<() => void>();
const last: Partial<Record<Cue, number>> = {};
const noiseBufs = new WeakMap<BaseAudioContext, AudioBuffer>();

/** +12 dB master into a soft clipper: transparent at normal levels, rounds off cues that
 * stack on top of each other. (The built-in compressor is not used: it swallows short clicks.) */
function bus(c: AudioContext) {
  if (out) return out;
  const clip = c.createWaveShaper();
  const n = 2048, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; curve[i] = Math.abs(x) < 0.6 ? x : Math.sign(x) * (0.6 + 0.4 * Math.tanh((Math.abs(x) - 0.6) / 0.4)); }
  clip.curve = curve; clip.oversample = "2x";
  const pre = c.createGain(); pre.gain.value = 4;
  pre.connect(clip).connect(c.destination);
  return (out = pre);
}

function wake() {
  try { ctx ??= new AudioContext(); } catch { return; }
  if (ctx.state !== "running") void ctx.resume();
  if (!primed) {
    // a silent buffer started inside the gesture unlocks audio on iOS
    primed = true;
    try { const b = ctx.createBufferSource(); b.buffer = ctx.createBuffer(1, 1, ctx.sampleRate); b.connect(ctx.destination); b.start(0); } catch { /* ignore */ }
  }
}

// browsers only let audio start from a user gesture
if (typeof window !== "undefined") {
  const evs = ["pointerdown", "keydown", "touchend", "click"] as const;
  const onGesture = (e: Event) => {
    if (!e.isTrusted) return;
    unlocked = true;
    wake();
    if (ctx?.state === "running") evs.forEach((n) => removeEventListener(n, onGesture, true));
  };
  evs.forEach((n) => addEventListener(n, onGesture, true));
}

export const sound = {
  enabled: () => on,
  toggle() {
    on = !on;
    try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode */ }
    if (on) play("tick", { force: true });
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};

function noise(c: BaseAudioContext) {
  let b = noiseBufs.get(c);
  if (!b) {
    b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    noiseBufs.set(c, b);
  }
  return b;
}

/** schedule a list of tones on any audio context (live or offline) */
export function render(c: BaseAudioContext, dest: AudioNode, tones: Tone[], t0: number, pitch = 1, vol = 1) {
  for (const s of tones) {
    const start = t0 + (s.at ?? 0) / 1000, end = start + s.ms / 1000;
    const bend = s.glide ? start + s.glide / 1000 : end;
    let src: AudioScheduledSourceNode, node: AudioNode;
    if (s.noise) {
      const b = c.createBufferSource(); b.buffer = noise(c); b.loop = true;
      const f = c.createBiquadFilter(); f.type = s.noise; f.frequency.setValueAtTime(s.hz * pitch, start);
      if (s.to) f.frequency.exponentialRampToValueAtTime(s.to * pitch, bend);
      if (s.q !== undefined) f.Q.value = s.q;
      b.connect(f); src = b; node = f;
    } else {
      const o = c.createOscillator(); o.type = s.wave ?? "sine"; o.frequency.setValueAtTime(s.hz * pitch, start);
      if (s.to) o.frequency.exponentialRampToValueAtTime(s.to * pitch, bend);
      src = o; node = o;
    }
    if (s.cut) { const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = s.cut; node.connect(f); node = f; }
    const g = c.createGain();
    const atk = Math.min((s.atk ?? 4) / 1000, (s.ms / 1000) * 0.6);
    const peak = Math.max(0.0002, (s.vol ?? 0.04) * vol);
    g.gain.setValueAtTime(0.0001, start);
    if (s.lin) g.gain.linearRampToValueAtTime(peak, start + atk); else g.gain.exponentialRampToValueAtTime(peak, start + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    node.connect(g).connect(dest);
    if (src instanceof AudioBufferSourceNode) src.start(start, Math.random() * 1.5); else src.start(start);
    src.stop(end + 0.02);
  }
}

/** play a cue. gap: skip if the same cue played less than this many ms ago. pitch: 1 = as written */
export function play(cue: Cue, opts: { gap?: number; pitch?: number; vol?: number; force?: boolean } = {}) {
  if ((!on && !opts.force) || !unlocked) return;
  if (typeof document !== "undefined" && document.hidden) return;
  const now = performance.now();
  if (opts.gap && now - (last[cue] ?? -Infinity) < opts.gap) return;
  last[cue] = now;
  wake();
  const c = ctx;
  if (!c || c.state !== "running") return;
  const drift = VARY[cue] ? 1 + (Math.random() * 2 - 1) * VARY[cue]! : 1;
  const trim = Math.pow(10, (TRIM[cue] ?? 0) / 20);
  render(c, bus(c), CUES[cue] as Tone[], c.currentTime, (opts.pitch ?? 1) * drift, (opts.vol ?? 1) * trim);
}
