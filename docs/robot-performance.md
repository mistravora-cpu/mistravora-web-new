# Robot performance check — 6 September 2026

Measured the deployed homepage at https://www.mistravora.com before this change:

| Run | Performance | LCP | Blocking time | Layout shift |
|---|---:|---:|---:|---:|
| Lighthouse mobile simulation | 98 | 2.0 s | 100 ms | 0 |
| Browser throttling: 800 Kbps down, 400 Kbps up, 300 ms latency, 4× CPU slowdown | 92 | 2.6 s | 70 ms | 0 |

These are individual lab runs, not field measurements or guaranteed scores on every device. Headless Chrome used software WebGL; physical-phone GPU smoothness requires device testing. These scores are baseline measurements, not claimed improvements from the changes below. Machine-readable settings are in `audits/robot-performance.json`.

The robot's original rotation interpolation multiplied speed by frame duration. At 30 fps the head's interpolation factor was 40/30, greater than one, causing overshoot; at 10 fps it reached four. The revised exponential smoothing preserves the 60 Hz response while converging across frame rates. Position uses the same frame-independent smoothing. Regression tests cover slow-frame convergence and equivalent elapsed time across frame rates.

The cursor glow previously scheduled animation frames until floating-point values stopped changing. It now stops once the normalized distance is below 0.0001, avoiding imperceptible work after the glow settles.

Automatic 3D loading, robot geometry, shaders, resolution and click interaction are retained. Existing offscreen/background rendering suspension remains in place. This patch does not shrink the Three.js download or guarantee a higher Lighthouse score.

Validation: ESLint, all 11 tests and a Next.js production build with webpack passed. The alternative bundler is used locally because the sandbox restricts Turbopack worker ports; the production build command is unchanged.


## Interaction recovery — 2026-09-14

The canvas now shares pointer events with its hero section and computes pointer coordinates from the canvas bounds using client coordinates. Movement continues over the text and buttons. Native links remain usable and do not trigger a robot reaction. Touch release, pointer cancellation and leaving the hero return the pointer target to the centre. The global body-cursor mutation was removed.

Click reactions explicitly request frames when reduced motion uses demand rendering, including when the heart-eye timer expires. Automatic startup, offscreen suspension, shader-startup fallback, visibility handling and WebGL context restoration remain in place. A small bounded idle movement keeps the robot responsive when the pointer is stationary. Pending compilation checks its preparation generation before running after disposal/context changes.

The text backdrop uses valid theme colours and follows hero coordinates rather than percentages of its own smaller box. It stops its animation frame loop once settled.

Mobile/coarse-pointer sessions start at a device pixel ratio of 1 without multisample antialiasing; desktop keeps its existing 1–1.5 resolution range and antialiasing. This reduces GPU work without a tap-to-load gate or disabling the 3D interaction. A mobile Lighthouse trace previously attributed a 320 ms main-thread commit stall to a matching GPU task.

Small-screen/coarse-pointer sessions also use diffuse lighting for the chassis and simpler flat materials for the dark face and small ear details; desktop retains the original physically based materials. The geometry, colour texture, pointer response and click animation are shared. The radial text backdrop supplies its own soft fade on phones, avoiding the extra large blur filter.
