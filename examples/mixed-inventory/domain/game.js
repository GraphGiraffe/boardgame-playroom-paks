// @ts-check

/** @type {('card'|'tile'|'token')[]} */
const items=['card','tile','token'];
const score={card:3,tile:2,token:1};
const capacity=2;
/** @typedef {{owner:number;slot:number;item:'card'|'tile'|'token'}} StoredItem */
/** @param {StoredItem[]} stored */
function totals(stored){
 const values=[0,0];
 for(const {owner,item} of stored)values[owner]=score[item];
 return values;
}

/** @type {import('../sdk/contracts').Definition} */
const definition={
 contractVersion:1,id:'mixed-inventory',minPlayers:2,maxPlayers:2,
 create:({firstPlayer,rng})=>({playerCount:2,turn:firstPlayer,status:'playing',winners:[],
  data:{ranks:[2+rng%13,2+((rng+4)%13)],stored:[]}}),
 validate({data,status,turn}){
  const {ranks,stored}=data;
  if(!Array.isArray(ranks)||ranks.length!==2||!ranks.every(rank=>typeof rank==='number'&&Number.isInteger(rank)&&rank>=2&&rank<=14)||
    !Array.isArray(stored)||stored.length>capacity||(status==='finished')!==(stored.length===capacity))return false;
  const owners=new Set(),slots=new Set();
  for(const entry of stored){
   if(!entry||typeof entry!=='object'||Array.isArray(entry)||(entry.owner!==0&&entry.owner!==1)||
     typeof entry.slot!=='number'||!Number.isInteger(entry.slot)||entry.slot<0||entry.slot>=capacity||
     owners.has(entry.owner)||slots.has(entry.slot)||!items.some(item=>item===entry.item))return false;
   owners.add(entry.owner);slots.add(entry.slot);
  }
  return stored.length!==1||owners.has(1-turn);
 },
 actions(position,actor){
  if(position.status!=='playing'||actor!==position.turn)return [];
  const stored=/** @type {StoredItem[]} */ (position.data.stored);
  const occupied=new Set(stored.map(entry=>entry.slot));
  /** @type {import('../sdk/contracts').Choice[]} */
  const choices=[];
  for(let slot=0;slot<capacity;slot++)if(!occupied.has(slot))
   for(const item of items)choices.push({command:{type:'store',item,slot},visibility:'private'});
  return choices;
 },
 reduce(position,actor,command){
  const {data}=position;
  const stored=[...(/** @type {StoredItem[]} */ (data.stored)),
   {owner:actor,item:/** @type {'card'|'tile'|'token'} */ (command.item),slot:Number(command.slot)}];
  const finished=stored.length===capacity;
  const points=finished?totals(stored):[];
  return {position:{...position,data:{...data,stored},turn:finished?actor:1-actor,status:finished?'finished':'playing',
   winners:finished?[0,1].filter(owner=>points[owner]>=points[1-owner]):[]},turnEnded:true,
   events:[{type:'inventory.stored',actor,params:{item:command.item,slot:command.slot},visibility:{kind:'public'}}]};
 },
 project(position,viewer){
  const stored=/** @type {StoredItem[]} */ (position.data.stored);
  const ranks=/** @type {number[]} */ (position.data.ranks);
  // Opponents and the Table get counts. A card's rank crosses this boundary
  // only in its owner's projection or after it is stored in the public tray.
  return {capacity,counts:[0,1].map(owner=>3-Number(stored.some(entry=>entry.owner===owner))),
   own:viewer<0?[]:items.filter(item=>!stored.some(entry=>entry.owner===viewer&&entry.item===item)),
   ownRank:viewer<0?null:ranks[viewer],
   stored:stored.map(({owner,item,slot})=>({owner,item,slot,rank:item==='card'?ranks[owner]:null}))};
 },
 result:position=>({winners:position.winners,places:[0,1].map(owner=>position.winners.includes(owner)?1:2),
  metrics:[{id:'points',values:totals(/** @type {StoredItem[]} */ (position.data.stored))}]})
};
globalThis.PlayroomPackDefinition=definition;
