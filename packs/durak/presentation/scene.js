(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(){
 'use strict';const message=(key,params={})=>({key:'durak.'+key,params});
 const face=card=>card.joker?message(card.color==='red'?'card.red-joker':'card.black-joker'):message('card.face',{rank:card.rank>=11?message('rank.'+card.rank):card.rank,suit:card.suit});
 const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
  presets:[{id:'classic',label:message('meta.classic')}],rules:[1,2,3,4,5,6].map(index=>message('rules.'+index))};
 function action(command,projection){const d=projection.data,own=d.hands[projection.actor],card=own.find(card=>card.id===command.card);
  if(command.type==='done')return message(d.taking?'actions.end-throw':projection.playerCount===2?'actions.beaten':'actions.pass');
  if(command.type==='attack')return message(d.composing?'actions.open':'actions.attack',{card:face(card)});
  if(command.type==='defend')return message('actions.defend',{card:face(card),attack:face(d.table[command.target].attack)});
  if(command.type==='transfer')return message('actions.transfer',{card:face(card)});
  return message('actions.'+command.type);
 }
 function event(value){const p=value.params,actor=value.actor;
  if(value.type==='durak.taken')return {message:message('events.taken',{count:p.count}),kind:'take',transfer:{player:actor,count:p.count,from:'table'}};
  if(value.type==='durak.discarded')return {message:message('events.discarded'),kind:'discard',sound:{id:'success'}};
  if(value.type==='durak.drawn')return {message:message('events.drawn',{count:p.count}),kind:'draw',transfer:{player:actor,count:p.count,from:'stock'}};
  if(value.type==='durak.exchanged')return {message:message('events.exchanged'),kind:'play'};
  if(value.type==='durak.confirmed')return {message:message('events.confirmed'),kind:'attack'};
  if(value.type==='durak.passed')return {message:message('events.passed'),kind:'pass',speech:{speaker:actor,text:message('speech.pass')}};
  if(value.type==='durak.taking')return {message:message('events.taking'),kind:'take',speech:{speaker:actor,text:message('speech.take')}};
  if(value.type==='durak.attacked'||value.type==='durak.transferred')return {message:message(value.type==='durak.transferred'?'events.transferred':'events.attacked',{card:face(p.card)}),kind:'attack',sound:{id:value.type==='durak.transferred'?'reverse':'attack'}};
  if(value.type==='durak.defended')return {message:message('events.defended',{card:face(p.card),attack:face(p.attack)}),kind:'defend'};
  if(value.type==='durak.all-out')return {message:message('events.all-out'),finish:true};
  if(value.type==='durak.first-out')return {message:message('events.first-out',{players:{kind:'player-list-reference',indices:p.players}}),finish:true};
  if(value.type==='durak.last-fool')return {message:message('events.last-fool'),finish:true};
  throw Error('DURAK_EVENT_UNKNOWN');
 }
 const metric=id=>message(id==='hand-count'?'meta.hand-count':'meta.victory');
 const scene=projection=>({contractVersion:1,id:'durak-table',family:'card-table',table:projection.data.table,
  stockCount:projection.data.drawPile.length,players:projection.data.hands.map((hand,player)=>({player,hand,role:player===projection.data.defender?'defender':player===projection.data.attacker?'attacker':'thrower'}))});
 return Object.freeze({metadata,action,event,metric,scene,face});
});
