export const CONFETTI_PROMPT = `# Add a confetti pop

Build a reusable "confetti pop" for this project, in its own stack and style. It marks
a moment that finished well (a payment went through, a task is done, something was
liked). Three things happen at once from one element:

## 1. The element pops (720 ms, starts after 80 ms, ease-out)
Keyframes at 0 / 34% / 56% / 76% / 100%:
- scale   0 → 1.25 → 0.92 → 1.06 → 1
- opacity 0 → 1
- blur    8px → 3px → 0 → 0 → 0
With prefers-reduced-motion: only fade it in over 150 ms, no confetti, no glow.

## 2. Confetti bursts out of its centre (starts at 200 ms)
- 20 pieces by default, colours #1fc16b, #fa7319, #f5c028, #b197fc in turn.
- Each piece is 5 to 9 px by 5 to 10 px, radius 2px, or a circle when it is square
  and 6 px or less.
- Three in four fly up and out 95 to 160 px; one in four falls to the sides 45 to 95 px.
- Each one moves to its point, spins up to ±250°, shrinks to 0.35 and fades to 0,
  over 820 ms, cubic-bezier(0.1, 0.6, 0.3, 1), staggered 0 to 55 ms.
- Use the same pieces every time (seeded), so the burst looks designed.
- Draw them in a fixed, pointer-events: none layer on top of the page at the element's
  centre so no overflow: hidden clips them, and remove the layer when done.

## 3. A glow blooms behind it
- A 280 px circle, radial gradient from the glow colour (default #4ade80) to
  transparent, centred on the element and behind it.
- scale 0.5 → 1.05 → 1 → 1, opacity 0 → 0.55 → 0.45 → 0, over 1.8 s,
  cubic-bezier(0.22, 1, 0.36, 1). Remove it after.

## API
- confettiPop(element, { colors, count, spread, duration, pop, glow, glowSize })
- A component for this framework that wraps children and pops when a trigger value
  changes (and on mount unless told not to).
- Use the Web Animations API (element.animate). No libraries.
`;
