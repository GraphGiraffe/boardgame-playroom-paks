(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;
})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'pexeso.'+key,params});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:['easy','medium','hard'].map(id=>({id,label:message('presets.'+id)})),rules:Array.from({length:4},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"pexeso.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"pexeso.book.text.1","params":{}}}]},{"text":{"key":"pexeso.rules.2","params":{}},"blocks":[{"type":"table","headers":[{"key":"pexeso.book.text.2","params":{}},{"key":"pexeso.book.text.3","params":{}}],"rows":[[{"key":"pexeso.book.text.4","params":{}},{"key":"pexeso.book.text.5","params":{}}],[{"key":"pexeso.book.text.6","params":{}},{"key":"pexeso.book.text.7","params":{}}]]},{"type":"paragraph","text":{"key":"pexeso.book.text.8","params":{}}}],"layout":"stack","figures":[{"id":"pair","caption":{"key":"pexeso.book.figure.pair","params":{}},"role":"diagram"}]},{"text":{"key":"pexeso.rules.3","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"pexeso.book.text.9","params":{}},{"key":"pexeso.book.text.10","params":{}}]},{"type":"table","headers":[{"key":"pexeso.book.text.11","params":{}},{"key":"pexeso.book.text.12","params":{}}],"rows":[[{"key":"pexeso.book.text.13","params":{}},{"key":"pexeso.book.text.14","params":{}}],[{"key":"pexeso.book.text.15","params":{}},{"key":"pexeso.book.text.16","params":{}}]]}],"layout":"stack","figures":[{"id":"flip","caption":{"key":"pexeso.book.figure.flip","params":{}},"role":"diagram"}]},{"text":{"key":"pexeso.rules.4","params":{}},"blocks":[{"type":"paragraph","text":{"key":"pexeso.book.text.17","params":{}}}]}]}};
  const action=command=>message('actions.flip',{index:command.index+1});
  function event(value){
    const name=value.type.slice(7);
    if(name==='flipped')return {message:message('events.flipped',{index:value.params.index+1}),kind:'play',
      presentation:{type:'flip',index:value.params.index,...(value.params.closeAfter?{closeAfter:value.params.closeAfter}:{})}};
    if(name==='matched')return {message:message('events.matched'),kind:'capture',sound:{id:'success'}};
    if(name==='mismatch')return {message:message('events.mismatch'),kind:'action',sound:{id:'mismatch'}};
    if(name==='finished')return {message:message('events.finished'),finish:true};
    throw Error('PEXESO_EVENT_UNKNOWN');
  }
  const metric=()=>message('meta.pairs');
  function scene(projection){const d=projection.data;return {contractVersion:1,id:'pexeso-board',family:'memory-cards',revealing:d.phase==='reveal',selectionCount:d.flipped.length,assetSet:d.deckSize===96?'cartoon-deck':'standard-deck',
    cards:d.board.map((card,index)=>({id:'card-'+index,index,card,matched:d.matched.includes(index),closing:d.phase==='reveal'&&d.flipped.includes(index)})),
    players:d.scores.map((value,player)=>({player,metrics:[{id:'pairs',kind:'points',value,label:metric(),resultUsage:true}]}))};}

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'slots:'+d.board.length},zones:[{id:'field',kind:'board'}],objects:d.board.map((_,cell)=>({ref:{namespace:'slot',id:String(cell)},zone:'field',cell})),interactions:p.actions.map(command=>({command,target:command.index!=null?{entity:{namespace:'slot',id:String(command.index)}}:{zone:'field'}}))};}
 // Concise, separately authored player introduction; full rulebook stays intact.
 metadata.rulebook.brief={"sections":[{"title":{"key":"pexeso.brief.0.title","params":{}},"paragraphs":[{"key":"pexeso.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"flip","caption":{"key":"pexeso.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"pexeso.brief.1.title","params":{}},"paragraphs":[{"key":"pexeso.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"pair","caption":{"key":"pexeso.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"pexeso.brief.2.title","params":{}},"paragraphs":[{"key":"pexeso.brief.2.text","params":{}}]}]};
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,event,metric,scene:p=>({...scene(p),...sceneLayout(p)})});
});
