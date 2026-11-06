// ripple.ts
// Ripple distortion: an electric ring that bursts out of a point, bends whatever
// is under it, splits its colours and leaves a glow. Plain WebGL, no dependencies.
//
//   const ripple = createRipple(canvas, image, { glowColor: "#1d9fff" });
//   ripple.fire();            // from the centre
//   ripple.fire(0.2, 0.8);    // from a point, 0..1 from the top left
//
// The source can be an <img>, a <canvas>, a <video> or an ImageBitmap.
// Free to use in anything. https://qr-code-animatio.vercel.app

export interface RippleOptions {
  /** how far pixels are pushed. 0.045 */
  intensity?: number;
  /** rings per unit of distance. 26 */
  frequency?: number;
  /** how far the ring travels before it stops, in 0..1 of the short side. 0.75 */
  reach?: number;
  /** how fast it bursts out, then slows down. 3.2 */
  burst?: number;
  /** how fast it fades. 0.85 */
  fade?: number;
  /** colour split at the edge of the ring. 0.01 */
  aberration?: number;
  /** strength of the glow. 2.8 */
  glow?: number;
  /** glow colour, any #rrggbb. "#1d9fff" */
  glowColor?: string;
  /** seconds a ripple lives. 2.5 */
  duration?: number;
  /** re-read the source every frame (a video or an animated canvas). false */
  live?: boolean;
}

export interface Ripple {
  /** fire a ripple from x, y (0..1 from the top left). Defaults to the centre. */
  fire(x?: number, y?: number): void;
  /** change any option, it takes effect on the next frame */
  set(options: RippleOptions): void;
  /** swap the source, or call with no argument after you redraw it */
  refresh(source?: TexImageSource): void;
  /** match the canvas to its CSS size (called for you on resize) */
  resize(): void;
  destroy(): void;
}

export const RIPPLE_DEFAULTS: Required<RippleOptions> = {
  intensity: 0.045,
  frequency: 26,
  reach: 0.75,
  burst: 3.2,
  fade: 0.85,
  aberration: 0.01,
  glow: 2.8,
  glowColor: "#1d9fff",
  duration: 2.5,
  live: false,
};

const MAX = 6;

const VERT = `
attribute vec2 a_pos;
varying vec2 vUv;
void main() {
  vUv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

export const RIPPLE_SHADER = `precision highp float;

