// UNO printing; physical outline, thickness and motion belong to card-deck.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomUnoDeck=api;})(globalThis,function(){
 'use strict';
 const colors=Object.freeze({red:'#df745b',yellow:'#e6ba52',green:'#578267',blue:'#6594b2',wild:'#3e514b',black:'#3e514b'});
 const value=c=>({skip:'⊘',reverse:'⇄','+2':'+2',wild:'✦'}[c.value]||c.value);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function print(card,variant='main'){
  const label=esc(value(card)),face=`<span class="card-corner">${label}</span><span class="uno-oval"><span class="face-value">${label}</span></span><span class="card-corner bottom">${label}</span>`;
  return {main:`<div class="uno-art-face">${face}</div>`,compact:`<div class="uno-art-face uno-art-compact"><span class="card-corner">${label}</span><span class="uno-oval"><span class="face-value">${label}</span></span></div>`,width:72,height:103,variant};
 }
 return Object.freeze({colors,value,print});
});
