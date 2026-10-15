# ХОД · игровые паки 0.6.5

Коллекция для [ХОД 0.17.6](https://github.com/GraphGiraffe/boardgame-playroom/releases/tag/v0.17.6) из 12 игр опубликована как [релиз 0.6.5](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases/tag/v0.6.5) и в защищённом каталоге R2. Правила, варианты игры, бот, представление, стили и ресурсы принадлежат своему паку; приложение и движок поставляются отдельно.

Паки публикуются отдельно от оболочки приложения. Общие [игровые ассеты и правила масштабирования](shared/assets/README.md) входят в архив исходников коллекции и в отдельный `playroom-shared-assets-0.6.5.zip`.

| Игра | Версия |
| --- | --- |
| checkers | 0.3.5 |
| domino | 0.3.7 |
| durak | 0.4.4 |
| battleship | 0.1.8 |
| gofish | 0.1.4 |
| ludo | 0.1.12 |
| oldmaid | 0.1.5 |
| pexeso | 0.1.6 |
| tictactoe | 0.1.3 |
| yatzy | 0.1.5 |
| snakes | 0.3.9 |
| uno | 0.4.9 |

API движка **1 и 2**, представления **2**, формат контейнера **1**; stateVersion задаётся каждым паком. Версия коллекции независима от версий игр. Существующие версии при переходе в stable не переписываются.

## Установка

Соберите текущие `.playroom-pack.json` из исходников или скачайте их после публикации релиза; прежние стабильные файлы доступны в [релизе 0.4.0](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases/tag/v0.4.0). В приложении откройте «Паки игр» и подтвердите установку. Коллекционный ZIP сначала распакуйте. Пак содержит исполняемый код — устанавливайте доверенные файлы. После установки игры работают без CDN.

Партия требует свою точную версию пака. Новая версия не мигрирует старые сохранения автоматически; view API 1 не поддерживается приложением 0.15. Старые релизные файлы остаются в истории.

## Исходники и проверка

Каждый `packs/<id>/` содержит manifest.json, rules.js, view.js, styles.css и опциональные sounds.js/assets/config. Общие исходники изображений, таблиц, звуков и компонентов лежат в `shared/`; сборщик встраивает выбранные SVG по `sharedUi` и `sharedAssets` в конкретный автономный пак. Полная библиотека включена в архив исходников. manifest.js генерируется из JSON и не редактируется независимо.

Python 3.9+ и Node.js 22+:

```sh
bash scripts/codex/setup.sh
bash scripts/codex/check.sh
python3 build.py --output-dir dist/release-0.6.5
(cd dist/release-0.6.5 && sha256sum -c SHA256SUMS)
```

Полная проверка с соседним checkout приложения:

```sh
bash scripts/codex/setup.sh --app-dir ../playroom
bash scripts/codex/check.sh --full --app-dir ../playroom
```

Для других путей замените --app-dir. Самостоятельный check проверяет упаковку/JS, совместный — правила, приватность, сохранения и браузерный UI. [Cloud](docs/CODEX-CLOUD.md), [AGENTS](AGENTS.md), [CONTRIBUTING](CONTRIBUTING.md).

## Создание игр

[Руководство автора](docs/AUTHORING.md) объясняет цикл от учебного private-counter до установки собственного JSON. Контракты приложения: [правила](https://github.com/GraphGiraffe/boardgame-playroom/blob/dev/docs/PACKS.md), [контейнер](https://github.com/GraphGiraffe/boardgame-playroom/blob/dev/docs/PACK-FORMAT.md), [UI API 2](https://github.com/GraphGiraffe/boardgame-playroom/blob/dev/docs/GAME-ELEMENTS-API.md), [дизайн](https://github.com/GraphGiraffe/boardgame-playroom/blob/dev/docs/UI-DESIGN-SYSTEM.md).

Дальнейшие SDK/ресурсы/игры перечислены в общем [Roadmap](https://github.com/GraphGiraffe/boardgame-playroom/blob/dev/docs/ROADMAP.md). Отдельного Node-host для production не требуется.
