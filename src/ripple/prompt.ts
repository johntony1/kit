import { RIPPLE_SHADER } from "./ripple";

export const PROMPT = `# Add a ripple distortion effect

Build a reusable ripple distortion effect for this project, in its own stack and style.
When it fires, an electric ring bursts out of a point, bends whatever is under it,
splits its colours at the edge and leaves a glow that fades. It is used to say
"something just happened" (a code is ready, a payment went through, a song started).

## How it works
- Draw the content (an image, a canvas, a video frame) as a texture on a full size
  WebGL quad in a <canvas> that sits exactly where the content was. No libraries.
- Size the canvas to its CSS size times devicePixelRatio (cap at 2), and keep it in
  sync with a ResizeObserver.
- Up to 6 ripples at once. Each one is a point (0..1 from the top left, flip Y for
  the texture) and a start time. A ripple lives 2.5 s, then it is dropped.
- Only run requestAnimationFrame while a ripple is alive and the canvas is on screen
  (IntersectionObserver). Idle, draw one frame and stop.
- Multiply the distance by the aspect ratio so rings stay round on any shape, and
  divide the push by it again.

## The motion, exactly
- Ring radius eases out: radius = 0.75 * (1 - exp(-3.2 * age)). It bursts, then slows.
- Fade: exp(-age * 0.85).
- The effect lives in a band around the ring: half width 0.10,
  smoothstep(-0.28, -0.015, d) * (1 - smoothstep(0.015, 0.28, d)), d = dist - radius.
- Four waves layered so the edge shimmers instead of being a clean ring
  (frequency 26, t = time in seconds, a = angle around the point):
    sin(dist*26 - t*9)
    sin(dist*26*1.37 - t*14) * 0.65
    sin(dist*26*0.61 + a*5 - t*6.5) * 0.60
    sin(dist*26*2.10 - a*3 - t*18) * 0.35
  summed and divided by 2.6.
- Push pixels 72% outward and 28% sideways (a swirl), times wave * band * fade * 0.045.
- Colour split: sample red at +push*0.6*0.01 and blue at the opposite side.
- Glow: (band * (abs(wave)*0.5 + 0.5) * 0.55 + core² * 1.1) * fade, where
  core = 1 - smoothstep(0, 0.05, abs(d)). Add glow * 2.8 * glowColor on top.
  glowColor is the brand colour scaled so its strongest channel is 1.2 (it blooms).
  Default #1d9fff.

## API
- fire(x?, y?) from the centre by default, set(options) live, refresh(source?) after
  the source is redrawn, destroy(). A "live" option re-reads the source every frame
  for video.
- A component for this framework that takes src or source, width, height, radius,
  fireOn ("click" fires at the pointer, "hover", "none") and a trigger number that
  fires from the centre when it changes.

## Care
- prefers-reduced-motion: show the content, never fire.
- No WebGL: draw the source on a 2D canvas so the content is still there.
- Cross-origin images need crossOrigin = "anonymous" and CORS, or the texture fails.

## The fragment shader to use
\`\`\`glsl
${RIPPLE_SHADER}
\`\`\`
`;
