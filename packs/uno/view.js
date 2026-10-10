(function(){
  'use strict';
  const V=globalThis.PlayroomViews,H=V.helpers;
  if(H.viewApi!==2)throw Error('Нужно приложение с API интерфейса 2');
  const names={red:'Красный',yellow:'Жёлтый',green:'Зелёный',blue:'Синий',wild:'Выбор цвета',black:'Выбор цвета'};
  const colors={red:'#df745b',yellow:'#e6ba52',green:'#578267',blue:'#6594b2',wild:'#3e514b',black:'#3e514b'};
  const value=c=>({skip:'⊘',reverse:'⇄',draw2:'+2','+2':'+2',wild:'✦',wild4:'+4',draw4:'+4'}[c.value]||c.value);
  const help=c=>({
    '+4':'Выберите следующий цвет. Следующий игрок берёт 4 карты и пропускает ход. Можно сыграть только тогда, когда в вашей руке нет карты активного цвета.',
    draw4:'Выберите следующий цвет. Следующий игрок берёт 4 карты и пропускает ход. Можно сыграть только тогда, когда в вашей руке нет карты активного цвета.',
    wild4:'Выберите следующий цвет. Следующий игрок берёт 4 карты и пропускает ход. Можно сыграть только тогда, когда в вашей руке нет карты активного цвета.',
    '+2':'Следующий игрок автоматически берёт 2 карты и пропускает ход. Штрафы не складываются.',
    draw2:'Следующий игрок автоматически берёт 2 карты и пропускает ход. Штрафы не складываются.',
    skip:'Следующий игрок пропускает ход. При игре вдвоём вы ходите снова.',
    reverse:'Меняет направление очереди ходов. При игре вдвоём соперник пропускает ход, и вы ходите снова.',
    wild:'Выберите любой следующий цвет. Эту карту можно сыграть при любом активном цвете.'
  }[c.value]||'Числовую карту можно положить на тот же цвет или то же число. После неё ход переходит следующему игроку.');
  function card(c,attrs='disabled',cls='',variant='main'){
    if(c.hidden)return H.back();
    const label=H.esc(value(c)),legacy=`<span class="card-corner">${label}</span><span class="uno-oval"><span class="face-value">${label}</span></span><span class="card-corner bottom">${label}</span>`;
    const main=`<div class="uno-art-face">${legacy}</div>`;
    // Compact artwork is opt-in. Larger corner symbols remain legible when cards overlap.
    const compact=`<div class="uno-art-face uno-art-compact"><span class="card-corner">${label}</span><span class="uno-oval"><span class="face-value">${label}</span></span></div>`;
    return `<button class="uno-card ${H.art?'art-card':''} ${cls}" style="--card-color:${colors[c.color]||colors.wild}" ${attrs} data-entity="card-${H.esc(c.id)}" data-tooltip="${H.esc(help(c))}" aria-label="${H.esc((names[c.color]||'Любой цвет')+' '+value(c))}">${H.art?H.art({main,compact,width:72,height:103},variant):legacy}</button>`;
  }
  (globalThis.PlayroomCatalog ||= {}).uno ||= {};
  globalThis.PlayroomCatalog.uno.playerBadge=(state,index)=>state.data.uno?.declared?.[index]?{label:'UNO!',tone:'success'}:'';
  function render(s,viewer,actions,ui={}){
    const surface=ui.surface||'combined';
    if(surface==='table')actions=[];
    const d=s.data,hand=d.hands[viewer]||[],top=d.discard[d.discard.length-1],draw=actions.find(a=>a.type==='draw'),chosen=actions.filter(a=>ui.selected!=null&&a.card===ui.selected);
    const manual=d.uno?.mode==='manual',declare=actions.find(a=>a.type==='declare-uno');
    const other=actions.filter(a=>!a.card&&!['draw','declare-uno','accuse-uno'].includes(a.type));
    const drop=chosen.length?`<button class="uno-drop-target" ${H.target(ui.selected,chosen.length===1?chosen[0]:null)} aria-label="${chosen.length===1?'Положить выбранную карту на сброс':'Положить карту на сброс и выбрать цвет'}"><span>На сброс ↓</span></button>`:'';
    const call=manual?`<button class="scene-button uno-call" ${declare?H.actionAttr(declare):'disabled'} aria-label="Объявить UNO" data-tooltip="UNO! объявляется вручную. Нажмите карточку соперника и выберите действие UNO!.">UNO!</button>`:'';
    const ordinary=draw?[draw,...other]:other;
    const controls=chosen.length>1?`<div class="uno-color-picker" aria-label="Выберите цвет">${chosen.map(a=>`<button class="color-choice" ${H.target(a.card,a)} style="--choice:${colors[a.color]||colors.wild}" aria-label="${H.esc(a.label)}"><i></i>${H.esc(names[a.color]||a.label)}</button>`).join('')}</div>`:ordinary.map(a=>H.actionButton(a)).join('');
    const hint=!controls?`<span class="scene-hint">${viewer===s.turn?'Коснитесь подсвеченной карты':'Ждём следующий ход'}</span>`:'';
    const direction=`<div class="uno-direction" data-direction="${d.direction}" role="img" aria-label="${H.esc('Очередность игроков: '+s.players.map(p=>p.name).join(d.direction===-1?' ← ':' → '))}"><svg viewBox="0 0 64 16" aria-hidden="true"><path d="M3 8H61M54 2L61 8L54 14"/></svg></div>`;
    const dock=H.actionGroups({start:call,primary:controls+hint,end:'<button class="uno-card-help" data-command="card-help" aria-label="Подсказки по картам">'+H.icon('help')+'</button>'});
    return {api:2,family:'cards',className:'uno-scene surface-'+surface,playerContent:H.playerContent(s,viewer,(c,attrs,ctx)=>card(c,attrs,'',ctx?.variant),{badges:i=>d.uno?.declared?.[i]?['UNO!']:[]}),elements:{
      participants:'',
      field:`<div class="uno-play-area"><div class="uno-flow">${direction}<div class="uno-color-indicator" aria-label="Активный цвет: ${H.esc(names[d.color]||'Выберите цвет')}"><i style="background:${colors[d.color]||colors.wild}"></i>${H.esc(names[d.color]||'Выберите цвет')}</div></div><div class="uno-center"><button class="stock-button" ${draw?H.actionAttr(draw):'disabled'} aria-label="Взять карту" data-tooltip="Возьмите одну карту. До завершения хода можно сыграть только что взятую карту, если она подходит.">${H.back()}<span class="pile-count">${d.drawPile.length}</span><small>КОЛОДА</small></button><div class="uno-discard" data-motion-table data-tooltip="Сюда кладут карту активного цвета, с тем же числом или символом, либо разрешённую чёрную карту.">${top?card(top):''}${drop}<small>СБРОС · ${d.discard.length}</small></div></div></div>`,
      actions:surface!=='table'?dock:'',
      auxiliary:'',
      hand:surface!=='table'?H.hand(hand.map(c=>{const source=H.source(c.id,actions,ui.selected,{mode:ui.quickPlay?'immediate':'select',preview:true,inspect:true,drag:true,swipe:true});return card(c,source.attr,source.className);}),hand.length,ui.quickPlay?'Нажмите карту для хода · чёрная карта: выберите цвет':'Выберите карту · затем сброс, свайп или перенос','',{layout:'fan'}):''
    }};
  }
  V.register('uno',render,()=>H.svg(`<ellipse cx="155" cy="151" rx="90" ry="13" fill="#becba7"/><g transform="translate(61 24) rotate(-18 43 61)"><rect y="5" width="85" height="121" rx="13" fill="#9daa83"/><rect width="85" height="121" rx="13" fill="#fff8e9"/><rect x="6" y="6" width="73" height="109" rx="9" fill="#e1b94f"/><text x="15" y="30" font-size="19" fill="#fffaf0">2</text><ellipse cx="43" cy="60" rx="25" ry="38" fill="#fae8a9" transform="rotate(25 43 60)"/><text x="43" y="78" text-anchor="middle" font-size="51" fill="#a0802b">2</text></g><g transform="translate(112 16) rotate(12 44 62)"><rect y="6" width="88" height="124" rx="13" fill="#b9bc95"/><rect width="88" height="124" rx="13" fill="#fff9ed"/><rect x="6" y="6" width="76" height="112" rx="9" fill="#df785e"/><text x="15" y="30" font-size="19" fill="#fffaf0">7</text><ellipse cx="44" cy="61" rx="26" ry="40" fill="#f9c9a8" transform="rotate(25 44 61)"/><text x="44" y="80" text-anchor="middle" font-size="56" fill="#b9553e">7</text></g><g transform="translate(199 108) rotate(14)"><rect width="35" height="35" rx="10" fill="#3f6d52"/><path d="m10 17 5 5 10-12" fill="none" stroke="#dfebc4" stroke-width="4" stroke-linecap="round"/></g>`),{surfaces:{table:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();
