// No API calls yet: a client and a server joined by two pipes. Packets travel out on one and back on the other.
import { SH, type Illustration, type Pen } from "../dots";

const PERIOD = 2.4;
const AX = -22, BX = 9; // the client's and the server's back x
const L0 = -12, L1 = 9; // where the pipes leave the client and reach the server

/** a cube packet, scaled in and out as it leaves and enters a node */
function packet(p: Pen, x: number, y: number, z: number, k: number, top: number) {
  if (k <= 0.02) return;
  const s = 3.2 * k;
  p.box(x - s / 2, y - s / 2, z, s, s, s, { top, left: SH.left, right: SH.right, lw: 0.5 });
}

export const api: Illustration = {
  k: "api", name: "API pipes", title: "No API calls yet", body: "Requests to your API will be listed here as soon as the first one comes in.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -15);
    p.shadow(AX + 5, 0, 14, 7, 0.12);
    p.shadow(BX + 6, 0, 15, 8, 0.12);
    p.shadow((L0 + L1) / 2, 0, 12, 5, 0.08);

    // the client: a small terminal block with a lit screen on its front
    p.box(AX, -5, 0, 10, 10, 10);
    p.face([[AX + 1.4, 5.03, 2.6], [AX + 8.6, 5.03, 2.6], [AX + 8.6, 5.03, 8.4], [AX + 1.4, 5.03, 8.4]], 0.24, 0);
    p.line([[AX + 2.8, 5.06, 6.8], [AX + 7, 5.06, 6.8]], SH.edge, 0.7);
    p.line([[AX + 2.8, 5.06, 4.3], [AX + 5.4, 5.06, 4.3]], SH.edge, 0.7);
    // grille cut across its lit top
    for (let i = 0; i < 3; i++) p.line([[AX + 2.5 + i * 2.5, -3, 10.02], [AX + 2.5 + i * 2.5, 3, 10.02]], SH.edge, 0.6);

    // the two pipes: the far one carries responses back, the near one carries requests out
    const pipe = (y: number) => {
      p.box(L0, y - 1.3, 3, L1 - L0, 2.6, 3, { top: SH.top, left: SH.left, right: SH.right });
      // collars where the pipe meets each node
      p.box(L0, y - 1.6, 2.8, 1.4, 3.2, 3.2, { top: SH.top });
      p.box(L1 - 1.4, y - 1.6, 2.8, 1.4, 3.2, 3.2, { top: SH.top });
    };
    const lane = (y: number, dir: 1 | -1, top: number, accent: boolean) => {
      for (let i = 0; i < 2; i++) {
        const v = (u + i / 2) % 1;
        const x = dir > 0 ? L0 + 0.8 + v * (L1 - L0 - 1.6) : L1 - 0.8 - v * (L1 - L0 - 1.6);
        const k = Math.min(1, v / 0.12, (1 - v) / 0.12);
        const tz = 6 + Math.sin(v * Math.PI) * 1.2;
        if (accent && i === 0) p.guide([[x, y, tz], [x, y, 0]], true);
        packet(p, x, y, tz, k, top);
      }
    };
    pipe(-2.9);
    lane(-2.9, -1, SH.top, false);
    pipe(2.9);
    lane(2.9, 1, 0.32, true);
    p.guide([[L0 + 1.4, 6.5, 0], [L1 - 1.4, 6.5, 0]]);

    // the server: a taller block, drive slots on its lit front and a light that blinks as a packet lands
    p.box(BX, -6, 0, 12, 12, 17);
    const fy = 6.03;
    for (let r = 0; r < 3; r++) {
      const z0 = 2 + r * 4.8;
      p.face([[BX + 1.2, fy, z0], [BX + 10.8, fy, z0], [BX + 10.8, fy, z0 + 3.8], [BX + 1.2, fy, z0 + 3.8]], 0.24, 0);
      p.line([[BX + 2.6, fy + 0.03, z0 + 1.9], [BX + 7, fy + 0.03, z0 + 1.9]], SH.edge, 0.8);
      p.dot([BX + 9.1, fy + 0.05, z0 + 1.9], 0.7, r === 1 && (u % 0.5) > 0.4 ? 1 : 0.5);
    }
    for (let i = 0; i < 4; i++) p.line([[BX + 2.4 + i * 2.4, -4, 17.02], [BX + 2.4 + i * 2.4, 4, 17.02]], SH.edge, 0.6);
  },
};
