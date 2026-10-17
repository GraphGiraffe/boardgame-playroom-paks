// Pure memory game. Bot knowledge contains only publicly revealed card IDs.
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory;
  root.PlayroomPackDefinitionFactory=factory;
})(globalThis,function(ports,Deck){
  'use strict';
  const characters=['crescent','triangle','square','circle','star','rectangle','diamond','hexagon'];
  const colors=['red','orange','yellow','green','blue','purple'];
  const cartoonCards=()=>characters.flatMap(shape=>colors.flatMap(color=>['a','b'].map(copy=>({id:shape+'-'+color+'-'+copy,character:shape+'-'+color,shape,color}))));
  const cardsFor=size=>size===96?cartoonCards():Deck.create(size);
  const pair=card=>card?.character|| (card.joker?'joker':`${card.rank}-${['♥','♦'].includes(card.suit)?'red':'black'}`);
  const clone=value=>JSON.parse(JSON.stringify(value));
  const fact=(name,actor,params={})=>({type:'pexeso.'+name,actor,params,visibility:{kind:'public'}});
  function create({playerCount,firstPlayer,preset,rng,options={}}){
    const size=options.deck==null||options.deck==='cartoon'?96:[36,52,54].includes(Number(options.deck))?Number(options.deck):52;
    const position={playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,data:{}};
    const groups={};for(const card of cardsFor(size))(groups[pair(card)]??=[]).push(card);
    // Stable catalog order selects the same pairs for a board size; only positions shuffle.
    const keys=Object.keys(groups);
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
    return d.board.flatMap((_,index)=>!d.matched.includes(index)&&(d.phase==='reveal'||!d.flipped.includes(index))?
      [{command:{type:'flip',index},visibility:'public'}]:[]);
  }
  function reduce(position,actor,action){
    const next=clone(position),d=next.data,events=[];
    if(d.phase==='reveal'){d.flipped=[];d.phase='first';}
    d.flipped.push(action.index);d.seen[action.index]=d.board[action.index].id;
    events.push(fact('flipped',actor,{index:action.index}));
    if(d.flipped.length===1)d.phase='second';
    else{
      const [i,j]=d.flipped;
      if(pair(d.board[i])===pair(d.board[j])){
        d.matched.push(i,j);d.scores[actor]++;d.flipped=[];d.phase='first';events.push(fact('matched',actor));
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
    const d=clone(position.data);
    d.board=d.board.map((card,index)=>d.matched.includes(index)||d.flipped.includes(index)?card:{hidden:true});
    delete d.seen;return d;
  }
  function observe(position){return {seen:{...position.data.seen}};}
  function bot(projection,actor,commands,memory){
    const d=projection.data,cards=new Map(cardsFor(d.deckSize).map(card=>[card.id,card]));
    const knownCard=index=>cards.get(memory.seen[index]);
    const known=commands.filter(action=>knownCard(action.index)),unseen=commands.filter(action=>!knownCard(action.index));
    const explore=pool=>{const options=pool?.length?pool:unseen.length?unseen:commands;return options[((projection.revision||0)+actor)%options.length];};
    const mistake=((projection.revision||0)+actor)%5===3;
    if(d.phase==='second'){
      const wanted=pair(knownCard(d.flipped[0])),match=known.find(action=>pair(knownCard(action.index))===wanted);
      const alternatives=commands.filter(action=>!knownCard(action.index)||pair(knownCard(action.index))!==wanted);
      return match&&(!mistake||!alternatives.length)?match:explore(alternatives);
    }
    for(const action of known)if(!mistake&&known.some(other=>other.index!==action.index&&pair(knownCard(action.index))===pair(knownCard(other.index))))return action;
    return explore();
  }
  function result(position){const values=position.data.scores;return {winners:position.winners,
    places:values.map(value=>1+new Set(values.filter(other=>other>value)).size),metrics:[{id:'pairs',values}]};}
  return Object.freeze({contractVersion:1,id:'pexeso',minPlayers:2,maxPlayers:4,create,validate,actions,reduce,project,observe,bot,result});
});
