# Automatic update metadata tasks

- [x] Inspect existing header and public repository filename.
- [x] Add matching GitHub raw update/download URLs and bump userscript version to 1.1.4.
- [x] Update installation instructions.
- [x] Validate syntax and metadata; commit and push.
- [x] Verify published raw endpoint and record handover.

## Handover

Metadata-only update; runtime logic is unchanged. Both URLs target `https://raw.githubusercontent.com/livingfree2023/YoutubeNerdest/main/youtube-nerdest.user.js`. Syntax and metadata checks pass. Published commit `83038e7` to main and fetched the public raw endpoint successfully; its top-of-file header contains version 1.1.4 and both requested fields. Installed-Tampermonkey update timing has not been tested.
