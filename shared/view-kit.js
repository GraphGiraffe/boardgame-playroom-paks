// Shared source is embedded in each versioned pack that opts in to sharedUi.
(function(root){
  'use strict';
  const H=root.PlayroomViews.helpers;
  const source=name=>root.PlayroomPack?.asset(`assets/shared/${name}.svg`)||'';
  const pips={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  function card(value,attrs='disabled',extra=''){
    const tag=attrs==='disabled'?'span':'button',properties=tag==='button'?attrs:'';
    if(!value||value.hidden)return `<${tag} class="shared-card shared-card-back ${extra}" ${properties} aria-label="Закрытая карта">${source('card-back')?`<img src="${source('card-back')}" alt="">`:'✦'}</${tag}>`;
    const rank=value.rank===14?'Т':value.rank===13?'К':value.rank===12?'Д':value.rank===11?'В':value.rank;
    const suit=value.suit||'';
    if(value.joker)return `<${tag} class="shared-card shared-joker ${value.color==='red'?'shared-red':''} ${extra}" ${properties} aria-label="${value.color==='red'?'Красный':'Чёрный'} джокер"><span class="shared-card-corner">Дж</span><strong>★</strong></${tag}>`;
    return `<${tag} class="shared-card ${suit==='♥'||suit==='♦'?'shared-red':''} ${extra}" ${properties} aria-label="${H.esc(rank+' '+suit)}"><span class="shared-card-corner">${H.esc(rank)}<small>${H.esc(suit)}</small></span><strong>${H.esc(suit)}</strong></${tag}>`;
  }
  function die(value,attrs='disabled',extra=''){
    const dots=pips[value]||[];
    return `<button class="shared-die ${extra}" ${attrs} aria-label="Кубик: ${H.esc(value||'ещё не брошен')}">${source('die')?`<img src="${source('die')}" alt="">`:''}<span class="shared-pips" aria-hidden="true">${Array.from({length:9},(_,i)=>`<i class="${dots.includes(i)?'on':''}"></i>`).join('')}</span></button>`;
  }
  root.PlayroomShared=Object.freeze({card,die,asset:source});
})(globalThis);
