/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"snakes"+'.tutorial.'+id,params:{}})});
 const tutorial=({state,viewer})=>{
 const extra=state.events?.findLast(e=>e.type==='snakes.extra'||e.type==='snakes.rolled'),double=extra?.type==='snakes.extra'&&extra.params?.reason==='double'&&(extra.player??extra.actor)===viewer;
 const plus=state.preset!=='classic';
 return {required:plus?['roll','move','double','adjust']:['roll'],steps:[step(double?'double':'roll',command('roll'),['roll']),...(state.scene.adjusting?[{...step('adjust','[data-view-key="adjustDelta"]',undefined,a=>a.type==='move'&&a.delta!==0),interaction:true}]:[]),step('move',command('move'),['move'])]};
 };
 tutorial.revisions={};
 tutorial.goals=["roll","move","double","adjust"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"snakes.tutorial."+id,params:{}})}));
 return tutorial;
});
