(function(root){
 'use strict';
 const Asset=root.PlayroomAsset||(typeof require==='function'?require('./asset.js'):null);

 class DieAsset extends Asset {
  constructor(){super('die');}

  print(value,{role,held=false,roll=true,label,active}={}){
   if(role==='reveal')return {value,...(active===undefined?{}:{active})};
   return {value,held,...(!held&&roll?{motion:'roll'}:{}),...(label===undefined?{}:{label})};
  }

  reveal(values,title,active){
   // The result and participation mask are provided by the game. This uses
   // the same print override for the enlarged view as for the table.
   const dice=values.map((value,index)=>this.describe(value,{role:'reveal',active:active?.[index]}));
   return {kind:'dice',dice,...(title===undefined?{}:{title})};
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=DieAsset;
 root.PlayroomDieAsset=DieAsset;
})(globalThis);
