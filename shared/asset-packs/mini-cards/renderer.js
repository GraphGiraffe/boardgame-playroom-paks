(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomMiniCards=api;})(globalThis,function(root){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Rank-only printing spans most of the face; the host must expose its ink before overlapping.
 const stacking=Object.freeze({protectedZones:Object.freeze([Object.freeze({x:.12,y:.04,width:.77,height:.92})]),horizontal:.92,vertical:.98,arc:.92,faceDown:.07,wasteAxis:'horizontal'});
 const wideStacking=Object.freeze({...stacking,protectedZones:Object.freeze([Object.freeze({x:.04,y:.04,width:.94,height:.92})]),horizontal:1,arc:1});
 function card({rank='',id=null,label=rank,className=''}={}){
  return `<span class="mini-card ${esc(className)}" data-rank="${esc(rank)}"${id===null?'':` data-entity="card-${esc(id)}"`} aria-label="${esc(label)}">${root.PlayroomGameComponents.cardFrame(`<svg class="mini-rank-art" data-card-stacking="${esc(JSON.stringify(String(rank)==='Дж'?wideStacking:stacking))}" viewBox="0 0 100 140" aria-hidden="true"><text x="50" y="72"${String(rank)==='Дж'?' transform="translate(50 72) scale(.88) translate(-50 -72)"':''} dominant-baseline="central" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${String(rank).length>1?Math.min(62,Math.floor(126/String(rank).length)):96}" font-weight="800" fill="currentColor">${esc(rank)}</text></svg>`)}</span>`;
 }
 return Object.freeze({card});
});
