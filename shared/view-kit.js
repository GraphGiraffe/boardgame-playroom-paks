// Shared Web components embedded offline into each pack.
(function(root){
 'use strict';const H=root.PlayroomViews.helpers,source=name=>root.PlayroomPack?.asset('assets/shared/'+name+'.svg')||'';
 root.PlayroomShared=Object.freeze({...root.PlayroomGameComponents.createHelpers(H,source),roundTokenArt:H.roundTokenArt,asset:source});
})(globalThis);
