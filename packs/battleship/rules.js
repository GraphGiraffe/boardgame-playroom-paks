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
  if(source)root.TabletopCore.registerModel(specification);
  else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
