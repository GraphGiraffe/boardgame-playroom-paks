(function(root){
 'use strict';
 const TokenAsset=root.PlayroomTokenAsset||(typeof require==='function'?require('./token-asset.js'):null);

 // The pack supplies the authorized route; the host owns geometry, timing
 // and sound. Occupied destinations wait for the named departures.
 class RouteTokenAsset extends TokenAsset {
  walk(id,player,{trigger,origin,steps,counter,entry,jump,arrival,departures}){
   return {trigger,entity:this.ref(id),player,counter,origin,steps,
    ...(entry===undefined?{}:{entry}),...(jump===undefined?{}:{jump}),
    ...(departures?.length?{arrival:'after-departures',departures:departures.map(id=>this.ref(id))}:
      arrival===undefined?{}:{arrival})};
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=RouteTokenAsset;
 root.PlayroomRouteTokenAsset=RouteTokenAsset;
})(globalThis);
