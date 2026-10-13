---
name: pack-development
description: Develop a PlayRoom game pack or its shared assets while preserving the app/pack repository boundary.
---

# Game pack development

Use only for the PlayRoom packs checkout and an explicitly selected companion app. Read docs/AUTHORING.md and the app contracts required by the feature. Each game owns packs/ID/{manifest.json,rules.js,view.js,styles.css,assets}; manifest.json is canonical, manifest.js is generated. Sample two existing implementations of the exact contract before adding a new one.

Route rules and hidden state to pack-rules, UI/assets to pack-ui-assets, and packaging/versioning to pack-validation-release. Keep local bots and pass-the-phone operational; verify the network projection separately. The collection uses Yatzy instead of Perudo. Card-deck variants 36/52/54 belong only where the game rules support them; document exclusions and joker behavior. Do not implement invalid variants to fill a menu.

Common cards, dice, pieces, sounds and icons belong in shared assets and are embedded into each standalone pack. Do not depend on an external CDN or a neighboring checkout at runtime. Request generic app API improvements in the app repository when necessary instead of copying its engine.

## Local tools

Read [tools](../../references/TOOLS.md) before using the bundled MCP or CLI. Pass explicit app and pack checkout roots; never guess a sibling path in a worktree. Inspect both repositories and read their current AGENTS.md, CONTRIBUTING.md and relevant design contracts. The repo documentation is authoritative over this plugin. Use repository-workflow for GitHub operations and cleanup. Preserve active services, unrelated edits, published versions and pinned companion SHAs.
