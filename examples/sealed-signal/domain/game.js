(function(root){
 'use strict';
 const DecisionWindow=root.PlayroomDecisionWindow,period=20000,players=[0,1];
 const isChoice=value=>value==='claim'||value==='hold';
 const publicEvent=(name,actor,params={})=>({type:'signal.'+name,actor,params,visibility:{kind:'public'}});

 function finish(position,decision,reason){
  const {die,startedAt,deadline}=position.data;
  const choices=players.map(player=>decision.plans[player]??null);
  const claims=choices.filter(choice=>choice==='claim').length;
  const scores=choices.map(choice=>choice==='hold'?1:choice==='claim'&&claims===1?die:0);
  const best=Math.max(...scores);
  return {position:{...position,status:'finished',winners:players.filter(player=>scores[player]===best),
   data:{die,startedAt,deadline,decision:null,reveal:{choices,scores,reason}}},
   events:[publicEvent('revealed',null,{choices,scores,reason})],turnEnded:true};
 }

 root.PlayroomPackDefinition={
  contractVersion:1,id:'sealed-signal',minPlayers:2,maxPlayers:2,
  create({playerCount,firstPlayer,rng,now=0}){
   return {playerCount,turn:firstPlayer,status:'playing',winners:[],data:{
    die:1+rng%6,startedAt:now,deadline:now+period,decision:DecisionWindow.create('signal:1',players),reveal:null
   }};
  },
  validate(position){
   const {die,startedAt,deadline,decision,reveal}=position.data;
   if(!Number.isInteger(die)||die<1||die>6||!Number.isSafeInteger(startedAt)||startedAt<0||deadline!==startedAt+period)return false;
   if(position.status==='playing')return reveal===null&&decision?.id==='signal:1'&&
    DecisionWindow.describe(decision).participants.join(',')==='0,1'&&players.every(player=>decision.plans[player]===undefined||isChoice(decision.plans[player]));
   return decision===null&&Array.isArray(reveal?.choices)&&reveal.choices.length===2&&
    reveal.choices.every(choice=>choice===null||isChoice(choice))&&Array.isArray(reveal.scores)&&reveal.scores.length===2;
  },
  actions(position,actor){
   const {decision}=position.data;
   if(position.status!=='playing'||!decision.participants.includes(actor)||decision.plans[actor]!=null)return [];
   return ['hold','claim'].map(choice=>({command:{type:'choose',choice},visibility:'private'}));
  },
  reduce(position,actor,command){
   const old=position.data.decision,decision={...old,plans:{...old.plans},versions:{...old.versions}};
   // The shared decision window owns public readiness and decision versions. Its plans
   // stay in authority and are copied only when a participant commits.
   if(DecisionWindow.put(decision,actor,command.choice))return finish(position,decision,'ready');
   const turn=decision.participants.find(player=>decision.plans[player]==null);
   return {position:{...position,turn,data:{...position.data,decision}},events:[publicEvent('committed',actor)]};
  },
  advance(position,now){
   return now<position.data.deadline?null:finish(position,position.data.decision,'timeout');
  },
  decisionWindow:position=>position.data.decision?DecisionWindow.describe(position.data.decision):null,
  project(position,viewer){
   const {die,startedAt,deadline,decision,reveal}=position.data;
   return {die,startedAt,deadline,selected:decision?.plans[viewer]??null,reveal};
  },
  result(position){
   const values=position.data.reveal.scores;
   return {winners:position.winners,places:players.map(player=>position.winners.includes(player)?1:2),metrics:[{id:'points',values}]};
  }
 };
})(globalThis);
