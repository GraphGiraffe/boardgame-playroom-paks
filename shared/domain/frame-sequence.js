/* Authorized public frames: one base followed by bounded structural deltas. */
(function(r,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;r.PlayroomFrameSequence=a;})(globalThis,function(){
 'use strict';
 const MAX_FRAMES=256,MAX_OPS=4096,MAX_ITEMS=16384,cache=new WeakMap(),decoded=new WeakMap();
 const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const same=(a,b)=>a===b||JSON.stringify(a)===JSON.stringify(b);
 function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
 function frozen(v){return !v||typeof v!=='object'||Object.isFrozen(v)&&Object.values(v).every(frozen);}
 function diff(a,b,path=[],ops=[]){
  if(same(a,b))return ops;
  if(Array.isArray(a)&&Array.isArray(b)&&a.length===b.length){for(let i=0;i<b.length;i++)diff(a[i],b[i],[...path,i],ops);}
  else if(record(a)&&record(b)){
   for(const k of Object.keys(a))if(!Object.hasOwn(b,k))ops.push([0,[...path,k]]);
   for(const k of Object.keys(b))if(!Object.hasOwn(a,k))ops.push([1,[...path,k],b[k]]);else diff(a[k],b[k],[...path,k],ops);
  }else ops.push([1,path,b]);
  return ops;
 }
 function apply(value,ops){
  if(!Array.isArray(ops)||ops.length>MAX_OPS)throw Error('FRAME_DELTA_INVALID');
  let out=value;
  for(const op of ops){
   if(!Array.isArray(op)||![0,1].includes(op[0])||op.length!==(op[0]?3:2)||!Array.isArray(op[1])||op[1].length>32||op[1].some(k=>typeof k!=='string'&&(!Number.isSafeInteger(k)||k<0)))throw Error('FRAME_DELTA_INVALID');
   const visit=(node,i)=>{
    if(i===op[1].length){if(!op[0])throw Error('FRAME_DELTA_INVALID');return op[2];}
    const k=op[1][i],array=Array.isArray(node);
    if(!node||typeof node!=='object'||array&&(typeof k!=='number'||k>=node.length)||!array&&typeof k!=='string')throw Error('FRAME_DELTA_INVALID');
    const copy=array?[...node]:{...node},last=i===op[1].length-1;
    if(last&&!op[0]){if(array||!Object.hasOwn(node,k))throw Error('FRAME_DELTA_INVALID');delete copy[k];}
    else {if(!last&&!Object.hasOwn(node,k))throw Error('FRAME_DELTA_INVALID');Object.defineProperty(copy,k,{value:visit(node[k],i+1),enumerable:true,writable:true,configurable:true});}
    return copy;
   };out=visit(out,0);
  }return out;
 }
 function encode(frames){
  if(!Array.isArray(frames)||frames.length>MAX_FRAMES)throw Error('FRAME_SEQUENCE_INVALID');
  if(cache.has(frames))return cache.get(frames);
  const base=frames.length?frames[0]:null,deltas=frames.slice(1).map((frame,i)=>diff(frames[i],frame));
  if(deltas.some(ops=>ops.length>MAX_OPS))throw Error('FRAME_DELTA_INVALID');
  const result=freeze(JSON.parse(JSON.stringify({format:1,base,deltas})));
  if(frozen(frames))cache.set(frames,result);return result;
 }
 function expand(sequence){
  if(decoded.has(sequence))return decoded.get(sequence);
  if(!record(sequence)||sequence.format!==1||!Array.isArray(sequence.deltas)||sequence.deltas.length>=MAX_FRAMES||sequence.base===null&&sequence.deltas.length)throw Error('FRAME_SEQUENCE_INVALID');
  let work=0;
  const validate=v=>{if(++work>MAX_ITEMS)throw Error('FRAME_SEQUENCE_LIMIT');if(v&&typeof v==='object')for(const item of Object.values(v))validate(item);};
  // The wire sequence is validated before allocating expanded frames.
  validate(sequence);const source=freeze(JSON.parse(JSON.stringify(sequence))),frames=[];
  if(source.base!==null){if(!record(source.base))throw Error('FRAME_SEQUENCE_INVALID');frames.push(source.base);for(const ops of source.deltas){const next=apply(frames.at(-1),ops);if(!record(next))throw Error('FRAME_SEQUENCE_INVALID');frames.push(freeze(next));}}
  const result=Object.freeze(frames);if(frozen(sequence))decoded.set(sequence,result);return result;
 }
 return Object.freeze({encode,expand});
});
