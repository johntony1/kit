// No data: three stacked database disks. A drawer slides out of the middle one, empty, and slides back in.
import { pulse, SH, type Illustration, type V3 } from "../dots";

const PERIOD = 4.2, R = 12.5, H = 7, GAP = 1.6;

/** a vertical cylinder whose side is lit on the +y half and in shade on the +x half */
function disk(p: Parameters<Illustration["draw"]>[0], z: number, top = SH.top) {
  const N = 48;
  const ring = (zz: number, a0: number, a1: number) => Array.from({ length: N / 4 + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / (N / 4);
    return [Math.cos(a) * R, Math.sin(a) * R, zz] as V3;
  });
  const side = (a0: number, a1: number, fill: number) => p.face([...ring(z, a0, a1), ...ring(z + H, a0, a1).reverse()], fill, 0);
  side(-Math.PI / 4, Math.PI / 4, SH.right);
  side(Math.PI / 4, (3 * Math.PI) / 4, SH.left);
  p.disc(0, 0, z + H, R, top);
  // a band cut round the side, like the seam on a drive
  const band: V3[] = Array.from({ length: 25 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 24; return [Math.cos(a) * R, Math.sin(a) * R, z + 1.6]; });
  p.line(band, SH.edge, 0.55);
  // a status light on the lit half
  p.dot([Math.cos(2.3) * R + 0.2, Math.sin(2.3) * R + 0.2, z + 4.3], 0.8, 1);
}

export const database: Illustration = {
  k: "database", name: "Database", title: "No data", body: "There is nothing stored here yet. Data will show up once it is added.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const s = pulse(t, PERIOD, 0.5) * 9; // how far the drawer is out
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 13, 0.12);
    const zs = [0, H + GAP, 2 * (H + GAP)];
    disk(p, zs[0]);
    disk(p, zs[1]);
    // the drawer, in the middle disk: a flat front at the +y side
    const z0 = zs[1] + 1.2, z1 = zs[1] + H - 1.2, X = 4.6, YF = Math.sqrt(R * R - X * X); // where the front meets the side
    // the slot it leaves
    p.face([[-X, YF, z0], [X, YF, z0], [X, YF, z1], [-X, YF, z1]], s > 0.4 ? 0.01 : 0.14, 0);
    disk(p, zs[2]);
    // the tray: only the part out of the disk shows
    if (s > 0.5) {
      p.box(-X + 0.4, YF, z0 + 0.4, 2 * X - 0.8, s, z1 - z0 - 0.8, { open: true, left: 0.2, right: 0.1 });
    }
    p.push(); p.translate(0, s, 0);
    p.face([[-X - 0.5, YF + 0.6, z0 - 0.3], [X + 0.5, YF + 0.6, z0 - 0.3], [X + 0.5, YF + 0.6, z1 + 0.3], [-X - 0.5, YF + 0.6, z1 + 0.3]], 0.26, 0);
    // the drawer's handle: a slot cut into its lit front
    p.line([[-2, YF + 0.65, (z0 + z1) / 2], [2, YF + 0.65, (z0 + z1) / 2]], SH.edge, 0.9);
    p.pop();
    // dust lifting out of the empty drawer
    const k = s / 9;
    if (k > 0.6) for (let i = 0; i < 3; i++) {
      const u = (t * 0.6 + i / 3) % 1;
      p.dot([-2 + i * 2, YF + s * 0.55, z1 + u * 8], 0.55, (k - 0.6) * 2.5 * (1 - u));
    }
  },
};
