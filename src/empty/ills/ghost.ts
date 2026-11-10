// Nothing to see here: a friendly sheet ghost floating over a tiled floor, bobbing, its hem rippling and its arms waving.
import { SH, type Illustration, type V3 } from "../dots";

const PERIOD = 3.2;
// the sheet's profile: radius at each height, from the hem up to the crown
const PROF: [number, number][] = [
  [0, 9.2], [1.4, 8.7], [4, 8.3], [8, 8.2], [11, 8], [13.5, 7.4], [16, 6.3], [18, 4.7], [19.6, 2.9], [20.5, 1.3], [20.8, 0],
];
const S = Math.SQRT1_2;
const F = 11, FZ = 2; // floor half size, floor height
const pt = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z];
const rAt = (z: number) => {
  for (let i = 0; i < PROF.length - 1; i++) { const [z0, r0] = PROF[i], [z1, r1] = PROF[i + 1]; if (z >= z0 && z <= z1) return r0 + ((z - z0) / (z1 - z0)) * (r1 - r0); }
  return 0;
};

export const ghost: Illustration = {
  k: "ghost", name: "Ghost", title: "Nothing to see here", body: "This space is empty for now. Things will show up once there is something to show.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD, w = u * Math.PI * 2;
    const lift = Math.sin(w) * 1.3;
    p.translate(0, 0, -16);
    // the floor: four lit tiles
    p.box(-F, -F, 0, F * 2, F * 2, FZ, { top: 0.2, left: SH.left, right: SH.right });
    p.line([[0, -F, FZ + 0.02], [0, F, FZ + 0.02]], SH.edge, 0.55);
    p.line([[-F, 0, FZ + 0.02], [F, 0, FZ + 0.02]], SH.edge, 0.55);
    // its shadow on the floor, smaller and fainter as it rises
    p.push(); p.translate(0, 0, FZ + 0.03);
    p.shadow(0, 0, 11 - lift * 0.8, 5.5 - lift * 0.4, 0.02);
    p.pop();

    p.translate(0, 0, FZ + 11 + lift);
    // the hem: the front half of the bottom ring, rippling
    const wave = (a: number) => 0.8 * Math.sin(a * 7 + w * 2);
    const front = (a0: number, a1: number, z: number, n = 26, rippled = false): V3[] =>
      Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return pt(a, z === 0 ? PROF[0][1] : rAt(z), z + (rippled ? wave(a) : 0)); });
    const band = (a: number, zMin: number) => PROF.filter(([z]) => z >= zMin).map(([z, r]) => pt(a, r, z));
    const R0 = -Math.PI / 4, L0 = (3 * Math.PI) / 4; // the right and left outline, as angles round the axis

    // arms first: the body covers where they join
    const wav = Math.sin(w * 2) * 0.12;
    const arm = (side: number, tone: number) => {
      const a = side > 0 ? L0 : R0;
      const c = pt(a, 8.2, 4.6);
      const ux = side > 0 ? [-S, S] : [S, -S]; // outward along the outline
      const tilt = side > 0 ? 0.15 + wav : 0.15 - wav;
      const pts: V3[] = Array.from({ length: 18 }, (_, i) => {
        const q = (i / 18) * Math.PI * 2, x = Math.cos(q) * 2.6, y = Math.sin(q) * 1.4;
        const along = x * Math.cos(tilt) - y * Math.sin(tilt), up = x * Math.sin(tilt) + y * Math.cos(tilt);
        return [c[0] + ux[0] * (along + 0.9), c[1] + ux[1] * (along + 0.9), c[2] + up] as V3;
      });
      p.face(pts, tone, 0);
    };
    arm(1, 0.2); arm(-1, 0.12);

    // the body: the whole outline in the mid tone
    const outline: V3[] = [...band(R0, 0), ...band(L0, 0).reverse(), ...front(L0, R0, 0, 30, true)];
    p.face(outline, 0.13, 0);
    // the shaded right side
    p.face([...band(R0, 0), ...band(R0 + 0.75, 0).reverse(), ...front(R0 + 0.75, R0, 0, 8, true)], SH.right, 0);
    // the lit hood, down to the shoulders
    const zc = 7.5;
    p.face([...band(R0 + 0.75, zc), ...band(L0, zc).reverse(), ...front(L0, R0 + 0.75, zc, 26)], 0.24, 0);
    // a dark edge all round, so it parts from the floor behind
    p.line([...outline, outline[0]], SH.edge, 0.6);

    // the face: two eyes and a small smile, on the side that looks at us
    const look = Math.sin(w) * 0.06;
    const eye = (da: number) => p.pt(pt(Math.PI / 4 + da + look, rAt(13.6) + 0.2, 13.6));
    const [l, r] = [eye(0.4), eye(-0.4)];
    const m = p.pt(pt(Math.PI / 4 + look, rAt(10.8) + 0.2, 10.8));
    p.screen((c) => {
      c.fillStyle = "#000";
      for (const [x, y] of [l, r]) { c.beginPath(); c.ellipse(x, y, 1.15, 1.75, 0, 0, Math.PI * 2); c.fill(); }
      c.strokeStyle = "#000"; c.lineWidth = 0.9; c.lineCap = "round";
      c.beginPath(); c.arc(m[0], m[1] - 1.6, 2.2, 0.3 * Math.PI, 0.7 * Math.PI); c.stroke();
    });
  },
};
