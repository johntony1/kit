// No notifications: a bell. Hover and it rings, swinging from its top, the clapper lagging behind.
import { SH, type Illustration, type V3 } from "../dots";

// the bell's profile: radius at each height, from the lip up to the crown
const PROF: [number, number][] = [
  [0, 12.5], [1.2, 12.2], [2.6, 10.6], [5, 9.4], [9, 8.6], [13, 8.1], [16.5, 7.4], [19.5, 6], [21.5, 4], [22.6, 1.6], [22.9, 0],
];
const S = Math.SQRT1_2;
// the points of a horizontal ring that sit on the outline on screen
const rgt = (r: number, z: number): V3 => [r * S, -r * S, z];
const lft = (r: number, z: number): V3 => [-r * S, r * S, z];
// the front half of a horizontal ring (the half facing the viewer), from right to left
const front = (r: number, z: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

export const bell: Illustration = {
  k: "bell", name: "Bell", title: "No notifications", body: "When something needs your attention, you will see it here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.scale(0.92, [0, 0, 20]);
    // a ring every 1.6 s while hovered: it swings out, then settles
    const u = (t % 1.6) / 1.6;
    const env = h * Math.exp(-2.4 * u);
    const ang = 0.3 * env * Math.sin(Math.PI * 2 * 3 * u);
    const lag = 0.3 * env * Math.sin(Math.PI * 2 * 3 * u - 1.1);
    p.shadow(0, 0, 18 + Math.abs(ang) * 10, 7, 0.08);
    const Z = 7; // height of the lip
    const pv = p.pt([0, 0, Z + 27.4]); // the pivot, where the loop hangs from the beam
    const swing = (a: number, fn: () => void) => p.screen((c) => { c.translate(pv[0], pv[1]); c.rotate(a); c.translate(-pv[0], -pv[1]); fn(); });

    swing(ang, () => {
      // clapper, hanging inside, lagging behind the bell
      swing(lag - ang, () => {
        p.line([[0, 0, Z + 6], [0, 0, Z - 7.5]], SH.edge, 0.8);
        p.dot([0, 0, Z - 9.6], 2.6, 1);
      });
      // body: the outline of the surface of revolution
      const body: V3[] = [
        ...PROF.map(([z, r]) => rgt(r, Z + z)),
        ...PROF.slice().reverse().map(([z, r]) => lft(r, Z + z)),
        ...front(PROF[0][1], Z).reverse(),
      ];
      p.face(body, SH.left, SH.edge, 0.6);
      // a soft highlight band down the shoulder
      const band = (a: number) => PROF.slice(1, 9).map(([z, r]) => [Math.cos(a) * r, Math.sin(a) * r, Z + z] as V3);
      p.face([...band(0.05), ...band(0.45).reverse()], 0.24, 0);
      // the rolled lip: a bright bead around the mouth
            p.line(front(PROF[1][1], Z + 1.2), SH.edge, 0.6);
      // the crown loop
      p.ringV("y", [0, 0, Z + 25], 2.4, 0, SH.edge, 1);
            p.dot([0, 0, Z + 22.9], 1.2, 0.6);
    });

    // sound: arcs beside the bell, brighter at the far end of each swing
    const k = Math.min(1, env * 1.6);
    if (k > 0.05) {
      const [bx, by] = p.pt([0, 0, Z + 12]);
      p.screen((c) => {
        c.lineCap = "round";
        for (const side of [-1, 1]) {
          const push = Math.max(0, side * ang) / 0.3;
          for (let i = 0; i < 3; i++) {
            const a = k * (0.35 + 0.65 * push) * (1 - i * 0.22);
            if (a < 0.08) continue;
            const r = 16 + i * 4.2;
            const n = Math.round(255 * Math.min(1, a));
            c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.1;
            c.beginPath();
            if (side > 0) c.arc(bx, by, r, -0.5, 0.5); else c.arc(bx, by, r, Math.PI - 0.5, Math.PI + 0.5);
            c.stroke();
          }
        }
      });
    }
  },
};
