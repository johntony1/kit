// No posts: a notice board on two feet with three posts pinned to it. The posts slide down a row and a new one pops in at the top.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const P = 3.4; // seconds per loop
const BX = 13, B0 = 3, B1 = 31; // half width, bottom and top of the board
const ROW = 8, TOP = 24.5; // row spacing, the centre of the top post
const PX = 10.5, PH = 3; // half width and half height of a post

export const forum: Illustration = {
  k: "forum", name: "Notice board", title: "No posts yet", body: "Start a discussion and the posts will collect on this board.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -15);
    p.shadow(-7, 0, 16, 8, 0.12);
    p.shadow(7, 0, 16, 8, 0.12);
    // turn the board to face us a little more
    p.rotate("z", -0.42);
    // the feet and legs
    for (const x of [-9, 9]) {
      p.box(x - 1.2, -4, 0, 2.4, 8, 1.4, { top: 0.22, left: 0.13, right: 0.065 });
      p.box(x - 0.8, -1.4, 1.4, 1.6, 1.4, B0 - 1.4, { top: 0.22, left: 0.13, right: 0.065 });
    }
    // the board: a frame, then the cork face set into it
    p.box(-BX, -1.6, B0, BX * 2, 1.6, B1 - B0, { top: 0.22, left: 0.13, right: 0.065 });
    p.face([[-BX + 1.2, 0.03, B0 + 1.2], [BX - 1.2, 0.03, B0 + 1.2], [BX - 1.2, 0.03, B1 - 1.2], [-BX + 1.2, 0.03, B1 - 1.2]], 0.065, SH.edge, 0.55);

    // the posts: shift down a row; the bottom one shrinks away, a new one pops in at the top
    const s = u > 0.2 && u < 0.6 ? easeInOut((u - 0.2) / 0.4) : u >= 0.6 ? 1 : 0;
    const pop = u > 0.5 ? Math.min(1, (u - 0.5) / 0.25) : 0;
    const back = (x: number) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
    const posts: { c: number; k: number; i: number }[] = [];
    for (let i = 0; i < 3; i++) posts.push({ c: TOP - (i + s) * ROW, k: i === 2 ? 1 - s : 1, i });
    if (u >= 0.6 || pop > 0) posts.push({ c: TOP, k: u >= 0.75 ? 1 : back(pop), i: -1 });
    for (const q of posts) {
      if (q.k < 0.04) continue;
      const fresh = q.c > TOP - ROW * 0.5 && (q.i === -1 || u < 0.2);
      p.push();
      p.scale(q.k, [0, 0.4, q.c]);
      const y = 0.9, z0 = q.c - PH, z1 = q.c + PH;
      p.box(-PX, 0.03, z0, PX * 2, y, PH * 2, { top: 0.22, left: 0.22, right: 0.065 });
      // the avatar, a title and a line of text
      p.ringV("y", [-PX + 2.6, y + 0.06, q.c], 1.5, fresh ? 0.32 : 0.04, SH.edge, 0.45);
      p.line([[-PX + 5, y + 0.08, q.c + 1.2], [PX - 2, y + 0.08, q.c + 1.2]], SH.edge, 0.75);
      p.line([[-PX + 5, y + 0.08, q.c - 1.2], [PX - 5, y + 0.08, q.c - 1.2]], SH.edge, 0.75);
      // a pin at the top of the post
      p.dot([0, y + 0.3, z1 - 0.2], 0.7, 0);
      p.pop();
    }
    // the new post's landing spot, dashed, before it arrives
    if (u > 0.2 && u < 0.5) p.guide([[-PX, 1, TOP - PH], [PX, 1, TOP - PH], [PX, 1, TOP + PH], [-PX, 1, TOP + PH], [-PX, 1, TOP - PH]], true);
  },
};
