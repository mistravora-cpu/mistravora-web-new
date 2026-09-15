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

## Homepage click freeze and cursor flash — 15 September 2026

The previous lifecycle changed the Three.js render loop directly while the Canvas prop stayed `frameloop="never"`. Canvas reapplies its props when React contexts or dimensions change. A theme-button click therefore reset rendering to `never`, and pointer invalidation could not restart it. A local production reproduction measured 54 rendered frames over 900 ms before the click and zero afterward, including after pointer movement and resize.

The lifecycle now updates one React state value that is passed to Canvas. Theme changes, navigation and resizing receive the current render mode. Preparation, offscreen/background suspension, reduced-motion demand rendering and context restoration still use the same lifecycle rules. The same reproduction after the fix measured 54–55 frames per 900 ms through every tested interaction.

The moving, blurred cursor backdrop has been replaced with a stationary CSS gradient. This removes its mouse listener, animation-frame loop, per-movement layout reads and large moving blur layer while keeping a readable background for the hero text. The robot still starts automatically and responds to pointer movement and clicks.

Validation: all 111 automated tests, ESLint and the production build passed. Thirty production-browser lifecycle checks across desktop and mobile passed, including theme buttons, mobile menus, cookie preferences, hero interactions, navigation to Pricing and back, resize, offscreen suspension, and reduced-motion changes. Mobile was also tested with 4× CPU throttling. No console warnings, JavaScript errors or horizontal overflow were observed. These are browser lab checks, not a physical-device frame-rate guarantee. Results: `docs/audits/robot-click-recovery.json`.
