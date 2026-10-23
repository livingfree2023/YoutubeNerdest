# Verification

Run `npm ci --ignore-scripts` and `npm test` from the repository root. Node.js 18+ is required by the development dependency.

`tests/run.cjs` executes the actual userscript in jsdom, with test-only Tampermonkey and player adapters in `tests/browser.html`. No external resources are loaded. These adapters must never be copied into the production script.

Checks cover numeric conversion, original DOM/chart preservation, compact and expanded layout properties, left close delegation, live updates and fallback, settings persistence and cross-tab changes, dismissal across videos, player/panel replacement, native visibility and bounded observer updates. jsdom checks CSS properties and DOM behavior; it does not verify browser rendering or trusted keyboard events.

The suite passes 59 assertions: 46 base module checks, one saved-OFF startup check and 12 animation checks. These include measurable but invisible compact content, intrinsic width outside layout flow, untouched canvas attributes and identity, fixed close anchoring, hidden native close in both states, expanded dismissal and native-close recovery on fallback. Test-only geometry and animation adapters verify both size targets, rapid reversal, cleanup, native style preservation and reduced-motion/API-absence fallbacks. They do not render actual animation frames.

## Real integration evidence

On 2026-10-23, opened a real YouTube watch page, opened Stats for nerds from its context menu, inspected its native DOM and closed it through the native button. The current panel includes `.html5-video-info-panel`, `.html5-video-info-panel-content` and `.ytp-sfn-close`; the connection row contains a dedicated numeric Kbps span.

Fetched the public player JavaScript referenced by that page. It registers `showVideoInfo`, `hideVideoInfo` and `isVideoInfoVisible`; its native menu uses those methods. The downloaded research copy was temporary and is not part of the project.

For the reported chart issue, fetched that public player source again and inspected its actual horizon-chart updater. It uses `clientHeight || 24`, writes canvas height on measurement changes and retains its circular sample index. An isolated probe executed only the extracted updater with controlled geometry and test canvas adapters: display:none caused a canvas-height change from 24 to 11 while the cursor advanced 75→77; visibility:hidden kept height 11→11 with the same cursor progression. This reproduces the reset mechanism without claiming actual pixel rendering. The temporary source was removed after research.

The in-app browser refused to open the local test HTML due to its URL policy. No attempt was made to bypass that restriction. Automated checks instead use the local, non-networked jsdom environment. This does not establish that the script has been installed or run in Tampermonkey.

## Remaining manual integration checks

- Install the userscript in Tampermonkey and open a video; confirm automatic compact display and continuing live updates.
- Toggle the extension menu OFF and reload; verify it remains off. Toggle ON and verify immediate display.
- Close with ×, verify it stays closed for the same video, then navigate to another video and verify automatic display returns.
- Expand and collapse with keyboard and mouse; confirm original chart rendering, native close and video playback remain correct.
- Confirm the chevron rotates 180° and size changes animate in both directions, including rapid repeated clicks. With reduced motion enabled, confirm immediate updates.
- Check theater/fullscreen transitions and YouTube client-side navigation.
- Reload with an existing third-party MB/s converter and verify only native Kbps is converted.
- Let the three charts accumulate history, collapse for several seconds and expand repeatedly. Confirm existing history survives and no new blank region appears from a height reset. YouTube's normal circular sweep can still advance or wrap while collapsed.
