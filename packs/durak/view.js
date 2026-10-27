(function(){
  'use strict';const coverComponents=globalThis.PlayroomShared;const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
  if(H.viewApi!==3)throw Error('Нужно приложение с API интерфейса 2');
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
    if(!c||c.hidden)return C.card({hidden:true});
    const help=cardHelp(c,trump);
    return `<button data-size-role="card" class="playing-card art-card ${red(c)?'red-suit':''} ${cls}" ${attr} data-entity="${H.esc(H.components.entityKey({namespace:cls.includes('trump-card')?'trump':'card',id:c.id}))}" data-tooltip="${H.esc(help)}" aria-label="${H.esc(rank(c.rank)+' '+(suitNames[c.suit]||c.suit))}">${H.assetArt('card-face',{rank:rank(c.rank),suit:c.joker?'★':suits[c.suit]||c.suit,compact:variant==='compact'},H.components.cardFace)}</button>`;
  }
  const render=(s,viewer,actions,ui)=>{
    const scene=s.scene;
    actions=actions.map(action=>({...action,label:action.label||translator.format(P.action(action,{data:{hands:scene.players.map(player=>player.hand),table:scene.table,taking:scene.taking,composing:scene.composing},actor:s.tableActor??viewer,playerCount:s.players.length}))}));
    const hand=scene.players[viewer]?.hand||[],selected=actions.filter(a=>ui.selected!=null&&a.card===ui.selected),others=[...actions.filter(a=>!a.card||a.type==='exchange'),...selected.filter(a=>a.type==='transfer')];
    const tableMoves=selected.filter(a=>['attack'].includes(a.type)),tableDrop=tableMoves.length===1?H.target(ui.selected,tableMoves[0]):'';
    const reserveAttack=actions.some(a=>a.type==='attack');
    const capacity=6,columns=3,rows=2;
    const nextAttack=reserveAttack?`<div class="durak-pair durak-next-pair" data-durak-slot="${scene.table.length}">${C.cardSlot({attrs:tableDrop?tableDrop+' data-drop-snap':'disabled',className:'attack-card durak-attack-target',label:actions.find(a=>a.type==='attack').label,kind:'play'})}</div>`:'';
    const trumpLabel=scene.trump?text('view.trump-help',{suit:suitNames[scene.trump.suit]||scene.trump.suit}):text('view.trump');
    const token=scene.trump?`<span class="trump-token ${red(scene.trump)?'is-red':''}" tabindex="0" role="img" aria-label="${H.esc(trumpLabel)}" data-tooltip="${H.esc(trumpLabel)}">${H.assetArt('card-face',{suit:scene.trump.suit,suitOnly:true},H.components.cardFace)}</span>`:'';
    const stock=`<div class="durak-stock" data-field-group="stock"><div class="trump-stack" data-motion-stock data-motion-static>${scene.trump&&scene.stockCount?card(scene.trump,'disabled','trump-card',scene.trump.suit):''}<span class="stock-deck">${scene.stockCount?C.card({hidden:true}):C.cardSlot({className:'trump-placeholder',label:text('view.stock'),kind:'empty'})}${token}</span>${H.countBadge(scene.stockCount,text('view.stock'),{corner:true})}</div><span class="table-chip">${text('view.discard')} · ${scene.discardCount}</span></div>`,play=`<div class="durak-table" data-field-group="play" data-motion-table style="--durak-columns:${columns};--durak-rows:${rows}">${Array.from({length:capacity},(_,i)=>{const pair=scene.table[i];if(!pair)return i===scene.table.length&&reserveAttack?nextAttack:`<div class="durak-reserved-pair" data-durak-slot="${i}" aria-hidden="true" inert></div>`;const defend=selected.find(a=>a.type==='defend'&&a.target===i);return `<div data-durak-slot="${i}" class="durak-pair ${!pair.defense?'uncovered':''}"><div class="attack-card" data-tooltip="${H.esc(cardHelp(pair.attack,scene.trump?.suit))}">${card(pair.attack,'disabled','',scene.trump?.suit)}</div>${pair.defense?`<div class="defense-card" data-tooltip="${H.esc(cardHelp(pair.defense,scene.trump?.suit))}">${card(pair.defense,'disabled','',scene.trump?.suit)}</div>`:defend?`<button class="defend-target" ${H.target(ui.selected,defend)} data-drop-snap data-tooltip="${H.esc(defend.label+text('view.defend-hint'))}" aria-label="${H.esc(defend.label)}"></button>`:`<div class="defense-slot" aria-label="${text('view.uncovered')}"></div>`}</div>`;}).join('')}</div>`;
    return {api:3,fieldDropZone:true,actionReserve:true,family:'cards',fieldSizing:'scroll',className:'durak-scene',fieldGroups:{stock,play},playerContent:H.playerContent(s,viewer,(c,attrs,ctx)=>card(c,attrs,'',scene.trump?.suit,ctx?.variant),{scoreLabel:text('meta.wins'),badges:i=>[scene.players[i].role==='defender'?scene.taking?{label:text('view.taking'),icon:'takeCards',position:'avatar-bottom'}:{label:text('view.defender'),icon:'shield',position:'avatar-bottom'}:scene.players[i].role==='attacker'?{label:text('view.attacker'),icon:'sword',position:'avatar-bottom'}:null].filter(Boolean)}),elements:{participants:'',field:play,auxiliary:'',actions:H.actionBar(others),hand:H.hand(hand.map(c=>{
      const source=H.source(c.id,actions.filter(a=>a.type!=='exchange'),ui.selected,{mode:'immediate',preview:true,inspect:true,swipe:true,drag:true});
      return {id:c.id,selected:c.id===ui.selected,html:card(c,source.attr,source.className,scene.trump?.suit)};
    }),hand.length,text('view.hand-hint'),'',{layout:'fan'})}};
  };
  V.register('durak',render,()=>coverComponents.cover(`<g transform="translate(72 27) rotate(-17 40 57)"><g data-cover-card="durak-style" transform="scale(0.9875 0.965517)" font-family="system-ui,sans-serif" font-weight="700"><rect y="5" width="80" height="116" rx="12" fill="#c5b9a5"/><rect width="80" height="116" rx="12" fill="#fffbed"/><text x="13" y="30" font-size="24" fill="#df785e">6</text><text x="40" y="83" text-anchor="middle" font-size="67" fill="#df785e">♥</text></g></g><g transform="translate(137 19) rotate(15 40 58)"><g data-cover-card="durak-style" transform="scale(1 1)" font-family="system-ui,sans-serif" font-weight="700"><rect y="5" width="80" height="116" rx="12" fill="#c5b9a5"/><rect width="80" height="116" rx="12" fill="#fffbed"/><text x="13" y="30" font-size="24" fill="#426553">6</text><text x="40" y="83" text-anchor="middle" font-size="67" fill="#426553">♠</text></g></g><g transform="translate(212 121)"><circle r="18" fill="#e4bc59"/><text y="7" text-anchor="middle" font-size="23" fill="#426553">♠</text></g>`),{reveal:value=>card(value.card,'disabled'),illustrations:(source?require('./presentation/rule-illustrations.js'):globalThis.PlayroomPackRuleIllustrations).create({card}),surfaces:{table:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("durak",tutorial(tr));
})(globalThis);
