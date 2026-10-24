# Resolution shortcut prototype tasks

- [x] Inspect current approved prototype and supplied badge reference.
- [x] Define visual behavior, demo-only availability and future integration research gate.
- [x] Add bottom quality row with red high-resolution badges and responsive optional tiers.
- [x] Verify prototype syntax plus 16 local DOM checks for availability, selection, width priority and existing close/toggle; no script errors. Geometry is adapted in tests, not rendered browser validation.
- [x] Present updated prototype for user review.
- [x] Update compact summary to integer Mbps followed by effective sample resolution, matching quality selection and Auto.
- [x] Obtain prototype approval before production implementation.
- [x] Probe real native availability and selection; inspect actual player method behavior and quality mappings.
- [x] Implement native quality row, integer Mbps and effective-resolution badge with lifecycle protection.
- [x] Add 37 quality module checks; all 96 local assertions pass.
- [x] Update docs and local retrospective; audit and remove research files.
- [-] Commit, push and verify combined v1.2.1; user has explicitly authorized publication.

## Handover

Implemented the quality feature after prototype approval; the subsequent theme refinement bumps the combined update to v1.2.1 (see `../2026-10-23-theme-badges/`). Native availability and a 4K native-menu selection verified; actual source reveals old setter is a no-op and range setter is required. All 96 local assertions pass, including 37 quality-specific checks. Source preserves native chart geometry, native close and animations. Docs and ignored blog are updated; temporary research source removed. The initial publication request was rejected for missing explicit authorization; the user's subsequent “ok, push” now supplies that authorization. Next commit/push and verify the latest raw download. Installed-Tampermonkey integration remains unverified; do not conflate native-menu/source probes with script end-to-end testing.
