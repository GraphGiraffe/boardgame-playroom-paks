// @ts-check

const tiles=new PlayroomTileAsset(),tokens=new PlayroomTokenAsset();
const carrier=tiles.place('carrier','field'),rack='cargo-slots';
const receiver=tiles.place('receiver','field'),receiverRack='receiver-slots';

/** @type {import('../sdk/contracts').Presentation} */
const presentation={
 metadata:{presets:[{id:'classic',label:{key:'preset.classic'}},{id:'handoff',label:{key:'preset.handoff'}}],name:{key:'meta.name'},rules:[{key:'rules.goal'},{key:'rules.handoff'}]},
 action:command=>({key:'actions.'+command.type}),
 event(event){
  if(!event||typeof event!=='object'||Array.isArray(event)||typeof event.type!=='string')throw Error('CARGO_EVENT_INVALID');
  return {message:{key:'events.'+event.type.split('.')[1]},sound:{id:'move'}};
 },
 scene(projection){
  const {cell,loaded,orientation,points,transferred}=projection.data,handoff=typeof transferred==='boolean';
  /** @type {import('../sdk/contracts').JSONValue[]} */
  const objects=[
   {...carrier,cell,orientation,visual:{kind:'tile',a:1,b:2,label:SDK.text('view.carrier')}},
   ...(handoff?[{...receiver,cell:transferred?4:3,orientation:2,visual:{kind:'tile',a:2,b:3,label:SDK.text('view.receiver')}}]:[]),
   ...Array.from({length:Number(loaded)},(_,index)=>({
    ...tokens.place(index,index===0&&transferred?receiverRack:rack,index),
    visual:{kind:'token',value:index+1,label:SDK.text('view.cargo',{number:index+1})}
   }))
  ];
  // Scene bindings consume the authorized choices supplied by the rules.
  // The rack relationship is a public entity reference, independent of its cell.
  /** @type {import('../sdk/contracts').JSONValue[]} */
  const zones=[{id:'field',kind:'board'},{id:rack,kind:'slots',anchor:carrier.ref,capacity:2},
   ...(handoff?[{id:receiverRack,kind:'slots',anchor:receiver.ref,capacity:1}]:[])];
  const rotate=projection.actions.find(command=>command.type==='rotate');
  return {contractVersion:1,id:'cargo-board',family:'board',screenFamily:'board',
   geometry:{topology:'fixed',columns:handoff?5:3,rows:1},anchoredLayout:{field:'field',label:SDK.text('view.field')},
   zones,objects,
   ...(rotate?{controls:[{command:rotate,label:{key:'actions.rotate'}}]}:{}),
   interactions:projection.actions.filter(command=>command!==rotate).map(command=>command.type==='transfer'
    ?tokens.move(0,command,{zone:receiverRack,index:0})
    :{command,kind:'activate',target:command.type==='load'
    ?{zone:rack,index:Number(command.slot)}
    :{zone:'field',cell:Number(command.cell)}}),
   players:(/** @type {number[]} */ (points)).map((value,player)=>({player,metrics:[{id:'points',kind:'points',value,label:{key:'view.points'},resultUsage:true}]}))
  };
 }
};
globalThis.PlayroomPackPresentation=presentation;
