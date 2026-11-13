// This bucket is empty: a tin pail with ribbed bands and a wire handle. Hover and drops fall in one after another while the water level rises.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R0 = 8.5, R1 = 12, HB = 18; // radius at the foot, radius at the rim, height
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const K = 0.57735;
const rAt = (z: number) => R0 + ((R1 - R0) * z) / HB;
const ring = (r: number, z: number, n = 44): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
const front = (r: number, z: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });

function wall(p: Pen, z0: number, z1: number) {
  const side = (a0: number, a1: number, f: number) => {
    const q: V3[] = [];
    for (let i = 0; i <= 20; i++) { const a = a0 + ((a1 - a0) * i) / 20; q.push([Math.cos(a) * rAt(z0), Math.sin(a) * rAt(z0), z0]); }
    for (let i = 20; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / 20; q.push([Math.cos(a) * rAt(z1), Math.sin(a) * rAt(z1), z1]); }
    p.face(q, f, 0);
  };
  side(-Math.PI / 4, Math.PI / 5, 0.075);
  side(Math.PI / 5, (Math.PI * 3) / 4, 0.2);
}

export const bucket: Illustration = {
  k: "bucket", name: "Bucket", title: "This bucket is empty", body: "Drop something in to start filling it up.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -19);
    p.shadow(0, 0, 20, 9, 0.12);
    // the wall, with two raised bands cut into it
    wall(p, 0, HB);
    for (const z of [3.5, HB - 3.5]) p.line(front(rAt(z) + 0.05, z), SH.edge, 0.8);
    // the rim, then the dark inside
    p.face(ring(R1 + 0.9, HB), 0.28, 0);
    p.face(ring(R1 - 0.5, HB + 0.02), 0.03, 0);
    // the water: a lit surface rising inside, seen only through the opening
    const lv = ease(clamp((h - 0.15) / 0.85)) * (HB - 5);
    if (lv > 0.2) {
      const open = ring(R1 - 0.5, HB).map((v) => p.pt(v)), surf = ring(rAt(lv) - 0.2, lv).map((v) => p.pt(v));
      const rip = ring((rAt(lv) - 0.2) * 0.5 * (1 + 0.15 * Math.sin(t * 5)), lv).map((v) => p.pt(v));
      p.screen((g) => {
        g.beginPath(); open.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
        g.fillStyle = "rgb(72,72,72)"; g.beginPath(); surf.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
        g.strokeStyle = "#000"; g.lineWidth = 0.8; g.beginPath(); rip.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.stroke();
      });
    }
    // the ears and the wire handle, standing over the bucket
    const ear = (u: number) => { const v: V3 = [u * K, -u * K, HB - 2.4]; p.box(v[0] - 1, v[1] - 1, v[2], 2, 2, 2.4, { top: 0.3, left: 0.24, right: 0.12, edge: 0 }); };
    ear(-(R1 + 0.4)); ear(R1 + 0.4);
    const arch = Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI, u = Math.cos(a) * (R1 + 0.4); return p.pt([u * K - Math.sin(a) * 3, -u * K - Math.sin(a) * 3, HB - 1 + Math.sin(a) * 19]); });
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 2; g.lineCap = "round"; g.beginPath(); arch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
    // drops fall in from under the handle while hovered
    if (h > 0.05) for (let i = 0; i < 3; i++) {
      const u = (t * 0.9 + i / 3) % 1, z = HB + 12 - u * 14;
      const [x, y] = p.pt([-1 + i * 1.2, 1 - i * 1.2, z]);
      const r = 1.5 * Math.min(1, h * 2);
      p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, r, 0, Math.PI); g.lineTo(x, y - r * 2.4); g.closePath(); g.fill(); });
    }
  },
};
