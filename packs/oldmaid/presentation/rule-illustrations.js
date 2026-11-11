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
  // Alternative routes show one chosen source, never a simultaneous draw.
  function drawDiagram(next){
    const positions=[14,62,110];
    let art=positions.map((x,i)=>`<g data-draw-source="${i}" opacity="${next&&i!==2?'.25':'1'}">${cardArt({hidden:true},x+4,4,19)}${cardArt({hidden:true},x,7,19)}</g>`).join('');
    art+=next?'<path data-turn-order d="M112 7Q99-2 78 4M65 4Q50-2 30 7m6-2-6 2 4 5" stroke-opacity=".45"/>':'<path data-choice-alternatives d="m47 15-4 10m51-10-4 10" stroke-opacity=".5"/>';
    art+=positions.map((x,i)=>next&&i!==2?'':`<path data-draw-route="${i}" d="M${x+10} 39Q${x+10} 51 72 60m-5-5 5 5 5-5"${next?'':' stroke-dasharray="3 3"'}/>`).join('');
    art+=cardArt({rank:7,suit:'♥'},63,65,18);
    art+=vector.place(H.icon('player'),{x:44,y:70,width:14,height:14});
    return vector.viewport({width:144,height:94,className:'oldmaid-draw-diagram',attrs:`data-art-role="parameter-diagram" data-parameter-draw-from="${next?'next':'any'}" data-draw-count="1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`,content:art});
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
