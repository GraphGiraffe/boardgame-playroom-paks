(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
 const source=typeof require==='function'&&!globalThis.PlayroomPack;
 const Mini=globalThis.PlayroomMiniCards||(source?require('../../shared/asset-packs/mini-cards/renderer.js'):null);
 const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
 const text=(key,params={})=>translator.format({key:'gofish.'+key,params});
 const rank=n=>({11:'В',12:'Д',13:'К',14:'Т',15:'Дж'})[n]||n;
 const render=(s,viewer,actions,ui={})=>{const scene=s.scene,hand=scene.players[viewer]?.hand||[],draw=actions.find(a=>a.type==='draw');
 const order=s.players.map((_,p)=>p).sort((a,b)=>H.playerOrderPosition(s,a)-H.playerOrderPosition(s,b));
 const books=`<table class="gofish-book-table" data-responsive-score-table="2" data-score-column-width="100"><tbody>${order.map(p=>`<tr class="gofish-book-row" data-book-player="${p}" aria-label="${H.esc(text('view.owner',{player:s.players[p].name}))}"><th scope="row" class="gofish-owner" title="${H.esc(s.players[p].name)}">${H.avatar(s.players[p],p)}</th><td><div class="gofish-book-cards" data-card-overlap="14" data-scene-scroll>${scene.players[p].books.map((n,i)=>Mini.card({rank:rank(n),id:scene.players[p].bookCards[i].id,className:'gofish-book'})).join('')}</div></td></tr>`).join('')}</tbody></table>`;

 return {api:3,family:'cards',layout:{focus:'hands'},fieldSizing:'scroll',actionReserve:true,className:'gofish-scene',playerContent:H.playerContent(s,viewer,(c,a)=>C.card(c,a),{}),elements:{field:`<div class="gofish-board" data-score-table-space data-scene-scroll><div class="gofish-stock" data-motion-stock>${scene.stockCount?C.card(null):C.cardSlot({label:text('view.stock'),kind:'stock'})}${H.countBadge(scene.stockCount,text('view.stock'),{corner:true})}</div><div class="gofish-books" data-motion-table>${books}</div></div>`,hand:viewer>=0?H.hand(hand.map(c=>{const source=H.source(c.id,actions,ui.selected);return {id:c.id,selected:c.id===ui.selected,html:C.card(c,source.attr,source.className)};}),hand.length,'','',{layout:'fan'}):'',actions:H.actionGroups({primary:draw?H.actionButton(draw):''})}};};
 V.register('gofish',render,()=>C.cover(`<g transform="translate(160 30) rotate(10 42 60)"><g data-cover-card="durak-style" transform="scale(1.05 1.01724)" font-family="system-ui,sans-serif" font-weight="700"><rect y="5" width="80" height="116" rx="12" fill="#c5b9a5"/><rect width="80" height="116" rx="12" fill="#fffbed"/><text x="13" y="30" font-size="24" fill="#df785e">Т</text><text x="40" y="83" text-anchor="middle" font-size="67" fill="#df785e">♥</text></g></g><path d="M143 91c-29-47-87-42-110 0 23 42 81 47 110 0l29-26v53Z" fill="#699bab" stroke="#3e6b77" stroke-width="4"/><path d="m88 62 15-21 13 27m-28 53 15 20 13-27" fill="#d9b864"/><circle cx="58" cy="84" r="6" fill="#fff9e6"/><circle cx="57" cy="84" r="3" fill="#304f46"/><path d="M91 70q-18 22 0 44" fill="none" stroke="#4e7d88" stroke-width="3"/>`),{seating:'row',reveal:value=>C.card(value.card,'disabled'),illustrations:(source?require('./presentation/rule-illustrations.js'):globalThis.PlayroomPackRuleIllustrations).create(),surfaces:{table:(s,v)=>render(s,v,[]),player:render}});
})();

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("gofish",tutorial(tr));
})(globalThis);
