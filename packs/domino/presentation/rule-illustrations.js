// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../lang/ru.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'domino.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const vector=root.PlayroomGameComponents.vector;
  function handDiagram(count){
    const cells=count===5?[[34,4],[62,4],[90,4],[48,44],[76,44]]:[[20,4],[48,4],[76,4],[104,4],[34,44],[62,44],[90,44]];
    const art=cells.map(([x,y],i)=>`<g data-domino-example="${i}" stroke="none">${vector.place(C.dominoFace(Math.floor(i/7),i%7),{x,y,width:20,height:35})}</g>`).join('');
    return vector.viewport({width:144,height:84,className:'domino-hand-diagram',attrs:`data-art-role="parameter-diagram" data-parameter-hand-count="${count}" fill="none" aria-hidden="true" focusable="false"`,content:art});
  }
  const examples={
   "setting-hand-5":()=>handDiagram(5),
   "setting-hand-7":()=>handDiagram(7),
   "join":()=>R.scene(R.row(R.domino(3,6),R.arrow(),R.domino(6,2))),
   "controls":()=>R.scene(R.row(R.button(t('draw')),R.button(t('pass'))))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
