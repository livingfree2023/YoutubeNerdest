# Preserve native chart history across collapse

## Report and verified cause

User reports that the three native charts resume drawing from the middle after expansion. Version 1.1.1 applies `display:none` to native stats children in compact mode.

Inspected the [public player source](https://www.youtube.com/s/player/cbcfbf2f/player_es6.vflset/en_US/base.js) referenced by the previously verified live page (fetched 2026-10-23). The horizon-chart updater reads `element.clientHeight || 24` and assigns canvas height whenever that measurement changes. Canvas height assignment clears its bitmap. The chart cursor uses a 150-sample circular index and is not reset by height changes.

An isolated probe executed the actual extracted chart updater with controlled geometry: `display:none` produced a 24→11 canvas-height transition while the index advanced from 75 to 77; `visibility:hidden` kept height 11→11. This confirms the zero-height mechanism; it is not an installed-Tampermonkey rendering test.

## Fix

- Keep native stats content laid out while collapsed: `visibility:hidden`, `pointer-events:none`, absolute positioning and intrinsic full width. Remove the blanket `display:none` rule.
- Absolute positioning removes its contribution to the compact panel's size; hidden content remains non-interactive. Do not override individual row visibility, chart styles, canvas attributes or drawing state.
- Keep the native close button hidden only while the custom close is usable. Retain existing native fallback and cleanup behavior.
- Preserve original canvas nodes and the live updater. Do not clear/redraw charts or reset native history.
- The static prototype has illustrative bars, not YouTube's renderer. Its appearance remains unchanged; no new layout approval is needed.

## Tests

- Unit/research: real updater probe confirms height-reset cause and visibility-based solution.
- Module: original content retains a layout box, hidden and out of flow; canvas identity/attributes survive repeated toggles; fallback restores content visibility and position. Existing settings, dismissal and animation checks must pass.
- Integration: verify real installed script across collapse/expand after history accumulates; still unavailable in the current extension-less session. Do not claim canvas rendering from jsdom.
