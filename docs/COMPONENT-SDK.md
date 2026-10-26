# Компонентный SDK: текущая миграция

Состояние: локальная ветка component-contracts, не опубликованный API 4.
Manifest переключены на engineApi 4/viewApi 3; сетевой протокол — 3. План — utils
`docs/project/app/COMPONENT-REFACTOR.md`; выпуск требует отдельной проверки совместимости.

## Идентичность и приватность

Ссылки эффектов имеют вид `{namespace: 'card', id: 'deck:17'}`.
ID принадлежит физическому экземпляру и сохраняется при смене зоны, рисунка,
повороте и перестановке. Namespace различает карту, tile, token, checker.
`H.components.entityKey(ref)` кодирует ссылку для data-entity. Не собирать
ключи из рисунка, индекса руки или суффикса строки. Скрытые рубашки не получают
стабильных публичных ID. Закрытую передачу показывать через зоны и количество;
ссылку на карту разрешено создавать после публичного раскрытия.

HandLayout принимает `{id, html, selected, locked}`. Selection — отдельное
значение для экземпляра, не поиск класса в HTML. Собственный viewer получает
лица из проекции; публичный Стол — только разрешённые лица/количество.

## Последовательная карточная игра

Запускаемые примеры обоих контрактов находятся в [examples/presentation-contracts](../examples/presentation-contracts/README.md). Они используют реальные shared-модули. Ниже граница presentation, а не самостоятельный устанавливаемый пак:

```js
function played(publicEvent) {
  const card = publicEvent.params.card; // уже раскрытая правилами карта
  return {
    message: {key: 'game.played', params: {}},
    kind: 'play',
    reveal: {kind: 'card', card, entity: {namespace: 'card', id: card.id}}
  };
}
function hand(cards, selectedId, H) {
  return H.components.handLayout(cards.map(card => ({
    id: card.id, selected: card.id === selectedId, locked: false,
    html: H.components.card(card)
  })));
}
```

Полный производитель/потребитель: `packs/uno/presentation/scene.js` и
`packs/uno/view.js`. Закрытые передачи: `packs/gofish/presentation/scene.js`.
`examples/private-counter` остаётся отдельным минимальным примером проекций;
он не демонстрирует всю миграцию.

## Одновременные решения

Чистый shared/domain/decision-window.js хранит закрытые планы в authority:

```js
const window = W.create('round:1', [0, 1]);
W.put(window, 0, {card: 'deck:17', direction: 1});
const publicWindow = W.describe(window);
// {id:'round:1', participants:[0,1], ready:[0], versions:{0:1,1:0}}
const complete = W.put(window, 1, {card: 'deck:22', direction: 0});
if (complete) resolveFromPrivatePlans(window.plans);
```

Правила проверяют допустимость и принадлежность карты ДО put. Null отменяет
решение и повышает его revision. Поля plans не передаются в scene, историю,
сообщения или журнал публичных эффектов. Authority сохраняет команды ботов
до публикации общей готовности; сбой записи не объявляет непринятый план готовым.
Полный пример: `packs/mage-brawl/domain/game.js`, функции decisionWindow/plan.

## Показ и геометрия

Application PlanPlayer выполняет группы одновременно, группы последовательно;
порты initial/final управляют сценой. Использовать общий scheduler, не вводить
таймеры правил или второй цикл публичного проигрывания. Детали — app
`docs/PRESENTATION-PLAYER.md`. Паковые events/frames пока являются входами
адаптеров общего исполнителя; renderer получает авторизованную SceneModel.

Метрика содержит id/kind/value/label; display задаёт icon/capacity/overlap.
Canonical `validMetric` используется границей сцены и UI: kind — points/wins/pieces,
value — целое неотрицательное безопасное число, icon — heart/meeple/crown,
capacity — 1–64. До локализации label может быть message descriptor; renderer
принимает строку. Значение может превышать capacity: накопленные короны сохраняются.
Один descriptor используется в карточке и результатах. PieceIndicators берёт
те же value/capacity; он не вычисляет здоровье. RotationController хранит число
оборотов для визуального перехода и нормализует направление для команды.
Резерв руки сохраняет только размеры, не HTML/карты/фокус чужого viewer.
Смена viewport/skin/viewer/session сбрасывает измерения; изменение topology
пересчитывает поле, но само по себе не удаляет резерв руки.

