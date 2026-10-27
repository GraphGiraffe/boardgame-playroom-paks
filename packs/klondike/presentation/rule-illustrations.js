// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'klondike.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "column":()=>R.scene(R.row(card({rank:10,suit:'♥'}),R.arrow(),card({rank:9,suit:'♠'}),R.arrow(),card({rank:8,suit:'♦'}))),
   "home":()=>R.scene(R.row(card({rank:14,suit:'♠'}),R.arrow(),card({rank:2,suit:'♠'}),R.arrow(),card({rank:3,suit:'♠'}))),
   "stock":()=>R.scene(R.row(card({hidden:true}),R.arrow(),card({rank:7,suit:'♣'}))),
   "tools":()=>R.scene(R.row(R.iconButton('hint',t('hint')),R.iconButton('undo',t('undo'))))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
