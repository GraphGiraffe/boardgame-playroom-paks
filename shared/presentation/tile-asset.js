(function(root){
 'use strict';
 const Asset=root.PlayroomAsset||(typeof require==='function'?require('./asset.js'):null);
 const back=Object.freeze({hidden:true});

 class TileAsset extends Asset {
  constructor(namespace='tile'){super(namespace);}

  describe(tile,options){return tile.hidden?back:super.describe(tile,options);}

  onSlot(index,zone){return {ref:this.ref(index),zone,cell:index};}
 }
 if(typeof module==='object'&&module.exports)module.exports=TileAsset;
 root.PlayroomTileAsset=TileAsset;
})(globalThis);
