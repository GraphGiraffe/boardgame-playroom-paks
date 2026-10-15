(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;})(globalThis,function(ports,B){
 'use strict';
 const fact=(name,actor,params={})=>({type:'ludo.'+name,actor,params,visibility:{kind:'public'}});
 function create({playerCount,firstPlayer,preset,rng,options={}}){
  if(!['classic','teams'].includes(preset)||preset==='teams'&&playerCount!==4)throw Error('LUDO_ROSTER_INVALID');
  const diceCount=[1,2,3].includes(Number(options.diceCount))?Number(options.diceCount):1;
  return {playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,data:{
   pawns:Array.from({length:playerCount},()=>[options.startPawn==='on'?0:-1,-1,-1,-1]),diceCount,
   sixReroll:options.sixReroll!=='off',guaranteedExit:options.guaranteedExit!=='off',failed:Array(playerCount).fill(0),guarantee:false,
   dice:Array(diceCount).fill(1),used:Array(diceCount).fill(true),rollIndices:Array.from({length:diceCount},(_,index)=>index),phase:'roll',die:null,lastRoll:null,last:null}};
 }
 function validate(position){const d=position.data;
  return Number.isSafeInteger(position.rng)&&position.rng>=0&&position.rng<=4294967295&&
   (position.preset!=='teams'||position.playerCount===4)&&Array.isArray(d.pawns)&&d.pawns.length===position.playerCount&&
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
  if(!repeat.length){position.turn=(actor+1)%position.playerCount;d.rollIndices=Array.from({length:d.diceCount},(_,index)=>index);}
 }
 function reduce(position,actor,action){const next=JSON.parse(JSON.stringify(position)),d=next.data,events=[];
  if(action.type==='roll'){
   d.lastRolled=d.rollIndices.slice();d.used.fill(true);for(const index of d.rollIndices){d.dice[index]=ports.rollDie(6,next);d.used[index]=false;}
   d.die=d.dice[d.rollIndices[0]];d.lastRoll=d.die;d.phase='move';d.last=null;
   if(B.stranded(next,actor)&&!d.rollIndices.some(index=>d.dice[index]===6)){d.failed[actor]=Math.min(3,d.failed[actor]+1);d.guarantee=d.guaranteedExit&&d.failed[actor]>=3;}
   else{d.failed[actor]=0;d.guarantee=false;}
   events.push(fact('rolled',actor,{dice:d.rollIndices.map(index=>d.dice[index])}));
   if(!B.moves(next,actor).length)completeBatch(next,actor);
  }else{
   const die=d.dice[action.dieIndex],{from,to,captured}=B.destination(next,action),guaranteed=from<0&&die!==6&&d.guarantee;
   d.used[action.dieIndex]=true;d.pawns[action.owner][action.pawn]=to;d.last={owner:action.owner,pawn:action.pawn,from,to,die,captured};
   if(from<0){d.guarantee=false;d.failed[actor]=0;}
   for(const capture of captured){d.pawns[capture.owner][capture.pawn]=-1;events.push(fact('captured',actor,{owner:action.owner,target:capture.owner}));}
   events.push(fact('moved',actor,{owner:action.owner,pawn:action.pawn,from,to}));
   const members=next.preset==='teams'?[B.team(action.owner),B.team(action.owner)+2]:[action.owner];
   if(members.every(player=>B.home(d.pawns[player]))){next.status='finished';next.winners=members;events.push(fact('won',actor,{members}));}
   else{if(guaranteed)d.used.fill(true);if(guaranteed||!B.moves(next,actor).length)completeBatch(next,actor);}
  }
  return {position:next,events};
 }
 const project=position=>JSON.parse(JSON.stringify(position.data));
 function bot(projection,actor,commands){return commands.filter(command=>command.type==='move').sort((a,b)=>{
  const score=command=>projection.data.pawns[command.owner][command.pawn]<0?70:projection.data.pawns[command.owner][command.pawn]+projection.data.dice[command.dieIndex];return score(b)-score(a);
 })[0]||commands[0];}
 function result(position){const own=position.data.pawns.map(row=>row.filter(n=>n===57).length),values=position.preset==='teams'?own.map((_,player)=>own[player%2]+own[player%2+2]):own;
  return {winners:position.winners,places:values.map(value=>1+new Set(values.filter(other=>other>value)).size),
   metrics:position.preset==='teams'?[{id:'team-home',values},{id:'home',values:own}]:[{id:'home',values}]};
 }
 return Object.freeze({contractVersion:1,id:'ludo',minPlayers:2,maxPlayers:4,create,validate,actions,reduce,project,bot,result});
});
