/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"pexeso"+'.tutorial.'+id,params:{}})});
 const tutorial=({state})=>({required:['first','second'],steps:[step(state.scene.selectionCount===1?'second':'first',command('flip'),['flip'])]});
 tutorial.revisions={};
 tutorial.goals=["first","second"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"pexeso.tutorial."+id,params:{}})}));
 return tutorial;
});
