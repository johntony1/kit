// Nothing synced yet: a puffy cloud floating over a small stack of files, a sync arrow turning inside it.
import { SH, type Illustration, type Pen } from "../dots";

const PERIOD = 3;
// the puffs, in screen units around the cloud's centre: x, y, radius
const PUFFS: [number, number, number][] = [[-10.5, 1.5, 6], [-3, -3.5, 8.6], [6.5, -1, 7], [12.5, 2.6, 4.6]];

/** fill the cloud's outline, grown by g, shifted by (dx, dy), at raw brightness v */
function blob(p: Pen, cx: number, cy: number, g: number, v: number, dx = 0, dy = 0) {
  p.screen((c) => {
    const n = Math.round(v * 255);
    c.fillStyle = `rgb(${n},${n},${n})`;
    c.beginPath();
    for (const [x, y, r] of PUFFS) { c.moveTo(cx + x + dx + r + g, cy + y + dy); c.arc(cx + x + dx, cy + y + dy, r + g, 0, Math.PI * 2); }
    // the flat underside
    c.roundRect(cx - 15 + dx - g, cy - 1 + dy - g, 32 + g * 2, 8.5 + g * 2, 4.25 + g);
    c.fill();
  });
}

/** a sheet of paper lying flat, its top edges cut so the layers of the stack read apart */
function sheet(p: Pen, x: number, y: number, z: number, w: number, d: number, th: number, top = 0.24) {
  p.box(x, y, z, w, d, th, { top, left: 0.12, right: 0.065 });
  p.line([[x, y + d, z + th], [x + w, y + d, z + th], [x + w, y, z + th]], SH.edge, 0.55);
}

export const cloud: Illustration = {
  k: "cloud", name: "Cloud", title: "Nothing synced yet", body: "Files you sync will show up here and stay up to date on all your devices.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 18, 9, 0.12);
    // the stack of files: two sheets, then a folder with its tab, each a little askew
    p.push(); p.rotate("z", 0.1, [0, 0, 0]); sheet(p, -9, -7, 0, 18, 14, 1.6); p.pop();
    p.push(); p.rotate("z", -0.06, [0, 0, 0]); sheet(p, -8.5, -6.5, 1.6, 17, 13, 1.6); p.pop();
    p.push(); p.rotate("z", 0.04, [0, 0, 0]);
    sheet(p, -8.6, -6.6, 3.2, 17.2, 13.2, 2, 0.22);
    sheet(p, -8.6, -6.6, 5.2, 6, 4, 0.9, 0.3); // the tab
    p.line([[-5, 1.5, 5.22], [5, 1.5, 5.22]], SH.edge, 0.7);
    p.line([[-5, 3.6, 5.22], [1, 3.6, 5.22]], SH.edge, 0.7);
    p.pop();

    // the cloud, bobbing gently: a sparse rim at the bottom right, dense body, a lit crown up and left
    const bob = Math.sin(u * Math.PI * 2) * 0.8;
    const [cx, cy] = p.pt([0, 0, 28 + bob]);
    blob(p, cx, cy, 0, 0.64);
    blob(p, cx, cy, -1.1, 0.8, -0.8, -1.2);
    blob(p, cx, cy, -2.6, 1, -1.6, -2.4);
    // the sync arrows: two arcs chasing each other round, cut out of the cloud
    const sx = cx + 1.5, sy = cy, r = 4.4, a0 = u * Math.PI * 2;
    p.screen((c) => {
      c.strokeStyle = c.fillStyle = "#000"; c.lineWidth = 1.5; c.lineCap = "round";
      for (const off of [0, Math.PI]) {
        const a = a0 + off, b = a + Math.PI * 0.7;
        c.beginPath(); c.arc(sx, sy, r, a, b); c.stroke();
        // the head, at the end of the arc, pointing along it
        const hx = sx + Math.cos(b) * r, hy = sy + Math.sin(b) * r, tx = -Math.sin(b), ty = Math.cos(b);
        c.beginPath();
        c.moveTo(hx + tx * 2.4, hy + ty * 2.4);
        c.lineTo(hx - Math.cos(b) * 1.9, hy - Math.sin(b) * 1.9);
        c.lineTo(hx + Math.cos(b) * 1.9, hy + Math.sin(b) * 1.9);
        c.closePath(); c.fill();
      }
    });
  },
};
