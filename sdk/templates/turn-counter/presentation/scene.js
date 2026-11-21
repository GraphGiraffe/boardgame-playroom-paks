// @ts-check
/** @type {import('../sdk/contracts').Presentation} */
const presentation={
 metadata:{presets:[{id:'classic',label:{key:'preset.classic'}}],name:{key:'meta.name'},rules:[{key:'rules.goal'}]},
 action:()=>({key:'actions.increment'}),
 event:event=>({message:{key:'events.incremented'},sound:{id:'move'}}),
 scene:projection=>({contractVersion:1,id:'counter',family:'board',columns:1,rows:1,
  cells:[{id:'count',index:0,label:String(SDK.read(projection.data,'count')),value:SDK.read(projection.data,'count'),command:projection.actions[0]||null}],
  players:Array.from({length:projection.playerCount},(_,player)=>({player,metrics:[]}))})
};
globalThis.PlayroomPackPresentation=presentation;
