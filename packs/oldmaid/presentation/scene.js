(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'oldmaid.'+key,params});
  const metadata={cover:{kind:'asset',id:'assets/cover.webp'},name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.score'),
    presets:[{id:'classic',label:message('meta.classic')}],rules:Array.from({length:4},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"oldmaid.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"oldmaid.book.text.1","params":{}}},{"type":"paragraph","text":{"key":"oldmaid.book.text.2","params":{}}}]},{"text":{"key":"oldmaid.rules.2","params":{}},"blocks":[{"type":"table","headers":[{"key":"oldmaid.book.text.3","params":{}},{"key":"oldmaid.book.text.4","params":{}}],"rows":[[{"key":"oldmaid.book.text.5","params":{}},{"key":"oldmaid.book.text.6","params":{}}],[{"key":"oldmaid.book.text.7","params":{}},{"key":"oldmaid.book.text.8","params":{}}],[{"key":"oldmaid.book.text.9","params":{}},{"key":"oldmaid.book.text.10","params":{}}],[{"key":"oldmaid.book.text.11","params":{}},{"key":"oldmaid.book.text.12","params":{}}]]},{"type":"paragraph","text":{"key":"oldmaid.book.text.13","params":{}}}],"layout":"stack","figures":[{"id":"pair","caption":{"key":"oldmaid.book.figure.pair","params":{}},"role":"diagram"},{"id":"queen","caption":{"key":"oldmaid.book.figure.queen","params":{}},"role":"diagram"}]},{"text":{"key":"oldmaid.rules.3","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"oldmaid.book.text.14","params":{}},{"key":"oldmaid.book.text.15","params":{}}]},{"type":"paragraph","text":{"key":"oldmaid.book.text.16","params":{}}}],"layout":"stack","figures":[{"id":"choose","caption":{"key":"oldmaid.book.figure.choose","params":{}},"role":"diagram"}]},{"text":{"key":"oldmaid.rules.4","params":{}},"blocks":[{"type":"paragraph","text":{"key":"oldmaid.book.text.17","params":{}}},{"type":"table","headers":[{"key":"oldmaid.book.text.18","params":{}},{"key":"oldmaid.book.text.19","params":{}}],"rows":[[{"key":"oldmaid.book.text.20","params":{}},{"key":"oldmaid.book.text.21","params":{}}],[{"key":"oldmaid.book.text.22","params":{}},{"key":"oldmaid.book.text.23","params":{}}]]},{"type":"paragraph","text":{"key":"oldmaid.book.text.24","params":{}}}]}]}};
  const action=command=>message('actions.draw',{index:command.cardIndex+1,target:{kind:'player-reference',index:command.target}});
  const choice=()=>({targetKind:'player',targetChoice:'card'}),metric=()=>message('meta.points');
  function event(value){
    if(value.type==='oldmaid.drawn')return {message:message('events.drawn',{target:{kind:'player-reference',index:value.params.target}}),kind:'draw',sound:{id:'draw'},
      transfer:{player:value.actor,count:1,from:'hand',fromPlayer:value.params.target}};
    if(value.type==='oldmaid.paired')return {message:message('events.paired'),kind:'capture',sound:{id:'success'},
      reveal:{kind:'cards',cards:value.params.cards,entity:{namespace:'card',id:value.params.cards.at(-1).id}}};
    if(value.type==='oldmaid.finished')return {message:message('events.finished'),finish:true};
    throw Error('OLDMAID_EVENT_UNKNOWN');
  }
  const paint=card=>!card.hidden&&card.rank===12&&card.suit==='♠'?{...card,crown:true}:card;
 const scene=projection=>({contractVersion:1,id:'oldmaid-cards',family:'card-table',handLayout:'fan',handInspection:true,
    tableLayout:{kind:'discard-pairs',discardLabel:message('view.discard')},discardCount:projection.data.discard.length/2,
    playerChoices:{kind:'cards',choices:projection.actions.map(command=>({player:command.target,index:command.cardIndex,command,label:action(command)}))},
    players:projection.data.hands.map((hand,player)=>({player,finishPlace:(projection.data.ending?.groups||[]).findIndex(group=>group.includes(player))+1,hand:hand.map(paint),inactive:projection.data.outOrder.includes(player),metrics:[{id:'points',kind:'points',value:projection.data.points[player],label:metric(),resultUsage:true}]})),
    discard:projection.data.discard.map(paint)});

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'table'},...d.hands.map((hand,owner)=>({id:'hand-'+owner,kind:'hand',owner,count:hand.length}))],objects:[...d.discard.slice(-1).map(card=>({ref:{namespace:'card',id:String(card.id)},zone:'field'})),...d.hands.flatMap((hand,owner)=>hand.flatMap((card,index)=>card&&!card.hidden&&card.id!=null?[{ref:{namespace:'card',id:String(card.id)},zone:'hand-'+owner,index}]:[]))],interactions:p.actions.map(command=>{return {command,kind:command.type==='draw'?'select':'activate',target:command.target!=null&&command.cardIndex!=null?{zone:'hand-'+command.target,index:command.cardIndex}:{zone:'field'}};})};}
 // Public pair facts provide an authorized arrival checkpoint before removal.
 function eventScenes(p){
  const events=p.events.filter(e=>e.revision===p.revision),pairs=events.filter(e=>e.type==='oldmaid.paired');
  if(!pairs.length)return [];
  const data={...p.data,hands:p.data.hands.map(hand=>[...hand]),discard:[...p.data.discard],outOrder:[...p.data.outOrder],points:[...p.data.points]};
  for(const e of pairs){
   const ids=new Set(e.params.cards.map(c=>c.id));
   data.hands[e.actor].push(...e.params.cards.map(c=>p.viewer===e.actor||p.openHands?c:{hidden:true}));
   data.discard=data.discard.filter(c=>!ids.has(c.id));
   data.outOrder=data.outOrder.filter(player=>player!==e.actor);data.points[e.actor]=0;
  }
  const frames=[];
  for(const e of events){
   if(e.type==='oldmaid.paired'){
    const ids=new Set(e.params.cards.map(c=>c.id));
    if(p.viewer===e.actor||p.openHands)data.hands[e.actor]=data.hands[e.actor].filter(c=>!ids.has(c.id));
    else data.hands[e.actor]=data.hands[e.actor].slice(0,-e.params.cards.length);
    data.discard=[...data.discard,...e.params.cards];
    if(!data.hands[e.actor].length){data.outOrder=[...p.data.outOrder];data.points=[...p.data.points];}
   }
   if(['oldmaid.drawn','oldmaid.paired'].includes(e.type)){
    const projection={...p,actions:[],data};
    const checkpoint=sceneFrame(projection);
    for(const person of checkpoint.players)if(data.hands[person.player].length)person.finishPlace=0;
    frames.push({eventId:e.id,scene:checkpoint});
   }
  }
  return frames;
 }
 // Concise, separately authored player introduction; full rulebook stays intact.
 metadata.rulebook.brief={"sections":[{"title":{"key":"oldmaid.brief.0.title","params":{}},"paragraphs":[{"key":"oldmaid.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"pair","caption":{"key":"oldmaid.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"oldmaid.brief.1.title","params":{}},"paragraphs":[{"key":"oldmaid.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"choose","caption":{"key":"oldmaid.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"oldmaid.brief.2.title","params":{}},"paragraphs":[{"key":"oldmaid.brief.2.text","params":{}}]}]};
 const sceneFrame=p=>({...scene(p),...sceneLayout(p),screenFamily:'cards',layout:{focus:'hands'},fieldSizing:'content',actionReserve:false});
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice,event,metric,eventScenes,scene:sceneFrame});
});
