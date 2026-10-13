---
name: pack-rules
description: Implement or review deterministic game rules, legal actions, hidden hands, bots, deck variants and replay in PlayRoom packs.
---

# Rules and hidden information

Read the selected manifest, rules, current authoring guide and exact engine contract. Separate public state, each player's private hand, legal targets and display hints. Use the provided deterministic RNG; never Math.random in authoritative rules. Actions must validate actor, turn, target and selected card, including malicious/replayed input.

Exercise setup, legal and illegal moves, scoring, turn boundaries, bots, empty hands, end conditions, save/replay and supported participant/deck ranges. Preserve hidden card identity: let a player choose a displayed back/index via the supported contract without exposing the private card ID. Player-target and card-target interactions must agree with the app controller.

For Battleship distinguish configured placement rules from appearance: automatic spacing must preserve legal fleets; never silently change manual rule variants while fixing a view. For Yatzy keep totals/bonus consistent between table, player card and scoring logic. For Durak verify deck exhaustion, trump, transfer/throw-in limits and every supported 2–6 player/deck combination that the changed code affects.

Use existing games/actions and targeted rule tests. Expand only for a new uncovered risk. Changing a saved-state contract requires version policy and compatibility documentation, not rewriting an already published pack.

## Local tools

Read [tools](../../references/TOOLS.md) before using the bundled MCP or CLI. Pass explicit app and pack checkout roots; never guess a sibling path in a worktree. Inspect both repositories and read their current AGENTS.md, CONTRIBUTING.md and relevant design contracts. The repo documentation is authoritative over this plugin. Use repository-workflow for GitHub operations and cleanup. Preserve active services, unrelated edits, published versions and pinned companion SHAs.
