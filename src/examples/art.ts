// Everything the examples ripple is drawn here, in code, so there are no images to load.

export function paper(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cv = document.createElement("canvas");
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const c = cv.getContext("2d")!;
  c.scale(dpr, dpr);
  draw(c, w, h);
  return cv;
}

const FONT = `"Geist", -apple-system, system-ui, sans-serif`;
const MONO = `"Geist Mono", ui-monospace, Menlo, monospace`;

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

function blob(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}

/** a payment card, dark, with a chip and a contactless mark */
export function drawCard(c: CanvasRenderingContext2D, w: number, h: number, paid: boolean) {
  const g = c.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#1b1d22");
  g.addColorStop(1, "#0b0c0f");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  blob(c, w * 0.85, h * 0.1, w * 0.55, "rgba(70,110,255,.35)");
  blob(c, w * 0.1, h * 1.1, w * 0.5, "rgba(140,90,255,.22)");

  // chip
  const cg = c.createLinearGradient(24, 70, 70, 104);
  cg.addColorStop(0, "#e9d6a3");
  cg.addColorStop(1, "#a88b4f");
  c.fillStyle = cg;
  rr(c, 24, h * 0.36, 42, 32, 7);
  c.fill();
  c.strokeStyle = "rgba(0,0,0,.25)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(24, h * 0.36 + 16); c.lineTo(66, h * 0.36 + 16);
  c.moveTo(45, h * 0.36); c.lineTo(45, h * 0.36 + 32);
  c.stroke();

  // contactless
  c.strokeStyle = "rgba(255,255,255,.7)";
  c.lineWidth = 2;
  c.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.arc(80 + 2, h * 0.36 + 16, 6 + i * 5, -0.7, 0.7);
    c.stroke();
  }

  c.fillStyle = "rgba(255,255,255,.92)";
  c.font = `500 15px ${FONT}`;
  c.fillText("Studio", 24, 36);
  c.font = `400 17px ${MONO}`;
  c.fillText("4417  1234  5678  9113", 24, h * 0.74);
  c.font = `500 11px ${FONT}`;
  c.fillStyle = "rgba(255,255,255,.55)";
  c.fillText("ADA OKAFOR", 24, h - 22);
  c.fillText("09 / 29", w - 72, h - 22);

  // two rings, the brand mark
  c.globalAlpha = 0.9;
  c.fillStyle = "#ff5f1f";
  c.beginPath(); c.arc(w - 50, 34, 13, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#ffb000";
  c.globalCompositeOperation = "lighter";
  c.beginPath(); c.arc(w - 34, 34, 13, 0, Math.PI * 2); c.fill();
  c.globalCompositeOperation = "source-over";
  c.globalAlpha = 1;

  if (paid) {
    c.fillStyle = "rgba(70,200,120,.16)";
    rr(c, w - 92, h * 0.36 + 2, 68, 26, 13);
    c.fill();
    c.fillStyle = "#5fe39a";
    c.font = `600 12px ${FONT}`;
    c.fillText("Paid", w - 70, h * 0.36 + 19);
  }
}

/** album art: soft colour fields with a title */
export function drawAlbum(c: CanvasRenderingContext2D, w: number, h: number, hue: number) {
  c.fillStyle = `hsl(${hue} 55% 12%)`;
  c.fillRect(0, 0, w, h);
  blob(c, w * 0.3, h * 0.35, w * 0.7, `hsla(${hue + 20} 90% 60% / .9)`);
  blob(c, w * 0.8, h * 0.75, w * 0.6, `hsla(${hue - 60} 90% 55% / .8)`);
  blob(c, w * 0.75, h * 0.15, w * 0.35, `hsla(${hue + 80} 100% 75% / .7)`);
  // grain
  const d = c.getImageData(0, 0, c.canvas.width, c.canvas.height);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n;
  }
  c.putImageData(d, 0, 0);
  c.fillStyle = "rgba(255,255,255,.95)";
  c.font = `600 22px ${FONT}`;
  c.fillText("Slow Light", 20, h - 44);
  c.font = `400 13px ${FONT}`;
  c.fillStyle = "rgba(255,255,255,.7)";
  c.fillText("Harbour", 20, h - 22);
}

