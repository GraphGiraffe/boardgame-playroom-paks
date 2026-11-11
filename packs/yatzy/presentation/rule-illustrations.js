// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'yatzy.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  // Public score-sheet rows show the chosen number of complete rounds.
  const roundsDiagram=count=>root.PlayroomGameComponents.vector.viewport({width:120,height:80,attrs:`data-art-role="parameter-diagram" data-yatzy-rounds="${count}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"`,content:root.PlayroomGameComponents.vector.place(C.dieArt(5),{x:4,y:23,width:34,height:34})+'<rect x="48" y="6" width="62" height="68" rx="4"/>'+Array.from({length:15},(_,i)=>{const col=i%3,row=Math.floor(i/3);return `<rect x="${54+col*17}" y="${13+row*11}" width="12" height="7" rx="1" ${i<count?'fill="currentColor" fill-opacity=".35"':''}/>`;}).join('')});
  const examples={
   ...Object.fromEntries([3,5,10,15].map(n=>['setting-rounds-'+n,()=>roundsDiagram(n)])),
   "roll":()=>R.scene(R.row(R.die(2),R.die(4,true),R.die(4,true),R.die(5),R.die(6))+R.row(R.button(t('roll')),R.button(t('reroll')))),
   "score":()=>R.scene(R.table([t('category'),t('points')],[[t('fours'),'12'],[t('chance'),'—']])),
   "pair":()=>R.scene(R.row(R.die(3),R.die(3),R.die(5),R.die(5),R.die(6)))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
