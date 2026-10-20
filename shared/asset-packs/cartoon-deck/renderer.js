(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomCartoonDeck=api;})(globalThis,function(root){
 'use strict';
 function face(id,source,{style='minimal'}={}){return root.PlayroomViews.helpers.components.characterFace({character:id,source:source(id)},{variant:style});}
 return Object.freeze({face});
});
