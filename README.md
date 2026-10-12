# ХОД · игровые паки 0.4.0

Стабильная коллекция для [ХОД 0.15.0](https://github.com/GraphGiraffe/boardgame-playroom/releases/tag/v0.15.0). Правила, варианты игры, бот, представление, стили и ресурсы принадлежат своему паку; приложение и движок поставляются отдельно.

| Игра | Версия |
| --- | --- |
| checkers | 0.3.2 |
| domino | 0.3.4 |
| durak | 0.3.5 |
| snakes | 0.3.5 |
| uno | 0.4.6 |

API движка **1**, представления **2**, формат контейнера **1**, stateVersion **1**. Версия коллекции независима от версий игр. Существующие версии при переходе в stable не переписываются.

## Установка

Скачайте `.playroom-pack.json` из [релиза 0.4.0](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases/tag/v0.4.0), откройте в приложении «Паки игр» и подтвердите установку. Коллекционный ZIP сначала распакуйте. Пак содержит исполняемый код — устанавливайте доверенные файлы. После установки игры работают без CDN.

Партия требует свою точную версию пака. Новая версия не мигрирует старые сохранения автоматически; view API 1 не поддерживается приложением 0.15. Старые релизные файлы остаются в истории.

## Исходники и проверка

Каждый `packs/<id>/` содержит manifest.json, rules.js, view.js, styles.css и опциональные sounds.js/assets/config. manifest.js генерируется из JSON и не редактируется независимо.

Python 3.9+ и Node.js 22+:

```sh
bash scripts/codex/setup.sh
bash scripts/codex/check.sh
python3 build.py --output-dir dist/release-0.4.0
(cd dist/release-0.4.0 && sha256sum -c SHA256SUMS)
```

Полная проверка с соседним checkout приложения:

```sh
bash scripts/codex/setup.sh --app-dir ../playroom
bash scripts/codex/check.sh --full --app-dir ../playroom
```

Для других путей замените --app-dir. Самостоятельный check проверяет упаковку/JS, совместный — правила, приватность, сохранения и браузерный UI. [Cloud](docs/CODEX-CLOUD.md), [AGENTS](AGENTS.md), [CONTRIBUTING](CONTRIBUTING.md).

## Создание игр

[Руководство автора](docs/AUTHORING.md) объясняет цикл от учебного private-counter до установки собственного JSON. Контракты приложения: [правила](https://github.com/GraphGiraffe/boardgame-playroom/blob/v0.15.0/docs/PACKS.md), [контейнер](https://github.com/GraphGiraffe/boardgame-playroom/blob/v0.15.0/docs/PACK-FORMAT.md), [UI API 2](https://github.com/GraphGiraffe/boardgame-playroom/blob/v0.15.0/docs/GAME-ELEMENTS-API.md), [дизайн](https://github.com/GraphGiraffe/boardgame-playroom/blob/v0.15.0/docs/UI-DESIGN-SYSTEM.md).

Дальнейшие SDK/ресурсы/игры перечислены в общем [Roadmap](https://github.com/GraphGiraffe/boardgame-playroom/blob/v0.15.0/docs/ROADMAP.md). Отдельного Node-host для production не требуется.
