// Hidden plans live in game state; this descriptor contains public readiness only.
(function(r,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;r.PlayroomDecisionWindow=a;})(globalThis,function(){
 function create(id,participants){return {id,participants:[...participants],plans:{},versions:Object.fromEntries(participants.map(p=>[p,0]))};}
 function describe(w){return {id:w.id,participants:[...w.participants],ready:w.participants.filter(p=>w.plans[p]!=null),versions:{...w.versions}};}
 function put(w,actor,plan){if(!w.participants.includes(actor))throw Error('DECISION_ACTOR_INVALID');if(plan===null)delete w.plans[actor];else w.plans[actor]=JSON.parse(JSON.stringify(plan));w.versions[actor]++;return w.participants.every(p=>w.plans[p]!=null);}
 return Object.freeze({create,describe,put});
});
