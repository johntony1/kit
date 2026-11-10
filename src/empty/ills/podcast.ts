// No episodes: a podcast mic on a boom arm behind a round pop filter. It talks: sound rolls off, the filter trembles, the on air light blinks.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const R = 3.6; // the mic's radius

/** the front half of a vertical tube between two heights: no lid, so what sits inside it stays visible */
function band(p: Pen, r: number, z0: number, z1: number, fill: number) {
  const N = 20, at = (i: number, z: number): V3 => { const a = -Math.PI / 4 + (Math.PI * i) / N; return [Math.cos(a) * r, Math.sin(a) * r, z]; };
  const pts: V3[] = [];
  for (let i = 0; i <= N; i++) pts.push(at(i, z0));
  for (let i = N; i >= 0; i--) pts.push(at(i, z1));
  p.face(pts, fill);
}

export const podcast: Illustration = {
  k: "podcast", name: "Podcast mic", title: "No episodes yet", body: "Record your first episode and it will be ready to publish from here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const w = (Math.PI * 2) / P;
    const talk = (0.5 - 0.5 * Math.cos(t * w)) * (0.75 + 0.25 * Math.sin(t * w * 5));
    p.translate(1, -1, -16);
    p.shadow(-11, 0, 13, 6.5, 0.12);
    p.shadow(0, 2, 16, 8, 0.1);
    p.shadow(9, -8, 12, 6, 0.1);

    // ── the on air light: a little block on the desk, its lamp blinking while it talks
    const on = talk > 0.35;
    p.box(6, -10, 0, 7, 4, 4.2, { top: on ? 0.34 : 0.2, left: 0.14, right: 0.07 });
    p.line([[7, -5.95, 2.8], [12, -5.95, 2.8]], 1, 0.6);
    p.line([[7, -5.95, 1.4], [10, -5.95, 1.4]], 1, 0.6);
    if (on) p.dot([9.5, -8, 4.6], 0.9, 1);

    // ── the boom: a heavy round foot, a pole, a knuckle and an arm reaching to the mic
    p.cylinder(-11, 0, 0, 5, 1.6, { top: 0.22, side: 0.12 });
    p.cylinder(-11, 0, 1.6, 0.9, 13, { top: 0.2, side: 0.2 });
    p.cylinder(-11, 0, 13.4, 1.7, 2.4, { top: 0.22, side: 0.12 });
    p.box(-10, -0.8, 14, 9, 1.6, 1.4, { top: 0.22, left: 0.14, right: 0.08 });

    // ── the mic: a solid lower body, a grille above it and a round top
    p.cylinder(0, 0, 5, R - 0.8, 1.2, { top: 0.2, side: 0.12 });
    p.cylinder(0, 0, 6, R, 7, { top: 0.2, side: 0.13 });
    p.cylinder(0, 0, 13, R, 9, { top: 0.2, side: 0.18, edge: 0 });
    for (let i = 0; i < 7; i++) {
      const z0 = (i / 7) * R, z1 = ((i + 1) / 7) * R;
      p.cylinder(0, 0, 22 + z0, Math.sqrt(R * R - z0 * z0), z1 - z0 + 0.01, { top: 0.22, side: 0.18, edge: 0 });
    }
    // grille rings cut round the front
    for (let i = 0; i < 7; i++) {
      const z = 14 + i * 1.35;
      p.line(Array.from({ length: 13 }, (_, j) => { const a = -Math.PI / 4 + (Math.PI * j) / 12; return [Math.cos(a) * R, Math.sin(a) * R, z] as V3; }), 1, 0.55);
    }
    // the shock mount: two loose bands round the body, held by the arm
    band(p, R + 0.9, 8.4, 9.6, 0.24);
    band(p, R + 0.9, 18.4, 19.6, 0.24);
    const [hx, hy] = p.pt([0, 0, 21]);

    // ── the pop filter: a round frame on a gooseneck, its mesh cut across whatever is behind it
    const wob = 0.25 * talk * Math.sin(t * w * 6);
    const fc: V3 = [1.5, 7.5 + wob, 16.5], fr = 5.4;
    // the gooseneck: a chain of beads from the arm to the frame
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      const a: V3 = [-6 + (fc[0] - fr - (-6)) * u, 0 + (fc[1] - 0) * u, 15.2 + Math.sin(u * Math.PI) * 4 + (fc[2] - 15.2) * u];
      p.dot(a, 0.55, 0.22);
    }
    const ring = (r: number, k: number) => { const a = (k / 40) * Math.PI * 2; return [fc[0] + Math.cos(a) * r, fc[1], fc[2] + Math.sin(a) * r] as V3; };
    // in the dot styles the mesh is a dense screen; in the line style it stays see through
    if (!p.ink) p.face(Array.from({ length: 40 }, (_, k) => ring(fr, k)), 0.1, 0);
    for (let k = 0; k < 40; k++) p.face([ring(fr, k), ring(fr, k + 1), ring(fr + 1.6, k + 1), ring(fr + 1.6, k)], k > 5 && k < 25 ? 0.26 : 0.18, 0);
    if (p.ink) { p.line(Array.from({ length: 41 }, (_, k) => ring(fr + 1.6, k))); p.line(Array.from({ length: 41 }, (_, k) => ring(fr, k))); }
    for (let i = -3; i <= 3; i++) {
      const d = i * 1.5, half = Math.sqrt(Math.max(0, (fr - 0.3) ** 2 - d * d));
      p.line([[fc[0] + d, fc[1] + 0.05, fc[2] - half], [fc[0] + d, fc[1] + 0.05, fc[2] + half]], 1, 0.55);
      p.line([[fc[0] - half, fc[1] + 0.05, fc[2] + d], [fc[0] + half, fc[1] + 0.05, fc[2] + d]], 1, 0.55);
    }
    p.guide([[fc[0], fc[1], fc[2] - fr - 1.6], [fc[0], fc[1], 0]]);
    p.guide(Array.from({ length: 41 }, (_, k) => { const a = (k / 40) * Math.PI * 2; return [fc[0] + Math.cos(a) * 3, fc[1] + Math.sin(a) * 3, 0] as V3; }));

    // sound rolling off the head
    if (talk > 0.06) p.screen((g) => {
      g.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const a = talk * (1 - i * 0.26) * (0.8 + 0.2 * Math.sin(t * w * 3 - i));
        if (a < 0.12) continue;
        const n = Math.round(255 * Math.min(1, a));
        g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 0.9;
        g.beginPath(); g.arc(hx, hy, 7 + i * 3, -0.75, 0.15); g.stroke();
      }
    });
  },
};
