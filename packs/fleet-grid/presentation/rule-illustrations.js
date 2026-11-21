// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../lang/ru.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'battleship.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "place":()=>R.scene(R.row(`<span class="rule-art-ship">${C.shipSilhouette(3)}</span>`,R.arrow(),R.grid(4,Array.from({length:8},(_,i)=>({html:'',tone:[1,2,3].includes(i)?'ship':''}))))+R.row(R.button('↻'),R.iconButton('trash',t('remove')),R.button(t('auto')),R.button(t('ready')))),
   "shoot":()=>R.scene(R.grid(4,Array.from({length:12},(_,i)=>({html:[5,6].includes(i)?'✹':i===2?'×':'',tone:[5,6].includes(i)?'hit':i===2?'miss':i===9?'target':''})))),
   "fleets":()=>R.scene(H.components.actionSelector({key:'rule-fleet',label:t('own')+' / '+t('enemy'),value:'enemy',disabled:true,choices:[{value:'own',label:t('own')},{value:'enemy',label:t('enemy')}]})+R.row(R.iconButton('eye',t('follow'))))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
