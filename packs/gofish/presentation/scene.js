(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'gofish.'+key,params});
  const rank=number=>message(number>=11?'rank.'+number:'rank.numeric',{rank:number});
  const metadata={cover:{kind:'asset',id:'assets/cover.webp'},name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:[{id:'classic',label:message('meta.classic')}],rules:Array.from({length:5},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"gofish.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"gofish.book.text.1","params":{}}},{"type":"paragraph","text":{"key":"gofish.book.text.2","params":{}}}]},{"text":{"key":"gofish.rules.2","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"gofish.book.text.3","params":{}},{"key":"gofish.book.text.4","params":{}}]},{"type":"paragraph","text":{"key":"gofish.book.text.5","params":{}}}],"layout":"stack","figures":[{"id":"request","caption":{"key":"gofish.book.figure.request","params":{}},"role":"diagram"}]},{"text":{"key":"gofish.rules.3","params":{}},"blocks":[{"type":"paragraph","text":{"key":"gofish.book.text.6","params":{}}},{"type":"table","headers":[{"key":"gofish.book.text.7","params":{}},{"key":"gofish.book.text.8","params":{}}],"rows":[[{"key":"gofish.book.text.9","params":{}},{"key":"gofish.book.text.10","params":{}}],[{"key":"gofish.book.text.11","params":{}},{"key":"gofish.book.text.12","params":{}}],[{"key":"gofish.book.text.13","params":{}},{"key":"gofish.book.text.14","params":{}}]]}],"layout":"stack","figures":[{"id":"draw","caption":{"key":"gofish.book.figure.draw","params":{}},"role":"diagram"}]},{"text":{"key":"gofish.rules.4","params":{}},"blocks":[{"type":"paragraph","text":{"key":"gofish.book.text.15","params":{}}},{"type":"list","ordered":false,"items":[{"key":"gofish.book.text.16","params":{}},{"key":"gofish.book.text.17","params":{}},{"key":"gofish.book.text.18","params":{}}]}],"layout":"stack","figures":[{"id":"quartet","caption":{"key":"gofish.book.figure.quartet","params":{}},"role":"diagram"}]},{"text":{"key":"gofish.rules.5","params":{}},"blocks":[{"type":"paragraph","text":{"key":"gofish.book.text.19","params":{}}},{"type":"table","headers":[{"key":"gofish.book.text.20","params":{}},{"key":"gofish.book.text.21","params":{}}],"rows":[[{"key":"gofish.book.text.22","params":{}},{"key":"gofish.book.text.23","params":{}}],[{"key":"gofish.book.text.24","params":{}},{"key":"gofish.book.text.25","params":{}}]]}]}],"brief":{"sections":[{"title":{"key":"gofish.brief.0.title","params":{}},"paragraphs":[{"key":"gofish.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"request","caption":{"key":"gofish.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"gofish.brief.1.title","params":{}},"paragraphs":[{"key":"gofish.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"quartet","caption":{"key":"gofish.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"gofish.brief.2.title","params":{}},"paragraphs":[{"key":"gofish.brief.2.text","params":{}}]}]}}};
  const action=command=>command.type==='draw'?message('actions.draw'):message('actions.ask',{rank:rank(command.rank),target:{kind:'player-reference',index:command.target}});
  function choice(command,projection){return command.type==='ask'?{rank:projection.data.hands[projection.actor]?.find(card=>card.id===command.cardId)?.rank,card:command.cardId,targetKind:'player',targetSource:true}:{};}
  function event(value){
    const {actor,params:p}=value;
    if(value.type==='gofish.booked')return {message:message('events.booked',{rank:rank(p.rank)}),kind:'capture',sound:{id:'success'},
      reveal:{kind:'cards',cards:p.cards,entity:{namespace:'card',id:p.cards[0].id}}};
    if(value.type==='gofish.drawn')return {message:message('events.drawn'),kind:'draw',transfer:{player:actor,count:1,from:'stock'}};
    if(value.type==='gofish.asked')return {message:message('events.asked',{rank:rank(p.rank),target:{kind:'player-reference',index:p.target}}),kind:'action',sound:{id:'move'},...(p.card?{reveal:{kind:'card',card:p.card}}:{}),speech:{speaker:actor,target:p.target,text:message('speech.rank.'+(p.rank>=11?p.rank:'numeric'),{rank:p.rank})}};
    if(value.type==='gofish.given')return {message:message('events.given',{count:p.count}),kind:'play',sound:{id:'success'},transfer:{player:p.target,count:p.count,from:'hand',fromPlayer:actor},speech:{speaker:actor,target:p.target,icon:'cards',count:p.count,result:'success'}};
    if(value.type==='gofish.absent')return {message:message('events.absent',{rank:rank(p.rank)}),kind:'action',sound:{id:'mismatch'},speech:{speaker:actor,target:p.target,icon:'cross',result:'error'}};
    if(value.type==='gofish.repeat')return {message:message('events.repeat'),kind:'action'};
    if(value.type==='gofish.finished')return {message:message('events.finished'),finish:true};
    throw Error('GOFISH_EVENT_UNKNOWN');
  }
  const metric=()=>message('meta.books');
  const ordered=hand=>[...hand].sort((a,b)=>(a.rank??0)-(b.rank??0));
  const scene=projection=>({contractVersion:1,id:'gofish-table',family:'card-table',handLayout:'fan',stockCount:projection.data.drawPile.length,
    tableLayout:{kind:'collected-sets',stockLabel:message('view.stock'),rows:projection.data.bookCards.map((cards,player)=>({player,label:message('view.owner',{player:{kind:'player-reference',index:player}}),cards:cards.map(card=>({id:card.id,rank:card.rank}))})).sort((a,b)=>(a.player-projection.data.firstPlayer+projection.playerCount)%projection.playerCount-(b.player-projection.data.firstPlayer+projection.playerCount)%projection.playerCount)},
    actionDock:{primary:projection.actions.filter(c=>c.type==='draw').map(command=>({command,label:action(command)}))},
    playerChoices:{kind:'request',choices:projection.actions.filter(c=>c.type==='ask').map(command=>({player:command.target,source:{namespace:'card',id:String(command.cardId)},command,label:action({...choice(command,projection),...command})}))},
    players:projection.data.hands.map((hand,player)=>({player,hand:ordered(hand),books:projection.data.books[player],
      metrics:[{id:'books',kind:'points',value:projection.data.books[player].length,label:metric(),resultUsage:true}]}))});

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'table'},{id:'stock',kind:'stock',count:d.drawPile.length},...d.hands.map((_,owner)=>({id:'player-'+owner,kind:'player',owner})),...d.hands.map((hand,owner)=>({id:'hand-'+owner,kind:'hand',owner,count:hand.length}))],objects:[...d.bookCards.flatMap(cards=>cards.map(card=>({ref:{namespace:'card',id:String(card.id)},zone:'field'}))),...d.hands.flatMap((hand,owner)=>ordered(hand).flatMap((card,index)=>card&&!card.hidden&&card.id!=null?[{ref:{namespace:'card',id:String(card.id)},zone:'hand-'+owner,index}]:[]))],interactions:p.actions.map(command=>{const source=command.cardId!=null?{entity:{namespace:'card',id:String(command.cardId)}}:null;return {command,kind:source?'move':'activate',...(source?{source,activation:'select',gestures:{drag:true,swipe:false}}:{}),target:source?{zone:'player-'+command.target}:command.type==='draw'?{zone:'stock'}:{zone:'field'}};})};}
 const sceneFrame=p=>({...scene(p),...sceneLayout(p),screenFamily:'cards',layout:{focus:'hands'},fieldSizing:'scroll',actionReserve:true});
 // Arrival checkpoints restore only cards disclosed by public set facts.
 // Rules already resolved the set; presentation delays its removal until reveal.
 function eventScenes(p){
  const events=p.events.filter(e=>e.revision===p.revision),books=events.filter(e=>e.type==='gofish.booked');
  if(!books.length)return [];
  const data={...p.data,hands:p.data.hands.map(h=>[...h]),books:p.data.books.map(b=>[...b]),bookCards:p.data.bookCards.map(b=>[...b])};
  for(const e of books){
   data.hands[e.actor].push(...e.params.cards.map(c=>p.viewer===e.actor?c:{hidden:true}));
   data.books[e.actor]=data.books[e.actor].filter(rank=>rank!==e.params.rank);
   data.bookCards[e.actor]=data.bookCards[e.actor].filter(c=>c.rank!==e.params.rank);
  }
  const frames=[];
  for(const e of events){
   if(e.type==='gofish.booked'){
    if(p.viewer===e.actor){const ids=new Set(e.params.cards.map(c=>c.id));data.hands[e.actor]=data.hands[e.actor].filter(c=>!ids.has(c.id));}
    else data.hands[e.actor]=data.hands[e.actor].slice(0,-e.params.count);
    data.books[e.actor]=[...data.books[e.actor],e.params.rank];data.bookCards[e.actor]=[...data.bookCards[e.actor],e.params.cards[0]];
   }
   if(['gofish.given','gofish.drawn','gofish.booked'].includes(e.type)){
    const projected={...p,actions:[],data};
    frames.push({eventId:e.id,scene:sceneFrame(projected)});
   }
  }
  return frames;
 }
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice,event,metric,scene:sceneFrame,rank,eventScenes});
});
