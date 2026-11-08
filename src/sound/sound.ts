// sound.ts
// Small sounds for interfaces, made on the fly with the Web Audio API: no files to load.
// Each cue is named for what happens on screen (a tick for a tab, a thud when something
// lands, a rustle for paper) and is a few short tones or filtered noise bursts.
//
//   import { play } from "./sound";
//   play("tick");                 // on a tab change
//   play("detent", { gap: 40 });  // on every step of a wheel, at most every 40 ms
//
// Sounds start after the first click or key press (browsers require it), stay quiet,
// and can be switched off; the choice is remembered. Free to use in anything.

type Tone = {
  /** start frequency in Hz (for noise: the filter frequency) */
  hz: number;
  /** glide to this frequency over the tone */
  to?: number;
  /** length in ms */
  ms: number;
  /** start delay in ms */
  at?: number;
  /** peak volume, 0..1 (keep it small: 0.01 to 0.08) */
  vol?: number;
  wave?: OscillatorType;
  /** filtered noise instead of a tone */
  noise?: BiquadFilterType;
  q?: number;
  /** lowpass the tone at this frequency */
  cut?: number;
  /** attack in ms */
  atk?: number;
};

export const CUES = {
  /** a light press on a button */
  tap: [{ hz: 210, to: 150, ms: 70, vol: 0.06, cut: 1200, atk: 2 }],
  /** a tab, a segment, an option changes */
  tick: [{ hz: 1500, ms: 8, vol: 0.03, noise: "bandpass", q: 5, atk: 1 }, { hz: 420, to: 330, ms: 40, vol: 0.035, wave: "triangle", cut: 1600, atk: 2 }],
  /** one step of a wheel, a ruler or a slider */
  detent: [{ hz: 2400, ms: 6, vol: 0.022, noise: "bandpass", q: 6, atk: 1 }, { hz: 600, ms: 18, vol: 0.016, wave: "sine", atk: 1 }],
  /** a switch turns on / off */
  on: [{ hz: 380, to: 560, ms: 70, vol: 0.05, wave: "sine", cut: 2000, atk: 3 }, { hz: 1800, ms: 7, vol: 0.02, noise: "bandpass", q: 4, atk: 1 }],
  off: [{ hz: 460, to: 300, ms: 80, vol: 0.045, wave: "sine", cut: 1400, atk: 3 }, { hz: 1500, ms: 7, vol: 0.016, noise: "bandpass", q: 4, atk: 1 }],
  /** something opens up / folds away */
  open: [{ hz: 700, to: 2400, ms: 220, vol: 0.016, noise: "bandpass", q: 1.2, atk: 60 }, { hz: 300, to: 440, ms: 200, vol: 0.026, wave: "sine", cut: 1400, atk: 40 }],
  close: [{ hz: 2200, to: 700, ms: 200, vol: 0.014, noise: "bandpass", q: 1.2, atk: 40 }, { hz: 420, to: 280, ms: 180, vol: 0.024, wave: "sine", cut: 1200, atk: 30 }],
  /** something slides along (a drawer, a handle, a row) */
  slide: [{ hz: 1400, to: 2600, ms: 160, vol: 0.016, noise: "bandpass", q: 1, atk: 40 }],
  /** something heavy lands or settles */
  land: [{ hz: 130, to: 72, ms: 130, vol: 0.09, wave: "sine", atk: 2 }, { hz: 900, ms: 28, vol: 0.03, noise: "lowpass", atk: 2 }],
  /** a small burst: a like, a dot burst, confetti */
  pop: [{ hz: 620, to: 1000, ms: 46, vol: 0.05, wave: "sine", atk: 2 }, { hz: 3000, ms: 8, vol: 0.02, noise: "bandpass", q: 3, atk: 1 }],
  /** done: paid, sent, saved */
  chime: [{ hz: 660, ms: 160, vol: 0.04, wave: "sine", cut: 2600, atk: 4 }, { hz: 990, ms: 420, vol: 0.038, wave: "sine", cut: 2800, atk: 5, at: 90 }, { hz: 1980, ms: 260, vol: 0.008, wave: "sine", atk: 6, at: 95 }],
  /** a task is ticked off */
  check: [{ hz: 520, ms: 60, vol: 0.045, wave: "triangle", cut: 2200, atk: 2 }, { hz: 780, ms: 160, vol: 0.04, wave: "sine", cut: 2600, atk: 3, at: 55 }],
  /** copied to the clipboard */
  copy: [{ hz: 900, ms: 30, vol: 0.035, wave: "sine", atk: 1 }, { hz: 1350, ms: 70, vol: 0.035, wave: "sine", atk: 1, at: 60 }],
  /** a card turns over */
  flip: [{ hz: 900, to: 2600, ms: 150, vol: 0.022, noise: "bandpass", q: 1, atk: 40 }, { hz: 3200, ms: 9, vol: 0.05, noise: "bandpass", q: 4, atk: 1, at: 160 }, { hz: 240, to: 180, ms: 30, vol: 0.035, wave: "triangle", cut: 1200, atk: 1, at: 162 }],
  /** cards fan out */
  fan: [0, 30, 58, 90].map((at, i) => ({ hz: 2500 + i * 220, ms: 10, vol: 0.04 - i * 0.006, noise: "bandpass" as const, q: 3, atk: 1, at })),
  /** a page or a sheet of paper turns */
  rustle: [{ hz: 1800, to: 3600, ms: 260, vol: 0.02, noise: "bandpass", q: 0.8, atk: 90 }, { hz: 4200, ms: 12, vol: 0.016, noise: "bandpass", q: 3, atk: 1, at: 120 }, { hz: 3000, ms: 14, vol: 0.016, noise: "bandpass", q: 3, atk: 1, at: 210 }],
  /** a key press */
  key: [{ hz: 3400, ms: 6, vol: 0.02, noise: "bandpass", q: 5, atk: 1 }, { hz: 180, ms: 20, vol: 0.02, wave: "triangle", cut: 900, atk: 1 }],
  /** a file drops in */
  drop: [{ hz: 300, to: 520, ms: 90, vol: 0.04, wave: "sine", cut: 1800, atk: 4 }, { hz: 1100, ms: 26, vol: 0.03, noise: "lowpass", atk: 2, at: 80 }],
  /** something is removed */
  remove: [{ hz: 520, to: 220, ms: 120, vol: 0.04, wave: "sine", cut: 1400, atk: 3 }, { hz: 2400, to: 900, ms: 110, vol: 0.012, noise: "bandpass", q: 1, atk: 10 }],
  /** a receipt printer feeds paper */
  print: [{ hz: 140, ms: 900, vol: 0.022, wave: "sawtooth", cut: 520, atk: 30 }, ...Array.from({ length: 14 }, (_, i) => ({ hz: 3800 + (i % 3) * 400, ms: 6, vol: 0.014, noise: "bandpass" as const, q: 4, atk: 1, at: 40 + i * 60 }))],
  /** a page transition sweeps across */
  whoosh: [{ hz: 400, to: 2000, ms: 420, vol: 0.024, noise: "bandpass", q: 0.9, atk: 160 }, { hz: 2000, to: 600, ms: 300, vol: 0.016, noise: "bandpass", q: 0.9, atk: 40, at: 380 }],
  /** fire catches */
  crackle: Array.from({ length: 16 }, (_, i) => ({ hz: 2200 + ((i * 1733) % 2600), ms: 5 + (i % 3) * 3, vol: 0.03 - (i % 4) * 0.005, noise: "bandpass" as const, q: 3, atk: 1, at: ((i * 97) % 900) })),
  /** a ripple of light: a soft water drop */
  bloop: [{ hz: 880, to: 300, ms: 180, vol: 0.05, wave: "sine", cut: 2400, atk: 2 }, { hz: 1760, to: 600, ms: 120, vol: 0.01, wave: "sine", atk: 2 }],
  /** a heavy cube or deck turns */
  roll: [{ hz: 300, to: 1400, ms: 280, vol: 0.02, noise: "bandpass", q: 0.9, atk: 120 }, { hz: 110, to: 80, ms: 120, vol: 0.06, wave: "sine", atk: 3, at: 290 }],
  /** play / pause */
  play: [{ hz: 440, to: 660, ms: 90, vol: 0.04, wave: "sine", cut: 2000, atk: 3 }],
  pause: [{ hz: 560, to: 380, ms: 90, vol: 0.036, wave: "sine", cut: 1600, atk: 3 }],
} satisfies Record<string, Tone[]>;

