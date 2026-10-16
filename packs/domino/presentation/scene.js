(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(){
 'use strict';const message=(key,params={})=>({key:'domino.'+key,params});
 const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.points'),presets:['classic','quick'].map(id=>({id,label:message('presets.'+id)})),rules:[1,2,3,4,5].map(index=>message('rules.'+index))};
 function action(command,projection){if(command.type!=='play')return message('actions.'+command.type);
  const tile=projection.data.hands[projection.viewer].find(tile=>tile.id===command.card);return message(projection.data.chain.length?'actions.play-side':'actions.play',{a:tile.a,b:tile.b,side:message('side.'+command.side)});}
 function event(value){const p=value.params;
  if(value.type==='domino.drawn')return {message:message('events.drawn'),kind:'draw',sound:{id:'draw',target:value.actor},transfer:{player:value.actor,count:1,from:'stock'}};
  if(value.type==='domino.passed')return {message:message('events.passed'),kind:'pass',feedback:{kind:'skip',player:value.actor},speech:{speaker:value.actor,text:message('speech.pass')}};
  if(value.type==='domino.played')return {message:message('events.played',{a:p.a,b:p.b,side:message('side.'+p.side)}),kind:'play',sound:{id:'move'}};
  if(value.type==='domino.cleared')return {message:message('events.cleared'),finish:true};
  if(value.type==='domino.fish')return {message:message(value.actor===null?'events.fish-draw':'events.fish-win',{best:p.best}),finish:true};
  throw Error('DOMINO_EVENT_UNKNOWN');
 }
 const metric=()=>message('meta.pips');
 const scene=projection=>({contractVersion:1,id:'domino-chain',family:'tile-chain',chain:projection.data.chain,
  players:projection.data.hands.map((hand,player)=>({player,hand,metrics:[{id:'points',kind:'points',value:projection.data.points[player],label:metadata.scoreLabel,resultUsage:false}]})),stockCount:projection.data.stock.length});
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,event,metric,scene});
});
