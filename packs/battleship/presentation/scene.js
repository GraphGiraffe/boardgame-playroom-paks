(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomPackPresentation=api;
})(globalThis,function(){
  'use strict';
  const message=(key,params={})=>({key:'battleship.'+key,params});
  const coordinate=cell=>String.fromCharCode(65+cell%10)+(Math.floor(cell/10)+1);
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
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
  function scene(projection,context={viewer:projection.viewer}){
    return {contractVersion:1,id:'battleship-fields',phase:projection.data.phase,ready:projection.data.ready,personalSurfaceAllowed:projection.data.phase!=='setup',family:'grid-board',columns:10,rows:10,setup:projection.data.phase==='setup',orientation:projection.data.orientation,shots:projection.data.shots,marks:projection.data.marks,
      players:[0,1].map(player=>({player,indicators:fleet(projection,player,context),metrics:[{id:'wins',kind:'wins',value:projection.winners.includes(player)?1:0,label:metadata.scoreLabel,resultUsage:true}]})),
      fleets:[0,1].map(player=>({player,ships:projection.data.ships[player],indicators:fleet(projection,player,context)}))};
  }

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'table'},...d.ships.map((_,owner)=>({id:'fleet-'+owner,kind:'board',owner}))],objects:d.ships.flatMap((ships,owner)=>ships.flatMap((cells,index)=>cells.every(Number.isInteger)?[{ref:{namespace:'ship',id:owner+'-'+index},zone:'fleet-'+owner,owner,cells}]:[])),interactions:p.actions.map(command=>({command,target:{zone:'field'}}))};}
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}),action,choice:command=>({preserveSelection:command.type==='orient'||command.type==='move'}),event,metric,scene:p=>({...scene(p),...sceneLayout(p)}),fleet,coordinate});
});
