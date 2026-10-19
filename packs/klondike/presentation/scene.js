(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackPresentation=api;})(globalThis,function(){
'use strict';const message=(key,params={})=>({key:'klondike.'+key,params});
const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.score'),presets:[{id:'classic',label:message('presets.classic')}],rules:[1,2,3].map(i=>message('rules.'+i))};
const action=command=>message('actions.'+command.type),event=value=>({message:message('events.'+value.type.split('.').at(-1)),kind:value.type.endsWith('.finished')?'finish':'action',...(value.type.endsWith('.finished')?{finish:true}:{})}),metric=id=>message(id==='moves'?'meta.moves':'meta.score');
return Object.freeze({metadata,action,event,metric,scene:projection=>({contractVersion:1,id:'klondike-board',family:'solitaire',players:[{player:0,metrics:[{id:'cleared',kind:'points',value:projection.data.foundations.reduce((n,c)=>n+c.length,0),label:metric('cleared'),resultUsage:true}]}]})});
});
