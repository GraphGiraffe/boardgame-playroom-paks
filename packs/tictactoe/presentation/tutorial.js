/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"tictactoe"+'.tutorial.'+id,params:{}})});
 const tutorial=({state})=>({steps:[step("cell",".ttt-cell[data-action]",["place"])]});
 tutorial.revisions={};
 tutorial.goals=["cell"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"tictactoe.tutorial."+id,params:{}})}));
 return tutorial;
});
