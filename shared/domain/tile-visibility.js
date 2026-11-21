(function(root){
 'use strict';
 const hidden=Object.freeze({hidden:true});

 // Construct authorized slots directly. Hidden entries share a marker with
 // no identity, even before serialization at the sandbox boundary.
 function concealed(count){return Array(count).fill(hidden);}
 function revealIndices(values,...groups){
  const visible=concealed(values.length);
  for(const group of groups)for(const index of group)visible[index]=values[index];
  return visible;
 }
 const api=Object.freeze({concealed,revealIndices});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PlayroomPackDomain||={};root.PlayroomPackDomain.tileVisibility=api;
})(globalThis);
