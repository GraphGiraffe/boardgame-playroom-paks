/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"gofish"+'.tutorial.'+id,params:{}})});
 const tutorial=({actions=[],ui={}})=>{
  const selected=ui.selected!=null&&actions.some(a=>a.type==='ask'&&String(a.cardId??a.card)===String(ui.selected));
  return {steps:[
   {...step('card','.hand-card.is-playable, .hand-card[data-action]',['ask']),interaction:true,available:!selected},
   {...step('opponent','[data-player-target]',['ask']),interaction:true,available:selected}]};
 };
 tutorial.revisions={};
 tutorial.goals=["card","opponent"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"gofish.tutorial."+id,params:{}})}));
 return tutorial;
});
