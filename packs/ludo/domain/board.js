(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomLudoBoard=api;})(globalThis,function(){
 'use strict';const starts=[0,13,26,39],safe=new Set([...starts,...starts.map(n=>(n+8)%52)]);
 const home=row=>row.every(cell=>cell===57),team=player=>player%2,partner=player=>(player+2)%4;
 const globalCell=(owner,progress)=>(starts[owner]+progress)%52;
 const isSafe=(owner,progress)=>progress>=0&&progress<52&&safe.has(globalCell(owner,progress));
 const activeOwner=(position,actor)=>position.preset==='teams'&&home(position.data.pawns[actor])?partner(actor):actor;
 const stranded=(position,actor)=>position.data.pawns[activeOwner(position,actor)].every(n=>n<0||n===57);
 const progressAfter=(from,die)=>from<0?0:from+die;
 const destinationProgress=(position,action)=>progressAfter(position.data.pawns[action.owner][action.pawn],position.data.dice[action.dieIndex]);
 const opponent=(position,owner,player)=>player!==owner&&(position.preset!=='teams'||team(player)!==team(owner));
 function captureCell(owner,progress){
  if(progress<0||progress>=52)return -1;
  const cell=globalCell(owner,progress);
  return safe.has(cell)?-1:cell;
 }
 function visitOpponents(position,owner,visit){
  const pawns=position.data.pawns;
  for(let player=0;player<pawns.length;player++)if(opponent(position,owner,player)){
   const row=pawns[player];
   for(let pawn=0;pawn<row.length;pawn++){
    const from=row[pawn];
    if(from>=0&&from<52)visit(globalCell(player,from),player,pawn,from);
   }
  }
 }
 // A turn's legal moves share one owner. Index capture counts once when
 // previewing several destinations. Only a committed move needs pawn IDs.
 function captureCounter(position,owner){
  let counts;
  return progress=>{
   const cell=captureCell(owner,progress);
   if(cell<0)return 0;
   if(!counts){
    counts=new Uint8Array(52);
    visitOpponents(position,owner,cell=>counts[cell]++);
   }
   return counts[cell];
  };
 }
 function destination(position,action){
  const owner=action.owner,from=position.data.pawns[owner][action.pawn],to=destinationProgress(position,action),captured=[];
  const cell=captureCell(owner,to);
  if(cell>=0){
   visitOpponents(position,owner,(other,player,pawn,from)=>{
    if(other===cell)captured.push({owner:player,pawn,from});
   });
  }
  return {from,to,captured};
 }
 function scanMoves(position,actor,commands){
  const d=position.data;
  if(d.phase!=='move')return false;
  const owner=activeOwner(position,actor),row=d.pawns[owner];
  for(let dieIndex=0;dieIndex<d.dice.length;dieIndex++){
   if(d.used[dieIndex])continue;
   const die=d.dice[dieIndex];
   for(let pawn=0;pawn<row.length;pawn++){
    const from=row[pawn];
    const legal=from<0?(die===6||d.guarantee):from<57&&progressAfter(from,die)<=57;
    if(!legal)continue;
    if(!commands)return true;
    commands.push({type:'move',owner,pawn,dieIndex});
   }
  }
  return false;
 }
 function moves(position,actor){const commands=[];scanMoves(position,actor,commands);return commands;}
 const hasMove=(position,actor)=>scanMoves(position,actor,null);
 return Object.freeze({starts,home,team,partner,globalCell,isSafe,opponent,stranded,moves,hasMove,destination,destinationProgress,captureCounter,visitOpponents});
});
