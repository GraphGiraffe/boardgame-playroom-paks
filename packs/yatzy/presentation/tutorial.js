/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"yatzy"+'.tutorial.'+id,params:{}})});
 const tutorial=({state})=>({required:['roll','reroll','hold','release','score'],steps:[
  step('hold','.yatzy-dice [data-action][aria-pressed="false"]',undefined,a=>a.type==='hold'&&!state.scene.dice[a.index]?.held),
  step(state.scene.rolls?'reroll':'roll','.yatzy-roll[data-action]',['roll']),
  step('score','.yatzy-score [data-action]',['score']),
  step('release','.yatzy-dice [data-action][aria-pressed="true"]',undefined,a=>a.type==='hold'&&state.scene.dice[a.index]?.held)]});
 tutorial.revisions={};
 tutorial.goals=["hold","score","roll","reroll","release"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"yatzy.tutorial."+id,params:{}})}));
 return tutorial;
});
