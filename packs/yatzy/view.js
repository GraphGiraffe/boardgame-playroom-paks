(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
 const source=typeof require==='function'&&!globalThis.PlayroomPack;
 const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
 const locale=source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales;
 const translator=H.translator(locale);
 const text=key=>translator.format({key:'yatzy.'+key});
 function render(s,viewer,actions,ui={}){
  const d=s.data,roll=actions.find(a=>a.type==='roll'),requested=Number(ui.viewState?.scorePlayer);
  const selected=Number.isInteger(requested)&&requested>=0&&requested<s.players.length?requested:s.turn;
  const projection={...s.modelProjection,actions:s.modelProjection.actions.filter(command=>actions.some(action=>
    Object.keys(command).every(key=>command[key]===action[key])))};
  const table=P.scene(projection),actionLabel=command=>translator.format(P.action(command,projection));
  const cells=(values,kind)=>values.map((value,player)=>`<td class="${player===selected?'selected-player':''}" data-score-player="${player}"${kind?` data-score-total="${kind}"`:''}>${value}</td>`).join('');
  const rows=table.rows.map((row,index)=>{
    const values=row.cells.map(cell=>cell.value!==null?cell.value:cell.command?
      `<button ${H.actionAttr(cell.command)} aria-label="${H.esc(actionLabel(cell.command))}">${H.esc(cell.preview)}</button>`:'—');
    const summary=index===5?`<tr class="yatzy-summary"><th scope="row">${text('table.upper')}</th>${cells(d.upper,'upper')}</tr><tr class="yatzy-summary"><th scope="row">${text('table.bonus')}</th>${cells(d.bonuses,'bonus')}</tr>`:'';
    return `<tr><th scope="row">${H.esc(translator.format(row.label))}</th>${cells(values)}</tr>${summary}`;
  }).join('');
  const dice=d.dice.map((value,index)=>{
    const hold=actions.find(a=>a.type==='hold'&&a.index===index);
    return C.die(d.rolls?value:null,`${!d.held[index]?'data-motion-lead="roll"':''} ${hold?H.actionAttr(hold):'disabled'} aria-pressed="${d.held[index]}" title="${H.esc(text(d.held[index]?'dice.release':'dice.hold'))}"`,d.held[index]?'held':'');
  }).join('');
  return {api:2,family:'board',fieldSizing:'scroll',actionReserve:true,className:'yatzy-scene',
    playerContent:H.playerContent(s,viewer,null,{counters:(player,person)=>[
      {id:'points',kind:'points',value:d.totals[player],label:text('meta.points')},{id:'wins',kind:'wins',value:person.score}
    ]}),elements:{
      field:`<div class="yatzy-board" data-scene-scroll><table class="yatzy-score" style="--players:${s.players.length}"><thead><tr><th scope="col">${text('table.category')}</th>${s.players.map((person,index)=>`<th scope="col" class="${index===selected?'selected-player':''}" data-score-player="${index}">${H.avatar(person,index)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">${text('table.total')}</th>${cells(d.totals,'total')}</tr></tfoot></table></div>`,
      actions:`<div class="yatzy-controls"><div class="yatzy-dice">${dice}</div><span class="yatzy-dice-help">${d.rolls>0&&d.rolls<3?text('dice.help'):''}</span><button class="scene-button yatzy-roll" ${roll?H.actionAttr(roll):'disabled'}>${text(d.rolls?'dice.reroll':'dice.roll')} · ${d.rolls}/3</button></div>`
    }};
 }
 V.register('yatzy',render,()=>C.cover(`<g transform="translate(50 48) rotate(-13 50 50)"><rect x="2" y="6" width="92" height="92" rx="18" fill="#b7b29d"/><rect width="92" height="92" rx="18" fill="#fff9e8"/>${[[24,24],[68,24],[46,46],[24,68],[68,68]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#517660"/>`).join('')}</g><g transform="translate(161 25) rotate(14 46 46)"><rect x="2" y="6" width="92" height="92" rx="18" fill="#b7b29d"/><rect width="92" height="92" rx="18" fill="#fff9e8"/>${[[24,24],[68,24],[24,46],[68,46],[24,68],[68,68]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#c2735e"/>`).join('')}</g>`),{surfaces:{table:(s,v,a,ui)=>{const scene=render(s,v,a,ui);const controls=scene.elements.actions;scene.elements.actions='';scene.elements.status=a.length?controls:`<div class="yatzy-dice">${s.data.dice.map((n,i)=>C.die(s.data.rolls?n:null,`${!s.data.held[i]?'data-motion-lead="roll"':''} disabled`,s.data.held[i]?'held':'')).join('')}</div>`;return scene;},player:render}});
})();
