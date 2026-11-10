// Queue is empty: numbered tickets stand in a line on a rail. The front one is called into the kiosk and the rest step up.
import { easeInOut, SH, type Illustration, type Pen } from "../dots";

const STEP = 1.5, PERIOD = STEP;
const XF = 4, GAP = 8.5, TW = 6.2, TH = 10, TT = 0.9; // front ticket x, spacing, width, height, thickness
const RZ = 2; // the rail's height
const KX = 12.4; // the kiosk's back x

/** a ticket standing on the rail: a lit face with notches, a big number and a tear line */
function ticket(p: Pen, x: number, k: number, front: boolean) {
  if (k <= 0.02) return;
  const w = TW * k, h = TH * k, y = TT / 2, z0 = RZ;
  const cx = x + TW / 2, x0 = cx - w / 2, x1 = cx + w / 2, nz = z0 + h * 0.36;
  p.box(x0, -y, z0, w, TT, h, { top: SH.top, left: SH.left, right: SH.right });
  // the lit front, with a notch bitten from each side at the tear line
  const fy = y + 0.03, n = 0.8 * k;
  p.face([[x0 + 0.3, fy, z0 + 0.3], [x1 - 0.3, fy, z0 + 0.3], [x1 - 0.3, fy, nz - n], [x1 - 0.3 - n, fy, nz], [x1 - 0.3, fy, nz + n], [x1 - 0.3, fy, z0 + h - 0.3], [x0 + 0.3, fy, z0 + h - 0.3], [x0 + 0.3, fy, nz + n], [x0 + 0.3 + n, fy, nz], [x0 + 0.3, fy, nz - n]], 0.24, 0);
  if (k < 0.6) return;
  const ly = fy + 0.03;
  p.line([[x0 + 1.4, ly, nz], [x1 - 1.4, ly, nz]], SH.edge, 0.55); // tear line
  p.line([[x0 + 1.3, ly, z0 + h - 1.6], [x0 + 3.6, ly, z0 + h - 1.6]], SH.edge, 0.6); // a label
  // the number: two chunky bars
  p.line([[cx - 1.4, ly, z0 + h - 3.4], [cx - 1.4, ly, nz + 1.5]], SH.edge, 1);
  p.line([[cx + 0.6, ly, z0 + h - 3.4], [cx + 1.6, ly, z0 + h - 3.4], [cx + 1.6, ly, nz + 1.5]], SH.edge, 1);
  if (front) p.face([[x0 + 1.2, ly, z0 + 1.1], [x0 + 3, ly, z0 + 1.1], [x0 + 3, ly, z0 + 2.4], [x0 + 1.2, ly, z0 + 2.4]], 0.32, 0);
  else p.line([[x0 + 1.3, ly, z0 + 1.7], [x1 - 1.6, ly, z0 + 1.7]], SH.edge, 0.6);
}

export const queue: Illustration = {
  k: "queue", name: "Ticket queue", title: "Queue is empty", body: "Jobs waiting to run will line up here. There is nothing in the queue right now.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % STEP) / STEP;
    const e = easeInOut(Math.min(1, u / 0.6)); // the line steps forward
    p.translate(5, 1, -10);
    const back = XF - 3 * GAP;
    p.shadow(-8, 0, 20, 7, 0.1);
    p.shadow(KX + 3.5, 0, 14, 8, 0.12);
    // the rail the tickets stand on
    p.box(back - 2, -2.2, 0, KX - back + 2, 4.4, RZ, { top: SH.top });
    p.line([[back - 1, 0, RZ + 0.02], [KX, 0, RZ + 0.02]], SH.edge, 0.8);
    // the slot at the back where the next ticket will stand
    p.guide([[back, -1.6, RZ], [back + TW, -1.6, RZ], [back + TW, 1.6, RZ], [back, 1.6, RZ], [back, -1.6, RZ]], true);
    // tickets back to front: the newest grows in at the back, the front one slides into the kiosk
    for (let i = 3; i >= 0; i--) {
      const x = XF - (i - e) * GAP;
      ticket(p, x, i === 3 ? e : 1, i === 1 && e > 0.5 || i === 0 && e <= 0.5);
    }
    // the kiosk, drawn last so the called ticket disappears into it
    p.box(KX, -5, 0, 8, 10, 17);
    const fy = 5.03;
    p.face([[KX + 1, fy, 9], [KX + 7, fy, 9], [KX + 7, fy, 15.5], [KX + 1, fy, 15.5]], 0.24, 0);
    p.clear([[KX + 1.8, fy + 0.02, 10.2], [KX + 6.2, fy + 0.02, 10.2], [KX + 6.2, fy + 0.02, 14.3], [KX + 1.8, fy + 0.02, 14.3]]);
    // now serving: its number lights as each ticket goes in
    const lit = u > 0.35 && u < 0.85 ? 1 : 0.5;
    p.dot([KX + 3.2, fy + 0.05, 12.25], 0.75, lit);
    p.dot([KX + 4.8, fy + 0.05, 12.25], 0.75, lit);
    p.face([[KX + 1, fy, 2], [KX + 7, fy, 2], [KX + 7, fy, 7.5], [KX + 1, fy, 7.5]], 0.24, 0);
    p.line([[KX + 2.4, fy + 0.03, 5.6], [KX + 5.6, fy + 0.03, 5.6]], SH.edge, 0.7);
    p.line([[KX + 2.4, fy + 0.03, 3.8], [KX + 4.4, fy + 0.03, 3.8]], SH.edge, 0.7);
    for (let i = 0; i < 3; i++) p.line([[KX + 2 + i * 2, -3.5, 17.02], [KX + 2 + i * 2, 3.5, 17.02]], SH.edge, 0.6);
  },
};
