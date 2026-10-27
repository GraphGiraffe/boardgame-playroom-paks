// Shared Web components embedded offline into each pack.
(function(root){
 'use strict';const H=root.PlayroomViews.helpers,source=(name,assetSet)=>{
  if(name==='card-back'){
   const variant=H.assetVariant?.('card-face')||'classic';
   const set=assetSet||(['mini-split','mini-split-four-color'].includes(variant)?'mini-split-deck':'standard-deck');
   return root.PlayroomPack?.asset('assets/shared-packs/'+set+'/back.svg')||'';
  }
  return root.PlayroomPack?.asset('assets/shared/'+name+'.svg')||'';
 };
 // Public, inert examples for rulebooks; no game state or action bindings.
 const rulebookArt=()=>{
  const C=root.PlayroomShared,esc=H.esc;
  const row=(...items)=>`<div class="rule-art-row">${items.join('')}</div>`;
  const arrow=()=>'<span class="rule-art-arrow" aria-hidden="true">→</span>';
  const selected=art=>`<span class="rule-art-selected">${art}</span>`;
  const scene=content=>`<div class="rule-art" inert>${content}</div>`;
  const button=label=>C.button({label,variant:'game',disabled:true});
  const iconButton=(icon,label)=>C.button({icon,label:'',ariaLabel:label,variant:'game',disabled:true});
  const pawn=(value=1,color='#4d8066')=>`<span class="rule-art-pawn" style="--round-token-fill:${esc(color)};--round-token-side:color-mix(in srgb,${esc(color)} 65%,black);--round-token-rim:#fffbed;--round-token-mark:#fffbed">${C.roundTokenArt({profile:'pawn',value})}</span>`;
  const player=label=>`<div class="rule-art-player">${H.icon('user')}<strong>${esc(label)}</strong></div>`;
  const grid=(columns,cells)=>`<div class="rule-art-grid" style="--rule-columns:${columns}">${cells.map((cell,i)=>`<div class="rule-art-cell${typeof cell==='object'?' '+esc(cell.tone||''):''}">${typeof cell==='object'?cell.html:cell}</div>`).join('')}</div>`;
  const domino=(a,b)=>`<span class="domino-tile art-card rule-art-domino">${C.dominoFace(a,b,270)}</span>`;
  const checker=(king=false)=>`<span class="checker-piece owner-1">${C.checkerArt(king)}</span>`;
  const die=(value,held=false)=>C.die(value,`disabled aria-pressed="${held}"`,held?'held':'');
  const table=(headers,rows)=>C.scoreTable({className:'rule-art-score',head:`<tr>${headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr>`,body:rows.map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join(''),foot:''});
  return {row,arrow,selected,scene,button,iconButton,pawn,player,grid,domino,checker,die,table};
 };
 root.PlayroomShared=Object.freeze({...root.PlayroomGameComponents.createHelpers(H,source),roundTokenArt:H.roundTokenArt,asset:source,rulebookArt});
})(globalThis);
