(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory;
 root.PlayroomPackDefinitionFactory=factory;
})(globalThis,function(ports){
 'use strict';
 const colors=['red','yellow','green','blue']; // fire/spades, earth/diamonds, air/hearts, water/clubs
 const reactionTypes=['declare-mau','accuse-mau'];
 const fact=(name,actor,params={})=>({type:'mau.'+name,actor,params,visibility:{kind:'public'}});
 const cardPoints=c=>({J:2,Q:3,K:4,A:11}[c.value]??Number(c.value));
 function weight(card,settings){
  if(card.value==='6'&&settings.six==='penalty')return 1;
  if(card.value==='7')return 2;
  if(card.value==='K')return card.color==='red'?5:4;
  return 0;
 }
 function nextPlayer(s,from,steps=1,direction=s.data.direction){
  let index=from;
  while(steps-->0){do{index=(index+direction+s.playerCount)%s.playerCount;}while(s.data.out.includes(index));}
  return index;
 }
 function cards(size){
  const deck=[];
  for(let copy=0;copy<2;copy++)for(const color of colors){
   const ranks=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
   for(const value of ranks.slice(size==='52'?0:4))deck.push({id:color+'-'+value+'-'+copy,color,value});
  }
  return deck;
 }
 const deckIds=Object.fromEntries(['36','52'].map(size=>[size,cards(size).map(card=>card.id)]));
 function create({playerCount,firstPlayer,preset='classic',rng,openHands,options={}}){
  const settings={size:'36',hand:'5',six:'penalty',transfer:'off',mix:'off',queen:'suit',afterDraw:'play',end:'first',skin:'elements',mauMode:'manual'};
  for(const key of Object.keys(settings))if(options[key]!==undefined)settings[key]=options[key];
  const s={playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,openHands:!!openHands,revision:0,data:{settings,points:Array(playerCount).fill(0),out:[],deal:0}};
  deal(s,firstPlayer);return s;
 }
 function deal(s,first){
  const d=s.data,deck=ports.shuffle(cards(d.settings.size),s);
  d.deal++;d.direction=1;d.drawn=null;d.stalled=0;d.pending=null;d.waiting=false;d.cover=null;d.queen=false;
  d.hands=Array.from({length:s.playerCount},()=>[]);d.discard=[];d.drawPile=deck;
  for(let n=0;n<Number(d.settings.hand);n++)for(let i=0;i<s.playerCount;i++)if(!d.out.includes(i))d.hands[i].push(deck.pop());
  d.mau={mode:d.settings.mauMode,declared:d.hands.map(()=>false),pending:null,episode:0,calls:[],penalties:[],situations:d.hands.map(()=>({episode:s.revision,open:false,called:false,settled:false}))};
  const firstCard=d.hands[first].pop();d.discard.push(firstCard);d.color=firstCard.color;s.turn=first;
  if(firstCard.value==='Q')d.queen=true;else effect(s,first,firstCard,[]);
 }
 function validate(s){
  try{
   const d=s.data,all=[...d.hands.flat(),...d.discard,...d.drawPile];
   const ids=new Set(deckIds[d.settings.size]);
   return ['playing','finished'].includes(s.status)&&d.hands.length===s.playerCount&&Number.isInteger(s.turn)&&s.turn>=0&&s.turn<s.playerCount&&
    d.discard.length>0&&all.length===ids.size&&all.every(c=>ids.delete(c.id)&&c.id.startsWith(c.color+'-'+c.value+'-'))&&
    d.points.length===s.playerCount&&d.points.every(Number.isSafeInteger)&&[1,-1].includes(d.direction)&&colors.includes(d.color)&&
    new Set(d.out).size===d.out.length&&d.out.every(i=>Number.isInteger(i)&&i>=0&&i<s.playerCount);
  }catch{return false;}
 }
 function syncPending(s){const u=s.data.mau;for(let i=0;i<u.situations.length;i++)if(s.status!=='playing'||s.data.hands[i].length!==1||u.declared[i])u.situations[i].open=false;u.pending=u.situations.flatMap((w,i)=>w.open?[i]:[]).at(-1)??null;}
 function draw(s,who,count){const d=s.data,received=[];
  for(let n=0;n<count;n++){if(!d.drawPile.length&&d.discard.length>1){const top=d.discard.pop();d.drawPile=ports.shuffle(d.discard,s);d.discard=[top];}if(!d.drawPile.length)break;const card=d.drawPile.pop();d.hands[who].push(card);received.push(card);}
  if(d.hands[who].length!==1){d.mau.declared[who]=false;const situation=d.mau.situations[who];if(situation.open)situation.settled=true;situation.open=false;if(d.mau.pending===who)d.mau.pending=null;}
  return received;
 }
 function penalty(s,who,reason,accuser,events){const count=draw(s,who,2).length;events.push(fact('penalized',who,{count,reason,accuser}));}
 function react(s,actor,action,events){const d=s.data,u=d.mau;
  if(action.type==='declare-mau'){
   if(!u.calls.includes(actor))u.calls.push(actor);u.situations[actor].called=true;
   const success=d.hands[actor].length===1;u.declared[actor]=success;
   if(success){u.situations[actor].open=false;u.situations[actor].settled=true;}
   events.push(fact(success?'declared':'early-call',actor,{count:d.hands[actor].length,automatic:false}));syncPending(s);return;
  }
  const target=action.target,situation=u.situations[target];if(!u.penalties.includes(target))u.penalties.push(target);situation.settled=true;
  if(situation.open&&d.hands[target].length===1&&!u.declared[target]){situation.open=false;events.push(fact('caught',actor,{target}));penalty(s,target,'missed',actor,events);}
  else{const reason=d.hands[target].length!==1?'count':u.declared[target]?'declared':'closed';events.push(fact('false-accusation',actor,{target,reason,count:d.hands[target].length}));penalty(s,actor,'false',actor,events);}
  syncPending(s);
 }
 function reactions(s,actor){
  const d=s.data;
  if(actor<0||actor>=s.playerCount||d.waiting||d.mau.mode!=='manual'||s.status!=='playing'||d.out.includes(actor))return [];
  return d.mau.situations.flatMap((window,target)=>{
   if(!window.open||window.settled||d.mau.declared[target])return [];
   const command=target===actor?{type:'declare-mau',episode:window.episode}:{type:'accuse-mau',target,episode:window.episode};
   return [{command,visibility:'public'}];
  });
 }
 function reactionWindows(s){if(s.status!=='playing'||s.data.mau.mode!=='manual')return [];return s.data.mau.situations.flatMap((w,owner)=>w.open&&!w.settled?[{id:`mau:${owner}:${w.episode}`,owner,revision:w.episode,humanMs:1000,botMs:3000,fallbackMs:10000}]:[]);}
 function reactionControl(s,actor,action){const u=s.data.mau;if(u.mode!=='manual')return null;
  if(!reactionTypes.includes(action.type))return null;
  if(action.type==='accuse-mau'&&(!Number.isInteger(action.target)||action.target<0||action.target>=s.playerCount||action.target===actor))return null;
  const target=action.type==='accuse-mau'?action.target:actor,situation=u.situations[target],episode=situation.episode,supplied=action.episode??episode;
  if(!Number.isSafeInteger(supplied)||supplied<0||supplied>episode)return null;
  const kind=action.type==='declare-mau'?'answer':'challenge',ignore=supplied<episode||(kind==='answer'?u.declared[actor]||situation.called||situation.settled:situation.settled||u.declared[target]);
  return {kind,episode,target,independent:true,ignore:!!ignore,command:{...action,episode:supplied}};
 }
 function observe(s){return {situations:s.data.mau.situations};}
 function declarationTiming(s,actor,settings,memory){
  // A stable episode decision: polling or another player's reaction must not reroll it.
  let hash=2166136261;for(const ch of `${actor}:${memory.situations[actor].episode}:${s.data.hands[actor].map(c=>c.id).join(',')}`)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const chance=hash/4294967296,[forget,late]=({easy:[.25,.70],medium:[.10,.45],hard:[.01,.08]})[settings?.difficulty||'medium'];
  return {skip:chance<forget,delay:chance<late?1200+hash%1401:0};
 }
 function botReactionDelay(s,actor,settings,memory){return declarationTiming(s,actor,settings,memory).delay;}
 function botReaction(s,actor,actions,memory,settings){const u=s.data.mau;if(s.data.hands[actor].length===1&&!u.declared[actor]&&!u.calls.includes(actor)&&!declarationTiming(s,actor,settings,memory).skip)return actions.find(a=>a.type==='declare-mau');const target=memory.situations.findIndex((w,i)=>i!==actor&&w.open&&!w.settled&&!u.declared[i]);return target<0?null:actions.find(a=>a.type==='accuse-mau'&&a.target===target);}
 function canPlay(s,actor,card){
  const d=s.data,top=d.discard.at(-1);
  if(d.pending)return d.settings.transfer!=='off'&&weight(top,d.settings)!==5&&weight(card,d.settings)>0&&(card.value===top.value||d.settings.mix==='on');
  if(d.drawn&&card.id!==d.drawn)return false;
  if(d.cover==='6')return card.color===d.color;
  if(card.value==='Q')return d.settings.queen==='any'||card.color===d.color;
  return card.color===d.color||card.value===top.value;
 }
 function actions(s,actor){
  if(s.status!=='playing'||s.turn!==actor)return [];
  const d=s.data,moves=[];
  if(d.waiting)moves.push({type:'next-deal'});
  else if(d.queen)for(const color of colors)moves.push({type:'choose-suit',color});
  else{
   for(const card of d.hands[actor])if(canPlay(s,actor,card)){
    if(card.value==='Q'&&d.hands[actor].length>1)for(const color of colors)moves.push({type:'play',card:card.id,color});
    else moves.push({type:'play',card:card.id});
   }
   if(d.pending||!moves.length)moves.push({type:d.drawn?'pass':'draw'});
   else if(d.drawn)moves.push({type:'pass'});
  }
  return moves.map(command=>({command,visibility:'private'}));
 }
 function finish(s,actor,card,events){
  const d=s.data;
  for(let i=0;i<s.playerCount;i++){
   if(d.out.includes(i))continue;
   const hand=d.hands[i],queenCost=c=>c.color==='green'?40:20;
   const penalty=i===actor?(card?.value==='Q'?-queenCost(card):0):
    hand.reduce((sum,c)=>sum+(hand.every(x=>x.value==='Q')?queenCost(c):cardPoints(c)),0);
   d.points[i]+=penalty;if(d.points[i]===101)d.points[i]=0;
  }
  const lost=d.points.flatMap((v,i)=>v>101&&!d.out.includes(i)?[i]:[]);d.out.push(...lost);
  const active=d.points.map((_,i)=>i).filter(i=>!d.out.includes(i));
  events.push(fact('deal-end',actor<0?null:actor,{deal:d.deal}));
  if(lost.length&&(d.settings.end==='first'||active.length<=1)){
   const best=Math.min(...d.points.filter((_,i)=>active.length?active.includes(i):true));
   s.status='finished';s.winners=d.points.flatMap((v,i)=>v===best&&(active.length===0||active.includes(i))?[i]:[]);
  }else{d.waiting=true;s.turn=actor>=0&&!d.out.includes(actor)?actor:nextPlayer(s,actor);}
  syncPending(s);
 }
 function effect(s,actor,card,events){
  const d=s.data,amount=weight(card,d.settings),empty=!d.hands[actor].length;
  d.cover=null;
  if(amount){
   const count=amount+(d.settings.transfer==='sum'?(d.pending||0):0),target=nextPlayer(s,actor);
   d.pending=null;s.turn=target;
   if(empty||amount===5||d.settings.transfer==='off'){const received=draw(s,target,count);events.push(fact('draw-skipped',target,{count:received.length,heavy:amount>=4}));s.turn=nextPlayer(s,target);}
   else d.pending=count;
  }else if(card.value==='8'||(card.value==='6'&&d.settings.six==='cover')){d.cover=card.value;s.turn=actor;return;}
  else{if(card.value==='10')d.direction*=-1;s.turn=nextPlayer(s,actor,card.value==='A'?2:1);}
  if(empty)finish(s,actor,card,events);
 }
 function perform(s,actor,a,events){
  const d=s.data,u=d.mau;
  if(reactionTypes.includes(a.type)){react(s,actor,a,events);return;}
  if(a.type==='next-deal'){deal(s,actor);return;}
  if(a.type==='choose-suit'){d.color=a.color;d.queen=false;s.turn=nextPlayer(s,actor);return;}
  if(a.type==='pass'){events.push(fact('passed',actor));d.drawn=null;s.turn=nextPlayer(s,actor);return;}
  if(a.type==='draw'){
   let got=draw(s,actor,d.pending||1),count=got.length;
   if(d.cover==='8'){
    while(got.length&&!d.hands[actor].some(c=>canPlay(s,actor,c))){got=draw(s,actor,1);count+=got.length;}
    if(d.hands[actor].some(c=>canPlay(s,actor,c))){events.push(fact('drawn',actor,{count}));return;}
   }
   events.push(fact(d.pending?'draw-skipped':'drawn',actor,{count,heavy:(d.pending||0)>=4}));
   if(!d.cover&&!d.pending&&got.length&&d.settings.afterDraw==='play'&&canPlay(s,actor,got[0])){d.drawn=got[0].id;return;}
   d.stalled=got.length?0:d.stalled+1;
   d.drawn=null;d.pending=null;d.cover=null;s.turn=nextPlayer(s,actor);
   if(d.stalled>=s.playerCount-d.out.length){finish(s,-1,null,events);}
   return;
  }
  const hand=d.hands[actor],card=hand.splice(hand.findIndex(c=>c.id===a.card),1)[0];
  d.drawn=null;d.stalled=0;d.discard.push(card);d.color=a.color||card.color;
  u.declared[actor]=false;u.situations[actor]={episode:s.revision,open:false,settled:false,called:false};u.calls=u.calls.filter(i=>i!==actor);u.penalties=u.penalties.filter(i=>i!==actor);
  events.push(fact('played',actor,{card,color:d.color,skin:d.settings.skin,six:d.settings.six,skipped:null}));
  if(hand.length===1){if(u.mode==='manual')u.situations[actor].open=true;else{u.declared[actor]=true;events.push(fact('declared',actor,{automatic:true,count:1}));}}
  effect(s,actor,card,events);syncPending(s);
 }
 function reduce(position,actor,action){
  const s=JSON.parse(JSON.stringify(position)),events=[];s.revision=(s.revision||0)+1;
  perform(s,actor,action,events);return {position:s,events,turnEnded:!reactionTypes.includes(action.type)&&s.turn!==actor};
 }
 function project(s,viewer){
  const d=JSON.parse(JSON.stringify(s.data));d.hands=d.hands.map((hand,i)=>s.openHands||i===viewer?hand:hand.map(()=>({hidden:true})));
  d.drawPile=d.drawPile.map(()=>({hidden:true}));if(viewer!==s.turn)d.drawn=d.drawn?true:null;
  d.mau.declarationOpen=d.mau.situations.map(w=>w.open&&!w.settled&&!w.called);return d;
 }
 function localData(p){
  const d=p.data,nextPlayerByCard={};
  if(p.viewer!==p.turn||p.viewer<0||d.queen||d.waiting||p.status!=='playing')return d;
  for(const card of d.hands[p.viewer]){
   if(!canPlay(p,p.viewer,card))continue;
   const cover=card.value==='8'||card.value==='6'&&d.settings.six==='cover',last=d.hands[p.viewer].length===1;
   const amount=weight(card,d.settings),skip=card.value==='A'||amount>0&&(amount===5||d.settings.transfer==='off');
   nextPlayerByCard[card.id]=cover?p.viewer:last?null:nextPlayer(p,p.viewer,skip?2:1,card.value==='10'?-d.direction:d.direction);
  }
  return {...d,nextPlayerByCard};
 }
 const localChoices=p=>p.actor<0?[]:[...(p.actor===p.viewer?actions(p,p.actor):[]),...reactions(p,p.actor)];
 const score=s=>s.data.points;
 const result=s=>({winners:s.winners,places:score(s).map(v=>1+score(s).filter(n=>n<v).length),metrics:[{id:'points',values:score(s),order:'asc'}]});
 return {contractVersion:1,id:'one-oh-one',minPlayers:2,maxPlayers:6,create,validate,actions,localChoices,localData,localReaction:(p,c)=>reactionControl(p,p.actor,c),reactions,reactionWindows,reactionControl,reduce,project,observe,botReaction,botReactionDelay,bot:(s,i,moves)=>moves[0],score,result,
  turnOrder:p=>({players:Array.from({length:p.playerCount},(_,i)=>i).filter(i=>!p.data.out.includes(i)),direction:p.data.direction})};
});
