(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;
})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'snakes.'+key,params});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:['plus','classic'].map(id=>({id,label:message('presets.'+id)})),rules:Array.from({length:6},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"snakes.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"snakes.book.text.1","params":{}}}]},{"text":{"key":"snakes.rules.2","params":{}},"blocks":[{"type":"table","headers":[{"key":"snakes.book.text.2","params":{}},{"key":"snakes.book.text.3","params":{}}],"rows":[[{"key":"snakes.book.text.4","params":{}},{"key":"snakes.book.text.5","params":{}}],[{"key":"snakes.book.text.6","params":{}},{"key":"snakes.book.text.7","params":{}}]]},{"type":"paragraph","text":{"key":"snakes.book.text.8","params":{}}}],"layout":"stack","figures":[{"id":"dice","caption":{"key":"snakes.book.figure.dice","params":{}},"role":"diagram"},{"id":"adjust","caption":{"key":"snakes.book.figure.adjust","params":{}},"role":"diagram"}]},{"text":{"key":"snakes.rules.3","params":{}},"blocks":[{"type":"table","headers":[{"key":"snakes.book.text.9","params":{}},{"key":"snakes.book.text.10","params":{}}],"rows":[[{"key":"snakes.book.text.11","params":{}},{"key":"snakes.book.text.12","params":{}}],[{"key":"snakes.book.text.13","params":{}},{"key":"snakes.book.text.14","params":{}}],[{"key":"snakes.book.text.15","params":{}},{"key":"snakes.book.text.16","params":{}}]]},{"type":"paragraph","text":{"key":"snakes.book.text.17","params":{}}}],"layout":"stack","figures":[{"id":"links","caption":{"key":"snakes.book.figure.links","params":{}},"role":"diagram"}]},{"text":{"key":"snakes.rules.4","params":{}},"blocks":[{"type":"paragraph","text":{"key":"snakes.book.text.18","params":{}}},{"type":"paragraph","text":{"key":"snakes.book.text.zero","params":{}}}],"layout":"list","figures":[{"id":"tile-adjust","caption":{"key":"snakes.book.figure.tile-adjust","params":{}},"role":"tile"},{"id":"tile-less","caption":{"key":"snakes.book.figure.tile-less","params":{}},"role":"tile"},{"id":"tile-skip","caption":{"key":"snakes.book.figure.tile-skip","params":{}},"role":"tile"}]},{"text":{"key":"snakes.rules.5","params":{}},"blocks":[{"type":"paragraph","text":{"key":"snakes.book.text.29","params":{}}}],"layout":"list","figures":[{"id":"tile-shield","caption":{"key":"snakes.book.figure.tile-shield","params":{}},"role":"tile"},{"id":"tile-second","caption":{"key":"snakes.book.figure.tile-second","params":{}},"role":"tile"}]},{"text":{"key":"snakes.rules.6","params":{}},"blocks":[{"type":"table","headers":[{"key":"snakes.book.text.30","params":{}},{"key":"snakes.book.text.31","params":{}}],"rows":[[{"key":"snakes.book.text.32","params":{}},{"key":"snakes.book.text.33","params":{}}],[{"key":"snakes.book.text.34","params":{}},{"key":"snakes.book.text.35","params":{}}],[{"key":"snakes.book.text.36","params":{}},{"key":"snakes.book.text.37","params":{}}]]},{"type":"paragraph","text":{"key":"snakes.book.text.38","params":{}}}]}]}};
  const action=c=>c.type==='roll'?message('actions.roll'):message('actions.move',{die:c.dieIndex+1,delta:c.delta>0?'+1':c.delta<0?'−1':'0'}),metric=()=>message('meta.position');
  function event(value){
    const p=value.params;
    if(value.type==='snakes.won')return {message:message('events.won'),finish:true};
    if(value.type==='snakes.rolled')return {message:message('events.rolled',{dice:p.dice.join(', ')}),kind:'roll',presentation:{type:'roll'},sound:{id:'dice'}};
    if(value.type==='snakes.moved')return {message:message(p.to===p.landing?'events.roll':'events.jump',{...p,kind:message(p.to>p.landing?'link.ladder':'link.snake')}),kind:'move',reveal:{kind:'dice',dice:[{value:p.roll}],title:message(p.automatic?'view.second':'view.selected')},presentation:{type:p.trigger,sequence:sequence(p)},sound:{id:p.to===p.landing?'move':p.to>p.landing?'climb':'fall'}};
    if(value.type==='snakes.skipped')return {message:message('events.skipped'),feedback:{kind:'skip',player:value.actor}};
    if(value.type==='snakes.swapped')return {message:message('events.swapped',p),kind:'capture',sound:{id:'capture'}};
    return {message:message('events.'+value.type.split('.')[1],{effect:message('effect.'+(p.effect||'extra'))})};
  }
  function position(n,size=10){const row=Math.floor((Math.max(1,n)-1)/size),col=row%2?size-1-(Math.max(1,n)-1)%size:(Math.max(1,n)-1)%size,step=100/size;return {x:(col+.5)*step,y:100-(row+.5)*step};}
  function sequence(move,finish=move?.finish||100){
    if(!move)return undefined;const point=n=>({anchor:'cell-'+n,label:String(n)});
    return {trigger:move.trigger||'roll',entity:{namespace:'token',id:String(move.player)},player:move.player,counter:'position',origin:move.from===0?{anchor:`entry-${move.player}`,label:'0'}:point(move.from),
      steps:Array.from({length:move.roll},(_,i)=>{const n=move.from+i+1;return point(n>finish?2*finish-n:n);}),
      ...(move.to!==move.landing?{jump:point(move.to)}:{}),
      ...(move.swaps?.length?{arrival:'after-departures',departures:move.swaps.map(s=>({namespace:'token',id:String(s.player)}))}:{})};
  }
  const scene=projection=>({contractVersion:1,id:'snakes-board',family:'route-board',round:{number:projection.data.ending.round,limit:projection.data.ending.maxRounds||null,starts:projection.data.ending.starts},columns:Math.sqrt(projection.data.finish),
    finish:projection.data.finish,links:projection.data.links,special:projection.data.special,effects:projection.data.effects,adjusting:projection.data.adjusting,
    swaps:projection.data.lastMove?.swaps?.map(s=>({...s,by:projection.data.lastMove.player}))||[],
    dice:Array.isArray(projection.data.dice)?projection.data.dice:[projection.data.dice],
    moves:projection.actions.filter(command=>command.type==='move').map(command=>{const d=projection.data,from=d.positions[projection.turn],steps=d.dice[command.dieIndex]+command.delta;const route=Array.from({length:steps},(_,i)=>{const n=from+i+1;return n>d.finish?2*d.finish-n:n;});return {command,landing:route.at(-1)??from,route};}),
    players:projection.data.positions.map((value,player)=>({player,finishPlace:(projection.data.ending?.groups||[]).findIndex(group=>group.includes(player))+1,metrics:[{id:'position',kind:'pieces',value,label:metric(),resultUsage:true},{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:false}]})),
    positions:projection.data.positions.map((cell,player)=>({id:'token-'+player,player,cell,point:position(cell,Math.sqrt(projection.data.finish))})),
    sequence:sequence(projection.data.lastMove,projection.data.finish)});

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'board'}],objects:d.positions.map((cell,owner)=>({ref:{namespace:'token',id:String(owner)},zone:'field',owner,cell})),interactions:p.actions.map(command=>({command,target:{zone:'field'}}))};}
 // Reconstruct display checkpoints from already authorized movement facts only.
 // No legal move, RNG, collision or rule resolution runs in presentation.
 function eventScenes(p){
  const moves=p.events.filter(e=>e.revision===p.revision&&e.type==='snakes.moved');
  if(moves.length<2)return [];
  const positions=[...p.data.positions];
  for(const e of [...moves].reverse()){
   positions[e.params.player]=e.params.from;
   for(const swap of e.params.swaps||[])positions[swap.player]=swap.from;
  }
  return moves.map(e=>{
   positions[e.params.player]=e.params.to;
   for(const swap of e.params.swaps||[])positions[swap.player]=swap.to;
   const projected={...p,actions:[],data:{...p.data,positions:[...positions],lastMove:e.params}};
   return {eventId:e.id,scene:{...scene(projected),...sceneLayout(projected)}};
  });
 }
 // Concise, separately authored player introduction; full rulebook stays intact.
 metadata.rulebook.brief={"sections":[{"title":{"key":"snakes.brief.0.title","params":{}},"paragraphs":[{"key":"snakes.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"dice","caption":{"key":"snakes.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"snakes.brief.1.title","params":{}},"paragraphs":[{"key":"snakes.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"links","caption":{"key":"snakes.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"snakes.brief.2.title","params":{}},"paragraphs":[{"key":"snakes.brief.2.text","params":{}}]}]};
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,event,metric,scene:p=>({...scene(p),...sceneLayout(p)}),position,sequence,eventScenes});
});
