// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'oldmaid.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "pair":()=>R.scene(R.row(card({rank:7,suit:'♥'}),card({rank:7,suit:'♦'}))),
   "queen":()=>R.scene(R.row(card({rank:12,suit:'♠'}))),
   "choose":()=>R.scene(R.row(R.player(t('opponent')))+R.row('<span class="rule-art-arrow" aria-hidden="true">↓</span>')+R.row(card({hidden:true}),R.selected(card({hidden:true})),card({hidden:true})))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
