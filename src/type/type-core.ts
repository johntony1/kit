// type-core.ts
// The engine behind every type effect: draws your text into a texture (and a distance
// field when an effect needs outlines), runs the effect's shader on a <canvas>, and
// feeds it time, the pointer and clicks. Plain WebGL, no dependencies.
//
//   import { createType } from "./type-core";
//   import { bubble } from "./effects";
//   const fx = createType(canvas, bubble, { text: "grow" });
//   fx.fire(0.5, 0.5);
//
// Free to use in anything.

export interface Param { value: number; min: number; max: number; step: number; label: string }

export interface Effect {
  name: string;
  /** the body of a fragment shader: it must define vec4 effect(vec2 uv) */
  glsl: string;
  params: Record<string, Param>;
  /** defaults for the text and its look */
  look: Partial<TypeOptions>;
  /** build a distance field of the text (for outline effects): how far it reaches, as a share of the width */
  sdf?: number;
}

export interface TypeOptions {
  text: string;
  /** CSS font weight and family. "800", "Inter" */
  weight: string;
  family: string;
  /** letter spacing in em. -0.04 */
  tracking: number;
  /** line height in em. 0.92 */
  leading: number;
  /** how much of the width the text may fill, 0..1. 0.78 */
  fit: number;
  uppercase: boolean;
  fg: string;
  bg: string;
  /** effect params by name, overriding the effect's defaults */
  params: Record<string, number>;
}

export interface TypeFx {
  set(options: Partial<TypeOptions>): void;
  /** fire from a point, 0..1 from the top left (effects that react to it) */
  fire(x?: number, y?: number): void;
  destroy(): void;
}

const BASE: TypeOptions = {
  text: "Type", weight: "800", family: "Inter", tracking: -0.04, leading: 0.92, fit: 0.78,
  uppercase: false, fg: "#ffffff", bg: "#000000", params: {},
};

const VERT = `attribute vec2 a; varying vec2 vUv; void main() { vUv = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }`;

const HEAD = (names: string[]) => `precision highp float;
uniform sampler2D u_text;   // alpha: how much ink is at a point
uniform sampler2D u_sdf;    // r: signed distance to the letters, 0 on the edge, 1 at the reach
uniform vec2  u_res;        // canvas size in px
uniform float u_time;       // seconds
uniform vec2  u_mouse;      // 0..1, eased
uniform float u_hover;      // 0..1, eased
uniform vec3  u_fire;       // xy: where it was fired, z: when
uniform vec3  u_fg;
uniform vec3  u_bg;
${names.map((n) => `uniform float u_${n};`).join("\n")}
varying vec2 vUv;
float ink(vec2 uv) { return texture2D(u_text, uv).a; }
uniform float u_sdf8;
float sdf(vec2 uv) { float r = texture2D(u_sdf, uv).r; return u_sdf8 > 0.5 ? r * 2.0 - 1.0 : r; }   // negative inside
float aspect() { return u_res.x / u_res.y; }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
`;

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** draw the text white on transparent, as big as fits */
function drawText(cv: HTMLCanvasElement, o: TypeOptions) {
  const c = cv.getContext("2d")!;
  const w = cv.width, h = cv.height;
  c.clearRect(0, 0, w, h);
  const lines = (o.uppercase ? o.text.toUpperCase() : o.text).split("\n");
  const font = (px: number) => `${o.weight} ${px}px "${o.family}", Inter, system-ui, sans-serif`;
  c.font = font(100);
  c.letterSpacing = `${o.tracking * 100}px`;
  const widest = Math.max(...lines.map((l) => c.measureText(l).width), 1);
  let size = (w * o.fit) / widest * 100;
  size = Math.min(size, (h * 0.72) / (lines.length * o.leading));
  c.font = font(size);
  c.letterSpacing = `${o.tracking * size}px`;
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  const total = lines.length * size * o.leading;
  lines.forEach((l, i) => c.fillText(l, w / 2 + (o.tracking * size) / 2, h / 2 - total / 2 + size * o.leading * (i + 0.5) + size * 0.04));
}

