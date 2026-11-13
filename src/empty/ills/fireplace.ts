// Nothing cosy yet: a brick fireplace with a deep mantel, an arched dark firebox and two logs laid in it. Hover and a fire catches on the logs and grows into a tall flickering flame.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const FY = 3; // the front of the chimney breast

// a flame: a teardrop in the x z plane, bright with a dark rim and a dark core
function flame(p: Pen, cx: number, y: number, z0: number, w: number, hgt: number, sway: number) {
  if (hgt < 0.6) return;
  const side = (s: number, k: number): V3[] => Array.from({ length: 13 }, (_, i) => {
    const u = s > 0 ? i / 12 : 1 - i / 12;
    const half = w * k * Math.sin(Math.PI * Math.pow(u, 0.62)) * (1 - u * 0.35);
    return [cx + s * half + sway * u * u, y, z0 + hgt * k * u] as V3;
  });
  const out = [...side(1, 1), ...side(-1, 1)];
  p.face(out, 0.45, 0);
  p.line([...out, out[0]], SH.edge, 0.7);
  if (hgt > 4) p.face([...side(1, 0.42), ...side(-1, 0.42)], 0.03, 0);
}

export const fireplace: Illustration = {
  k: "fireplace", name: "Fireplace", title: "Nothing cosy yet", body: "Light the first fire and the room will warm up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 2, 30, 14, 0.12);
    p.rotate("z", -0.55);
    // the hearth stone, reaching out in front
    p.box(-15, -6, 0, 30, 14, 2, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    // the chimney breast: lit top hidden by the mantel, dense front, sparse end
    p.box(-12, -5, 2, 24, 8, 20, { top: 0.2, left: 0.2, right: 0.065, edge: 0 });
    // brick courses cut into the front
    for (const z of [8, 15]) p.line([[-12, FY + 0.03, z], [12, FY + 0.03, z]], SH.edge, 0.6);
    // the firebox: an arched dark opening
    const arch: V3[] = [[-8, FY + 0.05, 2], [8, FY + 0.05, 2]];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI; arch.push([Math.cos(a) * 8, FY + 0.05, 11 + Math.sin(a) * 6.5]); }
    p.clear(arch);
    // the mantel shelf: a thick lit slab over it all
    p.box(-15, -6.5, 22, 30, 11, 2.6, { top: 0.26, left: 0.16, right: 0.07, edge: 0 });
    p.line([[-15, 4.53, 23.1], [15, 4.53, 23.1]], SH.edge, 0.55);
    // two logs, crossed a little, their cut ends bright
    p.box(-6, -1, 2, 12, 2.6, 2.4, { top: 0.24, left: 0.14, right: 0.07, edge: 0 });
    p.ringV("x", [6.03, 0.3, 3.2], 1.25, 0.32, 0);
    p.box(-5, 0.4, 4.4, 10, 2.4, 2.2, { top: 0.26, left: 0.15, right: 0.07, edge: 0 });
    p.ringV("x", [5.03, 1.6, 5.5], 1.15, 0.32, 0);
    // the fire: it catches, grows and flickers while hovered
    const k = ease(Math.min(1, h * 1.15));
    const f = (a: number) => 1 + h * 0.12 * Math.sin(t * 9 + a) + h * 0.06 * Math.sin(t * 15.3 + a * 2);
    flame(p, -3.6, 2.6, 5.6, 3 * k, 8 * k * f(1), -1.2 * Math.sin(t * 4) * h);
    flame(p, 3.8, 2.6, 5.6, 2.8 * k, 7 * k * f(2.5), 1.1 * Math.sin(t * 4.6) * h);
    flame(p, 0, 2.8, 5.6, 4.2 * k, 11.5 * k * f(0), 1.4 * Math.sin(t * 3.4) * h);
  },
};
