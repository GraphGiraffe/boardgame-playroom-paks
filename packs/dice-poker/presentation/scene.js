(function(root,factory){
  const categories=root.PlayroomYatzyCategories||(typeof require==='function'?require('../domain/categories.js'):null);
  const DieAsset=root.PlayroomDieAsset||(typeof require==='function'?require('../../../shared/presentation/die-asset.js'):null);
  const ScoreTableAsset=root.PlayroomScoreTableAsset||(typeof require==='function'?require('../../../shared/presentation/score-table-asset.js'):null);
  const api=factory(categories,DieAsset,ScoreTableAsset);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomPackPresentation=api;
})(globalThis,function(categories,DieAsset,ScoreTableAsset){
  'use strict';
  const message=(key,params={})=>({key:'yatzy.'+key,params});
  const die=new DieAsset();
  const table=new ScoreTableAsset(),rowIndex=new Map(categories.keys.map((id,index)=>[id,index]));
  const metadata={cover:{kind:'asset',id:'assets/cover.webp'},name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),seriesScoreMetric:'points',
    presets:[{id:'classic',label:message('meta.classic')}],rules:Array.from({length:6},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"yatzy.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"yatzy.book.text.1","params":{}}}]},{"text":{"key":"yatzy.rules.2","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"yatzy.book.text.2","params":{}},{"key":"yatzy.book.text.3","params":{}},{"key":"yatzy.book.text.4","params":{}}]}],"layout":"stack","figures":[{"id":"roll","caption":{"key":"yatzy.book.figure.roll","params":{}},"role":"diagram"}]},{"text":{"key":"yatzy.rules.3","params":{}},"blocks":[{"type":"paragraph","text":{"key":"yatzy.book.text.5","params":{}}},{"type":"paragraph","text":{"key":"yatzy.book.text.6","params":{}}}],"layout":"stack","figures":[{"id":"score","caption":{"key":"yatzy.book.figure.score","params":{}},"role":"diagram"}]},{"text":{"key":"yatzy.rules.4","params":{}},"blocks":[{"type":"table","headers":[{"key":"yatzy.book.text.7","params":{}},{"key":"yatzy.book.text.8","params":{}}],"rows":[[{"key":"yatzy.book.text.9","params":{}},{"key":"yatzy.book.text.10","params":{}}],[{"key":"yatzy.book.text.11","params":{}},{"key":"yatzy.book.text.12","params":{}}],[{"key":"yatzy.book.text.13","params":{}},{"key":"yatzy.book.text.14","params":{}}],[{"key":"yatzy.book.text.15","params":{}},{"key":"yatzy.book.text.16","params":{}}]]},{"type":"paragraph","text":{"key":"yatzy.book.text.17","params":{}}}],"layout":"stack","figures":[{"id":"pair","caption":{"key":"yatzy.book.figure.pair","params":{}},"role":"diagram"}]},{"text":{"key":"yatzy.rules.5","params":{}},"blocks":[{"type":"table","headers":[{"key":"yatzy.book.text.18","params":{}},{"key":"yatzy.book.text.19","params":{}}],"rows":[[{"key":"yatzy.book.text.20","params":{}},{"key":"yatzy.book.text.21","params":{}}],[{"key":"yatzy.book.text.22","params":{}},{"key":"yatzy.book.text.23","params":{}}],[{"key":"yatzy.book.text.24","params":{}},{"key":"yatzy.book.text.25","params":{}}],[{"key":"yatzy.book.text.26","params":{}},{"key":"yatzy.book.text.27","params":{}}],[{"key":"yatzy.book.text.28","params":{}},{"key":"yatzy.book.text.29","params":{}}]]},{"type":"paragraph","text":{"key":"yatzy.book.text.30","params":{}}}]},{"text":{"key":"yatzy.rules.6","params":{}},"blocks":[{"type":"paragraph","text":{"key":"yatzy.book.text.31","params":{}}},{"type":"paragraph","text":{"key":"yatzy.book.text.32","params":{}}}]}]}};
  function action(command,projection){
    if(command.type==='roll')return message(projection?.data.rolls?'actions.reroll':'actions.roll');
    if(command.type==='hold')return message('actions.hold',{die:command.index+1});
    return message('actions.score',{category:message('category.'+command.key),points:projection.data.previews[command.key]});
  }
  function event(value){
    const p=value.params;
    if(value.type==='yatzy.rolled')return {message:message('events.rolled',{rolls:p.rolls}),kind:'roll'};
    if(value.type==='yatzy.scored')return {message:message('events.scored',{category:message('category.'+p.category),points:p.points}),kind:'action',reveal:die.reveal(p.dice,message('category.'+p.category),categories.participation(p.dice,p.category)),
      sound:{id:!p.points?'notify':p.category==='yatzy'?'success.yatzy':categories.keys.indexOf(p.category)<6||p.category==='chance'?'success':'success.special'}};
    if(value.type==='yatzy.bonus')return {message:message('events.bonus',{points:p.points}),kind:'action',sound:{id:'success.special'}};
    if(value.type==='yatzy.finished')return {message:message('events.finished',{top:p.top}),finish:true};
    throw Error('YATZY_EVENT_UNKNOWN');
  }
  const choice=(command,projection)=>command.type==='score'?{confirmation:message('actions.confirm-score',{category:message('category.'+command.key),points:projection.data.previews[command.key]})}:{};
  const metric=id=>message(id==='points'?'meta.points':'meta.wins');
  function scene(projection){
    const d=projection.data;
    return {contractVersion:1,id:'yatzy-table',family:'score-table',rolls:d.rolls,upper:d.upper,bonuses:d.bonuses,totals:d.totals,round:{number:Math.min(projection.data.roundLimit,Math.floor(projection.data.round/projection.playerCount)+1),limit:projection.data.roundLimit,starts:projection.data.roundStarts},
      rows:table.categoryRows(categories.keys,d.scores,{actions:projection.actions.filter(command=>command.type==='score'),
        player:projection.turn,label:key=>message('category.'+key),preview:key=>d.previews[key],
        actionLabel:(category,points)=>message('actions.score',{category,points})}),
      players:d.totals.map((value,player)=>({player,metrics:[{id:'points',kind:'points',value,format:'integer',label:metric('points'),resultUsage:true},{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:false}]}))};
  }

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){
  const d=p.data,publicDice=p.audience==='public'&&!p.actions.length,roll=p.actions.find(c=>c.type==='roll');
  // The sheet receives already computed totals and exact score commands. No
  // category arithmetic or rule interpretation is duplicated in the renderer.
  return {dicePlacement:p.audience==='public'?'status':'actions',diceStyle:'flat',
   dice:d.dice.map((value,index)=>die.describe(publicDice&&!d.rolls?null:value,{held:d.held[index],label:message(d.held[index]?'dice.release':'dice.hold')})),
   scoreLayout:{kind:'category-sheet',categoryLabel:message('table.category'),
    summaries:[{id:'upper',afterRow:'sixes',label:message('table.upper'),values:d.upper},{id:'bonus',afterRow:'sixes',label:message('table.bonus'),values:d.bonuses}],
    total:{id:'total',label:message('table.total'),values:d.totals},
    controls:{public:publicDice,label:message('view.roll-progress',{action:message(d.rolls?'dice.reroll':'dice.roll'),rolls:d.rolls,limit:3}),...(roll?{command:roll}:{})}},
   ...table.layout({zones:[{id:'controls',kind:'controls'}],objects:d.dice.map((_,index)=>die.place(index,'controls',index)),
    interactions:p.actions.map(command=>command.type==='hold'?die.activate(command.index,command):
     command.type==='score'?table.activateCell(command,rowIndex.get(command.key)):table.activateCell(command,null,'controls'))}),
  };
 }
 // Concise, separately authored player introduction; full rulebook stays intact.
 metadata.rulebook.brief={"sections":[{"title":{"key":"yatzy.brief.0.title","params":{}},"paragraphs":[{"key":"yatzy.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"roll","caption":{"key":"yatzy.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"yatzy.brief.1.title","params":{}},"paragraphs":[{"key":"yatzy.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"score","caption":{"key":"yatzy.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"yatzy.brief.2.title","params":{}},"paragraphs":[{"key":"yatzy.brief.2.text","params":{}}]}]};
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice,event,metric,scene:p=>({...scene(p),...sceneLayout(p),screenFamily:'board',fieldSizing:'scroll',actionReserve:true})});
});
