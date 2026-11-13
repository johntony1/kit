// Nothing playing: a turntable shut under its clear lid, the arm parked on its rest. Hover and the lid swings up on its hinge and the record starts to turn, its sheen sweeping round.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

const X = 16, Y = 13, H = 4.5; // half width, half depth, height of the plinth
const CX = -3, CY = 0.5, R = 10.5; // the platter

const arc = (r: number, z: number, a0: number, a1: number, n = 24): V3[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [CX + Math.cos(a) * r, CY + Math.sin(a) * r, z] as V3; });

export const turntable: Illustration = {
  k: "turntable", name: "Turntable", title: "Nothing playing", body: "Pick a song or an album and press play. It will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const open = ease(Math.min(1, h * 1.4)), spin = t * 2.4 * Math.max(0, h - 0.3);
    p.translate(0, 0, -9);
    p.shadow(0, 0, 30, 13, 0.12);
    const drawLid = () => {
    // the lid: a clear cover hinged at the back, propped open; only its bright frame shows
      const LH = 7, ang = 0.6 * open;
      const lid = (x: number, y: number, z: number): V3 => {
        const dy = y + Y, dz = z - H; // about the hinge line at the back top edge
        return [x, -Y + dy * Math.cos(ang) - dz * Math.sin(ang), H + dy * Math.sin(ang) + dz * Math.cos(ang)];
      };
      const corner = (sx: number, sy: number, sz: number) => lid(sx * X, sy < 0 ? -Y : Y, H + (sz ? LH : 0));
      const frame: [number, number, number][][] = [
        [[-1, 1, 1], [1, 1, 1]], [[-1, -1, 1], [-1, 1, 1]], [[1, -1, 1], [1, 1, 1]], [[-1, -1, 1], [1, -1, 1]], [[-1, 1, 0], [-1, 1, 1]], [[1, 1, 0], [1, 1, 1]], [[1, -1, 0], [1, -1, 1]],
      ];
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineWidth = 1.2; c.lineCap = "round";
        for (const [a, b] of frame) { const [x0, y0] = p.pt(corner(a[0], a[1], a[2])), [x1, y1] = p.pt(corner(b[0], b[1], b[2])); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
        // two glints across the glass top
        c.lineWidth = 1;
        for (const k of [0.3, 0.45]) { const [x0, y0] = p.pt(lid(-X + 2 * X * k, Y - 2, H + LH)), [x1, y1] = p.pt(lid(-X + 2 * X * (k + 0.25), -Y + 2, H + LH)); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
      });
    };
    if (open > 0.5) drawLid();
    // the plinth
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.line([[-X, Y + 0.03, H - 1.2], [X, Y + 0.03, H - 1.2]], 0, 0.5);
    p.dot([X - 3, Y + 0.05, 1.8], 0.9, 0.02);
    // the platter and the record: dense vinyl, two sheens that sweep round, a lit label
    p.cylinder(CX, CY, H, R + 0.6, 1.2, { side: 0.12, top: 0.1, edge: 0 });
    const z = H + 1.22;
    p.face(arc(R, z, 0, Math.PI * 2, 48), 0.09, 0);
    for (const a of [spin, spin + Math.PI]) p.face([...arc(4, z + 0.01, a, a + 0.9, 10), ...arc(R - 0.4, z + 0.01, a, a + 0.9, 10).reverse()], 0.22, 0);
    for (const r of [6.2, 8.4]) p.line(arc(r, z + 0.02, 0, Math.PI * 2, 48), 0, 0.45);
    p.face(arc(3.4, z + 0.03, 0, Math.PI * 2, 32), 0.3, 0);
    const m = spin * 2;
    p.line([[CX + Math.cos(m) * 1.3, CY + Math.sin(m) * 1.3, z + 0.05], [CX + Math.cos(m) * 2.9, CY + Math.sin(m) * 2.9, z + 0.05]], 0, 0.7);
    p.dot([CX, CY, z + 0.2], 0.6, 0.02);
    // the arm, parked off the record on its rest: a post, a weight, a long bright tube and a head
    const PX = 11.5, PY = -8.5;
    p.cylinder(PX, PY, H, 2.4, 1, { side: 0.12, top: 0.24, edge: 0 });
    p.cylinder(PX, PY, H + 1, 1.1, 3, { side: 0.14, top: 0.26, edge: 0 });
    p.cylinder(PX + 0.5, PY + 15, H, 0.8, 2.8, { side: 0.14, top: 0.26, edge: 0 });
    const az = H + 4;
    p.box(PX - 1.4, PY - 5, az - 1.2, 2.8, 2.8, 2.6, { top: 0.26, left: 0.14, right: 0.065, edge: 0 });
    const arm = ([[PX, PY - 2, az], [PX, PY + 10, az], [PX - 0.8, PY + 14.5, az - 0.2]] as V3[]).map((v) => p.pt(v));
    p.screen((c) => {
      c.lineCap = "round"; c.lineJoin = "round";
      for (const [col, w] of [["#000", 3], ["#fff", 1.6]] as const) {
        c.strokeStyle = col; c.lineWidth = w;
        c.beginPath(); arm.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      }
    });
    p.box(PX - 2.2, PY + 13.5, az - 1.2, 2.6, 3.4, 1.3, { top: 0.32, left: 0.14, right: 0.065, edge: 0 });

    if (open <= 0.5) drawLid();
  },
};
