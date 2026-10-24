/* Portable finish order and the fixed turn-round boundary. No clocks or UI. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;(root.PlayroomPackDomain??={}).endPolicy=api;})(globalThis,function(){
 'use strict';
 function create(count,first,mode='winner',allowed=['winner','round','last'],maxRounds=0){
  if(!Number.isInteger(maxRounds)||maxRounds<0||maxRounds>10000)throw Error('ROUND_LIMIT_INVALID');
  if(!allowed.includes(mode))throw Error('END_MODE_INVALID');
  return {mode,first,groups:[],count,round:1,maxRounds,starts:[0]};
 }
 function valid(e,count){return !!e&&Number.isInteger(e.round)&&e.round>=1&&Number.isInteger(e.maxRounds)&&e.maxRounds>=0&&e.maxRounds<=10000&&(!e.maxRounds||e.round<=e.maxRounds)&&Array.isArray(e.starts)&&e.starts.length===e.round&&e.starts.every((n,i)=>Number.isInteger(n)&&n>=0&&(!i||n>e.starts[i-1]))&&['winner','round','last'].includes(e.mode)&&e.count===count&&Number.isInteger(e.first)&&e.first>=0&&e.first<count&&Array.isArray(e.groups)&&e.groups.every(g=>Array.isArray(g)&&g.length&&g.every(p=>Number.isInteger(p)&&p>=0&&p<count))&&new Set(e.groups.flat()).size===e.groups.flat().length&&(e.exits===undefined||Array.isArray(e.exits)&&new Set(e.exits.map(x=>x?.player)).size===e.exits.length&&e.exits.every(x=>x&&e.groups.flat().includes(x.player)&&['cards','domino','finished'].includes(x.kind)&&(Number.isSafeInteger(x.round)&&x.round>0||Number.isSafeInteger(x.turn)&&x.turn>0)));}
 const done=(e,player)=>e.groups.some(group=>group.includes(player));
 function record(e,members,position=null,kind='finished'){
  if(!members.length||members.some(player=>done(e,player)))return false;
  e.groups.push([...members]);
  if(position){const timeline=position.timeline||{};(e.exits??=[]).push(...members.map(player=>({player,kind,...(timeline.round?{round:timeline.round}:{turn:timeline.turn||1})})));}
  return true;
 }
 function result(e){const remaining=Array.from({length:e.count},(_,i)=>i).filter(i=>!done(e,i));return {exits:e.exits||[],lastPlayers:e.mode==='last'&&remaining.length===1?remaining:[]};}
 function winners(e){return e.mode==='round'?e.groups.flat():e.groups[0]||[];}
 function next(e,from,{remaining=0}={}){
  if(e.groups.length&&(e.mode==='winner'||e.count-e.groups.flat().length<=remaining))return null;
  for(let step=1;step<=e.count;step++){
   const player=(from+step)%e.count;
   if(e.mode==='round'&&e.groups.length&&player===e.first)return null;
   if(!done(e,player))return player;
  }
  return null;
 }
 function advance(e,from,{revision=0,remaining=0}={}){
  const player=next(e,from,{remaining});if(player===null)return null;
  const offset=value=>(value-e.first+e.count)%e.count;
  if(offset(player)<=offset(from)){
   if(e.maxRounds&&e.round>=e.maxRounds)return null;
   e.round++;e.starts.push(revision);
  }
  return player;
 }
 function places(e,values,descending=true){
  if(e.mode!=='last')return values.map(value=>1+new Set(values.filter(other=>descending?other>value:other<value)).size);
  return values.map((value,player)=>{const rank=e.groups.findIndex(group=>group.includes(player));return rank>=0?rank+1:e.groups.length+1+new Set(values.filter((other,index)=>!done(e,index)&&(descending?other>value:other<value))).size;});
 }
 return Object.freeze({create,valid,done,record,winners,next,advance,places,result});
});
