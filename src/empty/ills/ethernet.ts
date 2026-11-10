// You are offline: an ethernet plug hovers by its wall port, drifting close and backing off, never clicking in.
import { pulse, SH, type Illustration, type V3 } from "../dots";

const PERIOD = 3.4, SX = -5; // the port's face (+x)

/** a soft cable through points, painted straight onto the canvas */
function cable(p: Parameters<Illustration["draw"]>[0], pts: V3[]) {
  const out: V3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], c0 = i ? pts[i - 1] : a, d = pts[i + 2] ?? b;
    for (let s = 0; s < 8; s++) {
      const u = s / 8, u2 = u * u, u3 = u2 * u;
      out.push([0, 1, 2].map((k) => 0.5 * (2 * a[k] + (-c0[k] + b[k]) * u + (2 * c0[k] - 5 * a[k] + 4 * b[k] - d[k]) * u2 + (-c0[k] + 3 * a[k] - 3 * b[k] + d[k]) * u3)) as V3);
    }
  }
  out.push(pts[pts.length - 1]);
  const q = out.map((v) => p.pt(v));
  p.screen((c) => {
    c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.strokeStyle = "rgb(205,205,205)"; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = "rgb(255,255,255)"; c.lineWidth = 0.9; c.stroke();
  });
}

export const ethernet: Illustration = {
  k: "ethernet", name: "Ethernet cable", title: "You are offline", body: "Your device is not connected to the internet. Plug in or reconnect to keep going.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const near = pulse(t, PERIOD, 0.3);
    const bob = Math.sin((t / PERIOD) * Math.PI * 4) * 0.8;
    const px = SX + 3 + (1 - near) * 8; // the plug's front face
    p.translate(-4, 2, -8);
    p.shadow(4, 0, 30, 11, 0.1);
    p.rotate("z", -0.38);

    // the wall box: a block with its face towards +x, a lit faceplate set into it
    p.box(SX - 7, -8, 0, 7, 16, 16, { top: 0.2 });
    const f = SX + 0.03;
    p.face([[f, -6.5, 1.5], [f, 6.5, 1.5], [f, 6.5, 14.5], [f, -6.5, 14.5]], 0.26, 0);
    p.line([[f + 0.02, -5, 12.4], [f + 0.02, -1.5, 12.4]], SH.edge, 0.6); // a label
    // the port: an RJ45 hole, its latch notch at the bottom, the pins catching the light at the top
    const z0 = 4.6, z1 = 10.4;
    p.face([[f + 0.02, -3.4, z0 + 1.4], [f + 0.02, -1.4, z0 + 1.4], [f + 0.02, -1.4, z0], [f + 0.02, 1.4, z0], [f + 0.02, 1.4, z0 + 1.4],
      [f + 0.02, 3.4, z0 + 1.4], [f + 0.02, 3.4, z1], [f + 0.02, -3.4, z1]], 0.01, 0);
    for (let i = 0; i < 4; i++) { const y = -2.5 + i * 1.65; p.face([[f + 0.04, y, z1 - 2.1], [f + 0.04, y + 0.75, z1 - 2.1], [f + 0.04, y + 0.75, z1 - 0.4], [f + 0.04, y, z1 - 0.4]], 0.24, 0); }
    // the link light: dark, with a faint blink as it keeps looking
    const blink = (t * 1.6) % 1 < 0.12 ? 0.9 : 0.25;
    p.dot([f + 0.05, 4.8, 12.4], 0.75, blink);

    // the plug: a latch underneath, the body with its contacts, a boot, then the cable
    p.push(); p.translate(0, 0, bob);
    const zc = (z0 + z1) / 2 + 0.6;
    // the latch: a thin lever under the body, drawn first so the body sits over it
    p.face([[px + 1, -1.3, zc - 2.8], [px + 5.5, -1.3, zc - 4.1], [px + 5.5, 1.3, zc - 4.1], [px + 1, 1.3, zc - 2.8]], 0.12, 0);
    p.box(px, -3.1, zc - 2.8, 6, 6.2, 5.2, { top: 0.24, left: 0.13, right: 0.07 });
    for (let i = 0; i < 4; i++) { const y = -2.2 + i * 1.5; p.line([[px + 0.4, y, zc + 2.42], [px + 2.6, y, zc + 2.42]], SH.edge, 0.55); }
    // the boot: a softer, narrower block behind it
    p.box(px + 6, -2.4, zc - 2.2, 4.5, 4.8, 4, { top: 0.2, left: 0.12, right: 0.065 });
    for (let i = 0; i < 3; i++) p.line([[px + 7.2 + i * 1.2, -2.4, zc + 1.82], [px + 7.2 + i * 1.2, 2.4, zc + 1.82]], SH.edge, 0.55);
    p.pop();
    cable(p, [[px + 10.5, 0, zc - 0.2 + bob], [px + 14, 0.5, zc - 2.5 + bob * 0.6], [px + 16, 2, 0.8], [px + 19, 5.5, 0.6], [px + 21, 11, 0.6]]);
  },
};
