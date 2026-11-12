// No voices yet: a voice waveform made of floating bars. The bars rise and fall as if someone is speaking, the middle one lit.
import { type Illustration } from "../dots";

const P = 2.4; // seconds per loop
const TAU = Math.PI * 2;
const ENV = [0.3, 0.58, 0.85, 1, 0.8, 0.55, 0.3];

export const voiceai: Illustration = {
  k: "voiceai", name: "Voice", title: "No voices yet", body: "Create or clone a voice and it will be listed here, ready to speak.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -16);
    p.rotate("z", -0.45);
    for (let i = 0; i < 7; i++) p.shadow(-15 + i * 5, 0, 5.5, 3, 0.12);
    for (let i = 0; i < 7; i++) {
      const a = 0.5 + 0.5 * Math.sin(TAU * (ph - i * 0.13)), b = 0.5 + 0.5 * Math.sin(TAU * (2 * ph + i * 0.31));
      const hgt = 3.4 + ENV[i] * 25 * (0.25 + 0.45 * a + 0.3 * b);
      const mid = i === 3;
      p.box(-16.6 + i * 5, -1.6, 17 - hgt / 2, 3.2, 3.2, hgt, { top: mid ? 0.34 : 0.22, left: mid ? 0.3 : 0.13, right: mid ? 0.16 : 0.07, lw: 0.6 });
    }
  },
};
