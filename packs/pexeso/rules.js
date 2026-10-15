(function(E){
 'use strict';
 const pair=c=>c.joker?'joker':`${c.rank}-${['♥','♦'].includes(c.suit)?'red':'black'}`;
 const Deck = globalThis.PlayroomPackDomain?.standardDeck || (typeof require === 'function' ? require('../../shared/domain/standard-deck.js') : null);
 const deck = size => Deck.create(size);
 E.register({id:'pexeso',version:'0.1.6',stateVersion:2,name:'Пексесо',min:2,max:4,scoreLabel:'победы',
  result(s){return {label:'Найдено пар',values:s.data.scores.slice()};},
  description:'Парная игра на память со стандартными игральными картами.',
  presets:[{id:'easy',label:'Легко · 8 пар'},{id:'medium',label:'Средне · 12 пар'},{id:'hard',label:'Сложно · 18 пар'},{id:'full',label:'Вся колода'}],
  rules:['Пара — одинаковый ранг и цвет масти: черви с бубнами, пики с трефами. Два джокера тоже образуют пару.','За ход откройте две карты. Совпали — заберите пару и ходите ещё; не совпали — запомните карты до конца хода. Перед ходом следующего игрока они закрываются без отдельной кнопки.','Побеждает собравший больше пар.'],
  create(s,o={}){const size=[36,52,54].includes(Number(o.deck))?Number(o.deck):52,all=deck(size),groups=Object.groupBy?Object.groupBy(all,pair):all.reduce((m,c)=>((m[pair(c)]??=[]).push(c),m),{}),keys=E.shuffle(Object.keys(groups),s),count=s.preset==='easy'?8:s.preset==='medium'?12:s.preset==='hard'?18:keys.length,chosen=keys.slice(0,Math.min(count,keys.length));s.turn=o.resolvedFirstPlayer??0;s.data={deckSize:size,board:E.shuffle(chosen.flatMap(k=>groups[k]),s),matched:[],flipped:[],phase:'first',scores:s.players.map(()=>0),seen:{}};},
  validateState(s){const d=s.data,full=deck(d.deckSize);E.assertState([36,52,54].includes(d.deckSize)&&Array.isArray(d.board)&&d.board.length%2===0&&d.board.length>=16&&d.board.length<=d.deckSize,'колода памяти');E.assertState(new Set(d.board.map(c=>c.id)).size===d.board.length&&d.board.every(c=>full.some(x=>x.id===c.id)),'карты памяти');E.assertState(Array.isArray(d.matched)&&new Set(d.matched).size===d.matched.length&&d.matched.every(i=>Number.isInteger(i)&&i>=0&&i<d.board.length),'пары');E.assertState(Array.isArray(d.flipped)&&d.flipped.length<=2&&new Set(d.flipped).size===d.flipped.length&&d.flipped.every(i=>Number.isInteger(i)&&i>=0&&i<d.board.length&&!d.matched.includes(i)),'открытые карты');E.assertState(['first','second','reveal'].includes(d.phase)&&d.flipped.length==={first:0,second:1,reveal:2}[d.phase],'фаза');E.assertState(Array.isArray(d.scores)&&d.scores.length===s.players.length&&d.scores.every(n=>Number.isInteger(n)&&n>=0)&&d.scores.reduce((a,b)=>a+b,0)*2===d.matched.length,'счёт');},
  legal(s){const d=s.data;return d.board.flatMap((_,index)=>!d.matched.includes(index)&&(d.phase==='reveal'||!d.flipped.includes(index))?[{type:'flip',index,label:`Открыть карту ${index+1}`}]:[]);},
  apply(s,actor,a){const d=s.data;if(d.phase==='reveal'){d.flipped=[];d.phase='first';}d.flipped.push(a.index);d.seen[a.index]=d.board[a.index].id;E.event(s,`${s.players[actor].name} открыл карту ${a.index+1}`,actor,'play',{presentation:{type:'flip',index:a.index}});if(d.flipped.length===1){d.phase='second';return;}const [i,j]=d.flipped;if(pair(d.board[i])===pair(d.board[j])){d.matched.push(i,j);d.scores[actor]++;d.flipped=[];d.phase='first';E.event(s,`${s.players[actor].name} нашёл пару`,actor,'capture',{sound:{id:'success'}});if(d.matched.length===d.board.length){const high=Math.max(...d.scores),winners=d.scores.flatMap((n,p)=>n===high?[p]:[]);E.finish(s,winners.length===s.players.length?null:winners.length===1?winners[0]:winners,'Все пары найдены');}}else{d.phase='reveal';s.events.at(-1).presentation.closeAfter=600;s.turn=(actor+1)%s.players.length;E.event(s,'Карты не совпали',actor,'action',{sound:{id:'mismatch'}});}},
  project(out){out.data.board=out.data.board.map((c,i)=>out.data.matched.includes(i)||out.data.flipped.includes(i)?c:{hidden:true});delete out.data.seen;},
  bot(s,actor,actions){
    // Memory contains only cards revealed publicly in earlier actions. Never
    // inspect an unknown board face, even while deliberately making a mistake.
    const d=s.data,cards=new Map(deck(d.deckSize).map(card=>[card.id,card]));
    const knownCard=index=>cards.get(d.seen[index]);
    const known=actions.filter(action=>knownCard(action.index));
    const unseen=actions.filter(action=>!knownCard(action.index));
    const explore=pool=>{
      const options=pool?.length?pool:unseen.length?unseen:actions;
      return options[(s.move+actor)%options.length];
    };
    const mistake=((s.rng^Math.imul(s.move+1,0x9e3779b9))>>>0)%5===0;
    if(d.phase==='second'){
      const wanted=pair(knownCard(d.flipped[0]));
      const match=known.find(action=>pair(knownCard(action.index))===wanted);
      const alternatives=actions.filter(action=>!knownCard(action.index)||pair(knownCard(action.index))!==wanted);
      return match&&(!mistake||!alternatives.length)?match:explore(alternatives);
    }
    for(const action of known){
      const match=known.find(other=>other.index!==action.index&&pair(knownCard(action.index))===pair(knownCard(other.index)));
      if(match&&!mistake)return action;
    }
    return explore();
  }

 });
})(globalThis.TabletopCore);
