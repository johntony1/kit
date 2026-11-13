// No soups yet: a soup pot with two handles, a ladle standing in it. The ladle stirs round and round, the soup swirls and steam curls up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const R = 13, H = 13; // pot radius and height
const ring = (r: number, z: number, n = 40): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
/** a bright mark drawn flat to the screen */
function stroke(p: Pen, pts: V3[], lw: number, shade = 1) {
  const q = pts.map((v) => p.pt(v)), n = Math.round(255 * Math.max(0, Math.min(1, shade)));
  p.screen((c) => {
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

export const soup: Illustration = {
  k: "soup", name: "Soup", title: "No soups yet", body: "Add a soup to the menu and it will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, a = u * Math.PI * 2;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 28, 13, 0.1);
    // the handles, either side, then the pot over them
    for (const s of [-1, 1]) {
      const c = s * Math.SQRT1_2 * (R + 1.6);
      p.box(c - 2.2, -c - 2.2, H - 4, 4.4, 4.4, 1.8, { top: 0.24, left: 0.12, right: 0.065, edge: 0 });
    }
    p.cylinder(0, 0, 0, R, H, { side: 0.14, top: 0.3, edge: 0 });
    p.line(front(R, H - 2.4), SH.edge, 0.8);
    p.line(front(R, 1.4), SH.edge, 0.6);
    // the mouth: a bright rim, the dark inside, the soup a little below the rim
    p.disc(0, 0, H + 0.02, R - 1.3, 0.02, 0);
    const mouth = ring(R - 1.3, H + 0.02).map((v) => p.pt(v));
    p.screen((c) => {
      c.beginPath(); mouth.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      p.disc(0, 0, H - 2, R - 1.3, 0.2, 0);
      // a swirl and bits of vegetable turning with the ladle
      p.line(Array.from({ length: 22 }, (_, i) => { const b = a + (i / 21) * 4.4, r = 2 + (i / 21) * 7; return [Math.cos(b) * r, Math.sin(b) * r, H - 1.95] as V3; }), SH.edge, 0.8);
      for (let i = 0; i < 6; i++) { const b = a * 0.8 + i * 1.05, r = 4 + (i % 3) * 2.2; p.dot([Math.cos(b) * r, Math.sin(b) * r, H - 1.9], 0.9, i % 2 ? 1 : 0.5); }
    });
    // the ladle: its handle a bright bar leaning out over the rim, going round
    const b = a + Math.PI * 0.75, cb = Math.cos(b), sb = Math.sin(b);
    const foot: V3 = [cb * 5, sb * 5, H - 2], top: V3 = [cb * 15, sb * 15, H + 12];
    stroke(p, [foot, top], 2);
    stroke(p, [top, [cb * 16.2, sb * 16.2, H + 10.4]], 2);
    // steam: three wisps rising, each brightest mid climb
    for (let i = 0; i < 3; i++) {
      const o = (i - 1) * 5, q = (u + i / 3) % 1;
      const pts: V3[] = Array.from({ length: 7 }, (_, j) => { const z = H + 4 + q * 6 + j * 1.3; return [o * 0.707 + Math.sin(z * 0.6 - a) * 0.9, -o * 0.707 - Math.sin(z * 0.6 - a) * 0.9, z] as V3; });
      stroke(p, pts, 1.1, Math.sin(q * Math.PI) * 0.85);
    }
  },
};
