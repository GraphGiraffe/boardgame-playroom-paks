// Pure memory game. Bot knowledge contains only publicly revealed card IDs.
(function(root,factory){
  const visibility=root.PlayroomPackDomain?.tileVisibility||(typeof require==='function'?require('../../../shared/domain/tile-visibility.js'):null);
  const create=(ports,deck)=>factory(ports,deck,visibility);
  if(typeof module==='object'&&module.exports)module.exports=create;
  root.PlayroomPackDefinitionFactory=create;
})(globalThis,function(ports,Deck,visibility){
  'use strict';
  const characters=['crescent','triangle','square','circle','star','rectangle','diamond','hexagon'];
  const colors=['red','orange','yellow','green','blue','purple'];
  const cartoonCards=()=>characters.flatMap(shape=>colors.flatMap(color=>['a','b'].map(copy=>({id:shape+'-'+color+'-'+copy,character:shape+'-'+color,shape,color}))));
  const cardsFor=size=>size===96?cartoonCards():Deck.create(size);
  function cartoonPairs(position){
    const shapes=ports.shuffle([...characters],position),palette=ports.shuffle([...colors],position);
    // Visit every shape before repeating one; each round gives it a new color.
    return palette.flatMap((_,round)=>shapes.map((shape,index)=>shape+'-'+palette[(index+round)%palette.length]));
  }
  const pair=card=>card?.character|| (card.joker?'joker':`${card.rank}-${['♥','♦'].includes(card.suit)?'red':'black'}`);
  const fact=(name,actor,params={})=>({type:'pexeso.'+name,actor,params,visibility:{kind:'public'}});
  function create({playerCount,firstPlayer,preset,rng,options={}}){
    const size=options.deck==null||options.deck==='cartoon'?96:[36,52,54].includes(Number(options.deck))?Number(options.deck):52;
    const position={playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,data:{}};
    const groups={};for(const card of cardsFor(size))(groups[pair(card)]??=[]).push(card);
    // Standard decks keep their accepted subset; cartoon pairs vary with the seed.
    const keys=size===96?cartoonPairs(position):Object.keys(groups);
    const count={easy:8,medium:12,hard:18,full:keys.length}[preset];
    if(!count)throw Error('PEXESO_PRESET_INVALID');
    position.data={deckSize:size,board:ports.shuffle(keys.slice(0,Math.min(count,keys.length)).flatMap(key=>groups[key]),position),
      matched:[],flipped:[],phase:'first',scores:Array(playerCount).fill(0),seen:{}};
    return position;
  }
  function validate({data:d,playerCount,rng}){
    if(!Number.isSafeInteger(rng)||rng<0||rng>4294967295||![36,52,54,96].includes(d.deckSize)||
      !Array.isArray(d.board)||d.board.length%2||d.board.length<16||d.board.length>d.deckSize)return false;
    const cards=new Map(cardsFor(d.deckSize).map(card=>[card.id,card]));
    if(new Set(d.board.map(card=>card.id)).size!==d.board.length||!d.board.every(card=>cards.has(card.id)&&JSON.stringify(cards.get(card.id))===JSON.stringify(card)))return false;
    const groups=new Map();for(const card of d.board)groups.set(pair(card),(groups.get(pair(card))||0)+1);if([...groups.values()].some(count=>count!==2))return false;
    const indices=list=>Array.isArray(list)&&new Set(list).size===list.length&&list.every(index=>Number.isInteger(index)&&index>=0&&index<d.board.length);
    return indices(d.matched)&&indices(d.flipped)&&d.flipped.every(index=>!d.matched.includes(index))&&
      ['first','second','reveal'].includes(d.phase)&&d.flipped.length==={first:0,second:1,reveal:2}[d.phase]&&
      Array.isArray(d.scores)&&d.scores.length===playerCount&&d.scores.every(value=>Number.isInteger(value)&&value>=0)&&
      d.scores.reduce((a,b)=>a+b,0)*2===d.matched.length&&d.seen&&typeof d.seen==='object'&&
      Object.entries(d.seen).every(([index,id])=>d.board[index]?.id===id);
  }
  function actions(position,actor){
    if(position.status!=='playing'||actor!==position.turn)return [];
    const d=position.data;
    const unavailable=new Set(d.matched);
    if(d.phase!=='reveal')for(const index of d.flipped)unavailable.add(index);
    return d.board.flatMap((_,index)=>!unavailable.has(index)?
      [{command:{type:'flip',index},visibility:'public'}]:[]);
  }
  function reduce(position,actor,action){
    const previous=position.data;
    // Cards keep their identity and order while a flip updates the two slots
    // and the public memory. Copy scoring only when the pair actually matches.
    const d={...previous,flipped:previous.phase==='reveal'?[]:previous.flipped.slice(),seen:{...previous.seen}};
    const next={...position,data:d},events=[];
    d.flipped.push(action.index);d.seen[action.index]=d.board[action.index].id;
    events.push(fact('flipped',actor,{index:action.index}));
    if(d.flipped.length===1)d.phase='second';
    else{
      const [i,j]=d.flipped;
      if(pair(d.board[i])===pair(d.board[j])){
        d.matched=[...d.matched,i,j];d.scores=d.scores.slice();d.scores[actor]++;d.flipped=[];d.phase='first';events.push(fact('matched',actor));
        if(d.matched.length===d.board.length){
          const high=Math.max(...d.scores),winners=d.scores.flatMap((value,index)=>value===high?[index]:[]);
          next.status='finished';next.winners=winners.length===position.playerCount?[]:winners;
          events.push(fact('finished',null));
        }
      }else{
        d.phase='reveal';next.turn=(actor+1)%position.playerCount;
        events[0].params.closeAfter=600;events.push(fact('mismatch',actor));
      }
    }
    return {position:next,events,turnEnded:action.type==='flip'&&position.data.phase==='second'};
  }
  function project(position){
    const {seen,board,...visible}=position.data;
    return {...visible,board:visibility.revealIndices(board,visible.matched,visible.flipped)};
  }
  function observe(position){return {seen:{...position.data.seen}};}
  function bot(projection,actor,commands,memory,context={}){
    const d=projection.data,cards=new Map(cardsFor(d.deckSize).map(card=>[card.id,card]));
    const random=context.random||(()=>.5),rate=context.errorRate??18,level=context.difficulty||'medium';
    const knownCard=index=>cards.get(memory.seen[index]);
    const known=commands.filter(action=>knownCard(action.index)),unseen=commands.filter(action=>!knownCard(action.index));
    const pick=pool=>pool[Math.floor(random()*pool.length)];
    const explore=pool=>pick(pool?.length?pool:level==='easy'?commands:unseen.length?unseen:commands);
    const mistake=random()*100<rate;
    if(d.phase==='second'){
      const wanted=pair(knownCard(d.flipped[0])),match=known.find(action=>pair(knownCard(action.index))===wanted);
      const alternatives=commands.filter(action=>!knownCard(action.index)||pair(knownCard(action.index))!==wanted);
      return match&&(!mistake||!alternatives.length)?match:explore(alternatives);
    }
    const pairs=known.filter(action=>known.some(other=>other.index!==action.index&&pair(knownCard(action.index))===pair(knownCard(other.index))));
    if(pairs.length&&!mistake)return pick(pairs);
    return explore();
  }
  function result(position){const values=position.data.scores;return {winners:position.winners,
    places:values.map(value=>1+new Set(values.filter(other=>other>value)).size),metrics:[{id:'pairs',values}]};}
  function localChoices(p){if(p.actor<0||p.status!=='playing')return [];return actions(p,p.actor);}
 return Object.freeze({contractVersion:1,id:'pexeso',minPlayers:2,maxPlayers:4,botHandlesDifficulty:true,create,validate,actions,localChoices,reduce,project,observe,bot,result});
});
