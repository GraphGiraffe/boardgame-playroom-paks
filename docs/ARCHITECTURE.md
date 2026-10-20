# Архитектура коллекции 0.7

14 игр, включая два пасьянса используют engineApi 3, viewApi 2. Domain, presentation, locales и Web renderer разделены. Регистрация связывает Definition с SDK; runtime не включает копию приложения. SharedDomain стандартной колоды/окончаний/расположения фишек чистый и не знает Web.

shared/pack_compiler.py — один compiler контейнера, закреплённый host. shared/components — геометрия RoundToken/GameComponents/AssetResolver. shared/assets — SVG образцы и semantic catalog; shared/asset-packs — characters/cartoon-deck/mini-cards/mini-split-deck/solitaire-board. shared/templates — таблицы, shared/sounds — cues, shared/locales — подписи компонентов. Web kit соединяет эти части с host helpers; canonical источник остаётся здесь.

Поток: command → domain Transition → audience projection → presentation SceneModel/events → host renderer/feedback. Бот получает projection и разрешённую память, ни UI, ни перевод не меняют legal actions. Timeline/revision/receipts/history/storage принадлежат host, domain обозначает turnEnded/roundEnded.

[Полная схема взаимодействия модулей](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/DEVELOPER-ARCHITECTURE.md), [SDK](https://github.com/GraphGiraffe/boardgame-playroom/blob/main/docs/SDK-0.18.md), [AUTHORING](AUTHORING.md).

[Следующие патчи](https://github.com/GraphGiraffe/boardgame-playroom-utils/blob/main/docs/project/packs/NEXT-PATCHES.md) содержат только подготовку, не новый runtime. Исходные арты и дизайн-итерации сохраняются отдельно от оптимизированных поставляемых изображений.
