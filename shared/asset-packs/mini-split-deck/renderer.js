(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomMiniSplitDeck=api;})(globalThis,function(){
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function face({rank='',suit='',hidden=false,main,suitOnly=false,crown=false}={}){
  if(hidden||typeof main==='string')return null;
  const mark=`<g fill="currentColor" font-family="system-ui,sans-serif" font-weight="700"><text x="50" y="100" text-anchor="middle" font-size="84">${esc(suit)}</text></g>`;
  if(suitOnly)return `<svg class="piece-art mini-split-face suit-only" viewBox="0 0 100 140" aria-hidden="true" focusable="false">${mark}</svg>`;
  return `<svg class="piece-art mini-split-face" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><rect x="1.5" y="3" width="97" height="135.5" rx="11.5" fill="var(--color-material-card-side,#aebcae)"/><rect x="1.5" y="1.5" width="97" height="137" rx="11.5" fill="var(--color-material-card-face,#fffbed)" stroke="var(--color-material-card-rim,#e5e6d4)" stroke-width="3"/><g fill="currentColor" font-family="system-ui,sans-serif"><text x="16.25" y="36.2" font-size="${String(rank).length>2?Math.max(12,Math.floor(90/String(rank).length)):30}" font-weight="700">${esc(rank)}</text>${crown?'<path d="m31.25 47.1 8.75 8.45 10-15.69 10 15.69 8.75-8.45-5 22.93h-27.5Z" fill="var(--color-material-card-crown,#c9a44f)"/>':''}<text x="50" y="${crown?122:100}" text-anchor="middle" font-size="${crown?60:84}" font-weight="700">${esc(suit)}</text></g></svg>`;
 }
 return Object.freeze({face});
});
