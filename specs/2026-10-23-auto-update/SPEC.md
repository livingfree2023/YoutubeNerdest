# GitHub automatic update metadata

The user requests `@updateURL` and `@downloadURL` inside the existing top-of-file UserScript block.

- Both URLs point to the complete raw `main/youtube-nerdest.user.js` in the public repository. A separate generated metadata file is unnecessary for this small script.
- Increment userscript version to 1.1.4 so installed managers can distinguish this metadata update.
- Preserve script name, namespace, permissions and all runtime logic.
- Document direct installation and the need to keep manager update checks enabled. Greasy Fork rewrites update URLs for copies installed from its site, per its own metadata policy.
- Validation: check JavaScript syntax, UserScript block placement, unique update/download keys, expected raw URL and version; confirm the public raw endpoint serves the published metadata after pushing.
- No UI change or additional runtime request from the userscript is introduced. Update checks are performed by the script manager. No new unit/module test is needed for this metadata-only change; installed-manager update scheduling remains an integration limitation.
