// No settings changed: a big horizontal slider seen from the front, a lit fill on the left of its track, a round knob and a value bubble over it. Hover and the knob glides right, the fill follows and the number in the bubble climbs.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const L = 19, TZ = 12, TH = 3.8, KR = 8; // track half length, centre height, half height; knob radius
// seven segment digits: which of the segments a b c d e f g are lit
const SEG: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg" };

export const slider: Illustration = {
  k: "slider", name: "Slider", title: "No settings changed", body: "Adjust a setting and your changes will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(h);
    const f = 0.3 + 0.5 * k; // how far along the knob sits
    const kx = -L + TH + f * (2 * L - 2 * TH);
    p.translate(0, 0, -18);
    p.shadow(0, 0, 22, 8, 0.12);
    p.rotate("z", -0.62); // turned to face us
    const pill = (x0: number, x1: number, zc: number, r: number, y: number): V3[] => {
      const out: V3[] = [];
      for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; out.push([x1 + Math.cos(a) * r, y, zc + Math.sin(a) * r]); }
      for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; out.push([x0 + Math.cos(a) * r, y, zc + Math.sin(a) * r]); }
      return out;
    };
    // the track: a lit rim with depth, a dark groove, the bright fill up to the knob
    for (let y = -2; y < 0; y += p.ink ? 2 : 0.4) p.face(pill(-L + TH, L - TH, TZ, TH + 1, y), SH.right, 0);
    p.face(pill(-L + TH, L - TH, TZ, TH + 1, 0), 0.2, 0);
    p.face(pill(-L + TH, L - TH, TZ, TH, 0.03), 0.03, 0);
    p.face(pill(-L + TH, kx, TZ, TH - 0.4, 0.06), 0.3, 0);
    // the knob: a thick bright disc with a dark rim
    for (let y = 0.4; y < 2; y += p.ink ? 1.6 : 0.4) p.ringV("y", [kx, y, TZ], KR, SH.right, 0);
    p.ringV("y", [kx, 2, TZ], KR + 0.6, 0.03, 0);
    p.ringV("y", [kx, 2.05, TZ], KR, 0.45, 0);
    p.ringV("y", [kx, 2.1, TZ], KR * 0.36, 0.2, 0);
    // the value bubble over the knob: a lit rounded box with a point, a two digit number cut in
    const BZ = TZ + KR + 8.5, BW = 9.4, BH = 5.8;
    const bub = [...pill(kx - BW + BH, kx + BW - BH, BZ, BH, 2)];
    p.face([[kx - 2.2, 2, BZ - BH + 0.2], [kx + 2.2, 2, BZ - BH + 0.2], [kx, 2, BZ - BH - 2.6]], 0.3, 0);
    p.face(bub, 0.3, 0);
    const v = Math.min(99, Math.round(f * 10) * 10);
    const digit = (ch: string, cx: number) => {
      const w = 1.9, hh = 3.2, y = 2.06;
      const P: Record<string, [number, number][]> = {
        a: [[-w, hh], [w, hh]], b: [[w, hh], [w, 0]], c: [[w, 0], [w, -hh]], d: [[-w, -hh], [w, -hh]],
        e: [[-w, 0], [-w, -hh]], f: [[-w, hh], [-w, 0]], g: [[-w, 0], [w, 0]],
      };
      for (const s of SEG[ch]) p.line(P[s].map(([a, b]) => [cx + a, y, BZ + b] as V3), SH.edge, 1.15);
    };
    const str = String(v).padStart(2, "0");
    digit(str[0], kx - 2.9);
    digit(str[1], kx + 2.9);
  },
};
