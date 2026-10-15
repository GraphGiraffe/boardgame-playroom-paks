(function(){
  'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
  if(H.viewApi!==2)throw Error('Нужно приложение с API интерфейса 2');
  const source=typeof require==='function'&&!globalThis.PlayroomPack;
  const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
  const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
  const text=(key,params={})=>translator.format({key:'durak.'+key,params});
  const suits=Object.fromEntries(['♥','♦','♣','♠'].map(suit=>[suit,suit]));
  const suitKeys={'♥':'hearts','♦':'diamonds','♣':'clubs','♠':'spades'};
  const suitNames=Object.fromEntries(Object.entries(suitKeys).map(([suit,key])=>[suit,text('suit.'+key)]));
  const rank=value=>value>=11?text('rank.'+value):value;
  const red=card=>card.color==='red'||['♥','♦'].includes(card.suit);
  const cardHelp=(card,trump)=>card.joker?text('view.joker-help',{card:translator.format(P.face(card))}):
    text('view.card-help',{rank:rank(card.rank),suit:suitNames[card.suit],rule:text(card.suit===trump?'view.trump-rule':'view.suit-rule')});
  function card(c,attr='disabled',cls='',trump=null,variant='main'){
    if(!c||c.hidden)return H.back();
    const help=cardHelp(c,trump);
    const legacy=`<span class="card-corner">${rank(c.rank)}<small>${c.joker?'★':suits[c.suit]||c.suit}</small></span><span class="card-suit">${c.joker?'★':suits[c.suit]||c.suit}</span><span class="card-corner bottom">${rank(c.rank)}<small>${c.joker?'★':suits[c.suit]||c.suit}</small></span>`;
    const main=`<div class="durak-art-face">${legacy}</div>`;
    const compact=`<div class="durak-art-face durak-art-compact"><span class="card-corner">${rank(c.rank)}<small>${suits[c.suit]||c.suit}</small></span><span class="card-suit">${suits[c.suit]||c.suit}</span></div>`;
    return `<button class="playing-card art-card ${red(c)?'red-suit':''} ${cls}" ${attr} data-entity="${cls.includes('trump-card')?'trump':'card'}-${H.esc(c.id)}" data-tooltip="${H.esc(help)}" aria-label="${H.esc(rank(c.rank)+' '+(suitNames[c.suit]||c.suit))}">${H.art({main,compact,width:66,height:97},variant)}</button>`;
  }
  const render=(s,viewer,actions,ui)=>{
    actions=actions.map(action=>({...action,label:action.label||translator.format(P.action(action,s.modelProjection||{data:s.data,actor:viewer,playerCount:s.players.length}))}));
    const d=s.data,hand=d.hands[viewer]||[],selected=actions.filter(a=>ui.selected!=null&&a.card===ui.selected),others=[...actions.filter(a=>!a.card||a.type==='exchange'),...selected.filter(a=>a.type==='transfer')];
    const columns=Math.max(1,Math.min(3,d.table.length)),rows=Math.max(1,Math.ceil(d.table.length/3));
    const stock=`<div class="durak-stock" data-field-group="stock"><div class="trump-stack" data-motion-stock data-motion-static>${d.trump?card(d.trump,'disabled','trump-card',d.trump?.suit):''}${d.drawPile.length?C.card({hidden:true}):''}${H.countBadge(d.drawPile.length,text('view.stock'),{corner:true})}</div><span class="trump-caption" tabindex="0" data-tooltip="${H.esc(text('view.trump-help',{suit:suitNames[d.trump?.suit]||d.trump?.suit}))}">${text('view.trump')} <b class="${d.trump&&red(d.trump)?'red-suit':''}">${suits[d.trump?.suit]||'—'}</b></span><span class="table-chip">${text('view.discard')} · ${d.discard.length}</span></div>`,play=`<div class="durak-table" data-field-group="play" data-motion-table style="--durak-columns:${columns};--durak-rows:${rows}">${d.table.length?d.table.map((pair,i)=>{const defend=selected.find(a=>a.type==='defend'&&a.target===i);return `<div class="durak-pair ${!pair.defense?'uncovered':''}"><div class="attack-card" data-tooltip="${H.esc(cardHelp(pair.attack,d.trump?.suit))}">${card(pair.attack,'disabled','',d.trump?.suit)}</div>${pair.defense?`<div class="defense-card" data-tooltip="${H.esc(cardHelp(pair.defense,d.trump?.suit))}">${card(pair.defense,'disabled','',d.trump?.suit)}</div>`:defend?`<button class="defend-target" ${H.target(ui.selected,defend)} data-tooltip="${H.esc(defend.label+text('view.defend-hint'))}" aria-label="${H.esc(defend.label)}">${H.icon('check')}</button>`:`<div class="defense-slot" aria-label="${text('view.uncovered')}"></div>`}</div>`;}).join(''):`<div class="durak-empty"><span>♠</span></div>`}</div>`;
    return {api:2,actionReserve:true,family:'cards',className:'durak-scene',fieldGroups:{stock,play},playerContent:H.playerContent(s,viewer,(c,attrs,ctx)=>card(c,attrs,'',d.trump?.suit,ctx?.variant),{scoreLabel:text('meta.wins'),badges:i=>[i===d.defender?d.taking?{label:text('view.taking'),icon:'takeCards'}:{label:text('view.defender'),icon:'shield'}:i===d.attacker?{label:text('view.attacker'),icon:'sword'}:{label:text('view.thrower'),icon:'sword'}]}),elements:{participants:'',field:play,auxiliary:'',actions:H.actionBar(others),hand:H.hand(hand.map(c=>{
      const source=H.source(c.id,actions.filter(a=>a.type!=='exchange'),ui.selected,{mode:'immediate',preview:true,inspect:true,swipe:true,drag:false});
      return card(c,source.attr,source.className,d.trump?.suit);
    }),hand.length,text('view.hand-hint'),'',{layout:'fan'})}};
  };
  V.register('durak',render,()=>H.svg(`<ellipse cx="151" cy="151" rx="91" ry="12" fill="#cbbdab"/><g transform="translate(72 27) rotate(-17 40 57)"><rect y="5" width="79" height="112" rx="12" fill="#c5b9a5"/><rect width="79" height="112" rx="12" fill="#fffbed"/><text x="13" y="29" font-size="24" fill="#df785e">К</text><text x="40" y="81" text-anchor="middle" font-size="60" fill="#df785e">♥</text></g><g transform="translate(137 19) rotate(15 40 58)"><rect y="5" width="80" height="116" rx="12" fill="#c5b9a5"/><rect width="80" height="116" rx="12" fill="#fffbed"/><text x="13" y="30" font-size="24" fill="#426553">Т</text><text x="40" y="83" text-anchor="middle" font-size="67" fill="#426553">♠</text></g><g transform="translate(212 121)"><circle r="18" fill="#e4bc59"/><text y="7" text-anchor="middle" font-size="23" fill="#fff7dd">♠</text></g>`),{surfaces:{table:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();
