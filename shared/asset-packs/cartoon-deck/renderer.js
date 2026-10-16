(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomCartoonDeck=api;})(globalThis,function(){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function face(id,source){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect y="4" width="100" height="136" rx="12" fill="#bdbea7"/><rect width="100" height="136" rx="12" fill="#fffef8"/><image href="${esc(source(id))}" x="4" y="20" width="92" height="96" preserveAspectRatio="xMidYMid meet"/></svg>`;}
 return Object.freeze({face});
});
