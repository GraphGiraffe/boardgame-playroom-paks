/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"oldmaid"+'.tutorial.'+id,params:{}})});
 const tutorial=({state})=>({steps:[step("card",".card-choice-dialog [data-card-index]",["draw"]),{...step("opponent","[data-player-target]",undefined),interaction:true,actions:["draw"]}]});
 tutorial.revisions={};
 tutorial.goals=["opponent","card"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"oldmaid.tutorial."+id,params:{}})}));
 return tutorial;
});
