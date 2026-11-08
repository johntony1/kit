// No messages: two thick speech bubbles. Typing dots rise and fall in the front one; the back one bobs.
import { SH, type Illustration, type V3 } from "../dots";

const TAU = Math.PI * 2;

// a rounded rectangle with a tail, in the x-z plane, as [x, z] pairs
function bubble(w: number, h: number, r: number, tail: "l" | "r"): [number, number][] {
  const pts: [number, number][] = [];
  const corner = (cx: number, cz: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (Math.PI / 2) * (i / 6); pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  // start bottom edge, going counter clockwise (as seen from +y, x right, z up)
  if (tail === "l") pts.push([r - 1, 0], [-0.5, -4.5], [r + 5, 0]);
  else pts.push([w - r - 5, 0], [w + 0.5, -4.5], [w - r + 1, 0]);
  corner(w - r, r, -Math.PI / 2);
  corner(w - r, h - r, 0);
  corner(r, h - r, Math.PI / 2);
  corner(r, r, Math.PI);
  return pts;
}

// a slab: the shape facing +y at depth y1, extruded back to y0
function slab(p: Parameters<Illustration["draw"]>[0], shape: [number, number][], x: number, z: number, y0: number, y1: number, front = SH.left) {
  const at = (y: number) => shape.map(([u, v]) => [x + u, y, z + v] as V3);
  p.face(at(y0), SH.right, SH.edge, 0.55); // the back outline shows only where it sticks out
  for (let y = y0 + 0.4; y < y1; y += 0.4) p.face(at(y), 0.09, 0);
  p.face(at(y1), front, SH.edge, 0.6);
}

export const chat: Illustration = {
  k: "chat", name: "Chat bubbles", title: "No messages", body: "Start a conversation and your messages will show up here.",
  kind: "loop", period: 2.4, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t % 2.4) / 2.4;
    const turn = -0.62; // turn the bubbles so their faces look at the viewer

    p.translate(2, -2, 1);
    p.push(); p.translate(0, 0, -21); p.shadow(-1, 1, 24, 6, 0.08); p.pop();
    // the back bubble: up and to the right, bobbing gently
    const bob = Math.sin(ph * TAU) * 1.1;
    p.push();
    p.translate(5, -8, 4 + bob); p.rotate("z", turn);
    slab(p, bubble(21, 13, 4.5, "r"), -10.5, 0, -3, 0);
    p.line([[-6, 0.05, 8.5], [6, 0.05, 8.5]], SH.soft, 0.9);
    p.line([[-6, 0.05, 4.5], [2, 0.05, 4.5]], SH.soft, 0.9);
    p.pop();
    // the front bubble: down and to the left, with the typing dots
    p.push();
    p.translate(-4, 6, -14); p.rotate("z", turn);
    slab(p, bubble(24, 15, 5.5, "l"), -12, 0, -4, 0, 0.14);
    for (let i = 0; i < 3; i++) {
      const u = (ph - i * 0.14 + 1) % 1;
      const k = u < 0.4 ? Math.sin((u / 0.4) * Math.PI) : 0; // a quick hop, then rest
      p.dot([-6 + i * 6, 0.1, 7 + k * 2.6], 1.8, 0.55 + 0.45 * k);
    }
    p.pop();
  },
};
