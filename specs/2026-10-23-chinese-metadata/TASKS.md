# Chinese metadata tasks

- [x] Inspect current manual edits and preserve existing Chinese name.
- [x] Add general Chinese and simplified-Chinese regional name/description metadata.
- [x] Bump script version to 1.2.2 without changing runtime behavior.
- [x] Verify syntax, unique Chinese metadata, exact preservation of the manual Chinese name and unchanged runtime body against HEAD.
- [x] Obtain explicit user authorization to commit and push v1.2.2.

## Handover

Metadata-only update to 1.2.2. Existing `@name:zh` is preserved; zh-CN aliases and both Chinese descriptions are added. Syntax and metadata checks pass, and runtime body is unchanged. The user explicitly authorized commit/push with “ok push”. Screenshot replacement is a separate unfinished request; existing docs images and README were not modified during this metadata change.
