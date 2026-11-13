# Стихийная потасовка (mage-brawl) · 0.2.5

Редакция иллюстрированных правил коллекции 0.8.7; опубликованная база пака - 0.2.4, коллекция 0.8.6; engineApi 4 / viewApi 3. Имя Mage Brawl сохранено в техническом ID; пользовательское название — «Стихийная потасовка».

2–8 игроков одновременно планируют действия. По умолчанию два хода с разными типами действий, четыре карты и четыре здоровья (авто), две жизни, скрытые руки. Сначала движения, затем атаки; внутри каждой фазы Воздух → Земля → Вода → Огонь. Второй ход следует после полного первого цикла из восьми фаз; погибший его не выполняет. Настройки количества ходов за раунд, стартовой руки, здоровья и жизней независимы.

Фактически полученная за убийство карта увеличивает лимит руки на один; возрождение добирает до текущего лимита. Непотраченные ульты переходят убийце и могут накапливаться. Потерянные жизни/здоровье остаются контурами; доступные базы подсвечиваются. Справка руки содержит порядок действий и схемы всех стихий, подсказка расположена под рукой в обеих ориентациях.

`domain/` содержит правила и ботов; `presentation/` — авторизованные сцены; `view.js`, `styles.css`, `locales/` — интерфейс; `manifest.json` — версия и настройки. Правила и сцены не получают DOM. Изменения публикации фиксируются в CHANGELOG коллекции, исходные версии остаются неизменными.

Полная книга правил — разделы `mage-brawl.rules.N` в [локали](locales/ru/game.json); порядок задаёт presentation. Правила переписаны для нового игрока. Движения одновременны, обмен клетками разрешён; очередь возрождения случайна на каждом этапе. Корона выдаётся при возрождении; прежние передаются убийцам или исчезают. Лимит руки растёт только с полученной картой награды, после смерти рука набирается заново. Урон совместного толчка делится между источниками и показан только в результатах. Цветной меч на клетке обозначает уязвимость стоящего на ней мага, а не усиление его атак; щит — защиту от указанной стихии. Общий редакционный контракт — [PLAYER-RULES](../../docs/PLAYER-RULES.md).


Предварительная редакция правил сокращена примерно вдвое: 11 разделов, короткое вступление и цифровые иллюстрации. `metadata.rulebook` задаёт документ, provider `illustrations` - арты; host отвечает за компоновку. В справке руки схемы цветные, лица карт имеют окантовку стихии. Терминология: раунд → два хода → восемь фаз в каждом ходе. Механика игры не менялась. В текущем приложении документ доступен и view-only сетевым клиентам; старые приложения читают текстовый вариант.

Печатная редакция 1 и четыре памятки для вырезания: [исходники брошюры](../../docs/design/mage-brawl-rulebook/README.md). Печатные диагональные карты не переносятся в цифровую руку: она показывает лицо выбранного типа действия.

Принятый дизайн фишек, тайлов и иллюстраций: [решения редакции 1](../../docs/design/mage-brawl-rulebook/ACCEPTED-DESIGN.md). Цифровые правила и печатная брошюра используют общий источник артов тайлов; брошюра также извлекает общий профиль игровой фишки.

## Preview .32: lives, teams and shrink

`extraLives` is 0–2 revival tokens per player. `preset=teams` assigns alternating blue/red seats; shared reserves are `floor(playerCount/2) * extraLives` per team, friendly fire remains legal, and all members of the surviving team win. Deaths in one simultaneous batch spend shared reserves in seat order. Player `lives` remains a current/remaining-life domain field; team reserves are separate.

`shrinkMode=lives` is the default. Threshold is `2 * (extraLives + 1)`; odd player counts start half full. `lostLives` and `shrinkSpent` retain overflow; at most one ring is removed in a warned round, down to 4×4. `shrinkMode=players` preserves the prior population thresholds. The public `shrinkCounter` has `capacity`, `filled` and `scheduled`; frames carry their own counter and reserves. Terminal loot is settled in hand order without a choice or transfer event. State version 2 requires the exact new pack; archived state version 1 stays pinned to its original bundle.
