(function(root){
 'use strict';const source=typeof require==='function'&&!root.PlayroomPack;
 const Deck=source?require('../../shared/domain/standard-deck.js'):root.PlayroomPackDomain.standardDeck;
 const Cards=source?require('./domain/cards.js'):root.PlayroomDurakCards;
 const factory=source?require('./domain/game.js'):root.PlayroomPackDefinitionFactory;
 const presentation=source?require('./presentation/scene.js'):root.PlayroomPackPresentation;
 const manifest=source?require('./manifest.json'):root.PlayroomPack;
 const locales=source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales;
 const ending=source?require('../../shared/domain/end-policy.js'):root.PlayroomPackDomain.endPolicy;
 const specification={definition:factory({ending,shuffle:root.TabletopCore.shuffle},{Deck,Cards}),presentation,locales,version:manifest.version,stateVersion:3};
 if(source)root.TabletopCore.registerModel(specification);else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
