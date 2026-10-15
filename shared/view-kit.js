// Shared, versioned source embedded into each standalone pack.
(function(root){
 'use strict';const H=root.PlayroomViews.helpers;
 const source=name=>root.PlayroomPack?.asset(`assets/shared/${name}.svg`)||'';
 const pips={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
 function card(value,attrs='disabled',extra=''){
  const tag=attrs==='disabled'?'span':'button',hidden=!value||value.hidden;
  const rank=hidden?'':value.joker?'Дж':({14:'Т',13:'К',12:'Д',11:'В'})[value.rank]||value.rank,suit=hidden?'':value.suit||'';
  const red=!hidden&&(value.color==='red'||suit==='♥'||suit==='♦');
  const label=hidden?'Закрытая карта':value.joker?`${red?'Красный':'Чёрный'} джокер`:`${rank} ${suit}`;
  const main=hidden?`<div class="shared-face shared-back-face">${source('card-back')?`<img src="${source('card-back')}" alt="">`:'✦'}</div>`:`<div class="shared-face"><span class="shared-card-corner">${H.esc(rank)}<small>${H.esc(suit)}</small></span><strong>${H.esc(suit)}</strong><span class="shared-card-corner bottom">${H.esc(rank)}<small>${H.esc(suit)}</small></span></div>`;
  return `<${tag} class="shared-card ${hidden?'shared-card-back':''} ${red?'shared-red':''} ${extra}" ${tag==='button'?attrs:''} ${!hidden&&value.id?`data-entity="card-${H.esc(value.id)}"`:''} aria-label="${H.esc(label)}">${H.art({main,width:70,height:98})}</${tag}>`;
 }
 function die(value,attrs='disabled',extra=''){
  const dots=pips[value]||[];
  return `<button class="shared-die ${extra}" ${attrs} aria-label="Кубик: ${H.esc(value||'ещё не брошен')}"><svg viewBox="0 0 60 60" aria-hidden="true">${source('die')?`<image href="${source('die')}" width="60" height="60"/>`:`<rect x="2" y="2" width="56" height="56" rx="12" fill="#fffbeb" stroke="#bac9ae" stroke-width="2"/>`}${dots.map(i=>`<circle cx="${14+i%3*16}" cy="${14+Math.floor(i/3)*16}" r="4" fill="currentColor"/>`).join('')}</svg></button>`;
 }
 const cover=content=>H.svg(`<ellipse cx="151" cy="158" rx="112" ry="14" fill="#365e4720"/>${content}`);
 root.PlayroomShared=Object.freeze({card,die,cover,roundTokenArt:root.PlayroomComponents.roundTokenArt,asset:source});
})(globalThis);
