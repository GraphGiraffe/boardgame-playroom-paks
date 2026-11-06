(function(){
  'use strict';const coverComponents=globalThis.PlayroomShared;const V=globalThis.PlayroomViews,H=V.helpers;
  if(H.viewApi!==3)throw Error('Нужно приложение с API интерфейса 2');
  const source=typeof require==='function'&&!globalThis.PlayroomPack;
  const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
  const text=(key,params={})=>translator.format({key:'checkers.'+key,params});
  const checkerArt=globalThis.PlayroomShared.checkerArt;
  const render=(s,viewer,actions,ui)=>{
    const scene=s.scene,pieces=new Map(scene.pieces.map(piece=>[piece.cell,piece])),selected=scene.forced??(ui.selected!==null&&ui.selected!==undefined?Number(ui.selected):null),flipped=viewer>=0&&viewer!==scene.lightPlayer,order=globalThis.PlayroomShared.boardCells(8,8,flipped).map(cell=>cell.index),destinations=actions.filter(a=>a.from===selected),movable=new Set(actions.map(a=>a.from));
    return {api:3,family:'board',className:'checkers-scene',fieldAspect:1,playerContent:H.playerContent(s,viewer,null,{scoreLabel:text('meta.wins')}),elements:{status:'',field:`<div class="checker-board-wrap"><div class="checker-board" role="group" aria-label="${text('view.board')}">${order.map(index=>{const row=Math.floor(index/8),col=index%8,piece=pieces.get(index),action=destinations.find(a=>a.to===index),dark=(row+col)%2===1,coord=String.fromCharCode(97+col)+(8-row),cellSource=H.source(index,actions,selected,{key:'from',mode:'select',inspect:selected===index,className:''}),attr=action?H.target(selected,action):cellSource.attr+(movable.has(index)||selected===index?` data-cell="${index}"`:'');
      const pieceSource=piece?H.source(index,actions,selected,{key:'from',mode:'select',drag:true,className:`checker-piece owner-${piece.owner===scene.lightPlayer?0:1} ${piece.king?'king':''} ${movable.has(index)?'movable':''} ${piece.captured?'captured':''}`}):null;
      const help=action?(action.capture?text('view.capture-help',{cell:coord}):text('view.move-help',{cell:coord})):piece?(piece.captured?text('view.captured-help'):(movable.has(index)?(scene.forced===index?text('view.continue-help'):text('view.select-help')):'')+(actions.some(a=>a.capture)?text('view.mandatory-help'):'')+(piece.king?text('view.king-help'):text('view.man-help'))):'';
      const label=coord+(piece?', '+text(piece.king?'view.king':'view.man')+' '+H.esc(s.players[piece.owner].name)+(piece.captured?text('view.captured'):''):action?text('view.available'):'');
      const kingMove=!!(action&&pieces.get(selected)?.king&&Math.abs(Math.floor(action.to/8)-Math.floor(action.from/8))>1);
      const build=()=>`<button data-grid-cell data-interaction-shape="cell" class="checker-cell ${dark?'dark':'light'} ${selected===index?'selected':''} ${action?'destination is-playable':''}" ${attr} ${kingMove?'data-guide-king-move':''} ${action?.capture?'data-guide-capture':''} ${help?`data-tooltip="${H.esc(help)}"`:''} aria-label="${label}">${piece?`<span data-size-role="checker" data-interaction-shape="circle" class="${pieceSource.className}" data-entity="${H.esc(H.components.entityKey({namespace:'checker',id:piece.id}))}" data-piece-owner="${piece.owner}" ${pieceSource.attr} data-board-cell="${index}">${checkerArt(piece.king,false)}</span>`:''}${(flipped?row===0:row===7)?`<small class="coord-file">${String.fromCharCode(97+col)}</small>`:''}${(flipped?col===7:col===0)?`<small class="coord-rank">${8-row}</small>`:''}</button>`;
      return ui.region?ui.region('cell-'+index,[attr,piece,pieceSource?.attr,pieceSource?.className,selected===index,flipped,help,label,kingMove,!!action,!!action?.capture],build):build();}).join('')}</div></div>`,auxiliary:''}};
  };
  V.register('checkers',render,()=>coverComponents.cover(`<g transform="translate(62 13) rotate(-9 89 78)"><rect x="0" y="8" width="178" height="149" rx="14" fill="#b5bdac"/><rect width="178" height="149" rx="14" fill="#f9f5e5"/>${Array.from({length:36},(_,i)=>`<rect x="${10+(i%6)*26.3}" y="${9+Math.floor(i/6)*21.8}" width="26.6" height="22" fill="${(i%6+Math.floor(i/6))%2?'#84a187':'#e6e5ca'}"/>`).join('')}${[[50,43,'#3e6350'],[104,89,'#3e6350'],[129,109,'#eab76a'],[78,66,'#eab76a'],[24,110,'#eab76a']].map(([x,y,c])=>`<ellipse cx="${x}" cy="${y+4}" rx="15" ry="11" fill="#385f4633"/><ellipse cx="${x}" cy="${y}" rx="15" ry="11" fill="${c}"/><ellipse cx="${x}" cy="${y-1}" rx="10" ry="7" fill="none" stroke="#fff9dc55" stroke-width="2"/>`).join('')}</g>`),{illustrations:(source?require('./presentation/rule-illustrations.js'):globalThis.PlayroomPackRuleIllustrations).create(),surfaces:{table:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("checkers",tutorial(tr));
})(globalThis);
