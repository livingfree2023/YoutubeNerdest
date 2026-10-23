# Chart history tasks

- [x] Inspect current hiding and native chart implementation.
- [x] Reproduce height-reset behavior with the actual extracted native chart updater and controlled geometry.
- [x] Preserve native layout while hiding compact content; keep original canvas nodes and attributes.
- [x] Update regression checks and run the existing suite: 59 local assertions pass.
- [x] Update docs and local retrospective; remove temporary downloaded source.
- [ ] Verify installed Tampermonkey chart history visually (existing integration limitation).

## Handover

Version 1.1.2 replaces display:none on stats content with visibility:hidden plus absolute positioning and intrinsic width. Cause confirmed using actual extracted native updater: native fallback 24 then normal 11 clears the bitmap without resetting the circular index. All 59 local assertions pass. Documentation is current; the temporary downloaded player source was removed. Installed Tampermonkey and pixel-rendering verification remain unavailable; the next integration check is to accumulate chart history and toggle repeatedly. Normal circular chart sweep/wrap is expected even while collapsed.

## Repository delivery

The user renamed the userscript to YouTube Nerdest and added its favicon metadata; both edits are preserved. At the user's request, initialized the local repository on `main` and created the private GitHub repository `livingfree2023/YoutubeNerdest` with `origin` configured. Initial delivery includes source, docs, specifications and local tests. `blog/`, `node_modules/`, `dist/` and `.DS_Store` are ignored. The latest suite passes all 59 assertions; installed-extension rendering limitations above remain unchanged.
