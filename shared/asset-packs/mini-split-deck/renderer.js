(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomMiniSplitDeck=api;})(globalThis,function(){
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function face({rank='',suit='',hidden=false,main}={}){
  if(hidden||typeof main==='string')return null;
  return `<svg class="piece-art mini-split-face" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><rect x="1" y="3" width="98" height="136" rx="9" fill="var(--color-material-card-side,#aebcae)"/><rect x="1" y="1" width="98" height="136" rx="9" fill="var(--color-material-card-face,#fffdf4)" stroke="var(--color-material-card-rim,#c5cebc)"/><g fill="currentColor" text-anchor="middle" font-family="system-ui,sans-serif"><text x="50" y="38" dominant-baseline="central" font-size="${String(rank).length>2?Math.max(12,Math.floor(155/String(rank).length)):55}" font-weight="800">${esc(rank)}</text><text x="50" y="103" dominant-baseline="central" font-size="64">${esc(suit)}</text></g></svg>`;
 }
 return Object.freeze({face});
});
