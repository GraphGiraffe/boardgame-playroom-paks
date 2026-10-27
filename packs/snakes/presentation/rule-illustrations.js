// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG,effectTile}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'snakes.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   ...Object.fromEntries(['adjust','less','skip','shield','second'].map(effect=>['tile-'+effect,()=>effectTile(effect)])),
   "dice":()=>R.scene(R.row(R.die(2),R.selected(R.die(5)),R.arrow(),R.pawn(1))),
   "links":()=>R.scene(`<div class="rule-art-route">${R.grid(4,Array.from({length:16},(_,i)=>{const row=3-Math.floor(i/4),col=i%4;return row*4+(row%2?4-col:col+1);}))}<svg viewBox="0 0 100 100">${linksSVG([[2,14],[15,5]],4)}</svg></div>`),
   "adjust":()=>R.scene(R.row(R.button('−1'),R.die(4),R.button('+1'))),
   "shield":()=>R.scene(R.row(`<span class="rule-art-symbol">${H.icon('shield')}</span>`,R.pawn(1)))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
