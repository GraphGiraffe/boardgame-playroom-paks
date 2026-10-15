(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;
})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'pexeso.'+key,params});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:['easy','medium','hard','full'].map(id=>({id,label:message('presets.'+id)})),rules:[1,2,3].map(index=>message('rules.'+index))};
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
  function scene(projection){const d=projection.data;return {contractVersion:1,id:'pexeso-board',family:'memory-cards',
    cards:d.board.map((card,index)=>({id:'card-'+index,index,card,matched:d.matched.includes(index),closing:d.phase==='reveal'&&d.flipped.includes(index)})),
    players:d.scores.map((value,player)=>({player,metrics:[{id:'pairs',value,label:metric(),resultUsage:true}]}))};}
  return Object.freeze({metadata,action,event,metric,scene});
});
