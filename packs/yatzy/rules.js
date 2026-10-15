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
  if(source)root.TabletopCore.registerModel({definition,presentation,locales,version});
  else root.TabletopCore.register(root.PlayroomPack.adaptModel({definition,presentation,locales,version}));
})(globalThis);
