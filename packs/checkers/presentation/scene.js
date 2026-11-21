(function(root,factory){const source=typeof require==='function'&&!root.PlayroomPack;
 const api=factory(source?require('../domain/board.js'):root.PlayroomCheckersBoard,
  root.PlayroomTokenAsset||(source?require('../../../shared/presentation/token-asset.js'):null));
 if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(B,TokenAsset){
 'use strict';const message=(key,params={})=>({key:'checkers.'+key,params});
 const token=new TokenAsset('checker');
 const metadata={cover:{kind:'asset',id:'assets/cover.webp'},name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),presets:['classic','quick'].map(id=>({id,label:message('presets.'+id)})),rules:Array.from({length:5},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"checkers.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"checkers.book.text.1","params":{}}},{"type":"paragraph","text":{"key":"checkers.book.text.2","params":{}}}]},{"text":{"key":"checkers.rules.2","params":{}},"blocks":[{"type":"paragraph","text":{"key":"checkers.book.text.3","params":{}}}],"layout":"stack","figures":[{"id":"move","caption":{"key":"checkers.book.figure.move","params":{}},"role":"diagram"}]},{"text":{"key":"checkers.rules.3","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"checkers.book.text.4","params":{}},{"key":"checkers.book.text.5","params":{}}]},{"type":"paragraph","text":{"key":"checkers.book.text.6","params":{}}}]},{"text":{"key":"checkers.rules.4","params":{}},"blocks":[{"type":"table","headers":[{"key":"checkers.book.text.7","params":{}},{"key":"checkers.book.text.8","params":{}}],"rows":[[{"key":"checkers.book.text.9","params":{}},{"key":"checkers.book.text.10","params":{}}],[{"key":"checkers.book.text.11","params":{}},{"key":"checkers.book.text.12","params":{}}],[{"key":"checkers.book.text.13","params":{}},{"key":"checkers.book.text.14","params":{}}]]}],"layout":"stack","figures":[{"id":"king","caption":{"key":"checkers.book.figure.king","params":{}},"role":"diagram"}]},{"text":{"key":"checkers.rules.5","params":{}},"blocks":[{"type":"paragraph","text":{"key":"checkers.book.text.15","params":{}}},{"type":"list","ordered":false,"items":[{"key":"checkers.book.text.16","params":{}},{"key":"checkers.book.text.17","params":{}}]}]}],"brief":{"sections":[{"title":{"key":"checkers.brief.0.title","params":{}},"paragraphs":[{"key":"checkers.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"move","caption":{"key":"checkers.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"checkers.brief.1.title","params":{}},"paragraphs":[{"key":"checkers.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"king","caption":{"key":"checkers.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"checkers.brief.2.title","params":{}},"paragraphs":[{"key":"checkers.brief.2.text","params":{}}]}]}}};
 const choice=(command,projection)=>({capture:B.moves(projection,projection.actor).find(move=>move.from===command.from&&move.to===command.to)?.victim!=null});
 const action=(command,projection)=>message(choice(command,projection).capture?'actions.capture':'actions.move',{from:B.cellName(command.from),to:B.cellName(command.to)});
 function event(value){const p=value.params;
  if(value.type==='checkers.moved')return {message:message(p.promoted?'events.promoted':'events.moved',{from:B.cellName(p.from),to:B.cellName(p.to),symbol:p.captured?'×':'→'}),
   kind:p.captured?'capture':'move',...(p.captured?{feedback:{kind:'capture',player:p.target}}:{}),sound:p.captured?{id:'attack.capture',target:p.target}:{id:p.promoted?'notify':'move'},presentation:{type:'move',from:p.from,to:p.to}};
  if(value.type==='checkers.won')return {message:message('events.won'),finish:true};
  if(value.type==='checkers.repeated')return {message:message('events.repeated'),finish:true};
  if(value.type==='checkers.quiet')return {message:message('events.quiet'),finish:true};
  throw Error('CHECKERS_EVENT_UNKNOWN');
 }
 // Legal moves and their explanations belong to the isolated presentation.
 function checkerLayout(p){const d=p.data,light=d.lightPlayer??0,flipped=p.viewer>=0&&p.viewer!==light,moves=p.actions.map(command=>{const take=choice(command,p).capture,piece=d.board[command.from];return {command,source:token.ref(piece.id),from:command.from,to:command.to,capture:take,kingMove:!!piece.king&&Math.abs(Math.floor(command.to/8)-Math.floor(command.from/8))>1,label:action(command,p),help:message(take?'view.capture-help':'view.move-help',{cell:B.cellName(command.to)})};}),movable=new Set(moves.map(move=>move.from)),mandatory=moves.some(move=>move.capture);
  return {kind:'draughts',label:message('view.board'),flipped,moves,cells:d.board.map((piece,cell)=>{const row=Math.floor(cell/8),col=cell%8,coord=B.cellName(cell),captured=d.captured.includes(cell),base=piece?message(captured?'view.captured-help':piece.king?'view.king-help':'view.man-help'):'';return {cell,file:(flipped?row===0:row===7)?'abcdefgh'[col]:'',rank:(flipped?col===7:col===0)?String(8-row):'',label:piece?message('view.cell-piece',{cell:coord,kind:message(piece.king?'view.king':'view.man'),player:{kind:'player-reference',index:piece.owner},captured:captured?message('view.captured'):''}):coord,help:piece&&!captured?message('view.piece-help',{selection:movable.has(cell)?message(d.forced===cell?'view.continue-help':'view.select-help'):'',mandatory:mandatory?message('view.mandatory-help'):'',piece:base}):base};})};
 }
 const metric=()=>message('meta.wins');
 const scene=projection=>({contractVersion:1,id:'checkers-board',family:'grid-board',columns:8,rows:8,checkerLayout:checkerLayout(projection),forced:projection.data.forced,lightPlayer:projection.data.lightPlayer??0,
  pieces:projection.data.board.flatMap((piece,cell)=>piece?[{...piece,side:piece.owner===(projection.data.lightPlayer??0)?0:1,cell,captured:projection.data.captured.includes(cell)}]:[]),
  players:[0,1].map(player=>({player,metrics:[{id:'pieces',kind:'pieces',value:projection.data.board.filter(piece=>piece?.owner===player).length,label:message(player===(projection.data.lightPlayer??0)?'view.light':'view.dark'),resultUsage:true},{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:false}]}))});

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){
  const {board}=p.data;
  return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'board'}],
   objects:board.flatMap((piece,cell)=>piece?[token.atCell(piece.id,'field',cell,piece.owner)]:[]),
   interactions:p.actions.map(command=>{
    const piece=board[command.from],target=command.to!=null?{zone:'field',cell:command.to}:{zone:'field'};
    return piece?token.move(piece.id,command,target,{select:true}):{command,kind:'activate',target};
   })};
 }
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),choice,action,event,metric,scene:p=>({...scene(p),...sceneLayout(p),screenFamily:'board',fieldAspect:1})});
});
