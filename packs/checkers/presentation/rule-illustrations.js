// Public rulebook examples composed from gameplay renderers; no session or commands.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackRuleIllustrations=api;})(globalThis,function(root){
 'use strict';
 function create({card:renderCard,linksSVG}={}){
  const C=root.PlayroomShared,H=root.PlayroomViews.helpers,R=C.rulebookArt();
  const source=typeof require==='function'&&!root.PlayroomPack;
  const tr=H.translator(source?{ru:require('../lang/ru.json')}:root.PlayroomPackResources.locales);
  const t=key=>tr.format({key:'checkers.book.art-label.'+key,params:{}});
  const card=value=>(renderCard||C.card)({...value,id:'rule-example'});
  const vector=root.PlayroomGameComponents.vector;
  function piecesDiagram(count){
    const rows=count/4,art=Array.from({length:count},(_,i)=>{
      const x=18+(i%4)*28,y=(rows===2?16:3)+Math.floor(i/4)*27;
      return `<g data-checker-example="${i}" class="checker-piece owner-1">${vector.place(C.checkerArt(false),{x,y,width:24,height:24})}</g>`;
    }).join('');
    return vector.viewport({width:144,height:84,className:'checkers-count-diagram',attrs:`data-art-role="parameter-diagram" data-parameter-checkers-count="${count}" fill="none" aria-hidden="true" focusable="false"`,content:art});
  }
  const examples={
   "setting-pieces-8":()=>piecesDiagram(8),
   "setting-pieces-12":()=>piecesDiagram(12),
   "move":()=>R.scene(R.grid(3,[{html:'',tone:'dark'},'',{html:R.checker(false),tone:'dark'},'',{html:R.checker(false),tone:'dark'},'',{html:'',tone:'target'},'',{html:'',tone:'dark'}])),
   "king":()=>R.scene(R.row(`<span class="rule-art-checker">${R.checker(false)}</span>`,R.arrow(),`<span class="rule-art-checker">${R.checker(true)}</span>`))
  };
  return id=>examples[id]?.()||'';
 }
 return Object.freeze({create});
});
