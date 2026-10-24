(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;})(globalThis,function(ports){
 'use strict';const Ending=ports.ending;const pips=hand=>hand.reduce((sum,tile)=>sum+tile.a+tile.b,0);
 const fact=(name,actor,params={})=>({type:'domino.'+name,actor,params,visibility:{kind:'public'}});
 function create({playerCount,firstPlayer,preset,rng,openHands,options={}}){
  const position={playerCount,turn:0,status:'playing',winners:[],rng,preset,openHands:!!openHands,data:{}};
  let stock=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)stock.push({id:'d'+a+b,a,b});stock=ports.shuffle(stock,position);
  const hands=Array.from({length:playerCount},()=>[]),count=preset==='quick'?5:7;
  for(let index=0;index<count;index++)for(const hand of hands)hand.push(stock.pop());
  position.data={ending:Ending.create(playerCount,firstPlayer,options.endMode, ['winner','last']),hands,stock,chain:[],passes:0};let best=-1;
  hands.forEach((hand,player)=>hand.forEach(tile=>{const rank=tile.a===tile.b?100+tile.a:tile.a+tile.b;if(rank>best){best=rank;position.turn=player;}}));
  if(options.resolvedFirstPlayer!==null)position.turn=firstPlayer;position.data.ending.first=position.turn;
  return position;
 }
 function validate(position){const d=position.data;
  if(!Array.isArray(d.hands)||d.hands.length!==position.playerCount||!d.hands.every(Array.isArray)||!Array.isArray(d.stock)||!Array.isArray(d.chain))return false;
  const all=[...d.hands.flat(),...d.stock,...d.chain];return Ending.valid(d.ending,position.playerCount)&&Number.isSafeInteger(position.rng)&&position.rng>=0&&position.rng<=4294967295&&
   all.length===28&&new Set(all.map(tile=>tile?.id)).size===28&&all.every(tile=>tile&&Number.isInteger(tile.a)&&Number.isInteger(tile.b)&&tile.a>=0&&tile.a<=6&&tile.b>=0&&tile.b<=6&&tile.id==='d'+Math.min(tile.a,tile.b)+Math.max(tile.a,tile.b))&&
   Number.isInteger(d.passes)&&d.passes>=0&&d.passes<=position.playerCount&&d.chain.every((tile,index)=>index===0||d.chain[index-1].b===tile.a);
 }
 function actions(position,actor){if(position.status!=='playing'||actor!==position.turn)return [];
  const d=position.data,commands=[],left=d.chain[0]?.a,right=d.chain.at(-1)?.b;
  for(const tile of d.hands[actor]){
   if(!d.chain.length)commands.push({type:'play',card:tile.id,side:'right'});
   else{if(tile.a===left||tile.b===left)commands.push({type:'play',card:tile.id,side:'left'});if(tile.a===right||tile.b===right)commands.push({type:'play',card:tile.id,side:'right'});}
  }
  if(!commands.length)commands.push({type:d.stock.length?'draw':'pass'});
  return commands.map(command=>({command,visibility:'private'}));
 }
 function oriented(tile,side,chain){const out={...tile};if(chain.length){const join=side==='left'?chain[0].a:chain.at(-1).b;if((side==='left'?out.b:out.a)!==join)[out.a,out.b]=[out.b,out.a];}return out;}
 function reduce(position,actor,action){const next=JSON.parse(JSON.stringify(position)),d=next.data,events=[];
  if(action.type==='draw'){d.hands[actor].push(d.stock.pop());events.push(fact('drawn',actor));return {position:next,events,roundEnded:action.type!=='draw'&&((next.turn-d.ending.first+position.playerCount)%position.playerCount)<=((actor-d.ending.first+position.playerCount)%position.playerCount),turnEnded:action.type!=='draw'};}
  if(action.type==='pass'){d.passes++;events.push(fact('passed',actor));}
  else{d.passes=0;const tile=oriented(d.hands[actor].splice(d.hands[actor].findIndex(tile=>tile.id===action.card),1)[0],action.side,d.chain);
   if(!d.chain.length)d.openingTileId=tile.id;
   action.side==='left'?d.chain.unshift(tile):d.chain.push(tile);events.push(fact('played',actor,{id:tile.id,a:tile.a,b:tile.b,side:action.side}));}
  next.turn=Ending.next(d.ending,actor,{remaining:1})??actor;
  if(!d.hands[actor].length){Ending.record(d.ending,[actor],next,'domino');events.push(fact('cleared',actor));
   const turn=Ending.next(d.ending,actor,{remaining:1});if(turn===null){next.status='finished';next.winners=Ending.winners(d.ending);}else next.turn=turn;
  }
  else if(d.passes>=position.playerCount-d.ending.groups.flat().length){const sums=d.hands.map(pips),best=Math.min(...sums),winners=sums.flatMap((value,index)=>value===best?[index]:[]);
   next.status='finished';next.winners=d.ending.groups.length?Ending.winners(d.ending):winners.length===1?winners:[];events.push(fact('fish',next.winners[0]??null,{best}));}
  return {position:next,events,roundEnded:action.type!=='draw'&&((next.turn-d.ending.first+position.playerCount)%position.playerCount)<=((actor-d.ending.first+position.playerCount)%position.playerCount),turnEnded:action.type!=='draw'};
 }
 function project(position,viewer){const d=JSON.parse(JSON.stringify(position.data));d.points=score(position);d.hands=d.hands.map((hand,player)=>position.openHands||player===viewer?hand:hand.map(()=>({hidden:true})));d.stock=d.stock.map(()=>({hidden:true}));return d;}
 function bot(projection,actor,commands){return commands.slice().sort((a,b)=>{const left=projection.data.hands[actor].find(tile=>tile.id===a.card),right=projection.data.hands[actor].find(tile=>tile.id===b.card);return (right?right.a+right.b:0)-(left?left.a+left.b:0);})[0];}
 function score(position){const sums=position.data.hands.map(pips),winner=position.winners[0];return sums.map((_,player)=>position.status==='finished'&&player===winner?sums.reduce((a,b)=>a+b,0)-sums[player]:0);}
 function result(position){const values=position.data.hands.map(pips);return {winners:position.winners,...Ending.result(position.data.ending),
  places:Ending.places(position.data.ending,values,false),metrics:[{id:'pips',values,order:'asc'}]};}
 return Object.freeze({contractVersion:1,rounds:true,id:'domino',minPlayers:2,maxPlayers:4,create,validate,actions,reduce,project,bot,score,result,oriented,pips});
});
