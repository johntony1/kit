// Connection lost: a plug reaches for its socket, sparks flicker in the gap, and it backs off again.
import { pulse, SH, type Illustration, type V3 } from "../dots";

// a smooth cable through points, drawn as a thick soft line with a bright core
function cable(p: Parameters<Illustration["draw"]>[0], pts: V3[]) {
  const out: V3[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const c0 = i ? pts[i - 1] : a, d = pts[i + 2] ?? b;
    for (let s = 0; s < 8; s++) {
      const u = s / 8, u2 = u * u, u3 = u2 * u;
      out.push([0, 1, 2].map((k) => 0.5 * (2 * a[k] + (-c0[k] + b[k]) * u + (2 * c0[k] - 5 * a[k] + 4 * b[k] - d[k]) * u2 + (-c0[k] + 3 * a[k] - 3 * b[k] + d[k]) * u3)) as V3);
    }
  }
  out.push(pts[pts.length - 1]);
  p.line(out, SH.edge, 1.7);
  p.line(out, 0.25, 0.5);
}

// a block that tapers along x, from size a at x0 to size b at x1, centred on y = 0, z = zc
function taper(p: Parameters<Illustration["draw"]>[0], x0: number, x1: number, a: number, b: number, zc: number) {
  const A = a / 2, B = b / 2;
  p.face([[x0, -A, zc + A], [x1, -B, zc + B], [x1, B, zc + B], [x0, A, zc + A]], SH.top);
  p.face([[x0, A, zc - A], [x1, B, zc - B], [x1, B, zc + B], [x0, A, zc + A]], SH.left);
  p.face([[x1, -B, zc - B], [x1, B, zc - B], [x1, B, zc + B], [x1, -B, zc + B]], SH.right);
}

const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

export const plug: Illustration = {
  k: "plug", name: "Plug and socket", title: "Connection lost", body: "We can't reach the server right now. Check your connection and try again.",
  kind: "loop", period: 3, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const near = pulse(t, 3, 0.3);
    const SX = -6; // the socket's face (+x)
    const px = SX + 6.5 + 2.4 + (1 - near) * 6.5; // the plug's front face
    p.translate(-1, 0, -7);
    p.shadow(0, 0, 32, 11, 0.1);

    // the socket's cable, out the back and round towards us
        // the socket: a block with its face towards +x
    p.box(SX - 7, -6, 0, 7, 12, 11, { top: 0.2 });
    cable(p, [[SX - 3.5, 6, 1.6], [SX - 3.5, 9, 0.7], [SX - 7, 13.5, 0.7], [SX - 13, 15, 0.7]]);
    for (const y of [-2.8, 2.8]) p.face([[SX + 0.02, y - 0.9, 4], [SX + 0.02, y + 0.9, 4], [SX + 0.02, y + 0.9, 8], [SX + 0.02, y - 0.9, 8]], 0.01, SH.edge, 0.55);

    // sparks in the gap, flickering, only when the plug is close
    if (near > 0.85) {
      const step = Math.floor(t * 18);
      for (let i = 0; i < 5; i++) {
        if (hash(step * 7 + i) < 0.4) continue;
        const gx = SX + 0.6 + hash(step * 13 + i) * (px - 6.5 - SX - 1.2);
        const y = (i % 2 ? 2.8 : -2.8) + (hash(step * 3 + i) - 0.5) * 3;
        const z = 6 + (hash(step * 5 + i) - 0.5) * 4;
        p.dot([gx, y, z], 0.55 + hash(step + i * 11) * 0.5, 1);
      }
    }

    // the plug: pins first (they point back at the socket), then the body, then its cable
    for (const y of [-2.8, 2.8]) p.line([[px - 6.5, y, 6], [px, y, 6]], SH.edge, 1.6);
    p.box(px, -4.5, 1.5, 5, 9, 9, { top: 0.22 });
    taper(p, px + 5, px + 11, 6.4, 3, 6);
    cable(p, [[px + 11, 0, 6], [px + 14, 0, 2.2], [px + 17, -0.5, 0.7], [px + 22, -2.5, 0.7]]);
  },
};
