(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
 function grid(s,viewer,actions,own){
  const d=s.data,base=viewer>=0?viewer:0,p=own?base:1-base,ships=d.ships[p]||[],shots=d.shots[1-p]||[],setup=d.phase==='setup'&&own;
  return `<div class="battle-grid" role="grid" aria-label="${H.esc(s.players[p].name)}: поле">${Array.from({length:100},(_,cell)=>{
   const shot=shots.find(x=>x.cell===cell),ship=ships.find(x=>x.includes(cell)),fire=!own?actions.find(a=>a.type==='fire'&&a.cell===cell):null,place=setup?actions.find(a=>a.type==='place'&&a.start===cell):null,a=fire||place;
   const vertical=ship?.length>1&&ship[1]-ship[0]===10,segment=ship?`${vertical?'vertical':'horizontal'} ${ship[0]===cell?'ship-start':''} ${ship.at(-1)===cell?'ship-end':''}`:'';
   const coordinate=String.fromCharCode(65+cell%10)+(Math.floor(cell/10)+1),label=coordinate+(shot?shot.hit?' · попадание':' · промах':ship?' · корабль':'');
   return `<div class="battle-cell ${ship?'ship ':''}${segment} ${shot?shot.hit?'hit':'miss':''}" role="gridcell" aria-label="${label}" data-motion-effect="pulse" data-motion-trigger="fire" data-motion-key="cell" data-motion-value="${cell}">${a?`<button ${H.actionAttr(a)} aria-label="${H.esc(a.label)}"></button>`:''}${shot?`<span aria-hidden="true">${shot.hit?'✹':'×'}</span>`:''}</div>`;
  }).join('')}</div>`;
 }
 const render=(s,viewer,actions,ui={})=>{const d=s.data,setup=d.phase==='setup',auto=actions.find(a=>a.type==='auto'),orient=actions.find(a=>a.type==='orient'),own=setup||ui.viewState?.fleet==='own';
  return {api:2,family:'board',fieldAspect:1,actionReserve:true,className:'battleship-scene',playerContent:H.playerContent(s,viewer,null,{scoreLabel:'победы'}),elements:{
   field:`<div class="battle-fields ${setup?'is-setup':''}"><section class="battle-panel ${own?'is-active':''}" aria-label="Мой флот">${grid(s,viewer,actions,true)}</section>${setup?'':`<section class="battle-panel ${!own?'is-active':''}" aria-label="Соперник">${grid(s,viewer,actions,false)}</section>`}</div>`,
   actions:setup?`<div class="shared-action-row">${orient?`<button ${H.actionAttr(orient)} aria-label="${H.esc(orient.label)}" title="${H.esc(orient.label)}">${d.orientation[viewer]?'↕':'↔'}</button>`:''}<button ${auto?H.actionAttr(auto):'disabled'}>${auto?'Расставить флот':'Расстановка соперника'}</button></div>`:`<div class="shared-board-tabs"><button data-view-key="fleet" data-view-value="enemy" aria-pressed="${!own}">Соперник</button><button data-view-key="fleet" data-view-value="own" aria-pressed="${own}">Мой флот</button></div>`
  }};
 };
 V.register('battleship',render,()=>C.cover(`<g transform="translate(44 25) rotate(-5 106 64)"><rect x="2" y="5" width="212" height="125" rx="14" fill="#739aa0"/><rect width="212" height="125" rx="14" fill="#b5d3d0"/><path d="M24 0v125M49 0v125M74 0v125M99 0v125M124 0v125M149 0v125M174 0v125M199 0v125M0 25h212M0 50h212M0 75h212M0 100h212" stroke="#89b1b3"/><path d="M28 81h155l-20 27H50Z" fill="#426977" stroke="#31505a" stroke-width="3"/><path d="M64 80V55h67v25m-51-25V39h35v16" fill="#fff6db" stroke="#526f72" stroke-width="4"/><path d="m162 20 14 14m0-14-14 14" stroke="#bd6c55" stroke-width="4" stroke-linecap="round"/></g>`),{surfaces:{table:(s,v,a,ui)=>{const scene=render(s,v,[],ui);if(s.data.phase!=='setup')scene.elements.status=scene.elements.actions.replace('>Соперник</button>',`>${H.esc(s.players[1].name)}</button>`).replace('>Мой флот</button>',`>${H.esc(s.players[0].name)}</button>`);return scene;},player:render}});
})();
