# Collapsed resolution badge cycle tasks

- [x] Update the approved prototype with collapsed badge cycling and keyboard access.
- [x] Define production cycle behavior and regression coverage.
- [x] Add accessible collapsed badge interaction using native availability and range selection.
- [x] Extend quality module checks for cycle order, 1080p floor, wrap, keyboard activation and panel state.
- [x] Run syntax and complete local verification suite.
- [x] Review final diff and record installed-player verification limitation.

## Handover

Implemented in `youtube-nerdest.user.js` version 1.2.3. The compact badge has button semantics and click/Enter/Space handlers. It filters available tiers to heights at least 1080p, starts at the highest unless the effective or requested tier is already highest, and maintains a per-video cycle cursor. `npm test` passes 104 local assertions (46 base, 1 saved-OFF startup, 12 animation, 45 quality), and `git diff --check` is clean. The isolated player adapters verify requests and event handling; installed Tampermonkey behavior remains a separate manual integration check.
