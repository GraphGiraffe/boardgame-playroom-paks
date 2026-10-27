(function(root){'use strict';const H=root.PlayroomViews.helpers,source=typeof require==='function'&&!root.PlayroomPack,P=source?require('./presentation/scene.js'):root.PlayroomPackPresentation,tr=H.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales),text=(key,params={})=>tr.format({key:'klondike.'+key,params}),coverAsset=root.PlayroomPack?.asset('assets/covers/klondike-v2.svg'),render=(state,viewer,actions,ui={})=>root.PlayroomSolitaireBoard.render({spider:false,state,viewer,actions,ui,text});root.PlayroomViews.register('klondike',render,()=>root.PlayroomShared.cover(`<image x="12" y="3" width="262" height="154" href="${H.esc(coverAsset||'')}"/>`),{illustrations:(source?require('./presentation/rule-illustrations.js'):globalThis.PlayroomPackRuleIllustrations).create(),surfaces:{table:render,player:render}});})(globalThis);

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("klondike",tutorial(tr));
})(globalThis);
