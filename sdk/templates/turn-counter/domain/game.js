// @ts-check
/** @type {import('../sdk/contracts').Definition} */
const definition={
 contractVersion:1,id:'__PACK_ID__',minPlayers:2,maxPlayers:4,
 create(options){
  const settings=options.options;
  const target=settings&&typeof settings==='object'&&!Array.isArray(settings)?settings.target??6:6;
  if(typeof target!=='number')throw Error('COUNTER_TARGET_TYPE');
  return {playerCount:options.playerCount,turn:options.firstPlayer,status:'playing',winners:[],data:{count:0,target}};
 },
 validate:position=>Number.isInteger(position.data.count)&&Number(position.data.count)>=0&&Number(position.data.count)<=Number(position.data.target),
 actions:(position,actor)=>position.status==='playing'&&actor===position.turn?[{command:{type:'increment'},visibility:'public'}]:[],
 reduce(position,actor){const count=Number(position.data.count)+1,finished=count===Number(position.data.target);return {position:{...position,turn:finished?actor:(actor+1)%position.playerCount,status:finished?'finished':'playing',winners:finished?[actor]:[],data:{...position.data,count}},events:[{type:'counter.incremented',actor,params:{count},visibility:{kind:'public'}}],turnEnded:true};},
 project:position=>({count:position.data.count}),
 result:position=>({winners:position.winners,places:Array.from({length:position.playerCount},(_,player)=>position.winners.includes(player)?1:2),metrics:[{id:'wins',values:Array.from({length:position.playerCount},(_,player)=>position.winners.includes(player)?1:0)}]})
};
globalThis.PlayroomPackDefinition=definition;
