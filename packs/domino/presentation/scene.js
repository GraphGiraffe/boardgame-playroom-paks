(function(root,factory){
 const ChainTileAsset=root.PlayroomChainTileAsset||(typeof require==='function'?require('../../../shared/presentation/chain-tile-asset.js'):null);
 const api=factory(ChainTileAsset);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;
})(globalThis,function(ChainTileAsset){
 'use strict';const message=(key,params={})=>({key:'domino.'+key,params});
 const tileAsset=new ChainTileAsset();
 const metadata={cover:{kind:'asset',id:'assets/cover.webp'},name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.points'),presets:['classic','quick'].map(id=>({id,label:message('presets.'+id)})),rules:Array.from({length:5},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"domino.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"domino.book.text.1","params":{}}},{"type":"paragraph","text":{"key":"domino.book.text.2","params":{}}}]},{"text":{"key":"domino.rules.2","params":{}},"blocks":[{"type":"paragraph","text":{"key":"domino.book.text.3","params":{}}},{"type":"paragraph","text":{"key":"domino.book.text.4","params":{}}}]},{"text":{"key":"domino.rules.3","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"domino.book.text.5","params":{}},{"key":"domino.book.text.6","params":{}}]},{"type":"paragraph","text":{"key":"domino.book.text.7","params":{}}}],"layout":"stack","figures":[{"id":"join","caption":{"key":"domino.book.figure.join","params":{}},"role":"diagram"}]},{"text":{"key":"domino.rules.4","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"domino.book.text.8","params":{}},{"key":"domino.book.text.9","params":{}}]},{"type":"paragraph","text":{"key":"domino.book.text.10","params":{}}}],"layout":"stack","figures":[{"id":"controls","caption":{"key":"domino.book.figure.controls","params":{}},"role":"diagram"}]},{"text":{"key":"domino.rules.5","params":{}},"blocks":[{"type":"table","headers":[{"key":"domino.book.text.11","params":{}},{"key":"domino.book.text.12","params":{}}],"rows":[[{"key":"domino.book.text.13","params":{}},{"key":"domino.book.text.14","params":{}}],[{"key":"domino.book.text.15","params":{}},{"key":"domino.book.text.16","params":{}}]]},{"type":"paragraph","text":{"key":"domino.book.text.17","params":{}}}]}],"brief":{"sections":[{"title":{"key":"domino.brief.0.title","params":{}},"paragraphs":[{"key":"domino.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"join","caption":{"key":"domino.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"domino.brief.1.title","params":{}},"paragraphs":[{"key":"domino.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"controls","caption":{"key":"domino.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"domino.brief.2.title","params":{}},"paragraphs":[{"key":"domino.brief.2.text","params":{}}]}]}}};
 function action(command,projection){if(command.type!=='play')return message('actions.'+command.type);
  const tile=projection.data.hands[projection.viewer].find(tile=>tile.id===command.card);return message(projection.data.chain.length?'actions.play-side':'actions.play',{a:tile.a,b:tile.b,side:message('side.'+command.side)});}
 function event(value){const p=value.params;
  if(value.type==='domino.drawn')return {message:message('events.drawn'),kind:'draw',sound:{id:'draw',target:value.actor},transfer:{player:value.actor,count:1,from:'stock'}};
  if(value.type==='domino.passed')return {message:message('events.passed'),kind:'pass',feedback:{kind:'skip',player:value.actor},speech:{speaker:value.actor,text:message('speech.pass')}};
  if(value.type==='domino.played')return {message:message('events.played',{a:p.a,b:p.b,side:message('side.'+p.side)}),kind:'play',reveal:tileAsset.reveal({id:p.id,a:p.a,b:p.b}),sound:{id:'move'}};
  if(value.type==='domino.cleared')return {message:message('events.cleared'),finish:true};
  if(value.type==='domino.fish')return {message:message(value.actor===null?'events.fish-draw':'events.fish-win',{best:p.best}),finish:true};
  throw Error('DOMINO_EVENT_UNKNOWN');
 }
 const metric=()=>message('meta.pips');
 const scene=projection=>({contractVersion:1,id:'domino-chain',family:'tile-chain',deck:'domino',handLayout:'tiles',chain:projection.data.chain.map(tile=>({...tile,label:message('view.tile',{a:tile.a,b:tile.b}),help:message('view.tile-help',{a:tile.a,b:tile.b})})),chainPresentation:{label:message('view.chain',{left:projection.data.chain[0]?.a??'',right:projection.data.chain.at(-1)?.b??''}),edge:message('view.edge')},statusItems:[{label:message('view.stock'),value:projection.data.stock.length},{label:message('view.table'),value:projection.data.chain.length}],openingTileId:projection.data.openingTileId,
  placements:projection.actions.filter(command=>command.type==='play').map(command=>{
   const card=projection.data.hands[projection.actor].find(card=>card.id===command.card),chain=projection.data.chain;
   const {a,b,join}=tileAsset.placement(card,command.side,chain);
   return {command,a,b,join,label:message(chain.length?'view.place-side':'view.place-first',{a,b,side:message('side.'+command.side),join}),help:message('view.orientation'),caption:message(chain.length?'view.place':'view.start')};
  }),
  players:projection.data.hands.map((hand,player)=>({player,finishPlace:(projection.data.ending?.groups||[]).findIndex(group=>group.includes(player))+1,hand,metrics:[{id:'points',kind:'points',value:projection.data.points[player],label:metadata.scoreLabel,resultUsage:false}]})),stockCount:projection.data.stock.length});

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){
  const d=p.data,objects=[];
  d.hands.forEach((hand,owner)=>hand.forEach((card,index)=>{
   if(card&&!card.hidden&&card.id!=null)objects.push(tileAsset.place(card.id,'hand-'+owner,index));
  }));
  d.chain.forEach((tile,index)=>objects.push(tileAsset.place(tile.id,'field',index)));
  return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'table'},{id:'stock',kind:'stock',count:d.stock.length},...d.hands.map((hand,owner)=>({id:'hand-'+owner,kind:'hand',owner,count:hand.length}))],objects,
   interactions:p.actions.map(command=>{
    if(command.card==null)return {command,kind:'activate',target:{zone:command.type==='draw'?'stock':'field'}};
    return {command,kind:'move',source:{entity:tileAsset.ref(command.card)},activation:'select',gestures:{drag:true,swipe:false},target:{zone:'field',index:command.side==='left'?0:d.chain.length}};
   })};
 }
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,event,metric,scene:p=>({...scene(p),...sceneLayout(p),screenFamily:'cards',fieldDropZone:true,actionReserve:true,fieldSizing:'scroll',actionDock:{primary:p.actions.filter(command=>!command.card).map(command=>({label:action(command,p),command}))}})});
});
