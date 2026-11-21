# Шаблон SDK

Исходники разделены: manifest.json, domain/game.js, presentation/scene.js,
lang/ru.json, lang/en.json, sdk/project.json. SDK new подставляет ID проекта.
Одинаковая схема settings.fields/groups используется и в исходниках, и в паке.
Числовые label не нужны; common берёт слово из приложения, key — из lang пака.
Для длинных равномерных наборов используйте range; для повторных описаний —
optionDefaults.description. Они раскрываются при чтении в обычную форму настроек.

Редактируйте исходники, затем выполните SDK check/verify и compile. Только
упаковка создаёт один .playroom-pack.json. Не меняйте готовый sourceHash вручную.
Этот минимальный счётчик не добавляется в обычную коллекцию игр автоматически.
