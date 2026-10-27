// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'uno.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const examples={
   "match":()=>R.scene(R.row(card({color:'red',value:'7'}),R.arrow(),card({color:'red',value:'3'}),card({color:'blue',value:'7'}))),
   "special":()=>R.scene(R.row(...['skip','reverse','+2'].map(value=>card({color:'green',value})))+R.row(...['wild','+4'].map(value=>card({color:'wild',value})))+R.row(...['red','yellow','green','blue'].map(color=>`<span class="rule-art-color" style="background:${root.PlayroomUnoDeck.colors[color]}"></span>`))),
   "tools":()=>R.scene(R.row(R.button(t('draw')),R.iconButton('help',t('help')))),
   "uno":()=>R.scene(R.row(card({color:'blue',value:'7'}),R.arrow(),R.button(t('uno'))))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
