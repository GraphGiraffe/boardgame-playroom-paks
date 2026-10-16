(function(){
  'use strict';
  const V=globalThis.PlayroomViews,H=V.helpers;
  const source=typeof require==='function'&&!globalThis.PlayroomPack;
  const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
  const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
  const text=(key,params={})=>translator.format(typeof key==='string'?{key,params}:key);
  const name=color=>text('uno.view.color.'+color);
  if(H.viewApi!==2)throw Error('Нужно приложение с API интерфейса 2');
  const colors={red:'#df745b',yellow:'#e6ba52',green:'#578267',blue:'#6594b2',wild:'#3e514b',black:'#3e514b'};
  const value=c=>({skip:'⊘',reverse:'⇄','+2':'+2',wild:'✦'}[c.value]||c.value);
  const help=c=>text('uno.help.'+(['+4','+2','skip','reverse','wild'].includes(c.value)?c.value:'number'));
  function card(c,attrs='disabled',cls='',variant='main'){
    if(c.hidden)return H.back();
    const label=H.esc(value(c)),face=`<span class="card-corner">${label}</span><span class="uno-oval"><span class="face-value">${label}</span></span><span class="card-corner bottom">${label}</span>`;
    const main=`<div class="uno-art-face">${face}</div>`;
    // Compact artwork is opt-in. Larger corner symbols remain legible when cards overlap.
    const compact=`<div class="uno-art-face uno-art-compact"><span class="card-corner">${label}</span><span class="uno-oval"><span class="face-value">${label}</span></span></div>`;
    return `<button class="uno-card art-card ${cls}" style="--card-color:${colors[c.color]||colors.wild}" ${attrs} data-entity="card-${H.esc(c.id)}" data-tooltip="${H.esc(help(c))}" aria-label="${H.esc(name(c.color)+' '+value(c))}">${H.assetArt('card-face',{main,compact,width:72,height:103,variant},H.components.cardFace)}</button>`;
  }
  (globalThis.PlayroomCatalog ||= {}).uno ||= {};
  globalThis.PlayroomCatalog.uno.playerBadge=(state,index)=>state.data.uno?.declared?.[index]?{label:'UNO!',tone:'success'}:'';
  function render(s,viewer,actions,ui={}){
    const surface=ui.surface||'combined';
    actions=actions.map(action=>action.label?action:{...action,label:text(P.action(action,{actor:s.tableActor??viewer,data:s.data}))});
    const d=s.data,hand=d.hands[viewer]||[],top=d.discard[d.discard.length-1],draw=actions.find(a=>a.type==='draw'),chosen=actions.filter(a=>ui.selected!=null&&a.card===ui.selected);
    const manual=d.uno?.mode==='manual',declare=actions.find(a=>a.type==='declare-uno');
    const other=actions.filter(a=>!a.card&&!['draw','declare-uno','accuse-uno'].includes(a.type));
    const drop=chosen.length?`<button class="uno-drop-target" ${H.target(ui.selected,chosen.length===1?chosen[0]:null)} aria-label="${chosen.length===1?text('uno.view.drop'):text('uno.view.drop-color')}"><span>${H.esc(text('uno.view.drop-caption'))}</span></button>`:'';
    const call=manual?`<button class="scene-button uno-call" ${declare?H.actionAttr(declare):'disabled'} aria-label="${H.esc(text('uno.view.declare'))}" data-tooltip="${H.esc(text('uno.view.call-help'))}">UNO!</button>`:'';
    const ordinary=draw?[draw,...other]:other;
    const controls=chosen.length>1?`<div class="uno-color-picker" aria-label="${H.esc(text('uno.view.choose-color'))}">${chosen.map(a=>`<button class="color-choice" ${H.target(a.card,a)} style="--choice:${colors[a.color]||colors.wild}" aria-label="${H.esc(a.label)}"><i></i>${H.esc(name(a.color))}</button>`).join('')}</div>`:ordinary.map(a=>H.actionButton(a)).join('');
    const hint=!controls?`<span class="scene-hint">${viewer===s.turn?text('uno.view.touch-card'):text('uno.view.wait')}</span>`:'';
    const direction=s.players.length-(d.ending?.groups?.flat().length||0)>2?`<div class="uno-direction" data-direction="${d.direction}" role="img" aria-label="${H.esc(d.direction===-1?text('uno.view.counterclockwise'):text('uno.view.clockwise'))}"><svg viewBox="0 0 64 16" aria-hidden="true"><path d="M3 8H61M54 2L61 8L54 14"/></svg></div>`:'';
    const dock=H.actionGroups({start:call,primary:controls+hint,end:`<button class="uno-card-help" data-command="card-help" aria-label="${H.esc(text('uno.view.card-help'))}">${H.icon('help')}</button>`,exclusive:chosen.length>1});
    return {api:2,family:'cards',className:'uno-scene surface-'+surface,playerContent:H.playerContent(s,viewer,(c,attrs,ctx)=>card(c,attrs,'',ctx?.variant),{badges:i=>d.uno?.declared?.[i]?['UNO!']:[]}),elements:{
      participants:'',
      field:`<div class="uno-play-area"><div class="uno-flow">${direction}<div class="uno-color-indicator" aria-label="${H.esc(text('uno.view.active-color',{color:name(d.color)}))}"><i style="background:${colors[d.color]||colors.wild}"></i>${H.esc(name(d.color))}</div></div><div class="uno-center"><button class="stock-button" ${draw?H.actionAttr(draw):'disabled'} aria-label="${H.esc(text('uno.view.draw'))}" data-tooltip="${H.esc(text('uno.view.stock-help'))}">${H.back()}${H.countBadge(d.drawPile.length,text('uno.view.stock-count'),{corner:true})}<small>${H.esc(text('uno.view.stock-caption'))}</small></button><div class="uno-discard" data-motion-table data-tooltip="${H.esc(text('uno.view.discard-help'))}">${top?card(top):''}${drop}<small>${H.esc(text('uno.view.discard-caption',{count:d.discard.length}))}</small></div></div></div>`,
      actions:dock,
      auxiliary:'',
      hand:surface!=='table'?H.hand(hand.map(c=>{const source=H.source(c.id,actions,ui.selected,{mode:ui.quickPlay?'immediate':'select',preview:true,inspect:true,drag:true,swipe:true});return card(c,source.attr,source.className);}),hand.length,ui.quickPlay?text('uno.view.quick-hand'):text('uno.view.select-hand'),'',{layout:'fan'}):''
    }};
  }
  V.register('uno',render,()=>H.svg(`<ellipse cx="155" cy="151" rx="90" ry="13" fill="#becba7"/><g transform="translate(61 24) rotate(-18 43 61)"><rect y="5" width="85" height="121" rx="13" fill="#9daa83"/><rect width="85" height="121" rx="13" fill="#fff8e9"/><rect x="6" y="6" width="73" height="109" rx="9" fill="#e1b94f"/><text x="15" y="30" font-size="19" fill="#fffaf0">2</text><ellipse cx="43" cy="60" rx="25" ry="38" fill="#fae8a9" transform="rotate(25 43 60)"/><text x="43" y="78" text-anchor="middle" font-size="51" fill="#a0802b">2</text></g><g transform="translate(112 16) rotate(12 44 62)"><rect y="6" width="88" height="124" rx="13" fill="#b9bc95"/><rect width="88" height="124" rx="13" fill="#fff9ed"/><rect x="6" y="6" width="76" height="112" rx="9" fill="#df785e"/><text x="15" y="30" font-size="19" fill="#fffaf0">7</text><ellipse cx="44" cy="61" rx="26" ry="40" fill="#f9c9a8" transform="rotate(25 44 61)"/><text x="44" y="80" text-anchor="middle" font-size="56" fill="#b9553e">7</text></g><g transform="translate(199 108) rotate(14)"><rect width="35" height="35" rx="10" fill="#3f6d52"/><path d="m10 17 5 5 10-12" fill="none" stroke="#dfebc4" stroke-width="4" stroke-linecap="round"/></g>`),{reveal:value=>card(value.card,'disabled'),surfaces:{table:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();
