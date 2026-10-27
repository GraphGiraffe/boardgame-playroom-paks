// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'durak.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "defend":()=>R.scene(R.row(card({rank:6,suit:'♥'}),R.arrow(),card({rank:12,suit:'♥'}))),
   "throw":()=>R.scene(R.row(card({rank:6,suit:'♥'}),card({rank:12,suit:'♥'}),R.arrow(),card({rank:6,suit:'♠'}))),
   "controls":()=>R.scene(R.row(R.button(t('take')),R.button(t('beaten'))))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
