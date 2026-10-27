// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'ludo.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "base":()=>R.scene(R.row(R.die(6),R.arrow(),R.pawn(1))),
   "move":()=>R.scene(R.row(R.selected(R.pawn(2)),R.arrow(),R.die(3),R.die(6))),
   "safe":()=>R.scene(R.grid(3,[{html:R.pawn(1),tone:'target'},'★',{html:R.pawn(2,'#668fad'),tone:'dark'}]))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
