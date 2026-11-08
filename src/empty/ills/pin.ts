// No address found: a folded map lying flat. A location pin drops onto it, bounces, sends out a ripple, and lifts off again.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const X0 = -16, PW = 8, NP = 4, Y0 = -10, D = 20, A = 3; // map: start, panel width, panels, depth, fold height
/** height of the folded map at x: a zigzag */
const zz = (x: number) => {
  const u = Math.max(0, Math.min(NP * PW - 0.001, x - X0)) / PW, i = Math.floor(u), f = u - i;
  return (i % 2 ? 1 - f : f) * A;
};
const on = (x: number, y: number, lift = 0.05): V3 => [x, y, zz(x) + lift];

export const pin: Illustration = {
  k: "pin", name: "Map pin", title: "No address found", body: "We couldn't find that place. Check the spelling or try a nearby street or city.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    const PX = 6, PY = 2; // where the pin lands
    p.translate(0, 0, -6);
    p.shadow(0, 0, 30, 15, 0.1);

    // the map panels, back to front along x; alternate panels catch more light
    for (let i = 0; i < NP; i++) {
      const xa = X0 + i * PW, xb = xa + PW;
      p.face([[xa, Y0, zz(xa)], [xb, Y0, zz(xb - 0.001)], [xb, Y0 + D, zz(xb - 0.001)], [xa, Y0 + D, zz(xa)]], i % 2 ? 0.2 : 0.09, 0);
      // the front lip under each raised fold
      p.face([[xa, Y0 + D, 0], [xb, Y0 + D, 0], [xb, Y0 + D, zz(xb - 0.001)], [xa, Y0 + D, zz(xa)]], 0.12, 0);
    }
    // a river winding across the paper
    const river: V3[] = [];
    for (let k = 0; k <= 48; k++) { const x = X0 + (k / 48) * NP * PW; river.push(on(x, 4 + Math.sin(x * 0.28) * 2.6)); }
    p.line(river, 0.42, 1.5);
    // folds dimmer than the outline
    for (let i = 1; i < NP; i++) { const x = X0 + i * PW; p.line([[x, Y0, zz(x)], [x, Y0 + D, zz(x)]], 0.6, 0.5); }
    const X1 = X0 + NP * PW;
    const back: V3[] = [], front: V3[] = [];
    for (let i = 0; i <= NP; i++) { const x = X0 + i * PW; back.push([x, Y0, zz(Math.min(x, X1 - 0.001))]); front.push([x, Y0 + D, zz(Math.min(x, X1 - 0.001))]); }
    p.line([...back, ...front.slice().reverse(), back[0]], SH.edge, 0.6);
    p.line([[X0, Y0 + D, 0], [X1, Y0 + D, 0]], SH.edge, 0.6);
    // the dotted route to where the pin lands, from a small start ring
    const route: [number, number][] = [[-12, -5], [-6, -6], [-2, -2], [2, -3], [PX, PY]];
    p.line(Array.from({ length: 21 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return on(-12 + Math.cos(a) * 1.5, -5 + Math.sin(a) * 1.5); }), 0.9, 0.55);
    let carry = 0;
    for (let k = 0; k < route.length - 1; k++) {
      const [ax, ay] = route[k], [bx, by] = route[k + 1], len = Math.hypot(bx - ax, by - ay);
      for (let d = carry; d < len; d += 2.4) { const f = d / len; p.dot(on(ax + (bx - ax) * f, ay + (by - ay) * f), 0.7, 1); carry = d + 2.4 - len; }
    }

    // the pin's motion: drop, one bounce, rest, lift off
    let z = 0, alpha = 1;
    if (u < 0.28) { const f = u / 0.28; z = 22 * (1 - f * f); }
    else if (u < 0.42) { const f = (u - 0.28) / 0.14; z = 3.2 * Math.sin(Math.PI * f); }
    else if (u < 0.74) z = 0;
    else { const f = (u - 0.74) / 0.26; z = 22 * easeInOut(f) * f; }
    alpha = Math.max(0, Math.min(1, 1 - (z - 8) / 12));

    // the ripple where it lands, and a dark spot under the pin
    const rip = (u - 0.3) / 0.45;
    if (rip > 0 && rip < 1) {
      const r = 1.5 + rip * 10, k = 1 - rip;
      p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return on(PX + Math.cos(a) * r, PY + Math.sin(a) * r, 0.1); }), k, 0.5 + 0.5 * k);
      if (rip > 0.25) { const r2 = 1.5 + (rip - 0.25) * 8; p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return on(PX + Math.cos(a) * r2, PY + Math.sin(a) * r2, 0.1); }), k * 0.6, 0.45); }
    }
    const spot = Math.max(0, 1 - z / 16);
    if (spot > 0) {
      const r = 1.2 + 1.6 * spot;
      p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return on(PX + Math.cos(a) * r, PY + Math.sin(a) * r * 0.9, 0.08); }), 0.03, 0);
    }

    // the pin: a teardrop standing upright, facing us, with a hole through the head
    const [sx, sy] = p.pt([PX, PY, zz(PX) + z]);
    const R = 6, Dt = 13.5, cy = sy - Dt, al = Math.acos(R / Dt);
    p.screen((c) => {
      c.globalAlpha = alpha;
      c.beginPath();
      c.moveTo(sx, sy);
      c.arc(sx, cy, R, Math.PI / 2 + al, Math.PI / 2 - al + Math.PI * 2);
      c.closePath();
      c.fillStyle = "rgb(70,70,70)"; c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = 0.6; c.lineJoin = "round"; c.stroke();
      // a highlight down the left of the head
      c.beginPath(); c.arc(sx, cy, R - 1.3, Math.PI * 1.05, Math.PI * 1.45); c.strokeStyle = "rgb(200,200,200)"; c.lineWidth = 0.7; c.lineCap = "round"; c.stroke();
      c.beginPath(); c.arc(sx, cy, 2.3, 0, Math.PI * 2); c.fillStyle = "#000"; c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 0.6; c.stroke();
    });
  },
};
