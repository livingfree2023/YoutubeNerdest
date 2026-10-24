# Verification

Run `npm ci --ignore-scripts` and `npm test` from the repository root. Node.js 18+ is required by the development dependency.

`tests/run.cjs` executes the actual userscript in jsdom, with test-only Tampermonkey and player adapters in `tests/browser.html`. No external resources are loaded. These adapters must never be copied into the production script.

Checks cover numeric conversion, original DOM/chart preservation, compact and expanded layout properties, left close delegation, live updates and fallback, settings persistence and cross-tab changes, dismissal across videos, player/panel replacement, native visibility and bounded observer updates. jsdom checks CSS properties and DOM behavior; it does not verify browser rendering or trusted keyboard events.

The suite passes 96 assertions: 46 base module checks, one saved-OFF startup check, 12 animation checks and 37 quality checks. These include measurable but invisible compact content, intrinsic width outside layout flow, untouched canvas attributes and identity, fixed close anchoring, hidden native close in both states, expanded dismissal and native-close recovery on fallback. Test-only geometry and animation adapters verify both size targets, rapid reversal, cleanup, native style preservation and reduced-motion/API-absence fallbacks. They do not render actual animation frames.

`tests/quality.cjs` runs the actual script with isolated player adapters. It checks native range requests, Auto reset, available and unplayable tiers, 8K mapping, requested-versus-effective status, current/portrait/unusual resolution parsing, compact integer Mbps, stale clicks, API failures, resizing, native settings changes, immediate navigation refresh, bounded mutations and cleanup.

## Real integration evidence

On 2026-10-23, opened a real YouTube watch page, opened Stats for nerds from its context menu, inspected its native DOM and closed it through the native button. The current panel includes `.html5-video-info-panel`, `.html5-video-info-panel-content` and `.ytp-sfn-close`; the connection row contains a dedicated numeric Kbps span.

Fetched the public player JavaScript referenced by that page. It registers `showVideoInfo`, `hideVideoInfo` and `isVideoInfoVisible`; its native menu uses those methods. The downloaded research copy was temporary and is not part of the project.

For the reported chart issue, fetched that public player source again and inspected its actual horizon-chart updater. It uses `clientHeight || 24`, writes canvas height on measurement changes and retains its circular sample index. An isolated probe executed only the extracted updater with controlled geometry and test canvas adapters: display:none caused a canvas-height change from 24 to 11 while the cursor advanced 75→77; visibility:hidden kept height 11→11 with the same cursor progression. This reproduces the reset mechanism without claiming actual pixel rendering. The temporary source was removed after research.

The in-app browser refused to open the local test HTML due to its URL policy. No attempt was made to bypass that restriction. Automated checks instead use the local, non-networked jsdom environment. This does not establish that the script has been installed or run in Tampermonkey.

For quality controls, inspected the real native settings menu on the supplied watch page, confirmed its available list and selected 2160p. Reopening settings showed `Quality 2160p 4K`. Inspected that page's actual referenced public player source: the exported `setPlaybackQuality` implementation is empty; `setPlaybackQualityRange` dispatches to the active native quality-range mechanism. Native internal quality selection uses the range implementation; `auto` maps to ordinal zero, and native `highres` is 4320p. This verifies the source contract and native-menu setting, not installed-script selection. The temporary research download is removed before delivery.

For Enhancer compatibility, inspected the user's live themed Chrome page read-only: its root `--efyt-accent-color` is `#1e90ff`; native settings-button ::after and progress backgrounds both compute to rgb(30,144,255). The script and prototype now share that inherited variable and red fallbacks. Local CSS-declaration and preview-theme checks verify the requested chain; jsdom does not establish rendered CSS-variable colors. Installing the updated script and testing live theme changes remains a separate check.

## Remaining manual integration checks

- Install the userscript in Tampermonkey and open a video; confirm automatic compact display and continuing live updates.
- Toggle the extension menu OFF and reload; verify it remains off. Toggle ON and verify immediate display.
- Close with ×, verify it stays closed for the same video, then navigate to another video and verify automatic display returns.
- Expand and collapse with keyboard and mouse; confirm original chart rendering, native close and video playback remain correct.
- Confirm the chevron rotates 180° and size changes animate in both directions, including rapid repeated clicks. With reduced motion enabled, confirm immediate updates.
- Check theater/fullscreen transitions and YouTube client-side navigation.
- Reload with an existing third-party MB/s converter and verify only native Kbps is converted.
- Let the three charts accumulate history, collapse for several seconds and expand repeatedly. Confirm existing history survives and no new blank region appears from a height reset. YouTube's normal circular sweep can still advance or wrap while collapsed.
- Use the script's quality buttons on real videos with differing available tiers. Confirm a requested mode in native settings and let effective playback reach it, then select Auto and verify adaptive behavior. Check 8K on a video/device that offers it, premium-only filtering, narrow/fullscreen layout and video navigation.
- With the updated script installed, switch Enhancer accent colors and compare compact/expanded badge backgrounds with native quality badges. Remove the custom accent and confirm default red.
