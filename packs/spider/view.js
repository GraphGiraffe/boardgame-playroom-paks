(function(root){'use strict';const H=root.PlayroomViews.helpers,source=typeof require==='function'&&!root.PlayroomPack,P=source?require('./presentation/scene.js'):root.PlayroomPackPresentation,tr=H.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales),text=(key,params={})=>tr.format({key:'spider.'+key,params}),coverAsset=root.PlayroomPack?.asset('assets/covers/spider-v2.svg'),render=(state,viewer,actions,ui={})=>root.PlayroomSolitaireBoard.render({spider:true,state,viewer,actions,ui,text});root.PlayroomViews.register('spider',render,()=>root.PlayroomShared.cover(`<image x="12" y="3" width="270" height="164" href="${H.esc(coverAsset||'')}"/>`),{surfaces:{table:render,player:render}});})(globalThis);

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("spider",tutorial(tr));
})(globalThis);