## Источники и проверка

Компоненты и assets каноничны в packs/shared. Host-копии генерирует сборка
приложения с точным --packs-dir; вручную их не редактировать.
Перед проверкой выбрать case через runner --list. Повторять только проверки,
чьи зависимости изменены. Синтаксис/упаковка не доказывают поведение браузера.

## Зоны и объекты сцены

Все паковые presentation.scene возвращают geometry.topology, zones, objects и
interactions. Зона имеет id/kind и необязательные owner/count. Объект имеет ref
(EntityRef), zone и публичные координаты cell/point/cells либо index. Закрытая
рука сообщает только count; её физические ID не включаются в objects. Публичный
slot в «Парах» обозначает позицию, а не скрытую карту.

Interaction содержит исходную разрешённую command и target с ровно одним полем:
entity либо zone. Ссылки проверяются относительно текущей сцены. Это описание
не предоставляет дополнительных прав: authority повторно проверяет команду.
Общий web layout переносит topology в ключ измерения поля, отдельно от резерва
руки; слоты field/hand получают data-scene-zone для привязки DOM к сцене.

## Authorized board geometry lifecycle

Motion capture receives the viewer-authorized initial SceneModel. Only objects
in zones with `kind: 'board'` are board movers; arbitrary EntityRef namespaces
are supported. CSS names and `checker-`/`token-` prefixes are not classification.
Dedicated `scene.plan` playback owns its geometry and bypasses this adapter.

The surface-local `stage(snapshot, {exclude})` port holds surviving board objects
at their captured positions before their movement event. Repeated staging first
restores original inline translation; it does not accumulate offsets. Routes
with explicit intermediate anchors are excluded and retain their own positions.
`releaseStage()` restores exact inline values and priorities before destination
measurement. Dice-only cues preserve the held board; starting the board movement
marks the boundary so redraw cannot rewind it. Cancellation restores staging and
cancels the active surface flight, including ordinary non-route movement.
Resize/scroll discards stale screen-coordinate reserves.

Field scenes also retain tile artwork and public object creation/removal.
Per-event checkpoints use the contract below; specialized routes and reveals
remain renderer ports under the same plan clock. No private markup is kept for layout.


## API 4 / viewApi 3 / protocol 3: локальный переход

Все manifest и view recipes коллекции используют новый контракт. Старые API
отклоняются до исполнения кода; исходные архивы и сохранения не преобразуются.
Публичный сетевой снимок содержит SceneModel, а не domain data/modelProjection.
Опциональный `presentation.eventScenes(projection)` возвращает упорядоченные
`{eventId, scene}` только для разрешённых событий текущей revision. Сцены проходят
общую валидацию/локализацию; interactions должны быть пустыми. Это конечная сцена
конкретного события. Следующее событие начинает с неё, а не с финала всей команды.
Пример: `packs/snakes/presentation/scene.js` для автоматического второго кубика.
Пак строит кадры из публичных фактов; host не повторяет разрешение правил.

## Release 0.19 integration invariants

Await asynchronous prepare before starting effects. Concurrent cues share one group; advance only after all finite animation/audio promises and the minimum display interval finish (maximum duration, not their sum). Explicit delay cues share pause/rate/cancel. Infinite selection pulses never hold a group. Instant speech prioritizes the answer sound over the question.

Use authorized eventScenes for intermediate hand/count/board/result changes. Transfer cards first, then remove a completed set/pair, reveal it, then expose its result miniature. Rules commit independently of playback. History never exposes live controls. Exit places/timing are rule facts, not inferred from visual order.

Capture only objects needed by the effect; do not clone whole hands or layouts for selection, rotation, or dice-only actions. Retain geometry, not hidden private markup. Viewport changes invalidate pixel reserves; absent/empty hands retain their declared layout zone. Test the generated offline artifact with the exact companion; source tests and publication are separate evidence.