/** signed distance field of the ink (Felzenszwalb): 0 on the edge, 1 at `reach` of the width */
function distanceField(src: HTMLCanvasElement, reach: number) {
  const W = 512, H = Math.max(1, Math.round((W * src.height) / src.width));
  const tmp = document.createElement("canvas");
  tmp.width = W; tmp.height = H;
  const t = tmp.getContext("2d", { willReadFrequently: true })!;
  t.drawImage(src, 0, 0, W, H);
  const a = t.getImageData(0, 0, W, H).data;
  const INF = 1e20, N = Math.max(W, H);
  const f = new Float64Array(N), d = new Float64Array(N), v = new Int32Array(N), z = new Float64Array(N + 1);
  const pass = (n: number) => {
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < n; q++) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) ** 2 + f[v[k]]; }
  };
  const edt = (inside: boolean) => {
    const g = new Float64Array(W * H);
    for (let i = 0; i < W * H; i++) g[i] = (a[i * 4 + 3] > 127) === inside ? 0 : INF;
    for (let x = 0; x < W; x++) { for (let y = 0; y < H; y++) f[y] = g[y * W + x]; pass(H); for (let y = 0; y < H; y++) g[y * W + x] = d[y]; }
    for (let y = 0; y < H; y++) { for (let x = 0; x < W; x++) f[x] = g[y * W + x]; pass(W); for (let x = 0; x < W; x++) g[y * W + x] = d[x]; }
    return g;
  };
  const outside = edt(true), inside = edt(false);
  const out = new Float32Array(W * H);
  const range = W * reach;
  // rows go bottom up, to match the flipped text texture
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    out[(H - 1 - y) * W + x] = (Math.sqrt(outside[i]) - Math.sqrt(inside[i])) / range;
  }
  return { data: out, w: W, h: H };
}

export function createType(canvas: HTMLCanvasElement, effect: Effect, options: Partial<TypeOptions> = {}): TypeFx {
  let o: TypeOptions = { ...BASE, ...effect.look, ...options, params: { ...(effect.look.params ?? {}), ...(options.params ?? {}) } };
  const names = Object.keys(effect.params);
  const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false })!;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`${effect.name}: ${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `${HEAD(names)}\n${effect.glsl}\nvoid main() { gl_FragColor = effect(vUv); }`));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const texture = (unit: number) => {
    const t = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const texText = texture(0), texSdf = texture(1);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  gl.uniform1i(U("u_text"), 0);
  gl.uniform1i(U("u_sdf"), 1);
  const u = { res: U("u_res"), time: U("u_time"), mouse: U("u_mouse"), hover: U("u_hover"), fire: U("u_fire"), fg: U("u_fg"), bg: U("u_bg") };
  const sdf8 = U("u_sdf8");
  const pu = Object.fromEntries(names.map((n) => [n, U(`u_${n}`)]));

  const textCv = document.createElement("canvas");
  const floatOk = !!gl.getExtension("OES_texture_float") && !!gl.getExtension("OES_texture_float_linear");
  const upload = () => {
    textCv.width = canvas.width; textCv.height = canvas.height;
    drawText(textCv, o);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texText);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCv);
    if (effect.sdf) {
      const f = distanceField(textCv, effect.sdf);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texSdf);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if (floatOk) gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, f.w, f.h, 0, gl.LUMINANCE, gl.FLOAT, f.data);
      else {
        // no float textures: 8 bits, coarser but still there
        const b = new Uint8Array(f.w * f.h);
        for (let i = 0; i < b.length; i++) b[i] = Math.max(0, Math.min(255, Math.round((f.data[i] * 0.5 + 0.5) * 255)));
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, f.w, f.h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, b);
      }
    }
  };

  const t0 = performance.now();
  const now = () => (still ? 1.5 : (performance.now() - t0) / 1000);
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, h: 0, th: 0 };
  let fire: [number, number, number] = [0.5, 0.5, -100];
  let raf = 0, visible = true;

  const frame = () => {
    raf = 0;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    mouse.h += (mouse.th - mouse.h) * 0.06;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, now());
    gl.uniform2f(u.mouse, mouse.x, mouse.y);
    gl.uniform1f(u.hover, mouse.h);
    gl.uniform3f(u.fire, ...fire);
    gl.uniform3f(u.fg, ...rgb(o.fg));
    gl.uniform3f(u.bg, ...rgb(o.bg));
    gl.uniform1f(sdf8, floatOk ? 0 : 1);
    for (const n of names) gl.uniform1f(pu[n], o.params[n] ?? effect.params[n].value);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (visible && !still) raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w === canvas.width && h === canvas.height) return;
    canvas.width = w; canvas.height = h;
    upload();
    wake();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); });
  io.observe(canvas);

  const at = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height] as const;
  };
  const move = (e: PointerEvent) => { [mouse.tx, mouse.ty] = at(e); mouse.th = 1; };
  const leave = () => { mouse.th = 0; };
  const down = (e: PointerEvent) => { const [x, y] = at(e); fire = [x, y, now()]; };
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerleave", leave);
  canvas.addEventListener("pointerdown", down);

  resize();
  document.fonts?.ready.then(() => { upload(); wake(); });

  return {
    set(next) {
      const text = next.text !== undefined || next.weight || next.family || next.tracking !== undefined || next.uppercase !== undefined || next.leading !== undefined || next.fit !== undefined;
      o = { ...o, ...next, params: { ...o.params, ...(next.params ?? {}) } };
      if (text) upload();
      wake();
    },
    fire(x = 0.5, y = 0.5) { fire = [x, 1 - y, now()]; wake(); },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", down);
      // free what we made, but keep the context: the same canvas may be used again
      gl.deleteTexture(texText);
      gl.deleteTexture(texSdf);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
