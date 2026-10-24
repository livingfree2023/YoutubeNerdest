# Stable userscript identity

Restore the established English `@name` (`YouTube Nerdest`) so the userscript manager can continue to recognize the existing installation by its stable identity. Increment the version for the metadata correction.

- Keep the namespace, localized names/descriptions, update URLs, permissions, and runtime code unchanged.
- No UI, network, or playback behavior changes.
- Validation: inspect the header and diff to confirm only the English name and version changed in the userscript; no runtime tests are needed for this metadata-only change.
- If the user already installed a second entry after the rename, they may need to remove that duplicate manually in their userscript manager.
