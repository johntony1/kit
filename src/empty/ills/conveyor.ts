// Nothing on the line: a conveyor belt seen from the side, a long belt wrapped round a big roller at each end, on short legs. Two parcels ride along it, the rollers turn and the belt's treads run, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const L = 15, RR = 5, CZ = 11, D = 7; // half length between roller centres, roller radius, axle height, half depth
const TOP = CZ + RR; // the belt's top surface

export const conveyor: Illustration = {
  k: "conveyor", name: "Conveyor", title: "Nothing on the line", body: "Orders waiting to be packed will move along here as they come in.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -14);
    p.shadow(0, 0, 24, 10, 0.12);
    p.rotate("z", -0.66); // turned so its side faces us
    // the back legs
    for (const x of [-9, 9]) p.box(x - 1.2, -D + 0.4, 0, 2.4, 2, CZ - RR + 0.5, { top: 0.2, left: 0.065, right: 0.05, edge: 0 });
    // the belt's top: a lit band, a few seams running along with it
    p.face([[-L, -D, TOP], [L, -D, TOP], [L, D, TOP], [-L, D, TOP]], 0.03, 0);
    p.face([[-L, -D, TOP], [L, -D, TOP], [L, -D + 1.4, TOP], [-L, -D + 1.4, TOP]], 0.2, 0);
    for (let i = 0; i < 3; i++) {
      const x = -L + 1 + (((i + u * 2) % 3) / 3) * (2 * L - 2);
      p.line([[x, -D + 1.6, TOP + 0.02], [x, D - 0.3, TOP + 0.02]], 1, 0.6);
    }
    // the parcels: two boxes riding along, growing in at the far end and shrinking away at the near end
    for (const i of [0, 1]) {
      const x = -L - 2 + (((i + u) % 2) / 2) * (2 * L + 4);
      const s = Math.max(0, Math.min(1, (x + L + 2) / 7, (L + 2 - x) / 7));
      if (s <= 0.02) continue;
      const w = (i ? 10 : 12) * s, hh = (i ? 9 : 11) * s, dd = (i ? 9 : 10) * s;
      p.box(x - w / 2, -dd / 2, TOP, w, dd, hh, { top: 0.3, left: 0.2, right: 0.065, edge: 0 });
      // the tape over the top and down the front
      p.line([[x - w / 2, 0, TOP + hh + 0.02], [x + w / 2, 0, TOP + hh + 0.02]], SH.edge, 0.7);
    }
    // the front: the belt's side wrapped round both rollers, dark
    const F = D + 0.02;
    const side: V3[] = [];
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI; side.push([L + Math.cos(a) * RR, F, CZ - Math.sin(a) * RR]); }
    for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + (i / 16) * Math.PI; side.push([-L + Math.cos(a) * RR, F, CZ - Math.sin(a) * RR]); }
    p.face(side, 0.065, 0);
    // the frame rail along the middle of the side, lit
    p.face([[-L, F + 0.02, CZ - 1.4], [L, F + 0.02, CZ - 1.4], [L, F + 0.02, CZ + 1.4], [-L, F + 0.02, CZ + 1.4]], 0.22, 0);
    // the rollers: big lit wheels with a dark hub and a turning spoke
    const spin = -u * Math.PI * 2;
    for (const x of [-L, L]) {
      p.ringV("y", [x, F + 0.04, CZ], RR - 0.7, 0.3, 0);
      const c = Math.cos(spin) * (RR - 1.4), s = Math.sin(spin) * (RR - 1.4);
      p.line([[x - c, F + 0.06, CZ - s], [x + c, F + 0.06, CZ + s]], SH.edge, 0.8);
      p.line([[x + s, F + 0.06, CZ - c], [x - s, F + 0.06, CZ + c]], SH.edge, 0.8);
      p.ringV("y", [x, F + 0.08, CZ], 1.1, 0.03, 0);
    }
    // the front legs
    for (const x of [-9, 9]) p.box(x - 1.2, D - 2, 0, 2.4, 2, CZ - RR + 0.5, { top: 0.2, left: 0.2, right: 0.065, edge: 0 });
  },
};
