# Performance verification

Tested against a local production build with Next.js 16.3.4, React 19.2.4, Lighthouse 13.4.1, and Chromium 1243 on macOS. Automatic Three.js robot loading remains enabled on every connection. No audit-specific rendering or user-agent detection was added.

The complete measurements are in [performance-summary.json](audits/performance-summary.json). Both simulated and browser-applied network throttling are retained; their scores are not interchangeable.

## Results

| Page / profile | Performance | LCP | Total blocking time |
|---|---:|---:|---:|
| Homepage, default mobile simulation | 95 | 2.85 s | 66 ms |
| Homepage, stricter 800 Kbps simulation | 78 | 5.62 s | 51 ms |
| Homepage, actual 800 Kbps browser (three runs) | 99 / 99 / 99 | 1.60 s | 60–62 ms |
| Contact, actual 800 Kbps browser | 99 | 1.70 s | 11 ms |
| Pricing, actual 800 Kbps browser | 98 | 1.80 s | 12 ms |

The >85 target is met in default mobile simulation and the measured actual 800 Kbps browser profile. **It is not met in the stricter 800 Kbps simulation.** Its estimated LCP remains the limiting metric; the results do not justify a universal >85 claim.

A final default-mobile check after the footer touch-target correction scored **96 performance, 100 accessibility, 100 best practices, and 100 SEO**; see [the final report](audits/final-mobile.report.html).

## Profiles

- **Default Lighthouse mobile:** simulated Slow 4G, 150 ms RTT, 1,638.4 Kbps throughput, 4× CPU slowdown.
- **Stricter simulated mobile:** 300 ms RTT, 800 Kbps throughput, 4× CPU slowdown.
- **Actual browser throttling:** DevTools-applied 300 ms request latency, 800 Kbps download, 400 Kbps upload, 4× CPU slowdown. Three independent homepage runs, plus contact and pricing.

Intermittent Supabase refresh timeouts were observed during verification. The cache fix preserves successful snapshots when refreshes fail; it does not remove the underlying network/database availability issue. Those diagnostics remain visible.

The localhost origin excludes real hosting/CDN latency and regional database latency. Chromium used software WebGL with `--enable-unsafe-swiftshader`. Scores do not establish field Core Web Vitals or promise performance on every device or arbitrarily slow connection. Repeat the audits against the deployed domain before treating them as production measurements.

## Changes

- Removed unused Three.js helpers and dead components; isolated the automatic robot bundle.
- Prepared shaders asynchronously where supported, with a capability-checked fallback. Paused rendering when the canvas is offscreen or the tab is hidden.
- Kept visible content in server-rendered HTML and replaced many reveal observers with one shared observer.
- Used cached public database reads without authentication refreshes on marketing pages. Failed database refreshes now reject instead of caching empty content.
- Removed unnecessary header/hero route prefetches competing with the current page.
- Used optional font display to prevent delayed font swaps moving the hero. Geist remains preloaded; very slow first visits can use the adjusted fallback font until a later navigation.
- Lazy-loaded below-fold client logos and fixed image dimensions.
- Gated marketing scripts behind consent and removed duplicate loaders.
- Updated Next.js and its image dependencies together; npm audit reported zero vulnerabilities at verification time.

## Repeat the checks

Run a production build and server first:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3100
```

With Lighthouse 13.4.1 and Chrome installed, in a second terminal:

```sh
CHROME_PATH=/absolute/path/to/chrome LIGHTHOUSE_CLI=/absolute/path/to/lighthouse node scripts/run-performance-audits.mjs
```

Set `AUDIT_URL` to test another origin. The runner performs each audit sequentially and writes JSON, HTML, and summary files to `docs/audits`. Avoid concurrent builds or other browser tests while measuring.

`lighthouserc.cjs` provides an optional Lighthouse CI budget: three runs each for home/contact/pricing under actual 800 Kbps browser throttling, with median performance at least 86. Install Lighthouse CI separately to run `lhci autorun`; it is not a production dependency or an enabled deployment gate.

For functional checks, `npm test` covers consent, script syntax, unsubscribe signatures, JSON-LD safety, social metadata fallbacks, and failed database reads. `npm run audit:content` checks every sitemap URL. `scripts/smoke-public-site.mjs` uses Playwright to verify mobile rendering, automatic canvas creation, consent controls, public routes, a real 404, and dashboard authentication. `PLAYWRIGHT_MODULE` can point to an external Playwright installation.

The browser smoke report retains software-GPU ReadPixels diagnostics from screenshot capture and the deliberately requested 404. It reported no application JavaScript exceptions. The unsupported parallel-shader-extension warning was addressed through capability detection, not console suppression.
