// Registration wires a pure definition to the host SDK; it contains no rules.
(function(root){
  'use strict';
  const source=typeof require==='function'&&!root.PlayroomPack;
  const factory=source?require('./domain/game.js'):root.PlayroomPackDefinitionFactory;
  const categories=source?require('./domain/categories.js'):root.PlayroomYatzyCategories;
  const presentation=source?require('./presentation/scene.js'):root.PlayroomPackPresentation;
  const locales=source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales;
  const version=source?require('./manifest.json').version:root.PlayroomPack.version;
  const definition=factory({rollDie:root.TabletopCore.rollDie},categories);
  if(!source&&(!root.PlayroomPack.sdkFeatures?.includes('local-input-v1')||!root.PlayroomPack.sdkFeatures?.includes('turn-order-v1')))throw Error(root.PlayroomMessages.text('ui.packs.4cec05765e2b'));
  if(source)root.TabletopCore.registerModel({definition,presentation,locales,version});
  else root.TabletopCore.register(root.PlayroomPack.adaptModel({definition,presentation,locales,version}));
})(globalThis);
