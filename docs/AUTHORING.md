# Создание пака для PlayRoom 0.18 · engineApi 3

Коллекция-кандидат 0.7.0-rc.1 совместима с приложением 0.18.0-rc.1; стабильная прежняя пара остаётся 0.6.5 / 0.17.6. Новая оболочка не исполняет engineApi 1/2. UI API 2 и контейнер formatVersion 1 сохраняются. Контракт и примеры: [REFACTOR-0.18](REFACTOR-0.18.md), SDK приложения `docs/SDK-0.18.md`, `examples/private-counter`, `packs/tictactoe`.

## Начать с примера

```sh
python3 build.py --include-examples --output-dir dist/authoring
python3 ../playroom/build.py --prepare-dev --all-games --packs-dir packs
cd ../playroom
node scripts/codex/test.cjs core/model,case/view-contract
```

Запускайте runner из каталога приложения, если проверка использует его cwd. Для совместной сборки/браузера используйте `scripts/codex/setup.sh --app-dir ../playroom`. Выпуск основной коллекции не включает учебные игры: `python3 build.py --output-dir dist/release`.

## Исходники

```text
packs/my-game/
  manifest.json
  rules.js
  domain/game.js
  presentation/scene.js
  locales/ru/game.json
  view.js
  styles.css
  assets/
```

Manifest объявляет engineApi:3, stateVersion, viewApi:2, id/version, точки входа и sourceModules. В sourceModules rules перечисляются domain и presentation модули; view — только нужные представлению модули; locales.ru — JSON файлы. `sharedDomain` перечисляет имена файлов shared/domain без расширения (например standard-deck, token-layout, end-policy). Builder один для обоих репозиториев: shared/pack_compiler.py; manifest.js генерируется.

## Правила и события

Фабрика GameDefinition получает детерминированные порты. create/validate/actions/reduce/project/result не импортируют браузер или приложение. Команда JSON не содержит label/HTML. Choice явно public или private; Table получает только public команды отдельно выданного actor при viewer=-1. Закрытые карты/поля и private события проецируются до presentation. Подсветка кнопки не защищает уже переданную тайну.

Reducer возвращает position/events и turnEnded. Только настоящий конец хода увеличивает timeline.turn; revision растёт по каждому действию. Для постоянного круга объявите rounds:true и roundEnded; для собственного счётчика верните scene.round с number/limit/starts. В UNO круг не объявляется. Пак может реализовать свои условия конца и max rounds; settings только отображают выбор, а не вычисляют исход.

Result содержит winners, places, metrics; показатели карточек и результатов связываются семантическими ID. Bot получает разрешённую проекцию/легальные команды, observation хранит допустимую память. Reaction использует episode/once/window, как UNO; время приходит через authority ports.

Presentation задаёт metadata/presets descriptions, MessageRef, scene metrics, публичные sound/transfer/speech. Значения скрытых карт не нужны для анимации их передачи. Все русские подписи, справки, события и aria находятся в JSON; ошибки domain — коды.

## Настройки и справки

Setting содержит key, label, default, options и help. Для единственного варианта завершения setting отсутствует; допускаются собственные варианты паков. Связанные поля используют visibleWhen. Каждый preset имеет description. Справка автоматически располагает основные правила, режимы и настройки. Примеры ограничений и последних раундов — Лудо, Змеи, Ятзи; end-policy — чистая библиотека подходящих общих операций.

## Web и компоненты

view возвращает elements API 2 для combined/player/table; CSS ограничивается сценой. Source/target, hand navigation, gestures, scroll, player/result cards, metrics, public bubbles и motion anchors переиспользуют helpers SDK. Размеры рисунка/номера/ободка масштабируются одним artboard, отдельно текст не сдвигается. Canonical RoundToken и token-layout обеспечивают клетку/стопку/веер/финишный треугольник. Общая палитра/AssetResolver разрешает family/variant/material; скин не меняет идентичность, значение, приватность или action.

На Table видны все публичные элементы (включая кубики), закрытые руки — спинками. Нет личных действий без public grant. Personal surface сетевого игрока сохраняет необходимые приватные цели, руку и кубики; расстановка флота не допускает скрытие поля. Подключённый Table и восстановление поля контролирует хост UI.

## Проверки и выпуск

Выберите конкретные блоки/сценарии приложения; standalone build не доказывает браузер/правила. Не повторяйте весь совместный прогон в обоих репозиториях. Проверяйте все варианты правил, участников/первого игрока, hidden/open projections, ботов, replay/restore, 320/390 px и короткий landscape, жесты и сохранение scroll.

Публикуйте только новые immutable версии, точные SHA и checksums. Для RC используйте отдельный R2 channel, например 0.18-rc.1; prerelease нельзя направить в production. Workflow публикации требует явное checks=none, поскольку публикует уже проверенные immutable assets; build/gate запускается отдельно выбранными блоками.

## Библиотека общих ассетов

[Каталог SVG, шаблона таблицы и звуков](../shared/assets/README.md) содержит размеры, варианты круглого диска и правила раскладки стопкой и веером. Исходные шаблоны включены в архив исходников коллекции; нужные SVG добавляются в автономный пак через `sharedAssets`.

## Крупный показ подходящих публичных действий

Добавляйте presentation.reveal только к смысловым публичным фактам. Формат/матрица 12 игр — companion SDK-0.18.md. Карта/кость передаёт уже публичную face + destination entity; Web view использует свой прежний renderer в `register(...,{reveal})`. Кубики передают значения и active mask. Ятзи сохраняет в scored фактические dice, а маску считает общая чистая categories.participation; обычные броски без reveal. Вопросы/ответы остаются баблами; закрытые передачи, добор, корабли и чужие руки не получают лиц для увеличения.

## Самостоятельные ассеты RC4

`shared/asset-packs/<id>/manifest.json` имеет `format: playroom-asset-pack`, `formatVersion: 1`, точные `id/version`, `files` и необязательные `scripts/dependencies`. Зависимость — `{id,version}`; версии и циклы проверяет compiler. Manifest игры объявляет `sharedAssetPacks: ["cartoon-deck"]`; ресурсы доступны через `PlayroomPack.asset("assets/shared-packs/characters/runtime/circle-red.webp")`. Скрипты подключаются перед view. Compiler включает транзитивные ресурсы в immutable JSON; независимые ZIP собираются с SHA256SUMS. Это контракт сборки; интерфейс импорта произвольных asset ZIP отдельно пока не реализован.

`characters@0.1.0` содержит 48 канонических PNG 512×512 с alpha и runtime WebP 256×256; `cartoon-deck@0.1.0` зависит от него, задаёт 48 лиц с белой основой 5:7 и renderer. Пара Пексесо — идентичные персонаж и цвет. Простые геометрические карточки исключены по решению владельца.

### Стили переиспользуемого asset-пака

Манифест playroom-asset-pack может объявлять `styles: ["styles.css"]` наряду с `scripts`. Builder встраивает эти стили в styles.css игры, в порядке зависимостей, до собственных стилей; файл также перечисляется в files и входит в отдельный ZIP набора. Самостоятельный образец — shared/asset-packs/mini-cards. Старые наборы без styles компилируются как прежде.