## Перетаскивание: рабочая ветка после 0.8.2

Паки используют общий input приложения, без собственных pointer-обработчиков. Источник — `data-drag-piece` с уникальным ID; цель — `H.target(id, legalAction)` (для фишек также `H.boardTarget` с тем же `data-drop-piece`). `data-drop-snap` включает центрирование призрака. `data-drop-zone` расширяет попадание до контейнера и выбирает ближайшую разрешённую позицию. `fieldDropZone:true` предоставляет зону на общей оболочке поля, в том числе для групп `display:contents`.

Лудо сохраняет выбор фишки через `data-drag-view-key="pawn"`. Змеи и лестницы предлагают только текущие разрешённые клетки выбранного броска/поправки. Дурак допускает сброс в поле для атаки и защиты; несколько защит выбираются по позиции, перевод остаётся явной командой. UNO оставляет явный выбор цвета джокера. Домино выбирает ближайший разрешённый конец. Обработка не вычисляет правила и не раскрывает скрытые карты.

Требуется приложение 0.19.3-preview.1 или новее; это расширение ещё не опубликовано в стабильной коллекции 0.8.2. Контракт: [UI API](https://github.com/GraphGiraffe/boardgame-playroom/blob/dev/docs/GAME-ELEMENTS-API.md).

В приложении 0.19.3 структурная сетка `fieldGroups` фиксирует вычисленные треки, зазоры и выравнивание до смены viewport/масштаба либо действия с `H.actionAttr(command,{allowLayoutChange:true})`. Собственные структурные сетки обозначайте стабильным уникальным `data-layout-grid`. Резервируйте полную вместимость заранее; фиксация не создаёт недостающие ячейки. Не заменяйте контур незаполненного места символом принятого действия при выборе/перетаскивании.

### Semantic tutorial checklist (optional host extension)

Keep the pure definition factory in `presentation/tutorial.js`, included in `sourceModules.view` only. Inject the translator; do not read host registries from this module. A view calls `V.registerTutorial?.(packId, ({state, viewer, actions, ui, guideProgress}) => definition)` after `V.register`. Use only public projected state and local UI choices. The host owns the passive cursor, 500 ms input-idle delay, per-user/per-pack enabled preference, confirmed reset and persistent learned-action records across matches. Do not dispatch game actions or run a separate animation loop.

Return priority-ordered `steps` with stable semantic `id`, `selector`, localized `text`, and a complete `required` ID list when visible steps depend on phase. `available:false` defers a goal and blocks local-click completion until prerequisites hold. Missing controls defer a goal; completed goals stay completed across turns. Distinguish first/second card, ordinary/wild play, base exit/normal movement and exceptional actions. Never demand a specific card, opponent or input method.

`actions` matches successful command types; `match(action)` refines their meaning using the captured public pre-command state. The host captures before dispatch and completes after success, including delayed network ACKs. `interaction:true` also accepts local selection clicks; omit it for commands that can be rejected. Optional `completion` lists semantic matchers independently of currently displayed steps, useful for drag-and-drop shortcuts. `concurrent` permits simultaneous decisions; `complete` temporarily hides a finished decision window, not the remaining persistent checklist. Legacy first-turn boundary fields no longer terminate learning. See [the pack action inventory](TUTORIAL-ACTIONS.md).

The pack owns the action catalogue, never the user completion ledger. Keep semantic IDs stable. Supply numeric revisions through `definition.revisions`, returned `guide.revisions`, or `step.revision` (default 1); increase the revision only when an action needs to be learned again. New IDs are unlearned, unchanged revisions remain learned across pack upgrades. Prefer a complete revisions map for goals not visible in every phase. Removed goals are ignored; changing the pack version does not reset progress. Disabling learning stops tracking as well as hints; re-enabling resumes saved progress. Reset requires confirmation and affects only this user and pack.

The tutorial factory result exposes `goals: [{id, text, revision}]` as the full pack-owned checklist, available without a running match. The host renders disabled checkboxes from the user ledger and shows completion only when every current revision is mastered. Store revisions on `tutorial.revisions` so both controller and checklist share the same values.
