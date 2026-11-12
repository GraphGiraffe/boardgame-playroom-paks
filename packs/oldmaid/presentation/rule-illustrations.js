// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'oldmaid.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const vector=root.PlayroomGameComponents.vector;
  const cardArt=(value,x,y,width)=>{
    const svg=card(value).match(/<svg\b[\s\S]*<\/svg>/)?.[0];
    return svg?`<g stroke="none" style="color:var(--color-material-card-red,#b94f40)">${vector.place(svg,{x,y,width,height:width*1.4})}</g>`:'';
  };
  // One selected opponent supplies one card; circles are alternatives, not hands.
  function drawDiagram(next){
    const selected=next?100:60;
    const person=(x,y)=>`<circle cx="${x}" cy="${y-3}" r="2.4"/><path d="M${x-4.5} ${y+5}v-2a4.5 4.5 0 0 1 9 0v2"/>`;
    let art=[20,60,100].map(x=>`<g data-draw-source="${x}" opacity="${x===selected?'1':'.42'}"><circle cx="${x}" cy="14" r="11"/>${person(x,14)}${x===selected?`<circle data-selected-source cx="${x}" cy="14" r="14"/>`:''}</g>`).join('');
    if(next)art+='<path data-turn-order d="M84 14H76m4-3-4 3 4 3M44 14H36m4-3-4 3 4 3" opacity=".65"/>';
    art+=cardArt({rank:7,suit:'♥'},selected-10,33,20);
    art+=`<path data-draw-route d="M${selected-14} 47Q39 47 26 58m6-1-6 1 2-6"/>`;
    art+=person(17,61);
    return vector.viewport({width:120,height:72,className:'oldmaid-draw-diagram',attrs:`data-art-role="parameter-diagram" data-parameter-draw-from="${next?'next':'any'}" data-draw-count="1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`,content:art});
  }
  const examples={
   "setting-draw-any":()=>drawDiagram(false),
   "setting-draw-next":()=>drawDiagram(true),
   "pair":()=>R.scene(R.row(card({rank:7,suit:'♥'}),card({rank:7,suit:'♦'}))),
   "queen":()=>R.scene(R.row(card({rank:12,suit:'♠'}))),
   "choose":()=>R.scene(R.row(R.player(t('opponent')))+R.row('<span class="rule-art-arrow" aria-hidden="true">↓</span>')+R.row(card({hidden:true}),R.selected(card({hidden:true})),card({hidden:true})))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
