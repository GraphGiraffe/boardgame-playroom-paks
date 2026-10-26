/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const command=type=>`[data-action*='"type":"${type}"']`;
 const step=(id,selector,actions,match)=>({id,selector,actions,match,text:tr.format({key:"mage-brawl"+'.tutorial.'+id,params:{}})});
 const tutorial=({state,viewer,ui={}})=>{
 const d=state.scene.arena,mine=d.players[viewer],second=!!mine?.draft,suffix=second?'-second':'',selected=!!ui.viewState?.mageCardId&&ui.viewState.mageCardId!==mine?.draft?.cardId;
 const required=['movement','attack','ultimate','card','ready','rotate','help','base','loot-player','loot-card','edit',...(d.config?.steps===1?[]:['card-second','ready-second'])];
 const types=['movement','attack','ultimate'].map(type=>step(type,`[data-view-key="mageAction"][data-view-value="${type}"][aria-pressed="false"]`,undefined,a=>a.type==='plan'&&a.action===type)).map(item=>({...item,interaction:true}));
 const card=step('card'+suffix,'.mage-card:not([disabled])',undefined,a=>a.type==='plan');
 // Local choice counts immediately; command completion also covers alternative input paths.
 card.interaction=true;
 const ready=step('ready'+suffix,'.mage-ready[data-action*="plan"]',['plan']);
 const rotate=step('rotate','[data-view-key="mageDirection"]');
 const help=step('help','[data-command="card-help"]');
 const edit=step('edit',command('unready'),['unready']);
 const planning=selected?[rotate,help,...(second?[edit]:[]),ready,...types,card,...(second?[]:[edit])]:[...(second?[]:types),card,rotate,help,...(second?[edit]:[]),ready,...(second?[]:[edit]),...(second?types:[])];
 return {required,concurrent:true,complete:d.phase==='planning'&&!!mine?.plan,steps:d.phase==='respawn'?[step('base',command('respawn'),['respawn'])]:d.phase==='loot'?[step('loot-card','.card-choice-dialog [data-card-index]',['loot']),{...step('loot-player','[data-player-target]', ['loot']),interaction:true}]:planning};
 };
 tutorial.revisions={"movement":2,"attack":2,"ultimate":2};
 tutorial.goals=["movement","attack","ultimate","card","rotate","help","ready","card-second","ready-second","edit","base","loot-player","loot-card"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"mage-brawl.tutorial."+id,params:{}})}));
 return tutorial;
});
