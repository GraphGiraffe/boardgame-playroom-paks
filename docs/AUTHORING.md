# Автору пака · API 3 / UI 2

Перед изменением ресурсов и UI: [инварианты упаковки, скинов и проверки ошибок](DEVELOPMENT-REGRESSIONS.md). Исходники не являются составом готового пака.

## Слои

`packs/<id>/manifest.json` — метаданные/версии/режимы/доступные места/settings/capabilities/sourceModules. `domain/` — чистые правила. `presentation/` — SceneModel, ActionChoice labels и Event presentation после projection. `locales/ru/` — тексты. `rules.js` — только регистрация Definition в SDK. `view.js`/styles.css — Web renderer через общие компоненты; необязательные assets поставляются локально.

Эталоны: **tictactoe** (простое поле/полная модель), **yatzy** (публичные кубики/таблица/подтверждение), **gofish** (скрытая рука и публичные события), **private-counter** в examples (не входит в коллекцию).

```json
{"sourceModules":{"rules":["domain/game.js","presentation/scene.js"],"view":["presentation/scene.js"],"locales":{"ru":["locales/ru/game.json"]}}}
```

GameModel Definition contractVersion=1: create/validate/actions/reduce/project/result/bot, дополнительные start/score/observe/reactions при необходимости. actions возвращают command + visibility; reduce возвращает position/events/turnEnded и при объявленном цикле roundEnded. Actor и viewer различать. RNG хранить в состоянии и передавать явно; бот видит разрешённую проекцию/память, не неизвестные карты.

Domain события — typed facts с visibility; presentation добавляет MessageRef, speech/notice/sound/feedback/reveal/sequence. Сначала privacy, потом перевод и Web. Полное состояние не передаётся гостю и не прячется CSS. Описание событий/метрик/прогресса — [SDK 0.18](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/SDK-0.18.md).

## UI

`PlayroomViews.register` принимает renderer элементов сцены. Общие Source/Target/Hand/BoardTarget/ScoreTable/Avatar/Reveal обслуживает приложение. Пак не рисует собственную шапку/toolbar/карточки игроков. Fixed scene default; один флаг allowLayoutChange может принадлежать только конкретному действию. Правила не зависят от DOM.

Рука прокручивается с любой карты, скрытые передачи рубашкой, публичные пары/сеты раскрываются общим reveal. Мини-руки обрезаны и перекрываются во всех рассадках. Доска с fieldSizing=fit сохраняет fieldAspect. Метрики/бейджи семантические, не распознаются по тексту. Скин меняет оформление после projection, не действие и не RNG.

## Сборка

```sh
python3 build.py --include-examples --output-dir dist/authoring
bash scripts/codex/check.sh
# in the companion app, with this exact checkout
python3 build.py --prepare-dev --all-games --packs-dir ../playroom-paks/packs
node scripts/codex/test.cjs case/pack-models,case/view-contract
```

Для новой игры добавить её в явный каталог/публикацию/проверки приложения и коллекции отдельным изменением; файл каталога не создаётся автоматически от появления папки. Найдите actual allowlists в build.py/scripts/publish-packs.py и loaders/smoke; не добавлять пустую игру. SourceModules собирает канонический shared/pack_compiler.py, manifest.js генерируется из JSON. Не редактировать generated manifest руками.

Новая логика требует соответствующих сценариев в существующем runner: варианты, deterministic seed, legal actions, privacy, result, restore/replay, bot, публичный Стол, mobile layout/gestures. Standalone syntax/build не заменяет эти проверки.

## Версии и выпуск

Неизменяемая packVersion при публикации; stateVersion меняется при форме данных, engineApi — при SDK. Поставки должны сохранять точные старые версии. Asset pack dependencies также точные. Коллекция 0.7.0 не заставляет менять правила каждой игры. Канонические shared-компоненты синхронизируются в host с digest, поэтому для их изменения нужна проверка обоих builder и общих потребителей.

[Процедура релиза](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/app/RELEASING.md), [реестр механик](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/MECHANICS.md), [UI API](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/GAME-ELEMENTS-API.md).

## Метаданные редактора правил (0.18.1)

Необязательное `settings[].control` принимает `slider` или `select`; без указания сохраняется список. У слайдера позиции соответствуют порядку `options`, а сохранённые значения остаются `options[].value`, включая строковый `0` для отсутствия лимита. `label` и `help` задают подпись и справку. Колоды используют `select`.

