// No prompts yet: a prompt box standing up, a spark above it. Words type into it one by one, the send button lights, and it clears to start again.
import { SH, type Illustration, type V3 } from "../dots";

const P = 4; // seconds per loop
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const X0 = -17, X1 = 17, Z1 = 20, DY = 3; // the box, its front facing +y
// the words that get typed: [row, start, end] along the front
const WORDS: [number, number, number][] = [[0, -13.5, -7], [0, -5.5, 2.5], [0, 4, 8], [1, -13.5, -4], [1, -2.5, 3]];

export const prompt: Illustration = {
  k: "prompt", name: "Prompt", title: "No prompts yet", body: "Write your first prompt and save it. It will be kept here to reuse and refine.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -12);
    p.shadow(0, 0, 28, 12, 0.12);
    p.rotate("z", -0.5);
    p.box(X0, -DY, 0, X1 - X0, DY, Z1, { top: 0.22 });
    const f = 0.03;
    const q = (x0: number, z0: number, x1: number, z1: number, fill: number) => {
      const pts: V3[] = [[x0, f, z0], [x1, f, z0], [x1, f, z1], [x0, f, z1]];
      if (fill > 0) p.face(pts, fill, 0); else p.clear(pts);
    };
    // the field: dark glass, with a bar of tools under it
    q(X0 + 1.5, 7.5, X1 - 1.5, Z1 - 1.5, 0);
    p.line([[X0 + 5.5, f, 4.1], [X0 + 2.5, f, 4.1]], SH.edge, 0.7); p.line([[X0 + 4, f, 2.6], [X0 + 4, f, 5.6]], SH.edge, 0.7); // a plus
    // typing: the words arrive in turn until u = 0.55, are sent at 0.72, and the field is empty again
    const sent = u > 0.72, n = sent ? 0 : Math.min(WORDS.length, Math.floor((u / 0.55) * WORDS.length + 0.001));
    const rowZ = (r: number) => Z1 - 5 - r * 4;
    for (let i = 0; i < n; i++) { const [r, a, b] = WORDS[i]; q(a, rowZ(r) - 0.8, b, rowZ(r) + 0.8, 0.3); }
    // the cursor, after the last word
    const last = n ? WORDS[n - 1] : null, cx = last ? last[2] + 1.2 : -13.5, cz = rowZ(last ? last[0] : 0);
    if (Math.floor(u * 10) % 2 === 0) q(cx, cz - 1.5, cx + 1, cz + 1.5, 0.4);
    // the send button: lights and swells as the prompt goes
    const s = clamp(1 - Math.abs(u - 0.72) / 0.1), bx = X1 - 4.4;
    p.ringV("y", [bx, f, 4.1], 2.5 + 0.6 * s, n >= WORDS.length || s > 0 ? 0.45 : 0.3, SH.edge, 0.6);
    p.line([[bx, f + 0.02, 2.8], [bx, f + 0.02, 5.4]], SH.edge, 0.7); p.line([[bx - 1.2, f + 0.02, 4.3], [bx, f + 0.02, 5.5], [bx + 1.2, f + 0.02, 4.3]], SH.edge, 0.7);
    // the spark: a four point star above the corner, breathing
    const [sx, sy] = p.pt([X1 - 3, 0, Z1 + 6.5]), R = 3.6 + 0.9 * Math.sin(u * Math.PI * 2) + 1.4 * s;
    p.screen((c) => {
      c.fillStyle = "#fff"; c.beginPath();
      for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, r = i % 2 ? R * 0.28 : R; c.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); }
      c.closePath(); c.fill();
      c.beginPath(); c.arc(sx - R - 1.5, sy - R * 0.6, 0.7, 0, Math.PI * 2); c.fill();
    });
  },
};
