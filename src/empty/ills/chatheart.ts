// No liked messages: a thick speech bubble with an empty heart cut into its face. Hover and a bright heart swells inside it and beats.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 34, H = 26, R = 9, Y0 = -4;

function bubble(): [number, number][] {
  const pts: [number, number][] = [[W - R - 9, 0], [W, -7], [W - R, 0]];
  const corner = (cx: number, cz: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (Math.PI / 2) * (i / 6); pts.push([cx + Math.cos(a) * R, cz + Math.sin(a) * R]); } };
  corner(W - R, H - R, 0); corner(R, H - R, Math.PI / 2); corner(R, R, Math.PI); corner(W - R, R, -Math.PI / 2);
  return pts.map(([u, v]) => [u - W / 2, v - H / 2]);
}

// a heart in the x-z plane, about 1 unit tall per s
const heart = (s: number, cz: number): [number, number][] => Array.from({ length: 40 }, (_, i) => {
  const a = (i / 40) * Math.PI * 2;
  const x = 16 * Math.pow(Math.sin(a), 3), z = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
  return [x * s, cz + z * s];
});

function slab(p: Pen, shape: [number, number][], y0: number, y1: number, front: number) {
  const at = (y: number) => shape.map(([u, v]) => [u, y, v] as V3);
  p.face(at(y0), SH.right, SH.edge, 0.55);
  for (let y = y0 + 0.4; y < y1; y += 0.4) p.face(at(y), 0.08, 0);
  p.face(at(y1), front, SH.edge, 0.65);
}

export const chatheart: Illustration = {
  k: "chatheart", name: "Liked message", title: "No liked messages", body: "Tap the heart on any message to like it. Your liked messages gather here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.push(); p.translate(0, 0, -19); p.shadow(0, 1, 26, 8, 0.1); p.pop();
    p.rotate("z", -0.55);
    p.translate(0, 0, -1);
    slab(p, bubble(), Y0, 0, 0.22);
    // the heart: an empty dark heart at rest; on hover a bright heart swells inside it and beats
    p.clear(heart(0.5, 0.2).map(([u, v]) => [u, 0.06, v] as V3));
    const k = Math.min(1, h * 1.25);
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const beat = h > 0.85 ? 1 + 0.05 * Math.max(0, Math.sin(t * 6)) : 1;
    const s = 0.36 * back(k) * beat;
    if (s > 0.02) slab(p, heart(s, 0.2 + (0.5 - s) * 1.6), 0.1, 1.2, 0.3);
  },
};
