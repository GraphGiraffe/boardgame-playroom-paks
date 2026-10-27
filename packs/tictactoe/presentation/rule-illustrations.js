// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG,mark}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'tictactoe.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "place":()=>R.scene(R.grid(3,[mark('X'),mark('O'),'',{html:'',tone:'target'},mark('X'),'',mark('O'),'',''])),
   "line":()=>R.scene(R.grid(3,[{html:mark('X'),tone:'target'},mark('O'),'',{html:mark('X'),tone:'target'},mark('O'),'',{html:mark('X'),tone:'target'},'','']))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
