(function(root){
 'use strict';

 // These authoring objects consume an authorized projection. The engine owns
 // commands, screen geometry and effects; only the plain records cross the VM.
 class Asset {
  constructor(namespace){this.namespace=namespace;}

  ref(id){return {namespace:this.namespace,id:String(id)};}

  place(id,zone,index){
   return {ref:this.ref(id),zone,...(index===undefined?{}:{index})};
  }

  activate(id,command){
   return {command,kind:'activate',target:{entity:this.ref(id)}};
  }

  describe(value,options={}){return this.print(value,options);}

  print(value){return value;}
 }
 if(typeof module==='object'&&module.exports)module.exports=Asset;
 root.PlayroomAsset=Asset;
})(globalThis);
