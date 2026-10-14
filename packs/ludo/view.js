(function(){
 'use strict';const V=globalThis.PlayroomViews,H=V.helpers,C=globalThis.PlayroomShared,colors=['#4c8060','#ce735d','#668fad','#cfac4c'];
 const route=[[1,6],[2,6],[3,6],[4,6],[5,6],[6,5],[6,4],[6,3],[6,2],[6,1],[6,0],[7,0],[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[14,7],[14,8],[13,8],[12,8],[11,8],[10,8],[9,8],[8,9],[8,10],[8,11],[8,12],[8,13],[8,14],[7,14],[6,14],[6,13],[6,12],[6,11],[6,10],[6,9],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8],[0,7],[0,6]];
 route.unshift(route.pop()); // Starts face the outer edge; the previous square leads into the home lane.
 const base=[[0,0],[9,0],[9,9],[0,9]],lane=(p,n)=>[[n+1,7],[7,n+1],[13-n,7],[7,13-n]][p];
 const location=(p,j,n)=>n<0?[base[p][0]+1.5+(j%2)*2,base[p][1]+1.5+Math.floor(j/2)*2]:n<52?route[(p*13+n)%52]:n<57?lane(p,n-52):[7+(p===0?-.45:p===2?.45:0),7+(p===1?-.45:p===3?.45:0)];
 const anchor=(p,j,n)=>n<0?`base-${p}-${j}`:n<52?`path-${(p*13+n)%52}`:n<57?`home-${p}-${n}`:`finish-${p}`;
 function sequence(last){if(!last)return undefined;const {owner:p,pawn:j,from,to}=last;return {trigger:'move',entry:from<0?'lift':undefined,arrival:to===57?'settle':undefined,entity:`token-${p}-${j}`,player:p,counter:'home',origin:{anchor:anchor(p,j,from)},steps:Array.from({length:from<0?1:to-from},(_,i)=>({anchor:anchor(p,j,from<0?0:from+i+1)}))};}
 const render=(s,viewer,actions,ui={})=>{
  const d=s.data,roll=actions.find(a=>a.type==='roll'),moves=actions.filter(a=>a.type==='move'),selected=ui.viewState?.pawn;
  const targets=new Map(),dots=new Set();
  // Legal actions remain authoritative. Local selection only previews their public route.
  for(const a of moves.filter(a=>`${a.owner}:${a.pawn}`===selected).sort((a,b)=>d.dice[a.dieIndex]-d.dice[b.dieIndex]||a.dieIndex-b.dieIndex)){
   const from=d.pawns[a.owner][a.pawn],to=from<0?0:from+d.dice[a.dieIndex],key=anchor(a.owner,a.pawn,to),cell=(a.owner*13+to)%52;
   const capture=to<52&&cell%13!==0&&cell%13!==8&&d.pawns.some((row,p)=>p!==a.owner&&!(s.preset==='teams'&&p%2===a.owner%2)&&row.some(n=>n>=0&&n<52&&(p*13+n)%52===cell));
   const kind=from<0||to>=52?'home':capture?'capture':'move';
   if(!targets.has(key))targets.set(key,{a,to,kind});
   for(let n=from<0?0:from+1;n<=to;n++)dots.add(anchor(a.owner,a.pawn,n));
  }
  const cellMarkup=(key,style,label,content='')=>{
   const target=targets.get(key),tag=target?'button':'span',kind=target?.kind;
   const description=target?`${label}: ${kind==='capture'?'атака':kind==='home'?'выход или дом':'ход'}, кубик ${target.a.dieIndex+1} (${d.dice[target.a.dieIndex]})`:label;
   return `<${tag} class="ludo-cell ${key.startsWith('path-')&&Number(key.slice(5))%13===8?'ludo-safe':''} ${target?`ludo-target target-${kind}`:''}" data-motion-anchor="${key}" ${target?H.actionAttr(target.a):''} style="${style}" aria-label="${H.esc(description)}">${dots.has(key)?'<i class="ludo-route-dot" aria-hidden="true"></i>':content}</${tag}>`;
  };
  const arrows=['→','↓','←','↑'];
  const cells=route.map(([x,y],i)=>cellMarkup(`path-${i}`,`grid-column:${x+1};grid-row:${y+1};${i%13===0?`background:${colors[i/13]}`:''}`,`Клетка ${i+1}${i%13===0?' · старт':i%13===8?' · безопасная':''}`,i%13===0?`<b class="ludo-start-arrow" aria-hidden="true">${arrows[i/13]}</b>`:i%13===8?'☆':'')).join('')+colors.map((color,p)=>Array.from({length:5},(_,n)=>{const [x,y]=lane(p,n);return cellMarkup(`home-${p}-${n+52}`,`grid-column:${x+1};grid-row:${y+1};background:${color}`,`Дом: клетка ${n+1}`);}).join('')).join('');
  const finishes=colors.map((_,p)=>{const [x,y]=location(p,0,57);return cellMarkup(`finish-${p}`,`position:absolute;left:${(x+.5)/15*100}%;top:${(y+.5)/15*100}%;width:6.667%;transform:translate(-50%,-50%)`, 'Финиш');}).join('');
  const pawns=d.pawns.flatMap((row,p)=>row.map((n,j)=>{
   const [x,y]=location(p,j,n),key=`${p}:${j}`,playable=moves.some(a=>a.owner===p&&a.pawn===j),active=selected===key&&moves.length>0,same=row.filter(v=>v===n).length,offset=n>=0&&same>1?(j-1.5)*.17:0;
   const exit=moves.find(a=>a.owner===p&&a.pawn===j&&n<0),destination=targets.get(anchor(p,j,n));
   const control=destination?H.actionAttr(destination.a):exit?H.actionAttr(exit):playable?`data-view-key="pawn" data-view-value="${key}"`:'disabled';
   return `<button class="ludo-pawn ${playable?'is-playable':''} ${active?'is-selected':''}" data-entity="token-${p}-${j}" ${control} aria-pressed="${!!active}" style="--pawn:${colors[p]};left:${(x+.5+offset)/15*100}%;top:${(y+.5+offset)/15*100}%" aria-label="${H.esc(s.players[p].name)}, фишка ${j+1}: ${n<0?'база':n===57?'дом':n}">${j+1}</button>`;
  })).join('');
  const hint=roll?'Бросьте кубики':targets.size?'Нажмите на клетку или выберите другую фишку':moves.length?selected?'Выберите другую фишку':'Выберите фишку':'Ход соперника';
  return {api:2,family:'board',fieldAspect:1,actionReserve:true,className:'ludo-scene',motionSequence:sequence(d.last),playerContent:H.playerContent(s,viewer,null,{scoreLabel:'победы',team:p=>s.preset==='teams'?{label:p%2?'красная':'синяя',color:p%2?'#ce735d':'#668fad'}:null,counters:(p,person)=>[{kind:'pieces',value:d.pawns[p].filter(n=>n===57).length,label:'Фишки дома'},{kind:'wins',value:person.score}]}),elements:{field:`<div class="ludo-board">${base.map(([x,y],p)=>`<div class="ludo-base" style="grid-column:${x+1}/span 6;grid-row:${y+1}/span 6;--base:${colors[p]}"><div>${Array.from({length:4},(_,j)=>`<span data-motion-anchor="base-${p}-${j}"></span>`).join('')}</div></div>`).join('')}${cells}<div class="ludo-center"><svg viewBox="0 0 90 90" aria-hidden="true">${['M0 0 45 45 0 90Z','M0 0 90 0 45 45Z','M90 0 90 90 45 45Z','M0 90 45 45 90 90Z'].map((path,p)=>`<path d="${path}" fill="${colors[p]}"/>`).join('')}</svg></div>${finishes}${pawns}</div>`,actions:`<div class="shared-action-row">${d.dice.map((n,i)=>{
   const canRoll=roll&&d.rollIndices.includes(i);
   return C.die(d.lastRoll?n:null,`data-motion-lead="${d.lastRolled?.includes(i)?'roll':''}" ${canRoll?H.actionAttr(roll):'disabled'}`,canRoll?'is-playable':d.used[i]?'used':'');
  }).join('')}<span class="shared-hint">${hint}</span></div>`}};
 };
 V.register('ludo',render,()=>C.cover(`<g transform="translate(76 13) rotate(-7 76 76)"><rect x="2" y="5" width="150" height="150" rx="12" fill="#b6af8f"/><rect width="150" height="150" rx="12" fill="#fff8e7"/>${base.map(([x,y],p)=>`<rect x="${x*10+5}" y="${y*10+5}" width="50" height="50" rx="8" fill="${colors[p]}"/><circle cx="${x*10+30}" cy="${y*10+30}" r="14" fill="#fffae5"/>`).join('')}<path d="M60 0v150M90 0v150M0 60h150M0 90h150" stroke="#d3c6a5" stroke-width="2"/><circle cx="75" cy="75" r="12" fill="#ceaa52"/></g>`),{surfaces:{table:(s,v)=>{const scene=render(s,v,[]);scene.elements.status=`<div class="shared-action-row">${s.data.dice.map(n=>C.die(s.data.lastRoll?n:null,'data-motion-lead="roll" disabled')).join('')}</div>`;return scene;},player:render}});
})();
