(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackDefinition=api;})(globalThis,function(){
 'use strict';
 const create=({playerCount,firstPlayer})=>({playerCount,turn:firstPlayer,status:'playing',winners:[],data:{count:0,goals:Array.from({length:playerCount},(_,index)=>({value:index+2})),points:Array(playerCount).fill(0)}});
 const validate=position=>Number.isInteger(position.data.count)&&position.data.count>=0&&position.data.count<=8&&position.data.goals.length===position.playerCount&&position.data.points.length===position.playerCount;
 const actions=(position,actor)=>position.status==='playing'&&actor===position.turn?[{command:{type:'increment'},visibility:'public'}]:[];
 function reduce(position,actor){const count=position.data.count+1,points=position.data.points.map((value,index)=>value+(index===actor?1:0));return {position:{...position,status:count===8?'finished':'playing',winners:count===8?[actor]:[],turn:count===8?actor:(actor+1)%position.playerCount,data:{...position.data,count,points}},events:[{type:'counter.goal',actor,params:{value:position.data.goals[actor].value},visibility:{kind:'players',players:[actor]},publicEvent:{type:'counter.changed',actor,params:{count},visibility:{kind:'public'}}}]};}
 const project=(position,viewer)=>({...position.data,goals:position.data.goals.map((goal,index)=>viewer===index?{...goal}:{hidden:true})});
 const result=position=>({winners:position.winners,places:position.data.points.map((_,index)=>position.winners.includes(index)?1:2),metrics:[{id:'points',values:position.data.points}]});
 return {contractVersion:1,id:'private-counter',minPlayers:2,maxPlayers:4,create,validate,actions,reduce,project,result,score:position=>position.data.points};
});
