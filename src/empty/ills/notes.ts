// No notes yet: a pad of sticky notes. Hover and the top note peels up from its free edge, curling back.
import { SH, type Illustration, type V3 } from "../dots";

const S = 11, H = 4.5; // half size of a note, height of the pad
const N = 18; // strips across the curling note

export const notes: Illustration = {
  k: "notes", name: "Sticky notes", title: "No notes yet", body: "Jot down a thought and your notes will stick around right here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1, -1, -9);
    p.shadow(0, 1.5, 28, 14, 0.12);
    // a pencil lying in front of the pad
    const PY = S + 3;
    p.box(-12, PY, 0, 18, 2.2, 2.2, { top: 0.22, left: 0.12, right: 0.065 });
    p.box(-14, PY, 0, 2, 2.2, 2.2, { top: 0.12, left: 0.065, right: 0.04 });
    p.face([[6, PY, 2.2], [9.6, PY + 1.1, 1.1], [6, PY + 2.2, 2.2]], 0.16, SH.edge, 0.5);
    p.face([[6, PY + 2.2, 0], [9.6, PY + 1.1, 1.1], [6, PY + 2.2, 2.2]], 0.1, SH.edge, 0.5);
    p.line([[-8, PY + 2.25, 1.1], [4, PY + 2.25, 1.1]], SH.edge, 0.55);
    // the pad: stacked sheets show as ridges on its walls
    p.box(-S, -S, 0, S * 2, S * 2, H, { top: 0.22, left: 0.13, right: 0.07 });
    for (let z = 1.1; z < H; z += 1.1) p.line([[-S, S + 0.03, z], [S, S + 0.03, z], [S + 0.03, -S, z]], SH.edge, 0.55);
    // writing on the note beneath, seen once the top one lifts
    const Z = H + 0.04;
    // (only once it shows: in the dot styles a line cuts through whatever is drawn over it)
    if (h > 0.35) {
      p.line([[-7, 3.5, Z], [6, 3.5, Z]], SH.edge, 0.7);
      p.line([[-7, 7.5, Z], [2, 7.5, Z]], SH.edge, 0.7);
    }
    if (h > 0.05) p.guide([[-S, -S, Z + 0.1], [S, -S, Z + 0.1], [S, S, Z + 0.1], [-S, S, Z + 0.1], [-S, -S, Z + 0.1]], true);

    // the top note: glued along its back edge, the rest bends with a growing curl
    const L = S * 2, glue = L * 0.42, ds = L / N, k = (h * 2.4) / (L - glue);
    const pts: { y: number; z: number; a: number }[] = [{ y: -S, z: Z + 0.12, a: 0 }];
    for (let i = 0; i < N; i++) {
      const s = (i + 0.5) * ds, a = s < glue ? 0 : (s - glue) * k;
      const q = pts[i];
      pts.push({ y: q.y + Math.cos(a) * ds, z: q.z + Math.sin(a) * ds, a });
    }
    const strips = Array.from({ length: N }, (_, i) => i).sort((a, b) => (pts[a].y + pts[a + 1].y) * 0.5 - (pts[a].z + pts[a + 1].z) * 0.35 - ((pts[b].y + pts[b + 1].y) * 0.5 - (pts[b].z + pts[b + 1].z) * 0.35));
    for (const i of strips) {
      const q0 = pts[i], q1 = pts[i + 1], a = (q0.a + q1.a) / 2;
      // the top side shows while the strip leans less than 45 degrees, then its back
      const front = Math.cos(a) - Math.sin(a) > 0;
      // cut into small tiles so the line style seals them into one curved surface
      for (let j = 0; j < 10; j++) {
        const x0 = -S + (j * S) / 5, x1 = x0 + S / 5;
        const quad: V3[] = [[x0, q0.y, q0.z], [x1, q0.y, q0.z], [x1, q1.y, q1.z], [x0, q1.y, q1.z]];
        p.face(quad, front ? 0.3 : 0.14, 0);
      }
      // its two side edges, so the curl has an outline
      p.line([[-S, q0.y, q0.z], [-S, q1.y, q1.z]], SH.edge, 0.55);
      p.line([[S, q0.y, q0.z], [S, q1.y, q1.z]], SH.edge, 0.55);
      // the glue strip and two lines of writing on the note
      if (i === 2 && front) p.line([[-S, q1.y, q1.z + 0.02], [S, q1.y, q1.z + 0.02]], SH.edge, 0.45);
      if ((i === 9 || i === 13) && front) p.line([[-7, (q0.y + q1.y) / 2, (q0.z + q1.z) / 2 + 0.03], [i === 9 ? 6 : 1, (q0.y + q1.y) / 2, (q0.z + q1.z) / 2 + 0.03]], SH.edge, 0.7);
    }
    // the note's outline: the back edge and the free edge
    p.line([[-S, pts[0].y, pts[0].z], [S, pts[0].y, pts[0].z]], SH.edge, 0.55);
    p.line([[-S, pts[N].y, pts[N].z], [S, pts[N].y, pts[N].z]], SH.edge, 0.55);
  },
};
