// No members: letter tokens around an empty slot. Hover and a new token rises out of the slot, with a plus on it.
import { SH, type Illustration, type Pen } from "../dots";

const R = 3.3, TH = 2.4; // a token's radius and thickness
// strokes for a few letters, in a 2 by 2 box (u right, v down)
const GLYPH: Record<string, [number, number][][]> = {
  A: [[[-0.8, 1], [0, -1], [0.8, 1]], [[-0.45, 0.25], [0.45, 0.25]]],
  K: [[[-0.7, -1], [-0.7, 1]], [[0.7, -1], [-0.7, 0.1]], [[-0.25, -0.3], [0.75, 1]]],
  N: [[[-0.7, 1], [-0.7, -1], [0.7, 1], [0.7, -1]]],
  M: [[[-0.8, 1], [-0.8, -1], [0, 0.3], [0.8, -1], [0.8, 1]]],
};
// a letter lying on a token's top: reading across the screen, upright on screen
function letter(p: Pen, ch: string, cx: number, cy: number, z: number, s: number) {
  const k = s * 0.95;
  for (const st of GLYPH[ch]) p.line(st.map(([u, v]) => [cx + (u + v) * k, cy + (v - u) * k, z] as [number, number, number]), SH.edge, 0.85);
}
function token(p: Pen, x: number, y: number, z: number, h: number, top: number) {
  p.cylinder(x, y, z, R, h, { side: p.ink ? 0.12 : 0.065, top });
}

export const members: Illustration = {
  k: "members", name: "Member tokens", title: "No members yet", body: "Invite people to your workspace and they will join the circle here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -7);
    p.shadow(0, 0, 30, 14, 0.12);
    const W = 12.5;
    p.box(-W, -W, 0, W * 2, W * 2, 2.4, { top: p.ink ? 0.2 : 0.12, left: 0.12, right: 0.065 });
    if (!p.ink) p.line([[-W, W, 2.4], [W, W, 2.4], [W, -W, 2.4]], SH.edge, 0.6);
    const Z = 2.42;
    const ring: [number, number, string][] = [[-8, 0, "A"], [0, -8, "K"], [8, 0, "N"], [0, 8, "M"]];
    const draw = (x: number, y: number, ch: string) => { token(p, x, y, Z, TH, 0.22); letter(p, ch, x, y, Z + TH + 0.02, 1.25); };
    // the two tokens at the back
    draw(...ring[0]); draw(...ring[1]);
    // the slot
    p.disc(0, 0, Z, R + 0.6, 0.03, 0);
    if (p.ink && h < 0.5) p.guide(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * (R + 1.4), Math.sin(a) * (R + 1.4), Z] as [number, number, number]; }), true);
    // the new token: rests sunk in the slot, rises and bobs while hovered
    const lift = h * (9 + Math.sin(t * 2.6) * 0.8);
    const zb = Z - TH + 0.1 + lift;
    const base = Math.max(Z, zb), hh = zb + TH - base;
    if (lift > 1) {
      // dashed drops from its sides to the slot
      const s = Math.SQRT1_2 * R;
      p.guide([[-s, s, Z], [-s, s, base]], true);
      p.guide([[s, -s, Z], [s, -s, base]], true);
    }
    if (hh > 0.05) token(p, 0, 0, base, hh, 0.34);
    const zt = zb + TH + 0.02;
    p.line([[-1.4, 1.4, zt], [1.4, -1.4, zt]], SH.edge, 0.9);
    p.line([[-1.4, -1.4, zt], [1.4, 1.4, zt]], SH.edge, 0.9);
    if (!p.ink && hh > 0.05) p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * R, Math.sin(a) * R, zt] as [number, number, number]; }), SH.edge, 0.5);
    // the two tokens at the front
    draw(...ring[2]); draw(...ring[3]);
    // a little sparkle once it is up
    if (h > 0.7) for (let i = 0; i < 4; i++) {
      const a = i * 1.57 + t * 1.2;
      p.dot([Math.cos(a) * 5.4, Math.sin(a) * 5.4, zt + 1.5 + Math.sin(t * 3 + i) * 0.8], 0.7, 1);
    }
  },
};
