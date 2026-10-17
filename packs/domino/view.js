(function(){
  'use strict';const coverComponents=globalThis.PlayroomShared;const V=globalThis.PlayroomViews,H=V.helpers;
  if(H.viewApi!==2)throw Error('Нужно приложение с API интерфейса 2');
  const source=typeof require==='function'&&!globalThis.PlayroomPack;
  const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
  const text=(key,params={})=>translator.format({key:'domino.'+key,params});
  const face=globalThis.PlayroomShared.dominoFace;
  const tileBack=()=>`<span class="piece-back domino-back" data-piece-ratio="${4/7}" role="img" aria-label="${H.esc(text('view.hand'))}"><span class="domino-back-surface"></span></span>`;
  function tile(c,attr='disabled',cls=''){
    if(c.hidden)return tileBack();
    const upright=cls.includes('hand-card')||cls.includes('compact-piece')||cls.includes('double');
    return `<button class="domino-tile art-card ${cls}" data-piece-ratio="${4/7}" ${attr} data-entity="tile-${H.esc(c.id)}" data-tooltip="${H.esc(text('view.tile-help',{a:c.a,b:c.b}))}" aria-label="${H.esc(text('view.tile',{a:c.a,b:c.b}))}">${face(c.a,c.b,upright?0:270)}</button>`;
  }
  function placement(action, card, chain) {
    if(!action||!card)return '<div data-hit-target class="domino-drop-placeholder" aria-hidden="true"><span>+</span></div>';
    let a=card.a,b=card.b;
    const join=chain.length?(action.side==='left'?chain[0].a:chain[chain.length-1].b):null;
    if(join!==null&&(action.side==='left'?b:a)!==join)[a,b]=[b,a];
    const description=chain.length?text('view.place-side',{a,b,side:text('side.'+action.side),join}):text('view.place-first',{a,b});
    return `<button class="domino-drop-target ${action.side}" ${H.target(card.id,action)} data-preview-a="${a}" data-preview-b="${b}" data-tooltip="${H.esc(description+text('view.orientation'))}" aria-label="${H.esc(description)}"><span class="domino-tile domino-preview ${a===b?'double':''}" aria-hidden="true">${face(a,b,a===b?0:270)}</span><span class="domino-drop-caption">${text(chain.length?'view.place':'view.start')}</span></button>`;
  }
  const render=(s,viewer,actions,ui)=>{
    const d=s.data,hand=d.hands[viewer]||[],selected=actions.filter(a=>a.card===ui.selected),card=hand.find(c=>c.id===ui.selected),others=actions.filter(a=>!a.card),left=d.chain[0]?.a,right=d.chain[d.chain.length-1]?.b;
    const endpoint=(side,value)=>`<div class="domino-end-slot ${side}"><span class="domino-end-label">${text('view.edge')} <b>${value}</b></span>${placement(selected.find(a=>a.side===side),card,d.chain)}</div>`;
    let board;
    if(d.chain.length){
      // Sequence order stays canonical. Only the visual direction folds at each row end.
      const cells=[endpoint('left',left),...d.chain.map(c=>tile(c,'disabled',c.a===c.b?'double':'')),endpoint('right',right)];
      const layout=columns=>{
        const rows=Math.ceil(cells.length/columns),offset=cells.length<columns?Math.floor((columns-cells.length)/2):0;
        const positions=cells.map((_,i)=>{const row=Math.floor(i/columns),column=row%2?columns-1-i%columns:i%columns+offset;return {row,column,x:(column+.5)*500/columns,y:row*100+50};});
        const path=positions.reduce((line,p,i)=>{if(!i)return `M${p.x} ${p.y}`;const previous=positions[i-1];if(previous.row===p.row)return `${line} L${p.x} ${p.y}`;const bend=p.column===0?-15:515;return `${line} C${bend} ${previous.y} ${bend} ${p.y} ${p.x} ${p.y}`;},'');
        return {rows,positions,path};
      };
      const normal=layout(5),wide=layout(6);
      board=`<div class="domino-play-row"><div class="domino-chain ${normal.rows>3?'domino-chain-long':''}" style="--domino-rows:${normal.rows};--domino-wide-rows:${wide.rows}" role="group" aria-label="${H.esc(text('view.chain',{left,right}))}">${[normal,wide].map((flow,i)=>`<svg class="domino-connections ${i?'domino-connections-wide':'domino-connections-normal'}" viewBox="0 0 500 ${flow.rows*100}" preserveAspectRatio="none" aria-hidden="true"><path d="${flow.path}"/></svg>`).join('')}${cells.map((cell,i)=>{const p=normal.positions[i],w=wide.positions[i];return `<div class="domino-node ${p.row%2?'reverse':''}" data-chain-index="${i-1}" data-flow-row="${p.row}" data-flow-column="${p.column}" style="--node-row:${p.row+1};--node-column:${p.column+1};--node-wide-row:${w.row+1};--node-wide-column:${w.column+1};--node-wide-direction:${w.row%2?'row-reverse':'row'};--node-wide-rotation:${w.row%2?180:0}deg">${cell}</div>`;}).join('')}</div></div>`;
    }else board=`<div class="domino-opening">${placement(selected[0],card,d.chain)}</div>`;
    return {api:2,actionReserve:true,family:'cards',className:'domino-scene',playerContent:H.playerContent(s,viewer,(c,attrs,ctx)=>tile(c,attrs,ctx?.variant==='compact'?'compact-piece':''),{kind:'domino',backRender:tileBack}),elements:{participants:'',status:`<div class="scene-meta"><span class="table-chip">${text('view.stock')} · ${d.stock.length}</span><span class="table-chip">${text('view.table')} · ${d.chain.length}</span></div>`,field:`<div class="domino-board" data-motion-table>${board}</div>`,actions:H.actionBar(others),hand:H.hand(hand.map(c=>{const source=H.source(c.id,actions,ui.selected,{mode:'select',drag:true});return tile(c,source.attr,source.className);}).join(''),hand.length,text('view.hand'),'',{layout:'tiles'})}};
  };
  V.register('domino',render,()=>coverComponents.cover(`<g transform="translate(61 40) rotate(-19 39 53)"><rect y="5" width="71" height="110" rx="12" fill="#b8baaa"/><rect width="71" height="110" rx="12" fill="#fffbed"/><path d="M9 55h53" stroke="#e2decd" stroke-width="2"/>${[[21,21],[50,35],[21,73],[50,91],[21,91],[50,73]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#3f6654"/>`).join('')}</g><g transform="translate(136 19) rotate(17 38 56)"><rect y="5" width="75" height="117" rx="12" fill="#b8baaa"/><rect width="75" height="117" rx="12" fill="#fffbed"/><path d="M10 58h55" stroke="#e2decd" stroke-width="2"/>${[[21,20],[53,20],[37,32],[21,44],[53,44],[21,76],[53,76],[21,100],[53,100],[21,88],[53,88]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#3f6654"/>`).join('')}</g>`),{reveal:value=>tile(value.card,'disabled','hand-card'),surfaces:{table:(s,v,a,ui)=>render(s,v,[],{...ui,surface:'table'}),player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();
