(function(root){'use strict';
 function render({spider,state:s,viewer,actions,ui,text}){
  const H=root.PlayroomViews.helpers,C=root.PlayroomShared,d=s.data,selected=ui.selected;
  const buttons=['undo',...(!spider&&d.config.autoCollect?['collect']:[])].map(type=>{const action=actions.find(a=>a.type===type);return action?H.actionButton(action):`<button class="scene-button" disabled>${H.esc(text('actions.'+type))}</button>`;});
  const candidates=actions.filter(a=>a.type==='flip'||a.type==='move'&&a.source!=='foundation').concat(actions.filter(a=>['draw','recycle'].includes(a.type)));
  const parts=String(ui.viewState?.hint||'').split(':'),n=parts[0]===String(s.move)?Number(parts[1]):-1,hint=n>=0?candidates[n%candidates.length]:null;
  const cls=(card,zone,col,index)=>hint&&(hint.card===card?.id||hint.type==='flip'&&hint.from===col&&index===d.tableau[col]?.length-1||hint.target===zone&&hint.to===col&&index===d.tableau[col]?.length-1)?' solitaire-hint':'';
  function face(c,zone,col,index,top){
   const flip=actions.find(a=>a.type==='flip'&&a.from===col),target=actions.find(a=>a.type==='move'&&String(a.card)===String(selected)&&a.target===zone&&a.to===col),source=H.source(c.id,actions,selected,{inspect:!c.hidden,preview:!c.hidden,drag:true,mode:'select',className:''});
   const attrs=c.hidden?(flip&&top?H.actionAttr(flip):'disabled'):target&&top?H.target(selected,target):source.attr;
   return C.card(c,attrs,'solitaire-card'+cls(c,zone,col,index)+(String(selected)===String(c.id)&&c.id?' solitaire-picked':''));
  }
  function column(col,i){const step='.72';const cards=col.map((c,index)=>{
    return `<div class="solitaire-card-position" style="top:calc(${col.slice(0,index).filter(c=>c.hidden).length*7}px + var(--ch)*${col.slice(0,index).filter(c=>!c.hidden).length}*${step})">${face(c,'tableau',i,index,index===col.length-1)}</div>`;}).join('');
   const target=!col.length&&actions.find(a=>a.type==='move'&&String(a.card)===String(selected)&&a.target==='tableau'&&a.to===i),hintEmpty=hint?.target==='tableau'&&hint.to===i&&!col.length;
   return `<div class="solitaire-column" data-column="${i}" style="height:calc(var(--ch) + ${col.filter(c=>c.hidden).length*7}px + var(--ch)*${Math.max(0,col.filter(c=>!c.hidden).length-1)}*.72)"><button class="solitaire-empty ${hintEmpty?'solitaire-hint':''}" ${target?H.target(selected,target):'disabled'} aria-label="${H.esc(text('ui.empty'))} ${i+1}"></button>${cards}</div>`;
  }
  const stockAction=actions.find(a=>a.type==='draw'||a.type==='recycle'),stock=`<button class="scene-button solitaire-stock ${hint&&['draw','recycle'].includes(hint.type)?'solitaire-hint':''}" ${stockAction?H.actionAttr(stockAction):'disabled'}>${H.esc(text('ui.stock'))} ${spider?d.stock.length/10:d.stock.length}${stockAction?.type==='recycle'?' ↻':''}</button>`;
  const homes=!spider?d.foundations.map((col,i)=>{const a=actions.find(a=>a.type==='move'&&String(a.card)===String(selected)&&a.target==='foundation'&&a.to===i),ring=hint?.target==='foundation'&&hint.to===i?' solitaire-hint':'';return `<div class="solitaire-home${ring}">${col.length?face(col.at(-1),'foundation',i,col.length-1,true):`<button class="solitaire-empty" ${a?H.target(selected,a):'disabled'} aria-label="${H.esc(text('ui.foundation'))} ${i+1}">A</button>`}</div>`;}).join(''):'';
  const waste=!spider?`<div class="solitaire-waste">${d.waste.slice(-d.config.draw).map((c,i)=>`<div style="left:calc(var(--cw)*${i}*.34)">${face(c,'waste',0,d.waste.length-d.config.draw+i,i===d.waste.slice(-d.config.draw).length-1)}</div>`).join('')}</div>`:'';
  const hintText=hint?.type==='move'?`${hint.source==='tableau'?hint.from+1:text('ui.waste')} → ${hint.target==='tableau'?hint.to+1:text('ui.foundation')}`:hint?text('actions.'+hint.type):n>=0?text('ui.noHint'):' ';
  return {api:2,family:'cards',hidePlayers:true,fieldSizing:'scroll',actionReserve:false,className:'solitaire-scene',elements:{field:`<div class="solitaire-board"><div class="solitaire-toolbar">${buttons.join('')}<button class="scene-button" data-view-key="hint" data-view-value="${s.move}:${n+1}">${H.esc(text('ui.hint'))}</button><button class="scene-button" data-view-key="hint" data-view-value="">${H.esc(text('ui.clearShort'))}</button></div><div class="solitaire-stats">${H.esc(text('ui.stats',{score:d.config.scoring==='none'?'—':d.score,moves:d.moves}))}</div><div class="solitaire-hint-text" role="status">${H.esc(hintText)}</div><div class="solitaire-content">${spider?'':`<div class="solitaire-stocks">${stock}${waste}${homes}</div>`}<div class="solitaire-scroll" data-scene-scroll><div class="solitaire-columns" style="--columns:${spider?10:7}">${d.tableau.map(column).join('')}</div></div>${spider?`<div class="solitaire-dock"><span>${H.esc(text('ui.completed',{count:d.completed.length}))}</span>${stock}</div>`:''}</div></div>`,actions:''}};
 }
 root.PlayroomSolitaireBoard=Object.freeze({render});
})(globalThis);
