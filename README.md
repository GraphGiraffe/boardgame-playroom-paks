# ХОД · коллекция 0.8.5

15 опубликованных игр для [приложения 0.19.5](https://github.com/GraphGiraffe/boardgame-playroom/releases/tag/v0.19.5), engineApi 4 / viewApi 3. [Релиз коллекции](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases/tag/v0.8.5). Версии игр независимы; таблица ниже описывает опубликованную 0.8.5.

Патч 0.8.4: полные правила всех игр; Стихийная потасовка — одновременные движения, возрождение, короны, награды, взрыв огня и статистика урона. Для обновлённого отображения правил и дробных результатов требуется приложение 0.19.4 или новее.

| Игра | ID | Версия | Игроки |
|---|---|---|---|
| Морской бой | battleship | 0.3.4 | 2 |
| Шашки | checkers | 0.5.2 | 2 |
| Домино | domino | 0.5.3 | 2, 3, 4 |
| Дурак | durak | 0.6.4 | 2, 3, 4, 5, 6 |
| Спроси рыбу | gofish | 0.3.2 | 2, 3, 4, 5, 6 |
| Косынка | klondike | 0.2.2 | 1 |
| Лудо | ludo | 0.3.4 | 2, 3, 4 |
| Стихийная потасовка | mage-brawl | 0.2.4 | 2, 3, 4, 5, 6, 7, 8 |
| Акулина | oldmaid | 0.3.2 | 2, 3, 4, 5, 6 |
| Пексесо | pexeso | 0.3.2 | 2, 3, 4 |
| Змеи и лестницы | snakes | 0.5.4 | 2, 3, 4, 5, 6 |
| Паук | spider | 0.2.2 | 1 |
| Крестики-нолики | tictactoe | 0.3.3 | 2 |
| UNO | uno | 0.6.3 | 2, 3, 4, 5, 6 |
| Ятзи | yatzy | 0.3.2 | 2, 3, 4, 5, 6 |

Скачайте отдельный .playroom-pack.json или ZIP коллекции; установите JSON через «Паки игр». Поставки автономны, без обязательного CDN. Новые игры получают текущую версию, сохранения закреплены за точной packVersion. API 1/2/3 не исполняются в 0.19; исходные архивы доступны для экспорта, без молчаливой миграции.

```sh
bash scripts/codex/setup.sh
bash scripts/codex/check.sh
python3 build.py --output-dir dist/release-0.8.5
```

Самостоятельный check не проверяет игровой браузер. Совместно из приложения подготовьте --packs-dir и запустите выбранные blocks/case. [AUTHORING](docs/AUTHORING.md) · [архитектура](docs/ARCHITECTURE.md) · [Cloud](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/packs/CODEX-CLOUD.md) · [CONTRIBUTING](CONTRIBUTING.md) · [будущие патчи](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/packs/NEXT-PATCHES.md).

Общие компоненты и ассеты — shared/components, shared/assets и shared/asset-packs. [Визуальные контракты](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/UI-DESIGN-SYSTEM.md). Косынка, Паук и Стихийная потасовка опубликованы. Тысяча и дальнейшие расширения остаются в roadmap.

Патч 0.19.5 / 0.8.5: постоянное обучение по действиям с отдельными настройками каждого пользователя и пака; три сложности ботов; исправления сетевого восстановления, параллельной расстановки флота, анимаций карт и истории Стихий. Старые версии паков после обновления удаляются автоматически, если не используются сохранёнными партиями. Кнопка паков мигает при доступных обновлениях.

Разработчикам: [карта слоёв, файлов и взаимодействий](docs/ARCHITECTURE.md), [практика автора](docs/AUTHORING.md), [компонентный SDK](docs/COMPONENT-SDK.md).
