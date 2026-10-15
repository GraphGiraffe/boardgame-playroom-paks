(function(root,factory){
  const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;
})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'snakes.'+key,params});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:['classic','quick'].map(id=>({id,label:message('presets.'+id)})),rules:[1,2,3,4].map(index=>message('rules.'+index))};
  const action=()=>message('actions.roll'),metric=()=>message('meta.position');
  function event(value){
    if(value.type==='snakes.won')return {message:message('events.won'),finish:true};
    const {roll,landing,to}=value.params,jump=landing!==to;
    return {message:message(jump?'events.jump':'events.roll',{roll,landing,to,kind:message(to>landing?'link.ladder':'link.snake')}),
      kind:'roll',sound:{id:jump?(to>landing?'climb':'fall'):'dice'},presentation:{type:'roll'}};
  }
  function position(n,size=10){const row=Math.floor((Math.max(1,n)-1)/size),col=row%2?size-1-(Math.max(1,n)-1)%size:(Math.max(1,n)-1)%size,step=100/size;return {x:(col+.5)*step,y:100-(row+.5)*step};}
  function sequence(move,finish){
    if(!move)return undefined;const point=n=>({anchor:'cell-'+n,label:String(n)});
    return {trigger:'roll',entity:'token-'+move.player,player:move.player,counter:'position',origin:point(move.from),
      steps:Array.from({length:move.roll},(_,i)=>{const n=move.from+i+1;return point(n>finish?2*finish-n:n);}),
      ...(move.to!==move.landing?{jump:point(move.to)}:{})};
  }
  const scene=projection=>({contractVersion:1,id:'snakes-board',family:'route-board',columns:Math.sqrt(projection.data.finish),
    players:projection.data.positions.map((value,player)=>({player,metrics:[{id:'position',kind:'pieces',value,label:metric(),resultUsage:true},{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:false}]})),
    positions:projection.data.positions.map((cell,player)=>({id:'token-'+player,player,cell,point:position(cell,Math.sqrt(projection.data.finish))})),
    sequence:sequence(projection.data.lastMove,projection.data.finish)});
  return Object.freeze({metadata,action,event,metric,scene,position,sequence});
});
