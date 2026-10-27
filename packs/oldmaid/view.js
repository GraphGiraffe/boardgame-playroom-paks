(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
 const source=typeof require==='function'&&!globalThis.PlayroomPack;
 const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
 const text=key=>translator.format({key:'oldmaid.'+key,params:{}});
 const card=(value,...args)=>C.card(value&&!value.hidden&&value.rank===12&&value.suit==='♠'?{...value,crown:true}:value,...args);
 const render=(s,viewer,actions)=>{const scene=s.scene,hand=scene.players[viewer]?.hand||[];return {api:3,family:'cards',layout:{focus:'hands'},fieldSizing:'content',actionReserve:false,className:'oldmaid-scene',playerContent:H.playerContent(s,viewer,(c,a)=>card(c,a),{scoreLabel:text('meta.score'),inactive:i=>scene.players[i].inactive}),elements:{field:`<div class="oldmaid-board" data-motion-table><div class="oldmaid-discard">${scene.discard.length?card(scene.discard.at(-1)):C.cardSlot({label:text('view.discard'),kind:'discard'})}${H.countBadge(scene.discard.length/2,text('view.discard'),{corner:true})}</div></div>`,hand:viewer>=0?H.hand(hand.map(c=>({id:c.id,html:card(c,'data-hand-preview="'+H.esc(c.id)+'"','hand-card')})),hand.length,'','',{layout:'fan'}):'',actions:''}};};
 V.register('oldmaid',render,()=>C.cover(`<g transform="translate(69 29) rotate(-14 44 62)"><rect width="88" height="124" rx="11" fill="#31594c" stroke="#d6c79a" stroke-width="3"/><path d="m44 23 26 39-26 39-26-39Z" fill="none" stroke="#d6c79a" stroke-width="3"/></g><g transform="translate(140 16) rotate(9 44 65)"><g data-cover-card="durak-style" transform="scale(1.15 1.12069)" font-family="system-ui,sans-serif" font-weight="700"><rect y="5" width="80" height="116" rx="12" fill="#c5b9a5"/><rect width="80" height="116" rx="12" fill="#fffbed"/><text x="13" y="30" font-size="24" fill="#426553">Д</text><path d="m25 39 7 7 8-13 8 13 7-7-4 19H29Z" fill="#c9a44f"/><text x="40" y="101" text-anchor="middle" font-size="48" fill="#426553">♠</text></g></g>`),{reveal:value=>card(value.card,'disabled'),illustrations:(source?require('./presentation/rule-illustrations.js'):globalThis.PlayroomPackRuleIllustrations).create({card}),surfaces:{table:render,player:render}});
})();

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("oldmaid",tutorial(tr));
})(globalThis);
