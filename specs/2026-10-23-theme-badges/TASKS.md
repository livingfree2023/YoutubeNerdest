# Theme badge tasks

- [x] Inspect user screenshot and read actual Enhancer accent/native badge styling.
- [x] Update prototype preview theme and shared production badge background fallback chain.
- [x] Verify syntax, 8 CSS declaration/preview checks and all 96 existing behavior checks.
- [x] Update documentation and ignored retrospective; present local result.
- [x] Obtain explicit user authorization to commit and push v1.2.1 to public main.
- [x] Commit, push and verify the public v1.2.1 download.

## Handover

Published v1.2.1 in commit `2494f45` after explicit user authorization. Preserved newer remote README edits, including the Greasy Fork install link, by rebasing before the normal push. Public raw source was fetched and verified for version, range-based quality controls and theme variables. Live Enhancer exposes --efyt-accent-color (#1e90ff), matching native badge/progress computed rgb(30,144,255). Both badge styles inherit that variable with native-brand-red and #f03 fallbacks. Prototype defaults to the user's blue and includes a demo theme selector. All 96 behavior checks plus 8 CSS-declaration/preview checks pass; updated-script pixel rendering remains unverified until installed.
