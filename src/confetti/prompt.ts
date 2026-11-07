export const CONFETTI_PROMPT = `# Add a confetti pop

Build a reusable "confetti pop" for this project, in its own stack and style. It marks a
moment that finished well (a payment went through, a task is done). Three things happen
from one element, usually a round check badge inside a card:

## 1. The element pops (720 ms, after 80 ms)
Keyframes at 0 / 34% / 56% / 76% / 100%, each step easing out (cubic-bezier(0, 0, 0.58, 1)):
- scale   0 → 1.25 → 0.92 → 1.06 → 1
- opacity 0 → 1
- blur    8px → 3px → 0
With prefers-reduced-motion: scale 0 → 1 in 150 ms, no confetti.

## 2. A glow springs in behind it and stays
- A 340 × 280 px box centred on the element, its top 96 px above the element's centre,
  transform-origin centre top, behind the content.
- background: radial-gradient(ellipse 60% 60% at 50% 10%, rgba(187,247,208,.95) 0%,
  rgba(134,239,172,.55) 40%, rgba(74,222,128,.15) 65%, transparent 85%)
- scale 0.6 → 1 and opacity 0 → 1 on a spring (visual duration 0.55 s, bounce 0.2).

## 3. Confetti bursts out, tumbles and falls (canvas physics)
- A canvas covering the card (position absolute, inset 0, z-index 20, pointer-events
  none), sized by devicePixelRatio. The card has overflow: hidden and its radius, so the
  confetti is clipped to it.
- 180 ms after the pop starts, spawn 72 pieces at the element's centre:
  - angle random 0..2π, speed 1.8 + random × 5.5 px/frame
  - vx = cos(angle) × speed, vy = sin(angle) × speed − 2.5 (a lift upwards)
  - a quarter are dots (5 to 9 px circles), the rest ribbons 4 to 12 × 9 to 17 px
  - rotation random, spin (random − 0.5) × 0.18 rad/frame
  - colours at random from #22c55e #4ade80 #86efac #bbf7d0 #fbbf24 #fde68a #f59e0b
    #ffffff #f0fdf4 #6ee7b7 #a7f3d0
- Every frame (at 60 Hz; scale by the real frame time so 120 Hz looks the same):
  vy += 0.16, vx and vy *= 0.988, move, spin. Skip pieces below the bottom.
- From 3.6 s fade every piece over 0.9 s; stop and remove the canvas at 5.2 s.

## API
- confettiPop(element, { within, colors, count, spread, gravity, duration, pop, glow })
  returns a function that stops it early.
- A component for this framework that wraps children, takes the container to clip to,
  and pops on mount and whenever a trigger value changes.
`;
