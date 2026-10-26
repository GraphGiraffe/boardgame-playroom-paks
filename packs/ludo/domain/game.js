(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;})(globalThis,function(ports,B){
 'use strict';const Ending=ports.ending;
 const fact=(name,actor,params={})=>({type:'ludo.'+name,actor,params,visibility:{kind:'public'}});
 function create({playerCount,firstPlayer,preset,rng,options={}}){
  if(!['classic','teams'].includes(preset)||preset==='teams'&&playerCount!==4)throw Error('LUDO_ROSTER_INVALID');
  const diceCount=[1,2,3].includes(Number(options.diceCount))?Number(options.diceCount):2;
  const preview={rng:(rng^0x9e3779b9)>>>0};
  return {playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,data:{
   ending:Ending.create(playerCount,firstPlayer,options.endMode??'round',undefined,Number(options.maxRounds||0)),pawns:Array.from({length:playerCount},()=>[options.startPawn==='on'?0:-1,-1,-1,-1]),diceCount,
   sixReroll:options.sixReroll!=='off',guaranteedExit:options.guaranteedExit!=='off',failed:Array(playerCount).fill(0),guarantee:false,
   dice:Array.from({length:diceCount},()=>ports.rollDie(6,preview)),used:Array(diceCount).fill(true),rollIndices:Array.from({length:diceCount},(_,index)=>index),phase:'roll',die:null,lastRoll:null,last:null}};
 }
 function validate(position){const d=position.data;
  return Number.isSafeInteger(position.rng)&&position.rng>=0&&position.rng<=4294967295&&
   Ending.valid(d.ending,position.playerCount)&&(position.preset!=='teams'||position.playerCount===4)&&Array.isArray(d.pawns)&&d.pawns.length===position.playerCount&&
   d.pawns.every(row=>Array.isArray(row)&&row.length===4&&row.every(n=>Number.isInteger(n)&&n>=-1&&n<=57))&&
   [1,2,3].includes(d.diceCount)&&Array.isArray(d.dice)&&d.dice.length===d.diceCount&&d.dice.every(n=>Number.isInteger(n)&&n>=1&&n<=6)&&
   Array.isArray(d.used)&&d.used.length===d.diceCount&&d.used.every(value=>typeof value==='boolean')&&['roll','move'].includes(d.phase)&&
   Array.isArray(d.failed)&&d.failed.length===position.playerCount&&d.failed.every(n=>Number.isInteger(n)&&n>=0&&n<=3)&&typeof d.guarantee==='boolean'&&
   typeof d.sixReroll==='boolean'&&typeof d.guaranteedExit==='boolean'&&Array.isArray(d.rollIndices)&&new Set(d.rollIndices).size===d.rollIndices.length&&
   d.rollIndices.every(index=>Number.isInteger(index)&&index>=0&&index<d.diceCount);
 }
 function actions(position,actor){if(position.status!=='playing'||actor!==position.turn)return [];
  return (position.data.phase==='roll'?[{type:'roll'}]:B.moves(position,actor)).map(command=>({command,visibility:'public'}));
 }
 function completeBatch(position,actor){const d=position.data;d.phase='roll';d.die=null;d.guarantee=false;
  const repeat=d.sixReroll?d.dice.flatMap((value,index)=>value===6?[index]:[]):[];d.rollIndices=repeat;
  if(!repeat.length||Ending.done(d.ending,actor)){
   const turn=Ending.advance(d.ending,actor,{revision:(position.revision??0)+1});if(turn===null){position.status='finished';position.winners=Ending.winners(d.ending);if(!position.winners.length){const counts=d.pawns.map(row=>row.filter(n=>n===57).length),totals=position.preset==='teams'?counts.map((n,p)=>n+counts[(p+2)%4]):counts;position.winners=totals.flatMap((n,p)=>n===Math.max(...totals)?[p]:[]);}}else position.turn=turn;
   d.rollIndices=Array.from({length:d.diceCount},(_,index)=>index);
  }
 }
 function reduce(position,actor,action){const next=JSON.parse(JSON.stringify(position)),d=next.data,events=[];
  if(action.type==='roll'){
   d.lastRolled=d.rollIndices.slice();d.used.fill(true);for(const index of d.rollIndices){d.dice[index]=ports.rollDie(6,next);d.used[index]=false;}
   d.die=d.dice[d.rollIndices[0]];d.lastRoll=d.die;d.phase='move';d.last=null;
   if(B.stranded(next,actor)&&!d.rollIndices.some(index=>d.dice[index]===6)){d.failed[actor]=Math.min(3,d.failed[actor]+1);d.guarantee=d.guaranteedExit&&d.failed[actor]>=3;}
   else{d.failed[actor]=0;d.guarantee=false;}
   events.push(fact('rolled',actor,{dice:d.rollIndices.map(index=>d.dice[index])}));
   if(!B.moves(next,actor).length){events.push(fact('skipped',actor));completeBatch(next,actor);}
  }else{
   const die=d.dice[action.dieIndex],{from,to,captured}=B.destination(next,action),guaranteed=from<0&&die!==6&&d.guarantee;
   d.used[action.dieIndex]=true;d.pawns[action.owner][action.pawn]=to;d.last={owner:action.owner,pawn:action.pawn,from,to,die,captured};
   if(from<0){d.guarantee=false;d.failed[actor]=0;}
   for(const capture of captured){d.pawns[capture.owner][capture.pawn]=-1;events.push(fact('captured',actor,{owner:action.owner,target:capture.owner}));}
   events.push(fact('moved',actor,{owner:action.owner,pawn:action.pawn,from,to}));
   const members=next.preset==='teams'?[B.team(action.owner),B.team(action.owner)+2]:[action.owner];
   if(members.every(player=>B.home(d.pawns[player]))&&Ending.record(d.ending,members,next,'finished')){
    events.push(fact('won',actor,{members}));d.used.fill(true);completeBatch(next,actor);
   }else{if(guaranteed)d.used.fill(true);if(guaranteed||!B.moves(next,actor).length)completeBatch(next,actor);}
  }
  return {position:next,events,turnEnded:next.turn!==actor||next.status==='finished'};
 }
 const project=position=>JSON.parse(JSON.stringify(position.data));
 // Probability that at least one subset of the next dice reaches a distance.
 // Public dice count only; never inspect future rolls or mutate RNG.
 const reachByDice=new Map();
 function reachProbabilities(count){
  if(reachByDice.has(count))return reachByDice.get(count);
  const hits=Array(count*6+1).fill(0),total=6**count;
  const roll=(dice)=>{if(dice.length<count){for(let n=1;n<=6;n++)roll([...dice,n]);return;}
   let sums=new Set([0]);for(const die of dice)sums=new Set([...sums,...[...sums].map(n=>n+die)]);
   for(const n of sums)hits[n]++;
  };roll([]);const result=hits.map(n=>n/total);reachByDice.set(count,result);return result;
 }
 function bot(projection,actor,commands,memory,context={}){
  const d=projection.data,depth=context.depth??2,reach=reachProbabilities(d.diceCount);
  const risk=(owner,progress,captured=[])=>{
   if(progress<0||progress>=52||B.isSafe(owner,progress))return 0;
   const cell=B.globalCell(owner,progress);let survives=1;
   for(let enemy=0;enemy<d.pawns.length;enemy++){
    if(enemy===owner||projection.preset==='teams'&&B.team(enemy)===B.team(owner))continue;
    // Opposing pawns share dice: use the strongest threat, not independent rolls.
    let danger=0;
    for(let pawn=0;pawn<4;pawn++){
     const from=d.pawns[enemy][pawn];if(from<0||from>=52||captured.some(c=>c.owner===enemy&&c.pawn===pawn))continue;
     const distance=(cell-B.globalCell(enemy,from)+52)%52;
     if(distance>0&&from+distance<52)danger=Math.max(danger,reach[distance]||0);
    }
    survives*=1-danger;
   }
   return 1-survives;
  };
  const score=command=>{
   const {from,to,captured}=B.destination(projection,command),after=risk(command.owner,to,captured);
   return [from<0&&d.dice[command.dieIndex]===6?1:0,captured.length,
    B.isSafe(command.owner,to)?1:0,depth>1?risk(command.owner,from)-after:0,depth>2?-after:0,
    to===57?1:0,from<0?1:0,-from,d.dice[command.dieIndex]];
  };
  const choices=commands.filter(c=>c.type==='move').map(command=>({command,score:score(command)}));
  choices.sort((a,b)=>{for(let i=0;i<a.score.length;i++)if(a.score[i]!==b.score[i])return b.score[i]-a.score[i];return 0;});
  return choices[0]?.command||commands[0];
 }
 function result(position){const own=position.data.pawns.map(row=>row.filter(n=>n===57).length),values=position.preset==='teams'?own.map((_,player)=>own[player%2]+own[player%2+2]):own;
  return {winners:position.winners,...Ending.result(position.data.ending),places:Ending.places(position.data.ending,values),
   metrics:position.preset==='teams'?[{id:'team-home',values,display:'ranking'},{id:'home',values:own}]:[{id:'home',values}]};
 }
 return Object.freeze({contractVersion:1,id:'ludo',minPlayers:2,maxPlayers:4,botMistakes:(p,actor,commands)=>{const exits=commands.filter(c=>c.type==='move'&&p.data.pawns[c.owner][c.pawn]<0&&p.data.dice[c.dieIndex]===6);return exits.length?exits:commands;},create,validate,actions,reduce,project,bot,result});
});
