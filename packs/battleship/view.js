(function(){
 'use strict';
 const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
 const source=typeof require==='function'&&!globalThis.PlayroomPack;
 const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
 const locales=source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales;
 const translator=H.translator(locales),text=(key,params={})=>translator.format({key:'battleship.'+key,params});
 const coordinate=P.coordinate;
 const shipVertical=ship=>ship.length>1&&ship[1]-ship[0]===10;
 function grid(s,viewer,actions,own,selected){
  const scene=s.scene,base=viewer>=0?viewer:0,p=own?base:1-base,ships=scene.fleets[p].ships||[],shots=scene.shots[1-p]||[],setup=scene.setup&&own&&viewer===s.turn&&actions.length>0;
  const size=selected?.startsWith('new:')?Number(selected.slice(4)):null,shipIndex=selected?.startsWith('ship:')?Number(selected.slice(5)):null;
  return `<div class="battle-grid" role="grid" data-drag-boundary data-grid-columns="10" aria-label="${H.esc(text('board.label',{player:s.players[p].name}))}">${Array.from({length:100},(_,cell)=>{
   const shot=shots.find(x=>x.cell===cell)||(scene.marks[1-p]?.includes(cell)?{hit:false,auto:true}:null);
   const index=ships.findIndex(x=>x.includes(cell)),ship=index>=0?ships[index]:null,vertical=shipVertical(ship||[]);
   const actor=s.tableActor??viewer;
   const fire=p!==actor?actions.find(a=>a.type==='fire'&&a.cell===cell):null;
   const drop=setup?actions.find(a=>a.start===cell&&((a.type==='place'&&a.size===size&&a.vertical===(size===1?false:scene.orientation[viewer]))||(a.type==='move'&&a.ship===shipIndex&&a.vertical===shipVertical(ships[shipIndex]||[])))):null;
   const segment=ship?`${vertical?'vertical':'horizontal'} ${ship[0]===cell?'ship-start':''} ${ship.at(-1)===cell?'ship-end':''}`:'';
   const label=shot||ship?text('board.cell',{cell:coordinate(cell),content:text(shot?(shot.hit?'board.hit':'board.miss'):'board.ship')}):coordinate(cell);
   const source=setup&&ship?`<button type="button" data-select="ship:${index}" data-drag-piece="ship:${index}" data-drag-shape="${ship.length}:${vertical?'v':'h'}" data-drag-segment="${ship.indexOf(cell)}" data-drag-outside-action="${H.esc(JSON.stringify(actions.find(a=>a.type==='remove'&&a.ship===index)))}" aria-label="${H.esc(text('board.ship-select',{size:ship.length}))}"></button>`:'';
   return `<div class="battle-cell ${ship?'ship ':''}${segment} ${shot?shot.hit?'hit':'miss':''}" role="gridcell" aria-label="${label}" data-grid-index="${cell}" data-drag-unit data-motion-effect="pulse" data-motion-trigger="fire" data-motion-key="cell" data-motion-value="${cell}" ${drop&&ship?`data-drop-piece="${H.esc(selected)}" ${H.actionAttr(drop)}`:''}>${source}${fire?`<button ${H.actionAttr(fire)} aria-label="${H.esc(fire.label)}"></button>`:''}${drop&&!ship?`<button data-drop-piece="${H.esc(selected)}" ${H.actionAttr(drop)} aria-label="${H.esc(drop.label)}"></button>`:''}${shot?`<span aria-hidden="true">${shot.hit?'✹':'×'}</span>`:''}</div>`;
  }).join('')}${shipIndex!==null&&ships[shipIndex]?`<span class="battle-ship-selection" aria-hidden="true" style="--ship-x:${ships[shipIndex][0]%10};--ship-y:${Math.floor(ships[shipIndex][0]/10)};--ship-w:${shipVertical(ships[shipIndex])?1:ships[shipIndex].length};--ship-h:${shipVertical(ships[shipIndex])?ships[shipIndex].length:1}"></span>`:''}</div>`;
 }
 function render(s,viewer,actions,ui={}){
  const scene=s.scene;
  actions=actions.map(action=>({...action,label:action.label||translator.format(P.action(action,{data:{orientation:scene.orientation,ships:scene.fleets.map(fleet=>fleet.ships)},viewer}))}));
  const setup=scene.setup,active=setup&&viewer===s.turn&&actions.some(a=>a.type==='auto'),auto=actions.find(a=>a.type==='auto'),orient=actions.find(a=>a.type==='orient'),ready=actions.find(a=>a.type==='ready');
  const counts=scene.fleets[viewer]?.indicators||[],available=counts.find(x=>x.value>0)?.size;
  const selected=active?(ui.selected?.startsWith('ship:')&&scene.fleets[viewer]?.ships?.[Number(ui.selected.slice(5))]||ui.selected?.startsWith('new:')&&counts.some(x=>x.size===Number(ui.selected.slice(4))&&x.value>0)?ui.selected:available?`new:${available}`:null):null;
  const shipIndex=selected?.startsWith('ship:')?Number(selected.slice(5)):null,chosen=scene.fleets[viewer]?.ships?.[shipIndex],rotation=chosen&&actions.find(a=>a.type==='move'&&a.ship===shipIndex&&a.start===chosen[0]&&a.vertical!==shipVertical(chosen)),remove=chosen&&actions.find(a=>a.type==='remove'&&a.ship===shipIndex);
  const followedTurn=ui.presentationTurn??s.turn;
  const own=setup||(ui.viewState?.fleet?ui.viewState.fleet==='own':ui.preferences?.followOpponent!=='off'&&(viewer<0?followedTurn===1:followedTurn!==viewer));
  const indicators=p=>scene.fleets[p].indicators.map(item=>({...item,
   ...(active&&p===viewer&&item.value>0?{dragPiece:'new:'+item.size}:{}),
   vertical:!!(active&&scene.orientation[viewer]),selected:p===viewer&&selected==='new:'+item.size,label:translator.format(item.label)}));
  const fleet=p=>H.indicators(indicators(p));
  return {api:3,family:'board',fieldAspect:10/11,actionReserve:true,className:'battleship-scene',playerContent:H.playerContent(s,viewer,null,{scoreLabel:text('meta.wins'),indicators}),elements:{
   field:`<div data-slide-key="${own?0:1}"  style="--page-index:${own?0:1}" class="battle-fields shared-page-deck ${setup?'is-setup':''} ${own?'show-own':'show-enemy'}"><section style="--page-number:0" class="battle-panel shared-page-panel ${own?'is-active':''}" ${own?'':'inert aria-hidden="true"'} aria-label="${text(viewer<0?'view.first':'view.own')}">${fleet(viewer>=0?viewer:0)}${grid(s,viewer,own?actions:[],true,selected)}</section>${setup?'':`<section style="--page-number:1" class="battle-panel shared-page-panel ${!own?'is-active':''}" ${!own?'':'inert aria-hidden="true"'} aria-label="${text(viewer<0?'view.second':'view.enemy')}">${fleet(viewer>=0?1-viewer:1)}${grid(s,viewer,!own?actions:[],false,null)}</section>`}</div>`,
   actions:setup?`<div class="shared-action-row">${chosen?`<button ${rotation?H.actionAttr(rotation):'disabled'} aria-label="${text('setup.rotate')}">↻</button><button ${remove?H.actionAttr(remove):'disabled'} aria-label="${text('setup.remove')}">${H.icon('trash')}</button>`:orient?`<button ${H.actionAttr(orient)} aria-label="${H.esc(orient.label)}" title="${H.esc(orient.label)}">${scene.orientation[viewer]?'↕':'↔'}</button>`:''}<button ${auto?H.actionAttr(auto):'disabled'}>${text(auto?'setup.auto':'setup.opponent')}</button>${ready?`<button ${H.actionAttr(ready)}>${text('setup.ready')}</button>`:''}</div>`:`<div class="shared-board-tabs">${H.components.actionSelector({key:'fleet',label:text('view.own')+' / '+text('view.enemy'),value:own?'own':'enemy',choices:[{value:'own',label:viewer<0?s.players[0].name:text('view.own')},{value:'enemy',label:viewer<0?s.players[1].name:text('view.enemy')}]})}<button data-view-preference="followOpponent" data-view-value="${ui.viewState?.fleet||ui.preferences?.followOpponent==='off'?'on':'off'}" aria-label="${text('view.follow')}" title="${text('view.follow')}" aria-pressed="${!ui.viewState?.fleet&&ui.preferences?.followOpponent!=='off'}">${H.icon('eye')}</button></div>`
  }};
 }
 V.register('battleship',render,()=>C.cover(`<g transform="translate(44 25) rotate(-5 106 64)"><rect x="2" y="5" width="212" height="125" rx="14" fill="#739aa0"/><rect width="212" height="125" rx="14" fill="#b5d3d0"/><path d="M24 0v125M49 0v125M74 0v125M99 0v125M124 0v125M149 0v125M174 0v125M199 0v125M0 25h212M0 50h212M0 75h212M0 100h212" stroke="#89b1b3"/><path d="M28 81h155l-20 27H50Z" fill="#426977" stroke="#31505a" stroke-width="3"/><path d="M64 80V55h67v25m-51-25V39h35v16" fill="#fff6db" stroke="#526f72" stroke-width="4"/><path d="m162 20 14 14m0-14-14 14" stroke="#bd6c55" stroke-width="4" stroke-linecap="round"/></g>`),{surfaces:{table:(s,v,a,ui)=>{const scene=render(s,v,a,ui);if(!s.scene.setup){scene.elements.status=scene.elements.actions;scene.elements.actions='';}return scene;},player:render}});
})();
