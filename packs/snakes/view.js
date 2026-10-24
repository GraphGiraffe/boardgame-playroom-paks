(function(){
  'use strict';const coverComponents=globalThis.PlayroomShared;const V=globalThis.PlayroomViews,H=V.helpers;
  if(H.viewApi!==3)throw Error('Нужно приложение с API интерфейса 2');

  const source=typeof require==='function'&&!globalThis.PlayroomPack;
  const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
  const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
  const text=(key,params={})=>translator.format({key:'snakes.'+key,params});
  const position=P.position;
  function pairs(links){if(Array.isArray(links))return links.map(l=>Array.isArray(l)?l:[l.from??l.start,l.to??l.end]);return Object.entries(links||{}).map(([a,b])=>[Number(a),Number(b)]);}
  function linksSVG(links,size){
    const ordered=pairs(links).sort(([a,b],[c,d])=>Math.max(c,d)-Math.max(a,b));
    const art=ordered.map(([a,b])=>{
      const from=position(a,size),to=position(b,size);
      if(b>a){
        const dx=to.x-from.x,dy=to.y-from.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*1.25,ny=dx/len*1.25,steps=Math.max(3,Math.floor(len/3));
        const ladder=`<g fill="none" stroke="#d3ad43" stroke-width=".8" stroke-linecap="round"><path d="M${from.x+nx} ${from.y+ny}L${to.x+nx} ${to.y+ny}M${from.x-nx} ${from.y-ny}L${to.x-nx} ${to.y-ny}"/>${Array.from({length:steps},(_,i)=>{const t=(i+.5)/steps,x=from.x+dx*t,y=from.y+dy*t;return `<path d="M${x+nx} ${y+ny}L${x-nx} ${y-ny}"/>`;}).join('')}</g>`;
        return `<g class="snakes-link-ladder" data-upper-cell="${Math.max(a,b)}">${ladder.replace('#d3ad43','#ffffff').replace('stroke-width=".8"','stroke-width="1.04"')}${ladder}</g>`;
      }
      const midY=(from.y+to.y)/2;
      const head=`<g class="snakes-link-head"><circle cx="${from.x}" cy="${from.y}" r="1.92" fill="#ffffff"/><circle cx="${from.x}" cy="${from.y}" r="1.8" fill="#cd876e"/><circle cx="${from.x-.5}" cy="${from.y-.4}" r=".28" fill="#4b5945"/><circle cx="${from.x+.5}" cy="${from.y-.4}" r=".28" fill="#4b5945"/></g>`;
      const body=`<path d="M${from.x} ${from.y}C${from.x+9} ${midY},${to.x-9} ${midY},${to.x} ${to.y}" fill="none" stroke="#cd876e" stroke-width="2.4" stroke-linecap="round"/>`;
      return `<g class="snakes-link-snake" data-head-cell="${a}">${body.replace('#cd876e','#ffffff').replace('2.4','2.64')}${body}${head}</g>`;
    }).join('');
    return `<svg class="snakes-links" viewBox="0 0 100 100" aria-hidden="true">${art}</svg>`;
  }

  const pips=n=>globalThis.PlayroomShared.dieArt(n,{frame:'raised'});
  const effectIcons={adjust:'adjustDie',less:'lessDie',skip:'skipTurn',shield:'shield',second:'secondDie',extra:'extraTurn'};
  const effectColors={skip:'#c4514d',shield:'#397caf',less:'#c77638',adjust:'#8660aa',second:'#369ca5',extra:'#479463'};
  const render=(s,viewer,actions,ui={})=>{
    const d=s.scene,size=d.columns,roll=actions.find(a=>a.type==='roll'),allMoves=actions.filter(a=>a.type==='move'),delta=d.adjusting?(ui.viewState?.adjustDelta?.split(':')[0]===String(s.move)?Number(ui.viewState.adjustDelta.split(':')[1]):NaN):0,moves=allMoves.filter(a=>a.delta===delta),dice=Array.isArray(d.dice)?d.dice:[d.dice];
    const targets=d.moves.filter(t=>moves.some(a=>a.dieIndex===t.command.dieIndex&&a.delta===t.command.delta)).map(t=>({...t,a:moves.find(a=>a.dieIndex===t.command.dieIndex&&a.delta===t.command.delta)}));
    const marks=new Set(targets.flatMap(t=>t.route));
    const cells=Array.from({length:d.finish},(_,i)=>{
      const row=size-1-Math.floor(i/size),col=i%size,n=row*size+(row%2?size-col:col+1),link=d.links[n],effect=d.special[n],target=targets.find(t=>t.landing===n);
      const help=effect?text('effect.'+effect):link?text('view.link-help',{cell:n,kind:text(link>n?'view.ladder-up':'view.snake-down'),to:link}):text('view.cell',{cell:n});
      const tag=target?'button':'div',control=H.boardTarget(target?.a,{kind:link?(link>n?'home':'capture'):'move',color:effect?effectColors[effect]:null});
      return `<${tag} data-motion-anchor="cell-${n}" ${effect?`data-special="${effect}" style="background:${effectColors[effect]};${control.style}"`:''} class="snakes-cell ${(row+col)%2?'tinted':''} ${n===d.finish?'finish-cell':''} ${control.className} ${marks.has(n)?'is-route':''}" aria-label="${H.esc(help)}" ${target?control.attrs:`role="img" tabindex="0" data-tooltip="${H.esc(help)}"`}>${effect?'':`<span>${n===d.finish?'★':n}</span>`}${effect?`<i class="snakes-special" data-effect="${effect}">${H.icon(effectIcons[effect])}</i>`:''}${marks.has(n)&&!effect?H.routeDot():''}</${tag}>`;
    }).join('');
    const tokens=d.positions.map(({cell:n},i)=>{
      if(n===0)return '';const p=position(n,size),same=n===0?0:d.positions.slice(0,i).filter(v=>v.cell===n).length,count=n===0?1:d.positions.filter(v=>v.cell===n).length,spread=H.tokenLayout.cell(same,count),offset=count>1?22/size:0;
      return `<div data-size-role="token" data-interaction-shape="circle" class="snakes-token ${i===s.turn&&moves.length?'is-selected':''} ${count>1?'crowded':''}" role="img" data-entity="${H.esc(H.components.entityKey({namespace:'token',id:String(i)}))}" style="--round-token-fill:${H.playerColor(i)};--round-token-side:color-mix(in srgb,${H.playerColor(i)} 64%,#233b30);--round-token-mark:#fffdf4;--round-token-rim:#fff8e9;left:${p.x+spread.x*offset*4}%;top:${p.y+spread.y*offset*4}%" aria-label="${H.esc(text('view.pawn',{player:s.players[i].name,cell:n}))}">${globalThis.PlayroomShared.roundTokenArt({value:(i-s.firstPlayer+s.players.length)%s.players.length+1})}</div>`;
    }).join('');
    const controls=dice.map((value,index)=>{
      const choices=moves.filter(a=>a.dieIndex===index),main=roll||choices[0];
      return `<div class="snakes-die-choice"><button data-motion-lead="roll" class="die ${main?'is-playable':''}" ${main?H.actionAttr(main):'disabled'} aria-label="${H.esc(main?.label||text('view.die'))}: ${value}">${pips(value)}</button></div>`;
    }).join('');
    const adjustment=`<div class="snakes-adjust" role="group" aria-label="${H.esc(text('view.adjust'))}" ${d.adjusting&&allMoves.length?'':'style="visibility:hidden" aria-hidden="true"'}>${[-1,1].map(value=>`<button data-view-key="adjustDelta" data-view-value="${s.move}:${value}" data-adjust-delta="${value}" aria-pressed="${delta===value}" ${allMoves.some(a=>a.delta===value)?'':'disabled'}>${value>0?'+1':'−1'}</button>`).join('')}</div>`;
    return {api:3,actionReserve:false,family:'board',className:'snakes-scene',fieldAspect:1,playerContent:H.playerContent(s,viewer,null,{scoreLabel:text('meta.wins'),badges:i=>Object.entries(d.effects[i]).filter(([,v])=>v).map(([key])=>({label:text('effect.'+key),icon:effectIcons[key],color:effectColors[key]}))}),elements:{field:`<div class="snakes-board-wrap"><div class="snakes-board" style="--board-size:${size}" role="group" aria-label="${H.esc(text('view.board',{finish:d.finish}))}">${cells}${linksSVG(d.links,size)}<span class="snakes-start" data-motion-anchor="cell-0" aria-hidden="true"></span><div class="snakes-tokens">${tokens}</div></div></div>`,actions:`<div class="snakes-controls" data-size-role="board-dice"><div class="snakes-bottom">${controls}</div>${adjustment}</div>`,auxiliary:''}};
  };
  V.register('snakes',render,()=>coverComponents.cover(`<g transform="translate(58 24) rotate(-9 88 66)"><rect y="6" width="177" height="129" rx="13" fill="#c2bca0"/><rect width="177" height="129" rx="13" fill="#fffae5"/>${Array.from({length:20},(_,i)=>`<rect x="${9+i%5*32}" y="${9+Math.floor(i/5)*28}" width="32" height="28" rx="1" fill="${(i%5+Math.floor(i/5))%2?'#d6ddad':'#ede8bd'}"/>`).join('')}<g stroke="#b79a55" stroke-width="4" stroke-linecap="round"><path d="m40 106 52-78m-25 89 51-78"/><path d="m48 94 28 9m-19-24 29 9m-19-24 29 9m-19-24 28 9"/></g><path d="M133 22c-36 9 26 32-4 45s-5 30-13 40" fill="none" stroke="#d8886b" stroke-width="8" stroke-linecap="round"/><circle cx="133" cy="22" r="6" fill="#d8886b"/><circle cx="134" cy="20" r="1" fill="#fff8dd"/><circle cx="26" cy="96" r="10" fill="#3f7659"/><circle cx="147" cy="41" r="10" fill="#d9af4d"/></g><g transform="translate(211 118) rotate(10)"><rect y="4" width="36" height="36" rx="9" fill="#c2b69a"/><rect width="36" height="36" rx="9" fill="#fff9e6"/>${[[11,11],[25,11],[18,18],[11,25],[25,25]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#59775c"/>`).join('')}</g>`),{surfaces:{table:(s,v,a,ui)=>{const view=render(s,v,a,{...ui,surface:'table'});return view;},player:(s,v,a,ui)=>render(s,v,a,{...ui,surface:'player'})}});
})();
