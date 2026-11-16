// @ts-check
/** @type {import('../sdk/contracts').Definition} */
const definition={
 contractVersion:1,id:'__PACK_ID__',minPlayers:2,maxPlayers:4,
 create:options=>({playerCount:options.playerCount,turn:options.firstPlayer,status:'playing',winners:[],data:{count:0}}),
 validate:position=>Number.isInteger(position.data.count)&&Number(position.data.count)>=0&&Number(position.data.count)<=6,
 actions:(position,actor)=>position.status==='playing'&&actor===position.turn?[{command:{type:'increment'},visibility:'public'}]:[],
 reduce(position,actor){const count=Number(position.data.count)+1,finished=count===6;return {position:{...position,turn:finished?actor:(actor+1)%position.playerCount,status:finished?'finished':'playing',winners:finished?[actor]:[],data:{count}},events:[{type:'counter.incremented',actor,params:{count},visibility:{kind:'public'}}],turnEnded:true};},
 project:position=>({count:position.data.count}),
 result:position=>({winners:position.winners,places:Array.from({length:position.playerCount},(_,player)=>position.winners.includes(player)?1:2),metrics:[{id:'wins',values:Array.from({length:position.playerCount},(_,player)=>position.winners.includes(player)?1:0)}]})
};
globalThis.PlayroomPackDefinition=definition;
