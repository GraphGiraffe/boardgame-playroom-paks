(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;})(globalThis,function(ports,dependencies){
 'use strict';const {Deck,Cards}=dependencies,{spec,beats,active,next,attackers,nextAttacker,validOpening}=Cards;
 const deck=size=>Deck.create(size),fact=(name,actor,params={})=>({type:'durak.'+name,actor,params,visibility:{kind:'public'}});
 function create({playerCount,firstPlayer,preset,rng,openHands,options:o={}}){const s={playerCount,turn:0,status:'playing',winners:[],rng,preset,openHands:!!openHands,data:{}};
const {size,mode,handSize,variant,endCondition}=spec(o),cards=ports.shuffle(deck(size),s),hands=Array.from({length:s.playerCount},()=>[]);if(cards[0].joker){const at=cards.findIndex(c=>!c.joker);[cards[0],cards[at]]=[cards[at],cards[0]];}const trump={...cards[0]};for(let n=0;n<handSize;n++)for(const hand of hands)if(cards.length)hand.push(cards.pop());let attacker=0,lowest=99;hands.forEach((h,p)=>h.forEach(c=>{if(!c.joker&&c.suit===trump.suit&&c.rank<lowest){lowest=c.rank;attacker=p;}}));attacker=o.resolvedFirstPlayer===null?attacker:firstPlayer;s.turn=attacker;s.data={deckSize:size,jokerMode:mode,variant,endCondition,composing:variant==='simple',boutOrigin:attacker,hands,drawPile:cards,trump,table:[],attacker,defender:(attacker+1)%hands.length,attackCursor:attacker,passes:0,discard:[],taking:false,handSize,attackLimit:Math.min(handSize,hands[(attacker+1)%hands.length].length)};
 return s;}
 function validate(s){const check=value=>{if(!value)throw Error('DURAK_POSITION_INVALID');};
  const inventory=(zones,predicate,size)=>{const all=zones.flat();check(all.length===size&&new Set(all.map(card=>card.id)).size===size&&all.every(predicate));};
  try{
const d=s.data,size=d.deckSize,handSize=d.variant==='simple'?5:6,valid=deck(size),same=c=>valid.some(x=>x.id===c?.id&&x.suit===c.suit&&x.rank===c.rank&&!!x.joker===!!c.joker&&x.color===c.color);check([36,52,54].includes(size)&&['color','universal'].includes(d.jokerMode)&&['simple','throwin','transfer'].includes(d.variant)&&['firstout','lastfool'].includes(d.endCondition)&&d.handSize===handSize);check(Array.isArray(d.hands)&&d.hands.length===s.playerCount&&Array.isArray(d.table)&&Array.isArray(d.drawPile)&&Array.isArray(d.discard));inventory([...d.hands,d.drawPile,d.discard,d.table.flatMap(p=>p.defense?[p.attack,p.defense]:[p.attack])],same,size);check(same(d.trump)&&(!d.drawPile.length||d.drawPile[0].id===d.trump.id));check(Number.isInteger(d.attacker)&&d.attacker>=0&&d.attacker<s.playerCount&&Number.isInteger(d.defender)&&d.defender>=0&&d.defender<s.playerCount&&d.attacker!==d.defender&&typeof d.taking==='boolean');check(Number.isInteger(d.attackCursor)&&attackers(d).includes(d.attackCursor)&&Number.isInteger(d.passes)&&d.passes>=0&&d.passes<Math.max(1,attackers(d).length));check(Number.isInteger(d.attackLimit)&&d.attackLimit>=0&&d.attackLimit<=handSize&&d.table.length<=d.attackLimit&&d.table.every(p=>p&&same(p.attack)&&(p.defense===null||same(p.defense)&&beats(p.defense,p.attack,d))));if(s.status==='playing')check(s.turn===(d.composing?d.attacker:d.taking||d.table.every(p=>p.defense)?d.attackCursor:d.defender));
 return Number.isSafeInteger(s.rng)&&s.rng>=0&&s.rng<=4294967295;}catch(_){return false;}}
 function actions(s,actor){if(s.status!=='playing'||actor!==s.turn)return [];
  const commands=(()=>{
const d=s.data,actions=[],ranks=new Set(d.table.map(p=>p.attack.rank));
   if(!d.table.length&&d.drawPile.length){const low=d.deckSize===36?6:2,c=d.hands[actor].find(c=>c.rank===low&&c.suit===d.trump.suit);if(c&&d.trump.rank!==low)actions.push({type:'exchange',card:c.id});}
   if(d.composing){if(d.table.length<d.attackLimit)for(const c of d.hands[actor])actions.push({type:'attack',card:c.id});if(validOpening(d.table))actions.push({type:'confirm'});if(d.table.length)actions.push({type:'undo'});return actions;}
   if(actor!==d.defender){const allRanks=new Set(d.table.flatMap(p=>p.defense?[p.attack.rank,p.defense.rank]:[p.attack.rank]));if(d.variant!=='simple'&&d.table.length<d.attackLimit)for(const c of d.hands[actor])if((!d.table.length&&actor===d.attacker)||d.table.length&&allRanks.has(c.rank))actions.push({type:'attack',card:c.id});if(d.table.length&&(d.taking||d.table.every(p=>p.defense)))actions.push({type:'done'});}
   else{d.table.forEach((p,target)=>{if(!p.defense)for(const c of d.hands[actor])if(beats(c,p.attack,d))actions.push({type:'defend',card:c.id,target});});
    const target=next(d,actor);if(d.variant==='transfer'&&target!==null&&ranks.size===1&&d.table.every(p=>!p.defense)&&d.table.length+1<=Math.min(6,d.hands[target].length))for(const c of d.hands[actor])if(ranks.has(c.rank))actions.push({type:'transfer',card:c.id});
    if(d.table.some(p=>!p.defense))actions.push({type:'take'});
   }return actions;
  
  })();return commands.map(command=>({command,visibility:['done','take','confirm','undo'].includes(command.type)?'public':'private'}));
 }
 function endBout(s,events){const d=s.data,oldA=d.boutOrigin,oldD=d.defender,wasTaking=d.taking;
  const taken=d.table.flatMap(pair=>wasTaking&&d.variant==='simple'&&pair.defense?[]:pair.defense?[pair.attack,pair.defense]:[pair.attack]);
  if(wasTaking){d.hands[oldD].push(...taken);if(d.variant==='simple')d.discard.push(...d.table.filter(pair=>pair.defense).flatMap(pair=>[pair.attack,pair.defense]));events.push(fact('taken',oldD,{count:taken.length}));}
  else{d.discard.push(...taken);events.push(fact('discarded',oldD));}
  const draw=player=>{let count=0;while(d.hands[player].length<d.handSize&&d.drawPile.length){d.hands[player].push(d.drawPile.pop());count++;}if(count)events.push(fact('drawn',player,{count}));};
  for(let offset=0;offset<d.hands.length;offset++){const player=(oldA+offset)%d.hands.length;if(player!==oldD)draw(player);}draw(oldD);
  d.table=[];d.taking=false;d.passes=0;d.composing=d.variant==='simple';
  if(!d.drawPile.length){const still=active(d),out=d.hands.flatMap((hand,player)=>hand.length?[]:[player]);
   if(!still.length){s.status='finished';s.winners=[];events.push(fact('all-out',null));return;}
   if(d.endCondition==='firstout'&&out.length){s.status='finished';s.winners=out;events.push(fact('first-out',null,{players:out}));return;}
   if(still.length===1){s.status='finished';s.winners=out;events.push(fact('last-fool',still[0]));return;}
  }
  d.attacker=wasTaking?next(d,oldD):oldD;if(!d.hands[d.attacker].length)d.attacker=next(d,d.attacker);
  d.boutOrigin=d.attacker;d.defender=next(d,d.attacker);d.attackCursor=d.attacker;d.attackLimit=Math.min(d.handSize,d.hands[d.defender].length);s.turn=d.attacker;
 }
 function perform(s,actor,a,events){const d=s.data;
  if(a.type==='exchange'){const index=d.hands[actor].findIndex(card=>card.id===a.card),card=d.hands[actor][index];d.hands[actor][index]=d.drawPile[0];d.drawPile[0]=card;d.trump={...card};events.push(fact('exchanged',actor));return;}
  if(a.type==='undo'){d.hands[actor].push(d.table.pop().attack);return;}
  if(a.type==='confirm'){d.composing=false;s.turn=d.defender;events.push(fact('confirmed',actor));return;}
  if(a.type==='done'){events.push(fact('passed',actor));d.passes++;if(d.passes>=attackers(d).length||d.table.length>=d.attackLimit){endBout(s,events);return;}d.attackCursor=nextAttacker(d,actor);s.turn=d.attackCursor;return;}
  if(a.type==='take'){d.taking=true;events.push(fact('taking',actor));if(d.variant==='simple'){endBout(s,events);return;}d.attackCursor=d.attacker;s.turn=d.attackCursor;return;}
  const card=d.hands[actor].splice(d.hands[actor].findIndex(card=>card.id===a.card),1)[0];
  if(a.type==='attack'||a.type==='transfer'){
   d.table.push({attack:card,defense:null});d.passes=0;events.push(fact(a.type==='transfer'?'transferred':'attacked',actor,{card}));
   if(d.composing)return;
   if(a.type==='transfer'){d.attacker=actor;d.defender=next(d,actor);d.attackLimit=Math.min(6,d.hands[d.defender].length);d.attackCursor=actor;s.turn=d.defender;}
   else{d.attackCursor=nextAttacker(d,actor);s.turn=d.taking?d.attackCursor:d.defender;}
  }else{d.table[a.target].defense=card;events.push(fact('defended',actor,{card,attack:d.table[a.target].attack}));s.turn=d.table.every(pair=>pair.defense)?d.attackCursor:d.defender;}
 }
 function reduce(position,actor,action){const next=JSON.parse(JSON.stringify(position)),events=[];perform(next,actor,action,events);return {position:next,events,turnEnded:events.some(event=>['durak.taken','durak.discarded'].includes(event.type))};}
 function project(position,viewer){const d=JSON.parse(JSON.stringify(position.data));d.hands=d.hands.map((hand,player)=>position.openHands||player===viewer?hand:hand.map(()=>({hidden:true})));d.drawPile=d.drawPile.map(()=>({hidden:true}));return d;}
 function bot(s,actor,actions){
const d=s.data;if(d.composing&&actions.some(a=>a.type==='confirm'))return actions.find(a=>a.type==='confirm');const exchange=actions.find(a=>a.type==='exchange');if(exchange)return exchange;const cards=actions.filter(a=>a.card);if(!cards.length)return actions[0];return cards.sort((a,b)=>{const ca=d.hands[actor].find(c=>c.id===a.card),cb=d.hands[actor].find(c=>c.id===b.card),cost=c=>(c.joker?40+(c.color==='red'?1:0):c.rank+(c.suit===d.trump.suit?20:0));return cost(ca)-cost(cb);})[0];
 }
 function result(position){const values=position.data.hands.map((_,player)=>position.winners.includes(player)?1:0);return {winners:position.winners,
  places:values.map(value=>1+new Set(values.filter(other=>other>value)).size),metrics:[{id:'wins',values},{id:'hand-count',values:position.data.hands.map(hand=>hand.length)}]};}
 return Object.freeze({contractVersion:1,id:'durak',minPlayers:2,maxPlayers:6,create,validate,actions,reduce,project,bot,result});
});
