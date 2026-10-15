// Registration bridge only; the game definition has no engine dependency.
(function (root) {
  'use strict';
  const source = typeof require === 'function' && !root.PlayroomPack;
  const definition = source ? require('./domain/game.js') : root.PlayroomPackDefinition;
  const presentation = source ? require('./presentation/scene.js') : root.PlayroomPackPresentation;
  const locales = source ? {ru:require('./locales/ru/game.json')} : root.PlayroomPackResources.locales;
  const version = source ? require('./manifest.json').version : root.PlayroomPack.version;
  const specification = {definition, presentation, locales, version};
  const adapted = source ? root.PlayroomModelAdapter.adapt(root.TabletopCore, specification)
    : root.PlayroomPack.adaptModel(specification);
  root.TabletopCore.register(adapted);
})(globalThis);
