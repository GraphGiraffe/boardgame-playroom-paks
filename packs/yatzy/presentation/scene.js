(function(root,factory){
  const api=factory(root.PlayroomYatzyCategories||(typeof require==='function'?require('../domain/categories.js'):null));
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomPackPresentation=api;
})(globalThis,function(categories){
  'use strict';
  const message=(key,params={})=>({key:'yatzy.'+key,params});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:[{id:'classic',label:message('meta.classic')}],rules:[1,2,3,4].map(n=>message('rules.'+n))};
  function action(command,projection){
    if(command.type==='roll')return message(projection?.data.rolls?'actions.reroll':'actions.roll');
    if(command.type==='hold')return message('actions.hold',{die:command.index+1});
    return message('actions.score',{category:message('category.'+command.key),points:projection.data.previews[command.key]});
  }
  function event(value){
    const p=value.params;
    if(value.type==='yatzy.rolled')return {message:message('events.rolled',{rolls:p.rolls}),kind:'roll'};
    if(value.type==='yatzy.scored')return {message:message('events.scored',{category:message('category.'+p.category),points:p.points}),kind:'action',
      sound:{id:!p.points?'notify':p.category==='yatzy'?'success.yatzy':categories.keys.indexOf(p.category)<6||p.category==='chance'?'success':'success.special'}};
    if(value.type==='yatzy.bonus')return {message:message('events.bonus',{points:p.points}),kind:'action',sound:{id:'success.special'}};
    if(value.type==='yatzy.finished')return {message:message('events.finished',{top:p.top}),finish:true};
    throw Error('YATZY_EVENT_UNKNOWN');
  }
  const metric=id=>message(id==='points'?'meta.points':'meta.wins');
  function scene(projection){
    const d=projection.data;
    return {contractVersion:1,id:'yatzy-table',family:'score-table',round:{number:Math.min(projection.data.roundLimit,Math.floor(projection.data.round/projection.playerCount)+1),limit:projection.data.roundLimit,starts:projection.data.roundStarts},
      rows:categories.keys.map(key=>({id:key,label:message('category.'+key),
        cells:d.scores.map((row,player)=>({player,value:row[key]??null,preview:d.previews[key],
          command:player===projection.turn?projection.actions.find(a=>a.type==='score'&&a.key===key)||null:null}))})),
      players:d.totals.map((value,player)=>({id:player,metrics:[{id:'points',kind:'points',value,format:'integer',label:metric('points'),resultUsage:true},{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:false}]}))};
  }
  return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,event,metric,scene});
});