uniform sampler2D u_texture;
uniform float u_time;
uniform vec2  u_aspect;              // (w/h, 1) or (1, h/w): keeps rings round
uniform vec2  u_pos[${MAX}];
uniform float u_start[${MAX}];
uniform int   u_count;
uniform float u_intensity;
uniform float u_frequency;
uniform float u_reach;
uniform float u_burst;
uniform float u_fade;
uniform float u_aberration;
uniform float u_glow;
uniform vec3  u_glowColor;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 disp = vec2(0.0);
  float glow = 0.0;

  for (int i = 0; i < ${MAX}; i++) {
    if (i >= u_count) break;
    float age = u_time - u_start[i];
    if (age < 0.0) continue;

    vec2 diff = (uv - u_pos[i]) * u_aspect;
    float dist = length(diff);
    if (dist < 0.001) continue;

    // ease out: the ring bursts from the point, then slows to a stop
    float radius = u_reach * (1.0 - exp(-u_burst * age));
    float edge = dist - radius;
    float fade = exp(-age * u_fade);

    // the band around the ring where the effect lives
    float hw = 0.10;
    float band = smoothstep(-hw * 2.8, -hw * 0.15, edge)
               * (1.0 - smoothstep(hw * 0.15, hw * 2.8, edge));

    // four waves at different speeds and angles, so the edge shimmers
    float angle = atan(diff.y, diff.x);
    float v1 = sin(dist * u_frequency        - u_time * 9.0);
    float v2 = sin(dist * u_frequency * 1.37 - u_time * 14.0) * 0.65;
    float v3 = sin(dist * u_frequency * 0.61 + angle * 5.0 - u_time * 6.5) * 0.60;
    float v4 = sin(dist * u_frequency * 2.10 - angle * 3.0 - u_time * 18.0) * 0.35;
    float wave = (v1 + v2 + v3 + v4) / 2.6;

    // push outwards with a little swirl, so the ring writhes
    vec2 outward = diff / dist;
    vec2 swirl = vec2(-diff.y, diff.x) / dist;
    disp += (outward * 0.72 + swirl * 0.28) * wave * band * fade * u_intensity;

    // a bright core on the ring, and a glow that flickers with the wave
    float core = 1.0 - smoothstep(0.0, hw * 0.5, abs(edge));
    glow += (band * (abs(wave) * 0.5 + 0.5) * 0.55 + core * core * 1.1) * fade;
  }

  disp /= u_aspect;
  vec2 split = disp * 0.6 * u_aberration;

  float r = texture2D(u_texture, clamp(uv + disp + split, 0.0, 1.0)).r;
  vec4  c = texture2D(u_texture, clamp(uv + disp,         0.0, 1.0));
  float b = texture2D(u_texture, clamp(uv + disp - split, 0.0, 1.0)).b;

  vec3 light = glow * u_glow * u_glowColor;
  vec3 rgb = vec3(r, c.g, b) * c.a + light;
  float a = clamp(max(c.a, max(light.r, max(light.g, light.b))), 0.0, 1.0);
  gl_FragColor = vec4(min(rgb, vec3(1.0)), a);
}`;

/** #rrggbb to an overbright colour: the strongest channel becomes 1.2, so every hue blooms */
function glowRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const s = 1.2 / Math.max(c[0], c[1], c[2], 0.001);
  return [c[0] * s, c[1] * s, c[2] * s];
}

/** the fallback: the source drawn on a plain 2D canvas, no effect */
function flat(canvas: HTMLCanvasElement, source: TexImageSource): Ripple {
  const ctx = canvas.getContext("2d");
  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    try { ctx?.drawImage(source as CanvasImageSource, 0, 0, canvas.width, canvas.height); } catch { /* not ready */ }
  };
  draw();
  return { fire() {}, set() {}, refresh: (s) => { if (s) source = s; draw(); }, resize: draw, destroy() {} };
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "ripple: shader error");
  return sh;
}

export function createRipple(canvas: HTMLCanvasElement, source: TexImageSource, options: RippleOptions = {}): Ripple {
  const o = { ...RIPPLE_DEFAULTS, ...options };
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  const still = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  let vs: WebGLShader | null = null, fs: WebGLShader | null = null, prog: WebGLProgram | null = null;
  try {
    if (!gl) throw new Error("ripple: no WebGL");
    vs = compile(gl, gl.VERTEX_SHADER, VERT);
    fs = compile(gl, gl.FRAGMENT_SHADER, RIPPLE_SHADER);
    prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "ripple: link error");
  } catch (err) {
    // no WebGL, or the shader failed: show the content flat so nothing disappears
    console.warn(err);
    return flat(canvas, source);
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const U = {
    time: u("u_time"), aspect: u("u_aspect"), pos: u("u_pos"), start: u("u_start"), count: u("u_count"),
    intensity: u("u_intensity"), frequency: u("u_frequency"), reach: u("u_reach"), burst: u("u_burst"),
    fade: u("u_fade"), aberration: u("u_aberration"), glow: u("u_glow"), glowColor: u("u_glowColor"),
  };
  gl.uniform1i(u("u_texture"), 0);

  const ripples: { x: number; y: number; t: number }[] = [];
  const pos = new Float32Array(MAX * 2);
  const start = new Float32Array(MAX).fill(-999);
  const t0 = performance.now();
  let raf = 0;
  let visible = true;

  const upload = () => {
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    } catch {
      /* a video with no frame yet, or a cross-origin image without CORS */
    }
  };

  const frame = () => {
    raf = 0;
    const t = (performance.now() - t0) / 1000;
    while (ripples.length && t - ripples[0].t > o.duration) ripples.shift();
    if (o.live) upload();

    for (let i = 0; i < MAX; i++) {
      const r = ripples[i];
      pos[i * 2] = r ? r.x : 0.5;
      pos[i * 2 + 1] = r ? r.y : 0.5;
      start[i] = r ? r.t : -999;
    }
    const w = canvas.width, h = canvas.height;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(U.aspect, w >= h ? w / h : 1, w >= h ? 1 : h / w);
    gl.uniform1f(U.time, t);
    gl.uniform2fv(U.pos, pos);
    gl.uniform1fv(U.start, start);
    gl.uniform1i(U.count, ripples.length);
    gl.uniform1f(U.intensity, o.intensity);
    gl.uniform1f(U.frequency, o.frequency);
    gl.uniform1f(U.reach, o.reach);
    gl.uniform1f(U.burst, o.burst);
    gl.uniform1f(U.fade, o.fade);
    gl.uniform1f(U.aberration, o.aberration);
    gl.uniform1f(U.glow, o.glow);
    gl.uniform3f(U.glowColor, ...glowRgb(o.glowColor));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // only keep drawing while something moves and it is on screen
    if (visible && (ripples.length || o.live)) raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    wake();
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); });
  io.observe(canvas);

  upload();
  resize();

  return {
    fire(x = 0.5, y = 0.5) {
      if (still) return;
      ripples.push({ x, y: 1 - y, t: (performance.now() - t0) / 1000 });
      if (ripples.length > MAX) ripples.shift();
      wake();
    },
    set(next) { Object.assign(o, next); wake(); },
    refresh(next) { if (next) source = next; upload(); wake(); },
    resize,
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
