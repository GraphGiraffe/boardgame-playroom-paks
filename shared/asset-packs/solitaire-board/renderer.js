(function(root){'use strict';
 function render({spider,state:s,viewer,actions,ui,text}){
  const H=root.PlayroomViews.helpers,C=root.PlayroomShared,d=s.scene,selected=ui.selected;
  const stacking=H.assetLayout?.('card-face'),stackStyle=stacking?`--asset-stack-horizontal:${stacking.horizontal};--asset-stack-vertical:${stacking.vertical};--asset-stack-closed:${stacking.faceDown}`:'';
  const iconControl=(attrs,label,icon,tooltip=true)=>`<button class="scene-button solitaire-control" ${attrs} aria-label="${H.esc(label)}" ${tooltip?`title="${H.esc(label)}" data-tooltip="${H.esc(label)}"`:''}>${H.icon(icon)}</button>`;
  const undo=actions.find(a=>a.type==='undo'),buttons=[iconControl(undo?H.actionAttr(undo):'disabled',text('actions.undo'),'undo')];
  const suits=['♥','♣','♦','♠'],emptyHomes=spider?[]:d.foundations.map((col,i)=>col.length?-1:i).filter(i=>i>=0),missingSuits=spider?[]:suits.filter(suit=>!d.foundations.some(col=>col[0]?.suit===suit));
  const homeSlots=spider?[]:suits.map(suit=>({suit,index:d.foundations.findIndex(col=>col[0]?.suit===suit)>=0?d.foundations.findIndex(col=>col[0]?.suit===suit):emptyHomes[missingSuits.indexOf(suit)]}));
  const cardById=id=>[...d.tableau.flat(),...d.waste,...d.foundations.flat()].find(c=>String(c.id)===String(id));
  const suggested=Array.isArray(d.hints)?d.hints.map(hint=>actions.find(action=>Object.entries(hint).every(([key,value])=>action[key]===value))).filter(Boolean):actions;
  const candidates=suggested.filter(a=>a.type==='flip'||a.type==='move'&&a.source!=='foundation'&&(a.target!=='foundation'||homeSlots.find(slot=>slot.suit===cardById(a.card)?.suit)?.index===a.to)).concat(suggested.filter(a=>['draw','recycle'].includes(a.type)));
  const parts=String(ui.viewState?.hint||'').split(':'),n=parts[0]===String(s.move)?Number(parts[1]):-1,hint=n>=0?candidates[n%candidates.length]:null;
  const cls=(card,zone,col,index)=>hint&&(hint.type==='move'&&hint.card!=null&&hint.card===card?.id||hint.type==='flip'&&zone==='tableau'&&hint.from===col&&index===d.tableau[col]?.length-1||hint.target===zone&&hint.to===col&&index===d.tableau[col]?.length-1)?' solitaire-hint':'';
  function faceSpec(c,zone,col,index,top){
   const flip=actions.find(a=>a.type==='flip'&&a.from===col),target=actions.find(a=>a.type==='move'&&String(a.card)===String(selected)&&a.target===zone&&a.to===col),source=H.source(c.id,actions,selected,{inspect:!c.hidden,preview:false,drag:true,mode:'select',className:''});
   let attrs=c.hidden?(flip&&top?H.actionAttr(flip):'disabled'):target&&top?H.target(selected,target):source.attr;
   if(attrs.includes('data-drag-piece'))attrs+=' data-drag-legal="true"';
   if(!c.hidden&&!attrs.includes('data-drag-piece')&&d.dragSources?.includes(c.id)&&!(target&&top))attrs+=` data-drag-piece="${H.esc(c.id)}"`;
   if(attrs.includes('data-drag-piece'))attrs+=' data-drag-start="immediate"';
   if(!c.hidden)attrs+=` data-motion-zone="${zone}" data-motion-home="home-${H.esc(c.suit)}"`;
   return {card:c,attrs,className:'solitaire-card'+cls(c,zone,col,index)};
  }
  function face(c,zone,col,index,top){const spec=faceSpec(c,zone,col,index,top);return C.card(spec.card,spec.attrs,spec.className);}
  function column(col,i){
   const target=!col.length&&actions.find(a=>a.type==='move'&&String(a.card)===String(selected)&&a.target==='tableau'&&a.to===i),hintEmpty=hint?.target==='tableau'&&hint.to===i&&!col.length;
   const emptyAttrs=target?H.target(selected,target):'disabled',emptyLabel=H.esc(text('ui.empty'))+' '+(i+1);
   const specs=col.map((c,index)=>faceSpec(c,'tableau',i,index,index===col.length-1));
   const descriptors=C.cardDescriptor&&specs.map(spec=>C.cardDescriptor(spec.card,spec.attrs,spec.className));
   const build=()=>{
    let closed=0,open=0;
    const cards=col.map((c,index)=>{
     const top=`top:calc(${closed}*var(--closed-step) + var(--ch)*${open}*var(--open-step))`;if(c.hidden)closed++;else open++;
     const spec=specs[index],card=descriptors?C.renderCard(descriptors[index]):C.card(spec.card,spec.attrs,spec.className);
     return `<div class="solitaire-card-position" data-drag-stack-member="${index}" data-motion-anchor="tableau-${i}-${index}" style="${top}">${card}</div>`;
    }).join('');
    return `<div class="solitaire-column" data-motion-anchor="tableau-${i}" data-drag-stack data-column="${i}" data-empty="${!col.length}" style="height:calc(var(--ch) + ${closed}*var(--closed-step) + var(--ch)*${Math.max(0,open-1)}*var(--open-step))"><button class="solitaire-empty ${hintEmpty?'solitaire-hint':''}" ${emptyAttrs} aria-label="${emptyLabel}"></button>${cards}</div>`;
   };
   return ui.region&&descriptors?ui.region('tableau-'+i,[descriptors,emptyAttrs,!!hintEmpty,emptyLabel],build):build();
  }
  const stockAction=actions.find(a=>a.type==='draw'||a.type==='recycle'),stockLabel=text('ui.stock'),stockCount=spider?d.stockCount/10:d.stockCount;
  const blockedDraw=spider&&!stockAction&&d.blockedDraw;
  const drawLabel=stockAction?text('actions.'+stockAction.type):text('actions.draw');
  const drawControl=`<button class="scene-button solitaire-control solitaire-stock-compact solitaire-draw-control ${spider?'solitaire-stock':''} ${hint&&['draw','recycle'].includes(hint.type)?'solitaire-hint':''}" ${stockAction?H.actionAttr(stockAction):blockedDraw?'data-feedback-required=".solitaire-column[data-empty=true]>.solitaire-empty" aria-disabled="true"':'disabled'} aria-label="${H.esc(drawLabel)}: ${stockCount}" title="${H.esc(drawLabel)}" data-tooltip="${H.esc(drawLabel)}">${H.icon(stockAction?.type==='recycle'?'undo':'cards')}${H.countBadge(stockCount,stockLabel,{corner:true})}</button>`;
  const stock=spider?drawControl:`<div class="solitaire-stock-group"><button class="stock-button solitaire-stock ${hint&&['draw','recycle'].includes(hint.type)?'solitaire-hint':''}" ${stockAction?H.actionAttr(stockAction):'disabled'} aria-label="${H.esc(stockAction?text('actions.'+stockAction.type):stockLabel)}">${d.stockCount?C.card({hidden:true},'disabled','solitaire-card'):`<span class="solitaire-empty solitaire-recycle" aria-hidden="true">${stockAction?.type==='recycle'?'↻':''}</span>`}${H.countBadge(stockCount,stockLabel,{corner:true})}</button></div>`;
  const homes=homeSlots.map(({suit,index:i})=>{const col=d.foundations[i],a=cardById(selected)?.suit===suit&&actions.find(a=>a.type==='move'&&String(a.card)===String(selected)&&a.target==='foundation'&&a.to===i),ring=hint?.target==='foundation'&&hint.to===i?' solitaire-hint':'';return `<div class="solitaire-home${ring}" data-foundation-suit="${suit}" data-motion-anchor="home-${suit}">${col.length?face(col.at(-1),'foundation',i,col.length-1,true):C.cardSlot({suit,attrs:a?H.target(selected,a):'disabled',className:'solitaire-empty solitaire-foundation',label:text('ui.foundation')+' '+suit,kind:'foundation'})}</div>`;}).join('');
  const homeAction=!spider&&actions.find(a=>a.type==='move'&&String(a.card)===String(selected)&&a.target==='foundation'&&homeSlots.find(slot=>slot.suit===cardById(a.card)?.suit)?.index===a.to);
  const homeArea=!spider?`<div class="solitaire-foundations" ${homeAction?H.target(selected,homeAction):''}>${homes}</div>`:'';
  const waste=!spider?`<div class="solitaire-waste-group"><div class="solitaire-waste" style="--waste-capacity:${d.drawCapacity}" data-motion-anchor="waste" aria-label="${H.esc(text('ui.waste'))}">${d.waste.length?d.waste.slice(-d.drawCapacity).map((c,i,visible)=>`<div class="solitaire-waste-card" style="--waste-index:${i}">${face(c,'waste',0,d.waste.length-visible.length+i,i===visible.length-1)}</div>`).join(''):C.cardSlot({className:'solitaire-empty solitaire-waste-empty',label:text('ui.waste'),kind:'discard'})}<span class="solitaire-waste-count">${H.countBadge(d.waste.length,text('ui.waste'),{corner:true})}</span></div></div>`:'';
  const counter=(value,label,id)=>`<span class="solitaire-counter"><span>${H.esc(label)}</span>${H.assetArt('counter',{style:'score',kind:'points',id,value,label},p=>H.components.scoreBadge(p))}</span>`;
  const stats=counter(d.scoring==='none'?'—':d.score,text('ui.score'),'solitaire-score')+counter(d.moves,text('ui.moves'),'solitaire-moves');
  const collect=actions.find(a=>a.type==='collect'),collectAttr=collect?`data-double-action="${H.esc(JSON.stringify(collect))}" aria-description="${H.esc(text('ui.autoCollectHelp'))}"`:'';
  const transfers=spider?[]:(s.events||[]).findLast(e=>e.type==='klondike.collect')?.params?.transfers||[];
  const motionBank=transfers.length?`<div class="solitaire-motion-bank" data-motion-transfers="${H.esc(JSON.stringify(transfers.map(t=>({entity:{namespace:'card',id:t.card.id},from:t.from,to:t.to}))))}" data-motion-trigger="collect">${transfers.map(t=>`<span data-motion-template="${H.esc(H.components.entityKey({namespace:'card',id:t.card.id}))}">${C.card(t.card,'disabled','solitaire-card')}</span>`).join('')}</div>`:'';
  const series=spider?`<span class="solitaire-counter solitaire-series"><span class="solitaire-series-label">${H.esc(text('ui.series'))}</span>${H.countBadge(d.completed.length,text('ui.series'))}<span>/8</span></span>`:'';
  const cardName=c=>c?`${c.rank>=11?text('ui.rank'+c.rank):c.rank} ${c.suit}`:'';
  const hintText=hint?.type==='move'?`${cardName(cardById(hint.card))} → ${hint.target==='tableau'?(cardName(d.tableau[hint.to]?.at(-1))||text('ui.empty')):text('ui.foundation')+' '+cardById(hint.card)?.suit}`:hint?text('actions.'+hint.type):n>=0?text('ui.noHint'):' ';
  const hintMarkup=n>=0?`<span class="player-status-badge solitaire-hint-token">${H.esc(hintText)}</span>`:H.esc(hintText);
  const hintId='solitaire-hint-popup-'+(spider?'spider':'klondike');
  const hintControl=`<span class="solitaire-hint-anchor">${iconControl(`data-view-key="hint" data-view-value="${s.move}:${n+1}" aria-expanded="${n>=0}" ${n>=0?`aria-describedby="${hintId}"`:''}`,text('ui.hint'),'hint',false)}${n>=0?`<span class="solitaire-hint-text solitaire-hint-popup" id="${hintId}" role="status">${hintMarkup}</span>`:''}</span>`;
  return {api:3,family:'cards',hidePlayers:true,...(!spider?{layout:{overrides:{fieldColumns:3}}}:{}),actionPlacement:'header-landscape',fieldSizing:'scroll',actionReserve:true,className:'solitaire-scene',elements:{field:`<div class="solitaire-board" style="--columns:${spider?10:7}" ${collectAttr} data-motion-layout="cards" data-solitaire-kind="${spider?'spider':'klondike'}"><div data-scene-status-home><div class="solitaire-stats" data-scene-status="${spider?'always':'portrait'}">${stats}</div></div>${spider?`<div class="solitaire-orientation-note"><span class="solitaire-portrait-note">${H.esc(text('ui.orientation'))}</span></div>`:''}<div class="solitaire-content" ${spider?'':'data-card-fit="portrait" data-card-columns="7" data-card-gap="2"'} style="${stackStyle}" data-asset-stack-family="card-face" data-asset-stack-axis="${stacking?.wasteAxis||'horizontal'}">${motionBank}${spider?'':`<div class="solitaire-stocks"><div class="solitaire-source-piles">${stock}${waste}</div>${homeArea}</div>`}<div class="solitaire-scroll" data-scene-scroll><div class="solitaire-columns" style="--columns:${spider?10:7}">${d.tableau.map(column).join('')}</div></div>${spider?'':'<div class="solitaire-side-actions" data-scene-actions-home="landscape"></div>'}</div></div>`,actions:`<div class="solitaire-action-row" data-solitaire-actions="${spider?'spider':'klondike'}">${spider?'':`<div class="solitaire-footer-stats">${stats}</div>`}<div class="scene-actions solitaire-controls">${buttons.join('')}${hintControl}${drawControl}</div><div class="solitaire-footer-right">${series}</div></div>`}};
 }
 root.PlayroomSolitaireBoard=Object.freeze({render});
})(globalThis);
