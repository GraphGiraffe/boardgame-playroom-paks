// Registration only. Domain and presentation are platform independent.
(function(root){
  'use strict';const source=typeof require==='function'&&!root.PlayroomPack;
  const Deck=source?require('../../shared/domain/standard-deck.js'):root.PlayroomPackDomain.standardDeck;
  const factory=source?require('./domain/game.js'):root.PlayroomPackDefinitionFactory;
  const presentation=source?require('./presentation/scene.js'):root.PlayroomPackPresentation;
  const manifest=source?require('./manifest.json'):root.PlayroomPack;
  const locales=source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales;
  const specification={definition:factory({shuffle:root.TabletopCore.shuffle},Deck),presentation,locales,version:manifest.version,stateVersion:2};
  if(source)root.TabletopCore.registerModel(specification);else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
