// No alerts firing: a siren beacon on its base. Its lamp turns slowly and rays flare on the side it faces, round and round.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per turn
const DR = 9.5, DZ = 7, N = 7; // dome radius, where it starts, slices

export const alerts: Illustration = {
  k: "alerts", name: "Alert siren", title: "No alerts firing", body: "All quiet. When a rule trips, the alert will show up here first.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const a = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -10);
    p.shadow(0, 0, 26, 13, 0.12);
    // the base and its collar
    p.cylinder(0, 0, 0, 12.5, 5, { side: 0.12, top: 0.2 });
    p.line(Array.from({ length: 21 }, (_, i) => { const q = -Math.PI / 4 + (Math.PI * i) / 20; return [Math.cos(q) * 12.5, Math.sin(q) * 12.5, 1.6] as V3; }), SH.edge, 0.5);
    p.cylinder(0, 0, 5, 10.5, 2, { side: 0.065, top: 0.2 });
    // the dome: slices of a half ball with a bright outline
    const zr = (i: number): [number, number] => { const q = (i / N) * (Math.PI / 2); return [DZ + Math.sin(q) * DR, Math.cos(q) * DR]; };
    for (let i = 0; i < N; i++) {
      const [z0, r0] = zr(i), [z1] = zr(i + 1);
      p.cylinder(0, 0, z0, r0, z1 - z0, { side: p.ink ? 0.12 : 0.055, top: p.ink ? 0.2 : 0.055, edge: 0 });
    }
    const sil = (q: number, k = 1): V3[] => Array.from({ length: N + 1 }, (_, i) => { const [z, r] = zr(i); return [Math.cos(q) * r * k, Math.sin(q) * r * k, z] as V3; });
    p.line([...sil(-Math.PI / 4), ...sil((3 * Math.PI) / 4).reverse()], SH.edge, 0.6);
    // the lamp: a lit band that travels round the glass, on whichever of its two sides faces us
    const lit = Math.cos(a - Math.PI / 4) > 0 ? a : a + Math.PI, w = 0.34;
    const l = sil(lit - w, 1.01).slice(0, N), r = sil(lit + w, 1.01).slice(0, N);
    p.face([...l, ...r.reverse()], 0.4, 0);
    p.dot([0, 0, DZ + DR + 0.3], 1.2, 1);
    // rays: three short strokes on each side of the dome, flaring as the lamp swings to that side
    const [cx, cy] = p.pt([0, 0, DZ + DR * 0.5]);
    p.screen((c) => {
      c.lineCap = "round";
      for (const side of [-1, 1]) {
        const k = Math.pow(Math.max(0, Math.cos(a - (side > 0 ? -Math.PI / 4 : (3 * Math.PI) / 4))), 2) + Math.pow(Math.max(0, Math.cos(a + Math.PI - (side > 0 ? -Math.PI / 4 : (3 * Math.PI) / 4))), 2);
        if (k < 0.08) continue;
        const g = Math.round(90 + 165 * k);
        c.strokeStyle = `rgb(${g},${g},${g})`; c.lineWidth = 1.1;
        for (const q of [-0.5, 0, 0.5]) {
          const dx = Math.cos(q) * side, dy = Math.sin(q) - 0.25, r0 = 15.5, r1 = r0 + 2.5 + 3.5 * k;
          c.beginPath(); c.moveTo(cx + dx * r0, cy + dy * r0); c.lineTo(cx + dx * r1, cy + dy * r1); c.stroke();
        }
      }
    });
  },
};
