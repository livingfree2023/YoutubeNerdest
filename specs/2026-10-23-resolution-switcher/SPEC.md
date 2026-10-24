# Expanded resolution shortcuts

## Request

Add one quality-switching line at the bottom of expanded Stats for nerds. Use compact native-looking badges informed by the user's screenshot. 8K (4320p), 4K (2160p), 2K (1440p) and HD (1080p) have red backgrounds. Also support 720p, 480p and Auto. 360p and 240p are lower-priority optional choices, shown only if width permits. Never offer resolutions unavailable for the active video. Preserve compact layout, anchored close and animated toggle.

Theme refinement: red is the default. The user subsequently requested Enhancer accent matching; both compact and expanded badges inherit the native theme variable as specified in `../2026-10-23-theme-badges/SPEC.md`.

## Current scope

The user approved the prototype and explicitly requested production implementation. Implement quality controls and the integer-Mbps/current-resolution summary in the existing userscript, validate and publish a version update.

## Prototype behavior

- Open expanded by default to preview the new bottom row.
- Prototype-only video presets demonstrate 8K, 4K and 1080p availability; default 4K omits 8K. These are explicitly illustrative fixtures, not live YouTube measurements.
- Buttons show selection through a light highlight and underline; clicking changes the illustrative Current / Optimal Res value and selection.
- Auto is always available. Filter explicit buttons against preset availability. Hide optional 240p first, then 360p if a single row cannot fit. Required options remain accessible through horizontal scrolling if the panel is exceptionally narrow.
- Review refinement: compact summary shows integer speed followed by current resolution, e.g. `151 Mbps · 2K`. Reuse the red badge for 8K/4K/2K/HD and plain text for lower tiers. Selecting a sample quality updates this label; Auto shows the effective sample resolution rather than the word Auto. The prototype uses the supplied 151266 Kbps sample, displayed as 151 Mbps; production should round Mbps to a whole number and derive effective resolution from native stats.
- Preview width control demonstrates a single-line layout without changing browser window size. Keep such demo controls outside the player.
- Keyboard-accessible buttons with accessible resolution names and pressed state. Respect reduced motion and retain the existing close/toggle behavior.

## Verified production design

- Inspected the live native settings menu on the supplied video: available tiers include 2160p, 1440p, 1080p, 720p, 480p, 360p, 240p and Auto. Selecting 2160p changes its native setting to 2160p 4K.
- Inspected the public player source referenced by the live page, release `cbcfbf2f`. Exported `setPlaybackQuality` is a no-op. Exported `setPlaybackQualityRange(min,max)` calls the active native player quality-range mechanism. Quality identifiers map `highres`→4320, `hd2160`→2160, `hd1440`→1440, `hd1080`→1080, `hd720`→720, `large`→480, `medium`→360, `small`→240; `auto`→0. Use equal lower/upper bounds for explicit selection; auto/auto clears fixed constraints.
- Use `getAvailableQualityLevels()` to filter supported tier IDs; where `getAvailableQualityData()` reports a tier only as unplayable, omit it. Do not expose premium-only/unplayable entries. Deduplicate frame-rate variants to one standard tier.
- Use `getPreferredQuality()` for requested-mode highlighting. Current resolution is distinct: parse the native Current / Optimal Res field's first dimensions, fall back to actual video dimensions and finally `getPlaybackQuality()`. For portrait content classify by the shorter dimension. Known exact heights get native-style labels; other effective heights remain truthful plain p-labels.
- Hide quality controls when setter/availability APIs are unavailable. Do not invoke the obsolete no-op setter or fetch external data. Existing native controls remain available.
- Guard stale button clicks by re-reading availability. Read native preferred mode after the request; do not claim a resolution is already effective. Re-evaluate during native stats updates and video navigation.
- Keep native charts untouched. Append a separate script-owned quality row to the panel; hide that row in compact mode. Ignore both script-owned control trees in mutation callbacks to prevent observer loops. Clean up resize observers and pending refresh timers on panel disposal.
- A ResizeObserver on the quality row handles width changes after expansion or theater/fullscreen resizing. Remove optional 240p then 360p first, retaining a selected optional tier. Keep required choices in one scrollable line if needed.

## Verification plan

- Unit: known IDs/heights, integer Mbps, effective resolution parsing including portrait/unusual/unknown, optional tier removal and paygate filtering.
- Module: execute the actual script against test-only player adapters to verify requested range, Auto reset, requested-versus-effective status, stale clicks, video navigation, API failures, resize behavior and cleanup. Existing settings, close, animation and chart-preservation checks must pass.
- Integration: real native availability and manual setting verified through the live menu; source mapping/range mechanism verified against actual referenced public player code. Installed userscript end-to-end behavior remains a separate check. Existing local browser URL policy prevents rendered-file checks in the in-app browser; record limitations honestly.
