// @ts-check
/** @type {import('../sdk/contracts').Presentation} */
const presentation={
 metadata:{name:'__PACK_ID__',rules:['По очереди увеличивайте счётчик. Побеждает игрок, получивший 6.']},
 action:()=>'+1',
 event:event=>({message:'Счётчик увеличен',sound:{id:'move'}}),
 scene:projection=>({contractVersion:1,id:'counter',family:'board',columns:1,rows:1,
  cells:[{id:'count',index:0,label:String(SDK.read(projection.data,'count')),value:SDK.read(projection.data,'count'),command:projection.actions[0]||null}],
  players:Array.from({length:projection.playerCount},(_,player)=>({player,metrics:[]}))})
};
globalThis.PlayroomPackPresentation=presentation;
