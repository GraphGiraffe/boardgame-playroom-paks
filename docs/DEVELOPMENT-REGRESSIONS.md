# Runtime assets: ownership, packaging and review

Текущая связка документации: коллекция **0.8.10**, ХОД **0.21.0**, engineApi 4 / viewApi 3. Старые номера в описании происхождения не меняют текущий контракт.

Audit the prepared `*.playroom-pack.json` or final standalone HTML, not a recursive sum of repository files. Source masters, archived concepts and runtime resources have different owners. Report exact input paths/SHA256, actual UTF-8 file bytes, serialized pack bytes and decoded data-URL bytes separately. Compression estimates are not measured ZIP sizes. Large HTML does not establish a localStorage quota cause.

Use `python3 -m playroom_utils audit-assets /absolute/artifact.html /absolute/game.playroom-pack.json --report-dir /absolute/new-report` from the utility checkout; no config, compiler imports, builds or network. `--strict` exits 1 for candidates inside a pack; review them before removal. Plugin MCP `audit_assets` returns the same report read-only; CLI `audit-assets --artifact PATH` can repeat that flag. The report identifies exact files, embedded JS/CSS copies, resources repeated in different files, authoring files and HTML data-URL repetition. It does not prove arbitrary code reachability or detect every encoded/dynamic resource. Cross-pack copies are allowed because packs install independently; HTML app/pack duplication is a review candidate, not an automatic deletion.

Canonical compiler: packs `shared/pack_compiler.py`; host copy and compiler digest are generated/pinned companions. Source modules become rules/view/locales entrypoints and must not also ship as consumed files. Asset-pack scripts/styles already incorporated into entrypoints must not be shipped a second time. A WAV has one runtime resource, referenced through `PlayroomPack.asset`; do not embed another base64 copy in sounds.js. Preserve actual audio data/cue behavior when reducing packaging size. A source manifest may retain authoring dependencies for standalone asset-pack publication.

Current character runtime has two sets: `minimal` (Стандартный, first/default) and `simple` (Простой). Detailed masters stay archived in source, outside app and Pexeso runtime closure. Do not renumber the 48 semantic IDs. Unsupported saved visual styles fall back to minimal without rewriting sessions or deleting saves. Shared artwork in independent packs is intentional; host avatar catalogs are not a pack dependency. Pexeso skin families follow the selected game mode, not every possible deck.

Skins own overlap/exclusion geometry for horizontal/vertical/fan stacking. Apply layout on skin acceptance immediately and reserve maximum visible waste height even when empty. Inspect before/after draw, undo, cancelled drag, history, replay, rotation and skin change; appearance changes must not require a game action. Foundation placeholders use selected skin suit glyphs. Shared card tables use green light/dark palettes, card-shaped rounded slots and beige faces; use shared components rather than per-game copies.

Preserve original art, rejected candidates and chosen versions in source design archives. Compare poses, proportions, faces/accessories and four-finger hands against the original at full size AND actual avatar/card sizes. Standard characters retain the whole-art white silhouette outline, not individual-part outlines. Pack covers/cards share typography and suit geometry. Never replace archived masters with optimized runtime exports.

# Durable local start and UI failure regression

Persist the prior session/archive and activate the next save successfully BEFORE replacing the current in-memory session/ID. On quota, denied storage or serialization failure, preserve exact prior bytes and identity; retry must not target a never-created ID and claim LIBRARY_REMOVED. Reuse an identical archive without another write. Never free quota by silently deleting sessions or temporarily removing the active save. Multiple localStorage writes are not a transaction: test failure at each boundary, not only successful save.

Use the common localized save-error path for quota/security/missing-save/generic errors. No raw DOMException toasts, private save payload logging or invalid assignment to a translation call. Distinguish actual quota from unavailable storage; HTML/pack size alone does not diagnose either. Measure saved state/history and browser storage separately. Prove old bytes survive, lobby remains usable, and retry succeeds after capacity/access returns. Existing focused cases are selected from the current runner (storage failures and player-profile/local start), not a remembered case count.

