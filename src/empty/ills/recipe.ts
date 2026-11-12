// No recipes saved: a recipe box with its index cards filed away. Hover and one card rises out of the box, showing a dish and its steps.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10.5, D = 6.2, H = 9.5;

export const recipe: Illustration = {
  k: "recipe", name: "Recipe card", title: "No recipes saved", body: "Save a recipe you like and it will be filed here for next time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h);
    p.translate(0, 0, -9 - 3.5 * k);
    p.scale(1.12, [0, 0, 6]);
    p.shadow(0, 0, 25, 12, 0.11);
    // the inside of the box: the floor and the two far walls
    p.face([[-W, -D, 0.5], [W, -D, 0.5], [W, D, 0.5], [-W, D, 0.5]], 0.03, 0);
    p.face([[-W, -D, 0], [W, -D, 0], [W, -D, H], [-W, -D, H]], 0.1, SH.edge, 0.55);
    p.face([[-W, -D, 0], [-W, D, 0], [-W, D, H], [-W, -D, H]], 0.08, SH.edge, 0.55);
    // a card standing across the box, with a tab along its top
    const card = (y: number, z0: number, z1: number, fill: number, tab: number) => {
      const x0 = -W + 0.9, x1 = W - 0.9;
      p.face([[x0, y, z0], [x1, y, z0], [x1, y, z1], [tab + 4.2, y, z1], [tab + 3.6, y, z1 + 1.7], [tab + 0.6, y, z1 + 1.7], [tab, y, z1], [x0, y, z1]], fill, SH.edge, 0.55);
    };
    card(-3.8, 0.6, 12.4, 0.15, -8);
    // the card that rises: a picture of the dish, a title and its steps
    const up = 9.4 * k + 0.4 * h * Math.sin(t * 2.2), y = -1.3, z0 = 0.6 + up, z1 = 12 + up;
    p.face([[-W + 0.9, y, z0], [W - 0.9, y, z0], [W - 0.9, y, z1], [-W + 0.9, y, z1]], 0.34, SH.edge, 0.6);
    const yy = y + 0.04;
    p.ringV("y", [5.6, yy, z1 - 3.1], 2.1, 0.03, 0);
    p.ringV("y", [5.6, yy + 0.01, z1 - 3.1], 1, 0.34, 0);
    p.line([[-8, yy, z1 - 2.2], [1.6, yy, z1 - 2.2]], 0.02, 1);
    for (let i = 0; i < 3; i++) p.line([[-8, yy, z1 - 4.6 - i * 1.9], [i === 2 ? -1 : 2.2, yy, z1 - 4.6 - i * 1.9]], 0.02, 0.55);
    for (let i = 0; i < 2; i++) p.line([[-8, yy, z1 - 10.3 - i * 1.9], [7.6 - i * 4, yy, z1 - 10.3 - i * 1.9]], 0.02, 0.55);
    card(1.2, 0.6, 11.4, 0.2, 2.6);
    card(3.6, 0.6, 10.8, 0.24, -3);
    // the near walls, with a label holder on the front
    p.face([[-W, D, 0], [W, D, 0], [W, D, H], [-W, D, H]], 0.13, SH.edge, 0.6);
    p.face([[W, -D, 0], [W, D, 0], [W, D, H], [W, -D, H]], SH.right, SH.edge, 0.6);
    p.face([[-3.6, D + 0.04, 3.4], [3.6, D + 0.04, 3.4], [3.6, D + 0.04, 6.6], [-3.6, D + 0.04, 6.6]], 0.3, SH.edge, 0.55);
    p.line([[-2, D + 0.07, 5], [2, D + 0.07, 5]], 0.02, 0.6);
  },
};
