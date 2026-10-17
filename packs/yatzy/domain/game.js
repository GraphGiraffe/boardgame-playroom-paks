// Pure Yatzy rules; the only external operation is deterministic die generation.
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory;
  root.PlayroomPackDefinitionFactory=factory;
})(globalThis,function(ports,categories){
  'use strict';
  const {rollDie}=ports;
  const event=(type,actor,params={})=>({type:'yatzy.'+type,actor,params,visibility:{kind:'public'}});
  function create({playerCount,firstPlayer,preset,rng,options={}}){
    if(preset!=='classic'||!Number.isSafeInteger(rng)||rng<0||rng>4294967295)throw Error('YATZY_OPTIONS_INVALID');
    return {playerCount,turn:firstPlayer,status:'playing',winners:[],rng,
      data:{dice:[1,1,1,1,1],held:[false,false,false,false,false],rolls:0,
        roundLimit:Number(options.maxRounds||15),roundStarts:[0],scores:Array.from({length:playerCount},()=>({})),round:0}};
  }
  function validate(position){
    const {data:d,playerCount,rng}=position;
    if(!Number.isSafeInteger(rng)||rng<0||rng>4294967295||
       !Array.isArray(d.dice)||d.dice.length!==5||!d.dice.every(n=>Number.isInteger(n)&&n>=1&&n<=6)||
       !Array.isArray(d.held)||d.held.length!==5||!d.held.every(v=>typeof v==='boolean')||
       !Number.isInteger(d.rolls)||d.rolls<0||d.rolls>3||
       !Array.isArray(d.scores)||d.scores.length!==playerCount||
       !d.scores.every(row=>row&&typeof row==='object'&&!Array.isArray(row)&&
         Object.keys(row).every(key=>categories.keys.includes(key)&&Number.isInteger(row[key])&&row[key]>=0&&row[key]<=50))||
       !Number.isInteger(d.roundLimit)||d.roundLimit<1||d.roundLimit>15||!Array.isArray(d.roundStarts)||!Number.isInteger(d.round)||d.round<0||d.round>d.roundLimit*playerCount)return false;
    if(d.scores.reduce((sum,row)=>sum+Object.keys(row).length,0)!==d.round)return false;
    return position.status==='finished'?d.round===d.roundLimit*playerCount:d.round<d.roundLimit*playerCount;
  }
  function actions(position,actor){
    if(position.status!=='playing'||actor!==position.turn)return [];
    const d=position.data,commands=[];
    if(d.rolls===0)commands.push({type:'roll'});
    else{
      if(d.rolls<3){
        commands.push({type:'roll'});
        d.held.forEach((_,index)=>commands.push({type:'hold',index}));
      }
      for(const key of categories.keys)if(d.scores[actor][key]===undefined)commands.push({type:'score',key});
    }
    return commands.map(command=>({command,visibility:'public'}));
  }
  function reduce(position,actor,command){
    const next=JSON.parse(JSON.stringify(position)),d=next.data,events=[];
    if(command.type==='hold')d.held[command.index]=!d.held[command.index];
    else if(command.type==='roll'){
      d.dice=d.dice.map((n,index)=>d.rolls===0||!d.held[index]?rollDie(6,next):n);
      d.rolls++;
      events.push(event('rolled',actor,{rolls:d.rolls,dice:[...d.dice]}));
    }else{
      const hadBonus=categories.upper(d.scores[actor])>=63;
      const points=categories.value(d.dice,command.key);
      d.scores[actor][command.key]=points;
      events.push(event('scored',actor,{category:command.key,points,dice:[...d.dice]}));
      if(!hadBonus&&categories.upper(d.scores[actor])>=63)events.push(event('bonus',actor,{points:50}));
      d.round++;d.rolls=0;d.held.fill(false);
      if(d.round===d.roundLimit*position.playerCount){
        const totals=d.scores.map(categories.total),top=Math.max(...totals);
        const winners=totals.flatMap((value,index)=>value===top?[index]:[]);
        next.status='finished';next.winners=winners.length===position.playerCount?[]:winners;
        events.push(event('finished',null,{top}));
      }else{next.turn=(actor+1)%position.playerCount;if(d.round%position.playerCount===0)d.roundStarts.push((position.revision??0)+1);}
    }
    return {position:next,events,turnEnded:command.type==='score'};
  }
  function project(position){
    const d=position.data,upper=d.scores.map(categories.upper);
    return {...JSON.parse(JSON.stringify(d)),totals:d.scores.map(categories.total),upper,
      bonuses:upper.map(value=>value>=63?50:0),
      previews:Object.fromEntries(categories.keys.map(key=>[key,categories.value(d.dice,key)]))};
  }
  function bot(projection,actor,commands){
    const d=projection.data;
    if(d.rolls===0)return commands.find(a=>a.type==='roll');
    if(d.rolls<3&&d.dice.filter(value=>value===Math.max(...d.dice)).length<4)return commands.find(a=>a.type==='roll');
    return commands.filter(a=>a.type==='score').sort((a,b)=>d.previews[b.key]-d.previews[a.key])[0];
  }
  function result(position){
    const values=position.data.scores.map(categories.total);
    return {winners:position.winners,places:values.map(value=>1+new Set(values.filter(other=>other>value)).size),
      metrics:[{id:'points',values}]};
  }
  return Object.freeze({contractVersion:1,id:'yatzy',minPlayers:2,maxPlayers:6,create,validate,actions,reduce,project,bot,result});
});
