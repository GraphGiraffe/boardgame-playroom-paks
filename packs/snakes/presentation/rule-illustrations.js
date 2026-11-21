// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG,effectTile}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../lang/ru.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'snakes.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  // Public board-size diagrams use the same square-cell geometry as the field.
  // The outline is a transparent service diagram, not a second board material.
  const boardDiagram=side=>root.PlayroomGameComponents.vector.viewport({width:100,height:100,className:'snakes-parameter-board',attrs:`data-art-role="parameter-diagram" data-board-cells="${side*side}" fill="none" stroke="currentColor" stroke-width=".65" aria-hidden="true" focusable="false"`,content:Array.from({length:side*side},(_,i)=>`<rect x="${2+i%side*96/side}" y="${2+Math.floor(i/side)*96/side}" width="${96/side}" height="${96/side}"/>`).join('')});
  // Parameter cards contain one bounded, noninteractive SVG. Place the same
  // die artwork and special-cell symbols used by the live board inside it.
  const vector=root.PlayroomGameComponents.vector;
  function modeDiagram(plus){
    const values=plus?[2,5]:[3],size=40;
    let content=values.map((value,index)=>`<g data-parameter-die="${value}">${vector.place(C.dieArt(value,{frame:'raised'}),{x:plus?16+index*48:40,y:plus?3:25,width:size,height:size})}</g>`).join('');
    if(plus)content+=['adjust','skip','shield'].map((effect,index)=>{
      const svg=effectTile(effect).match(/<svg\b[\s\S]*<\/svg>/)?.[0];
      if(!svg)throw Error('SNAKES_EFFECT_ART_REQUIRED');
      const x=8+index*37;
      return `<g data-special="${effect}" data-effect="${effect}"><rect x="${x}" y="53" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/>${vector.place(svg,{x:x+3,y:56,width:24,height:24})}</g>`;
    }).join('');
    return vector.viewport({width:120,height:90,className:'snakes-parameter-mode',attrs:`data-art-role="parameter-diagram" data-snakes-mode="${plus?'plus':'classic'}" aria-hidden="true" focusable="false"`,content});
  }
  const examples={
   "setting-board-64":()=>boardDiagram(8),
   "setting-board-100":()=>boardDiagram(10),
   "setting-mode-classic":()=>modeDiagram(false),
   "setting-mode-plus":()=>modeDiagram(true),
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
