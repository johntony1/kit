// Nothing dug up yet: a spade standing in a mound of soil, a pointed blade, a long shaft and a D grip. Hover and it pulls up out of the mound with a scoop of soil on its blade.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];

export const shovel: Illustration = {
  k: "shovel", name: "Shovel", title: "Nothing dug up yet", body: "Start your first dig and what you find will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = easeInOut(h);
    p.translate(0, 0, -26);
    p.shadow(0, 0, 22, 10, 0.12);
    // the mound: three stacked rounds, lit tops
    p.cylinder(0, 0, 0, 13, 2.2, { side: 0.12, top: 0.2, edge: 0 });
    p.cylinder(0, 0, 2.2, 9, 2, { side: 0.12, top: 0.2, edge: 0 });
    p.cylinder(0, 0, 4.2, 5, 1.4, { side: 0.12, top: 0.2, edge: 0 });
    const g0 = 5.6; // the soil line at the blade
    // the spade: rises out of the mound and straightens up
    const lift = 6 * e + h * Math.sin(t * 3) * 0.3, tilt = 0.1 - 0.16 * e;
    const at = ([u, v]: P2): V3 => { const c = Math.cos(tilt), s = Math.sin(tilt), y = v + lift - g0; return B([u * c - y * s, g0 + u * s + y * c]); };
    p.screen((g) => {
      // only what is above the soil shows
      const [, ys] = p.pt(B([0, g0]));
      g.beginPath(); g.rect(-1e4, -1e4, 2e4, 1e4 + ys); g.clip();
      // the blade: a pointed spade, lit, its right half in shade
      const blade: P2[] = [[-8, 22], [8, 22], [8.2, 10], [5, 4.6], [0, 2], [-5, 4.6], [-8.2, 10]];
      p.face(blade.map(at), 0.24, 0);
      p.face(([[0, 22], [8, 22], [8.2, 10], [5, 4.6], [0, 2]] as P2[]).map(at), 0.065, 0);
      p.line([...blade, blade[0]].map(at), SH.edge, 0.65);
      // a scoop of soil on the blade once it is out
      if (e > 0.25) {
        const k = Math.min(1, (e - 0.25) / 0.5);
        const lump: P2[] = Array.from({ length: 21 }, (_, i) => { const a = (i / 20) * Math.PI; return [Math.cos(a) * 7.4, 21.4 + Math.sin(a) * 5 * k * (1 + 0.15 * Math.sin(a * 5))]; });
        p.face(lump.map(at), 0.12, SH.edge, 0.65);
      }
      // the socket and the shaft
      p.face(([[-2.8, 21.6], [2.8, 21.6], [1.8, 26], [-1.8, 26]] as P2[]).map(at), 0.2, SH.edge, 0.55);
      p.face(([[-1.8, 26], [1.8, 26], [1.8, 42], [-1.8, 42]] as P2[]).map(at), 0.26, 0);
      p.face(([[0.4, 26], [1.8, 26], [1.8, 42], [0.4, 42]] as P2[]).map(at), 0.1, 0);
      // the D grip: a rounded bar over a dark hole
      const grip: P2[] = [[-2.2, 41], [2.2, 41], [6.4, 45], [6.4, 49.6], [-6.4, 49.6], [-6.4, 45]];
      p.face(grip.map(at), 0.26, 0);
      p.clear(([[-3.8, 45.2], [3.8, 45.2], [3.8, 47.6], [-3.8, 47.6]] as P2[]).map(at));
      p.line([...grip, grip[0]].map(at), SH.edge, 0.6);
    });
    // the slit where the blade goes in
    p.line([B([-8.6, g0]), B([8.6, g0])], SH.edge, 0.9);
  },
};
