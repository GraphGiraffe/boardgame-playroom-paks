(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;
})(globalThis,function(ports){
  'use strict';const {rollDie}=ports,Ending=ports.ending;
  const routes={quick:{3:15,8:26,20:34,31:49,43:58,22:7,39:18,52:36,61:45},
    classic:{3:22,8:30,20:41,28:55,50:67,71:92,17:4,39:19,54:31,62:43,87:64,96:75}};
  function create({playerCount,firstPlayer,preset,rng,options={}}){
    if(!routes[preset])throw Error('SNAKES_PRESET_INVALID');
    return {playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,
      data:{ending:Ending.create(playerCount,firstPlayer,options.endMode,undefined,Number(options.maxRounds||0)),positions:Array(playerCount).fill(0),dice:null,sides:6,finish:preset==='quick'?64:100,links:{...routes[preset]}}};
  }
  function validate(position){
    const {data:d,playerCount}=position,valid=n=>Number.isInteger(n)&&n>=0&&n<=d.finish;
    return Number.isSafeInteger(position.rng)&&position.rng>=0&&position.rng<=4294967295&&
      Ending.valid(d.ending,playerCount)&&d.finish===(position.preset==='quick'?64:100)&&d.sides===6&&(d.dice===null||Number.isInteger(d.dice)&&d.dice>=1&&d.dice<=6)&&
      Array.isArray(d.positions)&&d.positions.length===playerCount&&d.positions.every(valid)&&d.links&&typeof d.links==='object'&&!Array.isArray(d.links)&&
      Object.entries(d.links).every(([from,to])=>/^\d+$/.test(from)&&valid(Number(from))&&Number(from)>0&&Number(from)<d.finish&&valid(to)&&to>0&&to!==Number(from))&&
      (d.lastMove==null||Number.isInteger(d.lastMove.player)&&d.lastMove.player>=0&&d.lastMove.player<playerCount&&
        [d.lastMove.from,d.lastMove.landing,d.lastMove.to].every(valid)&&d.lastMove.roll===d.dice);
  }
  function actions(position,actor){return position.status==='playing'&&actor===position.turn?[{command:{type:'roll'},visibility:'public'}]:[];}
  function reduce(position,actor){
    const next=JSON.parse(JSON.stringify(position)),d=next.data,roll=rollDie(d.sides,next),from=d.positions[actor];
    let landing=from+roll;if(landing>d.finish)landing=2*d.finish-landing;
    d.dice=roll;const to=d.links[landing]||landing;
    d.lastMove={player:actor,from,landing,to,roll};d.positions[actor]=to;
    const fact=(type,params)=>({type:'snakes.'+type,actor,params,visibility:{kind:'public'}});
    const events=[fact('rolled',{roll,landing,to})];
    if(to===d.finish){Ending.record(d.ending,[actor]);events.push(fact('won',{}));}
    const turn=Ending.advance(d.ending,actor,{revision:(next.revision??0)+1});if(turn===null){next.status='finished';next.winners=d.ending.groups.length?Ending.winners(d.ending):d.positions.flatMap((value,player)=>value===Math.max(...d.positions)?[player]:[]);}else next.turn=turn;
    return {position:next,events,turnEnded:true};
  }
  const project=position=>JSON.parse(JSON.stringify(position.data));
  function result(position){const values=position.data.positions;return {winners:position.winners,
    places:Ending.places(position.data.ending,values),metrics:[{id:'position',values}]};}
  return Object.freeze({contractVersion:1,id:'snakes',minPlayers:2,maxPlayers:4,create,validate,actions,reduce,project,result});
});
