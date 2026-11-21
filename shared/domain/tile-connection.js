(function(root){
 'use strict';

 // Both the legal placement and its preview use the same public endpoint.
 const endpoint=(chain,side)=>chain.length?(side==='left'?chain[0].a:chain.at(-1).b):null;
 function oriented(tile,side,join){
  return join===null||(side==='left'?tile.b:tile.a)===join?tile:{...tile,a:tile.b,b:tile.a};
 }
 const api=Object.freeze({endpoint,oriented});
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.PlayroomPackDomain||={};root.PlayroomPackDomain.tileConnection=api;
})(globalThis);