export type Cue = keyof typeof CUES;

const KEY = "effects-sound";
let ctx: AudioContext | null = null;
let unlocked = false;
let on = (() => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } })();
const subs = new Set<() => void>();
const last: Partial<Record<Cue, number>> = {};
let noiseBuf: AudioBuffer | null = null;

// browsers only let audio start from a user gesture
if (typeof window !== "undefined") {
  const evs = ["pointerdown", "keydown", "touchend"] as const;
  const wake = (e: Event) => {
    if (!e.isTrusted) return;
    unlocked = true;
    try { ctx ??= new AudioContext(); if (ctx.state !== "running") void ctx.resume(); } catch { return; }
    evs.forEach((n) => removeEventListener(n, wake, true));
  };
  evs.forEach((n) => addEventListener(n, wake, true));
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

function noise(c: AudioContext) {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

/** play a cue. gap: skip if the same cue played less than this many ms ago. pitch: 1 = as written */
export function play(cue: Cue, opts: { gap?: number; pitch?: number; vol?: number; force?: boolean } = {}) {
  if ((!on && !opts.force) || !unlocked || !ctx || ctx.state !== "running") return;
  if (typeof matchMedia !== "undefined" && document.hidden) return;
  const now = performance.now();
  if (opts.gap && now - (last[cue] ?? -Infinity) < opts.gap) return;
  last[cue] = now;
  const c = ctx, t0 = c.currentTime, k = opts.pitch ?? 1, v = opts.vol ?? 1;
  for (const s of CUES[cue] as Tone[]) {
    const start = t0 + (s.at ?? 0) / 1000, end = start + s.ms / 1000;
    let src: AudioScheduledSourceNode, out: AudioNode;
    if (s.noise) {
      const b = c.createBufferSource(); b.buffer = noise(c); b.loop = true;
      const f = c.createBiquadFilter(); f.type = s.noise; f.frequency.setValueAtTime(s.hz * k, start);
      if (s.to) f.frequency.exponentialRampToValueAtTime(s.to * k, end);
      if (s.q !== undefined) f.Q.value = s.q;
      b.connect(f); src = b; out = f;
    } else {
      const o = c.createOscillator(); o.type = s.wave ?? "sine"; o.frequency.setValueAtTime(s.hz * k, start);
      if (s.to) o.frequency.exponentialRampToValueAtTime(s.to * k, end);
      src = o; out = o;
    }
    if (s.cut) { const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = s.cut; out.connect(f); out = f; }
    const g = c.createGain();
    const atk = Math.min((s.atk ?? 4) / 1000, (s.ms / 1000) * 0.6);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, (s.vol ?? 0.04) * v), start + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    out.connect(g).connect(c.destination);
    if (src instanceof AudioBufferSourceNode) src.start(start, Math.random() * 1.5); else src.start(start);
    src.stop(end + 0.02);
  }
}
