// Category identity and numeric scoring are shared by domain and presentation.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomYatzyCategories=api;
})(globalThis,function(){
  'use strict';
  const categories=Object.freeze(['ones','twos','threes','fours','fives','sixes','pair','twoPairs','three','four','smallStraight','largeStraight','fullHouse','chance','yatzy']);
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
  const upper=row=>categories.slice(0,6).reduce((sum,key)=>sum+(row[key]||0),0);
  return Object.freeze({keys:categories,value,total,upper});
});
