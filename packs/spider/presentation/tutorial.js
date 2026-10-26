/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"spider"+'.tutorial.'+id,params:{}})});
 const tutorial=({state})=>({steps:[step("target","[data-drop-piece][data-action]",["move"]),{...step("card","[data-drag-piece]",undefined),interaction:true,actions:["move"]},step("deal",command("draw"),["draw"]),step("undo",command("undo"),["undo"]),{...step("hint",'[data-view-key="hint"]'),interaction:true}]});
 tutorial.revisions={};
 tutorial.goals=["target","card","deal","undo","hint"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"spider.tutorial."+id,params:{}})}));
 return tutorial;
});
