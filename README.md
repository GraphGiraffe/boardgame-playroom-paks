# ХОД · коллекция 0.7.3

В рабочей ветке добавлены **Косынка** и **Паук** (по одному человеку), набор `mini-split-deck` и наследование скинов. Это ещё не опубликованная коллекция; стабильные ссылки ниже относятся к предыдущему выпуску.

12 игр для [приложения 0.18.1](https://github.com/GraphGiraffe/boardgame-playroom/releases/tag/v0.18.1), engineApi 3 / viewApi 2. [Релиз](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases/tag/v0.7.3). Коллекция и отдельные версии игр независимы; правила/представления/локализация принадлежат каждому паку.

| Игра | ID | Версия | Игроки |
|---|---|---|---|
| Морской бой | battleship | 0.2.1 | 2 |
| Шашки | checkers | 0.4.1 | 2 |
| Домино | domino | 0.4.1 | 2, 3, 4 |
| Дурак | durak | 0.5.1 | 2, 3, 4, 5, 6 |
| Спроси рыбу | gofish | 0.2.1 | 2, 3, 4, 5, 6 |
| Лудо | ludo | 0.2.1 | 2, 3, 4 |
| Акулина | oldmaid | 0.2.1 | 2, 3, 4, 5, 6 |
| Пексесо | pexeso | 0.2.1 | 2, 3, 4 |
| Змеи и лестницы | snakes | 0.4.1 | 2, 3, 4, 5, 6 |
| Крестики-нолики | tictactoe | 0.2.0 | 2 |
| UNO | uno | 0.5.1 | 2, 3, 4, 5, 6 |
| Ятзи | yatzy | 0.2.1 | 2, 3, 4, 5, 6 |

Скачайте отдельный .playroom-pack.json или ZIP коллекции; установите JSON через «Паки игр». Поставки автономны, без обязательного CDN. Новые игры получают текущую версию, сохранения закреплены за точной packVersion. API 1/2 не исполняются в 0.18; исходные архивы доступны для экспорта, без молчаливой миграции.

```sh
bash scripts/codex/setup.sh
bash scripts/codex/check.sh
python3 build.py --output-dir dist/release-0.7.3
```

Самостоятельный check не проверяет игровой браузер. Совместно из приложения подготовьте --packs-dir и запустите выбранные blocks/case. [AUTHORING](docs/AUTHORING.md) · [архитектура](docs/ARCHITECTURE.md) · [Cloud](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/packs/CODEX-CLOUD.md) · [CONTRIBUTING](CONTRIBUTING.md) · [будущие патчи](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/packs/NEXT-PATCHES.md).

Общие компоненты и ассеты — shared/components, shared/assets и shared/asset-packs. [Визуальные контракты](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/UI-DESIGN-SYSTEM.md). Будущие Паук/Косынка/Тысяча и новые скины пока не зарегистрированы.
