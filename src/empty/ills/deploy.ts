// No deployments yet: a parcel rides a conveyor belt into a server. Its light blinks as each one goes in.
import { easeInOut, SH, type Illustration } from "../dots";

const PERIOD = 2.8;
const SX0 = -20, SX1 = -8, SY = 6.5, SH_ = 24; // the server: x span, half depth, height
const CX1 = 17, CY = 4, CZ = 6; // the conveyor: far end x, half width, belt height
const DZ0 = CZ + 0.6, DZ1 = CZ + 8.5; // the doorway in the server's side

export const deploy: Illustration = {
  k: "deploy", name: "Deploy belt", title: "No deployments yet", body: "Push your first change and each deployment will roll in here.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(-1, 0, -13);
    p.shadow((SX0 + SX1) / 2, 0, 15, 8, 0.12);
    p.shadow((SX1 + CX1) / 2, 0, 24, 8, 0.1);

    // the server, with a doorway cut into its right wall
    p.box(SX0, -SY, 0, SX1 - SX0, SY * 2, SH_);
    p.clear([[SX1 + 0.02, -CY + 0.3, DZ0], [SX1 + 0.02, CY - 0.3, DZ0], [SX1 + 0.02, CY - 0.3, DZ1], [SX1 + 0.02, -CY + 0.3, DZ1]]);
    // the doorway's rubber strips
    for (let i = 1; i < 4; i++) { const y = -CY + 0.3 + i * ((2 * CY - 0.6) / 4); p.line([[SX1 + 0.04, y, DZ0 + 0.2], [SX1 + 0.04, y, DZ1]], 0.3, 0.45); }
    const fy = SY + 0.03;
    for (let r = 0; r < 3; r++) {
      const z0 = 10 + r * 4.4;
      p.face([[SX0 + 1.2, fy, z0], [SX1 - 1.2, fy, z0], [SX1 - 1.2, fy, z0 + 3.4], [SX0 + 1.2, fy, z0 + 3.4]], 0.24, 0);
      p.line([[SX0 + 2.6, fy + 0.03, z0 + 1.7], [SX0 + 7, fy + 0.03, z0 + 1.7]], SH.edge, 0.75);
    }
    // its status light flashes as the parcel goes in
    const flash = u > 0.72 && u < 0.86;
    p.face([[SX0 + 1.2, fy, 2.5], [SX1 - 1.2, fy, 2.5], [SX1 - 1.2, fy, 7.5], [SX0 + 1.2, fy, 7.5]], 0.24, 0);
    p.dot([SX1 - 3, fy + 0.05, 5], flash ? 1.3 : 0.6, flash ? 1 : 0.4);
    p.line([[SX0 + 2.6, fy + 0.03, 5], [SX0 + 5.4, fy + 0.03, 5]], SH.edge, 0.75);
    for (let i = 0; i < 3; i++) p.line([[SX0 + 3 + i * 3, -SY + 2, SH_ + 0.02], [SX0 + 3 + i * 3, SY - 2, SH_ + 0.02]], SH.edge, 0.65);

    // the conveyor: legs, then the belt with its rollers moving toward the server
    for (const x of [SX1 + 4, (SX1 + CX1) / 2, CX1 - 3]) { p.box(x, CY - 2, 0, 1.6, 1.6, CZ - 1.6); }
    p.box(SX1, -CY, CZ - 1.6, CX1 - SX1, CY * 2, 1.6, { top: SH.top });
    const off = (u * 3) % 1;
    for (let i = 0; i < 9; i++) {
      const x = CX1 - 1 - (i + off) * 3;
      if (x > SX1 + 0.6) p.line([[x, -CY + 0.6, CZ + 0.02], [x, CY - 0.6, CZ + 0.02]], SH.edge, 0.6);
    }
    // the end roller cap
    p.ringV("x", [CX1 + 0.02, 0, CZ - 0.8], 0.9, SH.top, SH.edge, 0.5);

    // the parcel: appears at the far end, rides in, and is cut off by the doorway
    const k = Math.min(1, u / 0.12); // grow in
    const x = CX1 - 5.5 - easeInOut(Math.min(1, u / 0.86)) * (CX1 - 5.5 - SX1 + 7.5);
    const w = 6.5 * k, d = 5.6 * k, hgt = 5.6 * k;
    const xs = Math.max(x, SX1 + 0.05);
    if (x + w > SX1 + 0.3) {
      p.box(xs, -d / 2, CZ, x + w - xs, d, hgt, { top: 0.32 });
      if (x + w / 2 > SX1 + 0.5) p.line([[x + w / 2, -d / 2, CZ + hgt + 0.02], [x + w / 2, d / 2, CZ + hgt + 0.02], [x + w / 2, d / 2 + 0.02, CZ + hgt - 1.8]], SH.edge, 0.75);
      if (xs + 1.3 < x + w - 1.2) p.line([[Math.max(xs + 1, x + 1.2), d / 2 + 0.03, CZ + 1.4], [Math.max(xs + 1.6, x + 3.4), d / 2 + 0.03, CZ + 1.4]], SH.edge, 0.7);
    }
    // where the next one lands
    p.guide([[CX1 - 5.5, -2.8, CZ], [CX1 + 1, -2.8, CZ], [CX1 + 1, 2.8, CZ], [CX1 - 5.5, 2.8, CZ], [CX1 - 5.5, -2.8, CZ]]);
    p.guide([[CX1 - 2, 0, CZ + 9], [CX1 - 2, 0, CZ + 1]]);
  },
};
