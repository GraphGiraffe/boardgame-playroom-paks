/* Portable finish order and the fixed turn-round boundary. No clocks or UI. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;(root.PlayroomPackDomain??={}).endPolicy=api;})(globalThis,function(){
 'use strict';
 function create(count,first,mode='winner',allowed=['winner','round','last'],maxRounds=0){
  if(!Number.isInteger(maxRounds)||maxRounds<0||maxRounds>10000)throw Error('ROUND_LIMIT_INVALID');
  if(!allowed.includes(mode))throw Error('END_MODE_INVALID');
  return {mode,first,groups:[],count,round:1,maxRounds,starts:[0]};
 }
 function valid(e,count){return !!e&&Number.isInteger(e.round)&&e.round>=1&&Number.isInteger(e.maxRounds)&&e.maxRounds>=0&&e.maxRounds<=10000&&(!e.maxRounds||e.round<=e.maxRounds)&&Array.isArray(e.starts)&&e.starts.length===e.round&&e.starts.every((n,i)=>Number.isInteger(n)&&n>=0&&(!i||n>e.starts[i-1]))&&['winner','round','last'].includes(e.mode)&&e.count===count&&Number.isInteger(e.first)&&e.first>=0&&e.first<count&&Array.isArray(e.groups)&&e.groups.every(g=>Array.isArray(g)&&g.length&&g.every(p=>Number.isInteger(p)&&p>=0&&p<count))&&new Set(e.groups.flat()).size===e.groups.flat().length;}
 const done=(e,player)=>e.groups.some(group=>group.includes(player));
 function record(e,members){if(members.some(player=>done(e,player)))return false;e.groups.push([...members]);return true;}
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
 return Object.freeze({create,valid,done,record,winners,next,advance,places});
});
