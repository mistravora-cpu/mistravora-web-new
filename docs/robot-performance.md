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
