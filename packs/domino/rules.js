(function(root){
 'use strict';const source=typeof require==='function'&&!root.PlayroomPack;
 const factory=source?require('./domain/game.js'):root.PlayroomPackDefinitionFactory;
 const presentation=source?require('./presentation/scene.js'):root.PlayroomPackPresentation;
 const manifest=source?require('./manifest.json'):root.PlayroomPack;
 const locales=source?{ru:require('./lang/ru.json')}:root.PlayroomPackResources.locales;
 const ending=source?require('../../shared/domain/end-policy.js'):root.PlayroomPackDomain.endPolicy;
 const specification={definition:factory({shuffle:root.TabletopCore.shuffle,ending}),presentation,locales,version:manifest.version};
 if(!source&&(!root.PlayroomPack.sdkFeatures?.includes('local-input-v1')||!root.PlayroomPack.sdkFeatures?.includes('turn-order-v1')))throw Error(root.PlayroomMessages.text('ui.packs.4cec05765e2b'));
  if(source)root.TabletopCore.registerModel(specification);else root.TabletopCore.register(root.PlayroomPack.adaptModel(specification));
})(globalThis);
