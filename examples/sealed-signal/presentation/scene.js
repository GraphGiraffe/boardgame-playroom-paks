(function(root){
 'use strict';
 const message=(key,params={})=>({key,params});
 const dieAsset=new PlayroomDieAsset();
 root.PlayroomPackPresentation={
  metadata:{name:message('meta.name'),presets:[{id:'classic',label:message('preset.classic')}],rules:[message('rules.goal')],scoreLabel:message('score.points')},
  action:command=>message('choice.'+command.choice),
  event:event=>event.type==='signal.revealed'?{message:message('event.'+event.params.reason),finish:true,sound:{id:'move'}}:
   {message:message('event.committed')},
  scene(projection){
   const {die,startedAt,deadline,selected,reveal}=projection.data;
   const ready=projection.decisionWindow?.ready??[];
   const prompt=reveal?SDK.text('prompt.reveal',{a:SDK.text('choice.'+(reveal.choices[0]??'none')),b:SDK.text('choice.'+(reveal.choices[1]??'none'))}):
    selected?SDK.text('prompt.selected',{choice:SDK.text('choice.'+selected)}):SDK.text('prompt.window',{ready:ready.length});
   return {contractVersion:1,id:'signal-board',family:'board',screenFamily:'board',prompt,showTurn:false,
    dice:[dieAsset.describe(die,{roll:false,label:SDK.text('dice.stimulus')})],diceStyle:'flat',dicePlacement:'status',
    ...(reveal?{}:{clock:{phase:'decision',startedAt,deadline,label:SDK.text('clock.label')}}),
    controls:projection.actions.map(command=>({command,label:message('choice.'+command.choice)})),
    players:Array.from({length:projection.playerCount},(_,player)=>({player,metrics:[{
     id:'points',kind:'points',value:reveal?.scores[player]??0,label:message('score.points'),resultUsage:true
    }]}))
   };
  }
 };
})(globalThis);
