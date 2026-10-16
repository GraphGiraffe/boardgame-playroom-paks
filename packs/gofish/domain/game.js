(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;})(globalThis,function(ports,Deck){
  'use strict';
  const fact=(name,actor,params={})=>({type:'gofish.'+name,actor,params,visibility:{kind:'public'}});
  function book(position,player,events){
    const d=position.data,hand=d.hands[player];
    for(const rank of new Set(hand.map(card=>card.rank))){
      const cards=hand.filter(card=>card.rank===rank),need=rank===15?2:4;
      if(cards.length===need){d.hands[player]=d.hands[player].filter(card=>card.rank!==rank);d.books[player].push(rank);events.push(fact('booked',player,{rank,count:need}));}
    }
  }
  function finish(position,events){
    const d=position.data;
    if(d.books.flat().length===Math.ceil(d.deckSize/4)||!d.drawPile.length&&d.hands.every(hand=>!hand.length)){
      const scores=d.books.map(row=>row.length),top=Math.max(...scores),winners=scores.flatMap((value,index)=>value===top?[index]:[]);
      position.status='finished';position.winners=winners.length===position.playerCount?[]:winners;events.push(fact('finished',null));return true;
    }
    return false;
  }
  function advance(position,from,events){
    const d=position.data;if(finish(position,events))return;
    for(let step=1;step<=position.playerCount;step++){
      const player=(from+step)%position.playerCount;
      if(!d.hands[player].length&&d.drawPile.length){d.hands[player].push(d.drawPile.pop());events.push(fact('drawn',player));book(position,player,events);}
      if(d.hands[player].length){position.turn=player;return;}
    }
    finish(position,events);
  }
  function create({playerCount,firstPlayer,preset,rng,openHands,options={}}){
    const size=[36,52,54].includes(Number(options.deck))?Number(options.deck):52;
    const position={playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,openHands:!!openHands,data:{}};
    const cards=ports.shuffle(Deck.create(size),position),hands=Array.from({length:playerCount},()=>[]),count=playerCount===2?7:5;
    for(let index=0;index<count;index++)for(const hand of hands)if(cards.length)hand.push(cards.pop());
    position.data={firstPlayer,deckSize:size,hands,drawPile:cards,books:Array.from({length:playerCount},()=>[]),attempts:Array(playerCount).fill(0)};
    const events=[];for(let player=0;player<playerCount;player++)book(position,player,events);
    if(!hands[firstPlayer].length)advance(position,firstPlayer,events);
    return {position,events};
  }
  function validate(position){
    const d=position.data,n=position.playerCount;
    if(![36,52,54].includes(d.deckSize)||!Array.isArray(d.hands)||d.hands.length!==n||!d.hands.every(Array.isArray)||!Array.isArray(d.books)||d.books.length!==n||!d.books.every(Array.isArray)||!Array.isArray(d.drawPile))return false;
    const deck=Deck.create(d.deckSize),known=new Set(deck.map(card=>card.id)),all=[...d.hands.flat(),...d.drawPile,...d.books.flat().flatMap(rank=>deck.filter(card=>card.rank===rank))];
    return Number.isSafeInteger(position.rng)&&position.rng>=0&&position.rng<=4294967295&&
      all.length===d.deckSize&&new Set(all.map(card=>card.id)).size===all.length&&all.every(card=>known.has(card.id))&&
      d.books.every(row=>row.every(rank=>Number.isInteger(rank)&&rank>=(d.deckSize===36?6:2)&&rank<=(d.deckSize===54?15:14)))&&
      new Set(d.books.flat()).size===d.books.flat().length&&Array.isArray(d.attempts)&&d.attempts.length===n&&d.attempts.every(value=>Number.isInteger(value)&&value>=0);
  }
  function actions(position,actor){
    if(position.status!=='playing'||actor!==position.turn)return [];
    const d=position.data,ranks=[...new Set(d.hands[actor].map(card=>card.rank))],targets=d.hands.flatMap((hand,player)=>player!==actor&&hand.length?[player]:[]);
    const commands=!ranks.length||!targets.length?(d.drawPile.length?[{type:'draw'}]:[]):ranks.flatMap(rank=>targets.map(target=>({type:'ask',rank,target})));
    // Even the set of available ranks reveals the actor's private hand.
    return commands.map(command=>({command,visibility:'private'}));
  }
  function reduce(position,actor,action){
    const next=JSON.parse(JSON.stringify(position)),d=next.data,events=[];
    if(action.type==='draw'){
      d.hands[actor].push(d.drawPile.pop());events.push(fact('drawn',actor));book(next,actor,events);advance(next,actor,events);
      return {position:next,events,roundEnded:next.turn!==actor&&((next.turn-d.firstPlayer+position.playerCount)%position.playerCount)<=((actor-d.firstPlayer+position.playerCount)%position.playerCount),turnEnded:next.turn!==actor||next.status==='finished'};
    }
    d.attempts[actor]++;
    const given=d.hands[action.target].filter(card=>card.rank===action.rank);
    events.push(fact('asked',actor,{target:action.target,rank:action.rank}));
    if(given.length){
      d.hands[action.target]=d.hands[action.target].filter(card=>card.rank!==action.rank);d.hands[actor].push(...given);
      events.push(fact('given',action.target,{target:actor,count:given.length}));book(next,actor,events);
      if(!finish(next,events)&&!d.hands[actor].length)advance(next,actor,events);
    }else{
      events.push(fact('absent',action.target,{target:actor,rank:action.rank}));
      if(d.drawPile.length){
        const card=d.drawPile.pop();d.hands[actor].push(card);events.push(fact('drawn',actor));book(next,actor,events);
        if(card.rank===action.rank&&d.hands[actor].length){events.push(fact('repeat',actor));finish(next,events);return {position:next,events,roundEnded:next.turn!==actor&&((next.turn-d.firstPlayer+position.playerCount)%position.playerCount)<=((actor-d.firstPlayer+position.playerCount)%position.playerCount),turnEnded:next.turn!==actor||next.status==='finished'};}
      }
      advance(next,actor,events);
    }
    return {position:next,events,roundEnded:next.turn!==actor&&((next.turn-d.firstPlayer+position.playerCount)%position.playerCount)<=((actor-d.firstPlayer+position.playerCount)%position.playerCount),turnEnded:next.turn!==actor||next.status==='finished'};
  }
  function project(position,viewer){const d=JSON.parse(JSON.stringify(position.data));
    d.hands=d.hands.map((hand,player)=>position.openHands||player===viewer?hand:hand.map(()=>({hidden:true})));
    d.drawPile=d.drawPile.map(()=>({hidden:true}));return d;
  }
  const bot=(projection,actor,commands)=>commands[projection.data.attempts[actor]%commands.length];
  function result(position){const values=position.data.books.map(row=>row.length);return {winners:position.winners,
    places:values.map(value=>1+new Set(values.filter(other=>other>value)).size),metrics:[{id:'books',values}]};}
  return Object.freeze({contractVersion:1,rounds:true,id:'gofish',minPlayers:2,maxPlayers:6,create,validate,actions,reduce,project,bot,result});
});
