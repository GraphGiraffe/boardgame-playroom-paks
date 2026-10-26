/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"checkers"+'.tutorial.'+id,params:{}})});
 const tutorial=({state,ui={},actions=[]})=>{
 const isKing=a=>a.type==='move'&&state.scene.pieces.some(p=>p.cell===a.from&&p.king),long=a=>isKing(a)&&Math.abs(Math.floor(a.to/8)-Math.floor(a.from/8))>1;
 const steps=[
 step('continue',state.scene.forced!=null?'.checker-cell.destination[data-action]':':not(*)',undefined,a=>a.type==='move'&&state.scene.forced!=null),
 step('king-move','[data-guide-king-move]',undefined,long),
 step('capture','[data-guide-capture]',undefined,a=>a.type==='move'&&actions.some(x=>x.from===a.from&&x.to===a.to&&x.capture)),
 step('destination','.checker-cell.destination[data-action]',['move']),
 {...step('king','.checker-piece.king.movable',undefined,isKing),interaction:true},
 {...step('piece','.checker-piece.movable',['move']),interaction:true}];
 return {required:steps.map(s=>s.id),steps};
 };
 tutorial.revisions={};
 tutorial.goals=["destination","piece","king","king-move","capture","continue"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"checkers.tutorial."+id,params:{}})}));
 return tutorial;
});
