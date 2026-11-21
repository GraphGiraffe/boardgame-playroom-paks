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
   d.ending={...d.ending,starts:d.ending.starts.slice()};
   const turn=Ending.advance(d.ending,actor,{revision:(position.revision??0)+1});if(turn===null){position.status='finished';position.winners=Ending.winners(d.ending);if(!position.winners.length){const counts=d.pawns.map(row=>row.filter(n=>n===57).length),totals=position.preset==='teams'?counts.map((n,p)=>n+counts[(p+2)%4]):counts;position.winners=totals.flatMap((n,p)=>n===Math.max(...totals)?[p]:[]);}}else position.turn=turn;
   d.rollIndices=Array.from({length:d.diceCount},(_,index)=>index);
  }
 }
 function reduce(position,actor,action){
  // The runtime owns an immutable position. Detach only the rule data that
  // this transition can write, keeping its timeline and other facts shared.
  const old=position.data,d={...old,used:old.used.slice()};
  const next={...position,data:d},events=[];
  if(action.type==='roll'){
   d.dice=old.dice.slice();d.used.fill(true);
   // Batch indices are replaced on turn advance. The roll event and the
   // exit rule use the same results in that batch's original order.
   d.lastRolled=old.rollIndices;
   const dice=[];
   let rolledSix=false;
   for(const index of old.rollIndices){
    const value=ports.rollDie(6,next);
    d.dice[index]=value;d.used[index]=false;
    dice.push(value);rolledSix||=value===6;
   }
   d.die=dice[0];d.lastRoll=d.die;d.phase='move';d.last=null;
   const failed=!rolledSix&&B.stranded(next,actor)?Math.min(3,old.failed[actor]+1):0;
   if(failed!==old.failed[actor]){d.failed=old.failed.slice();d.failed[actor]=failed;}
   d.guarantee=d.guaranteedExit&&failed===3;
   events.push(fact('rolled',actor,{dice}));
   if(!B.hasMove(next,actor)){events.push(fact('skipped',actor));completeBatch(next,actor);}
  }else{
   const die=d.dice[action.dieIndex],{from,to,captured}=B.destination(next,action),guaranteed=from<0&&die!==6&&d.guarantee;
   d.pawns=old.pawns.slice();
   d.pawns[action.owner]=old.pawns[action.owner].slice();
   d.used[action.dieIndex]=true;d.pawns[action.owner][action.pawn]=to;d.last={owner:action.owner,pawn:action.pawn,from,to,die,captured};
   if(from<0){d.guarantee=false;if(old.failed[actor]){d.failed=old.failed.slice();d.failed[actor]=0;}}
   for(const capture of captured){
    if(d.pawns[capture.owner]===old.pawns[capture.owner])d.pawns[capture.owner]=old.pawns[capture.owner].slice();
    d.pawns[capture.owner][capture.pawn]=-1;events.push(fact('captured',actor,{owner:action.owner,target:capture.owner}));
   }
   events.push(fact('moved',actor,{owner:action.owner,pawn:action.pawn,from,to}));
   const members=next.preset==='teams'?[B.team(action.owner),B.team(action.owner)+2]:[action.owner];
   // Only a pawn arriving home can add a finish group. Round advancement
   // detaches the round-start list separately when it can write to it.
   const ending=old.ending;
   const won=to===57&&members.every(player=>B.home(d.pawns[player]))&&!members.some(player=>Ending.done(ending,player));
   if(won){
    d.ending={...ending,groups:ending.groups.slice(),exits:ending.exits?.slice()};
    Ending.record(d.ending,members,next,'finished');
    events.push(fact('won',actor,{members}));d.used.fill(true);completeBatch(next,actor);
   }else{if(guaranteed)d.used.fill(true);if(guaranteed||!B.hasMove(next,actor))completeBatch(next,actor);}
  }
  return {position:next,events,turnEnded:next.turn!==actor||next.status==='finished'};
 }
 // Ludo's data is public. The model projection detaches it at the guest boundary.
 const project=position=>position.data;
 // For N six-sided dice and each distance d, count the ordered outcomes
 // with at least one subset summing to d. Fresh bot guests reuse these counts.
 const reachCounts=[
  null,
  [6,1,1,1,1,1,1],
  [36,11,12,13,14,15,16,6,5,4,3,2,1],
  [216,91,104,116,131,145,162,105,97,85,73,57,41,21,15,10,6,3,1]
 ];
 function bot(projection,actor,commands,memory,context={}){
  if(commands.length===1||commands[0]?.type!=='move')return commands[0];
  const d=projection.data,depth=context.depth??2,reach=depth>1?reachCounts[d.diceCount]:null;
  const owner=commands[0].owner,row=d.pawns[owner];
  // All six exits score equally, ahead of any move on the track.
  const exit=commands.find(command=>command.type==='move'&&row[command.pawn]<0&&d.dice[command.dieIndex]===6);
  if(exit)return exit;

  const captureCount=B.captureCounter(projection,owner),candidates=[],scoredDice=[];
  let mostCaptures=-1,safest=false;
  // Keep only moves tied on captures and safety before evaluating threats.
  for(const command of commands){
   if(command.type!=='move')continue;
   const from=row[command.pawn],die=d.dice[command.dieIndex],step=1<<die;
   // Equal rolls and stacked pawns can give the same score. Keep the first
   // exact command in the rules' order without scoring its equivalents.
   if(scoredDice[from+1]&step)continue;
   scoredDice[from+1]|=step;
   const to=B.destinationProgress(projection,command);
   const safe=B.isSafe(owner,to),captures=safe?0:captureCount(to);
   if(captures<mostCaptures||captures===mostCaptures&&safest&&!safe)continue;
   if(captures>mostCaptures||safe&&!safest){
    candidates.length=0;mostCaptures=captures;safest=safe;
   }
   candidates.push({command,from,to,die});
  }
  if(candidates.length===1)return candidates[0].command;
  const risks=[];
  let opponents;
  const risk=progress=>{
   if(progress<0||progress>=52||B.isSafe(owner,progress))return 0;
   if(risks[progress]!==undefined)return risks[progress];
   if(!opponents){
    // A bot decision reuses the same position at every candidate square.
    // Leave out the base and home lanes and resolve track coordinates once.
    opponents=Array.from({length:d.pawns.length},()=>[]);
    B.visitOpponents(projection,owner,(cell,enemy,_pawn,from)=>opponents[enemy].push({cell,remaining:52-from}));
   }
   const cell=B.globalCell(owner,progress);let survives=1;
   for(const pawns of opponents){
    // Opposing pawns share dice: use the strongest threat, not independent rolls.
    let danger=0;
    for(const pawn of pawns){
     // Captured pawns already occupy the destination and have distance zero.
     const distance=(cell-pawn.cell+52)%52;
     if(distance>0&&distance<pawn.remaining)danger=Math.max(danger,reach[distance]||0);
    }
    survives*=1-danger/reach[0];
   }
   return risks[progress]=1-survives;
  };
  const score=({from,to,die})=>{
   const after=reach?risk(to):0;
   return [reach?risk(from)-after:0,depth>2?-after:0,to===57?1:0,from<0?1:0,-from,die];
  };
  let best=commands[0],bestScore;
  for(const candidate of candidates){
   const value=score(candidate),difference=bestScore?value.findIndex((part,index)=>part!==bestScore[index]):-1;
   if(!bestScore||difference>=0&&value[difference]>bestScore[difference]){best=candidate.command;bestScore=value;}
  }
  return best;
 }
 function result(position){
  const own=position.data.pawns.map(row=>row.filter(n=>n===57).length),values=position.preset==='teams'?own.map((_,player)=>own[player%2]+own[player%2+2]):own;
  const ending=Ending.result(position.data.ending),places=Ending.places(position.data.ending,values),exit=player=>ending.exits?.find(item=>item.player===player);
  const playerOrder=own.map((_,i)=>i).sort((a,b)=>places[a]-places[b]||(exit(a)&&exit(b)?(exit(a).round||exit(a).turn)-(exit(b).round||exit(b).turn):exit(a)?-1:exit(b)?1:0)||own[b]-own[a]||a-b);
  return {winners:position.winners,...ending,places,playerOrder,metrics:position.preset==='teams'?[{id:'team-home',values,display:'ranking'},{id:'home',values:own}]:[{id:'home',values}]};
 }
 function localChoices(p){if(p.actor<0||p.status!=='playing')return [];return actions(p,p.actor);}
 return Object.freeze({contractVersion:1,id:'ludo',turnOrder:p=>({next:Ending.next(p.data.ending,p.turn)}),minPlayers:2,maxPlayers:4,botMistakes:(p,actor,commands)=>{const exits=commands.filter(c=>c.type==='move'&&p.data.pawns[c.owner][c.pawn]<0&&p.data.dice[c.dieIndex]===6);return exits.length?exits:commands;},create,validate,actions,localChoices,reduce,project,bot,result});
});
