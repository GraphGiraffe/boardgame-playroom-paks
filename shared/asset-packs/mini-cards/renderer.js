(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomMiniCards=api;})(globalThis,function(root){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function card({rank='',id=null,label=rank,className=''}={}){
  return `<span class="mini-card ${esc(className)}" data-rank="${esc(rank)}"${id===null?'':` data-entity="card-${esc(id)}"`} aria-label="${esc(label)}">${root.PlayroomGameComponents.cardFace({rank,suit:''})}</span>`;
 }
 return Object.freeze({card});
});
