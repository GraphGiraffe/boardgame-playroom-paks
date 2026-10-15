(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomPackPresentation=api;
})(globalThis,function(){
  'use strict';
  const message=(key,params={})=>({key:'battleship.'+key,params});
  const coordinate=cell=>String.fromCharCode(65+cell%10)+(Math.floor(cell/10)+1);
  const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.wins'),
    presets:[{id:'russian',label:message('meta.russian')},{id:'classic',label:message('meta.classic')}],
    rules:[1,2,3].map(n=>message('rules.'+n))};
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
        kind:p.hit?'attack':'move',presentation:{type:'fire',cell:p.cell},sound:{id:p.sunk?'sea.sunk':p.hit?'sea.hit':'sea.miss'}};
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
  function scene(projection,context={}){
    return {contractVersion:1,id:'battleship-fields',family:'grid-board',columns:10,rows:10,
      fleets:[0,1].map(player=>({player,ships:projection.data.ships[player],indicators:fleet(projection,player,context)}))};
  }
  return Object.freeze({metadata,action,event,metric,scene,fleet,coordinate});
});
