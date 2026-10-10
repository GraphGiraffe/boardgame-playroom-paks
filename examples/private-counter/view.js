(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers;
  if(H.viewApi!==2)throw Error('Нужно приложение с API интерфейса 2');
 function render(s,viewer,actions,ui={}){
   const surface=ui.surface||'combined',goal=s.data.goals[viewer];
   return {api:2,family:'board',className:'private-counter',playerContent:H.playerContent(s,viewer,null,{badges:i=>i===viewer?[`Цель: ${goal&&!goal.hidden?goal.value:'—'}`]:[]}),elements:{field:`<strong class="private-counter-value">${H.esc(s.data.count)}</strong>`,status:`<p>${s.status==='finished'?'Партия завершена':'Ходит '+H.esc(s.players[s.turn].name)}</p>`,auxiliary:'',actions:surface==='table'?'':H.actionBar(actions,'Ждём ход')}};
 }
 V.register('private-counter',render,null,{surfaces:{table:(s,v,a,ui)=>render(s,v,[],{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();
