/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"ludo"+'.tutorial.'+id,params:{}})});
 const tutorial=({state,viewer})=>{
 const mine=state.scene.pawns?.filter(p=>p.owner===viewer)||[],helping=state.preset==='teams'&&mine.length>0&&mine.every(p=>p.progress===57);
 const teamSteps=helping?[step('team-roll',command('roll'),['roll']),step('team-move','.ludo-pawn[data-action], .ludo-pawn[data-view-key="pawn"], .ludo-target[data-action]',undefined,a=>a.type==='move'&&a.owner!==viewer)]:[];
 const isExit=a=>a.type==='move'&&state.scene.moves.some(m=>m.from<0&&m.command.owner===a.owner&&m.command.pawn===a.pawn&&m.command.dieIndex===a.dieIndex);
 const exitKind=a=>isExit(a)?state.scene.dice?.[a.dieIndex]?.value===6?'exit':'exit-guaranteed':null;
 const exitStep=id=>{const moves=state.scene.moves.filter(m=>exitKind({type:'move',...m.command})===id);return step(id,moves.map(m=>`.ludo-pawn[data-action*='"dieIndex":${m.command.dieIndex}']`).join(',')||':not(*)',undefined,a=>exitKind(a)===id);};
 return {required:['roll',...(state.scene.sixReroll===false?[]:['reroll-six']),'exit',...(state.scene.guaranteedExit===false?[]:['exit-guaranteed']),'pawn','destination',...(state.preset==='teams'?['team-roll','team-move']:[])],steps:[...teamSteps,step(state.scene.repeatSix?'reroll-six':'roll',command('roll'),['roll']),exitStep('exit'),exitStep('exit-guaranteed'),step('destination','.ludo-target[data-action]',undefined,a=>a.type==='move'&&!isExit(a)),{...step('pawn','.ludo-pawn[data-view-key="pawn"]',undefined,a=>a.type==='move'&&!isExit(a)),interaction:true}]};
 };
 tutorial.revisions={exit:2};
 tutorial.goals=["roll","reroll-six","exit","exit-guaranteed","pawn","destination","team-roll","team-move"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"ludo.tutorial."+id,params:{}})}));
 return tutorial;
});
