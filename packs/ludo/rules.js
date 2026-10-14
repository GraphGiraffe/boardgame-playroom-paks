(function(E){
 'use strict';const starts=[0,13,26,39],safe=new Set([...starts,...starts.map(n=>(n+8)%52)]),home=p=>p.every(n=>n===57),team=i=>i%2,partner=i=>(i+2)%4;
 const globalCell=(owner,progress)=>(starts[owner]+progress)%52;
 const owners=(s,actor)=>s.preset==='teams'&&home(s.data.pawns[actor])?[partner(actor)]:[actor];
 const stranded=(s,actor)=>owners(s,actor).every(p=>s.data.pawns[p].every(n=>n<0||n===57));
 function moves(s,actor){const d=s.data;if(d.phase!=='move')return [];const out=[];
  d.dice.forEach((die,dieIndex)=>{if(d.used[dieIndex])return;for(const owner of owners(s,actor))for(let pawn=0;pawn<4;pawn++){const from=d.pawns[owner][pawn],exit=from<0&&(die===6||d.guarantee),to=exit?0:from>=0&&from<57&&from+die<=57?from+die:null;if(to!==null)out.push({type:'move',owner,pawn,dieIndex,label:`Кубик ${dieIndex+1} (${die}): фишка ${pawn+1} → ${to===57?'дом':to}`});}});return out;
 }
 function completeBatch(s,actor){const d=s.data;d.phase='roll';d.die=null;d.guarantee=false;
  const repeat=d.sixReroll?d.dice.flatMap((n,i)=>n===6?[i]:[]):[];d.rollIndices=repeat;
  if(!repeat.length){s.turn=(actor+1)%s.players.length;d.rollIndices=Array.from({length:d.diceCount},(_,i)=>i);}
 }
 E.register({id:'ludo',version:'0.1.11',stateVersion:2,name:'Лудо',min:2,max:4,scoreLabel:'победы',description:'Четыре фишки домой, один–три независимых кубика.',
  result(s){const details=s.data.pawns.map(row=>row.filter(n=>n===57).length),values=s.preset==='teams'?details.map((_,i)=>details[i%2]+details[i%2+2]):details;return {label:s.preset==='teams'?'Фишек команды дома':'Фишек дома',values,...(s.preset==='teams'?{detailLabel:'Свои фишки дома',details}:{})};},
  presets:[{id:'classic',label:'Каждый за себя · 2–4 игрока'},{id:'teams',label:'Команды 2 на 2 · 4 игрока'}],
  rules:['Бросается N кубиков. Каждый используется отдельно; выберите фишку, затем нажмите на подсвеченную клетку. Фишка на базе выходит одним нажатием. До нажатия на клетку можно менять выбранную фишку. Одной фишкой можно ходить несколько раз; ход продолжается, пока доступны кубики и ходы.','Шестёрка выводит фишку с базы. Если включён переброс шестёрок, после использования набора перебрасываются только эти кубики.','Гарантированный выход: если все незавершённые фишки на базе, третий неудачный набор разрешает вывести одну фишку любым одним кубиком. После выхода ход сразу заканчивается, остальные кубики не используются.','Стрелки на внешнем крае показывают старт и направление движения; перед стартом своего цвета фишка сворачивает в цветную дорожку к дому. Стартовые клетки и клетки со звёздами безопасны: на них чужие фишки не сбиваются. На остальных клетках чужая фишка возвращается на базу. В дом нужен точный бросок.','В командах союзники сидят напротив; после финиша своих фишек игрок двигает фишки партнёра.'],
  create(s,o={}){if(s.preset==='teams'&&s.players.length!==4)throw Error('Командный Лудо требует ровно четырёх игроков');const diceCount=[1,2,3].includes(Number(o.diceCount))?Number(o.diceCount):1;s.turn=o.resolvedFirstPlayer??0;s.data={pawns:s.players.map(()=>[o.startPawn==='on'?0:-1,-1,-1,-1]),diceCount,sixReroll:o.sixReroll!=='off',guaranteedExit:o.guaranteedExit!=='off',failed:s.players.map(()=>0),guarantee:false,dice:Array(diceCount).fill(1),used:Array(diceCount).fill(true),rollIndices:Array.from({length:diceCount},(_,i)=>i),phase:'roll',die:null,lastRoll:null,last:null};},
  validateState(s){const d=s.data;E.assertState(s.preset!=='teams'||s.players.length===4,'командный состав');E.assertState(Array.isArray(d.pawns)&&d.pawns.length===s.players.length&&d.pawns.every(p=>Array.isArray(p)&&p.length===4&&p.every(n=>Number.isInteger(n)&&n>=-1&&n<=57)),'фишки');E.assertState([1,2,3].includes(d.diceCount)&&d.dice.length===d.diceCount&&d.dice.every(n=>Number.isInteger(n)&&n>=1&&n<=6)&&d.used.length===d.diceCount&&d.used.every(n=>typeof n==='boolean')&&['roll','move'].includes(d.phase),'кубики');E.assertState(d.failed.length===s.players.length&&d.failed.every(n=>Number.isInteger(n)&&n>=0&&n<=3)&&typeof d.guarantee==='boolean','гарантия старта');},
  legal(s,actor){return s.data.phase==='roll'?[{type:'roll',label:'Бросить кубики'}]:moves(s,actor);},
  apply(s,actor,a){const d=s.data;if(a.type==='roll'){
    d.lastRolled=d.rollIndices.slice();d.used.fill(true);for(const i of d.rollIndices){d.dice[i]=E.rollDie(6,s);d.used[i]=false;}d.die=d.dice[d.rollIndices[0]];d.lastRoll=d.die;d.phase='move';d.last=null;
    if(stranded(s,actor)&&!d.rollIndices.some(i=>d.dice[i]===6)){d.failed[actor]=Math.min(3,d.failed[actor]+1);d.guarantee=d.guaranteedExit&&d.failed[actor]>=3;}else{d.failed[actor]=0;d.guarantee=false;}
    E.event(s,`${s.players[actor].name} выбросил ${d.rollIndices.map(i=>d.dice[i]).join(', ')}`,actor,'roll');if(!moves(s,actor).length)completeBatch(s,actor);return;
   }
   const die=d.dice[a.dieIndex],from=d.pawns[a.owner][a.pawn],guaranteed=from<0&&die!==6&&d.guarantee,to=from<0?0:from+die;d.used[a.dieIndex]=true;d.pawns[a.owner][a.pawn]=to;d.last={owner:a.owner,pawn:a.pawn,from,to,die,captured:[]};
   if(from<0){d.guarantee=false;d.failed[actor]=0;}
   if(to<52&&!safe.has(globalCell(a.owner,to))){const cell=globalCell(a.owner,to);for(let p=0;p<d.pawns.length;p++)if(p!==a.owner&&!(s.preset==='teams'&&team(p)===team(a.owner)))for(let j=0;j<4;j++)if(d.pawns[p][j]>=0&&d.pawns[p][j]<52&&globalCell(p,d.pawns[p][j])===cell){d.last.captured.push({owner:p,pawn:j,from:d.pawns[p][j]});d.pawns[p][j]=-1;E.event(s,`${s.players[a.owner].name} сбил фишку ${s.players[p].name}`,actor,'capture');}}
   E.event(s,`${s.players[a.owner].name}: фишка ${a.pawn+1} → ${to===57?'дом':to}`,actor,'move',{sound:{id:to===57?'success.special':from<0?'success':'move'}});
   const members=s.preset==='teams'?[team(a.owner),team(a.owner)+2]:[a.owner];if(members.every(p=>home(d.pawns[p]))){E.finish(s,members,`${members.map(p=>s.players[p].name).join(' и ')} дома`);return;}
   if(guaranteed)d.used.fill(true);
   if(guaranteed||!moves(s,actor).length)completeBatch(s,actor);
  },
  bot(s,actor,actions){return actions.filter(a=>a.type==='move').sort((a,b)=>{const score=a=>s.data.pawns[a.owner][a.pawn]<0?70:s.data.pawns[a.owner][a.pawn]+s.data.dice[a.dieIndex];return score(b)-score(a);})[0]||actions[0];}
 });
})(globalThis.TabletopCore);
