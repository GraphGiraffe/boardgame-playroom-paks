// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../lang/ru.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'spider.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const V=root.PlayroomVectorArt;
  const piece=(markup,x,y,width=36,height=50.4)=>V.place(markup.match(/<svg\b[\s\S]*<\/svg>/)?.[0]||'',{x,y,width,height,attrs:`style="color:var(--color-material-card-${markup.includes('shared-red')?'red':'ink'},${markup.includes('shared-red')?'#b94f40':'#264e43'})"`});
  const diagram=(id,content)=>V.viewport({width:120,height:90,attrs:`data-art-role="parameter-diagram" data-spider-setting="${id}" aria-hidden="true" focusable="false"`,content});
  const suits=count=>diagram('suits-'+count,Array.from({length:count},(_,i)=>piece(card({rank:14,suit:['♠','♥','♣','♦'][i]}),60-(36+(count-1)*22)/2+i*22,19.8)).join(''));
  const emptyDeal=allow=>diagram('empty-'+(allow?'allow':'forbid'),piece(card({hidden:true}),4,12)+piece(C.cardSlot({tag:'span'}),80,12)+`<path d="M45 37H75m-7-6 7 6-7 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`+(allow?'<path d="m51 72 7 7 14-16" fill="none" stroke="currentColor" stroke-width="3"/>':'<path d="m53 65 14 14m0-14-14 14" fill="none" stroke="currentColor" stroke-width="3"/>'));
  const examples={
   "setting-suits-1":()=>suits(1),
   "setting-suits-2":()=>suits(2),
   "setting-suits-4":()=>suits(4),
   "setting-empty-forbid":()=>emptyDeal(false),
   "setting-empty-allow":()=>emptyDeal(true),
   "sequence":()=>R.scene(R.row(card({rank:10,suit:'♠'}),R.arrow(),card({rank:9,suit:'♠'}),R.arrow(),card({rank:8,suit:'♠'}))),
   "deal":()=>R.scene(R.row(card({hidden:true}),R.arrow(),card({rank:7,suit:'♣'}),card({rank:4,suit:'♠'}),card({rank:12,suit:'♦'}))),
   "hint":()=>R.scene(R.row(R.iconButton('hint',t('hint'))))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
