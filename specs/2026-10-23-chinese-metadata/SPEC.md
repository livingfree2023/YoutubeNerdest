# Chinese script metadata

The user requests a Chinese name and description after making manual edits. Preserve their existing `@name:zh` text, add the same `@name:zh-CN` alias, and add matching `@description:zh` / `@description:zh-CN` text describing the actual features. Keep English metadata and runtime logic unchanged. Bump the userscript version to 1.2.2 for a distinguishable metadata update.

Verify header placement, unique locale keys, exact preservation of the user-provided name, version and unchanged runtime body. No UI prototype or runtime unit/module test changes are necessary for metadata alone. Manager/store locale selection remains an external integration check. Work is local; publication requires user authorization.
