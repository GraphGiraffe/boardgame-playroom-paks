# ХОД · игровые паки 0.5.3

Коллекция для ХОД 0.16.3 из 12 игр. Стабильная коллекция 0.4.0 для [ХОД 0.15.0](https://github.com/GraphGiraffe/boardgame-playroom/releases/tag/v0.15.0) остаётся доступной. Правила, варианты игры, бот, представление, стили и ресурсы принадлежат своему паку; приложение и движок поставляются отдельно.

| Игра | Версия |
| --- | --- |
| checkers | 0.3.4 |
| domino | 0.3.6 |
| durak | 0.4.3 |
| battleship | 0.1.4 |
| gofish | 0.1.3 |
| ludo | 0.1.7 |
| oldmaid | 0.1.4 |
| pexeso | 0.1.5 |
| tictactoe | 0.1.2 |
| yatzy | 0.1.4 |
| snakes | 0.3.7 |
| uno | 0.4.8 |

API движка **1 и 2**, представления **2**, формат контейнера **1**; stateVersion задаётся каждым паком. Версия коллекции независима от версий игр. Существующие версии при переходе в stable не переписываются.

## Установка

Соберите текущие `.playroom-pack.json` из исходников или скачайте их после публикации релиза; прежние стабильные файлы доступны в [релизе 0.4.0](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases/tag/v0.4.0). В приложении откройте «Паки игр» и подтвердите установку. Коллекционный ZIP сначала распакуйте. Пак содержит исполняемый код — устанавливайте доверенные файлы. После установки игры работают без CDN.

Партия требует свою точную версию пака. Новая версия не мигрирует старые сохранения автоматически; view API 1 не поддерживается приложением 0.15. Старые релизные файлы остаются в истории.

## Исходники и проверка

Каждый `packs/<id>/` содержит manifest.json, rules.js, view.js, styles.css и опциональные sounds.js/assets/config. Общие исходники изображений и компонентов лежат в `shared/`; сборщик встраивает их по `sharedUi` и `sharedAssets` в конкретный автономный пак. manifest.js генерируется из JSON и не редактируется независимо.

Python 3.9+ и Node.js 22+:

```sh
bash scripts/codex/setup.sh
bash scripts/codex/check.sh
python3 build.py --output-dir dist/release-0.5.3
(cd dist/release-0.5.3 && sha256sum -c SHA256SUMS)
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
