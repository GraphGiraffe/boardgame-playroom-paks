---
name: pack-ui-assets
description: Implement reusable scalable PlayRoom game components, scene renderers, local palette/skin hooks and accessible interactions.
---

# Pack presentation and shared assets

Read current component/geometry contracts and [0.18 shared entities](../../references/REFACTOR-0.18.md#shared-visual-and-semantic-entities). Presentation produces serializable scene/metrics/MessageRef from authorized data; Web owns DOM/CSS/input. Reuse semantic assets instead of per-pack copies or rule calculations in view.

RoundToken is one SVG/CSS object for counters/first-player/team/medal/Ludo/Snakes variants; stack/fan/finish-triangle are layouts. Keep numeral paths centered at normal/small sizes, proportional face/rim/side, circular selection, 5:7 cards and square cells/dice. Preserve accepted Ludo board and shared pawn/finish behavior. Checkers/domino/ship/table/bubble/sound families also belong in shared resources, embedded offline.

Theme/skin hooks change local palette/appearance without changing semantic value, ID, hit area or privacy. No pack-owned theme store/room preference. Mechanical bubbles and chat have distinct semantic styles; scheduled chat/bot/statistics features remain pending until implemented. Result metrics reuse player-card descriptors.

Scope CSS to pack components; do not style the hub. Keep field/control geometry and gestures stable when actions appear, opponents act or themes change. Verify affected states/viewports via [viewport guidance](../../references/VIEWPORTS.md), inspect screenshots and real input, and test cue/asset inclusion rather than merely checking files exist. Follow [workflow](../../references/WORKFLOW.md), [RC4](../../references/RC4.md) and [tools](../../references/TOOLS.md) as relevant.
