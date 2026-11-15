# Игровая коллекция ХОД

Независимые паки настольных игр для [приложения ХОД](https://github.com/GraphGiraffe/boardgame-playroom). Каждый пак содержит метаданные, правила, представление, материалы и поведение ботов. Общие компоненты и исходные ассеты находятся в `shared/`.

## Использование

Установите игру из каталога приложения или импортируйте `.playroom-pack.json` из [готового релиза коллекции](https://github.com/GraphGiraffe/boardgame-playroom-paks/releases). Версии игр независимы; сохранённая партия остаётся на своей точной версии пака. Архивные пакеты не заменяются молча.

## Разработка

Правила и метаданные игры находятся в `packs/<id>/`; `manifest.json` — источник, `manifest.js` генерируется сборщиком.

```sh
bash scripts/codex/setup.sh
python3 build.py --output-dir dist/local
bash scripts/codex/check.sh
```

Самостоятельная проверка проверяет синтаксис и упаковку, но не игровой интерфейс. Для правил и UI используйте совместимую копию приложения и явно выбранные проверки из [руководства тестирования](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/app/TESTING.md).

## Документация

[Руководство автора](docs/AUTHORING.md) · [архитектура](docs/ARCHITECTURE.md) · [компоненты](docs/COMPONENT-SDK.md) · [CONTRIBUTING](CONTRIBUTING.md) · [общие инструменты и roadmap](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/PROJECT.md).

История изменений: [CHANGELOG](CHANGELOG.md). Лицензии различаются для кода, материалов и отдельных игр; см. [LICENSING](LICENSING.md), [LICENSE](LICENSE).
