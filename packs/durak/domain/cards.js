(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomDurakCards=api;})(globalThis,function(){
 'use strict';
 const color=s=>['♥','♦'].includes(s)?'red':'black';
 function spec(o={}){const variant=['simple','throwin','transfer'].includes(o.variant)?o.variant:'throwin';return {variant,size:[36,52,54].includes(Number(o.deck))?Number(o.deck):54,mode:o.jokerMode==='universal'?'universal':'color',handSize:variant==='simple'?5:6,endMode:o.endMode==='winner'?'winner':'last'};}
 function beats(card,attack,d){const trump=d.trump.suit;if(d.jokerMode==='universal'){if(card.joker)return !attack.joker||card.color==='red'&&attack.color==='black';if(attack.joker)return false;}else if(d.deckSize===54){const tc=color(trump);if(card.joker){if(attack.joker)return card.color===tc&&attack.color!==tc;return card.color===tc||color(attack.suit)===card.color&&attack.suit!==trump;}if(attack.joker)return attack.color!==tc&&card.suit===trump;}
  return card.suit===attack.suit?card.rank>attack.rank:card.suit===trump&&attack.suit!==trump;}
 function active(d){return d.hands.flatMap((h,i)=>h.length?[i]:[]);}
 function next(d,from,exclude=[]){for(let k=1;k<=d.hands.length;k++){const i=(from+k)%d.hands.length;if(d.hands[i].length&&!exclude.includes(i))return i;}return null;}
 function attackers(d){if(d.variant==='simple')return [d.attacker];const out=[];for(let k=0;k<d.hands.length;k++){const i=(d.attacker+k)%d.hands.length;if(i!==d.defender&&(i===d.attacker||d.hands[i].length))out.push(i);}return out;}
 function nextAttacker(d,from){const arr=attackers(d),at=arr.indexOf(from);return arr[(at+1)%arr.length];}
 function validOpening(table){const counts={};for(const p of table)counts[p.attack.rank]=(counts[p.attack.rank]||0)+1;return [1,3,5].includes(table.length)&&Object.values(counts).reduce((sum,n)=>sum+Math.floor(n/2),0)>=(table.length-1)/2;}

 return Object.freeze({spec,beats,active,next,attackers,nextAttacker,validOpening});
});
