(function(root){
 'use strict';
 const TileAsset=root.PlayroomTileAsset||(typeof require==='function'?require('./tile-asset.js'):null);
 const connection=root.PlayroomPackDomain?.tileConnection||(typeof require==='function'?require('../domain/tile-connection.js'):null);

 // Route-independent face and slot behavior stay in TileAsset. Only a chain
 // pack needs both endpoints and the public reveal of a played tile.
 class ChainTileAsset extends TileAsset {
  placement(tile,side,chain){
   const join=connection.endpoint(chain,side),{a,b}=connection.oriented(tile,side,join);
   return {a,b,join};
  }

  reveal(tile){
   if(tile.hidden)throw Error('SDK_TILE_REVEAL_HIDDEN');
   return {kind:'card',card:this.describe(tile,{role:'reveal'}),entity:this.ref(tile.id)};
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=ChainTileAsset;
 root.PlayroomChainTileAsset=ChainTileAsset;
})(globalThis);
