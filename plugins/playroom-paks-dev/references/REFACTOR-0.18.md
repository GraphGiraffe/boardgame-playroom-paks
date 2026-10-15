# Refactoring 0.18: pack contracts

Read selected packs docs/AUTHORING.md, REFACTOR-0.18.md and the selected app AUDIT-0.18, REFACTOR-0.18-CONTRACTS and TRACKER. Inspect the implementation before marking a planned API/feature complete. The reference pack is tictactoe 0.2.0 / engineApi 3 / viewApi 2 / stateVersion 1 in the development branch; old published engineApi 1/2 packs have not all migrated.

## Layered source and autonomous delivery

Use domain/ for pure rules, legal commands, deterministic bot decisions and result facts; presentation/ for serializable scene/player metrics/effect descriptors/MessageRef; locales/<locale>/*.json for namespaced text; Web view/styles for rendering/input only. No app filesystem imports or DOM/translated labels in domain. UI cannot recompute rules/results from labels. Bots see authorized observations rather than hidden authority state.

sourceModules lists ordered rules/view modules and per-locale JSON files. Builders inline them into standalone entrypoints and remove that source-only field; PlayroomPackResources provides catalogs. Distribution must work offline without the neighboring checkout/CDN. Scoped PlayroomPack.adaptModel uses the host port, followed by scoped register; staging cannot mutate the live registry. Raw Node source tests bootstrap the selected app adapter rather than making the pack import it. Shared/domain/standard-deck.js supplies 36/52/54 order/exclusions; game-specific rules remain in their packs. Two builders still require equal-bundle validation until the shared compiler stage.

GameModel ActionChoice separates canonical command from visibility and UI labels. A public Table command must reveal no private availability/parameters before it executes. Table receives the same data/events as Spectator, viewer=-1 with a separately granted actor. Hands are backs/counts or faces under open hands; dice public; both Battleship fleets masked. Private actions remain on player devices. Spectators/replay cannot act. Only migrated declarations produce Table controls; inspect actual private-event adapter support and next public-reaction actor routing before migration.

Final 0.18 may change API/save formats with the approved full-update transition; do not retain a parallel legacy runtime. Temporary adapters must be named in the tracker. Never rewrite published bytes or claim an old save is supported without its exact pack/version. Preserve all presets, first-player assignment, setup, bots, reactions, scoring, draws, privacy, animation/replay and result details through the feature inventory.

## Shared visual and semantic entities

One scalable RoundToken object underlies counters, first-player/team markers, medals, and Ludo/Snakes pawns; style/value differ. Geometry, stack/fan/cell/finish-triangle layout are separate functions. Keep approved numeral paths centered at every size, proportional face/rim/side depth and circular availability/selection outlines. Use shared SVG/CSS assets; do not fix a scaled label with per-screen pixel nudges or rasterize scalable elements. Preserve accepted Ludo board, shared pawns and triangular finish layout.

Cards/dice/checkers/domino/boards/ships/score-table/bubbles/sounds belong to reusable shared assets with semantic IDs, palette slots and scaling/layout rules. source IDs, hit regions, visibility and die/card values do not change with a skin. Metrics/result descriptors reuse the player-card counters; rules own places/tie-break facts. Bubble mechanics use light green with a thin border; chat is light, recipient blue, success green/error red. Chat/reactions, broader bot strategies and remaining statistics follow the actual roadmap, not assumptions of completion.

Theme presets are client-local. Standard light/dark are immutable; custom presets save in app preferences. A pack supplies semantic palette/variant hooks, not its own theme store or room-wide appearance setting. Text/aria/actions/events/rules belong in locale catalogs; presentation formats authorized MessageRef values.
