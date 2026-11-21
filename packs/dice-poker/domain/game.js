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
    const preview={rng:(rng^0x9e3779b9)>>>0};
    return {playerCount,turn:firstPlayer,status:'playing',winners:[],rng,
      data:{dice:Array.from({length:5},()=>rollDie(6,preview)),held:[false,false,false,false,false],rolls:0,
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
  function project(position){return JSON.parse(JSON.stringify(position.data));}
  function localData(position){
    const d=position.data,upper=d.scores.map(categories.upper);
    return {...JSON.parse(JSON.stringify(d)),totals:d.scores.map(categories.total),upper,
      bonuses:upper.map(value=>value>=63?50:0),
      previews:Object.fromEntries(categories.keys.map(key=>[key,categories.value(d.dice,key)]))};
  }
  function bot(projection,actor,commands,memory,context={}){
    const d=projection.data,depth=context.depth??2;
    if(d.rolls===0)return commands.find(a=>a.type==='roll');
    const row=d.scores[actor],upper=categories.upper(row),upperKeys=categories.keys.slice(0,6);
    const futureTurns=d.roundLimit-Object.keys(row).length>1;
    const bonusReachable=upper<63&&upper+upperKeys.reduce((sum,key,index)=>sum+(row[key]===undefined?5*(index+1):0),0)>=63;
    // Reservation weights, not probabilities: keep flexible Chance for mixed
    // rolls and avoid scratching an easy combination to save a weak upper score.
    const scratchCost={pair:8,twoPairs:12,three:12,four:14,smallStraight:10,largeStraight:12,fullHouse:15,yatzy:18};
    const utility=command=>{
      const points=d.previews[command.key],face=upperKeys.indexOf(command.key)+1;
      const bonus=face&&upper<63&&upper+points>=63?50:0;
      // Short games can finish before every slot is used. On our last turn,
      // only actual score (including the real upper bonus) still matters.
      if(!futureTurns)return points+bonus;
      if(command.key==='yatzy'&&points===50)return 1000;
      if(command.key==='chance')return points-(depth===1?5:8);
      if(face){
        const surplus=points-3*face;
        return points+Math.min(0,surplus)+(bonusReachable?Math.max(0,surplus):0)+bonus;
      }
      return points||-scratchCost[command.key];
    };
    const best=commands.filter(a=>a.type==='score').reduce((chosen,command)=>{
      if(!chosen)return command;
      const difference=utility(command)-utility(chosen);
      return difference>0||difference===0&&categories.keys.indexOf(command.key)<categories.keys.indexOf(chosen.key)?command:chosen;
    },null);
    // Never blindly reroll an available made Yatzy, even on the easy level.
    if(commands.some(c=>c.type==='score'&&c.key==='yatzy'&&d.previews.yatzy===50))return best;
    if(depth===3&&best&&['fullHouse','smallStraight','largeStraight'].includes(best.key)&&d.previews[best.key]>0)return best;
    if(depth>1&&d.rolls<3){
      const counts=Array.from({length:7},(_,n)=>d.dice.filter(v=>v===n).length),target=counts.reduce((best,n,i)=>n>counts[best]||n===counts[best]&&i>best?i:best,1);
      if(counts[target]<5){const hold=commands.find(c=>c.type==='hold'&&d.held[c.index]!== (d.dice[c.index]===target));if(hold)return hold;return commands.find(a=>a.type==='roll');}
    }else if(d.rolls<3)return commands.find(a=>a.type==='roll');
    return best;
  }
  function result(position){
    const values=position.data.scores.map(categories.total);
    return {winners:position.winners,places:values.map(value=>1+new Set(values.filter(other=>other>value)).size),
      metrics:[{id:'points',values}]};
  }
  function draft(p){return p.status==='playing'&&p.actor===p.turn&&p.data.rolls>0&&p.data.rolls<3?{mode:'coalesce',select:['hold'],commit:['roll','score'],max:8,delayMs:50,toggleKey:'index'}:null;}
  function draftProjection(p,actions){const d=JSON.parse(JSON.stringify(p.data));for(const c of actions)if(c.type==='hold')d.held[c.index]=!d.held[c.index];return {...p,data:d};}
  function localChoices(p){if(p.actor<0||p.status!=='playing')return [];return actions(p,p.actor);}
 return Object.freeze({contractVersion:1,id:'dice-poker',minPlayers:2,maxPlayers:6,create,validate,actions,localChoices,localData,draft,draftProjection,reduce,project,bot,result});
});
