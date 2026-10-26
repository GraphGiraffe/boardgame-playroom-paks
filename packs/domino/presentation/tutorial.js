/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"domino"+'.tutorial.'+id,params:{}})});
 const tutorial=({state})=>({steps:[step("table","[data-drop-piece][data-action]",["play"]),{...step("card",".hand-card.is-playable, .hand-card[data-action]",undefined),interaction:true,actions:["play"]},step("draw",command("draw"),["draw"]),step("pass",command("pass"),["pass"])]});
 tutorial.revisions={};
 tutorial.goals=["table","card","draw","pass"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"domino.tutorial."+id,params:{}})}));
 return tutorial;
});
