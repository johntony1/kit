// No events: a desk calendar. The top page lifts and flips over the rings onto an empty month.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const PERIOD = 3.6, HW = 13, H = 17, PL = 16, PHI = 0.22; // half width, ring height, page length, lean of the tent

/** a point on a page swung to angle psi (from straight down), u along x, v down the page */
const at = (psi: number, u: number, v: number, off = 0): V3 => [u, Math.sin(psi) * v + Math.cos(psi) * off, H - Math.cos(psi) * v + Math.sin(psi) * off];

function page(p: Parameters<NonNullable<Illustration["draw"]>>[0], psi: number, off: number, face: boolean) {
  p.face([at(psi, -HW, 1.8, off), at(psi, HW, 1.8, off), at(psi, HW, PL, off), at(psi, -HW, PL, off)], face ? 0.06 : 0.08, SH.edge, 0.6);
  if (!face) return;
  const o = off + 0.05;
  // header band
  p.face([at(psi, -HW, 1.8, o), at(psi, HW, 1.8, o), at(psi, HW, 5, o), at(psi, -HW, 5, o)], 0.42, SH.edge, 0.5);
  // the days: a grid of squares, all empty
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const u = -HW + 2.6 + c * 4.6, v = 6.8 + r * 3;
    p.face([at(psi, u, v, o), at(psi, u + 2.8, v, o), at(psi, u + 2.8, v + 2, o), at(psi, u, v + 2, o)], 0.6, 0);
  }
}

export const calendar: Illustration = {
  k: "calendar", name: "Desk calendar", title: "No events", body: "You have nothing scheduled. New events will appear on your calendar.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    const f = u < 0.2 ? 0 : u > 0.8 ? 1 : easeInOut((u - 0.2) / 0.6);
    const psi = PHI + f * (Math.PI * 2 - 2 * PHI);
    const D = Math.tan(PHI) * H;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 26, 12, 0.11);
    p.rotate("z", -0.42);
    // the flipping page, when it is above and behind the rings
    if (psi > Math.PI) page(p, psi, -0.3, false);
    // the stand: the right end of the tent, then the front board
    p.face([[HW, -D, 0], [HW, D, 0], [HW, 0, H]], 0.07, SH.edge, 0.55);
    p.face(([[-HW, 0], [HW, 0], [HW, H + 0.5], [-HW, H + 0.5]] as [number, number][]).map(([x, v]) => at(PHI, x, v, -0.6)), 0.12, SH.edge, 0.55);
    // the page underneath: an empty month
    page(p, PHI, 0, true);
    // a hint of the stack at the bottom edge
    p.line([at(PHI, -HW, PL + 0.6), at(PHI, HW, PL + 0.6)], 0.5, 0.45);
    // the flipping page, in front
    if (psi <= Math.PI) page(p, psi, 0.3, psi < Math.PI * 0.75);
    // rings
    for (let i = 0; i < 5; i++) p.ringV("x", [-HW + 3 + i * 5, 0, H], 1.5, 0, SH.edge, 0.8);
  },
};
