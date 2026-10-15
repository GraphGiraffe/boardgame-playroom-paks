---
name: pack-validation-release
description: Run selected PlayRoom pack checks and independently publish a collection or one immutable pack through R2 without app redeployment.
---

# Scoped pack checks and independent publication

Read current release and independent-publication documentation and workflow inputs in both selected repos. Use [workflow](../../references/WORKFLOW.md): release checks require explicit selectors or none, no implicit full cycle/all shortcut. Test only affected rules/view/privacy/restore paths; cross-pack checks need an actual common-contract risk. Standalone pack syntax/build/hash verification is separate from gameplay/browser verification.

Use exact companion sources/SHAs. The helper plans selected canonical commands, not a replacement suite. Build immutable individual JSON/collection/shared-asset/source artifacts and verify SHA256/ZIPs; release assets come from one final build. Keep old published bundles available for exact-version saves/replay or the approved coordinated 0.18 cutover.

Packs publish through the existing packs-publish.yml to private R2 with immutable files and atomic catalog pointer. Its only input can limit publication to one game. Verify the public app route serves the expected catalog/version/file hashes and catalog rollback remains possible. This does not redeploy Pages or change the app version. App shell deployments belong to the app workflow, not a duplicated publisher here.

Task PRs/stable flow and existing authorization follow the selected repo, with reachable pinned provenance. Keep plugin edits in tooling branches. Report selected tests/omissions, release state and published catalog state separately. Use [tools](../../references/TOOLS.md) for local plan/inspection/hash support and [refactoring](../../references/REFACTOR-0.18.md) for migration limits.
