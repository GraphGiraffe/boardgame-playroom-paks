# Автору пака · API 3 / UI 2

## Слои

`packs/<id>/manifest.json` — метаданные/версии/режимы/доступные места/settings/capabilities/sourceModules. `domain/` — чистые правила. `presentation/` — SceneModel, ActionChoice labels и Event presentation после projection. `locales/ru/` — тексты. `rules.js` — только регистрация Definition в SDK. `view.js`/styles.css — Web renderer через общие компоненты; необязательные assets поставляются локально.

Эталоны: **tictactoe** (простое поле/полная модель), **yatzy** (публичные кубики/таблица/подтверждение), **gofish** (скрытая рука и публичные события), **private-counter** в examples (не входит в 12 игр).

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

[Процедура релиза](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/RELEASING.md), [реестр механик](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/MECHANICS.md), [UI API](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/GAME-ELEMENTS-API.md).

## Метаданные редактора правил (0.18.1)

Необязательное `settings[].control` принимает `slider` или `select`; без указания сохраняется список. У слайдера позиции соответствуют порядку `options`, а сохранённые значения остаются `options[].value`, включая строковый `0` для отсутствия лимита. `label` и `help` задают подпись и справку. Колоды используют `select`.

`presetSetting: {label, help, control, options: [{value, label}]}` переименовывает и упорядочивает выбор preset в редакторе, не меняя domain IDs или значения по умолчанию. `ruleGroups: [{label, fields: ["preset", "deck"]}]` задаёт смысловые блоки по две ячейки в строке; `fields` ссылается на preset или settings key. Флаг `end: true` переносит блок завершения в конец после общих параметров. Каждый параметр перечислять один раз. Отсутствующие в группах поля сохраняются в редакторе, единственный вариант скрывается. `visibleWhen` проверяется по точным значениям правил, а не индексам слайдеров. Это метаданные Web UI, без изменения engineApi/viewApi/stateVersion.

В новых играх Рыбы/Акулины колода 54 не предлагается. Акулина показывает число карт в партии — 35/51, сохраняя внутренние deck IDs 36/52. Domain сохраняет чтение старых состояний с 54 картами; точные прежние опубликованные паки не переписываются.
