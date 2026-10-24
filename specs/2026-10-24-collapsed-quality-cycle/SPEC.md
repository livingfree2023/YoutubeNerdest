# Collapsed resolution badge cycle

## Request

Make the compact current-resolution badge an accessible shortcut for changing quality. Cycle through the active video's available tiers from the highest tier down to 1080p; skip lower tiers and Auto. If the effective or requested tier is already highest on the first click, request the next lower tier. Otherwise start at the highest tier. Later clicks continue down the available list and wrap to its highest tier.

## Boundaries

- Reuse the existing native quality availability filtering and `setPlaybackQualityRange` request path.
- Re-read current player availability before each request; never offer or request a stale/unplayable tier.
- Keep effective resolution display separate from requested quality state.
- Leave playback state, native stats contents, charts, close behavior and the expanded quality row intact.
- Make the compact badge keyboard accessible and prevent its events from activating player gestures or the panel toggle.
- Keep the prototype and production behavior aligned.

## Verification

- Unit/module: run the existing userscript suite, extending quality checks for initial jump-to-highest, highest-to-next-lower, down-cycle/wrap, lower-tier exclusion, availability changes, keyboard activation and no player event propagation.
- Integration: installed Tampermonkey behavior remains a separate manual check; the local isolated player adapter does not claim to verify YouTube's live player.
