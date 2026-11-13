// No coins stored: a chunky hardware wallet standing tilted back, a lit screen with a coin on it and two big round buttons. Hover and the buttons click down in turn and a tick appears beside the coin.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const X = 10, Y = 2.6, H = 26; // half width, half thickness, height
const SX = 7.6, SZ0 = 10.4, SZ1 = 23.4; // the screen
const CX = -2.2, CZ = 16.9, CR = 4.4; // the coin on it

export const hardwarewallet: Illustration = {
  k: "hardwarewallet", name: "Hardware wallet", title: "No coins stored", body: "Connect your hardware wallet to see the coins it keeps offline.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const bump = (a: number) => Math.sin(clamp((h - a) / 0.22) * Math.PI);
    const pressL = bump(0.05), pressR = bump(0.3), tick = clamp((h - 0.55) / 0.2);
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 10, 0.12);
    p.rotate("z", -0.7); // turned so its face looks at us
    p.rotate("x", -0.18, [0, 0, 0]); // leaning back a little
    // the body: lit top edge, lit face, sparse side
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.24, left: 0.16, right: 0.065, edge: 0 });
    const f = Y + 0.03, at = (x: number, z: number, o = 0): V3 => [x, f + o, z];
    // the screen, a dark bezel round a lit glass
    p.face([at(-SX - 1, SZ0 - 1), at(SX + 1, SZ0 - 1), at(SX + 1, SZ1 + 1), at(-SX - 1, SZ1 + 1)], 0.02, 0);
    p.face([at(-SX, SZ0), at(SX, SZ0), at(SX, SZ1), at(-SX, SZ1)], 0.3, 0);
    // a coin on the screen: a dark disc with a lit ring and bar
    const ring = (cx: number, r: number, o: number) => Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return at(cx + (Math.cos(a) * r) / 1.22, CZ + Math.sin(a) * r, o); });
    p.face(ring(CX, CR, 0.02), 0.03, 0);
    p.face(ring(CX, CR * 0.62, 0.04), 0.3, 0);
    p.face([at(CX - 0.6, CZ - 1.6, 0.06), at(CX + 0.6, CZ - 1.6, 0.06), at(CX + 0.6, CZ + 1.6, 0.06), at(CX - 0.6, CZ + 1.6, 0.06)], 0.03, 0);
    // a tick beside it once checked
    if (tick > 0) {
      const tk: [number, number][] = [[2.6, 17], [4.1, 15.2], [6.6, 19.4]];
      const n = tk.map(([x, z]) => at(x, z, 0.06));
      const end: V3 = tick < 0.5 ? [n[0][0] + (n[1][0] - n[0][0]) * tick * 2, f + 0.06, n[0][2] + (n[1][2] - n[0][2]) * tick * 2] : [n[1][0] + (n[2][0] - n[1][0]) * (tick - 0.5) * 2, f + 0.06, n[1][2] + (n[2][2] - n[1][2]) * (tick - 0.5) * 2];
      p.line(tick < 0.5 ? [n[0], end] : [n[0], n[1], end], SH.edge, 1.4);
    }
    // two big round buttons below the screen: a dark well, a lit cap that clicks in
    for (const [bx, k] of [[-4.4, pressL], [4.4, pressR]] as const) {
      const cap = (r: number, o: number, z: number) => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return at(bx + (Math.cos(a) * r) / 1.22, z + Math.sin(a) * r, o); });
      p.face(cap(3.3, 0.02, 5.2), 0.02, 0);
      p.face(cap(2.6, 0.04, 5.4 - k * 0.5), 0.36 - k * 0.12, 0);
    }
  },
};
