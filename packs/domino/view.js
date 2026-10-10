(function(){
  'use strict';const V=globalThis.PlayroomViews,H=V.helpers;
  if(H.viewApi!==2)throw Error('Нужно приложение с API интерфейса 2');
  const dots={0:[],1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8],7:[0,2,3,4,5,6,8],8:[0,1,2,3,5,6,7,8],9:[0,1,2,3,4,5,6,7,8]};
  const half=n=>`<span class="domino-half" aria-hidden="true">${Array.from({length:9},(_,i)=>`<i class="${(dots[n]||dots[9]).includes(i)?'pip':''}"></i>`).join('')}</span>`;
  function tile(c,attr='disabled',cls=''){if(c.hidden)return H.back('domino');return `<button class="domino-tile ${cls}" ${attr} data-entity="tile-${H.esc(c.id)}" data-tooltip="${H.esc(`Кость ${c.a}–${c.b}. Совместите одинаковые значения на концах цепочки. Выберите кость, затем место на поле, или перенесите её удержанием.`)}" aria-label="Кость ${c.a}–${c.b}">${half(c.a)}<span class="domino-divider"></span>${half(c.b)}</button>`;}
  function placement(action, card, chain) {
    if(!action||!card)return '<div data-hit-target class="domino-drop-placeholder" aria-hidden="true"><span>+</span></div>';
    let a=card.a,b=card.b;
    const join=chain.length?(action.side==='left'?chain[0].a:chain[chain.length-1].b):null;
    if(join!==null&&(action.side==='left'?b:a)!==join)[a,b]=[b,a];
    const description=chain.length?`Поставить ${a}–${b} ${action.side==='left'?'слева':'справа'} к ${join}`:`Поставить первую кость ${a}–${b}`;
    return `<button class="domino-drop-target ${action.side}" ${H.target(card.id,action)} data-preview-a="${a}" data-preview-b="${b}" data-tooltip="${H.esc(description+'. Кость будет выложена в показанной ориентации.')}" aria-label="${H.esc(description)}"><span class="domino-tile domino-preview ${a===b?'double':''}" aria-hidden="true">${half(a)}<span class="domino-divider"></span>${half(b)}</span><span class="domino-drop-caption">${chain.length?'Положить сюда':'Начать цепочку'}</span></button>`;
  }
  V.register('domino',(s,viewer,actions,ui)=>{
    const d=s.data,hand=d.hands[viewer]||[],selected=actions.filter(a=>a.card===ui.selected),card=hand.find(c=>c.id===ui.selected),others=actions.filter(a=>!a.card),left=d.chain[0]?.a,right=d.chain[d.chain.length-1]?.b;
    const endpoint=(side,value)=>`<div class="domino-end-slot ${side}"><span class="domino-end-label">Край <b>${value}</b></span>${placement(selected.find(a=>a.side===side),card,d.chain)}</div>`;
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
      board=`<div class="domino-play-row"><div class="domino-chain ${normal.rows>3?'domino-chain-long':''}" style="--domino-rows:${normal.rows};--domino-wide-rows:${wide.rows}" role="group" aria-label="Цепочка домино: от края ${left} до края ${right}. Строки соединены змейкой.">${[normal,wide].map((flow,i)=>`<svg class="domino-connections ${i?'domino-connections-wide':'domino-connections-normal'}" viewBox="0 0 500 ${flow.rows*100}" preserveAspectRatio="none" aria-hidden="true"><path d="${flow.path}"/></svg>`).join('')}${cells.map((cell,i)=>{const p=normal.positions[i],w=wide.positions[i];return `<div class="domino-node ${p.row%2?'reverse':''}" data-chain-index="${i-1}" data-flow-row="${p.row}" data-flow-column="${p.column}" style="--node-row:${p.row+1};--node-column:${p.column+1};--node-wide-row:${w.row+1};--node-wide-column:${w.column+1};--node-wide-direction:${w.row%2?'row-reverse':'row'}">${cell}</div>`;}).join('')}</div></div>`;
    }else board=`<div class="domino-opening">${placement(selected[0],card,d.chain)}<p>${selected.length?'Коснитесь места на поле или перенесите сюда кость':'Выберите первую костяшку в руке'}</p></div>`;
    return {api:2,family:'cards',className:'domino-scene',elements:{participants:H.opponents(s,viewer,c=>tile(c),{cardLabel:c=>c.a+'·'+c.b}),status:`<div class="scene-meta"><span class="table-chip">Базар · ${d.stock.length}</span><span class="table-chip">На столе · ${d.chain.length}</span></div>`,field:`<div class="domino-board" data-motion-table>${board}</div>`,actions:H.actionBar(others,selected.length?'Выберите подсвеченное место на поле':actions.some(a=>a.card)?'Выберите костяшку — появятся места для хода':'Ждём следующий ход'),hand:H.hand(hand.map(c=>{const source=H.source(c.id,actions,ui.selected,{mode:'select',drag:true});return tile(c,source.attr,source.className);}).join(''),hand.length,'Коснитесь или перенесите на поле','',{layout:'tiles'})}};
  },()=>H.svg(`<ellipse cx="151" cy="148" rx="96" ry="13" fill="#c6c5b4"/><g transform="translate(61 40) rotate(-19 39 53)"><rect y="5" width="71" height="110" rx="12" fill="#b8baaa"/><rect width="71" height="110" rx="12" fill="#fffbed"/><path d="M9 55h53" stroke="#e2decd" stroke-width="2"/>${[[21,21],[50,35],[21,73],[50,91],[21,91],[50,73]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#3f6654"/>`).join('')}</g><g transform="translate(136 19) rotate(17 38 56)"><rect y="5" width="75" height="117" rx="12" fill="#b8baaa"/><rect width="75" height="117" rx="12" fill="#fffbed"/><path d="M10 58h55" stroke="#e2decd" stroke-width="2"/>${[[21,20],[53,20],[37,32],[21,44],[53,44],[21,76],[53,76],[21,100],[53,100],[21,88],[53,88]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="#3f6654"/>`).join('')}</g>`));
})();
