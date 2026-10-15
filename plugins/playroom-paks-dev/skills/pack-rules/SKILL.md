---
name: pack-rules
description: Implement pure deterministic PlayRoom rules, legal/public choices, hidden projections, bots, scoring and replay contracts.
---

# Rules, events and visibility

Read current pack authoring plus [0.18 contracts](../../references/REFACTOR-0.18.md). Domain owns legal commands, transitions, typed events and result/tie-break facts; presentation/translated labels do not determine outcomes. Explicit randomness/observations only; bots never inspect hidden authority data. Preserve supported player/deck/preset combinations and RNG ordering.

Commands carry rule parameters only. ActionChoice separately declares public/private. Table gets spectator data and separately authorized public choices; availability and arguments must be public before execution. Private card selection/fleet setup stays personal. Project event parameters before presentation/translation/audio/replay, including public fallbacks. Inspect current adapter support before migrating private events.

Check setup, illegal/malicious/replayed commands, turn boundaries/reactions, bot behavior, exhausted stock, draws, scoring and exact-version restore for the changed rule. Use the focused cases in the selected app; independent pack syntax/build is not gameplay evidence. Rank policies belong to rules, never Russian label matching in UI.

Keep actual game rules explicit: Battleship spacing/privacy and public outcomes, Yatzy category acceptance/bonus, Ludo independent dice/safe cells/team help, supported Durak limits/decks. Follow [workflow](../../references/WORKFLOW.md) and [RC4 mechanics](../../references/RC4.md); use [tools](../../references/TOOLS.md) when needed.
