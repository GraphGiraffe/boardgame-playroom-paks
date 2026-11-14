// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../locales/ru/game.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'pexeso.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  // Settings are one noninteractive art plane, not nested gameplay buttons.
  // Extract only the SVG painted by the registered game card renderer.
  const vector=root.PlayroomGameComponents.vector;
  function deckDiagram(playing){
    const cards=playing?[{rank:9,suit:'♥'},{rank:9,suit:'♦'}]:Array.from({length:2},()=>({character:'star-yellow',shape:'star',color:'yellow'}));
    const content=cards.map((value,index)=>{
      const svg=card(value).match(/<svg\b[\s\S]*<\/svg>/)?.[0];
      if(!svg)throw Error('PEXESO_CARD_ART_REQUIRED');
      const attrs=playing?'style="color:var(--color-material-card-red,#b94f40)"':'';
      return vector.place(svg,{x:20+index*44,y:19.8,width:36,height:50.4,attrs});
    }).join('');
    return vector.viewport({width:120,height:90,className:'pexeso-parameter-deck',attrs:`data-art-role="parameter-diagram" data-pexeso-deck="${playing?'52':'cartoon'}" aria-hidden="true" focusable="false"`,content});
  }
  const examples={
   "pair":()=>R.scene(R.row(card({character:'star-yellow',shape:'star',color:'yellow'}),card({character:'star-yellow',shape:'star',color:'yellow'}))),
   "setting-deck-cartoon":()=>deckDiagram(false),
   "setting-deck-playing":()=>deckDiagram(true),
   "flip":()=>R.scene(R.row(card({rank:9,suit:'♥'}),R.arrow(),R.selected(card({hidden:true})),card({hidden:true})))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
