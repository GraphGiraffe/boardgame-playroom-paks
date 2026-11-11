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
  const piece=(value,x,y,width=42,height=58.8)=>{const red=value.color==='red'||['♥','♦'].includes(value.suit);return V.place(card(value).match(/<svg\b[\s\S]*<\/svg>/)?.[0]||'',{x,y,width,height,attrs:`style="color:var(--color-material-card-${red?'red':'ink'},${red?'#b94f40':'#264e43'})"`});};
  const diagram=(id,content)=>V.viewport({width:260,height:112,attrs:`data-art-role="parameter-diagram" data-durak-setting="${id}" aria-hidden="true" focusable="false"`,content});
  const arrow=(x,y)=>`<path d="M${x} ${y}h23m-7-7 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  // Examples use the game's card renderer, including actual joker faces.
  const jokerOrder=universal=>{const cards=[{joker:true,color:'red'},...(universal?[{joker:true,color:'black'},{rank:14,suit:'♥'}]:[{rank:14,suit:'♥'},{joker:true,color:'black'},{rank:14,suit:'♠'}])],width=cards.length===4?36:42,gap=cards.length===4?65:82,left=(260-((cards.length-1)*gap+width))/2;return diagram('jokers-'+(universal?'universal':'color'),(universal?'':'<text x="130" y="16" text-anchor="middle" fill="currentColor" font-family="system-ui,sans-serif" font-size="13">Козырь ♥</text>')+cards.map((value,i)=>piece(value,left+i*gap,30,width,width*1.4)+(i<cards.length-1?arrow(left+i*gap+width+4,55):'')).join(''));};
  const examples={
   "setting-variant-simple":()=>diagram('simple',piece({rank:6,suit:'♥'},42,26)+piece({rank:6,suit:'♠'},88,26)+piece({rank:7,suit:'♦'},134,26)),
   "setting-variant-throwin":()=>diagram('throwin',piece({rank:6,suit:'♥'},18,26)+piece({rank:12,suit:'♥'},65,26)+arrow(119,55)+piece({rank:6,suit:'♠'},162,26)),
   "setting-variant-transfer":()=>diagram('transfer',piece({rank:6,suit:'♥'},18,26)+piece({rank:6,suit:'♠'},65,26)+arrow(119,55)+`<g transform="translate(173 35)" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="8" r="7"/><path d="M0 43v-9a13 13 0 0 1 26 0v9"/></g>`),
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
