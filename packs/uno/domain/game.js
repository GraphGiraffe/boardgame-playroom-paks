(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;})(globalThis,function(ports){
 'use strict';const Ending=ports.ending;
 const colors=['red','yellow','green','blue'],reactionTypes=['declare-uno','accuse-uno'];
 const nextPlayer=(s,from,steps=1,direction=s.data.direction)=>{let player=from;for(let step=0;step<steps;step++){for(let n=0;n<s.playerCount;n++){player=(player+direction+s.playerCount)%s.playerCount;if(!Ending.done(s.data.ending,player))break;}}return player;};
 const fact=(name,actor,params={})=>({type:'uno.'+name,actor,params,visibility:{kind:'public'}});
 function cards(){let id=0,deck=[];for(const color of colors){deck.push({id:`u${id++}`,color,value:'0'});for(const value of ['1','2','3','4','5','6','7','8','9','skip','reverse','+2'])for(let n=0;n<2;n++)deck.push({id:`u${id++}`,color,value});}for(const value of ['wild','+4'])for(let n=0;n<4;n++)deck.push({id:`u${id++}`,color:'wild',value});return deck;}
 function create({playerCount,firstPlayer,preset,rng,openHands,options={}}){
  if(options.unoMode!==undefined&&!['auto','manual'].includes(options.unoMode))throw Error('UNO_MODE_INVALID');
  const s={playerCount,turn:firstPlayer,status:'playing',winners:[],preset,rng,openHands:!!openHands,data:{}};
  const deck=ports.shuffle(cards(),s),hands=Array.from({length:playerCount},()=>[]);
  for(let n=0;n<(preset==='quick'?5:7);n++)for(const hand of hands)hand.push(deck.pop());
  const first=deck.findIndex(c=>/^\d$/.test(c.value)),discard=[deck.splice(first,1)[0]];
  s.data={ending:Ending.create(playerCount,firstPlayer,options.endMode,['winner','last']),hands,drawPile:deck,discard,color:discard[0].color,direction:1,drawn:null,noDraw:false,stalled:0,points:hands.map(()=>0),
   uno:{mode:options.unoMode||'auto',declared:hands.map(()=>false),pending:null,episode:0,calls:[],penalties:[],situations:hands.map(()=>({episode:0,open:false,settled:false,called:false}))}};
  return s;
 }
 function validate(s){const check=value=>{if(!value)throw Error('UNO_POSITION_INVALID');};
  const inventory=(zones,predicate,size)=>{const all=zones.flat();check(all.length===size&&new Set(all.map(c=>c.id)).size===size&&all.every(predicate));};
  try{
      const d = s.data;
      check(Ending.valid(d.ending,s.playerCount));
      check(Array.isArray(d.hands) && d.hands.length === s.playerCount);
      const values = ['1','2','3','4','5','6','7','8','9','skip','reverse','+2'];
      inventory([...d.hands, d.drawPile, d.discard], c => {
        if (typeof c.id !== 'string' || !/^u\d+$/.test(c.id)) return false;
        const id = Number(c.id.slice(1));
        if (id < 0 || id > 107) return false;
        if (id >= 100) return c.color === 'wild' && c.value === (id < 104 ? 'wild' : '+4');
        const offset = id % 25;
        return c.color === colors[Math.floor(id / 25)] && c.value === (offset ? values[Math.floor((offset - 1) / 2)] : '0');
      }, 108);
      check(d.discard.length > 0 && colors.includes(d.color) && [1, -1].includes(d.direction));
      check(typeof d.noDraw === 'boolean' && Number.isInteger(d.stalled) && d.stalled >= 0 && d.stalled <= s.playerCount);
      check(d.drawn === null || (typeof d.drawn === 'string' && d.hands[s.turn].some(c => c.id === d.drawn)));
      check(!(d.noDraw && d.drawn !== null));
      check(d.uno && Array.isArray(d.uno.situations) && Array.isArray(d.uno.calls) && Array.isArray(d.uno.penalties));
      if (d.uno !== undefined) {
        const u = d.uno;
        check(u && ['auto', 'manual'].includes(u.mode) && Array.isArray(u.declared) && u.declared.length === s.playerCount && u.declared.every(value => typeof value === 'boolean'));
        check(u.declared.every((value, player) => !value || d.hands[player].length === 1));
        check(u.pending === null || (u.mode === 'manual' && s.status === 'playing' && Number.isInteger(u.pending) && u.pending >= 0 && u.pending < s.playerCount && d.hands[u.pending].length === 1 && !u.declared[u.pending]));
        check(u.situations===undefined||(Array.isArray(u.situations)&&u.situations.length===s.playerCount&&u.situations.every((w,i)=>w&&Number.isSafeInteger(w.episode)&&w.episode>=0&&w.episode<=s.revision&&['open','settled','called'].every(k=>typeof w[k]==='boolean')&&(!w.open||(u.mode==='manual'&&d.hands[i].length===1&&!u.declared[i]&&!w.settled)))));
        check(u.episode === undefined || (Number.isSafeInteger(u.episode) && u.episode >= 0 && u.episode <= s.revision));
        check(u.calls === undefined || (Array.isArray(u.calls) && new Set(u.calls).size === u.calls.length && u.calls.every(p => Number.isInteger(p) && p >= 0 && p < s.playerCount)));
        check(u.penalties === undefined || (Array.isArray(u.penalties) && new Set(u.penalties).size===u.penalties.length && u.penalties.every(p=>Number.isInteger(p)&&p>=0&&p<s.playerCount)));
      }

   check(Array.isArray(d.points)&&d.points.length===s.playerCount&&d.points.every(value=>Number.isSafeInteger(value)&&value>=0));
   return Number.isSafeInteger(s.rng)&&s.rng>=0&&s.rng<=4294967295;
  }catch(_){return false;}
 }
 function syncPending(s){const u=s.data.uno;for(let i=0;i<u.situations.length;i++)if(s.status!=='playing'||s.data.hands[i].length!==1||u.declared[i])u.situations[i].open=false;u.pending=u.situations.flatMap((w,i)=>w.open?[i]:[]).at(-1)??null;}
 function draw(s,who,count){const d=s.data,received=[];
  for(let n=0;n<count;n++){if(!d.drawPile.length&&d.discard.length>1){const top=d.discard.pop();d.drawPile=ports.shuffle(d.discard,s);d.discard=[top];}if(!d.drawPile.length)break;const card=d.drawPile.pop();d.hands[who].push(card);received.push(card);}
  if(d.hands[who].length!==1){d.uno.declared[who]=false;const situation=d.uno.situations[who];if(situation.open)situation.settled=true;situation.open=false;if(d.uno.pending===who)d.uno.pending=null;}
  return received;
 }
 function penalty(s,who,reason,accuser,events){const count=draw(s,who,2).length;events.push(fact('penalized',who,{count,reason,accuser}));}
 function react(s,actor,action,events){const d=s.data,u=d.uno;
  if(action.type==='declare-uno'){
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
 function canPlay(s,actor,card){const d=s.data,top=d.discard.at(-1);if(d.drawn!==null&&d.drawn!==card.id)return false;if(card.value==='+4')return !d.hands[actor].some(c=>c.color===d.color);return card.color==='wild'||card.color===d.color||card.value===top.value;}
 function actions(s,actor){if(s.status!=='playing'||actor!==s.turn)return [];const commands=(()=>{
      const d = s.data, actions = [];
      for (const card of d.hands[actor]) if (canPlay(s, actor, card)) {
        if (card.color === 'wild') for (const color of colors) actions.push({ type: 'play', card: card.id, color });
        else actions.push({ type: 'play', card: card.id });
      }
      actions.push(d.drawn != null || d.noDraw ? { type: 'pass' } : { type: 'draw' });
      return actions;
    })();return commands.map(command=>({command,visibility:'private'}));}
 function reactions(s,actor){if(s.data.uno.mode!=='manual'||s.status!=='playing'||Ending.done(s.data.ending,actor))return [];const u=s.data.uno;return [{type:'declare-uno',episode:u.situations[actor].episode},...Array.from({length:s.playerCount},(_,target)=>target).filter(target=>target!==actor).map(target=>({type:'accuse-uno',target,episode:u.situations[target].episode}))].map(command=>({command,visibility:'public'}));}
 function reactionWindows(s){if(s.status!=='playing'||s.data.uno.mode!=='manual')return [];return s.data.uno.situations.flatMap((w,owner)=>w.open&&!w.settled?[{id:`uno:${owner}:${w.episode}`,owner,revision:w.episode,humanMs:1000,botMs:3000,fallbackMs:10000}]:[]);}
 function reactionControl(s,actor,action){const u=s.data.uno;if(u.mode!=='manual')return null;
  if(!reactionTypes.includes(action.type))return null;
  if(action.type==='accuse-uno'&&(!Number.isInteger(action.target)||action.target<0||action.target>=s.playerCount||action.target===actor))return null;
  const target=action.type==='accuse-uno'?action.target:actor,situation=u.situations[target],episode=situation.episode,supplied=action.episode??episode;
  if(!Number.isSafeInteger(supplied)||supplied<0||supplied>episode)return null;
  const kind=action.type==='declare-uno'?'answer':'challenge',ignore=supplied<episode||(kind==='answer'?u.declared[actor]||situation.called||situation.settled:situation.settled||u.declared[target]);
  return {kind,episode,target,independent:true,ignore:!!ignore,command:{...action,episode:supplied}};
 }
 function perform(s,actor,a,events){const d=s.data;
  if(reactionTypes.includes(a.type)){react(s,actor,a,events);return;}
  d.uno.episode=s.revision;
  if(d.hands[actor].length!==1){d.uno.situations[actor]={episode:s.revision,open:false,settled:false,called:false};d.uno.calls=d.uno.calls.filter(i=>i!==actor);d.uno.penalties=d.uno.penalties.filter(i=>i!==actor);}
  if(a.type==='draw'){const got=draw(s,actor,1);syncPending(s);d.drawn=got[0]?.id||null;d.noDraw=!got.length;events.push(fact('drawn',actor,{count:got.length}));return;}
  if(a.type==='pass'){d.stalled=d.noDraw?d.stalled+1:0;d.drawn=null;d.noDraw=false;s.turn=nextPlayer(s,actor);events.push(fact('passed',actor));if(d.stalled>=s.playerCount-d.ending.groups.flat().length){s.status='finished';s.winners=[];events.push(fact('exhausted',null));}syncPending(s);return;}
  const at=d.hands[actor].findIndex(c=>c.id===a.card),card=d.hands[actor].splice(at,1)[0];d.discard.push(card);d.color=a.color||card.color;d.drawn=null;d.noDraw=false;d.stalled=0;
  const skip=card.value==='skip'||card.value==='reverse'&&s.playerCount-d.ending.groups.flat().length===2;
  events.push(fact('played',actor,{card,color:d.color,skipped:skip?nextPlayer(s,actor):null}));
  let steps=1;if(card.value==='reverse'){d.direction*=-1;if(s.playerCount-d.ending.groups.flat().length===2)steps=2;}if(card.value==='skip')steps=2;
  if(card.value==='+2'||card.value==='+4'){const target=nextPlayer(s,actor),count=draw(s,target,card.value==='+2'?2:4).length;events.push(fact('draw-skipped',target,{count,heavy:card.value==='+4'}));steps=2;}
  s.turn=nextPlayer(s,actor,steps);d.uno.declared[actor]=false;
  if(d.hands[actor].length===1){if(d.uno.mode==='manual'){d.uno.situations[actor]={episode:s.revision,open:true,settled:false,called:false};d.uno.pending=actor;}else{d.uno.declared[actor]=true;events.push(fact('declared',actor,{automatic:true,count:1}));}}
  if(!d.hands[actor].length){const points=d.hands.flat().reduce((sum,c)=>sum+(c.color==='wild'?50:/^\d$/.test(c.value)?Number(c.value):20),0);Ending.record(d.ending,[actor],s,'cards');d.points[actor]=points;events.push(fact('won',actor,{points}));
   if(d.ending.mode==='winner'||s.playerCount-d.ending.groups.flat().length<=1){s.status='finished';s.winners=Ending.winners(d.ending);}else if(Ending.done(d.ending,s.turn))s.turn=nextPlayer(s,actor);}syncPending(s);
 }
 function reduce(position,actor,action){const next=JSON.parse(JSON.stringify(position)),events=[];next.revision=(position.revision??0)+1;perform(next,actor,action,events);return {position:next,events,turnEnded:action.type==='play'||action.type==='pass'};}
 function project(position,viewer){const d=JSON.parse(JSON.stringify(position.data));d.hands=d.hands.map((hand,player)=>position.openHands||player===viewer?hand:hand.map(()=>({hidden:true})));d.drawPile=d.drawPile.map(()=>({hidden:true}));d.uno.declarationOpen=d.uno.situations.map(w=>w.open&&!w.settled&&!w.called);delete d.uno.pending;if(viewer!==position.turn)d.drawn=d.drawn===null?null:true;return d;}
 function localData(p){let position=p;const viewer=p.viewer,d=JSON.parse(JSON.stringify(p.data));position={...p,data:d};d.nextPlayerByCard={};d.turnPreviewByCard={};if(position.status==='playing'&&viewer===position.turn)for(const card of position.data.hands[viewer]){if(!canPlay(position,viewer,card))continue;const active=position.playerCount-position.data.ending.groups.flat().length,finished=position.data.hands[viewer].length===1&&(position.data.ending.mode==='winner'||active<=2),steps=['skip','+2','+4'].includes(card.value)||card.value==='reverse'&&active===2?2:1;d.nextPlayerByCard[card.id]=finished?null:nextPlayer(position,viewer,steps,card.value==='reverse'?-position.data.direction:position.data.direction);if(['skip','reverse','+2','+4'].includes(card.value))d.turnPreviewByCard[card.id]={nextPlayer:d.nextPlayerByCard[card.id],affected:[nextPlayer(position,viewer)],kind:card.value};}d.uno.declarationOpen=d.uno.situations.map(w=>w.open&&!w.settled&&!w.called);return d;}
 function localChoices(p){if(p.actor<0||p.status!=='playing')return [];return [...(p.actor===p.viewer?actions(p,p.actor):[]),...reactions(p,p.actor)];}
 function localReaction(p,c){return reactionControl(p,p.actor,c);}
 function bot(s,actor,actions,memory,context={}){
      const d = s.data, plays = actions.filter(a => a.type === 'play');
      if (!plays.length) return actions[0];
      const totals = Object.fromEntries(colors.map(c => [c, d.hands[actor].filter(card => card.color === c).length]));
      return plays.sort((a, b) => {
        const ca = d.hands[actor].find(c => c.id === a.card), cb = d.hands[actor].find(c => c.id === b.card);
        const threat=d.hands.some((h,i)=>i!==actor&&h.length<=2),power=c=>['skip','reverse','+2','+4'].includes(c.value)?1:0;return (context.depth===3&&threat?power(cb)-power(ca):0)||(cb.color !== 'wild')-(ca.color !== 'wild')||(context.depth===1?0:(totals[b.color]||0)-(totals[a.color]||0));
      })[0];
    }
 function observe(s){return {situations:s.data.uno.situations};}
 function declarationTiming(s,actor,settings,memory){
  // A stable episode decision: polling or another player's reaction must not reroll it.
  let hash=2166136261;for(const ch of `${actor}:${memory.situations[actor].episode}:${s.data.hands[actor].map(c=>c.id).join(',')}`)hash=Math.imul(hash^ch.charCodeAt(0),16777619)>>>0;
  const chance=hash/4294967296,[forget,late]=({easy:[.25,.70],medium:[.10,.45],hard:[.01,.08]})[settings?.difficulty||'medium'];
  return {skip:chance<forget,delay:chance<late?1200+hash%1401:0};
 }
 function botReactionDelay(s,actor,settings,memory){return declarationTiming(s,actor,settings,memory).delay;}
 function botReaction(s,actor,actions,memory,settings){const u=s.data.uno;if(s.data.hands[actor].length===1&&!u.declared[actor]&&!u.calls.includes(actor)&&!declarationTiming(s,actor,settings,memory).skip)return actions.find(a=>a.type==='declare-uno');const target=memory.situations.findIndex((w,i)=>i!==actor&&w.open&&!w.settled&&!u.declared[i]);return target<0?null:actions.find(a=>a.type==='accuse-uno'&&a.target===target);}
 const score=s=>s.data.points;
 const result=s=>({winners:s.winners,...Ending.result(s.data.ending),places:Ending.places(s.data.ending,s.data.points),metrics:[{id:'points',values:s.data.points},{id:'hand-count',values:s.data.hands.map(hand=>hand.length)}]});
 return Object.freeze({contractVersion:1,id:'uno',turnOrder:p=>({players:Array.from({length:p.playerCount},(_,i)=>i).filter(i=>!Ending.done(p.data.ending,i)),direction:p.data.direction}),minPlayers:2,maxPlayers:6,create,validate,actions,localChoices,localData,localReaction,reactions,reactionWindows,reactionControl,reduce,project,bot,botReaction,botReactionDelay,observe,score,result});
});
