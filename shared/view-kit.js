// Shared Web components embedded offline into each pack.
(function(root){
 'use strict';const H=root.PlayroomViews.helpers,source=(name,assetSet)=>{
  if(name==='card-back'){
   const variant=H.assetVariant?.('card-face')||'classic';
   const set=assetSet||(['mini-split','mini-split-four-color'].includes(variant)?'mini-split-deck':'standard-deck');
   return root.PlayroomPack?.asset('assets/shared-packs/'+set+'/back.svg')||'';
  }
  return root.PlayroomPack?.asset('assets/shared/'+name+'.svg')||'';
 };
 root.PlayroomShared=Object.freeze({...root.PlayroomGameComponents.createHelpers(H,source),roundTokenArt:H.roundTokenArt,asset:source});
})(globalThis);
