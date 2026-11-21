// @ts-check

const capacity=2,destination=2;

/** @type {import('../sdk/contracts').Definition} */
const definition={
 contractVersion:1,id:'anchored-cargo',minPlayers:2,maxPlayers:2,
 create:({playerCount,firstPlayer,preset})=>({playerCount,turn:firstPlayer,status:'playing',winners:[],data:{
  cell:0,loaded:0,orientation:0,points:[0,0],...(preset==='handoff'?{transferred:false}:{})}}),
 validate(position){
  const {cell,loaded,orientation,points,transferred}=position.data;
  return typeof cell==='number'&&Number.isInteger(cell)&&cell>=0&&cell<=destination&&
   typeof loaded==='number'&&Number.isInteger(loaded)&&loaded>=0&&loaded<=capacity&&
   typeof orientation==='number'&&Number.isInteger(orientation)&&orientation>=0&&orientation<=3&&
   Array.isArray(points)&&points.length===2&&points.every(p=>typeof p==='number'&&Number.isInteger(p)&&p>=0)&&
   Number(points[0])+Number(points[1])===loaded&&
   (transferred===undefined||typeof transferred==='boolean'&&(!transferred||loaded>0))&&
   (cell===0||loaded>0)&&(cell!==destination||loaded===capacity)&&(position.status==='finished')===(cell===destination);
 },
 actions(position,actor){
  if(position.status!=='playing'||actor!==position.turn)return [];
  const {cell,loaded,transferred}=position.data;
  /** @type {import('../sdk/contracts').Choice[]} */
  const choices=[];
  if(Number(loaded)<capacity)choices.push({command:{type:'load',slot:loaded},visibility:'public'});
  if(Number(loaded)>0)choices.push({command:{type:'rotate'},visibility:'public'});
  if(transferred===false&&Number(loaded)>0)choices.push({command:{type:'transfer'},visibility:'public'});
  if(Number(loaded)>0&&(Number(cell)<destination-1||loaded===capacity))
   choices.push({command:{type:'travel',cell:Number(cell)+1},visibility:'public'});
  return choices;
 },
 reduce(position,actor,command){
  const {data}=position,loading=command.type==='load',travelling=command.type==='travel',transferring=command.type==='transfer';
  const cell=travelling?Number(command.cell):Number(data.cell),loaded=Number(data.loaded)+(loading?1:0);
  const orientation=(Number(data.orientation)+Number(!loading&&!transferring))%4;
  const current=/** @type {number[]} */ (data.points);
  // Loading and scoring are one transition. Travel and turning preserve the
  // cargo's slot indices; the carrier pose changes independently.
  let points=current;
  if(loading){points=current.slice();points[actor]++;}
  const finished=cell===destination,winners=finished?points.flatMap((value,player)=>value===Math.max(...points)?[player]:[]):[];
  return {position:{...position,data:{...data,cell,loaded,orientation,points,...(transferring?{transferred:true}:{})},turn:!travelling||finished?actor:1-actor,
   status:finished?'finished':'playing',winners},turnEnded:travelling,
   events:[{type:loading?'cargo.loaded':transferring?'cargo.transferred':finished?'cargo.delivered':travelling?'cargo.traveled':'cargo.rotated',actor,params:{cell,loaded,orientation},visibility:{kind:'public'}}]};
 },
 project:position=>position.data,
 bot(_projection,_actor,commands){
  return commands.find(command=>command.type==='travel')||commands.find(command=>command.type==='load')||commands[0];
 },
 result(position){
  const values=/** @type {number[]} */ (position.data.points);
  return {winners:position.winners,places:values.map(value=>value===Math.max(...values)?1:2),metrics:[{id:'points',values}]};
 }
};
globalThis.PlayroomPackDefinition=definition;
