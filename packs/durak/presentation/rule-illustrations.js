// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'durak.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const V=root.PlayroomVectorArt;
  const piece=(value,x,y,width=36,height=50.4)=>{const red=value.color==='red'||['♥','♦'].includes(value.suit);return V.place(card(value).match(/<svg\b[\s\S]*<\/svg>/)?.[0]||'',{x,y,width,height,attrs:`stroke="none" style="color:var(--color-material-card-${red?'red':'ink'},${red?'#b94f40':'#264e43'})"`});};
  const diagram=(id,content,width=320,height=158)=>V.viewport({width,height,attrs:`data-art-role="parameter-diagram" data-durak-setting="${id}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`,content});
  const label=(text,x,y,size=14)=>V.text(text,{x,y,size,weight:600,attrs:'stroke="none"'});
  const zone=(name,x,width)=>`<rect data-example-zone="${name}" x="${x}" y="23" width="${width}" height="119" rx="8" stroke-opacity=".3"/>`+label(name,x+width/2,39);
  const addCard=allowed=>diagram(allowed?'throwin':'simple',zone('Стол',6,180)+zone('Рука',238,76)+piece({rank:6,suit:'♥'},22,72)+piece({rank:8,suit:'♥'},40,56)+`<rect data-add-slot x="115" y="72" width="42" height="58.8" rx="3" stroke-dasharray="4 4" stroke-opacity=".5"/>`+piece({rank:6,suit:'♠'},255,72)+`<path data-hand-to-table d="M247 101H169m8-8-8 8 8 8"/>`+(allowed?label('Подкинуть',209,63,12):`<path data-add-blocked d="m200 89 20 24m0-24-20 24"/>`));
  const transfer=()=>diagram('transfer',zone('Стол',6,180)+zone('Игрок',238,76)+piece({rank:6,suit:'♥'},22,68)+label('+',78,99,22)+piece({rank:6,suit:'♠'},94,68)+`<path data-transfer-to-player d="M163 101H232m-8-8 8 8-8 8"/>`+label('Перевести',198,64,12)+V.place(H.icon('player'),{x:252,y:70,width:48,height:48,attrs:'data-next-player data-player-glyph="canonical"'}));
  // Two explicit outcomes replace the ambiguous arrow-chain ranking.
  const jokerOrder=universal=>diagram('jokers-'+(universal?'universal':'color'),piece({joker:true,color:'red'},9,5)+piece({joker:true,color:'black'},75,5)+(universal?label('>',60,30,20)+label('Красный старше',60,77,12):label('Козырь',27,68,11)+label('♥ ♦',27,81,11)+label('Козырь',93,68,11)+label('♠ ♣',93,81,11)),120,90);
  const examples={
   "setting-variant-simple":()=>addCard(false),
   "setting-variant-throwin":()=>addCard(true),
   "setting-variant-transfer":()=>transfer(),
   "setting-jokerMode-color":()=>jokerOrder(false),
   "setting-jokerMode-universal":()=>jokerOrder(true),
   "defend":()=>R.scene(R.row(card({rank:6,suit:'♥'}),R.arrow(),card({rank:12,suit:'♥'}))),
   "throw":()=>R.scene(R.row(card({rank:6,suit:'♥'}),card({rank:12,suit:'♥'}),R.arrow(),card({rank:6,suit:'♠'}))),
   "controls":()=>R.scene(R.row(R.button(t('take')),R.button(t('beaten'))))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
