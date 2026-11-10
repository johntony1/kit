// No reminders: a twin bell alarm clock. Hover and it rings: the hammer rattles between the bells, the clock shakes and hops.
import { SH, type Illustration, type V3 } from "../dots";

const R = 11.5, ZC = 15, D = 5; // body radius, centre height, depth (the dial faces +y)
const BR = 4.6; // bell radius
const gray = (v: number) => { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${n},${n},${n})`; };

export const alarm: Illustration = {
  k: "alarm", name: "Alarm clock", title: "No reminders", body: "Set a reminder and it will ring right here when the time comes.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    const ring = h * (0.6 + 0.4 * Math.sin(t * 2.2) ** 2);
    const shake = 0.07 * ring * Math.sin(t * 46);
    const hop = 0.8 * ring * Math.abs(Math.sin(t * 23));
    p.shadow(0, 0, 18, 7.5, 0.12);
    p.rotate("z", -Math.PI / 4); // the dial turns to face us
    const pv = p.pt([0, 0, 0]); // shake around the point it stands on
    p.screen((c) => {
      c.translate(pv[0], pv[1] - hop); c.rotate(shake); c.translate(-pv[0], -pv[1]);
      const y0 = -D / 2, y1 = D / 2;
      // feet
      for (const s of [-1, 1]) {
        p.box(s * 6.4 - 1.5, -1.5, 0, 3, 3, 4.2, { top: 0.2, left: 0.12, right: 0.065 });
      }
      // the bells, behind the body: a dome each, lit, with a cut at the rim
      for (const s of [-1, 1]) {
        const a = s * 0.68 + (s > 0 ? 1 : -1) * 0.04 * Math.sin(t * 50) * ring;
        const cx = Math.sin(a) * (R + 1.2), cz = ZC + Math.cos(a) * (R + 1.2);
        const [sx, sy] = p.pt([cx, -0.5, cz + 1.5]);
        c.save(); c.translate(sx, sy); c.rotate(a * 0.9);
        c.beginPath(); c.arc(0, 0, BR + 0.8, Math.PI, 0); c.closePath(); c.fillStyle = "#000"; c.fill();
        c.beginPath(); c.arc(0, 0, BR, Math.PI, 0); c.closePath(); c.fillStyle = gray(1); c.fill();
        c.fillStyle = "#000"; c.fillRect(-BR - 0.4, -1.6, BR * 2 + 0.8, 0.8); // the lip
        c.fillStyle = gray(1); c.beginPath(); c.arc(0, -BR - 0.6, 1, 0, Math.PI * 2); c.fill();
        c.restore();
      }
      // the hammer between the bells, rattling while it rings
      const ha = 0.55 * ring * Math.sin(t * 46);
      const [hx, hy] = p.pt([0, -0.5, ZC + R + 0.4]);
      c.save(); c.translate(hx, hy); c.rotate(ha);
      c.strokeStyle = gray(1); c.lineWidth = 1.1; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -6.2); c.stroke();
      c.fillStyle = gray(1); c.beginPath(); c.arc(0, -6.6, 1.5, 0, Math.PI * 2); c.fill();
      c.restore();
      // the body: a drum, stepped from the back to the front, then the bezel and the dial
      for (let y = y0; y < y1; y += 0.25) p.ringV("y", [0, y, ZC], R, SH.right, 0);
      p.ringV("y", [0, y1, ZC], R, SH.left, 0);
      p.ringV("y", [0, y1 + 0.01, ZC], R - 1.8, SH.top, 0);
      p.ringV("y", [0, y1 + 0.015, ZC], R - 1.8, 0, SH.edge, 0.7);
      // hour marks and hands, cut into the dial
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2, r0 = i % 3 === 0 ? R - 4.6 : R - 3.6, r1 = R - 2.7;
        p.line([[Math.sin(a) * r0, y1 + 0.02, ZC + Math.cos(a) * r0], [Math.sin(a) * r1, y1 + 0.02, ZC + Math.cos(a) * r1]], SH.edge, i % 3 === 0 ? 1 : 0.6);
      }
      const hand = (a: number, len: number, lw: number) => p.line([[0, y1 + 0.03, ZC], [Math.sin(a) * len, y1 + 0.03, ZC + Math.cos(a) * len]] as V3[], SH.edge, lw);
      hand(-Math.PI / 6 * 2, 4.6, 1.4); // ten o'clock
      hand(Math.PI / 6 * 2, 6.6, 1); // the minute hand on ten past
      // the alarm hand, a thin one pointing at seven
      p.line([[0, y1 + 0.03, ZC], [Math.sin(Math.PI * 7 / 6) * 5.4, y1 + 0.03, ZC + Math.cos(Math.PI * 7 / 6) * 5.4]], SH.edge, 0.55);
      p.dot([0, y1 + 0.04, ZC], 1, 0);
    });
    // sound: arcs on both sides while it rings
    if (ring > 0.05) {
      const [bx, by] = p.pt([0, 0, ZC + 4]);
      p.screen((c) => {
        c.lineCap = "round";
        for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
          const a = ring * (1 - i * 0.2) * (0.6 + 0.4 * Math.abs(Math.sin(t * 9 + i + side)));
          c.strokeStyle = gray(a); c.lineWidth = 1.1;
          const r = 19 + i * 4;
          c.beginPath();
          if (side > 0) c.arc(bx, by, r, -0.45, 0.45); else c.arc(bx, by, r, Math.PI - 0.45, Math.PI + 0.45);
          c.stroke();
        }
      });
    }
  },
};
