// No address found: a folded map lying flat, a big location pin standing on it. A ripple spreads where it stands; it lifts off, drops back and bounces.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const P = 3.4; // seconds per loop
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
    const PX = 3, PY = 1; // where the pin lands
    p.translate(0, 0, -9);
    p.shadow(0, 0, 30, 15, 0.1);

    // the map panels, back to front along x: the ones tilted toward us solid, the others sparse
    for (let i = 0; i < NP; i++) {
      const xa = X0 + i * PW, xb = xa + PW;
      p.face([[xa, Y0, zz(xa)], [xb, Y0, zz(xb - 0.001)], [xb, Y0 + D, zz(xb - 0.001)], [xa, Y0 + D, zz(xa)]], i % 2 ? 0.22 : 0.075, 0);
      // the front lip under each raised fold: dense
      p.face([[xa, Y0 + D, 0], [xb, Y0 + D, 0], [xb, Y0 + D, zz(xb - 0.001)], [xa, Y0 + D, zz(xa)]], 0.13, 0);
    }
    // one bold road across the paper and a dashed route to where the pin lands, all as cuts
    const road: V3[] = [];
    for (let k = 0; k <= 40; k++) { const x = X0 + (k / 40) * NP * PW; road.push(on(x, 5.5 + Math.sin(x * 0.22) * 2.2)); }
    p.line(road, SH.edge, 1.1);
    const route: [number, number][] = [[-11, -6], [-4, -6], [-1, -2], [PX, PY]];
    for (let k = 0; k < route.length - 1; k++) {
      const [ax, ay] = route[k], [bx, by] = route[k + 1], len = Math.hypot(bx - ax, by - ay);
      for (let d = 0; d < len - 0.5; d += 2.6) {
        const f0 = d / len, f1 = Math.min(1, (d + 1.3) / len);
        p.line([on(ax + (bx - ax) * f0, ay + (by - ay) * f0), on(ax + (bx - ax) * f1, ay + (by - ay) * f1)], SH.edge, 0.75);
      }
    }

    // the pin's motion: lands at the start of the loop, rests, lifts off fading, drops back in with a bounce
    let z = 0;
    if (u < 0.5) z = 0;
    else if (u < 0.66) { const f = (u - 0.5) / 0.16; z = 13 * easeInOut(f); }
    else if (u < 0.86) { const f = (u - 0.66) / 0.2; z = 13 * (1 - f * f); }
    else { const f = (u - 0.86) / 0.14; z = 3 * Math.sin(Math.PI * f); }
    const alpha = Math.max(0, Math.min(1, 1 - (z - 5) / 7));

    // the ripple where it lands, cut into the map
    const rip = u / 0.45;
    if (rip < 1) {
      const r = 2 + rip * 9;
      p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return on(PX + Math.cos(a) * r, PY + Math.sin(a) * r, 0.1); }), SH.edge, 0.9 * (1 - rip) + 0.3);
    }
    // a dark spot under the pin
    const spot = Math.max(0, 1 - z / 12);
    if (spot > 0) {
      const r = 1.4 + 1.8 * spot;
      p.clear(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return on(PX + Math.cos(a) * r, PY + Math.sin(a) * r * 0.9, 0.08); }));
    }

    // the pin: a teardrop standing upright, facing us. Lit on the left, sparse on the right, a hole through the head
    const [sx, sy] = p.pt([PX, PY, zz(PX) + z]);
    const R = 8, Dt = 17, cy = sy - Dt, al = Math.acos(R / Dt);
    p.screen((c) => {
      c.globalAlpha = alpha;
      const shape = () => { c.beginPath(); c.moveTo(sx, sy); c.arc(sx, cy, R, Math.PI / 2 + al, Math.PI / 2 - al + Math.PI * 2); c.closePath(); };
      // the shaded body, then the lit part over it (a disc shifted up left, clipped to the shape)
      shape(); c.fillStyle = "rgb(190,190,190)"; c.fill();
      c.save(); shape(); c.clip();
      c.beginPath(); c.arc(sx - 3, cy - 2.2, R + 1.2, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
      c.restore();
      // a black gap round the head so it reads against the map, and the hole
      shape(); c.strokeStyle = "#000"; c.lineWidth = 0.9; c.lineJoin = "round"; c.stroke();
      c.beginPath(); c.arc(sx, cy, 3, 0, Math.PI * 2); c.fillStyle = "#000"; c.fill();
    });
  },
};
