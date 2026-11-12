// Handshake: two forearms seen straight on, reaching in from left and right to clasp in the middle. Sleeves, bright cuffs, and one hand's fingers wrapped over the other. Hover and they shake, with a spark above.
import { type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735, S = 1.25, CA = Math.cos(0.2), SA = Math.sin(0.2); // S: how big the whole clasp is drawn
// a rounded bar from a to b, r thick each way
const bar = ([ax, ay]: P2, [bx, by]: P2, r: number): P2[] => {
  const g = Math.atan2(by - ay, bx - ax), o: P2[] = [];
  for (let i = 0; i <= 10; i++) { const q = g - Math.PI / 2 + (i / 10) * Math.PI; o.push([bx + Math.cos(q) * r, by + Math.sin(q) * r]); }
  for (let i = 0; i <= 10; i++) { const q = g + Math.PI / 2 + (i / 10) * Math.PI; o.push([ax + Math.cos(q) * r, ay + Math.sin(q) * r]); }
  return o;
};

export const handshake: Illustration = {
  k: "handshake", name: "Handshake", title: "No agreements yet", body: "Agreements you make will be kept here once both sides sign.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const dy = h * Math.sin(t * 10) * 1.6;
    /** the plane that faces us: u to the right, v up. Each arm climbs a little toward the clasp: side -1 left, 1 right */
    const B = (side: number) => ([u, v]: P2): V3 => { const x = (u * CA + side * v * SA + 1.5) * S, y = (v * CA - side * u * SA + 3) * S + dy; return [x * K, -x * K, y]; };
    const L = B(-1), Rt = B(1);
    const rect = (u0: number, v0: number, u1: number, v1: number): P2[] => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
    p.push(); p.translate(0, 0, -20); p.shadow(0, 0, 27, 8, 0.1); p.pop();
    // the left arm: a sleeve, a bright cuff, and a long hand in half tone reaching past the middle
    p.face(rect(-25, -7.4, -18, 7.4).map(L), 0.065, 0);
    p.face(([[-14, -6.6], [1, -6.2], [4, -3], [4, 3.5], [1, 6.6], [-14, 6.6]] as P2[]).map(L), 0.12, 0);
    p.face(rect(-18.5, -9, -14, 9).map(L), 0.3, 0);
    // the right arm: sleeve and cuff
    p.face(rect(15, -7.4, 22, 7.4).map(Rt), 0.065, 0);
    p.face(rect(11, -9, 15.5, 9).map(Rt), 0.3, 0);
    // the right hand, bright: its palm, then four fingers wrapped over the other hand, cut apart
    p.face(rect(3, -6.8, 11, 6.8).map(Rt), 0.3, 0);
    for (const v of [5.1, 1.7, -1.7, -5.1]) p.face(bar([-5 - (Math.abs(v) > 3 ? 0 : 1.2), v], [4, v], 1.7).map(Rt), 0.3, 0);
    for (const v of [3.4, 0, -3.4]) p.line([Rt([-7.5, v]), Rt([6.5, v])], 1, 1.25);
    // the left thumb, up over the top of the clasp
    const th = bar([-9, 5.4], [0, 9.4], 2.4);
    p.face(th.map(L), 0.3, 0);
    p.line([...th.slice(13, 22), ...th.slice(0, 3)].map(L), 1, 1.1);
    // the cuffs' inner edges, as cuts
    p.line([L([-14, -9]), L([-14, 9])], 1, 1.1);
    p.line([Rt([11, -9]), Rt([11, 9])], 1, 1.1);
    // a spark above the clasp
    if (h > 0.25) {
      const k = Math.min(1, (h - 0.25) / 0.5), [x, y] = p.pt([1.5 * S * K, -1.5 * S * K, 20 + dy]);
      p.screen((g) => {
        g.strokeStyle = `rgba(255,255,255,${k})`; g.lineWidth = 1.6; g.lineCap = "round";
        for (const a of [-0.75, 0, 0.75]) { g.beginPath(); g.moveTo(x + Math.sin(a) * 2, y - Math.cos(a) * 2); g.lineTo(x + Math.sin(a) * (2 + 5 * k), y - Math.cos(a) * (2 + 5 * k)); g.stroke(); }
      });
    }
  },
};
