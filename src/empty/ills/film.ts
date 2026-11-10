// No clips: a film reel turning, unspooling a strip of empty frames along the floor.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop
const R = 12, CX = -9, CZ = 14; // reel radius and centre
const YF = -1.4, YB = -4.6; // front and back faces of the reel
const FS = (R * Math.PI * 2) / 5 / 3; // frame spacing: three frames go by while the reel turns one hole

export const film: Illustration = {
  k: "film", name: "Film reel", title: "No clips", body: "Import footage and your clips will line up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(-3, -1, -12.5);
    p.shadow(4, 0, 30, 12, 0.12);
    const u = (t % P) / P;

    // the strip on the floor, running out from under the reel
    const y0 = -7, y1 = 1.2, z = 0.25, x0 = CX, x1 = 25;
    p.face([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], 0.24, SH.edge, 0.55);
    p.face([[x1, y0, z], [x1, y1, z], [x1, y1, z - 0.25], [x1, y0, z - 0.25]], 0.1, 0);
    const off = u * FS;
    // sprocket holes along both edges
    const hs = FS / 2;
    for (let x = x0 + ((off % hs) + hs) % hs; x < x1 - 1.4; x += hs) {
      for (const yy of [y0 + 0.7, y1 - 2]) p.face([[x, yy, z + 0.02], [x + 1.4, yy, z + 0.02], [x + 1.4, yy + 1.3, z + 0.02], [x, yy + 1.3, z + 0.02]], 0.01, 0);
    }
    // empty frames between them
    for (let x = x0 + off - FS; x < x1; x += FS) {
      const a = Math.max(x0 + 0.6, x + 0.6), b = Math.min(x1 - 0.8, x + FS - 0.6);
      if (b - a < 0.4) continue;
      p.face([[a, y0 + 2.7, z + 0.02], [b, y0 + 2.7, z + 0.02], [b, y1 - 2.7, z + 0.02], [a, y1 - 2.7, z + 0.02]], 0.01, 0);
    }

    // the reel: a rim shaded round, then the front flange with its holes turning
    const N = 30;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, m = (a0 + a1) / 2;
      if (Math.cos(m) + Math.sin(m) < -0.1) continue;
      const at = (a: number, y: number): V3 => [CX + Math.cos(a) * R, y, CZ + Math.sin(a) * R];
      const f = Math.sin(m) > 0.35 ? 0.24 : Math.sin(m) > -0.35 ? 0.12 : 0.065;
      p.face([at(a0, YB), at(a1, YB), at(a1, YF), at(a0, YF)], f, 0);
    }
    p.ringV("y", [CX, YF, CZ], R, 0.2, SH.edge, 0.6);
    p.ringV("y", [CX, YF + 0.02, CZ], R - 1.4, 0, SH.edge, 0.5);
    const spin = -u * ((Math.PI * 2) / 5);
    for (let i = 0; i < 5; i++) {
      const a = spin + (i / 5) * Math.PI * 2 + 0.3;
      p.ringV("y", [CX + Math.cos(a) * 6.2, YF + 0.03, CZ + Math.sin(a) * 6.2], 2.7, 0.01, SH.edge, 0.5);
    }
    // the hub
    p.ringV("y", [CX, YF + 0.04, CZ], 2.4, 0.4, SH.edge, 0.5);
    p.ringV("y", [CX, YF + 0.06, CZ], 0.9, 0.02, 0);
    // the strip leaving the bottom of the reel
    p.face([[CX - 1, y0, z + 0.02], [CX + 3, y0, z + 0.02], [CX + 3, y1, z + 0.02], [CX - 1, y1, z + 0.02]], 0.24, 0);
  },
};
