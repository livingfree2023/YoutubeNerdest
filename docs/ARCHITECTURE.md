# Architecture

`youtube-compact-stats.user.js` is the installable source, without runtime dependencies, a backend or a build step.

- **Discovery:** one filtered document observer finds inserted/removed players and stats panels. Each panel has a content observer, which ignores its own controls.
- **Read path:** parse the native numeric Kbps text, divide by 1000 and update a separate compact toolbar. No network operations.
- **Presentation:** compact stats content is absolutely positioned at intrinsic width and hidden using `visibility:hidden`, keeping chart geometry measurable without contributing to the compact overlay's size. Expansion removes those overrides. Never use `display:none` on the stats content: YouTube's zero-height fallback resizes and clears canvases without resetting their drawing cursors. Original DOM, charts, positioning and close action survive.
- **Close control:** the same custom × stays anchored at the top-left in compact and expanded layouts. The native close button remains in the DOM for delegation, hidden while enhancement is active and restored if speed parsing fails.
- **Motion:** the chevron transitions by 180°. The Web Animations API animates measured panel width and height for 220 ms without writing native inline styles. Rapid reversals measure the current visible rectangle before canceling the prior effect. Reduced-motion preferences disable animation; absent animation support falls back to immediate changes.
- **Player actions:** access the actual page player via `unsafeWindow`; use its `showVideoInfo` method for auto-show. Custom close delegates to YouTube’s native close button, with `hideVideoInfo` as a fallback.
- **Configuration:** Tampermonkey stores the `autoShowStats` boolean, default `true`; a menu command toggles it and a value listener propagates changes across tabs.
- **Lifecycle:** opening has at most 20 attempts spaced 500 ms apart, and stops when disabled, dismissed or opened. Video identity changes reset dismissal. Capture `loadedmetadata` and `yt-navigate-finish`; disconnect per-panel observers and player listeners on removal. Dispose observers and timers when leaving a non-cached page.

No standalone web app, service worker, deployment pipeline or compiled artifacts are involved. `dist/` is reserved and ignored if a build is added later. `node_modules/` contains development-only test dependencies.

The global baseline is supplied by the user and remains unmodified. Base feature decisions live in `specs/2026-10-23-compact-stats/`; motion refinements live in `specs/2026-10-23-animated-toggle/`; the chart history fix lives in `specs/2026-10-23-chart-history/`.
