// Registration bridge only; the game definition has no engine dependency.
(function (root) {
  'use strict';
  const source = typeof require === 'function' && !root.PlayroomPack;
  const definition = source ? require('./domain/game.js') : root.PlayroomPackDefinition;
  const presentation = source ? require('./presentation/scene.js') : root.PlayroomPackPresentation;
  const locales = source ? {ru:require('./lang/ru.json')} : root.PlayroomPackResources.locales;
  const version = source ? require('./manifest.json').version : root.PlayroomPack.version;
  const specification = {definition, presentation, locales, version};
  if(!source&&(!root.PlayroomPack.sdkFeatures?.includes('local-input-v1')||!root.PlayroomPack.sdkFeatures?.includes('turn-order-v1')))throw Error(root.PlayroomMessages.text('ui.packs.4cec05765e2b'));
  if(source)root.TabletopCore.registerModel(specification);
  else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
