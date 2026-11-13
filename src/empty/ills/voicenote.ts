// No voice notes: a thick pill shaped bubble with a play mark and a waveform cut into its face. The waveform pulses as if the note plays, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.8; // seconds per loop
const W = 38, H = 20, Y0 = -4; // bubble width, height, back of the slab

// a pill with a small tail at its lower left, in the x-z plane
function pill(): [number, number][] {
  const r = H / 2, pts: [number, number][] = [[r + 1, 0], [1, -5], [r + 6, 0]];
  for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 14; pts.push([W - r + Math.cos(a) * r, r + Math.sin(a) * r]); }
  for (let i = 0; i <= 14; i++) { const a = Math.PI / 2 + (Math.PI * i) / 14; pts.push([r + Math.cos(a) * r, r + Math.sin(a) * r]); }
  return pts.map(([u, v]) => [u - W / 2, v - H / 2]);
}

const BARS = [0.45, 0.85, 1, 0.6, 0.9, 0.5, 0.75];

export const voicenote: Illustration = {
  k: "voicenote", name: "Voice note", title: "No voice notes", body: "Hold the mic button to record a voice note. It will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t % P) / P;
    p.push(); p.translate(0, 0, -15); p.shadow(0, 1, 27, 8, 0.1); p.pop();
    p.translate(0, 0, Math.sin(ph * Math.PI * 2) * 0.6);
    p.rotate("z", -0.55);
    const shape = pill();
    const at = (y: number) => shape.map(([u, v]) => [u, y, v] as V3);
    p.face(at(Y0), SH.right, SH.edge, 0.55);
    for (let y = Y0 + 0.4; y < 0; y += 0.4) p.face(at(y), 0.08, 0);
    p.face(at(0), 0.24, SH.edge, 0.65);
    // the play mark: a dark triangle
    const y = 0.08;
    p.clear([[-14.5, y, -4.2], [-14.5, y, 4.2], [-7.8, y, 0]]);
    // the waveform: bars that swell in a wave running along it
    BARS.forEach((b, i) => {
      const x = -4.5 + i * 3;
      const w = 0.5 + 0.5 * Math.sin(ph * Math.PI * 2 - i * 0.75);
      const hh = 1 + 6 * b * (0.45 + 0.55 * w);
      p.line([[x, y, -hh], [x, y, hh]], SH.edge, 1.6);
    });
  },
};
