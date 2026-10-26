(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;
})(globalThis,function(ports,Deck){
  'use strict';const Ending=ports.ending;
  const key=card=>card.joker?'joker':`${card.rank}-${['♥','♦'].includes(card.suit)?'red':'black'}`;
  const deck=size=>Deck.create(size,{exclude:['♣12']});
  const fact=(name,actor,params={})=>({type:'oldmaid.'+name,actor,params,visibility:{kind:'public'}});
  function discard(position,player,events){
    const d=position.data,groups={};for(const card of d.hands[player])(groups[key(card)]??=[]).push(card);
    for(const group of Object.values(groups))while(group.length>=2){
      const cards=group.splice(0,2),ids=new Set(cards.map(card=>card.id));
      d.hands[player]=d.hands[player].filter(card=>!ids.has(card.id));
      // Preserve canonical deck ordering of public pairs.
      d.discard.push(...deck(d.deckSize).filter(card=>ids.has(card.id)));
      if(events)events.push(fact('paired',player,{cards:d.discard.slice(-2)}));
    }
  }
  function nextPlayer(data,from){for(let step=1;step<=data.hands.length;step++){const player=(from+step)%data.hands.length;if(data.hands[player].length)return player;}return from;}
  function award(position,player){const d=position.data;if(!d.hands[player].length&&!d.outOrder.includes(player)){
    d.outOrder.push(player);d.points[player]+=position.playerCount-d.outOrder.length;
  }}
  function settle(position,events){
    const d=position.data;
    const ending=d.ending??=Object.assign(Ending.create(position.playerCount,d.firstPlayer,d.endMode),{groups:d.outOrder.map(player=>[player])});
    const newlyOut=d.hands.flatMap((hand,player)=>!hand.length&&!Ending.done(ending,player)?[player]:[]);
    Ending.record(ending,newlyOut,position,'cards');
    for(let player=0;player<position.playerCount;player++)award(position,player);
    const active=d.hands.flatMap((hand,player)=>hand.length?[player]:[]);
    if(active.length<=1||d.endMode==='winner'&&d.outOrder.length){position.status='finished';position.winners=d.endMode==='winner'?(ending.groups[0]||[]):[...d.outOrder];events.push(fact('finished',active[0]??null));return true;}
    return false;
  }
  function create({playerCount,firstPlayer,preset,rng,openHands,options={}}){
    const size=[36,52,54].includes(Number(options.deck))?Number(options.deck):36;
    const position={playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,openHands:!!openHands,revision:0,data:{}};
    const cards=ports.shuffle(deck(size),position),hands=Array.from({length:playerCount},()=>[]);
    cards.forEach((card,index)=>hands[index%playerCount].push(card));
    position.data={firstPlayer,endMode:options.endMode||'last',deckSize:size,drawFrom:options.drawFrom==='next'?'next':'any',hands,ending:Ending.create(playerCount,firstPlayer,options.endMode||'last'),discard:[],outOrder:[],points:Array(playerCount).fill(0)};
    for(let player=0;player<playerCount;player++)discard(position,player);
    if(!hands[firstPlayer].length)position.turn=nextPlayer(position.data,firstPlayer);
    const events=[];settle(position,events);return {position,events};
  }
  function validate(position){
    const d=position.data;if(![36,52,54].includes(d.deckSize)||!Array.isArray(d.hands)||d.hands.length!==position.playerCount||!d.hands.every(Array.isArray)||!Array.isArray(d.discard))return false;
    const valid=new Set(deck(d.deckSize).map(card=>card.id)),all=[...d.hands.flat(),...d.discard];
    return (d.ending===undefined||Ending.valid(d.ending,position.playerCount))&&Number.isSafeInteger(position.rng)&&position.rng>=0&&position.rng<=4294967295&&
      ['winner','last'].includes(d.endMode)&&['any','next'].includes(d.drawFrom)&&all.length===d.deckSize-1&&new Set(all.map(card=>card.id)).size===all.length&&all.every(card=>valid.has(card.id))&&
      d.hands.every(hand=>new Set(hand.map(key)).size===hand.length)&&Array.isArray(d.outOrder)&&new Set(d.outOrder).size===d.outOrder.length&&
      d.outOrder.every(player=>Number.isInteger(player)&&player>=0&&player<position.playerCount&&!d.hands[player].length)&&
      Array.isArray(d.points)&&d.points.length===position.playerCount&&d.points.every((value,player)=>value===(d.outOrder.includes(player)?position.playerCount-1-d.outOrder.indexOf(player):0));
  }
  function actions(position,actor){
    if(position.status!=='playing'||actor!==position.turn)return [];
    const d=position.data,targets=d.drawFrom==='next'?[nextPlayer(d,actor)]:d.hands.flatMap((hand,player)=>player!==actor&&hand.length?[player]:[]);
    return targets.filter(target=>target!==actor).flatMap(target=>d.hands[target].map((_,cardIndex)=>({command:{type:'draw',target,cardIndex},visibility:'public'})));
  }
  function reduce(position,actor,action){
    const next=JSON.parse(JSON.stringify(position)),d=next.data,events=[];
    const card=d.hands[action.target].splice(action.cardIndex,1)[0];
    d.hands[actor].splice(Math.floor(ports.random(next)*(d.hands[actor].length+1)),0,card);
    events.push(fact('drawn',actor,{target:action.target}));discard(next,actor,events);
    if(!settle(next,events))next.turn=nextPlayer(d,actor);
    next.revision=(position.revision||0)+1;return {position:next,events,roundEnded:next.turn!==actor&&((next.turn-d.firstPlayer+position.playerCount)%position.playerCount)<=((actor-d.firstPlayer+position.playerCount)%position.playerCount),turnEnded:true};
  }
  function project(position,viewer){const d=JSON.parse(JSON.stringify(position.data));d.hands=d.hands.map((hand,player)=>position.openHands||player===viewer?hand:hand.map(()=>({hidden:true})));return d;}
  const score=position=>position.data.points;
  const bot=(projection,actor,commands,memory,context={})=>{const d=projection.data,own=new Set(d.hands[actor].map(key)),random=context.random||(()=>0);let pool=commands;if((context.depth??2)>1){const pairs=commands.filter(c=>{const card=d.hands[c.target][c.cardIndex];return !card.hidden&&own.has(key(card));});if(pairs.length)pool=pairs;}return pool[Math.floor(random()*pool.length)];};
  function result(position){const values=position.data.points;return {winners:position.winners,
    ...(position.data.ending?Ending.result(position.data.ending):{}),places:position.data.ending?Ending.places({...position.data.ending,mode:'last'},values):values.map(value=>1+new Set(values.filter(other=>other>value)).size),metrics:[{id:'points',values}]};}
  return Object.freeze({contractVersion:1,rounds:true,id:'oldmaid',minPlayers:2,maxPlayers:6,create,validate,actions,reduce,project,score,bot,result});
});
