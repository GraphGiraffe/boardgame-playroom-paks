// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'checkers.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "move":()=>R.scene(R.grid(3,[{html:'',tone:'dark'},'',{html:R.checker(false),tone:'dark'},'',{html:R.checker(false),tone:'dark'},'',{html:'',tone:'target'},'',{html:'',tone:'dark'}])),
   "king":()=>R.scene(R.row(`<span class="rule-art-checker">${R.checker(false)}</span>`,R.arrow(),`<span class="rule-art-checker">${R.checker(true)}</span>`))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
