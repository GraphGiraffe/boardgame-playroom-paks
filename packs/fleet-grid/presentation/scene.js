(function(root,factory){
  const BoardAsset=root.PlayroomBoardAsset||(typeof require==='function'?require('../../../shared/presentation/board-asset.js'):null);
  const api=factory(BoardAsset);
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomPackPresentation=api;
})(globalThis,function(BoardAsset){
  'use strict';
  const board=new BoardAsset();
  const message=(key,params={})=>({key:'battleship.'+key,params});
  const coordinate=cell=>String.fromCharCode(65+cell%10)+(Math.floor(cell/10)+1);
  const metadata={cover:{kind:'asset',id:'assets/cover.webp'},name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:[{id:'classic',label:message('meta.classic')},{id:'russian',label:message('meta.russian')}],
    rules:Array.from({length:5},(_,i)=>message('rules.'+(i+1))),rulebook:{"sections":[{"text":{"key":"battleship.rules.1","params":{}},"blocks":[{"type":"paragraph","text":{"key":"battleship.book.text.1","params":{}}}]},{"text":{"key":"battleship.rules.2","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"battleship.book.text.2","params":{}},{"key":"battleship.book.text.3","params":{}},{"key":"battleship.book.text.4","params":{}}]},{"type":"paragraph","text":{"key":"battleship.book.text.5","params":{}}}],"layout":"stack","figures":[{"id":"place","caption":{"key":"battleship.book.figure.place","params":{}},"role":"diagram"}]},{"text":{"key":"battleship.rules.3","params":{}},"blocks":[{"type":"table","headers":[{"key":"battleship.book.text.6","params":{}},{"key":"battleship.book.text.7","params":{}},{"key":"battleship.book.text.8","params":{}}],"rows":[[{"key":"battleship.book.text.9","params":{}},{"key":"battleship.book.text.10","params":{}},{"key":"battleship.book.text.11","params":{}}],[{"key":"battleship.book.text.12","params":{}},{"key":"battleship.book.text.13","params":{}},{"key":"battleship.book.text.14","params":{}}]]},{"type":"paragraph","text":{"key":"battleship.book.text.15","params":{}}}]},{"text":{"key":"battleship.rules.4","params":{}},"blocks":[{"type":"list","ordered":true,"items":[{"key":"battleship.book.text.16","params":{}},{"key":"battleship.book.text.17","params":{}}]},{"type":"paragraph","text":{"key":"battleship.book.text.18","params":{}}}],"layout":"stack","figures":[{"id":"shoot","caption":{"key":"battleship.book.figure.shoot","params":{}},"role":"diagram"},{"id":"fleets","caption":{"key":"battleship.book.figure.fleets","params":{}},"role":"diagram"}]},{"text":{"key":"battleship.rules.5","params":{}},"blocks":[{"type":"table","headers":[{"key":"battleship.book.text.19","params":{}},{"key":"battleship.book.text.20","params":{}}],"rows":[[{"key":"battleship.book.text.21","params":{}},{"key":"battleship.book.text.22","params":{}}],[{"key":"battleship.book.text.23","params":{}},{"key":"battleship.book.text.24","params":{}}]]},{"type":"paragraph","text":{"key":"battleship.book.text.25","params":{}}}]}],"brief":{"sections":[{"title":{"key":"battleship.brief.0.title","params":{}},"paragraphs":[{"key":"battleship.brief.0.text","params":{}}],"layout":"row","figures":[{"id":"place","caption":{"key":"battleship.brief.0.caption","params":{}},"role":"diagram"}]},{"title":{"key":"battleship.brief.1.title","params":{}},"paragraphs":[{"key":"battleship.brief.1.text","params":{}}],"layout":"row","figures":[{"id":"shoot","caption":{"key":"battleship.brief.1.caption","params":{}},"role":"diagram"}]},{"title":{"key":"battleship.brief.2.title","params":{}},"paragraphs":[{"key":"battleship.brief.2.text","params":{}}]}]}}};
  function action(command,projection){
    const d=projection.data;
    if(command.type==='fire')return message('actions.fire',{cell:coordinate(command.cell)});
    if(command.type==='auto')return message('actions.auto');
    if(command.type==='orient')return message(d.orientation[projection.viewer]?'actions.orient-horizontal':'actions.orient-vertical');
    if(command.type==='ready')return message('actions.ready');
    if(command.type==='remove')return message('actions.remove',{size:d.ships[projection.viewer][command.ship].length});
    if(command.type==='move')return message('actions.move',{size:d.ships[projection.viewer][command.ship].length,cell:coordinate(command.start)});
    return message('actions.place',{size:command.size,orientation:message(command.vertical?'orientation.vertical':'orientation.horizontal'),cell:coordinate(command.start)});
  }
  function event(value){
    if(value.type==='battleship.ready')return {message:message('events.ready'),kind:'action'};
    if(value.type==='battleship.started')return {message:message('events.started'),kind:'action',sound:{id:'sea.start'}};
    if(value.type==='battleship.arranged')return {message:message('events.arranged',{operation:message('operation.'+value.params.operation)}),kind:'move'};
    if(value.type==='battleship.won')return {message:message('events.won'),finish:true};
    if(value.type==='battleship.fired'){
      const p=value.params;
      return {message:message('events.fired',{cell:coordinate(p.cell),outcome:message(p.sunk?'shot.sunk':p.hit?'shot.hit':'shot.miss')}),
        kind:p.hit?'attack':'move',...(p.hit?{feedback:{kind:p.sunk?'sunk':'damage',player:1-value.actor}}:{}),presentation:{type:'fire',cell:p.cell},sound:{id:p.sunk?'sea.sunk':p.hit?'sea.hit':'sea.miss'}};
    }
    throw Error('BATTLESHIP_EVENT_UNKNOWN');
  }
  const metric=id=>message(id==='hits'?'meta.hits':'meta.victory');
  function fleet(projection,player,{viewer=-1,active=false,selected=null}={}){
    const d=projection.data,setup=d.phase==='setup';
    return (d.fleetCounts?.[player]||[]).map(({count,size})=>({id:'fleet-'+size,icon:'ship',value:count,size,
      label:message(setup&&player===viewer?'fleet.remaining':'fleet.afloat',{size}),complete:setup&&player===viewer&&count===0,
      ...(active&&player===viewer&&count>0?{dragPiece:'new:'+size}:{}),
      vertical:!!(active&&d.orientation[viewer]),selected:player===viewer&&selected==='new:'+size}));
  }
  // Board ink and legal placement choices are derived only from this viewer's projection.
  function fleetLayout(p){
    const d=p.data,base=p.viewer>=0?p.viewer:0,setup=d.phase==='setup',active=setup&&p.actions.some(c=>c.type==='auto')?p.viewer:null;
    const find=type=>p.actions.find(c=>c.type===type),command=type=>find(type)?{command:find(type)}:{};
    const boards=[0,1].map(player=>{
      const known=d.ships[player].flatMap((cells,index)=>cells.every(Number.isInteger)?[{ref:{namespace:'ship',id:player+'-'+index},cells,vertical:cells.length>1&&cells[1]-cells[0]===10,label:message('board.ship-select',{size:cells.length}),...(p.actions.find(c=>c.type==='remove'&&c.ship===index)&&player===active?{remove:p.actions.find(c=>c.type==='remove'&&c.ship===index)}:{}),...(player===active&&p.actions.find(c=>c.type==='move'&&c.ship===index&&c.start===cells[0]&&c.vertical!==(cells.length>1&&cells[1]-cells[0]===10))?{rotate:p.actions.find(c=>c.type==='move'&&c.ship===index&&c.start===cells[0]&&c.vertical!==(cells.length>1&&cells[1]-cells[0]===10))}:{})}]:[]);
      return {player,label:message('board.label',{player:{kind:'player-reference',index:player}}),indicators:fleet(p,player,{viewer:p.viewer}),ships:known,cells:Array.from({length:100},(_,cell)=>{const shot=d.shots[1-player].find(s=>s.cell===cell),mark=d.marks[1-player].includes(cell),ship=known.find(s=>s.cells.includes(cell)),content=shot?message(shot.hit?'board.hit':'board.miss'):mark?message('board.miss'):ship?message('board.ship'):null;return {cell,shot:shot?(shot.hit?'hit':'miss'):mark?'miss':null,label:content?message('board.cell',{cell:coordinate(cell),content}):coordinate(cell)};})};
    });
    return {kind:'naval',base,setupPlayer:active,preferredPlayer:setup?base:p.turn===base?1-base:base,orientation:!!d.orientation[base],boards,
      placements:p.actions.filter(c=>['place','move'].includes(c.type)).map(c=>({command:c,source:c.type==='place'?{zone:'inventory-'+p.actor,index:c.size}:{entity:{namespace:'ship',id:p.actor+'-'+c.ship}},cell:c.start,vertical:c.vertical,preserveSelection:c.type==='move'})),
      controls:{auto:{label:message(d.ready[base]?'setup.opponent':'setup.auto'),...command('auto')},ready:{label:message('setup.ready'),...command('ready')},orient:{label:action({type:'orient'},p),...command('orient')},rotateLabel:message('setup.rotate'),removeLabel:message('setup.remove'),followLabel:message('view.follow'),ownLabel:p.viewer<0?message('view.player',{player:{kind:'player-reference',index:0}}):message('view.own'),enemyLabel:p.viewer<0?message('view.player',{player:{kind:'player-reference',index:1}}):message('view.enemy')}};
  }
  function scene(projection,context={viewer:projection.viewer}){
    return {contractVersion:1,id:'battleship-fields',fleetLayout:fleetLayout(projection),phase:projection.data.phase,ready:projection.data.ready,personalSurfaceAllowed:projection.data.phase!=='setup',family:'grid-board',columns:10,rows:10,setup:projection.data.phase==='setup',orientation:projection.data.orientation,shots:projection.data.shots,marks:projection.data.marks,
      players:[0,1].map(player=>({player,indicators:fleet(projection,player,context),metrics:[{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:true}]})),
      fleets:[0,1].map(player=>({player,ships:projection.data.ships[player],indicators:fleet(projection,player,context)}))};
  }

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){
  const d=p.data,actor=p.actor>=0?p.actor:p.turn,own='fleet-'+actor;
  const zones=d.ships.flatMap((_,owner)=>[{id:'fleet-'+owner,kind:'board',owner},{id:'inventory-'+owner,kind:'stock',owner}]);
  const objects=d.ships.flatMap((ships,owner)=>ships.flatMap((cells,index)=>cells.every(Number.isInteger)?[{ref:{namespace:'ship',id:owner+'-'+index},zone:'fleet-'+owner,owner,cells}]:[]));
  const interactions=p.actions.map(command=>{
   const ship=command.ship!=null?{entity:{namespace:'ship',id:actor+'-'+command.ship}}:null;
   const source=ship??(command.type==='place'?{zone:'inventory-'+actor,index:command.size}:null);
   const target=command.type==='fire'?board.target(command.cell,'fleet-'+(1-actor)):
    command.start!=null?board.target(command.start,own):ship??board.target(null,own);
   return {command,kind:['place','move'].includes(command.type)?'move':command.type==='orient'?'select':'activate',
    ...(source?{source,activation:'select',gestures:{drag:true,swipe:false}}:{}),target};
  });
  return board.layout({kind:'table',zones,objects,interactions});
 }
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice:command=>({preserveSelection:command.type==='orient'||command.type==='move'}),event,metric,scene:p=>({...scene(p),...sceneLayout(p),screenFamily:'board',layout:{overrides:{opponentsAlign:'end',playerIndicators:'below-avatar',mirrorIndicators:true}},fieldAspect:10/11,actionReserve:true}),fleet,coordinate});
});