Share scene/input/feedback primitives across games, without game-ID switches in generic components. Failed/cancelled drag restores source appearance; immediate drag previews the whole legal run. Hints identify only exposed actionable cards and useful progress; stock hints highlight stock alone. Animation must preserve existing waste/stock cards, animate history and show a win dialog with final score after the final transition. Local play must not show host/network-only notices.

Use the shared tooltip behavior: long press reveals; release inside activates once and hides; move/release outside cancels activation and retains help for two seconds. Invalid targets flash red within the scroll clipping area; reserve enough inset for the entire highlight. Test actual touch and small/short viewports, not CSS presence alone. Avoid redundant delays; distinguish movement duration, reveal dwell and bot decision delay.

Themes in hub configure app theme/avatar style only. In-game settings show active pack families with >1 available variant; hide empty skin block. Samples use actual runtime components and matching IDs, not independent lookalike drawings. Cancel rolls back preview; Принять to its right persists, closes, refreshes geometry immediately. UI-only preference changes do not alter rules, IDs or hidden projections.

For artifact acceptance open the actual offline file:// HTML, not merely the dev server. Check missing resources/console errors, 320/390 portrait and short landscape, save/restore and selected skin/mode. SHA/ZIP integrity is separate from runtime behavior. Record exact roots, dirty state and commands; never reuse stale installed-packs or call a build a release. Run only risk-selected existing cases; documentation/plugin changes need their own tool checks, not an implicit app-wide gate.

## 0.19 presentation performance

Не клонировать все руки/поле ради одного эффекта: выбирать source hands, leaving board refs и затронутые flip slots. Проверять порядок async prepare → ответ/звук → transfer → set/reveal → counters в local/network/history. При resize инвалидировать координатные резервы, сохраняя объявленные зоны пустых рук. Быстрый режим сохраняет видимость действия, instant при наложении выбирает ответ.

## Схемы и подсказки · 0.8.2

Стрелки в справке должны читаться поверх щитов, клеток и фишек: контрастная окантовка и отдельная толщина, без общего правила, уничтожающего различия. Проверять движение/атаку/ульту всех стихий во всех четырёх направлениях. Подсказка порядка действий находится под рукой в обеих ориентациях; сброс сохраняет стандартный undo. Отступы под указателями сокращать без обрезания треугольников; проверять восемь игроков и отсутствие прокрутки панели в принятом размере экрана.

## Геометрия ассетов в любом контексте

Нормализованный SVG/viewBox — единица физического масштаба. Материальные скругления, рамки, глубина, тени, внутренние отступы и печать задаются в его координатах. Полный типизированный SVG не получает вторую CSS-рамку/скругление/тень: это правило не зависит от scene и действует в параметрах, правилах, миниатюрах, галереях, руках, reveal и motion/request layers. Неподвижный слот тоже имеет собственный SVG материал; DOM сохраняет семантику и target/hit area. CSS-only рубашка домино и рамка шашечной доски используют нормализованные плоскости.

Размещение/допустимый размер принадлежат зоне. Собственные пропорции ассета сохраняются через meet, квадратная и портретная формы не подменяются общим ratio. Размеры текста интерфейса,44px touch targets и экранные контуры выбора/фокуса — отдельный слой доступности, не толщина материала. Не масштабировать их вслепую вместе с рисунком. При новом компоненте проверять все варианты общего каталога и реальные обёртки при24/48/96/144px, вне scene и в motion/reveal; не ограничиваться наличием процентов в CSS.

Parameter component scale is invariant across variants. Cards in quantity examples may overlap; do not shrink each card as the count increases or grow a single card to fill the slot. Reuse the host table helper for seat-order/draw examples. Center ink without rescaling its bounds, and compare every variant plus repeated primitives in context. Accepted sizing lives in AUTHORING and app SIZE-SYSTEM.
