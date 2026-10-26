/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"durak"+'.tutorial.'+id,params:{}})});
 const tutorial=({state})=>({steps:[{...step("card",".hand-card.is-playable, .hand-card[data-action]",undefined),interaction:true,actions:["attack","defend","transfer","exchange"]},step("attack",command("attack"),["attack"]),step("defend",command("defend"),["defend"]),step("transfer",command("transfer"),["transfer"]),step("take",command("take"),["take"]),step("done",command("done"),["done"]),step("confirm",command("confirm"),["confirm"]),step("undo",command("undo"),["undo"]),step("exchange",command("exchange"),["exchange"])]});
 tutorial.revisions={};
 tutorial.goals=["card","attack","defend","transfer","take","done","confirm","undo","exchange"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"durak.tutorial."+id,params:{}})}));
 return tutorial;
});
