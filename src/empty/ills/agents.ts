// No agents: three skeleton cards lying in a row. Hover and the middle one flips up to stand, its avatar lit.
import { SH, type Illustration, type Pen } from "../dots";

const CW = 4.6, CD = 6.6, CT = 0.9; // a card's half width, half depth and thickness

// one card lying flat at the origin; its edges first, its face last, so it can turn on its hinge
function card(p: Pen, lit: boolean) {
  p.face([[-CW, CD, 0], [CW, CD, 0], [CW, CD, CT], [-CW, CD, CT]], 0.12, SH.edge, 0.5);
  p.face([[CW, -CD, 0], [CW, CD, 0], [CW, CD, CT], [CW, -CD, CT]], 0.065, SH.edge, 0.5);
  const z = CT;
  p.face([[-CW, -CD, z], [CW, -CD, z], [CW, CD, z], [-CW, CD, z]], 0.22, SH.edge, 0.55);
  const zz = z + 0.02;
  if (!p.ink) p.line([[-CW, CD, zz], [CW, CD, zz], [CW, -CD, zz]], SH.edge, 0.5);
  // the avatar: a small robot head with two eyes
  const ax = -1.6, ay = -3.6;
  p.face([[ax - 1.7, ay - 1.7, zz], [ax + 1.7, ay - 1.7, zz], [ax + 1.7, ay + 1.7, zz], [ax - 1.7, ay + 1.7, zz]], lit ? 0.34 : 0.2, SH.edge, 0.55);
  if (!p.ink) p.line([[ax - 1.7, ay - 1.7, zz], [ax + 1.7, ay - 1.7, zz], [ax + 1.7, ay + 1.7, zz], [ax - 1.7, ay + 1.7, zz], [ax - 1.7, ay - 1.7, zz]], SH.edge, 0.6);
  p.line([[ax - 0.5, ay - 0.6, zz + 0.01], [ax - 0.5, ay - 0.6, zz + 0.01]], SH.edge, 0.9);
  p.line([[ax + 0.6, ay + 0.5, zz + 0.01], [ax + 0.6, ay + 0.5, zz + 0.01]], SH.edge, 0.9);
  // skeleton bars of text
  p.line([[-3, 0.4, zz], [2.6, 0.4, zz]], SH.edge, 1.1);
  p.line([[-3, 2.6, zz], [3, 2.6, zz]], SH.edge, 0.7);
  p.line([[-3, 4.5, zz], [0.6, 4.5, zz]], SH.edge, 0.7);
}

export const agents: Illustration = {
  k: "agents", name: "Agent cards", title: "No agents yet", body: "Set up an agent and it will stand ready here to take on work.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 34, 15, 0.12);
    p.box(-16, -9.5, 0, 32, 19, 2.2, { top: p.ink ? 0.2 : 0.12, left: 0.12, right: 0.065 });
    if (!p.ink) p.line([[-16, 9.5, 2.2], [16, 9.5, 2.2], [16, -9.5, 2.2]], SH.edge, 0.6);
    const Z = 2.22;
    const at = (x: number, fn: () => void) => { p.push(); p.translate(x, 0, Z); fn(); p.pop(); };
    at(-10.6, () => card(p, false));
    // the empty place left by the middle card
    const slot: [number, number, number][] = [[-CW, -CD, Z + 0.01], [CW, -CD, Z + 0.01], [CW, CD, Z + 0.01], [-CW, CD, Z + 0.01]];
    if (p.ink) p.guide([...slot, slot[0]], true);
    else p.face(slot, 0.03, 0);
    // the middle card: turns up on its front edge, lifting a little, and sways while it stands
    const a = h * (1.2 + Math.sin(t * 2.4) * 0.05);
    at(0, () => {
      p.translate(0, 0, h * 1.6);
      if (h > 0.05) {
        p.guide([[-CW, CD, -h * 1.6], [-CW, CD, 0]], true);
        p.guide([[CW, CD, -h * 1.6], [CW, CD, 0]], true);
      }
      p.rotate("x", -a, [0, CD, 0]);
      card(p, h > 0.5);
    });
    at(10.6, () => card(p, false));
    // a few sparks around the standing card
    if (h > 0.75) for (let i = 0; i < 3; i++) {
      const u = (t * 0.7 + i / 3) % 1;
      p.dot([-6 + i * 5.5, 4, Z + 13 + u * 4], 0.75, Math.sin(u * Math.PI) > 0.3 ? 1 : 0.5);
    }
  },
};
