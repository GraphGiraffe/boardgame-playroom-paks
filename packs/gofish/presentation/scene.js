(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'gofish.'+key,params});
  const rank=number=>message(number>=11?'rank.'+number:'rank.numeric',{rank:number});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:[{id:'classic',label:message('meta.classic')}],rules:[1,2,3,4].map(index=>message('rules.'+index))};
  const action=command=>command.type==='draw'?message('actions.draw'):message('actions.ask',{rank:rank(command.rank),target:{kind:'player-reference',index:command.target}});
  function choice(command,projection){return command.type==='ask'?{card:projection.data.hands[projection.viewer].find(card=>card.rank===command.rank).id,targetKind:'player',targetSource:true}:{};}
  function event(value){
    const {actor,params:p}=value;
    if(value.type==='gofish.booked')return {message:message('events.booked',{rank:rank(p.rank)}),kind:'capture',sound:{id:'success'},reveal:{kind:'cards',cards:p.cards,entity:'card-'+p.cards[0].id}};
    if(value.type==='gofish.drawn')return {message:message('events.drawn'),kind:'draw',transfer:{player:actor,count:1,from:'stock'}};
    if(value.type==='gofish.asked')return {message:message('events.asked',{rank:rank(p.rank),target:{kind:'player-reference',index:p.target}}),kind:'action',speech:{speaker:actor,target:p.target,text:message('speech.rank.'+(p.rank>=11?p.rank:'numeric'),{rank:p.rank})}};
    if(value.type==='gofish.given')return {message:message('events.given',{count:p.count}),kind:'play',sound:{id:'draw'},transfer:{player:p.target,count:p.count,from:'hand',fromPlayer:actor},speech:{speaker:actor,target:p.target,icon:'cards',count:p.count,result:'success'}};
    if(value.type==='gofish.absent')return {message:message('events.absent',{rank:rank(p.rank)}),kind:'action',speech:{speaker:actor,target:p.target,icon:'cross',result:'error'}};
    if(value.type==='gofish.repeat')return {message:message('events.repeat'),kind:'action'};
    if(value.type==='gofish.finished')return {message:message('events.finished'),finish:true};
    throw Error('GOFISH_EVENT_UNKNOWN');
  }
  const metric=()=>message('meta.books');
  const scene=projection=>({contractVersion:1,id:'gofish-table',family:'card-table',stockCount:projection.data.drawPile.length,
    players:projection.data.hands.map((hand,player)=>({player,hand,books:projection.data.books[player],
      metrics:[{id:'books',kind:'points',value:projection.data.books[player].length,label:metric(),resultUsage:true}]}))});
  return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice,event,metric,scene,rank});
});
