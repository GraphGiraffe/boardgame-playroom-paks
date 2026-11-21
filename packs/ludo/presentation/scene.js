(function(root,factory){const source=typeof require==='function'&&!root.PlayroomPack;
 const api=factory(source?require('../domain/board.js'):root.PlayroomLudoBoard,
  root.PlayroomRouteTokenAsset||(source?require('../../../shared/presentation/route-token-asset.js'):null));
 if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(B,RouteTokenAsset){
 'use strict';const message=(key,params={})=>({key:'ludo.'+key,params}),player=index=>({kind:'player-reference',index});
 const token=new RouteTokenAsset(),pawnId=(owner,pawn)=>owner+'-'+pawn;
 const metadata={cover:{kind:'asset',id:'assets/cover.webp'},name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
  presets:['classic','teams'].map(id=>({id,label:message('presets.'+id)})),rules:Array.from({length:7},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"ludo.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"ludo.book.text.1","params":{}}}]},{"text":{"key":"ludo.rules.2","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"ludo.book.text.2","params":{}},{"key":"ludo.book.text.3","params":{}}]},{"type":"paragraph","text":{"key":"ludo.book.text.4","params":{}}}],"layout":"stack","figures":[{"id":"base","caption":{"key":"ludo.book.figure.base","params":{}},"role":"diagram"}]},{"text":{"key":"ludo.rules.3","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"ludo.book.text.5","params":{}},{"key":"ludo.book.text.6","params":{}},{"key":"ludo.book.text.7","params":{}}]},{"type":"list","ordered":false,"items":[{"key":"ludo.book.text.8","params":{}},{"key":"ludo.book.text.9","params":{}},{"key":"ludo.book.text.10","params":{}}]}],"layout":"stack","figures":[{"id":"move","caption":{"key":"ludo.book.figure.move","params":{}},"role":"diagram"}]},{"text":{"key":"ludo.rules.4","params":{}},"blocks":[{"type":"table","headers":[{"key":"ludo.book.text.11","params":{}},{"key":"ludo.book.text.12","params":{}}],"rows":[[{"key":"ludo.book.text.13","params":{}},{"key":"ludo.book.text.14","params":{}}],[{"key":"ludo.book.text.15","params":{}},{"key":"ludo.book.text.16","params":{}}]]},{"type":"paragraph","text":{"key":"ludo.book.text.17","params":{}}}],"layout":"stack","figures":[{"id":"safe","caption":{"key":"ludo.book.figure.safe","params":{}},"role":"diagram"}]},{"text":{"key":"ludo.rules.5","params":{}},"blocks":[{"type":"paragraph","text":{"key":"ludo.book.text.18","params":{}}},{"type":"paragraph","text":{"key":"ludo.book.text.19","params":{}}}]},{"text":{"key":"ludo.rules.6","params":{}},"blocks":[{"type":"paragraph","text":{"key":"ludo.book.text.20","params":{}}},{"type":"list","ordered":true,"items":[{"key":"ludo.book.text.21","params":{}},{"key":"ludo.book.text.22","params":{}},{"key":"ludo.book.text.23","params":{}}]}]},{"text":{"key":"ludo.rules.7","params":{}},"blocks":[{"type":"table","headers":[{"key":"ludo.book.text.24","params":{}},{"key":"ludo.book.text.25","params":{}}],"rows":[[{"key":"ludo.book.text.26","params":{}},{"key":"ludo.book.text.27","params":{}}],[{"key":"ludo.book.text.28","params":{}},{"key":"ludo.book.text.29","params":{}}],[{"key":"ludo.book.text.30","params":{}},{"key":"ludo.book.text.31","params":{}}]]},{"type":"paragraph","text":{"key":"ludo.book.text.32","params":{}}}]}],"brief":{"sections":[{"title":{"key":"ludo.brief.0.title","params":{}},"paragraphs":[{"key":"ludo.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"base","caption":{"key":"ludo.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"ludo.brief.1.title","params":{}},"paragraphs":[{"key":"ludo.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"move","caption":{"key":"ludo.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"ludo.brief.2.title","params":{}},"paragraphs":[{"key":"ludo.brief.2.text","params":{}}]}]}}};
 function action(command,projection){if(command.type==='roll')return message('actions.roll');
  const to=B.destinationProgress(projection,command);return message('actions.move',{dieIndex:command.dieIndex+1,die:projection.data.dice[command.dieIndex],pawn:command.pawn+1,to:to===57?message('location.home'):to});}
 function event(value){const p=value.params;
  if(value.type==='ludo.rolled')return {message:message('events.rolled',{dice:p.dice.join(', ')}),kind:'roll',reveal:{kind:'dice',dice:p.dice.map(value=>({value}))},presentation:{type:'roll'}};
  if(value.type==='ludo.skipped')return {message:message('events.skipped'),kind:'pass',feedback:{kind:'skip',player:value.actor}};
  if(value.type==='ludo.captured')return {message:message('events.captured',{owner:player(p.owner),target:player(p.target)}),kind:'capture',feedback:{kind:'capture',player:p.target}};
  if(value.type==='ludo.moved')return {message:message('events.moved',{owner:player(p.owner),pawn:p.pawn+1,to:p.to===57?message('location.home'):p.to}),kind:'move',sound:{id:p.to===57?'success.special':p.from<0?'success':'move'},presentation:{type:'move',owner:p.owner,pawn:p.pawn}};
  if(value.type==='ludo.won')return {message:message(p.members.length>1?'events.team-won':'events.won',{first:player(p.members[0]),second:player(p.members.at(-1))}),finish:true};
  throw Error('LUDO_EVENT_UNKNOWN');
 }
 const metric=id=>message(id==='team-home'?'meta.team-home':'meta.home');
 const route=[[1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],[0,7],[0,6]];
 route.unshift(route.pop()); // Starts face the outer edge; the previous square leads into the home lane.
 const base=[[0,0],[9,0],[9,9],[0,9]],lanes=[n=>[n+1,7],n=>[7,n+1],n=>[13-n,7],n=>[7,13-n]],lane=(p,n)=>lanes[p](n);
 // Base slots use 18% outer padding, then 12% inner padding and a 15% gap.
 // Their centers are 2.16 and 3.84 cells from each base edge.
 const finishLocation=(p,j)=>{
  const {x:spread,y:depth}=(globalThis.PlayroomTokenLayout||(typeof require==='function'?require('../../../shared/domain/token-layout.js'):null)).triangle(j);
  const centers=[[6+depth,7.5+spread],[7.5+spread,6+depth],[9-depth,7.5+spread],[7.5+spread,9-depth]];
  return centers[p].map(value=>value-.5);
 };
 const location=(p,j,n)=>n<0?[base[p][0]+1.66+(j%2)*1.68,base[p][1]+1.66+Math.floor(j/2)*1.68]:n<52?route[(p*13+n)%52]:n<57?lane(p,n-52):finishLocation(p,j);
 const anchor=(p,j,n)=>n<0?`base-${p}-${j}`:n<52?`path-${(p*13+n)%52}`:n<57?`home-${p}-${n}`:`finish-${p}`;
 function sequence(last){
  if(!last)return undefined;
  const {owner:p,pawn:j,from,to,captured}=last;
  return token.walk(pawnId(p,j),p,{trigger:'move',entry:from<0?'lift':undefined,arrival:to===57?'settle':undefined,
   departures:captured?.map(c=>pawnId(c.owner,c.pawn)),counter:'home',origin:{anchor:anchor(p,j,from)},
   steps:Array.from({length:from<0?1:to-from},(_,i)=>({anchor:anchor(p,j,from<0?0:from+i+1)}))});
 }

 function scene(projection){
  const d=projection.data,exits=[],moves=[],routes=[];
  let captureCount;
  for(const command of projection.actions){
   if(command.type!=='move')continue;
   const {owner,pawn}=command,index=owner*4+pawn,from=d.pawns[owner][pawn],to=B.destinationProgress(projection,command);
   if(from<0)exits[index]??=command;
   // Each die is a separate command even when its route and capture preview
   // match another die. The authorized position fixes each pawn's start.
   const landings=routes[index]??=[];
   let landing=landings[to];
   if(!landing){
    captureCount??=B.captureCounter(projection,owner);
    const capture=captureCount(to)>0;
    const route=Array.from({length:from<0?1:to-from},(_,i)=>anchor(owner,pawn,from<0?0:from+i+1));
    landing=landings[to]={capture,targetKind:from<0||to>=52?'home':capture?'capture':'move',anchor:route.at(-1),route};
   }
   moves.push({command,from,to,...landing});
  }
  const currentRoll=projection.events?.findLast(e=>e.type==='ludo.rolled')?.actor===projection.turn;
  return {guaranteedExit:d.guaranteedExit,sixReroll:d.sixReroll,repeatSix:d.phase==='roll'&&d.sixReroll&&d.dice.some(value=>value===6)&&currentRoll,
   contractVersion:1,id:'ludo-board',family:'route-board',motionSequence:sequence(d.last),moves,
   dice:d.dice.map((value,index)=>{
    const lastRolled=d.lastRolled?.includes(index)||false;
    return {value,used:d.used[index],rollable:d.rollIndices.includes(index),lastRolled,...(currentRoll&&lastRolled?{motion:'roll'}:{})};
   }),
   round:{number:d.ending.round,limit:d.ending.maxRounds||null,starts:d.ending.starts},
   pawns:d.pawns.flatMap((row,owner)=>row.map((progress,pawn)=>{
    const command=exits[owner*4+pawn];
    return {id:'token-'+owner+'-'+pawn,owner,pawn,progress,kind:progress<0?'base':progress===57?'finish':'track',point:location(owner,pawn,progress),anchor:anchor(owner,pawn,progress),friendly:owner===projection.turn||projection.preset==='teams'&&owner%2===projection.turn%2,label:message('view.pawn',{player:player(owner),pawn:pawn+1,location:progress<0?message('view.base'):progress===57?message('location.home'):progress}),...(command?{command}:{})};
   })),
   players:d.pawns.map((row,player)=>({player,finishPlace:(d.ending?.groups||[]).findIndex(group=>group.includes(player))+1,teamId:projection.preset==='teams'?(player%2?'red':'blue'):null,team:projection.preset==='teams'?{id:player%2?'red':'blue',label:message(player%2?'view.red':'view.blue'),colorRole:player%2?'side.red':'side.blue'}:null,
    metrics:[{id:'home',kind:'pieces',value:row.filter(n=>n===57).length,label:metric('home'),resultUsage:true},{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:false}]}))};
 }

 // Geometry contains only public identities from the authorized projection.
 const boardSides=['green','red','blue','yellow'];
 // Labels, geometry and visual roles cross the sandbox boundary as data only.
 function routeGeometry(){
  const path=route.map((point,index)=>({id:'path-'+index,point}));
  const track=path.map((cell,index)=>({...cell,kind:'path',label:message('view.track-cell',{cell:message('view.cell',{cell:index+1}),special:index%13===0?message('view.start'):index%13===8?message('view.safe'):''}),...(index%13===0?{side:index/13,symbol:'arrow',rotation:index/13}:index%13===8?{symbol:'star'}:{})}));
  const homes=boardSides.map((_,owner)=>Array.from({length:5},(_,index)=>({id:'home-'+owner+'-'+(index+52),point:lane(owner,index),kind:'home',side:owner,label:message('view.home-cell',{cell:index+1})})));
  const finishes=boardSides.map((_,owner)=>({id:'finish-'+owner,point:finishLocation(owner,0),kind:'finish',label:message('view.finish')}));
  return {path,homes,finishes,cells:[...track,...homes.flat(),...finishes]};
 }
 // The moves already contain exact authorized destinations and captures.
 // Use those records to bind the field and preserve a separate choice per die.
 function sceneLayout(p,view){
  const d=p.data,{path,homes,finishes,cells}=routeGeometry();
  const movesByDie=[];
  for(const move of view.moves)(movesByDie[move.command.dieIndex]??=[]).push(move);
  const dieOrder=Object.keys(movesByDie).map(Number).sort((a,b)=>d.dice[a]-d.dice[b]||a-b);
  const targets=new Set();
  const interactions=p.actions.filter(command=>command.type!=='move').flatMap(command=>command.type==='roll'
   ?d.dice.flatMap((_,index)=>d.rollIndices.includes(index)?[{command,kind:'activate',target:{entity:{namespace:'die',id:String(index)}}}]:[])
   :[{command,kind:'activate',target:{zone:'field'}}]);
  for(const die of dieOrder)for(const {command,anchor:key,to} of movesByDie[die]){
   const id=pawnId(command.owner,command.pawn),targetKey=id+':'+key;
   const move=token.move(id,command,{entity:{namespace:'die',id:String(command.dieIndex)}},{select:true});
   if(!targets.has(targetKey)){
    // Cells are emitted as the circuit, complete home lanes, then finishes.
    // A landing already has its position within that layout.
    const trackLength=path.length,laneLength=homes[command.owner].length;
    const index=to<trackLength?B.globalCell(command.owner,to):to<trackLength+laneLength
     ?command.owner*laneLength+to:cells.length-finishes.length+command.owner;
    interactions.push({...move,target:{zone:'field',index}});
   }
   targets.add(targetKey);
   interactions.push(move);
  }
  const geometry={topology:'route-grid',columns:15,rows:15,path,bases:base.map(([x,y],owner)=>({owner,x,y,width:6,height:6})),
   anchors:[...path,...d.pawns.flatMap((row,owner)=>[
    ...row.map((_,pawn)=>({id:'base-'+owner+'-'+pawn,owner,point:location(owner,pawn,-1)})),
    ...[...homes[owner],finishes[owner]].map(({id,point})=>({id,owner,point}))
   ])]};
  const objects=view.pawns.map(({owner,pawn,point})=>token.atPoint(pawnId(owner,pawn),'field',point,owner));
  d.dice.forEach((_,index)=>objects.push({ref:{namespace:'die',id:String(index)},zone:'field',index}));
  return {routeStyle:'cross-and-circle',boardSides,routeCells:cells,diceStyle:'flat',dicePlacement:p.audience==='public'?'status':'actions',
   geometry,zones:[{id:'field',kind:'board'}],objects,interactions};
 }

 return Object.freeze({metadata:Object.freeze({...metadata,eventInputs:'facts',presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,event,metric,scene:p=>{const view=scene(p);return {...view,...sceneLayout(p,view),screenFamily:'board',layout:{focus:'field',seats:['north-west','north-east','south-east','south-west'].slice(0,p.playerCount),duplicateSelf:true},fieldAspect:1,actionReserve:true};},route,base,lane,location,anchor,sequence,destination:B.destination});
});
