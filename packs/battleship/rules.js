// Host registration of the independent definition, presentation and locale.
(function(root){
  'use strict';
  const source=typeof require==='function'&&!root.PlayroomPack;
  const G=source?require('./domain/geometry.js'):root.PlayroomBattleshipGeometry;
  const factory=source?require('./domain/game.js'):root.PlayroomPackDefinitionFactory;
  const presentation=source?require('./presentation/scene.js'):root.PlayroomPackPresentation;
  const manifest=source?require('./manifest.json'):root.PlayroomPack;
  const locales=source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales;
  const definition=factory({random:root.TabletopCore.random},G);
  const specification={definition,presentation,locales,version:manifest.version,stateVersion:4};
  if(!source&&(!root.PlayroomPack.sdkFeatures?.includes('local-input-v1')||!root.PlayroomPack.sdkFeatures?.includes('turn-order-v1')))throw Error(root.PlayroomMessages.text('ui.packs.4cec05765e2b'));
  if(source)root.TabletopCore.registerModel(specification);
  else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
