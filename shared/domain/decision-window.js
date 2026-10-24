// Hidden plans live in authority; describe exports only readiness and revisions.
(function(r,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;r.PlayroomDecisionWindow=a;})(globalThis,function(){
 'use strict';
 const validActor=p=>Number.isSafeInteger(p)&&p>=0&&p<64;
 function validate(w){
  if(!w||typeof w.id!=='string'||!/^[a-zA-Z0-9_.:-]{1,128}$/.test(w.id)||
    !Array.isArray(w.participants)||w.participants.some(p=>!validActor(p))||
    new Set(w.participants).size!==w.participants.length||!w.plans||!w.versions||
    w.participants.some(p=>!Number.isSafeInteger(w.versions[p])||w.versions[p]<0))throw Error('DECISION_WINDOW_INVALID');
  return w;
 }
 function create(id,participants){return validate({id,participants:[...participants],plans:{},versions:Object.fromEntries(participants.map(p=>[p,0]))});}
 function describe(w){validate(w);return {id:w.id,participants:[...w.participants],ready:w.participants.filter(p=>w.plans[p]!=null),versions:Object.fromEntries(w.participants.map(p=>[p,w.versions[p]]))};}
 function put(w,actor,plan){
  validate(w);
  if(!w.participants.includes(actor))throw Error('DECISION_ACTOR_INVALID');
  if(w.versions[actor]===Number.MAX_SAFE_INTEGER)throw Error('DECISION_VERSION_OVERFLOW');
  // Clone before mutation: malformed input cannot consume a decision revision.
  const copy=plan===null?null:JSON.parse(JSON.stringify(plan));
  if(copy===null)delete w.plans[actor];else w.plans[actor]=copy;
  w.versions[actor]++;return w.participants.every(p=>w.plans[p]!=null);
 }
 return Object.freeze({create,describe,put});
});
