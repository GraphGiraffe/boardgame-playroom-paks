// Registration bridge only; the game definition has no engine dependency.
(function (root) {
  'use strict';
  const source = typeof require === 'function' && !root.PlayroomPack;
  const definition = source ? require('./domain/game.js') : root.PlayroomPackDefinitionFactory(root.PlayroomTacticalGrid,root.PlayroomDecisionWindow,root.PlayroomEffectBatch,root.PlayroomBotPolicy,root.MageBrawlBotsFactory(root.PlayroomBotPolicy));
  const presentation = source ? require('./presentation/scene.js') : root.PlayroomPackPresentation;
  const locales = source ? {ru:require('./locales/ru/game.json')} : root.PlayroomPackResources.locales;
  const version = source ? require('./manifest.json').version : root.PlayroomPack.version;
  const specification = {definition, presentation, locales, version};
  if(source)root.TabletopCore.registerModel(specification);
  else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
