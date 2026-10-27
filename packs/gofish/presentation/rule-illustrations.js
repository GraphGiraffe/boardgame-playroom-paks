// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'gofish.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "request":()=>R.scene(R.row(R.selected(card({rank:13,suit:'♥'})),R.arrow(),R.player(t('opponent')))),
   "quartet":()=>R.scene(R.row(...['♥','♦','♣','♠'].map(suit=>card({rank:13,suit})))),
   "draw":()=>R.scene(R.row(card({hidden:true}),R.arrow(),card({rank:8,suit:'♣'})))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
