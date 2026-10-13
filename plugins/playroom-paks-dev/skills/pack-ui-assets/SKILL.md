---
name: pack-ui-assets
description: Implement responsive game views and reusable card, die, board, icon and sound assets for PlayRoom packs.
---

# Pack UI and reusable assets

Read docs/AUTHORING.md and the app's shared component/geometry contracts. Preserve playing cards 5:7, dice and grid cells 1:1, and circular pawns. Size within the provided field; reserve action slots and avoid touching the app hand area. Scope all CSS to this pack. Reuse shared card-back, dice, board/piece and sound resources through the build contract.

Use direct taps on player's cards, opponent cards and legal board pieces where possible. Display only actionable targets, maintain meaningful accessible labels and keyboard paths, and keep indicators compact without duplicating the existing hand count. Dice rolls, moves, draws and flips use shared motion contracts and respect reduced motion. Audit audio paths, file signatures, inclusion in standalone JSON and actual event triggers; file existence is not audible playback proof.

Follow [viewport matrix](../../references/VIEWPORTS.md). Battleship uses one mobile board at a time with clear misses; Tic-tac-toe and Battleship keep stable square cells; Ludo has a readable classic board and legal pawn selection; Pexeso uses card proportions; Yatzy keeps a compact score table and visible totals. Colored covers and icons should match the earlier packs' design language.

Use local games/layout or layout profiles with the exact companion pair. Capture same state before/after and inspect the rendering. Test large hand/board states and button appearance; do not accept forced global shrinking or nested scrolling as the general solution.

## Local tools

Read [tools](../../references/TOOLS.md) before using the bundled MCP or CLI. Pass explicit app and pack checkout roots; never guess a sibling path in a worktree. Inspect both repositories and read their current AGENTS.md, CONTRIBUTING.md and relevant design contracts. The repo documentation is authoritative over this plugin. Use repository-workflow for GitHub operations and cleanup. Preserve active services, unrelated edits, published versions and pinned companion SHAs.
