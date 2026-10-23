# Compact stats tasks

- [x] Inspect workspace and supplied screenshot/DOM.
- [x] Check official userscript metadata documentation.
- [x] Define behavior, failure handling and three-tier verification.
- [x] Create a dependency-free static interactive prototype.
- [x] Obtain user confirmation of the prototype.
- [x] Add the requested left-side close control and saved auto-show preference, default ON.
- [x] Probe the real stats DOM and native open/close behavior; confirm player method registrations in the actual public player source.
- [x] Implement the standalone Tampermonkey userscript.
- [x] Verify conversion, DOM restoration, settings and observer lifecycle in isolated tests.
- [x] Run available real-browser probes and record integration limitations in `docs/TESTING.md`.
- [x] Write installation instructions and local ignored retrospective; audit delivery files.
- [ ] Verify installation in Tampermonkey, browser rendering, fullscreen/theater and trusted keyboard input in a browser with the extension installed. This is an integration limitation, not a passing check.

## Handover

The folder started empty and has no Git repository. Installable source is `youtube-nerdest.user.js`; instructions are in `README.md`. The approved prototype now includes a left × and the default-ON configuration. `npm test` runs the real source in jsdom with test-only adapters; 36 module checks and a separate saved-OFF startup check pass. Native YouTube DOM, close behavior and player-method registration were verified, but no installed Tampermonkey session was available. The in-app browser blocked local test-file navigation; no bypass was attempted. Remaining integration checks are listed above and in `docs/TESTING.md`. No commit or push was requested in this turn.
