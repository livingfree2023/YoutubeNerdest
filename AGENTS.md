# YoutubeNerdest

Tampermonkey enhancement for YouTube Stats for nerds.

- Follow the user's read-only global engineering baseline; never modify it.
- Base feature: `specs/2026-10-23-compact-stats/`.
- Animated toggle and close refinement: `specs/2026-10-23-animated-toggle/`.
- Current fix: `specs/2026-10-23-chart-history/`.
- Update metadata and distribution: `specs/2026-10-23-auto-update/`.
- Approved resolution switcher: `specs/2026-10-23-resolution-switcher/`.
- Enhancer theme badge compatibility: `specs/2026-10-23-theme-badges/`.
- Static preview: `docs/prototype/compact-stats.html`.
- Obtain visual approval before production implementation.
- Read the existing stats DOM; do not request external data or alter playback.
- Never replace YouTube's original stats contents; restore its original layout when expanded.
- Generated output belongs in ignored `dist/`; local retrospective posts belong in ignored `blog/`.
