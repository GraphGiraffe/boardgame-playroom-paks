(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared;
 const source=typeof require==='function'&&!globalThis.PlayroomPack;
 const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
 const locale=source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales;
 const translator=H.translator(locale);
 const text=key=>translator.format({key:'yatzy.'+key});
 function render(s,viewer,actions,ui={},publicDice=false){
  const region=(id,deps,build)=>ui.region?ui.region(id,deps,build):build();
  const table=s.scene,roll=actions.find(a=>a.type==='roll'),requested=Number(ui.viewState?.scorePlayer);
  const selected=Number.isInteger(requested)&&requested>=0&&requested<s.players.length?requested:s.turn;
  const commandFor=cell=>cell.command&&actions.find(action=>Object.keys(cell.command).every(key=>cell.command[key]===action[key]));
  const cells=(values,kind)=>values.map((value,player)=>`<td class="${player===selected?'selected-player':''}" data-score-player="${player}"${kind?` data-score-total="${kind}"`:''}>${value}</td>`).join('');
  const rows=table.rows.map((row,index)=>{
    const commands=row.cells.map(commandFor),label=H.esc(translator.format(row.label));
    const content=region('score-'+row.id,[row,commands,selected,label],()=>{
      const values=row.cells.map((cell,i)=>cell.value!==null?cell.value:commands[i]?
        `<button ${H.actionAttr(commands[i])} aria-label="${H.esc(translator.format(cell.label))}">${H.esc(cell.preview)}</button>`:'—');
      return `<tr><th scope="row">${label}</th>${cells(values)}</tr>`;
    });
    const summary=index===5?region('upper',[table.upper,selected,text('table.upper')],()=>`<tr class="yatzy-summary"><th scope="row">${text('table.upper')}</th>${cells(table.upper,'upper')}</tr>`)+region('bonus',[table.bonuses,selected,text('table.bonus')],()=>`<tr class="yatzy-summary"><th scope="row">${text('table.bonus')}</th>${cells(table.bonuses,'bonus')}</tr>`):'';
    return content+summary;
  }).join('');
  const tableHead=region('score-head',[s.players,selected,text('table.category')],()=>`<tr><th scope="col">${text('table.category')}</th>${s.players.map((person,index)=>`<th scope="col" class="${index===selected?'selected-player':''}" data-score-player="${index}">${H.avatar(person,index)}</th>`).join('')}</tr>`),tableFoot=region('score-total',[table.totals,selected,text('table.total')],()=>`<tr><th scope="row">${text('table.total')}</th>${cells(table.totals,'total')}</tr>`);
  const dice=table.dice.map(({value,held},index)=>{
    const hold=actions.find(a=>a.type==='hold'&&a.index===index);
    const faceValue=publicDice&&!table.rolls?null:value;
    const attr=publicDice?`${!held?'data-motion-lead="roll"':''} disabled`:`${!held?'data-motion-lead="roll"':''} ${hold?H.actionAttr(hold):'disabled'} aria-pressed="${held}" title="${H.esc(text(held?'dice.release':'dice.hold'))}"`;
    return region('die-'+index,[faceValue,held,attr],()=>C.die(faceValue,attr,held?'held':''));
  }).join('');
  return {api:3,family:'board',fieldSizing:'scroll',actionReserve:true,className:'yatzy-scene',
    playerContent:H.playerContent(s,viewer,null,{}),elements:{
      field:`<div class="yatzy-board" data-scene-scroll>${C.scoreTable({className:'yatzy-score',attributes:`style="--players:${s.players.length}"`,head:tableHead,body:rows,foot:tableFoot})}</div>`,
      actions:publicDice?`<div class="yatzy-public-controls"><div class="yatzy-dice">${dice}</div></div>`:`<div class="yatzy-controls"><div class="yatzy-dice">${dice}</div><button class="scene-button yatzy-roll" ${roll?H.actionAttr(roll):'disabled'}>${text(table.rolls?'dice.reroll':'dice.roll')} · ${table.rolls}/3</button></div>`
    }};
 }
 V.register('yatzy',render,()=>C.cover(`<g transform="translate(40 20) rotate(115 40 38)">
<path d="M3 10h74l-8 57Q40 81 11 67Z" fill="#aa5548"/>
<path d="M3 5h74l-8 56Q40 76 11 61Z" fill="#ce735d"/>
<path d="M15 20 20 57" fill="none" stroke="#e7987d" stroke-width="6" stroke-linecap="round"/>
<path d="M66 19 61 58" fill="none" stroke="#b85f4c" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="40" cy="6" rx="38" ry="11" fill="#e9a18a"/>
<ellipse cx="40" cy="5" rx="30" ry="6.8" fill="#733e35"/>
<path d="M18 6q22-8 44 0" fill="none" stroke="#552f29" stroke-width="2" stroke-linecap="round"/>
</g><path d="m124 79 9 8m-4-19 8 6m60 36 6 7" stroke="#bbaa80" stroke-width="2.8" stroke-linecap="round" fill="none"/><g transform="translate(141 80) rotate(22 24.0 24.0)"><g transform="scale(0.48)"><rect y="6" width="100" height="100" rx="18" fill="#b9b39a"/><rect width="100" height="100" rx="18" fill="#fff9e8"/><circle cx="27" cy="27" r="7.5" fill="#426b57"/><circle cx="73" cy="27" r="7.5" fill="#426b57"/><circle cx="50" cy="50" r="7.5" fill="#426b57"/><circle cx="27" cy="73" r="7.5" fill="#426b57"/><circle cx="73" cy="73" r="7.5" fill="#426b57"/></g></g><g transform="translate(211 111) rotate(-16 21.5 21.5)"><g transform="scale(0.43)"><rect y="6" width="100" height="100" rx="18" fill="#b9b39a"/><rect width="100" height="100" rx="18" fill="#fff9e8"/><circle cx="27" cy="25" r="7.5" fill="#c2735e"/><circle cx="73" cy="25" r="7.5" fill="#c2735e"/><circle cx="27" cy="50" r="7.5" fill="#c2735e"/><circle cx="73" cy="50" r="7.5" fill="#c2735e"/><circle cx="27" cy="75" r="7.5" fill="#c2735e"/><circle cx="73" cy="75" r="7.5" fill="#c2735e"/></g></g>`),{seating:'row',illustrations:(source?require('./presentation/rule-illustrations.js'):globalThis.PlayroomPackRuleIllustrations).create(),surfaces:{table:(s,v,a,ui)=>{const scene=render(s,v,a,ui,!a.length);scene.elements.status=scene.elements.actions;scene.elements.actions='';return scene;},player:render}});
})();

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("yatzy",tutorial(tr));
})(globalThis);
