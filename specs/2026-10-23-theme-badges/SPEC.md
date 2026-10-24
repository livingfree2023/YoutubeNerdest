# Theme-aware quality badges

## Request and research

The user runs Enhancer for YouTube and requests that the script's badge backgrounds match the themed native logo and quality badge. Their screenshot shows native blue accents alongside our hardcoded red badges.

Inspected the user's actual themed Chrome watch tab read-only. The root exports `--efyt-accent-color: #1e90ff`; both native `.ytp-settings-button::after` and `.ytp-play-progress` have computed background `rgb(30, 144, 255)`. The root also exports YouTube's default `--yt-sys-color-baseline--static-brand-red: #f03`. No extension settings, playback or installed scripts were changed.

## Implementation

- Replace hardcoded badge background with `var(--efyt-accent-color, var(--yt-sys-color-baseline--static-brand-red, #f03))` in the production `.ytn-badge` and prototype `.quality-badge` styles.
- CSS inheritance supplies the active theme color and tracks subsequent changes. No DOM/style observer, polling, script injection, network request or new permission is needed.
- Apply to both compact effective-resolution badges and expanded resolution buttons through their shared badge class. Preserve existing white text, dimensions, selection styling and unbadged lower tiers.
- Add a clearly labeled prototype-only theme selector to demonstrate default red, Enhancer blue and additional sample accent colors. This does not write to the extension's actual settings.
- Version 1.2.1 follows the locally implemented quality controls. Publishing remains pending explicit authorization after the previous auto-review rejection.

## Verification

- Syntax and stylesheet checks ensure production/prototype share the same fallback chain.
- Module checks exercise the actual userscript with a test player, verify compact/expanded badge class usage, and verify theme inheritance without injected observers or changes to the native chart DOM. jsdom cannot render CSS custom-property fallback chains reliably; validate the cascade declaration, not fabricated pixel results.
- Real integration evidence: actual Enhancer variable matches the native badge and progress computed styles. Updated-script rendering remains unverified until installed. Production behavior and all existing tests must still pass.