`presetSetting: {label, help, control, options: [{value, label}]}` переименовывает и упорядочивает выбор preset в редакторе, не меняя domain IDs или значения по умолчанию. `ruleGroups: [{label, fields: ["preset", "deck"]}]` задаёт смысловые блоки по две ячейки в строке; `fields` ссылается на preset или settings key. Флаг `end: true` переносит блок завершения в конец после общих параметров. Каждый параметр перечислять один раз. Отсутствующие в группах поля сохраняются в редакторе, единственный вариант скрывается. `visibleWhen` проверяется по точным значениям правил, а не индексам слайдеров. Это метаданные Web UI, без изменения engineApi/viewApi/stateVersion.

В новых играх Рыбы/Акулины колода 54 не предлагается. Акулина показывает число карт в партии — 35/51, сохраняя внутренние deck IDs 36/52. Domain сохраняет чтение старых состояний с 54 картами; точные прежние опубликованные паки не переписываются.

## Скины компонентов

`skinFamilies: ["card-face", "card-back"]` перечисляет применимые типы, `defaultSkins: {"card-face":"mini-split"}` задаёт исходный вид. Индивидуальный выбор пользователя и явно выбранный Основной имеют приоритет. Настройки хранятся локально в приложении; пак не создаёт своё хранилище и не добавляет скин в правила/сохранение. Renderer использует общий asset resolver с контекстом пака. Типизированные метаданные проверяются compiler/runtime; новая metadata опубликованного пака требует новой packVersion.

Новые исходные паки `spider` и `klondike` используют общий чистый `shared/domain/solitaire.js` и `solitaire-board` без очередности ходов. Подсказки вычисляются из разрешённых публичных действий, не из запаса/истории authority.


### Читаемые зоны карточного скина

`shared/assets/catalog.json` → `card-face.stacking[variant]` хранит `protectedZones` (x/y/width/height в долях лица), минимальную открытую долю `horizontal`, `vertical`, `arc`, шаг рубашек `faceDown` и направление `wasteAxis`. Цветовые варианты используют одинаковую геометрию. Эти данные принадлежат ассетам, не правилам игры. Большой центральный знак требует большего открытого участка, чем компактный угловой индекс.

`helpers.assetLayout('card-face')` возвращает параметры активного скина для текущего пака. SVG лица также несёт `data-card-stacking`: общий fitter руки/веера и горизонтальных стопок использует минимум открытой доли; при нехватке места сохраняется прокрутка. Пасьянсы получают из тех же метаданных вертикальный шаг и направление сброса. Поле игры определяет раскладку, ассет — ограничения перекрытия. Переключение скина не меняет состояние партии.


Карточные сцены (`family:'cards'`) получают цвет поля от приложения: светло-зелёный/тёмно-зелёный по текущей теме. `PlayroomShared.cardSlot({label,suit,kind,attrs,className})` отображает пустое место карты, при заданной масти используя активный скин; `kind` описывает существующую игровую зону, не создаёт действие. Для локальной ошибки предусмотрен `data-feedback-required="<selector>"`: Input подсвечивает выбранные элементы внутри текущей сцены и не отправляет игровую команду. Предикат запрета и selector задаёт renderer из доступных действий и публичного состояния.


Колода персонажей: `character-face` — отдельное семейство от `card-face`. Сцена Пексесо выбирает актуальное семейство по типу колоды; демонстрационный объект для всех трёх вариантов — `circle-red`. Общие наборы персонажей сохраняют ID фигур/цветов и не влияют на пары или правила. Наборы аватаров используются приложением отдельно от предпочтений скинов пака.

### Подготовленная сборка и исходники

Компилятор оставляет потреблённые domain/presentation/locales модули только внутри правил и представления, не рядом вторыми файлами. scripts/styles общего набора также входят в view.js/styles.css один раз. Исходники остаются в репозитории и source ZIP. Авторские .md/.txt из assets не входят в runtime. Аудио хранится в assets/ один раз: sounds.js задаёт метаданные и получает src через PlayroomPack.asset, без второй base64-копии. Подробные персонажи characters — архивный набор; рабочие стили minimal («Стандартный») и simple («Простой»).
