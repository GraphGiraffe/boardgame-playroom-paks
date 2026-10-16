(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'oldmaid.'+key,params});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.score'),
    presets:[{id:'classic',label:message('meta.classic')}],rules:[1,2,3,4].map(index=>message('rules.'+index))};
  const action=command=>message('actions.draw',{index:command.cardIndex+1,target:{kind:'player-reference',index:command.target}});
  const choice=()=>({targetKind:'player',targetChoice:'card'}),metric=()=>message('meta.points');
  function event(value){
    if(value.type==='oldmaid.drawn')return {message:message('events.drawn',{target:{kind:'player-reference',index:value.params.target}}),kind:'draw',sound:{id:'draw'},
      transfer:{player:value.actor,count:1,from:'hand',fromPlayer:value.params.target}};
    if(value.type==='oldmaid.paired')return {message:message('events.paired'),kind:'capture',sound:{id:'success'},
      transfer:{player:value.actor,count:2,from:'hand',fromPlayer:value.actor,to:'table'}};
    if(value.type==='oldmaid.finished')return {message:message('events.finished'),finish:true};
    throw Error('OLDMAID_EVENT_UNKNOWN');
  }
  const scene=projection=>({contractVersion:1,id:'oldmaid-cards',family:'card-table',
    players:projection.data.hands.map((hand,player)=>({player,hand,metrics:[{id:'points',kind:'points',value:projection.data.points[player],label:metric(),resultUsage:true}]})),
    discard:projection.data.discard});
  return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice,event,metric,scene});
});