/** an avatar: a simple drawn face on a colour field */
export function drawAvatar(c: CanvasRenderingContext2D, w: number, h: number, hue: number) {
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `hsl(${hue} 80% 78%)`);
  g.addColorStop(1, `hsl(${hue + 30} 70% 62%)`);
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  const cx = w / 2;
  // shoulders
  c.fillStyle = `hsl(${hue + 180} 30% 22%)`;
  c.beginPath();
  c.ellipse(cx, h * 1.02, w * 0.38, h * 0.3, 0, Math.PI, 0);
  c.fill();
  // neck and head
  c.fillStyle = "#c98a63";
  c.fillRect(cx - w * 0.07, h * 0.52, w * 0.14, h * 0.18);
  c.beginPath();
  c.ellipse(cx, h * 0.42, w * 0.17, h * 0.2, 0, 0, Math.PI * 2);
  c.fill();
  // hair
  c.fillStyle = "#1e1714";
  c.beginPath();
  c.ellipse(cx, h * 0.31, w * 0.2, h * 0.13, 0, Math.PI, 0);
  c.fill();
  c.beginPath();
  c.arc(cx - w * 0.15, h * 0.34, w * 0.07, 0, Math.PI * 2);
  c.arc(cx + w * 0.15, h * 0.34, w * 0.07, 0, Math.PI * 2);
  c.fill();
}

/** a boarding pass */
export function drawTicket(c: CanvasRenderingContext2D, w: number, h: number, scanned: boolean) {
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, w, h);
  c.fillStyle = "#0f1115";
  c.font = `500 11px ${FONT}`;
  c.fillStyle = "#8a8f98";
  c.fillText("FROM", 22, 30);
  c.fillText("TO", w - 60, 30);
  c.fillStyle = "#0f1115";
  c.font = `600 34px ${FONT}`;
  c.fillText("LOS", 22, 66);
  c.textAlign = "right";
  c.fillText("LHR", w - 22, 66);
  c.textAlign = "left";
  // the route
  c.strokeStyle = "#d4d7dd";
  c.setLineDash([3, 4]);
  c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(100, 54); c.lineTo(w - 100, 54); c.stroke();
  c.setLineDash([]);
  c.fillStyle = "#0f1115";
  c.font = `14px ${FONT}`;
  c.textAlign = "center";
  c.fillText("✈", w / 2, 59);
  c.textAlign = "left";

  const cols = [["GATE", "B14"], ["SEAT", "21A"], ["BOARDS", "06:40"]];
  cols.forEach(([k, v], i) => {
    const x = 22 + i * ((w - 44) / 3);
    c.fillStyle = "#8a8f98"; c.font = `500 10px ${FONT}`; c.fillText(k, x, 100);
    c.fillStyle = "#0f1115"; c.font = `600 16px ${FONT}`; c.fillText(v, x, 120);
  });

  // tear line
  c.strokeStyle = "#e3e5e9";
  c.setLineDash([4, 4]);
  c.beginPath(); c.moveTo(0, 142); c.lineTo(w, 142); c.stroke();
  c.setLineDash([]);

  // barcode
  let x = 22;
  let seed = 7;
  while (x < w - 22) {
    seed = (seed * 9301 + 49297) % 233280;
    const bw = 1 + (seed % 3);
    c.fillStyle = scanned ? "#16a34a" : "#0f1115";
    c.fillRect(x, 160, bw, h - 186);
    x += bw + 1 + ((seed >> 3) % 3);
  }
  c.fillStyle = "#8a8f98";
  c.font = `500 10px ${MONO}`;
  c.fillText(scanned ? "SCANNED  06:31" : "BA 0075  ·  ADA OKAFOR", 22, h - 10);
}

/** a landscape at dusk, for the pointer demo */
export function drawDusk(c: CanvasRenderingContext2D, w: number, h: number) {
  const sky = c.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1a1b3a");
  sky.addColorStop(0.5, "#6b3f7a");
  sky.addColorStop(0.75, "#f08a5d");
  sky.addColorStop(1, "#f6c27a");
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);
  blob(c, w * 0.62, h * 0.62, h * 0.5, "rgba(255,210,150,.55)");
  c.fillStyle = "#ffe2b0";
  c.beginPath(); c.arc(w * 0.62, h * 0.64, h * 0.09, 0, Math.PI * 2); c.fill();
  // stars
  let s = 3;
  c.fillStyle = "rgba(255,255,255,.8)";
  for (let i = 0; i < 60; i++) {
    s = (s * 16807) % 2147483647;
    const x = (s % 1000) / 1000 * w;
    s = (s * 16807) % 2147483647;
    const y = (s % 1000) / 1000 * h * 0.4;
    c.fillRect(x, y, 1.2, 1.2);
  }
  const ridge = (base: number, amp: number, color: string, k: number) => {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      const y = base + Math.sin(x * 0.011 * k) * amp + Math.sin(x * 0.027 * k + 1.3) * amp * 0.45;
      c.lineTo(x, h * y / 100 + 0);
    }
    c.lineTo(w, h);
    c.fill();
  };
  ridge(68, 4, "#7a3f63", 1);
  ridge(76, 3.5, "#4a2849", 1.4);
  ridge(86, 3, "#24152b", 0.8);
}
