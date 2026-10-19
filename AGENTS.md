# Работа с коллекцией ХОД 0.7

Коллекция 0.7.1 для приложения 0.18.1; engineApi 3, viewApi 2. [Руководство автора](docs/AUTHORING.md), [архитектура](docs/ARCHITECTURE.md), [будущие расширения](docs/NEXT-PATCHES.md).

- Проверить root/status/ветку; сохранять чужую работу. Игра целиком в packs/<id>; manifest.json источник метаданных, manifest.js генерирует build.py.
- Domain чистый, без DOM/имён/переводов/часов/storage. RNG явный. Presentation получает projection, renderer не пересчитывает правила.
- Не копировать SDK приложения. Shared helpers/assets канонические в shared, host синхронизирует digest явной сборкой.
- Только API 3; каждое изменение опубликованного пака — новая версия. Точные старые bytes/теги сохранять. Не конвертировать сохранения молча.
- UI использует общие Source/Target/Hand/Board/Reveal/ScoreTable, fixed scene; стили ограничены паком. Переключение skin не меняет semantics.
- Не коммитить dist, временные экспорты, секреты, личные сохранения и соседние проекты.

Standalone: `bash scripts/codex/check.sh` — синтаксис/упаковка/SHA, не доказательство gameplay. Совместно подготовить приложение с --packs-dir, затем выбрать явные blocks/case его runner. Для сквозного stable cutover: `node scripts/codex/test.cjs core,input,games,ui,storage,network,pairing` из app. Изменённая игра: варианты, privacy, bots, legal targets, restore/replay, 320/390 portrait/короткий landscape. [CONTRIBUTING](CONTRIBUTING.md).

Task branch → dev squash. Stable dev → main merge commit, fast-forward dev. Не force-push. Проверенные source SHA, release assets и live catalog — разные результаты; сообщать их отдельно.
