---
name: pack-development
description: Develop PlayRoom packs with layered domain/presentation/locales, shared assets and explicit app compatibility during refactoring 0.18.
---

# Pack source and ownership

Inspect the selected packs/app roots and live AUTHORING/API/format contracts. manifest.json is canonical; manifest.js generated. Rules, bots, presentation/locales, styles and assets belong to their pack/shared directories; do not copy the app runtime. Use [refactoring contracts](../../references/REFACTOR-0.18.md) for engineApi 3, sourceModules and shared entities.

Route deterministic rules/privacy to pack-rules, renderer/assets to pack-ui-assets and scoped packaging/publication to pack-validation-release. Sample the actual constructs before extending them; TicTacToe is the reference for the new model, not evidence all games migrated. Preserve local bots, hotseat, every preset/action/reaction/result and exact-version saves via the tracker.

Shared cards/dice/pawns/counters/sounds ship inside standalone packs, no CDN/neighbor checkout at runtime. Request reusable app ports for common behavior. Approved 0.18 API breaks and final removal of legacy runtime require a coordinated update, not edits to released bytes. Follow [workflow](../../references/WORKFLOW.md), [mechanics](../../references/RC4.md) and [tools](../../references/TOOLS.md) as relevant.
