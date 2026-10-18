(function(root,factory){const source=typeof require==='function'&&!root.PlayroomPack;
 const api=factory(source?require('../domain/board.js'):root.PlayroomLudoBoard);
 if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(B){
 'use strict';const message=(key,params={})=>({key:'ludo.'+key,params}),player=index=>({kind:'player-reference',index});
 const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
  presets:['classic','teams'].map(id=>({id,label:message('presets.'+id)})),rules:[1,2,3,4,5].map(index=>message('rules.'+index))};
 function action(command,projection){if(command.type==='roll')return message('actions.roll');
  const to=B.destination(projection,command).to;return message('actions.move',{dieIndex:command.dieIndex+1,die:projection.data.dice[command.dieIndex],pawn:command.pawn+1,to:to===57?message('location.home'):to});}
 function event(value){const p=value.params;
  if(value.type==='ludo.rolled')return {message:message('events.rolled',{dice:p.dice.join(', ')}),kind:'roll',reveal:{kind:'dice',dice:p.dice.map(value=>({value}))},presentation:{type:'roll'}};
  if(value.type==='ludo.skipped')return {message:message('events.skipped'),kind:'pass',feedback:{kind:'skip',player:value.actor}};
  if(value.type==='ludo.captured')return {message:message('events.captured',{owner:player(p.owner),target:player(p.target)}),kind:'capture'};
  if(value.type==='ludo.moved')return {message:message('events.moved',{owner:player(p.owner),pawn:p.pawn+1,to:p.to===57?message('location.home'):p.to}),kind:'move',sound:{id:p.to===57?'success.special':p.from<0?'success':'move'},presentation:{type:'move',owner:p.owner,pawn:p.pawn}};
  if(value.type==='ludo.won')return {message:message(p.members.length>1?'events.team-won':'events.won',{first:player(p.members[0]),second:player(p.members.at(-1))}),finish:true};
  throw Error('LUDO_EVENT_UNKNOWN');
 }
 const metric=id=>message(id==='team-home'?'meta.team-home':'meta.home');
 const route=[[1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],[0,7],[0,6]];
 route.unshift(route.pop()); // Starts face the outer edge; the previous square leads into the home lane.
 const base=[[0,0],[9,0],[9,9],[0,9]],lane=(p,n)=>[[n+1,7],[7,n+1],[13-n,7],[7,13-n]][p];
 // Base slots use 18% outer padding, then 12% inner padding and a 15% gap.
 // Their centers are 2.16 and 3.84 cells from each base edge.
 const finishLocation=(p,j)=>{
  const {x:spread,y:depth}=(globalThis.PlayroomTokenLayout||(typeof require==='function'?require('../../../shared/domain/token-layout.js'):null)).triangle(j);
  const centers=[[6+depth,7.5+spread],[7.5+spread,6+depth],[9-depth,7.5+spread],[7.5+spread,9-depth]];
  return centers[p].map(value=>value-.5);
 };
 const location=(p,j,n)=>n<0?[base[p][0]+1.66+(j%2)*1.68,base[p][1]+1.66+Math.floor(j/2)*1.68]:n<52?route[(p*13+n)%52]:n<57?lane(p,n-52):finishLocation(p,j);
 const anchor=(p,j,n)=>n<0?`base-${p}-${j}`:n<52?`path-${(p*13+n)%52}`:n<57?`home-${p}-${n}`:`finish-${p}`;
 function sequence(last){if(!last)return undefined;const {owner:p,pawn:j,from,to}=last;return {trigger:'move',entry:from<0?'lift':undefined,arrival:to===57?'settle':undefined,entity:`token-${p}-${j}`,player:p,counter:'home',origin:{anchor:anchor(p,j,from)},steps:Array.from({length:from<0?1:to-from},(_,i)=>({anchor:anchor(p,j,from<0?0:from+i+1)}))};}

 function scene(projection){return {contractVersion:1,id:'ludo-board',family:'route-board',round:{number:projection.data.ending.round,limit:projection.data.ending.maxRounds||null,starts:projection.data.ending.starts},
  pawns:projection.data.pawns.flatMap((row,owner)=>row.map((progress,pawn)=>({id:'token-'+owner+'-'+pawn,owner,pawn,progress,point:location(owner,pawn,progress)}))),
  players:projection.data.pawns.map((row,player)=>({player,teamId:projection.preset==='teams'?(player%2?'red':'blue'):null,team:projection.preset==='teams'?{id:player%2?'red':'blue',label:message(player%2?'view.red':'view.blue'),colorRole:player%2?'side.red':'side.blue'}:null,
   metrics:[{id:'home',kind:'pieces',value:row.filter(n=>n===57).length,label:metric('home'),resultUsage:true},{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:false}]}))};}
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,event,metric,scene,route,base,lane,location,anchor,sequence,destination:B.destination});
});
