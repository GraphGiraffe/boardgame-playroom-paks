(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomMiniCards=api;})(globalThis,function(root){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function card({rank='',id=null,label=rank,className=''}={}){
  return `<span class="mini-card ${esc(className)}" data-rank="${esc(rank)}"${id===null?'':` data-entity="card-${esc(id)}"`} aria-label="${esc(label)}">${root.PlayroomGameComponents.cardFrame(`<svg class="mini-rank-art" viewBox="0 0 100 140" aria-hidden="true"><text x="50" y="72" dominant-baseline="central" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${String(rank).length>1?Math.min(62,Math.floor(126/String(rank).length)):96}" font-weight="800" fill="currentColor">${esc(rank)}</text></svg>`)}</span>`;
 }
 return Object.freeze({card});
});
