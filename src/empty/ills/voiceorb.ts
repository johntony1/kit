// Say something to start: a glowing voice orb floating over its shadow, a short waveform cut across its face. The bars rise and fall as if it is listening, the orb breathes and rings ripple out from it.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const TAU = Math.PI * 2;
const at = (c: V3, a: number, b: number): V3 => [c[0] + a * 0.577, c[1] - a * 0.577, c[2] + b];
const circle = (c: V3, r: number): V3[] => Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * TAU; return at(c, Math.cos(a) * r, Math.sin(a) * r); });
const ENV = [0.45, 0.75, 1, 0.75, 0.45];
const R = 15; // orb radius

export const voiceorb: Illustration = {
  k: "voiceorb", name: "Voice orb", title: "Say something to start", body: "Tap the microphone and start talking. What you say will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const breath = 0.5 - 0.5 * Math.cos(u * TAU * 2);
    p.translate(0, 0, -19);
    p.shadow(0, 0, 22, 9, 0.12);
    const C: V3 = [0, 0, 21 + Math.sin(u * TAU) * 0.8];
    const [cx, cy] = p.pt(C);
    // two rings ripple out from the orb and fade, always inside the same reach
    p.screen((g) => {
      for (let i = 0; i < 2; i++) {
        const k = (u * 2 + i * 0.5) % 1;
        const v = Math.round(255 * Math.sin(k * Math.PI) * 0.9);
        g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = 1.6;
        g.beginPath(); g.arc(cx, cy, R + 1.5 + k * 6, 0, TAU); g.stroke();
      }
    });
    // the orb: a dark disc, a lit disc up to the left, a bright cap
    const r = R * (1 + 0.03 * breath);
    p.face(circle(C, r), 0.08, SH.edge, 0.6);
    p.face(circle(at(C, -0.12 * r, 0.12 * r), r * 0.8), 0.15, 0);
    p.face(circle(at(C, -0.3 * r, 0.3 * r), r * 0.44), 0.34, 0);
    // the waveform: five dark bars cut across the face
    p.screen((g) => {
      g.strokeStyle = "#000"; g.lineCap = "round"; g.lineWidth = 2.6;
      g.beginPath();
      ENV.forEach((e, i) => {
        const a = 0.5 + 0.5 * Math.sin(TAU * (u * 2 - i * 0.18)), b = 0.5 + 0.5 * Math.sin(TAU * (u * 3 + i * 0.37));
        const hh = 1 + e * 8 * (0.25 + 0.5 * a + 0.25 * b);
        const x = cx - 1.5 + (i - 2) * 4.4;
        g.moveTo(x, cy - hh); g.lineTo(x, cy + hh);
      });
      g.stroke();
    });
  },
};
