// Build your AI workforce: a row of agent cards standing on the floor. The middle card stands
// forward and arrives as a skeleton (sparse placeholder bars), then its agent resolves: the avatar
// fills in and the lines of text write themselves out. Then the row slides one card to the left,
// the finished card drifts off and sinks away, and a new skeleton steps forward.
// The same piece also comes as real UI (empty/flat/AgentDeck.tsx), the "UI" style.
import { SH, type Illustration, type Pen } from "../dots";

const P = 3.26; // seconds per agent
const TIMING = { resolve: 0.9, resolved: 1.35, slide: 2.7 }; // s into each beat
const W = 8.4, H = 11.5, T = 1.1, SP = 16; // half width, height, thickness, spacing of the cards
const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
const easeIO = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// each agent's lines of text, as fractions of the card's width: name, role, two lines of copy
const TEXT = [[0.42, 0.6, 0.92, 0.7], [0.3, 0.55, 0.88, 0.8], [0.36, 0.48, 0.95, 0.62], [0.4, 0.52, 0.9, 0.74]];

/** one card. x: its centre; e: how far it is the one in front (0..1); f: how resolved its agent is;
 *  k: its scale as it leaves the row; j: which agent */
function card(p: Pen, pos: number, e: number, f: number, k: number, j: number) {
  if (k <= 0.02) return;
  // the row runs along (1,-1): straight across the screen, every card at the same depth
  // the one in front steps straight toward the viewer: along (1,1), so it stays in its place in the row
  const x = pos / Math.SQRT2 + e * 3, cy = -pos / Math.SQRT2;
  p.push();
  p.translate(0, cy, 0);
  p.scale(k * (1 + 0.07 * e), [x, 0, 0]);
  const y0 = -T / 2 + e * 3, z0 = e * 2.4, fy = y0 + T + 0.03; // the card steps forward and up
  const dim = 0.62 + 0.38 * e; // cards to the sides are dimmer
  const front = (Math.max(0.12, 0.21 * dim));
  p.box(x - W, y0, z0, W * 2, T, H, { top: 0.24 * dim, left: front, right: SH.right });
  const X = (u: number) => x - W + 1.6 + u * (W * 2 - 3.2);
  const Z = (v: number) => z0 + v;
  // the footer band: a seam across the card, a short line, two little keys
  p.line([[x - W, fy, Z(3.3)], [x + W, fy, Z(3.3)]], SH.edge, 0.55);
  for (const u of [0.74, 0.9]) p.face([[X(u), fy, Z(0.9)], [X(u) + 1.5, fy, Z(0.9)], [X(u) + 1.5, fy, Z(2.4)], [X(u), fy, Z(2.4)]], f > 0.5 ? 0.24 : 0.09, SH.edge, 0.4);
  // the avatar: a placeholder disc, then the agent's own colour
  const ax = X(0.08), az = Z(H - 2.9);
  p.ringV("y", [ax + 0.4, fy, az], 1.9, 0.09, 0);
  if (f > 0) {
    const rr = 1.9 * Math.min(1, 0.4 + f * 0.6), c: [number, number, number] = [ax + 0.4, fy + 0.01, az];
    p.ringV("y", c, rr, 0.32, SH.edge, 0.5);
    // in the dot styles a lit disc on a lit card needs its edge cut in, and a little spark inside
    if (!p.ink) p.line(Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [c[0] + Math.cos(a) * rr, c[1] + 0.01, c[2] + Math.sin(a) * rr] as [number, number, number]; }), SH.edge, 0.5);
    if (f > 0.6) {
      p.line([[c[0] - rr * 0.5, c[1] + 0.02, c[2]], [c[0] + rr * 0.5, c[1] + 0.02, c[2]]], SH.edge, 0.45);
      p.line([[c[0], c[1] + 0.02, c[2] - rr * 0.5], [c[0], c[1] + 0.02, c[2] + rr * 0.5]], SH.edge, 0.45);
    }
  }
  // the lines: sparse placeholder bars until the agent resolves, then text writing itself out
  const rows: [number, number, number, number][] = [[0.2, Z(H - 2.2), 0.95, 0], [0.2, Z(H - 3.7), 0.7, 1], [0, Z(H - 6.3), 0.6, 2], [0, Z(H - 7.6), 0.6, 3]];
  const tx = TEXT[((j % TEXT.length) + TEXT.length) % TEXT.length];
  rows.forEach(([u0, z, lw, r], i) => {
    const full = tx[r], sk = i < 2 ? (i ? 0.5 : 0.36) : i === 2 ? 0.95 : 0.7;
    if (f < 1) p.face([[X(u0), fy, z - 0.45], [X(u0 + sk * (1 - u0)), fy, z - 0.45], [X(u0 + sk * (1 - u0)), fy, z + 0.45], [X(u0), fy, z + 0.45]], 0.09, 0);
    const g = ease((f - i * 0.12) / 0.6);
    if (g > 0) p.line([[X(u0), fy + 0.02, z], [X(u0 + full * (1 - u0) * g), fy + 0.02, z]], SH.edge, lw + (i === 0 ? 0.35 : 0));
  });
  // the footer's "last active" line
  if (f > 0.5) p.line([[X(0), fy + 0.02, Z(1.65)], [X(0.42), fy + 0.02, Z(1.65)]], SH.edge, 0.55);
  else p.face([[X(0), fy, Z(1.3)], [X(0.42), fy, Z(1.3)], [X(0.42), fy, Z(2)], [X(0), fy, Z(2)]], 0.09, 0);
  p.pop();
}

export const workforce: Illustration = {
  k: "workforce", name: "Agent cards", title: "Build your AI workforce", body: "Add agents that work around the clock, each one made for a single job.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42, flat: "agentDeck",
  draw(p, t) {
    const n = Math.floor(t / P), u = t - n * P;
    const r = ease((u - TIMING.resolve) / (TIMING.resolved - TIMING.resolve));
    const s = easeIO((u - TIMING.slide) / (P - TIMING.slide));
    p.translate(0, 0, -6);
    // the floor shadows sit where the cards rest, so the stage stays still while the row slides
    for (const i of [-1, 0, 1]) p.shadow((i * SP) / Math.SQRT2, 1 - (i * SP) / Math.SQRT2, 12, 5, 0.1);
    for (const i of [-2, -1, 0, 1, 2]) {
      const pos = (i - s) * SP, d = Math.abs(pos) / SP;
      const e = Math.max(0, 1 - d), k = d < 1.1 ? 1 : Math.max(0, 1 - (d - 1.1) / 0.22);
      const j = n + i, f = i < 0 ? 1 : i === 0 ? r : 0;
      card(p, pos, e, f, k, j);
    }
  },
};
