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
 const characterCard=(card,attrs='disabled',assetSet='standard-deck')=>card.hidden?C.card({...card,assetSet},attrs):card.character?`<button class="shared-card pexeso-character-card" ${attrs} aria-label="${H.esc(text('characters.'+card.shape)+' · '+text('colors.'+card.color))}">${H.assetArt('character-face',{character:card.character,characterSources:characterSources(card.character)},params=>cartoon.face(params.character,()=>params.characterSources.minimal))}</button>`:C.card(card,attrs);


 const render=(s,viewer,actions,ui={})=>{const scene=s.scene,closing=scene.revealing&&ui.presentationTurn!=null&&ui.presentationTurn!==s.turn;return {api:3,family:'cards',skinFamilies:scene.assetSet==='cartoon-deck'?['character-face','card-back']:['card-face','card-back'],fieldSizing:'fit',actionReserve:false,className:'pexeso-scene',playerContent:H.playerContent(s,viewer,null,{}),elements:{field:`<div class="pexeso-grid"  data-card-count="${scene.cards.length}" style="--pexeso-wide-columns:${scene.cards.length<=16?4:6};--pexeso-wide-rows:${Math.ceil(scene.cards.length/(scene.cards.length<=16?4:6))};--pexeso-narrow-rows:${Math.ceil(scene.cards.length/4)}">${scene.cards.map(({card:c,index:i,matched,closing:mismatch})=>{const a=actions.find(x=>x.type==='flip'&&x.index===i),card=mismatch&&!closing?{hidden:true}:c;return `${scene.cards.length===24&&i===12?'<div class="pexeso-gap" data-grid-gap="center" hidden aria-hidden="true"></div>':''}<div class="pexeso-slot ${matched?'matched':''}" ${mismatch&&closing?'data-motion-close="true"':''} data-motion-effect="flip" data-motion-trigger="flip" data-motion-key="index" data-motion-value="${i}"><span class="pexeso-face" data-motion-face>${characterCard(card,a?H.actionAttr(a):'disabled',scene.assetSet)}</span>${mismatch&&closing?`<span class="pexeso-close-back" data-motion-back>${C.card({hidden:true,assetSet:scene.assetSet},'disabled')}</span>`:''}</div>`;}).join('')}</div>`,actions:''}};};
 V.register('pexeso',render,()=>C.cover(`${`<g transform="translate(65 10) rotate(-12 45 63)"><svg width="90" height="126" viewBox="0 0 100 140">${cartoon.face('circle-red',id=>characterSources(id).minimal,{style:'minimal'})}</svg></g><g transform="translate(143 22) rotate(13 45 63)"><svg width="90" height="126" viewBox="0 0 100 140">${cartoon.face('crescent-yellow',id=>characterSources(id).minimal,{style:'minimal'})}</svg></g>`}`),{surfaces:{table:render,player:render}});
})();

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("pexeso",tutorial(tr));
})(globalThis);
