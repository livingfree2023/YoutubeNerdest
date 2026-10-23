# Animated toggle tasks

- [x] Read existing feature state and identify native layout preservation constraints.
- [x] Update approved static prototype with animated size and chevron rotation.
- [x] Implement reversible size animation, 180° chevron transition and reduced-motion fallback.
- [x] Verify animation lifecycle and rerun existing behavior checks: all 49 assertions pass.
- [x] Update delivery documentation and local retrospective.
- [x] Replace the visible native [x] with the same top-left × in both states, in prototype and production.
- [x] Verify fixed close position, expanded dismissal and native fallback: all 53 local assertions pass.
- [ ] Confirm rendered animation in an installed Tampermonkey session; existing integration limitation remains.

## Handover

The source version is 1.1.1. Production and prototype use 220 ms transitions with a 180° chevron rotation and a fixed top-left × replacing the visible original close control in both states. All 53 local assertions pass, including 12 animation adapter checks. Docs and ignored local retrospective are updated. Existing installed-Tampermonkey and real rendering limitations remain; see `docs/TESTING.md`. No commit or push requested.
