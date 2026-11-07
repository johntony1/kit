import type { Effect } from "./type-core";

/** a prompt any coding agent can build the effect from, in its own stack */
export function typePrompt(e: Effect, desc: string) {
  const look = e.look;
  const params = Object.entries(e.params).map(([k, p]) => `- ${p.label} (u_${k}): ${p.value}, range ${p.min} to ${p.max}`).join("\n");
  return `# Add the "${e.name}" type effect

${desc}

Build it as a reusable component in this project's stack and style. It is a WebGL
fragment shader that runs over a texture of the text. No libraries.

## How it works
1. Draw the text on a 2D canvas the size of the element times devicePixelRatio (cap 2):
   white on transparent, centred, as large as fits ${Math.round((look.fit ?? 0.78) * 100)}% of the width and
   72% of the height. Font ${look.weight ?? "800"} ${look.family ?? "Inter"}, letter spacing ${look.tracking ?? -0.04}em,
   line height ${look.leading ?? 0.92}${look.uppercase ? ", uppercase" : ""}. Wait for document.fonts.ready and redraw.
2. Upload it as a texture (flip Y). ink(uv) is its alpha: how much letter is at a point.${e.sdf ? `
3. Also build a signed distance field of the letters (an exact Euclidean distance
   transform, like Felzenszwalb's, inside and outside), 0 on the edge, negative inside,
   1 at ${e.sdf} of the width away. Upload it as a float texture (OES_texture_float +
   OES_texture_float_linear), with an 8 bit fallback. sdf(uv) reads it.` : ""}
${e.sdf ? "4" : "3"}. Draw a full screen quad with the shader below every frame while it is on screen
   (IntersectionObserver), and pass: u_res (px), u_time (s), u_mouse (0..1, eased 8% a
   frame), u_hover (0..1, eased), u_fire (xy of the last click in 0..1, z its time),
   u_fg and u_bg (colours), and one float uniform per setting.
${e.sdf ? "5" : "4"}. prefers-reduced-motion: draw one still frame at t = 1.5 s.

## Defaults
- Text "${(look.text ?? "").replace(/\n/g, "\\n")}", colour ${look.fg}, background ${look.bg}
${params}

## The shader (helpers it expects)
\`\`\`glsl
float ink(vec2 uv);          // texture alpha
float sdf(vec2 uv);          // signed distance, if used
float aspect();              // u_res.x / u_res.y
float hash(vec2 p);          // fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453)
${e.glsl.trim()}
\`\`\`
`;
}
