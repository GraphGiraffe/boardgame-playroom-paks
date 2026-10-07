# ХОД · игровые паки

Отдельный репозиторий готовых игр для [приложения и движка](https://github.com/GraphGiraffe/boardgame-playroom): **UNO, домино, дурак, шашки, змеи и лестницы**.

Первая поставка — **0.1.0**, API движка **1**. Правила, варианты игры, бот, представление, стили, звуки и ресурсы принадлежат соответствующему паку. Исходники приложения здесь не дублируются. Соседняя игра про магов не включена.

## Установка

1. Скачайте `playroom.html` из релиза приложения и откройте в браузере.
2. Из [релиза паков](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases) скачайте нужный `.playroom-pack.json`.
3. В приложении откройте **«Паки игр»**, выберите файл, просмотрите сведения и подтвердите установку.

Пак содержит исполняемый код: подтверждайте установку, если доверяете его автору. Интернет для дальнейшей игры не нужен. Архив `playroom-paks-0.1.0.zip` содержит все пять установочных файлов; перед установкой их нужно извлечь.

Чтобы обновить игру, установите её новый файл. Приложение хранит прежние версии для начатых партий и завершённых повторов. Версии приложения и игр не обязаны совпадать. Содержимое уже выпущенной версии не заменяется.

## Исходники

```text
packs/
  uno/
  domino/
  durak/
  checkers/
  snakes/
```

В каждом паке: `manifest.json` — основной источник метаданных; `rules.js`, `view.js`, `styles.css`; при необходимости `sounds.js`, `assets/`. `manifest.js` генерируется для совместимости модульных проверок и не является независимым источником настройки.

## Сборка и проверка

Python 3.9+, без внешних производственных зависимостей:

```sh
./build.sh
(cd dist && sha256sum -c SHA256SUMS)
```

В `dist/` появляются пять `.playroom-pack.json`, общий ZIP, архив исходников и контрольные суммы. `--output-dir` задаёт другую папку.

CI запускает те же `scripts/codex/setup.sh` и `check.sh`, проверяя синтаксис скриптов, сборку контейнеров и контрольные суммы. Полная проверка правил, мобильного интерфейса и обновлений выполняется вместе с приложением:

```sh
cd ../playroom
./build.sh --packs-dir ../playroom-paks/packs --prepare-dev --all-games
npm ci
npm test
```

Для другого расположения checkout укажите свой `--packs-dir`. Совместные тесты используют установленный Chrome/Chromium; путь задаётся `CHROME_BIN`.

## Codex Cloud

Для полной проверки выберите этот репозиторий и `boardgame-playroom` в одном окружении. Самостоятельно выполняются `bash scripts/codex/setup.sh` и `bash scripts/codex/check.sh`, без npm. При доступном приложении из корня паков используйте `bash scripts/codex/setup.sh --app-dir PATH` и `bash scripts/codex/check.sh --full --app-dir PATH`.

[Инструкция Cloud с готовым текстом настройки](docs/CODEX-CLOUD.md) разделяет сборку паков и совместную браузерную проверку. [AGENTS.md](AGENTS.md) описывает проектные правила; фактическая публикация Cloud-окружения выполняется отдельно.

## Создание своих игр

Действующий формат описан в [PACK-FORMAT.md приложения](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/PACK-FORMAT.md), механики — в [PACKS.md](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/PACKS.md). Подробный учебник, шаблон, рекомендации по адаптивной сцене, форматам и стилистике ассетов [запланированы отдельно](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/AUTHORING-PLAN.md).

Порядок работы с ветками и релизами: [CONTRIBUTING.md](CONTRIBUTING.md).


## Следующий блок: preview для телефона и ПК

В `feature/authority-responsive-preview`: UNO 0.2.0, дурак 0.1.1; коллекция 0.2.0-preview.1 ещё не опубликована. Приложение companion — одноимённая ветка boardgame-playroom, 0.14.0-preview.1. Две дополнительные поверхности пока только у UNO. Старые 0.1.0-партии требуют старый установленный пак; обновление не переписывает его.

Общий helper H.art задаёт каноническую геометрию. В mini-hand callback получает `{variant:'compact'}`; при отсутствии компактного рисунка используется основной. Интерактивные кнопки сохраняют собственную геометрию/доступность. UNO и дурак содержат оба рисунка, без новых ID компонентов.

Учебный пример: [examples/private-counter](examples/private-counter/README.md). `python3 build.py --include-examples` дополнительно собирает его JSON; обычный build сохраняет коллекцию из пяти игр. Пример не копирует код ядра в паки.

Для LAN-проверки из каталога приложения:

```sh
node dev/server.cjs --packs-dir ../boardgame-playroom-paks/packs --lan --players 4
```

Это тестовая партия в памяти Node, только доверенная сеть. Подробная инструкция находится в `boardgame-playroom/docs/PREVIEW-TESTING.md`; контракты — SESSION-AUTHORITY.md и CARD-ART.md рядом с ней.
