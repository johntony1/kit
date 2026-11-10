// No meetings yet: a meeting table with its chairs. One chair stands pulled out; hover and it slides in to its place.
import { easeInOut, SH, type Illustration, type Pen } from "../dots";

const S = 2.4, ZS = 5.4; // half size of a seat, height of a seat

// a chair centred on (cx, cy); its back stands on the side `back` names
function chair(p: Pen, cx: number, cy: number, back: "-y" | "+y" | "+x", seat = SH.top, wall = SH.right) {
  p.box(cx - 2, cy - 2, 0, 4, 4, 0.6, { top: 0.16 }); // the foot
  p.box(cx - 0.6, cy - 0.6, 0.6, 1.2, 1.2, ZS - 2, { top: 0.12, left: SH.left, right: SH.right }); // the post
  if (back === "-y") p.box(cx - S, cy - S - 0.9, ZS - 1.4, S * 2, 0.9, 6.4, { top: 0.22 });
  p.box(cx - S, cy - S, ZS - 1.4, S * 2, S * 2, 1.4, { top: seat });
  if (back === "+y") p.box(cx - S, cy + S, ZS - 1.4, S * 2, 0.9, 6.4, { top: 0.22 });
  if (back === "+x") p.box(cx + S, cy - S, ZS - 1.4, 0.9, S * 2, 6.4, { top: 0.22, right: wall });
}

export const meetings: Illustration = {
  k: "meetings", name: "Meeting table", title: "No meetings yet", body: "Schedule a meeting and it will show up here with everyone invited.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const s = easeInOut(h);
    const cx = 22 - 7.5 * s; // the loose chair, pulled out at rest
    p.translate(-3, 0, -2);
    p.shadow(0, 0, 34, 17, 0.11);
    p.shadow(17, 0, 16, 8, 0.08);
    // its spot at the table, and the track it slides along
    p.guide([[14.5 - S, -S, 0], [14.5 + S, -S, 0], [14.5 + S, S, 0], [14.5 - S, S, 0], [14.5 - S, -S, 0]], true);
    p.guide([[14.5 + S, -S, 0], [24.5, -S, 0]]);
    p.guide([[14.5 + S, S, 0], [24.5, S, 0]]);
    // the far chairs
    chair(p, -6, -9.4, "-y");
    chair(p, 6, -9.4, "-y");
    // the table: a pedestal and a thick top, with a notepad at each place
    p.box(-4, -4, 0, 8, 8, 0.8, { top: 0.16 });
    p.box(-2, -2, 0.8, 4, 4, 9, { top: 0.12 });
    p.box(-12.5, -7, 9.8, 25, 14, 1.8, { top: 0.21, left: 0.12, right: SH.right });
    const z = 11.62;
    const pad = (x: number, y: number) => {
      p.face([[x - 2.2, y - 1.6, z], [x + 2.2, y - 1.6, z], [x + 2.2, y + 1.6, z], [x - 2.2, y + 1.6, z]], 0.04, SH.edge, 0.5);
      p.line([[x - 1.3, y - 0.3, z + 0.02], [x + 1.3, y - 0.3, z + 0.02]], SH.edge, 0.55);
      p.line([[x - 1.3, y + 0.8, z + 0.02], [x + 0.4, y + 0.8, z + 0.02]], SH.edge, 0.55);
    };
    pad(-6, -4.2); pad(6, -4.2); pad(-6, 4.2); pad(6, 4.2); pad(9.8, 0);
    // a pitcher in the middle
    p.cylinder(-0.5, 0, z, 1.6, 4, { side: 0.12, top: 0.24 });
    // the near chairs
    chair(p, -6, 9.4, "+y");
    chair(p, 6, 9.4, "+y");
    // the loose one, turned askew while it is out
    p.push();
    p.rotate("z", 0.4 * (1 - s), [cx, 0, 0]);
    chair(p, cx, 0, "+x", 0.32, 0.32);
    p.pop();
  },
};
