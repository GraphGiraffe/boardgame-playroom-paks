/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"uno"+'.tutorial.'+id,params:{}})});
 const tutorial=({state,viewer,actions=[]})=>{
  const scene=state.scene,open=scene.declarationOpen||[],canDeclare=!!open[viewer]&&!scene.declared?.[viewer];
  const targets=open.flatMap((active,id)=>active&&id!==viewer&&!scene.declared?.[id]?[id]:[]);
  const challengeSelector=targets.map(id=>`[data-player-target="${id}"]`).join(',')||':not(*)';
  return {concurrent:(canDeclare||targets.length>0)&&actions.some(a=>['declare-uno','accuse-uno'].includes(a.type)),steps:[
   {...step('declare-uno',command('declare-uno'),undefined,a=>a.type==='declare-uno'&&canDeclare),available:canDeclare,immediate:true},
   {...step('accuse-uno',command('accuse-uno'),undefined,a=>a.type==='accuse-uno'&&targets.includes(a.target)),available:targets.length>0},
   {...step('challenge-player',challengeSelector,undefined,a=>a.type==='accuse-uno'&&targets.includes(a.target)),interaction:true,available:targets.length>0},
   step('color','.color-choice[data-action]',undefined,a=>a.type==='play'&&a.color!=null),
   step('table','.uno-drop-target[data-action]',['play']),
   {...step('card','.hand-card.is-playable, .hand-card[data-action]',['play']),interaction:true},
   {...step('help','[data-command="card-help"]'),available:state.turn===viewer},step('draw',command('draw'),['draw']),step('pass',command('pass'),['pass'])]};
 };
 tutorial.revisions={};
 tutorial.goals=["color","table","card","draw","pass","declare-uno","accuse-uno","challenge-player","help"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"uno.tutorial."+id,params:{}})}));
 return tutorial;
});
