// Mage Brawl adaptation v3.1. Authoritative state is never a presentation object.
(function(r,f){if(typeof require==='function'&&!r.PlayroomPack)module.exports=f(require('../../../shared/domain/tactical-grid.js'),require('../../../shared/domain/decision-window.js'),require('../../../shared/domain/effect-batch.js'),require('../../../shared/domain/bot-policy.js'),require('./bots.js'),require('../../../shared/domain/frame-sequence.js'));r.PlayroomPackDefinitionFactory=f;})(globalThis,function(G,W,E,B,Bots,F){
 'use strict';
 const elements=['air','earth','water','fire'],strategies=['aggressor','fighter','mind','tactician','defender','random'];
 const terrain={puddle:['water','fire'],desert:['earth','water'],air_island:['air','earth'],forest:['fire','air']};
 const clone=x=>JSON.parse(JSON.stringify(x)),sizeFor=n=>n<=2?4:n<=4?6:n<=6?8:10;
 const config=d=>d.config||{steps:1,health:3,lives:2,handLimit:3,copies:d.players.length+1};
 const event=(type,params={})=>({type:'mage-brawl.'+type,actor:null,params,visibility:{kind:'public'}});
 const random=d=>{d.random=(Math.imul(d.random,1664525)+1013904223)>>>0;return d.random/4294967296;};
 function shuffle(d,a){for(let i=a.length-1;i>0;i--){const j=Math.floor(random(d)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 const ordered=(d,ids)=>[...ids].sort((a,b)=>(a-d.first+d.players.length)%d.players.length-(b-d.first+d.players.length)%d.players.length);
 const inside=(d,p)=>G.inside(p,d.size)&&p.every(v=>v>=d.inset&&v<d.size-d.inset);
 const tile=(d,p)=>inside(d,p)?d.board[p[0]*d.size+p[1]]:null;
 const occupant=(d,p)=>d.players.findIndex(v=>G.same(v.pos,p));
 const active=d=>d.players.flatMap((p,i)=>p.pos?[i]:[]),living=d=>d.players.flatMap((p,i)=>p.lives>0?[i]:[]);
 const ring=(d,p)=>!!p&&p.some(v=>v===d.inset||v===d.size-d.inset-1);
 const bases=d=>d.board.flatMap((t,i)=>t==='base'&&inside(d,[Math.floor(i/d.size),i%d.size])?[[Math.floor(i/d.size),i%d.size]]:[]);
 const freeBases=d=>bases(d).filter(p=>occupant(d,p)<0);
 function draw(d,p,n){while(p.hand.length<n){if(!d.deck.length){shuffle(d,d.discard);d.deck.push(...d.discard);d.discard=[];}if(!d.deck.length)break;p.hand.push(d.deck.pop());}}
 function openSpawn(d,p){const vectors=[...G.directions,...G.directions.map(v=>G.add(v,G.rotate(v,1))),...G.directions.map(v=>v.map(x=>2*x))];if(vectors.some(v=>{const t=tile(d,G.add(p.pos,v));return t&&t!=='wall';}))return;const dirs=G.directions.filter(v=>inside(d,G.add(p.pos,v.map(x=>2*x))));if(dirs.length){const v=dirs[Math.floor(random(d)*dirs.length)];for(const k of [1,2]){const q=G.add(p.pos,v.map(x=>x*k));if(!tile(d,q)||tile(d,q)==='wall')d.board[q[0]*d.size+q[1]]='ground';}}}
 function begin(d){
  const continuingRespawn=d.phase==='respawn',previousRespawn=d.respawn||[],waiting=living(d).filter(i=>!d.players[i].pos);
  if(!bases(d).length)for(const i of waiting){d.discard.push(...d.players[i].hand);Object.assign(d.players[i],{lives:0,health:0,hand:[],ultimate:0,eliminatedRound:d.round});}
  d.drafts={};d.window=W.create('round:'+d.round,[]);d.respawn=waiting.filter(i=>d.players[i].lives>0);d.phase=d.respawn.length&&freeBases(d).length?'respawn':'planning';
  if(d.phase==='respawn'){
   // Draw once per base-selection stage, never again after an individual choice.
   d.respawn=continuingRespawn?previousRespawn.filter(i=>d.respawn.includes(i)):shuffle(d,d.respawn);
  }
  if(d.phase==='planning'){if(d.pendingDraw){for(const id of d.pendingDraw)if(d.players[id].pos)draw(d,d.players[id],d.players[id].hand.length+config(d).steps);delete d.pendingDraw;}if(living(d).length>1&&d.size-2*d.inset>sizeFor(living(d).length))d.shrink=d.round;if(d.nextFirst!==undefined){d.first=d.nextFirst;delete d.nextFirst;}d.window=W.create('round:'+d.round,ordered(d,active(d)));}
 }
 // Reward pools stay authoritative and hidden until every eligible source has chosen.
 function nextLoot(d){
  while(d.loot?.length){const reward=d.loot[0];reward.recipients=reward.recipients.filter(i=>d.players[i].lives>0);
   if(reward.cards.length&&reward.recipients.length)return reward;
   d.discard.push(...reward.cards);d.loot.shift();
  }
  delete d.loot;return null;
 }
 function finishRound(d){d.deck.push(...d.discard);d.discard=[];shuffle(d,d.deck);begin(d);}
 function create({playerCount,firstPlayer,preset,rng,options={}}){
  if(!Number.isInteger(playerCount)||playerCount<2||playerCount>8||preset!=='classic')throw Error('MAGE_OPTIONS_INVALID');
  const option=(key,fallback,min,max)=>{const v=options[key];if(v===undefined||v==='mode')return fallback;const n=Number(v);if(!Number.isInteger(n)||n<min||n>max)throw Error('MAGE_OPTIONS_INVALID');return n;};
  const steps=option('actionsPerTurn',2,1,2),health=option('health',steps===2?4:3,1,6),lives=option('lives',2,1,4),handLimit=option('handLimit',steps===2?4:3,2,8),copies=Math.max(playerCount+1,Math.ceil(playerCount*handLimit/4)+1);
  const size=sizeFor(playerCount),l=(size-2)/2,seed=(rng>>>0)||1,d={size,inset:0,round:1,first:firstPlayer??0,seed,random:seed,board:[],players:[],deck:[],discard:[],phase:'planning',respawn:[],shrink:null,window:null,frames:[]};
  d.config={steps,health,lives,handLimit,copies,differentActionTypes:!!option('differentActionTypes',1,0,1)};d.drafts={};
  d.board=Array(playerCount).fill('base');for(const t of ['puddle','desert','air_island','forest'])d.board.push(...Array(l).fill(t));for(const t of ['falling_floor','wall','spikes'])d.board.push(...Array(2*l).fill(t));while(d.board.length<size*size)d.board.push('ground');shuffle(d,d.board);
  d.deck=shuffle(d,elements.flatMap((element,e)=>Array.from({length:copies},(_,i)=>({id:'card:'+(e*copies+i),element}))));const spawn=shuffle(d,bases(d));d.startingBases=clone(spawn);
  for(let i=0;i<playerCount;i++){const p={pos:spawn[i],health,lives,maxHand:handLimit,hand:[],ultimate:0,kills:0,damageDealt:0,eliminatedRound:null,bot:B.resolve(options.players?.[i]?.botSettings,strategies,seed,i)};d.players.push(p);draw(d,p,handLimit);openSpawn(d,p);}
  begin(d);return {playerCount,turn:d.first,status:'playing',winners:[],data:d};
 }
 function plans(d,actor,first=d.drafts?.[actor]){const p=d.players[actor];if(!p?.pos)return [];
  const cards=p.hand.filter(c=>c.id!==first?.cardId).map(c=>({element:c.element,cardId:c.id}));
  return cards.flatMap(card=>['movement','attack',...(p.ultimate-(first?.action==='ultimate'?1:0)>0?['ultimate']:[])].filter(action=>!(config(d).steps===2&&config(d).differentActionTypes&&first?.action===action)).flatMap(action=>G.directions.map((_,direction)=>({type:'plan',...card,action,direction}))));
 }
 function actions(s,actor){const d=s.data;if(s.status!=='playing')return [];if(d.phase==='loot'){const reward=d.loot[0];return actor===reward.recipients[0]?reward.cards.map((_,index)=>({command:{type:'loot',index},visibility:'private'})):[];}if(d.phase==='respawn')return actor===d.respawn[0]?freeBases(d).map(pos=>({command:{type:'respawn',pos},visibility:'public'})):[];if(!d.window.participants.includes(actor))return [];return (d.window.plans[actor]?[{type:'unready'}]:[...plans(d,actor),...(d.drafts?.[actor]?[{type:'unready'}]:[])]).map(command=>({command,visibility:'private'}));}
 // A shield protects the forward hemisphere excluding the two strictly lateral cells.
 function shielded(shields,id,outward){const direction=shields[id];if(direction===undefined)return false;const front=G.directions[direction];return -outward[0]*front[0]-outward[1]*front[1]>0;}
 function blocked(d,shields,id,element,outward){return shielded(shields,id,outward)||terrain[tile(d,d.players[id].pos)]?.[1]===element;}
 function line(d,origin,v,limit=d.size){const out=[];for(const p of G.ray(origin,v,d.size,limit)){if(!inside(d,p))break;out.push(p);if(tile(d,p)==='wall')break;}return out;}
 function geometry(d,actor,c){const p=d.players[actor]?.pos;if(!p)return [];const v=G.directions[c.direction];if(c.action==='movement'){if(c.element==='earth')return [p];const delta=c.element==='air'?G.add(v,G.rotate(v,1)):c.element==='fire'?v.map(x=>x*2):v;return [G.add(p,delta)];}
  if(c.element==='air')return G.area(p,c.action==='ultimate'?[[-1,-1],[-1,1],[1,1],[1,-1]]:[v,G.rotate(v,1),G.rotate(v,3)]);
  if(c.element==='earth'&&c.action==='attack')return [G.add(p,v)];
  const cells=line(d,p,v,c.element==='water'?2:d.size);if(c.element==='water')return cells.filter(q=>tile(d,q)!=='wall');
  const hit=cells.find(q=>tile(d,q)==='wall'||occupant(d,q)>=0);if(!hit)return [];return c.element==='fire'&&c.action==='ultimate'?[hit,...G.area(hit,G.directions)]:tile(d,hit)==='wall'?[]:[hit];
 }
 // Public effects describe actions, never private physical card identities.
 const publicPlans=plans=>Object.fromEntries(Object.entries(plans).map(([id,c])=>[id,c.steps?{steps:c.steps.map(({element,action,direction})=>({element,action,direction}))}:(({element,action,direction})=>({element,action,direction}))(c)]));
 function publicBoard(d){return {board:[...d.board],inset:d.inset,players:d.players.map(p=>({pos:p.pos&&[...p.pos],health:p.health,lives:p.lives,maxHand:p.maxHand,kills:p.kills??p.maxHand-config(d).handLimit,ultimate:p.ultimate,handCount:p.hand.length})),shrink:d.shrink};}
 function resolve(d,{preview=false}={}){
  const sequences=Object.fromEntries(Object.entries(d.window.plans).map(([id,c])=>[id,c.steps||[c]])),pushSources={},events=[event('revealed',{plans:publicPlans(d.window.plans),round:d.round})];let chosen={},shields={},step=0;d.frames=[];
  if(!preview)d.frames.push({phase:'start',...publicBoard(d),ready:Object.keys(sequences).map(Number)});
  if(!preview)for(const [id,sequence] of Object.entries(sequences))for(const c of sequence){const p=d.players[id],index=p.hand.findIndex(card=>card.id===c.cardId);if(index<0)throw Error('MAGE_CARD_MISSING');d.discard.push(p.hand.splice(index,1)[0]);}
  let batch=new E.Batch(),motions=[],outcomes=[],phaseElement=null;const fallAt={};
  const frame=(phase,effect=null)=>{if(preview){if(motions.length)d.frames.push({motions});motions=[];outcomes=[];return;}d.frames.push({phase,step,...publicBoard(d),plans:publicPlans(chosen),shields:{...shields},...(effect?{effect}: {}),...(motions.length?{motions}:{}),...(outcomes.length?{outcomes}:{})});motions=[];outcomes=[];};
  const effect=(id,c)=>{
   const origin=[...d.players[id].pos],v=G.directions[c.direction],fx={actor:id,element:c.element,action:c.action,direction:c.direction,origin,aim:G.add(origin,v),cells:geometry(d,id,c)};
   if(c.action!=='movement'&&(c.element==='fire'||c.element==='earth'&&c.action==='ultimate')){
    const ray=line(d,origin,v),stop=ray.find(q=>tile(d,q)==='wall'||occupant(d,q)>=0);
    fx.projectile={end:stop||G.add(ray.at(-1)||origin,v.map(x=>x*2)),miss:!stop};
    if(stop&&c.element==='fire'&&c.action==='ultimate')fx.burst={origin:[...stop],cells:G.area(stop,G.directions)};
   }
   return fx;
  };
  const credit=(target,amount,sources)=>{const ids=[...new Set(sources)].filter(id=>id!==target);for(const id of ids)d.players[id].damageDealt=(d.players[id].damageDealt||0)+amount/ids.length;};
  const damage=(target,amount,sources)=>{batch.damage(target,amount,sources);credit(target,amount,sources);};
  function apply(){const deaths=[];for(const id of new Set([...active(d),...batch.entries.keys()])){const p=d.players[id];if(!p.lives)continue;const out=batch.outcome(id,p.health,config(d).health),entry=batch.entries.get(id);if(entry&&(entry.damage||out.fall))outcomes.push({player:id,damage:entry.damage,death:out.fall||out.health===0,fall:out.fall,at:clone(fallAt[id]||p.pos),killers:[]});if(out.fall)credit(id,out.health,out.sources);p.health=out.health;if(out.fall||p.health===0)deaths.push({id,sources:out.sources,cards:preview?[]:[...p.hand],ultimate:p.ultimate});}
   for(const {id} of deaths){const p=d.players[id];p.lives--;p.health=0;p.pos=null;p.hand=[];p.ultimate=0;if(!p.lives){p.eliminatedRound=d.round;}}
   for(const dead of deaths){const p=d.players[dead.id],killers=[...new Set(dead.sources)].filter(id=>id!==dead.id&&d.players[id].lives>0).sort((a,b)=>(a-dead.id+d.players.length)%d.players.length-(b-dead.id+d.players.length)%d.players.length);
    for(const id of killers){const p=d.players[id];p.kills=(p.kills??p.maxHand-config(d).handLimit)+1;}
    const feedback=outcomes.find(o=>o.player===dead.id);if(feedback)feedback.killers=[...killers];
    if(killers.length){for(let i=0;i<dead.ultimate;i++)d.players[killers[i%killers.length]].ultimate++;}
    if(!preview&&dead.cards.length&&killers.length)(d.loot||=[]).push({victim:dead.id,cards:shuffle(d,dead.cards),recipients:killers});
    else if(!preview)d.discard.push(...dead.cards);
    events.push(event('life-lost',{player:dead.id,lives:p.lives,killer:killers[0]??null,killers}));
   }batch=new E.Batch();
  }
  // Every proposal reads the same phase snapshot. A dependent push chain either
  // moves together or stays together; rejected moves never create new priority.
  function displace(roots,{water=false}={}){
   const positions=d.players.map(p=>p.pos&&[...p.pos]),at=new Map(positions.flatMap((p,id)=>p?[[G.key(p),id]]:[]));
   const groups=[],collisions=new Map();
   const collide=(id,sources)=>{if(!collisions.has(id))collisions.set(id,new Set());for(const source of sources)if(source!==id)collisions.get(id).add(source);};
   for(const root of roots.values()){
    const vector=[root.to[0]-positions[root.id][0],root.to[1]-positions[root.id][1]],group={moves:[root],blocked:tile(d,root.to)==='wall'};
    if(water||root.forced){
     let q=root.to;const seen=new Set([root.id]);
     while(!group.blocked){
      const id=at.get(G.key(q));if(id===undefined||roots.has(id)||seen.has(id))break;
      if(shielded(shields,id,vector)){group.blocked=true;break;}
      seen.add(id);const to=G.add(q,vector);group.moves.push({id,to,forced:true,sources:root.sources});
      q=to;group.blocked=tile(d,q)==='wall';
     }
    }
    groups.push(group);
   }
   const reject=(items)=>{for(const group of items)group.blocked=true;};
   // Reject competing destinations (including two different pushes of one mage)
   // before examining occupied cells. Cancellation then propagates backwards.
   let changed=true;
   while(changed){
    changed=false;const byPlayer=new Map(),byCell=new Map();
    for(const group of groups)if(!group.blocked)for(const move of group.moves){
     const item={group,move};if(!byPlayer.has(move.id))byPlayer.set(move.id,[]);byPlayer.get(move.id).push(item);
     const key=G.key(move.to);if(!byCell.has(key))byCell.set(key,[]);byCell.get(key).push(item);
    }
    const rejected=new Set();
    for(const items of [...byPlayer.values(),...byCell.values()]){
     if(new Set(items.map(({move})=>move.id)).size<2&&new Set(items.map(({move})=>G.key(move.to))).size<2)continue;
     for(const {group} of items)rejected.add(group);
     if(items.some(({move})=>move.forced)){const sources=items.flatMap(({move})=>move.sources);for(const {move} of items)collide(move.id,sources);}
    }
    if(rejected.size){reject(rejected);changed=true;continue;}
    for(const group of groups)if(!group.blocked)for(const move of group.moves){
     const target=at.get(G.key(move.to));
     // A simultaneous swap or cycle is legal: only a stationary occupant blocks.
     if(target!==undefined&&target!==move.id&&!byPlayer.has(target)){rejected.add(group);break;}
    }
    if(rejected.size){reject(rejected);changed=true;}
   }
   const moves=new Map();
   for(const group of groups){
    if(group.blocked){for(const move of group.moves)if(move.forced)collide(move.id,move.sources);continue;}
    for(const move of group.moves){
     const previous=moves.get(move.id);moves.set(move.id,{...move,sources:[...new Set([...(previous?.sources||[]),...move.sources])]});
    }
   }
   for(const [id,sources] of collisions)damage(id,1,[...sources]);
   // Collapse all departed floors before any arrival, including swaps/cycles.
   for(const id of moves.keys()){const old=positions[id];if(tile(d,old)==='falling_floor')d.board[old[0]*d.size+old[1]]=null;}
   for(const [id,{to,sources}] of moves){
    const p=d.players[id];motions.push({player:id,from:positions[id],to:[...to],element:phaseElement});p.pos=[...to];
    if(!tile(d,to)){fallAt[id]=[...to];batch.fall(id,sources);p.pos=null;}
    else if(tile(d,to)==='spikes')damage(id,1,sources);
    if(sources.length&&d.shrink&&ring(d,to))pushSources[id]=[...new Set([...(pushSources[id]||[]),...sources])];
   }
  }
  function hit(id,element,amount,actor,v){if(blocked(d,shields,id,element,v))return false;const total=amount+(terrain[tile(d,d.players[id].pos)]?.[0]===element?1:0);if(total>0)damage(id,total,[actor]);return true;}
  for(step=0;step<(preview?1:config(d).steps);step++){
  chosen=Object.fromEntries(Object.entries(sequences).filter(([id,seq])=>d.players[id].pos&&seq[step]).map(([id,seq])=>[id,seq[step]]));shields={};
  frame('reveal-actions');frame('reveal');
  for(const element of elements){
   phaseElement=element;const movers=active(d).filter(id=>chosen[id]?.action==='movement'&&chosen[id].element===element),roots=new Map();
   for(const id of movers){const c=chosen[id];frame('movement-'+element,effect(id,c));if(element==='earth')shields[id]=c.direction;
    else roots.set(id,{id,to:geometry(d,id,c)[0],forced:false,sources:element==='water'?[id]:[]});}
   if(roots.size)displace(roots,{water:element==='water'});apply();if(movers.length)frame('movement-'+element);
  }
  for(const element of elements){phaseElement=element;const attackers=active(d).filter(id=>chosen[id]&&chosen[id].element===element&&chosen[id].action!=='movement');
   for(const id of attackers)if(chosen[id].action==='ultimate')d.players[id].ultimate--;
   if(element==='air'){const pushes=new Map();for(const id of attackers){const c=chosen[id],origin=d.players[id].pos;frame('attack-'+element,effect(id,c));for(const q of geometry(d,id,c)){const target=occupant(d,q);if(target<0||target===id)continue;const v=c.action==='ultimate'?[q[0]-origin[0],q[1]-origin[1]]:G.directions[c.direction];if(!hit(target,element,0,id,v))continue;if(!pushes.has(target))pushes.set(target,[]);pushes.get(target).push({v,id});}}
    const roots=new Map();for(const [id,entries] of pushes){const v=G.combine(entries.map(e=>e.v));if(v.some(Boolean))roots.set(id,{id,to:G.add(d.players[id].pos,v),forced:true,sources:[...new Set(entries.map(e=>e.id))]});}displace(roots);
   }else for(const id of attackers){const c=chosen[id],v=G.directions[c.direction],cells=geometry(d,id,c);frame('attack-'+element,effect(id,c));let actual=false;
    for(const [index,q] of cells.entries()){const target=occupant(d,q);if(target<0)continue;const outward=element==='fire'&&c.action==='ultimate'&&index>0?[q[0]-cells[0][0],q[1]-cells[0][1]]:v;const ok=hit(target,element,element==='earth'?2:1,id,outward);actual=actual||ok;if(element==='water'&&!ok)break;}
    if(element==='water'&&c.action==='ultimate'&&actual)batch.heal(id,1);
   }apply();if(attackers.length||element==='fire')frame('attack-'+element);
  }
  }
  if(preview)return events;
  if(d.shrink===d.round){for(const id of active(d))if(ring(d,d.players[id].pos)){fallAt[id]=[...d.players[id].pos];batch.fall(id,pushSources[id]||[]);}for(let i=0;i<d.board.length;i++)if(ring(d,[Math.floor(i/d.size),i%d.size]))d.board[i]=null;d.inset++;d.shrink=null;apply();frame('shrink');}
  d.drafts={};d.pendingDraw=Object.keys(sequences).map(Number);
  d.round++;d.nextFirst=(d.first+1)%d.players.length;if(nextLoot(d)){d.phase='loot';d.window=W.create('loot:'+d.round,[]);}else finishRound(d);if(d.shrink===d.round)events.push(event('shrink',{round:d.round}));events.push(event('round',{round:d.round}));return events;
 }
 function reduce(s,actor,c){const next=clone(s),d=next.data;let events=[],roundEnded=false;
  if(c.type==='loot'){const reward=d.loot[0],victim=reward.victim;d.players[actor].hand.push(reward.cards.splice(c.index,1)[0]);d.players[actor].maxHand++;reward.recipients.shift();events.push(event('loot',{player:actor,victim}));if(!nextLoot(d))finishRound(d);}
  else if(c.type==='respawn'){const p=d.players[actor],replace=d.pendingDraw?.includes(actor);p.pos=[...c.pos];p.health=config(d).health;p.ultimate++;d.discard.push(...p.hand);p.hand=[];draw(d,p,p.maxHand);if(replace)d.pendingDraw=d.pendingDraw.filter(id=>id!==actor);openSpawn(d,p);begin(d);events.push(event('respawn',{player:actor}));}
  else if(c.type==='unready'){delete d.drafts?.[actor];W.put(d.window,actor,null);}
  else if(config(d).steps===2&&!d.drafts?.[actor]){(d.drafts||={})[actor]=clone(c);d.window.versions[actor]++;}
  else if(W.put(d.window,actor,config(d).steps===2?{steps:[d.drafts[actor],c]}:c)){events=resolve(d);roundEnded=true;}
  const alive=living(d);if(d.phase!=='loot'&&alive.length<=1){next.status='finished';next.winners=alive;}
  const eligible=d.phase==='loot'?[d.loot[0].recipients[0]]:d.phase==='respawn'?d.respawn.filter(i=>freeBases(d).length):d.window.participants.filter(i=>!d.window.plans[i]);next.turn=eligible[0]??d.first;
  return {position:next,events,turnEnded:roundEnded,roundEnded};
 }
 function decisionWindow(s){if(s.status!=='playing')return null;const d=s.data;if(d.phase==='loot'){const r=d.loot[0],id=r.recipients[0];return {id:'loot:'+d.round+':'+r.victim+':'+r.cards.length+':'+r.recipients.join('-'),participants:[id],ready:[],versions:{[id]:0}};}return d.phase==='planning'?W.describe(d.window):{id:'respawn:'+d.round+':'+d.respawn[0],participants:[d.respawn[0]],ready:[],versions:{[d.respawn[0]]:0}};}
 function project(s,viewer){const d=s.data;
  return {config:clone(config(d)),size:d.size,inset:d.inset,round:d.round,first:d.first,board:[...d.board],...(d.startingBases?{startingBases:clone(d.startingBases)}:{}),phase:d.phase,shrink:d.shrink,deckCount:d.deck.length,respawn:[...d.respawn],window:decisionWindow(s),...(d.phase==='loot'?{loot:{victim:d.loot[0].victim,player:d.loot[0].recipients[0],count:d.loot[0].cards.length}}:{}),frameSequence:F.encode(d.frames),players:d.players.map((p,i)=>({pos:p.pos&&[...p.pos],health:p.health,lives:p.lives,maxHand:p.maxHand,kills:p.kills??p.maxHand-config(d).handLimit,ultimate:p.ultimate,handCount:p.hand.length,bot:clone(p.bot),...(i===viewer?{hand:clone(p.hand),draft:clone(d.drafts?.[i]??null),plan:clone(d.window?.plans[i]??null)}:{})}))};}
 function draft(p){const mine=p.data.players[p.actor];return p.actor===p.viewer&&p.status==='playing'&&p.data.phase==='planning'&&p.data.config.steps===2&&p.data.window.participants.includes(p.actor)&&mine?.pos&&!mine.draft&&!mine.plan?{mode:'sequence',select:['plan'],commit:['plan'],count:2,cancel:'unready'}:null;}
 function draftProjection(p,actions){const d=clone(p.data),first=actions[0];if(first)d.players[p.actor].draft={...first,element:d.players[p.actor].hand.find(card=>card.id===first.cardId)?.element};return {...p,data:d};}
 function localChoices(p){const d=p.data,id=p.actor;if(id<0||p.status!=='playing')return [];if(d.phase==='loot')return id===p.viewer&&id===d.loot.player?Array.from({length:d.loot.count},(_,index)=>({command:{type:'loot',index},visibility:'private'})):[];if(d.phase==='respawn')return id===d.respawn[0]?freeBases(d).map(pos=>({command:{type:'respawn',pos},visibility:'public'})):[];if(id!==p.viewer||!d.window.participants.includes(id))return [];const mine=d.players[id];return (d.window.ready.includes(id)?[{type:'unready'}]:[...plans(d,id,mine.draft),...(mine.draft?[{type:'unready'}]:[])]).map(command=>({command,visibility:'private'}));}
 function localData(p){const d=clone(p.data),viewer=p.viewer,first=d.players[viewer]?.draft||d.players[viewer]?.plan?.steps?.[0];let planned=d;if(first){planned=clone(d);planned.window={plans:{[viewer]:first}};resolve(planned,{preview:true});}const route=first?planned.frames.flatMap(f=>(f.motions||[]).filter(m=>m.player===viewer)):[];d.previews=viewer<0?[]:plans(d,viewer,first).map(c=>({command:c,origin:clone(planned.players[viewer]?.pos||null),cells:geometry(planned,viewer,c)}));if(first)d.planned={command:clone(first),origin:clone(d.players[viewer].pos),pos:clone(planned.players[viewer].pos),cells:geometry(d,viewer,first),motions:route};return d;}

 function validPlan(d,id,c,first){return plans(d,id,first).some(p=>Object.keys(c).length===Object.keys(p).length&&Object.keys(p).every(k=>p[k]===c[k]));}
 const validCard=(card,c)=>!!card&&typeof card.id==='string'&&/^card:(0|[1-9]\d*)$/.test(card.id)&&Number(card.id.slice(5))<4*c.copies&&card.element===elements[Math.floor(Number(card.id.slice(5))/c.copies)];
 function validate(s){const d=s.data,c=config(d),cards=[...(d.deck||[]),...(d.discard||[]),...(d.players||[]).flatMap(p=>p.hand||[]),...(d.loot||[]).flatMap(r=>r.cards||[])];return new Set(cards.map(card=>card?.id)).size===cards.length&& Number.isInteger(c.steps)&&c.steps>=1&&c.steps<=2&&Number.isInteger(c.health)&&c.health>=1&&c.health<=6&&Number.isInteger(c.lives)&&c.lives>=1&&c.lives<=4&&Number.isInteger(c.handLimit)&&c.handLimit>=2&&c.handLimit<=8&&Number.isInteger(c.copies)&&c.copies>=Math.ceil(s.playerCount*c.handLimit/4)&&(d.startingBases===undefined||Array.isArray(d.startingBases)&&d.startingBases.length===s.playerCount&&d.startingBases.every(q=>Array.isArray(q)&&q.length===2&&q.every(v=>Number.isInteger(v)&&v>=0&&v<d.size))&&new Set(d.startingBases.map(G.key)).size===s.playerCount)&&[4,6,8,10].includes(d.size)&&Number.isInteger(d.inset)&&d.inset>=0&&d.inset*2<d.size&&Array.isArray(d.board)&&d.board.length===d.size*d.size&&d.board.every(t=>t===null||['ground','base','wall','spikes','falling_floor',...Object.keys(terrain)].includes(t))&&Array.isArray(d.players)&&d.players.length===s.playerCount&&d.players.every(p=>Number.isInteger(p.health)&&p.health>=0&&p.health<=config(d).health&&Number.isInteger(p.lives)&&p.lives>=0&&p.lives<=config(d).lives&&(p.damageDealt===undefined||Number.isFinite(p.damageDealt)&&p.damageDealt>=0)&&(p.kills===undefined||Number.isInteger(p.kills)&&p.kills>=0)&&Number.isInteger(p.maxHand)&&p.maxHand>=config(d).handLimit&&Number.isInteger(p.ultimate)&&p.ultimate>=0&&Array.isArray(p.hand)&&p.hand.every(e=>validCard(e,c))&&(p.pos===null||inside(d,p.pos))&&(p.pos!==null?p.health>0&&p.lives>0:p.health===0))&&new Set(active(d).map(i=>G.key(d.players[i].pos))).size===active(d).length&&Array.isArray(d.deck)&&Array.isArray(d.discard)&&[...d.deck,...d.discard].every(e=>validCard(e,c))&&d.deck.length+d.discard.length+(d.loot||[]).reduce((n,r)=>n+r.cards.length,0)+d.players.reduce((n,p)=>n+p.hand.length,0)===4*config(d).copies&&Number.isInteger(d.random)&&Number.isInteger(d.round)&&d.round>0&&['respawn','planning','loot'].includes(d.phase)&&(!d.loot||Array.isArray(d.loot)&&d.loot.length>0&&d.loot.every(r=>Number.isInteger(r.victim)&&r.victim>=0&&r.victim<s.playerCount&&Array.isArray(r.cards)&&r.cards.every(e=>validCard(e,c))&&Array.isArray(r.recipients)&&r.recipients.length>0&&new Set(r.recipients).size===r.recipients.length&&r.recipients.every(i=>Number.isInteger(i)&&i>=0&&i<s.playerCount&&i!==r.victim)))&&(d.phase!=='loot'||d.loot?.[0]?.cards.length>0)&&d.window&&Array.isArray(d.window.participants)&&d.window.participants.every(i=>Number.isInteger(i)&&i>=0&&i<s.playerCount)&&Object.entries(d.drafts||{}).every(([i,c])=>d.window.participants.includes(+i)&&validPlan(d,+i,c,null))&&Object.entries(d.window.plans).every(([i,c])=>d.window.participants.includes(+i)&&(config(d).steps===1?validPlan(d,+i,c,null):Array.isArray(c.steps)&&c.steps.length===2&&validPlan(d,+i,c.steps[0],null)&&validPlan(d,+i,c.steps[1],c.steps[0])));}
 function result(s){const values=s.data.players.map(p=>p.eliminatedRound??s.data.round),ranking=values.map((v,i)=>s.data.players[i].lives*10000+v);return {winners:[...s.winners],places:ranking.map(v=>1+ranking.filter(x=>x>v).length),metrics:[{id:'survival',values},{id:'damage',maximumFractionDigits:1,values:s.data.players.map(p=>p.damageDealt||0)}]};}
 const rules={elements,terrain,inside,tile,occupant,ring,geometry,line,freeBases,shielded};
 function checkpoint(before,after,actor,command){
  if(command.type==='plan')return config(after).steps!==2||after.round!==before.round||after.phase!=='planning'||!!after.window.plans[actor];
  if(command.type==='unready')return !!before.window.plans[actor];
  return true;
 }
 function bot(projection,actor,commands,memory,context){const p=clone(projection);if(p.data.planned?.pos)p.data.players[actor].pos=p.data.planned.pos;const choices=commands.filter(c=>c.type!=='unready');return Bots.choose(p,actor,choices.length?choices:commands,rules,context);}
 return Object.freeze({contractVersion:1,id:'mage-brawl',turnOrder:()=>null,derivedFields:{plan:['element']},minPlayers:2,maxPlayers:8,rounds:true,botHandlesDifficulty:true,storageState:data=>({...data,frames:[]}),create,validate,actions,localChoices,localData,draft,draftProjection,reduce,project,bot,result,decisionWindow,botContext:s=>({seed:s.data.seed}),geometry,rules,checkpoint});
});
