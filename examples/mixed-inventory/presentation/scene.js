// @ts-check

/** @typedef {'card'|'tile'|'token'} ItemKind */
const inventoryAssets={
 card:new PlayroomCardFaceAsset(),tile:new PlayroomTileAsset(),token:new PlayroomTokenAsset()
};

/**
 * @param {ItemKind} item
 * @param {number} owner
 * @param {number|null} rank
 * @param {string} zone
 * @param {number} index
 * @returns {import('../sdk/contracts').InventoryObject}
 */
function piece(item,owner,rank,zone,index){
 const label=SDK.text('view.'+item,item==='card'?{rank:Number(rank)}:{});
 return {...inventoryAssets[item].place(owner,zone,index),visual:item==='card'?{kind:item,rank:Number(rank),suit:'♣',label}:
  item==='tile'?{kind:item,a:1,b:2,label}:{kind:item,value:1,label}};
}

/** @type {import('../sdk/contracts').Presentation} */
const presentation={
 metadata:{name:{key:'meta.name'},presets:[{id:'classic',label:{key:'preset.classic'}}],rules:[{key:'rules.goal'}]},
 action:command=>({key:'actions.'+command.item}),
 event:()=>({message:{key:'events.stored'},sound:{id:'move'}}),
 scene(p){
  const counts=/** @type {number[]} */ (p.data.counts),own=/** @type {ItemKind[]} */ (p.data.own);
  const stored=/** @type {{owner:number;item:ItemKind;rank:number|null;slot:number}[]} */ (p.data.stored);
  /** @type {import('../sdk/contracts').InventoryZone[]} */
  const zones=[
   {id:'tray',kind:'inventory',label:{key:'view.tray'},count:stored.length,visibility:'public',
    slots:Array.from({length:Number(p.data.capacity)},(_,slot)=>SDK.text('view.slot',{number:slot+1}))},
   ...counts.map((count,owner)=>({id:'hand-'+owner,kind:/** @type {const} */ ('inventory'),owner,label:SDK.text('view.hand',{seat:owner+1}),count,visibility:/** @type {const} */ ('owner')}))
  ];
  const objects=[
   ...stored.map(({item,owner,rank,slot})=>piece(item,owner,rank,'tray',slot)),
   ...own.map((item,index)=>piece(item,p.viewer,Number(p.data.ownRank),'hand-'+p.viewer,index))
  ];
  /** @type {import('../sdk/contracts').InventoryOverview['views']} */
  const views=[];
  // An overview only addresses items already present for this viewer.
  // Each view has its own display ID while the source ref is unchanged.
  for(const {zone,ref} of objects){
   const {namespace,id}=ref;
   if(zone==='tray')views.push({id:'stored-'+namespace+'-'+id,ref,role:'detail'});
   else if(namespace==='card')views.push({id:'in-hand-'+id,ref,role:'summary'});
  }
  return {contractVersion:1,id:'mixed-tray',family:'board',geometry:{topology:'fixed'},
   inventoryLayout:{zones:zones.map(zone=>zone.id),overviews:[{id:'overview',label:{key:'view.overview'},views}]},zones,objects,
   interactions:p.actions.map(command=>({command,kind:'move',activation:'select',
    source:{entity:inventoryAssets[/** @type {ItemKind} */ (command.item)].ref(p.viewer)},target:{zone:'tray',index:Number(command.slot)}})),
   players:counts.map((_,player)=>({player,metrics:[]}))};
 }
};
globalThis.PlayroomPackPresentation=presentation;
