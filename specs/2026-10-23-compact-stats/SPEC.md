# Compact Stats for nerds

## Scope

Enhance YouTube's Stats for nerds. Start collapsed, displaying a left-side × close button, connection speed in decimal Mbps and a right-facing chevron. Expand with the chevron to show the original panel at its original dimensions, with a left-facing collapse control. Retain YouTube's native close behavior and do not change playback. The user approved the prototype and requested automatic opening with a saved on/off setting; their final instruction sets the default to ON.

## Data and behavior

- Source: live `.html5-video-info-panel-content.ytp-sfn-content` supplied by YouTube. The user's DOM sample and screenshot were checked against a real YouTube stats panel on 2026-10-23. Running the installed userscript remains a separate integration check.
- Read the Connection Speed row's numeric Kbps text, excluding injected converters and chart elements. Convert with `Mbps = Kbps / 1000`, formatted to two decimal places.
- Example: `151266 Kbps` -> `151.27 Mbps`. This differs from MB/s, which measures bytes.
- Observe panel insertion/replacement and relevant text changes; batch work and prevent self-triggered observer loops. Avoid a whole-page observer doing repeated full scans on every video update.
- Preserve and reveal the original DOM on expansion, including charts, hidden rows and native close control. Scope compact styles to the enhanced panel and never override YouTube's decision to hide/close it.
- Support fullscreen, theater mode and YouTube client-side navigation. Clean up observers for disconnected panels and avoid duplicate controls.
- Controls must work with keyboard, have accessible names, expose expanded state and not trigger player shortcuts or seek gestures.
- If the speed row is absent or unrecognized, retain the original panel instead of showing a fabricated speed.
- Auto-show defaults to ON. A Tampermonkey menu command toggles a stored boolean and cross-tab changes apply live. Turning OFF affects subsequent automatic opening; it does not close an already-open panel. Turning ON opens the current panel immediately.
- Closing either through × or the native button suppresses auto-show for the current video. A new video identity resets dismissal. Opening attempts are bounded to 20 attempts, 500 ms apart, and are also triggered by metadata load or completed YouTube navigation.
- No external requests, cookies or credentials are needed. Tampermonkey grants are limited to page-player access through `unsafeWindow` and preference/menu APIs. No backend or debug API is appropriate for this DOM-only enhancement.
- This is an injected userscript rather than a standalone web app; PWA installation and a service worker do not apply.

## Research

- Inspected the user's DOM and attached screenshot. The example includes a separate converter element that must not contaminate numeric parsing.
- Reviewed official Tampermonkey metadata documentation: https://www.tampermonkey.net/documentation.php?locale=en
- Deployment: a standalone `.user.js`, matched to desktop YouTube and top-level youtube-nocookie embeds, with no runtime dependencies. Requires Tampermonkey preference/menu APIs and `unsafeWindow` to reach the native player.
- Opened and closed Stats for nerds on a real YouTube video. Verified native selectors and the numeric Kbps span. Fetched that page's public player source and confirmed registration of `showVideoInfo`, `hideVideoInfo` and `isVideoInfoVisible`.
- Local in-app browser navigation to the test file was blocked by its URL policy. Isolated, non-networked jsdom tests run the actual script with test-only boundary adapters instead. Installed-Tampermonkey integration and browser rendering remain unverified.

## Verification plan

1. Unit: numeric conversion, zero, thousands separators, invalid/missing values; no parsing of a different row or injected MB/s label.
2. Module: supplied DOM fixture; collapse/expand restoration, numeric updates, missing rows, repeated panel replacement, no duplicate controls, bounded observer behavior. Fixtures are test-only, never shipped in production.
3. Integration: real YouTube panel in Tampermonkey; toggle, live updates, native close/reopen, navigation, fullscreen/theater and keyboard operation. Record unavailable checks honestly.

## Delivery gate

Static prototype was approved by the user before production coding. The left close control and auto-show preference were explicitly requested as refinements; auto-show ON is the final preference.
