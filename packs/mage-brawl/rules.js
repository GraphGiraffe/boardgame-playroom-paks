// Registration bridge only; the game definition has no engine dependency.
(function (root) {
  'use strict';
  const source = typeof require === 'function' && !root.PlayroomPack;
  const definition = source ? require('./domain/game.js') : root.PlayroomPackDefinitionFactory(root.PlayroomTacticalGrid,root.PlayroomDecisionWindow,root.PlayroomEffectBatch,root.PlayroomBotPolicy,root.MageBrawlBotsFactory(root.PlayroomBotPolicy),root.PlayroomFrameSequence);
  const presentation = source ? require('./presentation/scene.js') : root.PlayroomPackPresentation;
  const locales = source ? {ru:require('./locales/ru/game.json')} : root.PlayroomPackResources.locales;
  const manifest = source ? require('./manifest.json') : root.PlayroomPack;
  const specification = {definition, presentation, locales, version:manifest.version, stateVersion:manifest.stateVersion};
  if(!source&&(!root.PlayroomPack.sdkFeatures?.includes('local-input-v1')||!root.PlayroomPack.sdkFeatures?.includes('turn-order-v1')||!root.PlayroomPack.sdkFeatures?.includes('player-status-v1')))throw Error(root.PlayroomMessages.text('ui.packs.4cec05765e2b'));
  if(source)root.TabletopCore.registerModel(specification);
  else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
