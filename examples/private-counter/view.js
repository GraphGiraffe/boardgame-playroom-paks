(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers;
 function render(s,viewer,actions,ui={}){
   const surface=ui.surface||'combined',goal=s.data.goals[viewer];
   return `<div class="game-scene private-counter"><h2>Общий счётчик</h2><strong class="private-counter-value">${H.esc(s.data.count)}</strong><p>${s.status==='finished'?'Партия завершена':'Ходит '+H.esc(s.players[s.turn].name)}</p>${surface==='table'?'':`<p>Ваша закрытая цель: ${goal&&!goal.hidden?H.esc(goal.value):'—'}</p>${H.actionBar(actions,'Ждём ход')}`}</div>`;
 }
 V.register('private-counter',render,null,{surfaces:{table:(s,v,a,ui)=>render(s,v,[],{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();
