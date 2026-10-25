# ХОД · коллекция 0.8.3

15 опубликованных игр для [приложения 0.19.3](https://github.com/GraphGiraffe/boardgame-playroom/releases/tag/v0.19.3), engineApi 4 / viewApi 3. [Релиз коллекции](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases/tag/v0.8.3). Версии игр независимы; таблица ниже описывает опубликованную 0.8.3.

Патч 0.8.3: drag-and-drop и примагничивание в пяти паках, постоянные места колоды/шести пар и козырный жетон Дурака, объёмное поле крестиков-ноликов и обновлённая обложка Морского боя. Используйте приложение 0.19.3 для нового ввода и фиксации компоновки.

| Игра | ID | Версия | Игроки |
|---|---|---|---|
| Морской бой | battleship | 0.3.2 | 2 |
| Шашки | checkers | 0.5.0 | 2 |
| Домино | domino | 0.5.1 | 2, 3, 4 |
| Дурак | durak | 0.6.2 | 2, 3, 4, 5, 6 |
| Спроси рыбу | gofish | 0.3.0 | 2, 3, 4, 5, 6 |
| Косынка | klondike | 0.2.0 | 1 |
| Лудо | ludo | 0.3.2 | 2, 3, 4 |
| Стихийная потасовка | mage-brawl | 0.2.2 | 2, 3, 4, 5, 6, 7, 8 |
| Акулина | oldmaid | 0.3.0 | 2, 3, 4, 5, 6 |
| Пексесо | pexeso | 0.3.0 | 2, 3, 4 |
| Змеи и лестницы | snakes | 0.5.2 | 2, 3, 4, 5, 6 |
| Паук | spider | 0.2.0 | 1 |
| Крестики-нолики | tictactoe | 0.3.1 | 2 |
| UNO | uno | 0.6.1 | 2, 3, 4, 5, 6 |
| Ятзи | yatzy | 0.3.0 | 2, 3, 4, 5, 6 |

Скачайте отдельный .playroom-pack.json или ZIP коллекции; установите JSON через «Паки игр». Поставки автономны, без обязательного CDN. Новые игры получают текущую версию, сохранения закреплены за точной packVersion. API 1/2/3 не исполняются в 0.19; исходные архивы доступны для экспорта, без молчаливой миграции.

```sh
bash scripts/codex/setup.sh
bash scripts/codex/check.sh
python3 build.py --output-dir dist/release-0.8.3
```

Самостоятельный check не проверяет игровой браузер. Совместно из приложения подготовьте --packs-dir и запустите выбранные blocks/case. [AUTHORING](docs/AUTHORING.md) · [архитектура](docs/ARCHITECTURE.md) · [Cloud](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/packs/CODEX-CLOUD.md) · [CONTRIBUTING](CONTRIBUTING.md) · [будущие патчи](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/packs/NEXT-PATCHES.md).

Общие компоненты и ассеты — shared/components, shared/assets и shared/asset-packs. [Визуальные контракты](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/UI-DESIGN-SYSTEM.md). Косынка, Паук и Стихийная потасовка опубликованы. Тысяча и дальнейшие расширения остаются в roadmap.
