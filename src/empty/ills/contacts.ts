// No contacts: an address card file. The cards flip forward one at a time to show the next name, then all fall back.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const STEP = 0.9; // seconds per flip
const P = STEP * 5; // four flips forward, then one beat for all of them to fall back
const X = 11, Y = 8.5, H = 6; // half width, half depth, height of the holder
const CX = 9, CH = 13; // half width and height of a card
const N = 6; // cards, front (0) to back
const LEAN = 1.1; // how far a flipped card leans forward

const yOf = (j: number) => 5.8 - j * 2.3;

/** one card standing in its slot at y, leaning forward by a (radians) around its foot */
function card(p: Pen, j: number, a: number, accent: boolean, behind: boolean) {
  const y = yOf(j);
  p.push();
  p.rotate("x", -a, [0, y, H]);
  // the tab on its top edge steps across the cards
  const tx = -CX + 1 + (j % 3) * 5.6;
  const front = Math.cos(a) - Math.sin(a) > 0; // the written side faces us until it leans past halfway
  p.face([[tx, y, H + CH], [tx + 4, y, H + CH], [tx + 3.4, y, H + CH + 1.8], [tx + 0.6, y, H + CH + 1.8]], behind ? 0.12 : 0.2, SH.edge, 0.6);
  // cards still waiting behind the one on show sit a shade darker, so the open card stands out
  p.face([[-CX, y, H], [CX, y, H], [CX, y, H + CH], [-CX, y, H + CH]], behind ? 0.12 : front ? 0.2 : 0.22, SH.edge, 0.85);
  if (front) {
    const w = y + 0.06;
    // the avatar, a name and two lines
    p.face(Array.from({ length: 20 }, (_, k) => { const g = (k / 20) * Math.PI * 2; return [-CX + 4 + Math.cos(g) * 2.2, w, H + CH - 4 + Math.sin(g) * 2.2] as V3; }), accent ? 0.32 : SH.right, SH.edge, 0.8);
    p.line([[-CX + 8, w, H + CH - 3], [CX - 2, w, H + CH - 3]], SH.edge, 0.8);
    p.line([[-CX + 8, w, H + CH - 5.4], [CX - 6, w, H + CH - 5.4]], SH.edge, 0.8);
    p.line([[-CX + 2, w, H + 4], [CX - 2, w, H + 4]], SH.edge, 0.8);
    p.line([[-CX + 2, w, H + 1.8], [CX - 7, w, H + 1.8]], SH.edge, 0.8);
  }
  p.pop();
}

export const contacts: Illustration = {
  k: "contacts", name: "Card file", title: "No contacts yet", body: "Add people or import a list, and their cards will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / STEP, n = Math.floor(u), f = u - n;
    const e = easeInOut(Math.min(1, f / 0.6));
    // the split: cards in front of it lean forward. It moves back a card per beat, then snaps home
    const s = n < 4 ? n + e : 4 * (1 - e);
    p.translate(0, -1, -11);
    p.shadow(-5, 0, 24, 12, 0.12);
    p.shadow(5, 0, 24, 12, 0.12);
    // the holder: a solid block with a slot for every card
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.22, left: 0.13, right: 0.065 });
    for (let j = 0; j < N; j++) p.line([[-CX - 0.6, yOf(j), H + 0.03], [CX + 0.6, yOf(j), H + 0.03]], SH.edge, 0.7);
    // a label frame on the front
    p.face([[-4, Y + 0.04, 1.6], [4, Y + 0.04, 1.6], [4, Y + 0.04, 4.2], [-4, Y + 0.04, 4.2]], 0.22, SH.edge, 0.5);
    p.line([[-2.6, Y + 0.08, 2.9], [2.6, Y + 0.08, 2.9]], SH.edge, 0.6);
    // the cards, back to front
    const shown = Math.min(N - 1, Math.ceil(s - 0.001)); // the first card still standing: its name shows
    for (let j = N - 1; j >= 0; j--) {
      const k = Math.max(0, Math.min(1, s - j));
      // flipped cards lie on one another, the front ones a touch lower
      card(p, j, k * (LEAN + j * 0.04), j === shown, j > shown);
    }
    // the path of the card that is flipping, dashed
    if (n < 4 && f < 0.6) {
      const y = yOf(n), r = CH;
      p.guide(Array.from({ length: 9 }, (_, i) => { const a = (LEAN * i) / 8; return [CX, y + Math.sin(a) * r, H + Math.cos(a) * r] as V3; }), true);
    }
  },
};
