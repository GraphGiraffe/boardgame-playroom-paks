// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../lang/ru.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'ludo.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const vector=root.PlayroomGameComponents.vector;
  const svgBody=svg=>svg.replace(/^<svg\b[^>]*>/,'').replace(/<\/svg>$/,'');
  const pawn=(x,y,size)=>`<g data-diagram-pawn transform="translate(${x} ${y}) scale(${size/100})" stroke="none">${svgBody(C.roundTokenArt({profile:'pawn'}))}</g>`;
  // Public setting diagrams use the same pawn material as the board, no state.
  function setupDiagram(kind,enabled){
    const leaving=enabled,points=[[20,38],[38,38],[20,56],[38,56]];
    let art='<rect data-ludo-base x="6" y="23" width="46" height="46" rx="7" fill="currentColor" fill-opacity=".06"/><rect x="6" y="23" width="46" height="46" rx="7"/>';
    art+=points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="7" fill="none" stroke-opacity=".25"/>${i===0&&leaving?'':pawn(x-9,y-8,18)}`).join('');
    art+='<path d="M55 40H83V54H55M69 40V54" stroke-opacity=".35"/><rect data-ludo-start x="87" y="34" width="26" height="26" rx="2" fill="currentColor" fill-opacity=".06"/><rect x="87" y="34" width="26" height="26" rx="2"/>';
    if(leaving)art+=pawn(91,38,18);
    if(kind==='exit'){
      art+=Array.from({length:3},(_,i)=>`<g data-failed-attempt="${i+1}" stroke="currentColor"><rect x="${56+i*19}" y="7" width="14" height="14" rx="2.5" fill="none"/><path d="M${60+i*19} 11l6 6m0-6-6 6"/></g>`).join('');
      art+=enabled?'<path data-base-exit d="M55 47H81m-5-5 5 5-5 5"/>':'<path data-blocked-exit d="M59 43l8 8m0-8-8 8" stroke="currentColor"/>';
    }
    return vector.viewport({width:120,height:80,className:'ludo-parameter-diagram',attrs:`data-art-role="parameter-diagram" data-ludo-parameter-art="${kind}-${enabled?'on':'off'}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`,content:art});
  }
  function sixRerollDiagram(enabled){
    const art=vector.place(C.dieArt(6,{frame:'raised'}),{x:9,y:15,width:40,height:40,attrs:'data-die-value="6" data-reroll-face stroke="none"'})+'<path data-reroll-action d="M57 35H78m-6-6 6 6-6 6"/>'+vector.place(H.icon(enabled?'refresh':'close'),{x:85,y:18,width:34,height:34});
    return vector.viewport({width:120,height:72,attrs:`data-art-role="parameter-diagram" data-ludo-six-reroll="${enabled?'on':'off'}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`,content:art});
  }
  const examples={
   "setting-six-reroll-off":()=>sixRerollDiagram(false),
   "setting-six-reroll-on":()=>sixRerollDiagram(true),
   "setting-guaranteed-exit-on":()=>setupDiagram('exit',true),
   "setting-guaranteed-exit-off":()=>setupDiagram('exit',false),
   "setting-start-pawn-on":()=>setupDiagram('start',true),
   "setting-start-pawn-off":()=>setupDiagram('start',false),
   "base":()=>R.scene(R.row(R.die(6),R.arrow(),R.pawn(1))),
   "move":()=>R.scene(R.row(R.selected(R.pawn(2)),R.arrow(),R.die(3),R.die(6))),
   "safe":()=>R.scene(R.grid(3,[{html:R.pawn(1),tone:'target'},'★',{html:R.pawn(2,'#668fad'),tone:'dark'}]))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
