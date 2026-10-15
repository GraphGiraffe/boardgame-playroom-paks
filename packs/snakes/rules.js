(function(root){
  'use strict';const source=typeof require==='function'&&!root.PlayroomPack;
  const factory=source?require('./domain/game.js'):root.PlayroomPackDefinitionFactory;
  const presentation=source?require('./presentation/scene.js'):root.PlayroomPackPresentation;
  const manifest=source?require('./manifest.json'):root.PlayroomPack;
  const locales=source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales;
  const specification={definition:factory({rollDie:root.TabletopCore.rollDie}),presentation,locales,version:manifest.version};
  if(source)root.TabletopCore.registerModel(specification);else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
