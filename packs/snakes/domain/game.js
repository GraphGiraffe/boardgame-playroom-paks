(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;
})(globalThis,function(ports){
  'use strict';const {rollDie}=ports,Ending=ports.ending;
  const routes={quick:{3:15,8:26,20:34,31:49,43:58,22:7,39:18,52:36,61:45},classic:{3:22,8:30,20:41,28:55,50:67,71:92,17:4,39:19,54:31,62:43,87:64,96:75}};
  const cells={64:{6:'extra',11:'skip',13:'adjust',17:'second',24:'shield',29:'less',32:'adjust',41:'second',47:'skip',50:'shield',55:'extra'},100:{6:'extra',12:'skip',14:'adjust',25:'second',33:'shield',46:'less',48:'adjust',69:'extra',73:'second',78:'skip',82:'shield'}};
  const face=n=>Number.isInteger(n)&&n>=1&&n<=6;
  function create({playerCount,firstPlayer,preset='plus',rng,options={}}){
    if(!['plus','classic','quick'].includes(preset))throw Error('SNAKES_PRESET_INVALID');
    const finish=Number(options.boardSize||(preset==='classic'?100:64));if(![64,100].includes(finish))throw Error('SNAKES_SIZE_INVALID');
    const preview={rng:(rng^0x9e3779b9)>>>0},dice=Array.from({length:preset==='plus'?2:1},()=>rollDie(6,preview));
    return {playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,data:{ending:Ending.create(playerCount,firstPlayer,options.endMode,undefined,Number(options.maxRounds||0)),positions:Array(playerCount).fill(0),dice:preset==='plus'?dice:dice[0],sides:6,finish,links:{...routes[finish===64?'quick':'classic']},phase:'roll',effects:Array.from({length:playerCount},()=>({adjust:false,less:false,skip:false,shield:false})),adjusting:false,special:preset==='plus'?{...cells[finish]}:{}}};
  }
  function validate(p){
    const d=p.data,valid=n=>Number.isInteger(n)&&n>=0&&n<=d.finish;
    return Number.isSafeInteger(p.rng)&&p.rng>=0&&p.rng<=4294967295&&Ending.valid(d.ending,p.playerCount)&&[64,100].includes(d.finish)&&d.sides===6&&['roll','move'].includes(d.phase)&&typeof d.adjusting==='boolean'&&
      (p.preset==='plus'?Array.isArray(d.dice)&&d.dice.length>=1&&d.dice.length<=2&&d.dice.every(face):face(d.dice))&&
      Array.isArray(d.positions)&&d.positions.length===p.playerCount&&d.positions.every(valid)&&
      Array.isArray(d.effects)&&d.effects.length===p.playerCount&&d.effects.every(e=>['adjust','less','skip','shield'].every(k=>typeof e[k]==='boolean'))&&
      JSON.stringify(d.special)===JSON.stringify(p.preset==='plus'?cells[d.finish]:{})&&d.links&&Object.entries(d.links).every(([a,b])=>valid(+a)&&+a>0&&+a<d.finish&&valid(b)&&b>0&&b!==+a)&&
      (!d.lastMove||[d.lastMove.from,d.lastMove.landing,d.lastMove.to].every(valid));
  }
  function destination(d,actor,dieIndex,delta=0){const distance=d.dice[dieIndex]+delta,from=d.positions[actor],landing=from+distance>d.finish?2*d.finish-from-distance:from+distance;return {distance,from,landing,to:d.links[landing]&&!(d.links[landing]<landing&&d.effects[actor].shield)?d.links[landing]:landing};}
  function actions(p,actor){
    if(p.status!=='playing'||actor!==p.turn)return [];
    const commands=p.data.phase==='roll'?[{type:'roll'}]:p.data.dice.flatMap((die,dieIndex)=>(p.data.adjusting?[0,-1,1]:[0]).filter(delta=>die+delta>=1&&die+delta<=6).map(delta=>({type:'move',dieIndex,delta})));
    return commands.map(command=>({command,visibility:'public'}));
  }
  function reduce(position,actor,command){
    const next=JSON.parse(JSON.stringify(position)),d=next.data,plus=next.preset==='plus',events=[],e=d.effects[actor];
    const fact=(type,params={},owner=actor)=>events.push({type:'snakes.'+type,actor:owner,params,visibility:{kind:'public'}});
    const protect=kind=>{if(!e.shield)return false;e.shield=false;fact('protected',{effect:kind});return true;};
    let extra=false;
    function travel(roll,automatic=false){
      const from=d.positions[actor];let landing=from+roll;if(landing>d.finish)landing=2*d.finish-landing;
      let to=d.links[landing]||landing;if(to<landing&&protect('snake'))to=landing;
      d.positions[actor]=to;d.lastMove={player:actor,from,landing,to,roll,finish:d.finish,trigger:command.type};
      fact('moved',{...d.lastMove,automatic});
      if(to===d.finish){Ending.record(d.ending,[actor]);fact('won');return;}
      const special=d.special[to];
      if(['skip','less'].includes(special)){if(!protect(special)){e[special]=true;fact('effect',{effect:special});}}
      else if(special==='adjust'||special==='shield'){e[special]=true;fact('effect',{effect:special});}
      else if(special==='extra'){extra=true;fact('extra');}
      if(special==='second'&&!automatic&&d.dice.length===2){fact('second');travel(d.dice[1-command.dieIndex],true);}
    }
    if(command.type==='roll'){
      if(plus){
        if(e.less&&e.shield){protect('less');e.less=false;}
        const count=e.less?1:2;e.less=false;d.dice=Array.from({length:count},()=>rollDie(6,next));d.adjusting=e.adjust;e.adjust=false;d.phase='move';d.lastMove=null;
        fact('rolled',{dice:d.dice});return {position:next,events,turnEnded:false};
      }
      d.dice=rollDie(6,next);travel(d.dice);
    }else{travel(d.dice[command.dieIndex]+command.delta);d.adjusting=false;}
    d.phase='roll';
    if(extra&&!Ending.done(d.ending,actor))return {position:next,events,turnEnded:true};
    const revision=(next.revision??0)+1;let from=actor,turn;
    // Skipped seats consume their effect without an input action. Empty circles
    // are coalesced into the same revision, preserving strictly ordered history.
    for(let i=0;i<=next.playerCount;i++){
      turn=d.ending.starts.at(-1)===revision?Ending.next(d.ending,from):Ending.advance(d.ending,from,{revision});
      if(turn===null)break;
      const pending=d.effects[turn];if(!pending.skip)break;
      pending.skip=false;if(pending.shield){pending.shield=false;fact('protected',{effect:'skip'},turn);break;}
      fact('skipped',{},turn);from=turn;
    }
    if(turn===null){next.status='finished';next.winners=d.ending.groups.length?Ending.winners(d.ending):d.positions.flatMap((v,p)=>v===Math.max(...d.positions)?[p]:[]);}else next.turn=turn;
    return {position:next,events,turnEnded:true};
  }
  const project=p=>JSON.parse(JSON.stringify(p.data));
  function bot(p,actor,legal){if(p.data.phase!=='move')return legal[0];return legal.reduce((best,a)=>{const score=c=>{const v=destination(p.data,actor,c.dieIndex,c.delta),kind=p.data.special[v.to];return v.to+({skip:-7,less:-3,second:4,extra:5,shield:3,adjust:2}[kind]||0);};return score(a)>score(best)?a:best;},legal[0]);}
  function result(p){const values=p.data.positions;return {winners:p.winners,places:Ending.places(p.data.ending,values),metrics:[{id:'position',values}]};}
  return Object.freeze({contractVersion:1,id:'snakes',minPlayers:2,maxPlayers:6,create,validate,actions,reduce,project,result,bot});
});
