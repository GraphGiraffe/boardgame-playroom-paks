(function(root,factory){
  const api=factory(root.PlayroomYatzyCategories||(typeof require==='function'?require('../domain/categories.js'):null));
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomPackPresentation=api;
})(globalThis,function(categories){
  'use strict';
  const message=(key,params={})=>({key:'yatzy.'+key,params});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:[{id:'classic',label:message('meta.classic')}],rules:Array.from({length:6},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"yatzy.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"yatzy.book.text.1","params":{}}}]},{"text":{"key":"yatzy.rules.2","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"yatzy.book.text.2","params":{}},{"key":"yatzy.book.text.3","params":{}},{"key":"yatzy.book.text.4","params":{}}]}],"layout":"stack","figures":[{"id":"roll","caption":{"key":"yatzy.book.figure.roll","params":{}},"role":"diagram"}]},{"text":{"key":"yatzy.rules.3","params":{}},"blocks":[{"type":"paragraph","text":{"key":"yatzy.book.text.5","params":{}}},{"type":"paragraph","text":{"key":"yatzy.book.text.6","params":{}}}],"layout":"stack","figures":[{"id":"score","caption":{"key":"yatzy.book.figure.score","params":{}},"role":"diagram"}]},{"text":{"key":"yatzy.rules.4","params":{}},"blocks":[{"type":"table","headers":[{"key":"yatzy.book.text.7","params":{}},{"key":"yatzy.book.text.8","params":{}}],"rows":[[{"key":"yatzy.book.text.9","params":{}},{"key":"yatzy.book.text.10","params":{}}],[{"key":"yatzy.book.text.11","params":{}},{"key":"yatzy.book.text.12","params":{}}],[{"key":"yatzy.book.text.13","params":{}},{"key":"yatzy.book.text.14","params":{}}],[{"key":"yatzy.book.text.15","params":{}},{"key":"yatzy.book.text.16","params":{}}]]},{"type":"paragraph","text":{"key":"yatzy.book.text.17","params":{}}}],"layout":"stack","figures":[{"id":"pair","caption":{"key":"yatzy.book.figure.pair","params":{}},"role":"diagram"}]},{"text":{"key":"yatzy.rules.5","params":{}},"blocks":[{"type":"table","headers":[{"key":"yatzy.book.text.18","params":{}},{"key":"yatzy.book.text.19","params":{}}],"rows":[[{"key":"yatzy.book.text.20","params":{}},{"key":"yatzy.book.text.21","params":{}}],[{"key":"yatzy.book.text.22","params":{}},{"key":"yatzy.book.text.23","params":{}}],[{"key":"yatzy.book.text.24","params":{}},{"key":"yatzy.book.text.25","params":{}}],[{"key":"yatzy.book.text.26","params":{}},{"key":"yatzy.book.text.27","params":{}}],[{"key":"yatzy.book.text.28","params":{}},{"key":"yatzy.book.text.29","params":{}}]]},{"type":"paragraph","text":{"key":"yatzy.book.text.30","params":{}}}]},{"text":{"key":"yatzy.rules.6","params":{}},"blocks":[{"type":"paragraph","text":{"key":"yatzy.book.text.31","params":{}}},{"type":"paragraph","text":{"key":"yatzy.book.text.32","params":{}}}]}]}};
  function action(command,projection){
    if(command.type==='roll')return message(projection?.data.rolls?'actions.reroll':'actions.roll');
    if(command.type==='hold')return message('actions.hold',{die:command.index+1});
    return message('actions.score',{category:message('category.'+command.key),points:projection.data.previews[command.key]});
  }
  function event(value){
    const p=value.params;
    if(value.type==='yatzy.rolled')return {message:message('events.rolled',{rolls:p.rolls}),kind:'roll'};
    if(value.type==='yatzy.scored')return {message:message('events.scored',{category:message('category.'+p.category),points:p.points}),kind:'action',reveal:{kind:'dice',title:message('category.'+p.category),dice:p.dice.map((value,index)=>({value,active:categories.participation(p.dice,p.category)[index]}))},
      sound:{id:!p.points?'notify':p.category==='yatzy'?'success.yatzy':categories.keys.indexOf(p.category)<6||p.category==='chance'?'success':'success.special'}};
    if(value.type==='yatzy.bonus')return {message:message('events.bonus',{points:p.points}),kind:'action',sound:{id:'success.special'}};
    if(value.type==='yatzy.finished')return {message:message('events.finished',{top:p.top}),finish:true};
    throw Error('YATZY_EVENT_UNKNOWN');
  }
  const choice=(command,projection)=>command.type==='score'?{confirmation:message('actions.confirm-score',{category:message('category.'+command.key),points:projection.data.previews[command.key]})}:{};
  const metric=id=>message(id==='points'?'meta.points':'meta.wins');
  function scene(projection){
    const d=projection.data;
    return {contractVersion:1,id:'yatzy-table',family:'score-table',rolls:d.rolls,dice:d.dice.map((value,index)=>({value,held:d.held[index]})),upper:d.upper,bonuses:d.bonuses,totals:d.totals,round:{number:Math.min(projection.data.roundLimit,Math.floor(projection.data.round/projection.playerCount)+1),limit:projection.data.roundLimit,starts:projection.data.roundStarts},
      rows:categories.keys.map(key=>({id:key,label:message('category.'+key),
        cells:d.scores.map((row,player)=>({player,value:row[key]??null,preview:d.previews[key],label:message('actions.score',{category:message('category.'+key),points:d.previews[key]}),
          command:player===projection.turn?projection.actions.find(a=>a.type==='score'&&a.key===key)||null:null}))})),
      players:d.totals.map((value,player)=>({player,metrics:[{id:'points',kind:'points',value,format:'integer',label:metric('points'),resultUsage:true},{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:false}]}))};
  }

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'board'}],objects:d.dice.map((_,index)=>({ref:{namespace:'die',id:String(index)},zone:'field',index})),interactions:p.actions.map(command=>({command,target:{zone:'field'}}))};}
 // Concise, separately authored player introduction; full rulebook stays intact.
 metadata.rulebook.brief={"sections":[{"title":{"key":"yatzy.brief.0.title","params":{}},"paragraphs":[{"key":"yatzy.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"roll","caption":{"key":"yatzy.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"yatzy.brief.1.title","params":{}},"paragraphs":[{"key":"yatzy.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"score","caption":{"key":"yatzy.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"yatzy.brief.2.title","params":{}},"paragraphs":[{"key":"yatzy.brief.2.text","params":{}}]}]};
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice,event,metric,scene:p=>({...scene(p),...sceneLayout(p)})});
});
