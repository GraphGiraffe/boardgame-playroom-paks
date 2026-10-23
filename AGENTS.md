# Работа с коллекцией ХОД 0.7

Коллекция 0.7.4 для приложения 0.18.6; engineApi 3, viewApi 2. [Руководство автора](docs/AUTHORING.md), [архитектура](docs/ARCHITECTURE.md), [будущие расширения](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/packs/NEXT-PATCHES.md).

- Проверить root/status/ветку; сохранять чужую работу. Игра целиком в packs/<id>; manifest.json источник метаданных, manifest.js генерирует build.py.
- Domain чистый, без DOM/имён/переводов/часов/storage. RNG явный. Presentation получает projection, renderer не пересчитывает правила.
- Не копировать SDK приложения. Shared helpers/assets канонические в shared, host синхронизирует digest явной сборкой.
- Только API 3; каждое изменение опубликованного пака — новая версия. Точные старые bytes/теги сохранять. Не конвертировать сохранения молча.
- UI использует общие Source/Target/Hand/Board/Reveal/ScoreTable, fixed scene; стили ограничены паком. Переключение skin не меняет semantics.
- Не коммитить dist, временные экспорты, секреты, личные сохранения и соседние проекты.

Следовать [локальному порядку проверок и бюджету Actions/RC](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/VALIDATION-POLICY.md). Standalone: `bash scripts/codex/check.sh` локально проверяет синтаксис/упаковку/SHA, не gameplay. Для изменённого поведения подготовить точный companion в приложении и локально выбрать нужные blocks/subblocks/case. Не дублировать совместный прогон в двух репозиториях и не запускать весь набор автоматически для stable/RC. Успешные результаты повторно использовать для тех же исходников; после правки повторять затронутые сценарии. Для публикации `checks=none` с обязательной проверкой publisher. Source tests в Actions — только выбранные и при обоснованной необходимости; новый RC нужен только после существенной правки или для приёмки. Документация не требует продуктовых тестов/Actions.

Task branch → dev squash. Stable dev → main merge commit, fast-forward dev. Не force-push. Проверенные source SHA, release assets и live catalog — разные результаты; сообщать их отдельно.

## Предотвращение повторных регрессий

Перед изменением упаковки, скинов, жестов или сохранений прочитать [точные инварианты и проверки](docs/DEVELOPMENT-REGRESSIONS.md). Аудитировать готовые артефакты; повторы между самостоятельными паками допустимы. Исходные мастера сохранять вне runtime. Подготовить exact companion перед игровыми тестами; выбранные проверки и offline HTML доказывают только свой scope. Релиз/публикация требуют отдельного поручения.

## Владение средствами разработки

Общие навыки, операционные инструменты, roadmap, Cloud/test/release инструкции — в [utils](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/PROJECT.md). Здесь остаются продуктовый код, SDK/правила/ассеты, авторские контракты и собственные проверки. Operational scripts — совместимые shims; установите соседний utils либо PLAYROOM_UTILS_ROOT. Не копировать реализацию обратно.
