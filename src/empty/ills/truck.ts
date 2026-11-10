// No deliveries: a delivery truck idling in place. The body shivers, the wheels turn on the spot and exhaust puffs out the back.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const WR = 3.7; // wheel radius
const Y = 6; // the near side of the truck

// a wheel on the near side: tyre, a dark rim line, a lit hub and spokes turned by a
function wheel(p: Pen, x: number, a: number) {
  const y = Y + 0.6;
  p.ringV("y", [x, y, WR], WR, 0.12);
  p.ringV("y", [x, y + 0.02, WR], WR - 0.2, 0, SH.edge, 0.7);
  p.ringV("y", [x, y + 0.04, WR], 2.1, 0.26);
  for (let i = 0; i < 3; i++) {
    const u = a + (i * Math.PI) / 3;
    p.line([[x + Math.cos(u) * 2, y + 0.06, WR + Math.sin(u) * 2], [x - Math.cos(u) * 2, y + 0.06, WR - Math.sin(u) * 2]], SH.edge, 0.55);
  }
  p.dot([x, y + 0.08, WR], 0.6, 0.02);
}
// the dark arch the wheel sits in
function arch(p: Pen, x: number, z: number) {
  p.clear([...Array.from({ length: 13 }, (_, i) => { const u = (Math.PI * i) / 12; return [x + Math.cos(u) * (WR + 0.9), Y + 0.03, z + Math.sin(u) * (WR + 0.4)] as V3; })]);
}

export const truck: Illustration = {
  k: "truck", name: "Delivery truck", title: "No deliveries", body: "Nothing is on its way yet. Shipments will appear here as soon as they are sent.",
  kind: "loop", period: 2.4, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = t / 2.4;
    const bob = 0.28 * Math.abs(Math.sin(Math.PI * 2 * 4 * u)); // the engine shiver
    p.translate(-0.5, 0, -10.5);
    p.shadow(0, 0, 30, 12, 0.12);
    // exhaust: puffs from the pipe at the back, drifting up and away
    for (let i = 0; i < 3; i++) {
      const k = (u * 2 + i / 3) % 1;
      p.dot([-18.5 - k * 7, 3.6, 3 + k * 7], 0.7 + k * 1.5, Math.sin(k * Math.PI) * 0.9);
    }
    p.push();
    p.translate(0, 0, bob);
    // the chassis under it all
    p.box(-17, -Y + 1, 2.2, 34, (Y - 1) * 2, 2.4, { top: 0.12, left: 0.065, right: 0.065 });
    // the cargo box
    p.box(-18, -Y - 0.5, 4.4, 22, Y * 2 + 0.5, 17, { top: 0.21, left: 0.12, right: 0.065 });
    // its side: a lit panel with a parcel on it
    p.face([[-15.5, Y + 0.02, 8.5], [1.5, Y + 0.02, 8.5], [1.5, Y + 0.02, 18.5], [-15.5, Y + 0.02, 18.5]], 0.25, SH.edge, 0.5);
    p.line([[-9.5, Y + 0.05, 10.6], [-4.5, Y + 0.05, 10.6], [-4.5, Y + 0.05, 16.2], [-9.5, Y + 0.05, 16.2], [-9.5, Y + 0.05, 10.6]], SH.edge, 0.7);
    p.line([[-9.5, Y + 0.05, 14.4], [-4.5, Y + 0.05, 14.4]], SH.edge, 0.6);
    p.line([[-7, Y + 0.05, 14.4], [-7, Y + 0.05, 16.2]], SH.edge, 0.6);
    p.line([[-1.8, Y + 0.05, 16.2], [0, Y + 0.05, 16.2]], SH.edge, 0.6);
    p.line([[-2.8, Y + 0.05, 13.4], [0, Y + 0.05, 13.4]], SH.edge, 0.6);
    p.line([[-1.8, Y + 0.05, 10.6], [0, Y + 0.05, 10.6]], SH.edge, 0.6);
    // the cab, then the bonnet in front of it
    p.box(4.4, -Y, 4.4, 8.6, Y * 2, 13, { top: 0.22, left: 0.12, right: 0.065 });
    p.box(13, -Y, 4.4, 5, Y * 2, 6, { top: 0.22, left: 0.12, right: 0.065 });
    // windscreen on the front of the cab, side window and door
    p.face([[13.02, -Y + 1, 11.6], [13.02, Y - 1, 11.6], [13.02, Y - 1, 16.2], [13.02, -Y + 1, 16.2]], 0.24, SH.edge, 0.5);
    p.line([[13.05, 0, 11.6], [13.05, 0, 16.2]], SH.edge, 0.55);
    p.face([[6.2, Y + 0.02, 11.4], [11.8, Y + 0.02, 11.4], [11.8, Y + 0.02, 16], [6.2, Y + 0.02, 16]], 0.26, SH.edge, 0.5);
    p.line([[5.6, Y + 0.05, 5], [5.6, Y + 0.05, 16.4]], SH.edge, 0.55);
    p.line([[9.6, Y + 0.05, 9.6], [11.2, Y + 0.05, 9.6]], SH.edge, 0.6);
    // headlight and grille on the nose
    p.face([[18.02, Y - 3, 7.6], [18.02, Y - 0.8, 7.6], [18.02, Y - 0.8, 9.2], [18.02, Y - 3, 9.2]], 0.32, SH.edge, 0.4);
    p.line([[18.05, -3, 6.4], [18.05, 1.6, 6.4]], SH.edge, 0.55);
    p.line([[18.05, -3, 8.2], [18.05, 1.6, 8.2]], SH.edge, 0.55);
    // arches, then the wheels turning in them
    arch(p, -11.5, WR); arch(p, 11.5, WR);
    p.pop();
    const a = -Math.PI * 2 * u * 1.5;
    wheel(p, -11.5, a); wheel(p, 11.5, a);
  },
};
