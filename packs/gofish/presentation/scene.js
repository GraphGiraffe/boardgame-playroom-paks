(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(){
  'use strict';const message=(key,params={})=>({key:'gofish.'+key,params});
  const rank=number=>message(number>=11?'rank.'+number:'rank.numeric',{rank:number});
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:[{id:'classic',label:message('meta.classic')}],rules:[1,2,3,4].map(index=>message('rules.'+index))};
  const action=command=>command.type==='draw'?message('actions.draw'):message('actions.ask',{rank:rank(command.rank),target:{kind:'player-reference',index:command.target}});
  function choice(command,projection){return command.type==='ask'?{card:projection.data.hands[projection.viewer].find(card=>card.rank===command.rank).id,targetKind:'player',targetSource:true}:{};}
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
  const scene=projection=>({contractVersion:1,id:'gofish-table',family:'card-table',stockCount:projection.data.drawPile.length,
    players:projection.data.hands.map((hand,player)=>({player,hand,books:projection.data.books[player],bookCards:projection.data.bookCards[player],
      metrics:[{id:'books',kind:'points',value:projection.data.books[player].length,label:metric(),resultUsage:true}]}))});

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'table'},...d.hands.map((hand,owner)=>({id:'hand-'+owner,kind:'hand',owner,count:hand.length}))],objects:d.hands.flatMap((hand,owner)=>hand.flatMap((card,index)=>card&&!card.hidden&&card.id!=null?[{ref:{namespace:'card',id:String(card.id)},zone:'hand-'+owner,index}]:[])),interactions:p.actions.map(command=>({command,target:command.cardId!=null?{entity:{namespace:'card',id:String(command.cardId)}}:{zone:'field'}}))};}
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
    else data.hands[e.actor].splice(-e.params.count);
    data.books[e.actor].push(e.params.rank);data.bookCards[e.actor].push(e.params.cards[0]);
   }
   if(['gofish.given','gofish.drawn','gofish.booked'].includes(e.type)){
    const projected={...p,actions:[],data:JSON.parse(JSON.stringify(data))};
    frames.push({eventId:e.id,scene:{...scene(projected),...sceneLayout(projected)}});
   }
  }
  return frames;
 }
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice,event,metric,scene:p=>({...scene(p),...sceneLayout(p)}),rank,eventScenes});
});
