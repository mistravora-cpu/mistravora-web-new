# Team portraits and responsive layout

Updated 12 September 2026.

## Design and editing

- About uses large, open portraits with a background orbit, soft light and a short biography beneath a dividing line. The portrait and name both lead to the full profile; separate social links remain usable.
- Photos preserve their composition with `object-fit: contain`, in a 4:5 area. The grid uses one column on phones, two from 768px, and additional columns on screens at least 1920px wide. Individual portraits are capped at 480px; profile-page portraits at 416px on narrow layouts and 384px on desktop.
- Existing Admin → About fields still control each person's photograph, name, role, biography, expertise and links. No database migration or content replacement is needed. Existing R2 image optimization and direct external image URLs remain supported.
- Alt text and captions identify the person, role and company. The server renders this content and the existing profile structured data.

## Interaction and performance

The photo tilts and shifts with a mouse; the light and orbit move at different depths. A small client wrapper schedules at most one pending animation frame per pointer update and writes CSS variables without React state updates. It has no recurring animation loop and introduces no package dependency.

Leaving the portrait, switching tabs, losing window focus, cancelling the pointer or changing the motion preference resets the effect. Coarse pointers keep native touch scrolling. Keyboard focus has its own visual treatment, and the operating system's reduced-motion setting disables the animated interaction.

Shared responsive changes let long button labels wrap, keep form fields inside their containers, use 16px mobile field text, enlarge touch controls, and provide a scrollable navigation menu on short screens. The desktop navigation starts at 1280px to avoid crowded intermediate layouts. Existing page gutters and local scrolling for wide tables/code remain.

## Verification

- ESLint, all 86 automated tests and the production build passed. The build checked TypeScript and produced no warnings.
- The public route audit checked 61 routes at 320, 390, 768, 1024, 1280 and 1920px, at both the top and bottom of each page. All expected statuses passed, with no horizontal page overflow or uncaught JavaScript errors.
- Focused About checks covered 280, 320, 390, 640, 768, 1024, 1280, 1440, 1920 and 2560px. Portraits retained their 4:5 sizing without broken images or page overflow. At 390px, the portrait was 358px wide; at 1440px, each portrait was 480px wide.
- Browser assertions confirmed that moving the pointer changes the photo and background transforms independently, leaving resets them, and no style mutations continue while idle. Clicking the portrait opens its profile. Profile mouse effects, keyboard focus and reduced-motion behavior passed.
- The team grid had zero axe accessibility violations in light and dark themes. Focused About/profile checks logged no browser errors or warnings. Desktop, phone and individual profile screenshots were visually reviewed.
- On a simulated touch device, the menu fit a 667×320 landscape viewport, scrolled to its contact link and navigated successfully. Contact fields computed to 16px at 390px, and the portrait effect did not activate for coarse pointers.
- Lighthouse 13.4.1 on the local production About page scored **96/100 performance** with default simulated mobile throttling (150ms RTT, 1638.4Kbps throughput, 4× CPU slowdown). First contentful paint was 1.4s, largest contentful paint 2.8s, total blocking time 10ms and cumulative layout shift 0. There were no audit run warnings. This measures the local build; production latency, devices and future content can change the result.
- Headless Chromium emitted four GPU-driver `ReadPixels` diagnostics while displaying the homepage's existing WebGL robot. These are recorded separately from application errors; this update does not change the robot.

These are browser-emulation checks against the local production build, not certification for every physical device or for arbitrary future administrator-supplied content. The audit did not submit forms or modify production data.
