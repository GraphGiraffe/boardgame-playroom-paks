// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'yatzy.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "roll":()=>R.scene(R.row(R.die(2),R.die(4,true),R.die(4,true),R.die(5),R.die(6))+R.row(R.button(t('roll')),R.button(t('reroll')))),
   "score":()=>R.scene(R.table([t('category'),t('points')],[[t('fours'),'12'],[t('chance'),'—']])),
   "pair":()=>R.scene(R.row(R.die(3),R.die(3),R.die(5),R.die(5),R.die(6)))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
