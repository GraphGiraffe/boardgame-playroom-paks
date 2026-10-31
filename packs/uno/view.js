(function(){
  'use strict';const coverComponents=globalThis.PlayroomShared;
  const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
  const source=typeof require==='function'&&!globalThis.PlayroomPack;
  const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
  const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
  const text=(key,params={})=>translator.format(typeof key==='string'?{key,params}:key);
  const name=color=>text('uno.view.color.'+color);
  if(H.viewApi!==3)throw Error('Нужно приложение с API интерфейса 2');
  const deck=source?require('../../shared/asset-packs/uno-deck/renderer.js'):globalThis.PlayroomUnoDeck;
  const {colors,value}=deck;
  const help=c=>text('uno.help.'+(['+4','+2','skip','reverse','wild'].includes(c.value)?c.value:'number'));
  function card(c,attrs='disabled',cls='',variant='main'){
    if(c.hidden)return C.card({hidden:true,assetSet:'uno-deck'});
    return `<button data-size-role="card" class="uno-card art-card ${cls}" style="--card-color:${colors[c.color]||colors.wild}" ${attrs} data-entity="${H.esc(H.components.entityKey({namespace:'card',id:c.id}))}" data-tooltip="${H.esc(help(c))}" aria-label="${H.esc(name(c.color)+' '+value(c))}">${H.assetArt('card-face',deck.print(c,variant),H.components.cardFace)}</button>`;
  }
  (globalThis.PlayroomCatalog ||= {}).uno ||= {};
  globalThis.PlayroomCatalog.uno.playerBadge=(state,index)=>state.scene.declared[index]?{label:'UNO',tone:'success',position:'avatar-bottom'}:'';
  function render(s,viewer,actions,ui={}){
    const surface=ui.surface||'combined';
    const scene=s.scene;
    actions=actions.map(action=>action.label?action:{...action,label:text(P.action(action,{actor:s.tableActor??viewer,data:{hands:scene.players.map(person=>person.hand)}}))});
    const hand=scene.players[viewer]?.hand||[],top=scene.discard,draw=actions.find(a=>a.type==='draw'),chosen=actions.filter(a=>ui.selected!=null&&a.card===ui.selected);
    const manual=scene.manualDeclaration,declare=actions.find(a=>a.type==='declare-uno');
    const other=actions.filter(a=>!a.card&&!['draw','declare-uno','accuse-uno'].includes(a.type));
    const drop=chosen.length?`<button class="uno-drop-target" ${H.target(ui.selected,chosen.length===1?chosen[0]:null)} data-drop-snap aria-label="${chosen.length===1?text('uno.view.drop'):text('uno.view.drop-color')}"><span>${H.esc(text('uno.view.drop-caption'))}</span></button>`:'';
    const call=manual?H.button({label:'UNO!',ariaLabel:text('uno.view.declare'),variant:'game',className:'uno-call',attrs:(declare?H.actionAttr(declare):'disabled')+` data-tooltip="${H.esc(text('uno.view.call-help'))}"`}):'';
    const ordinary=draw?[draw,...other]:other;
    const controls=chosen.length>1?`<div class="uno-color-picker" aria-label="${H.esc(text('uno.view.choose-color'))}">${chosen.map(a=>`<button class="color-choice" ${H.target(a.card,a)} style="--choice:${colors[a.color]||colors.wild}" aria-label="${H.esc(a.label)}"><i></i>${H.esc(name(a.color))}</button>`).join('')}</div>`:ordinary.map(a=>H.actionButton(a)).join('');
    const direction=scene.activePlayerCount>2?`<div class="uno-direction" data-direction="${scene.direction}" role="img" aria-label="${H.esc(scene.direction===-1?text('uno.view.counterclockwise'):text('uno.view.clockwise'))}"><svg viewBox="0 0 64 16" aria-hidden="true"><path d="M3 8H61M54 2L61 8L54 14"/></svg></div>`:'';
    const dock=H.actionGroups({start:call,primary:controls,end:H.button({icon:'help',ariaLabel:text('uno.view.card-help'),variant:'game',className:'uno-card-help',attrs:'data-command="card-help"'}),exclusive:chosen.length>1});
    return {api:3,family:'cards',layout:{focus:'hands'},fieldSizing:'content',className:'uno-scene player-menu-overlay surface-'+surface,playerContent:H.playerContent(s,viewer,(c,attrs,ctx)=>card(c,attrs,'',ctx?.variant),{badges:i=>scene.declared[i]?[{label:'UNO',tone:'success',position:'avatar-bottom'}]:[]}),elements:{
      participants:'',
      field:`<div class="uno-play-area" data-drop-zone><div class="uno-flow">${direction}<div class="uno-color-indicator" aria-label="${H.esc(text('uno.view.active-color',{color:name(scene.color)}))}"><i style="background:${colors[scene.color]||colors.wild}"></i>${H.esc(name(scene.color))}</div></div><div class="uno-center"><button class="stock-button" ${draw?H.actionAttr(draw):'disabled'} aria-label="${H.esc(text('uno.view.draw'))}" data-tooltip="${H.esc(text('uno.view.stock-help'))}">${scene.stockCount?C.card({hidden:true,assetSet:'uno-deck'}):C.cardSlot({label:text('uno.view.draw'),kind:'stock',tag:'span',attrs:''})}${H.countBadge(scene.stockCount,text('uno.view.stock-count'),{corner:true})}</button><div class="uno-discard" data-motion-table data-tooltip="${H.esc(text('uno.view.discard-help'))}">${top?card(top):C.cardSlot({label:text('uno.view.discard-help'),kind:'discard'})}${drop}<small>${H.esc(text('uno.view.discard-caption',{count:scene.discardCount}))}</small></div></div></div>`,
      actions:dock,
      auxiliary:'',
      hand:surface!=='table'?H.hand(hand.map(c=>{const source=H.source(c.id,actions,ui.selected,{mode:ui.quickPlay?'immediate':'select',preview:true,inspect:true,drag:true,swipe:true});return {id:c.id,selected:c.id===ui.selected,html:card(c,source.attr,source.className)};}),hand.length,ui.quickPlay?text('uno.view.quick-hand'):text('uno.view.select-hand'),'',{layout:'fan'}):''
    }};
  }
  V.register('uno',render,()=>coverComponents.cover(`<g transform="translate(61 24) rotate(-18 43 61)"><rect y="5" width="85" height="121" rx="13" fill="#9daa83"/><rect width="85" height="121" rx="13" fill="#fff8e9"/><rect x="6" y="6" width="73" height="109" rx="9" fill="#e1b94f"/><text x="15" y="30" font-size="19" fill="#fffaf0">2</text><ellipse cx="43" cy="60" rx="25" ry="38" fill="#fae8a9" transform="rotate(25 43 60)"/><text x="43" y="78" text-anchor="middle" font-size="51" fill="#a0802b">2</text></g><g transform="translate(112 16) rotate(12 44 62)"><rect y="6" width="88" height="124" rx="13" fill="#b9bc95"/><rect width="88" height="124" rx="13" fill="#fff9ed"/><rect x="6" y="6" width="76" height="112" rx="9" fill="#df785e"/><text x="15" y="30" font-size="19" fill="#fffaf0">7</text><ellipse cx="44" cy="61" rx="26" ry="40" fill="#f9c9a8" transform="rotate(25 44 61)"/><text x="44" y="80" text-anchor="middle" font-size="56" fill="#b9553e">7</text></g>`),{reveal:value=>card(value.card,'disabled'),illustrations:(source?require('./presentation/rule-illustrations.js'):globalThis.PlayroomPackRuleIllustrations).create({card}),surfaces:{table:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("uno",tutorial(tr));
})(globalThis);
