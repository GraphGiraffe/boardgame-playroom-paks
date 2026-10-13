(function(E){
 'use strict';const suits=['♠','♥','♦','♣'],key=c=>c.joker?'joker':`${c.rank}-${['♥','♦'].includes(c.suit)?'red':'black'}`;
 function deck(size){const out=[];for(let rank=size===36?6:2;rank<=14;rank++)for(const suit of suits)if(!(rank===12&&suit==='♣'))out.push({id:`${suit}${rank}`,suit,rank});if(size===54)for(const color of ['red','black'])out.push({id:`joker-${color}`,suit:'★',rank:15,joker:true,color});return out;}
 function discard(s,p){const d=s.data,groups={};for(const c of d.hands[p])(groups[key(c)]??=[]).push(c);for(const group of Object.values(groups))while(group.length>=2){const ids=new Set(group.splice(0,2).map(c=>c.id));d.hands[p]=d.hands[p].filter(c=>!ids.has(c.id));d.discard.push(...deck(d.deckSize).filter(c=>ids.has(c.id)));}}
 function next(d,from){for(let i=1;i<=d.hands.length;i++){const p=(from+i)%d.hands.length;if(d.hands[p].length)return p;}return from;}
 function settle(s){const d=s.data,active=d.hands.flatMap((h,i)=>h.length?[i]:[]);if(active.length<=1){const loser=active[0],winners=s.players.flatMap((_,i)=>i===loser?[]:[i]);E.finish(s,winners,`${s.players[loser].name} остался с Акулиной`);return true;}return false;}
 E.register({id:'oldmaid',version:'0.1.1',name:'Акулина',min:2,max:6,scoreLabel:'победы',description:'Тяните карту вслепую у соседа и сбрасывайте пары.',
  presets:[{id:'classic',label:'Классика'}],
  rules:['Из исходной колоды заранее убрана дама треф. Дама пик остаётся Акулиной.','Пары — одинаковый ранг и цвет масти; два джокера также пара.','В свой ход вслепую вытяните карту у следующего игрока с картами. Совпавшая пара сразу сбрасывается.','Выигрывают все, кто избавился от карт; проигрывает оставшийся с Акулиной.'],
  create(s,o={}){const size=[36,52,54].includes(Number(o.deck))?Number(o.deck):36,cards=E.shuffle(deck(size),s),hands=s.players.map(()=>[]);cards.forEach((c,i)=>hands[i%hands.length].push(c));s.data={deckSize:size,hands,discard:[]};for(let p=0;p<hands.length;p++)discard(s,p);s.turn=o.resolvedFirstPlayer??0;if(!hands[s.turn].length)s.turn=next(s.data,s.turn);settle(s);},
  validateState(s){const d=s.data,valid=deck(d.deckSize);E.assertState([36,52,54].includes(d.deckSize)&&Array.isArray(d.hands)&&d.hands.length===s.players.length,'колода');E.validateComponents([...d.hands,d.discard],c=>valid.some(x=>x.id===c.id),d.deckSize-1);E.assertState(d.hands.every(h=>{const keys=h.map(key);return new Set(keys).size===keys.length;}),'несброшенные пары');},
  legal(s,actor){const target=next(s.data,actor);return target===actor?[]:s.data.hands[target].map((_,cardIndex)=>({type:'draw',target,cardIndex,targetKind:'player',targetChoice:'card',label:`Вытянуть карту ${cardIndex+1} у ${s.players[target].name}`}));},
  apply(s,actor,a){const d=s.data,from=d.hands[a.target],at=a.cardIndex,card=from.splice(at,1)[0];d.hands[actor].push(card);E.random(s);E.event(s,`${s.players[actor].name} вытянул карту у ${s.players[a.target].name}`,actor,'draw',{privateTo:actor,publicText:`${s.players[actor].name} вытянул карту`});discard(s,actor);if(settle(s))return;s.turn=next(d,actor);},
  bot(s,actor,actions){return actions[Math.floor((s.rng/4294967296)*actions.length)];}
 });
})(globalThis.TabletopCore);
