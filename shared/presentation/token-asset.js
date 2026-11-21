(function(root){
 'use strict';
 const Asset=root.PlayroomAsset||(typeof require==='function'?require('./asset.js'):null);

 // Geometry and legal commands come from the projection. The same record
 // addresses a native board token and its representation in history.
 class TokenAsset extends Asset {
  constructor(namespace='token'){super(namespace);}

  atCell(id,zone,cell,owner){return {...this.place(id,zone),cell,...(owner===undefined?{}:{owner})};}

  atPoint(id,zone,point,owner){return {...this.place(id,zone),point,...(owner===undefined?{}:{owner})};}

  move(id,command,target,{select=false}={}){
   return {command,kind:'move',source:{entity:this.ref(id)},
    ...(select?{activation:'select',gestures:{drag:true,swipe:false}}:{}),target};
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=TokenAsset;
 root.PlayroomTokenAsset=TokenAsset;
})(globalThis);
