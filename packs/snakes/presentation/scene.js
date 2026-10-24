(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;
})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'snakes.'+key,params});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:['plus','classic'].map(id=>({id,label:message('presets.'+id)})),rules:[1,2,3,4,5,6,7,8].map(index=>message('rules.'+index))};
  const action=c=>message(c.type==='roll'?'actions.roll':'actions.move',{die:c.dieIndex+1,delta:c.delta>0?'+1':c.delta<0?'−1':'0'}),metric=()=>message('meta.position');
  function event(value){
    const p=value.params;
    if(value.type==='snakes.won')return {message:message('events.won'),finish:true};
    if(value.type==='snakes.rolled')return {message:message('events.rolled',{dice:p.dice.join(', ')}),kind:'roll',presentation:{type:'roll'},sound:{id:'dice'}};
    if(value.type==='snakes.moved')return {message:message('events.jump',{...p,kind:message(p.to>p.landing?'link.ladder':'link.snake')}),kind:'move',reveal:{kind:'dice',dice:[{value:p.roll}],title:message(p.automatic?'view.second':'view.selected')},presentation:{type:p.trigger,sequence:sequence(p)},sound:{id:p.to===p.landing?'move':p.to>p.landing?'climb':'fall'}};
    if(value.type==='snakes.skipped')return {message:message('events.skipped'),feedback:{kind:'skip',player:value.actor}};
    return {message:message('events.'+value.type.split('.')[1],{effect:message('effect.'+(p.effect||'extra'))})};
  }
  function position(n,size=10){const row=Math.floor((Math.max(1,n)-1)/size),col=row%2?size-1-(Math.max(1,n)-1)%size:(Math.max(1,n)-1)%size,step=100/size;return {x:(col+.5)*step,y:100-(row+.5)*step};}
  function sequence(move,finish=move?.finish||100){
    if(!move)return undefined;const point=n=>({anchor:'cell-'+n,label:String(n)});
    return {trigger:move.trigger||'roll',entity:{namespace:'token',id:String(move.player)},player:move.player,counter:'position',origin:point(move.from),
      steps:Array.from({length:move.roll},(_,i)=>{const n=move.from+i+1;return point(n>finish?2*finish-n:n);}),
      ...(move.to!==move.landing?{jump:point(move.to)}:{})};
  }
  const scene=projection=>({contractVersion:1,id:'snakes-board',family:'route-board',round:{number:projection.data.ending.round,limit:projection.data.ending.maxRounds||null,starts:projection.data.ending.starts},columns:Math.sqrt(projection.data.finish),
    finish:projection.data.finish,links:projection.data.links,special:projection.data.special,effects:projection.data.effects,adjusting:projection.data.adjusting,
    dice:Array.isArray(projection.data.dice)?projection.data.dice:[projection.data.dice],
    moves:projection.actions.filter(command=>command.type==='move').map(command=>{const d=projection.data,from=d.positions[projection.turn],steps=d.dice[command.dieIndex]+command.delta;const route=Array.from({length:steps},(_,i)=>{const n=from+i+1;return n>d.finish?2*d.finish-n:n;});return {command,landing:route.at(-1),route};}),
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
  for(const e of [...moves].reverse())positions[e.params.player]=e.params.from;
  return moves.map(e=>{
   positions[e.params.player]=e.params.to;
   const projected={...p,actions:[],data:{...p.data,positions:[...positions],lastMove:e.params}};
   return {eventId:e.id,scene:{...scene(projected),...sceneLayout(projected)}};
  });
 }
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,event,metric,scene:p=>({...scene(p),...sceneLayout(p)}),position,sequence,eventScenes});
});
