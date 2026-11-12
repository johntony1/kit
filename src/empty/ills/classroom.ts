// No classes yet: a school house, a bell tower over the door between two wings of windows. Hover and the bell swings and rings.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const rect = (x0: number, x1: number, z0: number, z1: number, y: number): V3[] => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]];

// a sound mark: a short bright arc beside the bell
function ring(p: Pen, at: V3, r: number, dir: 1 | -1, a: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 1.9; g.lineCap = "round";
    g.beginPath(); g.arc(x, y, r, dir > 0 ? -0.75 : Math.PI - 0.75, dir > 0 ? 0.75 : Math.PI + 0.75); g.stroke();
  });
}

export const classroom: Illustration = {
  k: "classroom", name: "Classroom", title: "No classes yet", body: "Create a class and invite your students. It will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 2, 29, 13, 0.11);
    p.rotate("z", -0.5); // turned so its front faces us
    // the two wings: one long block, a roof slab over it, big dark windows
    p.box(-18, -5, 0, 36, 10, 10.5, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(-19, -5.6, 10.5, 38, 11.6, 1.8, { top: 0.26, left: 0.24, right: 0.1, edge: 0 });
    p.line([[-19, 6.03, 10.5], [19, 6.03, 10.5], [19.03, -5.6, 10.5]], SH.edge, 0.7);
    for (const x of [-16, -11, 7.5, 12.5]) p.clear(rect(x, x + 3.5, 3.4, 8.2, 5.03));
    // the tower in the middle, standing forward, with the door
    p.box(-5.5, -5, 0, 11, 12, 21, { top: 0.2, left: 0.14, right: 0.065, edge: 0 });
    p.clear([[-2.4, 7.03, 0], [2.4, 7.03, 0], [2.4, 7.03, 5.6], [1.6, 7.03, 7], [-1.6, 7.03, 7], [-2.4, 7.03, 5.6]]);
    p.box(-4, 7, 0, 8, 2.6, 1.1, { top: 0.3, left: 0.2, right: 0.1, edge: 0 });
    p.line([[-5.5, 7.03, 10.6], [5.5, 7.03, 10.6]], SH.edge, 0.6);
    // the bell in its opening; it swings on hover
    p.clear([[-3, 7.03, 12.4], [3, 7.03, 12.4], [3, 7.03, 17.4], [2, 7.03, 19], [-2, 7.03, 19], [-3, 7.03, 17.4]]);
    const sw = h * Math.sin(t * 7) * 0.5;
    p.push();
    p.rotate("y", sw, [0, 7.05, 18.6]);
    p.face([[-2.3, 7.05, 13.6], [2.3, 7.05, 13.6], [1.5, 7.05, 15.6], [1, 7.05, 18], [-1, 7.05, 18], [-1.5, 7.05, 15.6]], 0.3, 0);
    p.dot([0, 7.07, 13.2], 0.8, 1);
    p.pop();
    // the tower roof: two slopes and the front gable
    const R = 28.5, F = 8, B = -6, Zb = 21, HW = 6.8;
    p.face([[-HW, B, Zb], [0, B, R], [0, F, R], [-HW, F, Zb]], 0.26, 0);
    p.face([[0, B, R], [0, F, R], [HW, F, Zb], [HW, B, Zb]], 0.065, 0);
    p.face([[-HW, F, Zb], [HW, F, Zb], [0, F, R]], 0.16, 0);
    p.line([[-HW, F + 0.03, Zb], [HW, F + 0.03, Zb]], SH.edge, 0.7);
    // the bell rings
    if (h > 0.25) {
      const a = Math.min(1, (h - 0.25) / 0.4);
      for (let i = 0; i < 2; i++) {
        const u = (t * 1.3 + i * 0.5) % 1;
        ring(p, [0, 7.1, 15.8], 7 + u * 5, 1, a * Math.min(1, 1.7 * (1 - u)));
        ring(p, [0, 7.1, 15.8], 7 + u * 5, -1, a * Math.min(1, 1.7 * (1 - u)));
      }
    }
  },
};
