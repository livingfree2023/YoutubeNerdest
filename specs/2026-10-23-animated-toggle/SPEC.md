# Animated stats toggle

## Requested behavior

The user requests a 180-degree rotation of the chevron in expanded mode, another click returning to the minimal speed panel, and animated expansion and collapse. This refines the previously approved layout; no new layout approval is required. Update the existing static prototype first, then the userscript.

## Implementation

- Use a CSS transition between chevron angles 45° and 225°, a positive 180° rotation. Return to 45° on collapse.
- Measure the visible panel rectangle, cancel an existing size animation, switch layout and measure the target rectangle. Animate width and height for 220 ms with easing and clipped overflow using the Web Animations API.
- Native dimensions and inline styles are not overwritten. Animation effects expire naturally without fixing the expanded size, so fullscreen/theater sizing remains native after completion.
- Rapid repeated clicks begin at the current visible rectangle. Cancel animation on custom close, removal, invalid speed data and page teardown.
- Honor `prefers-reduced-motion: reduce` with immediate size/chevron updates. Use an immediate fallback if the animation API is unavailable or the panel has no measurable rectangle.
- No network, configuration or player API changes.

## Fixed close refinement

The user requested that the custom left × replace the original [x] in both states without moving. Anchor the custom button at top 2 px / left 4 px relative to the panel in either state. Keep the expanded toolbar across the panel with the chevron on the right; only the speed label hides. Preserve the native button in the DOM for delegation, but hide it while enhancement is active. If speed cannot be parsed, restore the native button with the rest of the native fallback. Update both prototype and userscript (v1.1.1).

## Verification

- Unit: verify target angle and animation duration; reduced-motion and absent-animation fallbacks.
- Module: use the real userscript with test-only animation/geometry adapters, checking both directions, rapid reversal, cleanup, original inline styles and DOM identity.
- Integration: existing module suite must pass. Browser rendering/Tampermonkey checks remain unverified due to the previously documented local browser URL-policy restriction and unavailable installed extension session. Do not claim visual testing from DOM adapters.
