// Nothing on your agenda: an open day planner. Hover and yesterday's page turns over to a clear day, with a dashed slot for the first event.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const X = 12, PW = 14.4, G = 0.6, ZT = 3.6; // half width, page width, half spine gap, height of the pages
const ROWS = [3.4, 6.2, 9, 11.8]; // the hour rows, measured from the spine

export const agenda: Illustration = {
  k: "agenda", name: "Day planner", title: "Nothing on your agenda", body: "Your day is clear. Events you add will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    // seconds since the hover began, read back from the eased hover value
    const since = -Math.log(Math.max(1e-4, 1 - h)) / 7;
    const f = easeInOut(Math.max(0, Math.min(1, (since - 0.05) / 0.85)));
    p.translate(0, 0, -6);
    p.shadow(0, 0, 38, 19, 0.11);
    // the cover, and the two blocks of pages
    p.box(-X - 1.2, -PW - G - 1.2, 0, X * 2 + 2.4, (PW + G + 1.2) * 2, 1.2, { top: 0.12, left: 0.12, right: SH.right });
    p.box(-X, -PW - G, 1.2, X * 2, PW, ZT - 1.2, { top: 0.21, left: 0.13, right: SH.right });
    p.box(-X, G, 1.2, X * 2, PW, ZT - 1.2, { top: 0.21, left: 0.13, right: SH.right });
    const z = ZT + 0.02;
    // the left page: a date heading and its notes
    p.line([[-9.5, -PW - G + 2, z], [-2, -PW - G + 2, z]], SH.edge, 1.2);
    for (const r of ROWS) p.line([[-10, -G - PW + r + 2, z], [-1 - r * 0.4, -G - PW + r + 2, z]], SH.edge, 0.6);
    // the right page, under the turning one: a clear day with a dashed slot to add to
    for (const r of ROWS) p.line([[-10, G + r, z], [-7.6, G + r, z]], SH.edge, 0.7);
    p.guide([[-6, G + 4.6, z], [9, G + 4.6, z], [9, G + 8, z], [-6, G + 8, z], [-6, G + 4.6, z]], true);
    // the binding rings over the spine
    for (const x of [-9, -4.5, 0, 4.5, 9]) {
      p.ringV("x", [x, 0, ZT - 0.2], 1.9, 0.24, SH.edge, 0.45);
      p.ringV("x", [x + 0.01, 0, ZT - 0.2], 1, 0.035, SH.edge, 0.4);
    }
    // the turning page bends a little: its outer half lags behind
    const a1 = f * Math.PI, a2 = Math.pow(f, 1.5) * Math.PI;
    const half = PW / 2;
    const pt = (x: number, s: number): V3 => {
      const yA = G + Math.cos(a1) * Math.min(s, half), zA = ZT + Math.sin(a1) * Math.min(s, half);
      const r = Math.max(0, s - half);
      return [x, yA + Math.cos(a2) * r, zA + Math.sin(a2) * r + 0.04];
    };
    const seg = (s0: number, s1: number) => p.face([pt(-X, s0), pt(X, s0), pt(X, s1), pt(-X, s1)], 0.21, SH.edge, 0.55);
    // draw the half nearer the viewer last
    if (a2 > Math.PI / 2 && a1 > Math.PI / 2) { seg(half, PW); seg(0, half); }
    else { seg(0, half); seg(half, PW); }
    if (a1 < Math.PI / 2) {
      // yesterday, still facing up: its hours and one booked event
      for (const r of ROWS) p.line([pt(-10, r), pt(-7.6, r)], SH.edge, 0.7);
      if (a1 < 1.2) {
        p.face([pt(-6, 3), pt(9, 3), pt(9, 6.6), pt(-6, 6.6)], 0.32, SH.edge, 1);
        p.line([pt(-4.5, 4.8), pt(3, 4.8)], SH.edge, 0.6);
      }
    } else if (a2 > Math.PI / 2 + 0.6) {
      // its back, once it has turned over: a few lines of notes
      p.line([pt(-9.5, PW - 2), pt(-2, PW - 2)], SH.edge, 1.2);
      for (const r of ROWS) p.line([pt(-10, PW - r - 2), pt(-1 - r * 0.4, PW - r - 2)], SH.edge, 0.6);
    }
    // the path its edge sweeps
    if (f > 0.02 && f < 0.98) p.guide(Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI; return [X, G + Math.cos(a) * PW, ZT + Math.sin(a) * PW] as V3; }));
    // a bookmark ribbon over the spine
    p.face([[6, -0.4, z + 0.1], [7.4, -0.4, z + 0.1], [7.4, -0.4, 0.4], [6, -0.4, 0.4]], 0.2, SH.edge, 0.5);
  },
};
