// UNO printing; physical outline, thickness and motion belong to card-deck.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomUnoDeck=api;})(globalThis,function(root){
 'use strict';
 const colors=Object.freeze({red:'#df745b',yellow:'#e6ba52',green:'#578267',blue:'#6594b2',wild:'#3e514b',black:'#3e514b'});
 const value=c=>({skip:'⊘',reverse:'⇄','+2':'+2',wild:'✦'}[c.value]||c.value);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // The printed top index, including +2/+4, must remain inside a fanned card's exposed strip.
 const stacking=Object.freeze({protectedZones:Object.freeze([Object.freeze({x:.14,y:.03,width:.25,height:.21})]),horizontal:.40,vertical:.26,arc:.48,faceDown:.07,wasteAxis:'horizontal'});
 const compactStacking=Object.freeze({protectedZones:Object.freeze([Object.freeze({x:.13,y:0,width:.29,height:.25})]),horizontal:.43,vertical:.27,arc:.48,faceDown:.07,wasteAxis:'horizontal'});
 function print(card,variant='main'){
  const V=root.PlayroomVectorArt||(typeof require==='function'?require('../../components/vector-art.js'):null),label=value(card),face='var(--color-material-card-oval-face,#fff9ed)',color='var(--card-color,#3e514b)';
  const make=compact=>V.viewport({width:72,height:103,className:'uno-print-face',attrs:'aria-hidden="true" focusable="false"',content:`<rect x="2.5" y="2.5" width="67" height="98" rx="9.5" fill="${color}" stroke="${face}" stroke-width="5"/><ellipse cx="36" cy="${compact?58:51.5}" rx="22" ry="${compact?28:30}" transform="rotate(28 36 ${compact?58:51.5})" fill="${face}"/>${V.text(label,{x:36,y:compact?58:51.5,size:compact?32:37,weight:900,fill:color,attrs:'data-art-anchor="center"'})}<g data-card-index="top">${V.text(label,{x:compact?8:10,y:compact?12:14,size:compact?18:14,anchor:'start',fill:face})}</g>${compact?'':`<g data-card-index="bottom" transform="translate(72 103) rotate(180)">${V.text(label,{x:10,y:14,size:14,anchor:'start',fill:face})}</g>`}`});
  return {main:make(false),compact:make(true),width:72,height:103,variant,stacking:variant==='compact'?compactStacking:stacking};
 }
 return Object.freeze({colors,value,print});
});
