(function(E){
 'use strict';
 const categories=['ones','twos','threes','fours','fives','sixes','pair','twoPairs','three','four','smallStraight','largeStraight','fullHouse','chance','yatzy'];
 const labels=['Единицы','Двойки','Тройки','Четвёрки','Пятёрки','Шестёрки','Пара','Две пары','Три одинаковых','Четыре одинаковых','Малый стрит','Большой стрит','Фул-хаус','Шанс','Ятзи'];
 function value(dice,key){const counts=Array.from({length:7},(_,n)=>dice.filter(d=>d===n).length),sum=dice.reduce((a,b)=>a+b,0),groups=counts.map((n,i)=>({n,i})).filter(g=>g.n>0);
  if(categories.indexOf(key)<6)return counts[categories.indexOf(key)+1]*(categories.indexOf(key)+1);
  if(key==='pair')return 2*Math.max(0,...groups.filter(g=>g.n>=2).map(g=>g.i));
  if(key==='twoPairs'){const p=groups.filter(g=>g.n>=2).map(g=>g.i).sort((a,b)=>b-a);return p.length>=2?2*(p[0]+p[1]):0;}
  if(key==='three'||key==='four')return Number(key==='three'?3:4)*Math.max(0,...groups.filter(g=>g.n>=Number(key==='three'?3:4)).map(g=>g.i));
  if(key==='smallStraight')return [1,2,3,4,5].every(n=>counts[n]===1)?15:0;
  if(key==='largeStraight')return [2,3,4,5,6].every(n=>counts[n]===1)?20:0;
  if(key==='fullHouse')return groups.length===2&&groups.some(g=>g.n===3)&&groups.some(g=>g.n===2)?sum:0;
  if(key==='chance')return sum;
  return groups.some(g=>g.n===5)?50:0;
 }
 function total(row){const upper=categories.slice(0,6).reduce((n,k)=>n+(row[k]||0),0);return categories.reduce((n,k)=>n+(row[k]||0),0)+(upper>=63?50:0);}
 E.register({id:'yatzy',version:'0.1.4',name:'Ятзи',min:2,max:4,scoreLabel:'победы',
  description:'Классический Ятзи: 15 категорий, три броска за ход и бонус 50 за верхнюю секцию.',
  presets:[{id:'classic',label:'Классика · 15 категорий'}],
  rules:['За ход можно бросить пять кубиков до трёх раз, придерживая нужные.','После броска заполните одну свободную категорию, даже если она принесёт ноль.','Верхняя секция даёт бонус 50 при сумме от 63. Ятзи из пяти одинаковых приносит 50.','Стриты: 1–5 = 15, 2–6 = 20. Фул-хаус — сумма пяти кубиков.'],
  create(s,o={}){s.turn=o.resolvedFirstPlayer??0;s.data={dice:[1,1,1,1,1],held:[false,false,false,false,false],rolls:0,scores:s.players.map(()=>({})),round:0};},
  validateState(s){const d=s.data;E.assertState(Array.isArray(d.dice)&&d.dice.length===5&&d.dice.every(n=>Number.isInteger(n)&&n>=1&&n<=6),'кубики');E.assertState(Array.isArray(d.held)&&d.held.length===5&&d.held.every(v=>typeof v==='boolean')&&Number.isInteger(d.rolls)&&d.rolls>=0&&d.rolls<=3,'броски');E.assertState(Array.isArray(d.scores)&&d.scores.length===s.players.length&&d.scores.every(row=>row&&typeof row==='object'&&Object.keys(row).every(k=>categories.includes(k)&&Number.isInteger(row[k])&&row[k]>=0&&row[k]<=50)),'таблица очков');E.assertState(Number.isInteger(d.round)&&d.round>=0&&d.round<=15*s.players.length,'раунд');},
  legal(s,actor){const d=s.data;if(d.rolls===0)return [{type:'roll',label:'Бросить кубики'}];const a=[];if(d.rolls<3){a.push({type:'roll',label:'Перебросить свободные'});d.held.forEach((_,index)=>a.push({type:'hold',index,label:`Придержать кубик ${index+1}`}));}categories.forEach((key,i)=>{if(d.scores[actor][key]===undefined)a.push({type:'score',key,label:`${labels[i]} · ${value(d.dice,key)}`});});return a;},
  apply(s,actor,a){const d=s.data;if(a.type==='hold'){d.held[a.index]=!d.held[a.index];return;}if(a.type==='roll'){d.dice=d.dice.map((n,i)=>d.rolls===0||!d.held[i]?E.rollDie(6,s):n);d.rolls++;E.event(s,`${s.players[actor].name} бросил кубики (${d.rolls}/3)`,actor,'roll');return;}const hadBonus=categories.slice(0,6).reduce((n,k)=>n+(d.scores[actor][k]||0),0)>=63;d.scores[actor][a.key]=value(d.dice,a.key);E.event(s,`${s.players[actor].name}: ${a.label}`,actor,'action',{sound:{id:!d.scores[actor][a.key]?'notify':a.key==='yatzy'?'success.yatzy':categories.indexOf(a.key)<6||a.key==='chance'?'success':'success.special'}});if(!hadBonus&&categories.slice(0,6).reduce((n,k)=>n+(d.scores[actor][k]||0),0)>=63)E.event(s,`${s.players[actor].name}: бонус 50`,actor,'action',{sound:{id:'success.special'}});d.round++;d.rolls=0;d.held.fill(false);if(d.round===15*s.players.length){const totals=d.scores.map(total),top=Math.max(...totals),winners=totals.flatMap((n,i)=>n===top?[i]:[]);E.finish(s,winners.length===1?winners[0]:winners.length===s.players.length?null:winners,`Игра окончена. Лучший результат: ${top}`);}else s.turn=(actor+1)%s.players.length;},
  project(out){out.data.totals=out.data.scores.map(total);out.data.upper=out.data.scores.map(row=>categories.slice(0,6).reduce((sum,key)=>sum+(row[key]||0),0));out.data.bonuses=out.data.upper.map(n=>n>=63?50:0);},
  bot(s,actor,actions){const d=s.data;if(d.rolls===0)return actions.find(a=>a.type==='roll');if(d.rolls<3&&d.dice.filter(n=>n===Math.max(...d.dice)).length<4)return actions.find(a=>a.type==='roll');return actions.filter(a=>a.type==='score').sort((a,b)=>value(d.dice,b.key)-value(d.dice,a.key))[0];}
 });
})(globalThis.TabletopCore);
