// No locked files: a page standing up with a padlock in front of it, open. Hover and the shackle drops down and snaps shut, the lock giving a little hop.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 12, ZT = 32, F = 8, T = 2; // half width, height, folded corner, thickness

function page(p: Pen, front: number) {
  p.face([[X, -T, 0], [X, 0, 0], [X, 0, ZT - F], [X, -T, ZT - F]], SH.right, SH.edge, 0.5);
  p.face([[X - F, -T, ZT], [X - F, 0, ZT], [X, 0, ZT - F], [X, -T, ZT - F]], 0.12, SH.edge, 0.5);
  p.face([[-X, -T, ZT], [X - F, -T, ZT], [X - F, 0, ZT], [-X, 0, ZT]], 0.26, SH.edge, 0.5);
  p.face([[-X, 0, 0], [X, 0, 0], [X, 0, ZT - F], [X - F, 0, ZT], [-X, 0, ZT]], front, SH.edge, 0.6);
  p.face([[X - F, 0.08, ZT], [X, 0.08, ZT - F], [X - F, 0.08, ZT - F]], 0.12, SH.edge, 0.6);
}

// a dark halo around a set of points on screen, so a thing in front reads apart from what is behind it
function halo(p: Pen, pts: V3[], w: number) {
  if (p.ink) return;
  const q = pts.map((v) => p.pt(v)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: number[][] = [], hi: number[][] = [];
  for (const v of q) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], v) <= 0) lo.pop(); lo.push(v); }
  for (const v of q.slice().reverse()) { while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], v) <= 0) hi.pop(); hi.push(v); }
  const hull = lo.slice(0, -1).concat(hi.slice(0, -1));
  p.screen((c) => {
    c.beginPath(); hull.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
    c.fillStyle = "#000"; c.fill(); c.strokeStyle = "#000"; c.lineWidth = w; c.lineJoin = "round"; c.stroke();
  });
}

// a U shaped shackle in the x-z plane at depth y: outer radius r, bar width w, legs down to z = 0
function shackle(p: Pen, y: number, r: number, w: number, leg: number, fill: number) {
  const pts: V3[] = [];
  for (let i = 0; i <= 16; i++) { const a = Math.PI - (i / 16) * Math.PI; pts.push([Math.cos(a) * r, y, leg + Math.sin(a) * r]); }
  pts.push([r, y, 0], [r - w, y, 0]);
  for (let i = 16; i >= 0; i--) { const a = Math.PI - (i / 16) * Math.PI; pts.push([Math.cos(a) * (r - w), y, leg + Math.sin(a) * (r - w)]); }
  pts.push([-r + w, y, 0], [-r, y, 0]);
  p.face(pts, fill, SH.edge, 0.6);
}

export const filelock: Illustration = {
  k: "filelock", name: "Locked file", title: "No locked files", body: "Lock a file to keep it safe from changes. Locked files will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 2, 24, 10, 0.11);
    p.rotate("z", -0.5);
    p.push();
    p.translate(-5, -3, 2);
    page(p, 0.2);
    for (let i = 0; i < 4; i++) p.line([[-X + 3, 0.06, ZT - 5 - i * 3.4], [X - (i % 2 ? 9 : 4), 0.06, ZT - 5 - i * 3.4]], SH.edge, 0.85);
    p.pop();
    // the padlock, standing in front of the page's lower right
    const k = Math.min(1, h * 1.4);
    const drop = k < 0.6 ? 0 : (k - 0.6) / 0.4;
    const hop = h > 0.6 ? Math.sin(Math.min(1, (h - 0.6) / 0.4) * Math.PI) * 1.5 : 0;
    p.push();
    p.translate(7, 5, hop);
    const BW = 9, BH = 12, BD = 2.8;
    const lift = 4 * (1 - drop), turn = 0.6 * (1 - Math.min(1, k / 0.6));
    const R = BW - 2.2, top = BH - 1 + lift + 3 + R;
    halo(p, [[-BW, -BD, 0], [BW, -BD, 0], [BW, BD, 0], [-BW, BD, 0], [-BW, BD, BH], [BW, BD, BH], [BW, -BD, BH], [-BW, -BD, BH], [-R, 0, top], [R, 0, top]], 2.4);
    // the shackle: lifted and turned open at rest, swinging back and dropping shut on hover
    p.push();
    p.translate(0, 0, BH - 1 + lift);
    p.rotate("z", turn, [-BW + 2.2, 0, 0]);
    for (let y = -0.8; y <= 0.81; y += 0.4) shackle(p, y, BW - 2.2, 1.9, 3, y > 0.7 ? 0.3 : 0.08);
    p.pop();
    p.box(-BW, -BD, 0, BW * 2, BD * 2, BH, { top: 0.3, left: 0.24, right: 0.08, lw: 0.6 });
    // the keyhole
    const y = BD + 0.05;
    p.clear(Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return [Math.cos(a) * 1.5, y, 6.6 + Math.sin(a) * 1.5] as V3; }));
    p.clear([[-0.7, y, 2.6], [0.7, y, 2.6], [0.7, y, 6.6], [-0.7, y, 6.6]]);
    p.pop();
  },
};
