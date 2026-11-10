// Nothing saved yet: a treasure chest with a keyhole. Hover and the lid swings open on an empty inside; two coins roll out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 11.5, R = 8, Z = 11; // half width (x), half depth (y) and lid radius, height of the body
const arc = (x: number, a: number): V3 => [x, Math.cos(a) * R, Z + Math.sin(a) * R];
/** screen winding: > 0 when an outward, counter clockwise face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};
/** a coin standing on its edge, facing +y */
const coin = (p: Pen, c: V3) => {
  p.ringV("y", [c[0] + 0.35, c[1] - 0.8, c[2]], 3.4, 0.12, 0); // the coin's rim, behind its face
  p.ringV("y", c, 3.4, 1, 0);
  p.line([[c[0], c[1] + 0.04, c[2] - 1.3], [c[0], c[1] + 0.04, c[2] + 1.3]], SH.edge, 0.8);
};

export const chest: Illustration = {
  k: "chest", name: "Treasure chest", title: "Nothing saved yet", body: "Save the things you love and they will be waiting for you here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, -1, -11);
    p.scale(0.9, [0, 0, 10]);
    p.shadow(0, 2, 28, 13, 0.12);
    const k = Math.min(1, h * 1.35); // the lid leads, the coins follow
    // the body, open at the top, with a lit band along its front
    p.box(-X, -R, 0, X * 2, R * 2, Z, { open: true, left: 0.12, right: 0.065 });
    p.face([[-X, R + 0.02, Z - 2.4], [X, R + 0.02, Z - 2.4], [X, R + 0.02, Z], [-X, R + 0.02, Z]], 0.3, 0);
    p.face([[-X, R + 0.02, 0], [X, R + 0.02, 0], [X, R + 0.02, 1.8], [-X, R + 0.02, 1.8]], 0.3, 0);
    p.line([[-X, R + 0.05, Z - 2.4], [X, R + 0.05, Z - 2.4]], SH.edge, 0.55);
    p.line([[-X, R + 0.05, 1.8], [X, R + 0.05, 1.8]], SH.edge, 0.55);
    // iron straps down the front and the end
    for (const x of [-X + 4, X - 4]) {
      p.face([[x - 1.2, R + 0.04, 0], [x + 1.2, R + 0.04, 0], [x + 1.2, R + 0.04, Z], [x - 1.2, R + 0.04, Z]], 0.3, 0);
      p.line([[x - 1.2, R + 0.06, 1.8], [x - 1.2, R + 0.06, Z - 2.4]], SH.edge, 0.55);
      p.line([[x + 1.2, R + 0.06, 1.8], [x + 1.2, R + 0.06, Z - 2.4]], SH.edge, 0.55);
    }
    p.line([[X + 0.04, -R + 1, Z - 2.4], [X + 0.04, R - 0.3, Z - 2.4]], SH.edge, 0.55);
    // the lock plate and its keyhole
    const ly = R + 0.08;
    p.face([[-2.6, ly, Z - 6.5], [2.6, ly, Z - 6.5], [2.6, ly, Z + 0.6], [-2.6, ly, Z + 0.6]], 0.3, 0);
    p.line([[0, ly + 0.02, Z - 2.6], [0, ly + 0.02, Z - 2.6]], SH.edge, 1.7);
    p.line([[0, ly + 0.02, Z - 3], [0, ly + 0.02, Z - 5]], SH.edge, 0.9);

    // the lid: a half round, hinged on the back top edge, swinging up and back
    const open = k * 1.5;
    p.push();
    p.rotate("x", open, [0, -R, Z]);
    const N = 14;
    for (let i = N - 1; i >= 0; i--) {
      const a0 = (Math.PI * i) / N, a1 = (Math.PI * (i + 1)) / N, m = (a0 + a1) / 2 + open;
      if (Math.cos(m) + Math.sin(m) < -0.15) continue;
      const strip = [arc(-X, a0), arc(X, a0), arc(X, a1), arc(-X, a1)];
      p.face(strip, 0.07 + 0.15 * Math.max(0, Math.sin(m)) + 0.05 * Math.max(0, Math.cos(m)), 0);
    }
    // straps over the lid, cut in as lines
    for (const x of [-X + 2.8, -X + 5.2, X - 5.2, X - 2.8]) p.line(Array.from({ length: 13 }, (_, i) => arc(x, (Math.PI * i) / 12)).filter((_, i) => Math.cos((Math.PI * i) / 12 + open) + Math.sin((Math.PI * i) / 12 + open) > -0.1), SH.edge, 0.55);
    // the lid's end, a half disc toward +x
    const end: V3[] = Array.from({ length: 15 }, (_, i) => arc(X, (Math.PI * i) / 14));
    if (facing(p, end.slice().reverse()) > 0 || facing(p, end) > 0) p.face(end, 0.065, 0);
    // the underside: the dark inside of the lid, once it faces us
    const under: V3[] = [[-X, R, Z], [X, R, Z], [X, -R, Z], [-X, -R, Z]];
    if (facing(p, under) > 0) {
      p.face(under, 0.06, 0);
      p.line([[-X + 0.6, R - 0.6, Z], [X - 0.6, R - 0.6, Z], [X - 0.6, -R + 0.6, Z], [-X + 0.6, -R + 0.6, Z], [-X + 0.6, R - 0.6, Z]], SH.edge, 0.6);
    } else {
      // the latch hanging over the lock plate
      p.face([[-1.4, R + 0.1, Z - 1.4], [1.4, R + 0.1, Z - 1.4], [1.4, R + 0.1, Z + 1.6], [-1.4, R + 0.1, Z + 1.6]], 0.3, 0);
      p.line([[-1.4, R + 0.14, Z - 1.4], [1.4, R + 0.14, Z - 1.4]], SH.edge, 0.5);
    }
    p.pop();
    // the seam where the lid meets the body
    if (open < 0.25) p.line([[-X, R + 0.1, Z], [X, R + 0.1, Z], [X, -R, Z]], SH.edge, 0.8 * (1 - open / 0.25) + 0.1);

    // two coins roll out over the front edge and away
    const roll = (d: number) => Math.min(1, Math.max(0, (h - d) / (1 - d)));
    ([[-5, 0.4], [5.5, 0.55]] as [number, number][]).forEach(([x, d], i) => {
      const u = roll(d);
      if (u <= 0) return;
      // up over the rim, a drop down the front, then a roll along the floor
      const s = u * u * (3 - 2 * u);
      const y = R - 2 + s * (i ? 6.5 : 10);
      const f = Math.min(1, Math.max(0, (y - R - 0.5) / 3)); // how far through the drop
      const z = y < R + 0.5 ? Z + 3.4 : 3.4 + Z * (1 - f * f);
      coin(p, [x + s * (i ? 11 : -2), y, z]);
    });
    // a glint from the empty inside
    if (k > 0.6) {
      const g = (k - 0.6) / 0.4;
      p.dot([2, -2, Z + 3 + Math.sin(t * 2) * 0.6], 0.8, g);
    }
  },
};
