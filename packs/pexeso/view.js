(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
 const source=typeof require==='function'&&!globalThis.PlayroomPack;
 const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
 const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
 const text=key=>translator.format({key:'pexeso.'+key,params:{}});
 const cartoon=source?require('../../shared/asset-packs/cartoon-deck/renderer.js'):globalThis.PlayroomCartoonDeck;
 const packAsset=globalThis.PlayroomPack?.asset;
 const characterSources=id=>Object.fromEntries(['minimal','simple'].map(style=>{
  const folder='characters-'+style,extension='svg';
  return [style,globalThis.PlayroomCharacterSets?.[style]?.[id]||packAsset?.('assets/shared-packs/'+folder+'/runtime/'+id+'.'+extension)||globalThis.PlayroomAvatars?.source(id,style)||''];
 }));
 const characterCard=(card,attrs='disabled')=>card.character?`<button class="shared-card pexeso-character-card" ${attrs} aria-label="${H.esc(text('characters.'+card.shape)+' · '+text('colors.'+card.color))}">${H.assetArt('character-face',{character:card.character,characterSources:characterSources(card.character)},params=>cartoon.face(params.character,()=>params.characterSources.minimal))}</button>`:C.card(card,attrs);


 const render=(s,viewer,actions,ui={})=>{const d=s.data,closing=d.phase==='reveal'&&ui.presentationTurn!=null&&ui.presentationTurn!==s.turn;return {api:2,family:'cards',skinFamilies:d.deckSize===96?['character-face','card-back']:['card-face','card-back'],fieldSizing:'fit',actionReserve:false,className:'pexeso-scene',playerContent:H.playerContent(s,viewer,null,{}),elements:{field:`<div class="pexeso-grid"  data-card-count="${d.board.length}" style="--pexeso-wide-columns:${d.board.length<=16?4:6};--pexeso-wide-rows:${Math.ceil(d.board.length/(d.board.length<=16?4:6))};--pexeso-narrow-rows:${Math.ceil(d.board.length/4)}">${d.board.map((c,i)=>{const a=actions.find(x=>x.type==='flip'&&x.index===i),mismatch=d.phase==='reveal'&&d.flipped.includes(i),card=mismatch&&!closing?{hidden:true}:c;return `${d.board.length===24&&i===12?'<div class="pexeso-gap" data-grid-gap="center" hidden aria-hidden="true"></div>':''}<div class="pexeso-slot ${d.matched.includes(i)?'matched':''}" ${mismatch&&closing?'data-motion-close="true"':''} data-motion-effect="flip" data-motion-trigger="flip" data-motion-key="index" data-motion-value="${i}"><span class="pexeso-face" data-motion-face>${characterCard(card,a?H.actionAttr(a):'disabled')}</span>${mismatch&&closing?`<span class="pexeso-close-back" data-motion-back>${C.card({hidden:true},'disabled')}</span>`:''}</div>`;}).join('')}</div>`,actions:''}};};
 V.register('pexeso',render,()=>C.cover(`${`<g transform="translate(65 10) rotate(-12 45 63)"><svg width="90" height="126" viewBox="0 0 100 140">${cartoon.face('circle-red',id=>characterSources(id).minimal,{style:'minimal'})}</svg></g><g transform="translate(143 22) rotate(13 45 63)"><svg width="90" height="126" viewBox="0 0 100 140">${cartoon.face('crescent-yellow',id=>characterSources(id).minimal,{style:'minimal'})}</svg></g>`}`),{surfaces:{table:render,player:render}});
})();
