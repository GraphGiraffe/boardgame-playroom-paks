(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared,colors=['var(--color-side-green,#4c8060)','var(--color-side-red,#ce735d)','var(--color-side-blue,#668fad)','var(--color-side-yellow,#cfac4c)'];
 const source=typeof require==='function'&&!globalThis.PlayroomPack;
 const P=source?require('./presentation/scene.js'):globalThis.PlayroomPackPresentation;
 const translator=H.translator(source?{ru:require('./locales/ru/game.json')}:globalThis.PlayroomPackResources.locales);
 const text=(key,params={})=>translator.format({key:'ludo.'+key,params});
 const {route,base,lane,location,anchor,sequence}=P;
 const render=(s,viewer,actions,ui={})=>{
  const rollEvent=s.events?.findLast(event=>event.kind==='roll'),rollPlayer=ui.presentationTurn??s.turn;
  const d=s.data,roll=actions.find(a=>a.type==='roll'),moves=actions.filter(a=>a.type==='move'),selected=ui.viewState?.pawn;
  const occupants=new Map();
  d.pawns.forEach((row,p)=>row.forEach((n,j)=>{if(n<0)return;const key=anchor(p,j,n);if(!occupants.has(key))occupants.set(key,[]);occupants.get(key).push(`${p}:${j}`);}));
  const targets=new Map(),dots=new Set();
  // Legal actions remain authoritative. Local selection only previews their public route.
  for(const a of moves.filter(a=>`${a.owner}:${a.pawn}`===selected).sort((a,b)=>d.dice[a.dieIndex]-d.dice[b.dieIndex]||a.dieIndex-b.dieIndex)){
   const from=d.pawns[a.owner][a.pawn],to=from<0?0:from+d.dice[a.dieIndex],key=anchor(a.owner,a.pawn,to),cell=(a.owner*13+to)%52;
   const capture=P.destination(s,a).captured.length>0;
   const kind=from<0||to>=52?'home':capture?'capture':'move';
   if(!targets.has(key))targets.set(key,{a,to,kind});
   for(let n=from<0?0:from+1;n<=to;n++)dots.add(anchor(a.owner,a.pawn,n));
  }
  const cellMarkup=(key,style,label,content='')=>{
   const target=targets.get(key),tag=target?'button':'span',kind=target?.kind,control=H.boardTarget(target?.a,{kind:kind||'move'});
   const description=target?`${label}: ${kind==='capture'?'атака':kind==='home'?'выход или дом':'ход'}, кубик ${target.a.dieIndex+1} (${d.dice[target.a.dieIndex]})`:label;
   const special=key.startsWith('path-')&&[0,8].includes(Number(key.slice(5))%13);
   return `<${tag} class="ludo-cell ${key.startsWith('path-')&&Number(key.slice(5))%13===8?'ludo-safe':''} ${target?`ludo-target ${control.className}`:''}" data-motion-anchor="${key}" ${control.attrs} style="${style};${control.style}" aria-label="${H.esc(description)}">${dots.has(key)&&!special?H.routeDot():content}</${tag}>`;
  };
  const safeStar='<svg class="ludo-safe-star" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 61 35 95 36 69 56 78 92 50 72 22 92 31 56 5 36 39 35Z" fill="currentColor"/></svg>';
  const startArrow=direction=>`<svg class="ludo-start-arrow" viewBox="0 0 100 100" style="transform:rotate(${direction*90}deg)" aria-hidden="true"><path d="M18 28 82 50 18 72Z" fill="currentColor"/></svg>`;
  const cells=route.map(([x,y],i)=>cellMarkup(`path-${i}`,`grid-column:${x+1};grid-row:${y+1};${i%13===0?`background:${colors[i/13]}`:''}`,text('view.cell',{cell:i+1})+(i%13===0?text('view.start'):i%13===8?text('view.safe'):''),i%13===0?startArrow(i/13):i%13===8?safeStar:'')).join('')+colors.map((color,p)=>Array.from({length:5},(_,n)=>{const [x,y]=lane(p,n);return cellMarkup(`home-${p}-${n+52}`,`grid-column:${x+1};grid-row:${y+1};background:${colors[p]}`,text('view.home-cell',{cell:n+1}));}).join('')).join('');
  const finishes=colors.map((_,p)=>{const [x,y]=location(p,0,57);return cellMarkup(`finish-${p}`,`position:absolute;left:${(x+.5)/15*100}%;top:${(y+.5)/15*100}%;width:6.667%;transform:translate(-50%,-50%)`, text('view.finish'));}).join('');
  const pawns=d.pawns.flatMap((row,p)=>row.map((n,j)=>{
   const [x,y]=location(p,j,n),key=`${p}:${j}`,playable=moves.some(a=>a.owner===p&&a.pawn===j),active=selected===key&&moves.length>0,group=n===57?[key]:occupants.get(anchor(p,j,n))||[key],index=group.indexOf(key),offset=H.tokenLayout.cell(index,group.length),offsetX=offset.x,offsetY=offset.y,size=n===57?3.8:group.length<=1?5.4:group.length<=4?4.7:group.length<=9?2.85:2.1;
   const exit=moves.find(a=>a.owner===p&&a.pawn===j&&n<0),destination=targets.get(anchor(p,j,n));
   const team=s.scene?.players?.find(player=>player.player===p)?.teamId,actorTeam=s.scene?.players?.find(player=>player.player===s.turn)?.teamId;
   const friendly=p===s.turn||team!=null&&team===actorTeam;
   // A friendly pawn remains a selection target even on a highlighted cell.
   const control=exit?H.actionAttr(exit):playable?`data-view-key="pawn" data-view-value="${key}"`:destination&&!friendly?H.actionAttr(destination.a):'disabled';
   return `<button data-size-role="token" class="ludo-pawn ${n===57?'is-finished':''} ${group.length>1?'is-stacked':''} ${group.length>9?'is-tiny':''} ${playable?'is-playable':''} ${active?'is-selected':''}" data-interaction-shape="circle" data-entity="token-${p}-${j}" ${control} aria-pressed="${!!active}" style="--pawn:${colors[p]};--pawn-size:${size}%;left:${(x+.5+offsetX)/15*100}%;top:${(y+.5+offsetY)/15*100}%" aria-label="${H.esc(text('view.pawn',{player:s.players[p].name,pawn:j+1,location:n<0?text('view.base'):n===57?text('location.home'):n}))}">${globalThis.PlayroomShared.roundTokenArt({value:j+1})}</button>`;
  })).join('');
  return {api:2,family:'board',layout:{focus:'field',seats:['north-west','north-east','south-east','south-west'].slice(0,s.players.length),duplicateSelf:true},fieldAspect:1,actionReserve:true,className:'ludo-scene',motionSequence:sequence(d.last),playerContent:H.playerContent(s,viewer,null,{scoreLabel:text('meta.wins')}),elements:{field:`<div class="ludo-board">${base.map(([x,y],p)=>`<div class="ludo-base" style="grid-column:${x+1}/span 6;grid-row:${y+1}/span 6;--base:${colors[p]}"><div>${Array.from({length:4},(_,j)=>`<span data-motion-anchor="base-${p}-${j}"></span>`).join('')}</div></div>`).join('')}${cells}<div class="ludo-center"><svg viewBox="0 0 90 90" aria-hidden="true">${['M0 0 45 45 0 90Z','M0 0 90 0 45 45Z','M90 0 90 90 45 45Z','M0 90 45 45 90 90Z'].map((path,p)=>`<path d="${path}" fill="${colors[p]}"/>`).join('')}</svg></div>${finishes}${pawns}</div>`,actions:`<div class="shared-action-row" data-size-role="board-dice">${d.dice.map((n,i)=>{
   const canRoll=roll&&d.rollIndices.includes(i),move=moves.find(a=>a.dieIndex===i&&`${a.owner}:${a.pawn}`===selected),command=canRoll?roll:move;
   return C.die(n,`data-motion-lead="${rollEvent?.player===rollPlayer&&d.lastRolled?.includes(i)?'roll':''}" ${command?H.actionAttr(command):'disabled'}`,command?'is-playable':d.used[i]?'used':'');
  }).join('')}</div>`}};
 };
 V.register('ludo',render,()=>C.cover(`<g transform="translate(76 13) rotate(-7 76 76)"><rect x="2" y="5" width="150" height="150" rx="12" fill="#b6af8f"/><rect width="150" height="150" rx="12" fill="#fff8e7"/>${base.map(([x,y],p)=>`<rect x="${x*10+5}" y="${y*10+5}" width="50" height="50" rx="8" fill="${colors[p]}"/><circle cx="${x*10+30}" cy="${y*10+30}" r="14" fill="#fffae5"/>`).join('')}<path d="M60 0v150M90 0v150M0 60h150M0 90h150" stroke="#d3c6a5" stroke-width="2"/><circle cx="75" cy="75" r="12" fill="#ceaa52"/></g>`),{surfaces:{table:(s,v,a,ui)=>{const scene=render(s,v,a,ui);scene.elements.status=scene.elements.actions;scene.elements.actions='';return scene;},player:render}});
})();
