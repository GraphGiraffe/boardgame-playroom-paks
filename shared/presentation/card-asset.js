(function(root){
 'use strict';
 const Face=root.PlayroomCardFaceAsset||(typeof require==='function'?require('./card-face-asset.js'):null);

 class CardAsset extends Face {
  transfer(player,count,from,location={}){
   return {...location,player,count,from};
  }

  move(id,command,target){
   return {command,kind:'move',source:{entity:this.ref(id)},activation:'preference',gestures:{drag:true,swipe:true},target};
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=CardAsset;
 root.PlayroomCardAsset=CardAsset;
})(globalThis);
