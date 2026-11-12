// No weight entered: a bathroom scale with a dial and two foot pads. Hover and the pads light up, the platform dips and the needle swings round and settles.
import { SH, type Illustration, type V3 } from "../dots";

const S = 15, T = 3.2; // half side, platform thickness
const DX = -8.4, DR = 5.6; // the dial: its centre along x, its radius
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export const weight: Illustration = {
  k: "weight", name: "Scale", title: "No weight entered", body: "Step on the scale or type in a number, and your weight will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = clamp(h * 1.1);
    const lit = ease(clamp(k / 0.35));
    p.translate(1, 0, -2);
    p.shadow(0, 0, 34, 17, 0.11);
    // a dark foot under the platform, which dips when stepped on
    p.box(-S + 1.5, -S + 1.5, 0, 2 * S - 3, 2 * S - 3, 2.4, { top: 0.05, left: 0.05, right: 0.035, edge: 0 });
    const z0 = 2.4 - 1.1 * lit, z = z0 + T + 0.03;
    p.box(-S, -S, z0, 2 * S, 2 * S, T, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    // two foot pads with grip lines
    for (const cy of [-6.2, 6.2]) {
      const pad: V3[] = Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [4.4 + Math.cos(a) * 7.6, cy + Math.sin(a) * 3.5, z] as V3; });
      p.face(pad, 0.06 + 0.4 * lit, SH.edge, 0.5);
      for (let i = -2; i <= 2; i++) {
        const x = 4.4 + i * 2.6, w = 3.5 * Math.sqrt(1 - Math.pow((i * 2.6) / 7.6, 2)) - 0.7;
        p.line([[x, cy - w, z + 0.01], [x, cy + w, z + 0.01]], 0.5 + 0.5 * lit, 0.45);
      }
    }
    // the dial: a dark window, ticks round its far side, a needle
    p.disc(DX, 0, z, DR, 0.03, SH.edge);
    for (let i = -3; i <= 3; i++) {
      const a = Math.PI + i * 0.42;
      p.dot([DX + Math.cos(a) * (DR - 1), Math.sin(a) * (DR - 1), z + 0.01], 0.4, 0.75);
    }
    const s = clamp((k - 0.18) / 0.82);
    const a0 = Math.PI - 1.26, a1 = Math.PI + 0.55;
    const a = a1 + (a0 - a1) * Math.exp(-4.6 * s) * Math.cos(7.5 * s);
    const c = Math.cos(a), sn = Math.sin(a), L = DR - 0.9;
    p.face([[DX - sn * 0.9, c * 0.9, z + 0.02], [DX + c * L, sn * L, z + 0.02], [DX + sn * 0.9, -c * 0.9, z + 0.02]], 0.36, SH.edge, 0.45);
    p.dot([DX, 0, z + 0.02], 1.1, 1);
  },
};
