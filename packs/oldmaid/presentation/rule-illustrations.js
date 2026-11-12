// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'oldmaid.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  // The exact shared seating diagram shows one source and the receiving seat.
  const drawDiagram=next=>H.parameterTableArt({numbers:false,sourceSeat:next?1:3,currentSeat:0}).replace('<svg ',`<svg data-parameter-draw-from="${next?'next':'any'}" `);
  const examples={
   "setting-draw-any":()=>drawDiagram(false),
   "setting-draw-next":()=>drawDiagram(true),
   "pair":()=>R.scene(R.row(card({rank:7,suit:'♥'}),card({rank:7,suit:'♦'}))),
   "queen":()=>R.scene(R.row(card({rank:12,suit:'♠'}))),
   "choose":()=>R.scene(R.row(R.player(t('opponent')))+R.row('<span class="rule-art-arrow" aria-hidden="true">↓</span>')+R.row(card({hidden:true}),R.selected(card({hidden:true})),card({hidden:true})))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
