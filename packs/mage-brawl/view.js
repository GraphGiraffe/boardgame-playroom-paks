(function(root){
 'use strict';
 const source=typeof require==='function'&&!root.PlayroomPack,P=source?require('./presentation/scene.js'):root.PlayroomPackPresentation,V=root.PlayroomViews,H=V.helpers,C=root.PlayroomShared;
 const tr=H.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales),text=(k,params={})=>tr.format(P.message(k,params)),esc=H.esc;
 // Face and health share one coordinate plane; separate CSS transforms can round differently.
 const pawnWithHealth=health=>{const V=root.PlayroomGameComponents.vector,box={x:0,y:0,width:100,height:100};return V.viewport({width:100,height:100,attrs:'class="round-token-art medallion-art pawn-token-art" aria-hidden="true" focusable="false"',content:V.place(C.roundTokenArt({profile:'pawn'}),{...box,attrs:`data-asset-placement="${esc(JSON.stringify(box))}"`})+V.place(C.pieceIndicators({value:health.value,capacity:health.display.capacity,label:tr.format(health.label)}),{x:25,y:60,width:50,height:16,attrs:'data-mage-token-health="true"'})});};
 const teamIds=['blue','red','cyan','brown'],teamColor=team=>`var(--color-team-${teamIds[team]},${['#668fad','#ce735d','#729d98','#aa844b'][team]})`;
 function shrinkIndicator(counter){
  if(!counter)return '';
  const label=text(counter.scheduled?'ui.shrink':'ui.shrink-count',{count:counter.filled,total:counter.capacity});
  const capacity=counter.capacity,cellsPerStep=12/capacity;
  // Clockwise from the top-right region; all capacities share the same 4×4 grid.
  const edge=[[2,0],[3,0],[3,1],[3,2],[3,3],[2,3],[1,3],[0,3],[0,2],[0,1],[0,0],[1,0]];
  const cell=([x,y],attrs='')=>`<rect ${attrs} x="${8+x*22}" y="${8+y*22}" width="18" height="18" rx="3"/>`;
  const center=[[1,1],[2,1],[1,2],[2,2]].map(pos=>cell(pos,'class="mage-shrink-center"')).join('');
  const segments=Array.from({length:capacity},(_,i)=>`<g class="mage-shrink-corner${i<counter.filled?' is-filled':''}" data-shrink-segment="${i}">${edge.slice(i*cellsPerStep,(i+1)*cellsPerStep).map(pos=>cell(pos,'data-shrink-cell')).join('')}</g>`).join('');
  return `<span class="mage-shrink-counter${counter.scheduled?' is-scheduled':''}" data-shrink-capacity="${capacity}" data-shrink-filled="${counter.filled}" data-shrink-scheduled="${!!counter.scheduled}" role="img" aria-label="${esc(label)}" title="${esc(label)}"><svg viewBox="0 0 100 100" aria-hidden="true">${center}${segments}</svg></span>`;
 }
 function teamReserve(shown){
  if(!shown.teamLives)return '';
  const teams=teamIds.flatMap((id,team)=>shown.players.some(p=>p.team===team)?[{id,team,count:shown.teamLives[team]}]:[]);
  const label=teams.map(t=>text('ui.team-life-pool',{team:text('ui.team-'+t.id),count:t.count})).join('; ');
  return `<span class="mage-team-lives" data-team-count="${teams.length}" role="img" aria-label="${esc(label)}" title="${esc(label)}">${teams.map((t,i)=>(i?'<span class="mage-team-separator" aria-hidden="true">:</span>':'')+`<span class="mage-team-pool" data-team-reserve="${t.team}" style="color:${teamColor(t.team)}" aria-hidden="true">${C.tokenStrip({value:1,capacity:1,icon:'meeple'})}<span>×<b>${t.count}</b></span></span>`).join('')}</span>`;
 }

 const art=source?require('./presentation/rule-illustrations.js'):root.PlayroomPackRuleIllustrations,{colors,ink,paving,stoneFloor,stakes,terrain,svg,terrainBadgeColors,terrainBonuses,terrainArt,elementArt,arrow,actionArt,illustration,card,ultimateToken,footprints,actionIcon,rotateIcon}=art;
 const orderHint=(expanded=false)=>{
  const item=(icon,label,color='')=>`<span class="mage-order-item" title="${esc(label)}" style="${color?'color:'+color:''}">${icon}${expanded?`<small>${esc(label)}</small>`:''}</span>`;
  const arrow='<span class="mage-order-arrow" aria-hidden="true">→</span>';
  return `<div class="mage-order-hint${expanded?' is-expanded':''}" role="img" aria-label="${esc(text('ui.resolution-order'))}"><span class="mage-order-group">${item(footprints(),text('ui.movement'))}${arrow}${item(H.icon('sword'),text('ui.attack'))}</span><span class="mage-order-divider" aria-hidden="true"></span><span class="mage-order-group">${['air','earth','water','fire'].map(e=>item(svg(ink[e]),text('element.'+e),colors[e])).join(arrow)}</span></div>`;
 };
 const directionAngle=(e,a,d)=>d*90+(e==='air'&&a==='movement'?45:0);
 const cardDirection=(e,a,d)=>`<span class="mage-card-facing" style="--mage-bearing:${directionAngle(e,a,d)}deg;color:${colors[e]}" aria-hidden="true">${svg('<path d="m50 12 32 65H18Z" fill="currentColor"/>')}</span>`;
 const key=p=>p.join(','),button=(label,attrs,icon)=>H.button({label:icon?'':label,icon:icon||'',ariaLabel:label,attrs,variant:'game'});
 function render(s,viewer,actions,ui={}){
  const d=s.scene.arena,local=ui.viewState||{},mine=d.players[viewer],own=mine?.hand||[],accepted=mine?.plan,double=d.config?.steps===2,first=mine?.draft||accepted?.steps?.[0],lockedIndex=first?own.findIndex(c=>c.id===first.cardId):-1,acceptedChoice=accepted?.steps?.[1]||accepted;
  const cardId=i=>own[i]?.id,chosenIndex=own.findIndex((e,i)=>cardId(i)===local.mageCardId&&i!==lockedIndex),selectedIndex=acceptedChoice?own.findIndex(c=>c.id===acceptedChoice.cardId):chosenIndex>=0?chosenIndex:Math.max(0,own.findIndex((e,i)=>i!==lockedIndex));
  const element=acceptedChoice?.element||own[selectedIndex]?.element,types=['movement','attack',...(mine?.ultimate>0?['ultimate']:[])],blockedType=value=>!!(first&&(d.config?.differentActionTypes&&first.action===value||value==='ultimate'&&mine?.ultimate-(first.action==='ultimate'?1:0)<=0)),availableTypes=types.filter(value=>!blockedType(value)),action=acceptedChoice?.action||(availableTypes.includes(local.mageAction)?local.mageAction:availableTypes[0]),rotation=Number(local.mageDirection||0),direction=acceptedChoice?.direction??C.rotationController.direction(rotation),visualDirection=C.rotationController.align(rotation,direction);
  const matches=c=>c.type==='plan'&&c.element===element&&c.action===action&&c.direction===direction&&c.cardId===cardId(selectedIndex);
  const choice=actions.find(matches),previewInfo=d.previews?.find(p=>matches(p.command)),preview=previewInfo?.cells||[],marks=new Set(preview.map(key)),fixedMarks=new Set((d.planned?.cells||[]).map(key));
  const feedback=(shown,id)=>{
   const out=shown.outcomes?.find(o=>o.player===id),killer=shown.outcomes?.some(o=>o.killers.includes(id));
   return [out?.damage?'damage':'',out?.death?'death':'',out?.fall?'fall':'',killer?'killer':''].filter(Boolean).join(' ');
  };
  function attackArt(fx){
   if(!fx||fx.action==='movement')return '';
   const x=fx.origin[1]*100+50,y=fx.origin[0]*100+50;
   return (fx.projectile?[fx.projectile.end]:fx.cells.length?fx.cells:[fx.aim||fx.origin]).map(q=>{
    const tx=q[1]*100+50,ty=q[0]*100+50,dist=Math.hypot(tx-x,ty-y),angle=Math.atan2(ty-y,tx-x)*180/Math.PI;
    const impact=fx.projectile?.miss?'':`<circle class="mage-impact" cx="${tx}" cy="${ty}" r="29"/>`;
    if(fx.element==='water')return `<g class="mage-attack-water"><path class="mage-jet" pathLength="1" d="M${x} ${y}Q${(x+tx)/2+12} ${(y+ty)/2-12} ${tx} ${ty}"/><path class="mage-jet mage-jet-light" pathLength="1" d="M${x} ${y}Q${(x+tx)/2-7} ${(y+ty)/2+7} ${tx} ${ty}"/>${impact}</g>`;
    if(fx.element==='air')return `<g class="mage-attack-air"><path class="mage-gust" pathLength="1" d="M${x} ${y}L${tx} ${ty}"/><g transform="translate(${tx} ${ty}) rotate(${fx.direction*90})"><g class="mage-tornado"><path d="M-27-23Q32-38 29-21T-24-7Q26-20 22-3T-17 9Q15 1 13 15T-5 26"/><path d="m-14-30 14-15 14 15"/></g></g></g>`;
    const art=fx.element==='earth'?'<path d="M-25 19V-12Q-25-20-17-20H-9V-29Q-9-36-1-36H6Q13-36 13-29V-26H23Q31-26 31-18V-8H37Q45-8 45 0V20L29 32H-9Z"/><path d="M-9-20V2M13-26V1M31-8V10M-25 7H-6L4 18" class="mage-fist-lines"/>':'<path d="M-6-17Q-32-22-54-6L-29-3-58 15Q-29 12-6 20Z" fill="#efab55"/><circle r="23" fill="#cb563b"/><path d="M9-15Q25 10 3 17Q-13 17-11 4L-2-2 0 8Q9 2 9-15Z" fill="#ffe8a0"/>';
    return `<g class="mage-attack-${fx.element}" transform="translate(${x} ${y}) rotate(${angle})"><g class="mage-projectile" style="--flight:${dist}px">${art}</g></g>${impact}`;
   }).join('');
  }
  const fragment=(frame,id,markup)=>frame?.region?frame.region(id,markup):markup;
  function board(shown,interactive=!ui.replay,frame=null){
   const inset=shown.phase==='shrink'?Math.max(0,shown.inset-1):shown.inset||0,columns=d.size-2*inset;
   const occupants=new Map(shown.players.flatMap((p,i)=>p.pos?[[key(p.pos),i]]:[])),fx=shown.effect,spellEffects=shown.effects||(fx?[fx]:[]);
   const highlights=[];
   const cells=shown.board.map((tile,index)=>{
    const pos=[Math.floor(index/d.size),index%d.size];if(pos.some(v=>v<inset||v>=d.size-inset))return '';
    const basePlayer=d.startingBases?.findIndex(q=>key(q)===key(pos))??-1,id=occupants.get(key(pos)),respawn=interactive&&actions.find(c=>c.type==='respawn'&&key(c.pos)===key(pos)),label=text('tile.'+(tile||'void')),revealed=shown.plans?.[id];
    const planLabel=revealed?text('ui.'+revealed.action)+(shown.phase==='reveal-actions'?'':' · '+text('element.'+revealed.element)+' · '+text('ui.direction.'+revealed.direction)):'';
    const selected=interactive&&(marks.has(key(pos))||fixedMarks.has(key(pos))),acting=id!==undefined&&fx?.actor===id,previewAction=marks.has(key(pos))?action:first?.action;
    highlights.push(`<span class="mage-cell-highlight${selected?' is-preview':''}${selected&&previewAction!=='movement'?' is-attack-preview':''}${respawn?' is-respawn':''}${acting?' is-acting':''}" style="--mage-selected:${colors[marks.has(key(pos))?element:first?.element]||colors.air}"></span>`);
    return fragment(frame,'cell-'+index,`<button data-dom-key="mage-cell-${pos[0]}-${pos[1]}" type="button" role="gridcell" style="--mage-base-color:${basePlayer>=0?H.playerColor(basePlayer):'#b6b99a'};--mage-selected:${colors[marks.has(key(pos))?element:first?.element]||colors.air}" class="mage-cell tile-${tile||'void'}${respawn?' is-playable':''}${interactive&&(marks.has(key(pos))||fixedMarks.has(key(pos)))?' mage-preview':''}${shown.shrink&&pos.some(v=>v===shown.inset||v===d.size-shown.inset-1)?' mage-risk':''}${acting?' mage-acting':''}" ${respawn?H.actionAttr(respawn):'disabled'} data-tooltip="${esc(text('tile-help.'+(tile||'void')))}" title="${esc(label)}" aria-label="${esc(label)}${id!==undefined?' · '+esc(s.players[id].name)+(planLabel?' · '+esc(planLabel):''):''}">${terrainArt(tile)}</button>`);
   }).join('');
   const pieces=shown.players.map((p,id)=>{
    const moves=shown.motions?.filter(m=>m.player===id)||[],motion=moves.at(-1),out=shown.outcomes?.find(o=>o.player===id),pos=p.pos||out?.at||motion?.to;
    if(!pos)return '';
    const myChoice=interactive&&id===viewer&&d.phase==='planning'&&!!element,health=P.healthMetric(p,d.config);
    const old=moves[0]?.from,revealed=shown.plans?.[id],state=feedback(shown,id),displayPos=pos.map(v=>Math.max(-.2,Math.min(columns-.8,v-inset)));
    return fragment(frame,'piece-'+id,`<div class="mage-piece${old?' mage-moving':''}" data-dom-key="mage-player-${id}" data-mage-player="${id}" style="--col:${displayPos[1]};--row:${displayPos[0]};--move-col:${old?old[1]-inset-displayPos[1]:0};--move-row:${old?old[0]-inset-displayPos[0]:0}">${myChoice?`<span class="mage-facing" style="--mage-direction:${directionAngle(element,action,direction)}deg" aria-hidden="true">${svg('<path d="m50 4 12 19H38Z" fill="var(--mage-selected)" stroke="#fffbed" stroke-width="2" stroke-linejoin="round"/>')}</span>`:''}<span class="mage-token${id===viewer&&!ui.replay?' is-selected':''}${myChoice?' mage-selected-token':''}" data-public-feedback="${state}" style="--mage-color:${H.playerColor(id)};--mage-team-color:${d.config.teams?teamColor(p.team):'#fffbed'}" aria-label="${esc(s.players[id].name)}">${pawnWithHealth(health)}${shown.shields?.[id]!==undefined?`<span class="mage-shield" style="transform:rotate(${shown.shields[id]*90}deg)">${svg('<path d="M12 38Q50 0 88 38" fill="none" stroke="#fffbed" stroke-width="9" stroke-linecap="round"/>')}</span>`:''}${p.ultimate?`<span class="mage-ultimate">${ultimateToken()}</span>`:''}${revealed?`<span class="mage-revealed">${actionIcon(revealed.action)}</span>`:''}</span></div>`);
   }).join('');
   const trails=(shown.motions||[]).map(m=>`<path class="mage-trail" pathLength="1" style="color:${colors[m.element]}" d="M${m.from[1]*100+50} ${m.from[0]*100+50}L${m.to[1]*100+50} ${m.to[0]*100+50}"/>`).join('');
   const effects=`<svg class="mage-effects mage-routes" viewBox="${inset*100} ${inset*100} ${columns*100} ${columns*100}" aria-hidden="true">${trails}</svg><svg class="mage-effects mage-attacks" viewBox="${inset*100} ${inset*100} ${columns*100} ${columns*100}" aria-hidden="true" style="color:${colors[fx?.element]||'#fffbed'}">${spellEffects.map(f=>`<g style="color:${colors[f.element]}">${attackArt(f)}</g>`).join('')}</svg>`;
   return `<div class="mage-grid" role="grid" aria-label="${esc(text('ui.arena'))}" style="--mage-columns:${columns};--mage-selected:${colors[element]||colors.air}">${cells}${effects}${interactive&&double?planGhosts(inset,columns):''}<div class="mage-pieces">${pieces}</div>${fragment(frame,'highlights',`<div class="mage-highlights" aria-hidden="true">${highlights.join('')}</div>`)}</div>`;
  }
  function planGhosts(inset,columns){
   if(!mine?.pos||d.phase!=='planning'||ui.replay)return '';
   const steps=[...(d.planned?[{...d.planned.command,origin:d.planned.origin,cells:d.planned.cells,end:d.planned.pos,number:1}]:[]),...(previewInfo?.origin?[{element,action,direction,origin:previewInfo.origin,cells:preview,end:action==='movement'?preview[0]:previewInfo.origin,number:first?2:1}]:[])];
   const art=steps.map(c=>{if(!c.origin)return '';const [y,x]=c.origin.map(v=>v*100+50),end=c.end||c.origin,[ty,tx]=end.map(v=>v*100+50),color=colors[c.element];
    const ghost=`<circle cx="${tx}" cy="${ty}" r="29" fill="${H.playerColor(viewer)}" fill-opacity=".28" stroke="${color}" stroke-width="4" stroke-dasharray="6 4"/><text x="${tx+25}" y="${ty-22}" text-anchor="middle" fill="#fffbed" stroke="${color}" stroke-width=".6" font-size="18" font-weight="bold">${c.number}</text>`;
    return `<g class="mage-plan-ghost" style="color:${color}">${c.action==='movement'?`<path d="M${x} ${y}L${tx} ${ty}" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-dasharray="12 6"/>`:`<g transform="translate(${x-42+[0,32,0,-32][c.direction]} ${y-42+[-32,0,32,0][c.direction]}) scale(.84) rotate(${c.direction*90} 50 50)">${illustration(c.element,c.action)}</g>`}${ghost}</g>`;
   }).join('');
   return `<svg class="mage-effects mage-plan-preview" viewBox="${inset*100} ${inset*100} ${columns*100} ${columns*100}" aria-hidden="true">${art}</svg>`;
  }
  // Empty phases retain the same public geometry, without cards or commands.
  const reserveHand=!ui.replay&&!!mine&&(!own.length||d.loot?.player===viewer);
  const help=button(text('ui.card-help'),'data-command="card-help"','help');
  const rotate=delta=>H.button({variant:'outline',className:'mage-rotate',label:'',icon:'undo',ariaLabel:text(delta<0?'ui.rotate-left':'ui.rotate-right'),attrs:`data-view-layout="stable" data-view-key="mageDirection" data-view-value="${rotation+delta}"`,disabled:!!accepted}).replace(/<svg[\s\S]*?<\/svg>/,rotateIcon(delta));
  const slider=reserveHand||mine?.pos&&d.phase==='planning'?`<div class="shared-board-tabs mage-action-switch">${H.components.actionSelector({key:'mageAction',label:text('ui.action'),value:action,disabled:accepted,stable:true,choices:types.map(value=>({value,label:text('ui.'+value),html:actionIcon(value),disabled:blockedType(value),marker:first&&d.config?.differentActionTypes&&first.action===value?'1':null}))})}</div>`:'';
  const commit=accepted?actions.find(c=>c.type==='unready'):choice;
  const reset=double?H.button({label:'',icon:'undo',ariaLabel:text('ui.reset-plan'),attrs:reserveHand?'':H.actionAttr({type:'unready'}),variant:'outline',className:'mage-reset-plan',disabled:!(first||accepted)||d.phase!=='planning'}):'';
  const controls=reserveHand||mine&&d.phase==='planning'&&mine.pos?H.button({label:'',icon:'check',ariaLabel:double?text(first?'ui.second-action':'ui.first-action'):text('actions.'+(accepted?'unready':'plan')),attrs:commit?H.actionAttr(commit):'',disabled:!commit,variant:'outline',active:!!accepted,className:'mage-ready'}):'';
  let hand=!ui.replay&&(own.length||reserveHand)?`<div class="mage-hand${reserveHand?' mage-hand-reserve':''}"${reserveHand?' inert aria-hidden="true"':''}><div class="mage-hand-toolbar">${reset}${slider}<span class="mage-controls">${controls}${help}</span></div><div class="mage-hand-row">${rotate(-1)}${H.hand((reserveHand?[{element:null}]:own).map((c,i)=>({e:c.element,i})).sort((a,b)=>(b.i===lockedIndex)-(a.i===lockedIndex)).map(({e,i})=>{if(reserveHand)return {id:'hand-reserve',html:'<span class="hand-card mage-card-reserve" data-card-shape="square" aria-hidden="true"></span>'};const locked=i===lockedIndex,cardAction=locked?first.action:action,cardDirectionValue=locked?first.direction:direction,cardRotation=locked?first.direction:visualDirection;return {id:cardId(i),selected:i===selectedIndex,locked,html:`<button class="hand-card mage-card${!accepted&&!locked?' is-playable':''}${i===selectedIndex||locked?' selected is-selected':''}${locked?' mage-plan-locked':''}" type="button" data-piece-type="card-deck" data-card-shape="square" data-mage-action="${cardAction}" style="--mage-direction:${cardRotation*90}deg" data-entity="${esc(H.components.entityKey({namespace:'card',id:cardId(i)}))}" data-view-layout="stable" data-view-key="mageCardId" data-view-value="${cardId(i)}" data-tooltip-title="${esc(text('element.'+e)+' · '+text('ui.'+cardAction)+' · '+text('ui.direction.'+cardDirectionValue))}" data-tooltip="${esc(text('action-help.'+e+'.'+cardAction))}" ${accepted||locked?'disabled':''} aria-label="${esc(text('element.'+e)+' · '+text('ui.'+cardAction)+' · '+text('ui.direction.'+cardDirectionValue))}">${card(e,cardAction)}${cardDirection(e,cardAction,cardDirectionValue)}${locked?'<span class="mage-plan-order">1</span>':''}<template data-card-help-art data-tooltip-art>${svg(`<g style="color:${colors[e]}" transform="rotate(${cardDirectionValue*90} 50 50)">${actionArt(e,cardAction,cardDirectionValue)}</g>`,'mage-action-diagram')}</template></button>`};}),reserveHand?1:own.length,text('ui.'+action),'',{layout:'overlap'})}${rotate(1)}</div><template data-game-memo data-title="${esc(text('ui.memo'))}">${memoMarkup()}</template><template data-card-help-intro><h3>${esc(text('ui.order-heading'))}</h3>${orderHint(true)}${text('ui.order-detail').split('\n\n').map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}</template></div>`:'';
  if(!ui.replay&&d.loot?.player===viewer)hand=`<div class="mage-hand-with-loot">${hand}<div class="mage-loot-hand">${H.button({label:text('ui.loot-from',{name:s.players[d.loot.victim].name}),variant:'outline',attrs:`data-player-target="${d.loot.victim}" aria-haspopup="dialog" aria-expanded="false"`})}</div></div>`;
  function playerContent(shown,live=false){
   const teamCount=shown.teamLives?.filter((_,team)=>shown.players.some(p=>p.team===team)).length||0;
   const scene={...s.scene,players:(s.scene?.players||[]).map(p=>{const v=shown.players[p.player];return {...p,handCount:v.maxHand,metrics:P.playerMetrics(v,d.config).map(metric=>({...metric,label:tr.format(metric.label)}))};})};
   return H.playerContent({...s,data:shown,scene},viewer,null,{inactive:i=>shown.players[i].lives===0,ready:i=>live?d.window?.ready.includes(i):!!shown.ready?.includes(i),decisionPlayer:i=>!ui.replay&&live&&ui.hotseat&&!s.players[i].bot&&d.window?.participants.includes(i)?i:null}).map((content,i)=>({...content,statusMinWidth:d.config.teams&&i===viewer?30+teamCount*26+(teamCount-1)*9:24,statusHTML:i===viewer?`<span class="mage-player-status">${d.config.teams&&i===viewer?teamReserve(shown):''}${shrinkIndicator(shown.shrinkCounter)}</span>`:'',orderPosition:false,showFirstPlayer:false,showSelfLabel:false,counters:content.counters.filter(c=>!['kills','ultimate'].includes(c.id)),badges:content.counters.filter(c=>c.id==='ultimate'&&c.value>0).map(c=>({label:c.label+': '+c.value,icon:'host',position:'avatar-bottom',color:'#e4c459',value:c.value}))}));
  }
  const panelMarkup=(shown,live=false)=>playerContent(shown,live).map((content,i)=>H.playerPanel({...s,turn:live&&d.phase!=='planning'?s.turn:-1},i,viewer,content,live?actions:[]).replace('<article ',`<article data-public-feedback="${feedback(shown,i)}" `)).join('');
  const plan=s.scene.plan;
  const revealCard=f=>`<div class="mage-phase-card" style="--mage-direction:${f.direction*90}deg">${card(f.element,f.action)}<div class="mage-reveal-meta"><span class="mage-reveal-type" aria-label="${esc(text('ui.'+f.action))}">${actionIcon(f.action)}</span>${cardDirection(f.element,f.action,f.direction)}<span class="mage-reveal-element" style="color:${colors[f.element]}" aria-label="${esc(text('element.'+f.element))}">${svg(ink[f.element])}</span></div></div>`;
  const renderFrame=(index,frame)=>{
   const scene=plan.scenes[index];
   const progress=globalThis.PlayroomMessages.text('progress.round',{number:Math.max(1,s.scene.round.number-1)}),shown=scene.state,label=scene.kind==='turn-reveal'?'':scene.kind==='start'?text('phase.start'):(double?text('ui.action-number',{number:scene.step+1})+' · ':'')+text('phase.'+scene.phase);
   if(scene.kind==='turn-reveal'){
    const heading=tr.format({key:'mage-brawl.ui.round-step',params:{round:scene.round,step:['I','II'][scene.step]||String(scene.step+1)}});
    const choices=new Map(scene.phases.flatMap(group=>group.cards).map(choice=>[choice.actor,choice]));
    const rows=`<div class="mage-round-players" style="--round-player-count:${s.players.length};--round-columns:${Math.min(4,s.players.length)};--round-rows:${Math.ceil(s.players.length/4)}">${s.players.map((player,actor)=>{
     const choice=choices.get(actor);
     return `<div class="mage-round-player" data-round-player="${actor}" data-round-choice="${!!choice}"><span title="${esc(player.name)}" style="color:${H.playerColor(actor)}">${esc(player.name)}</span>${choice?revealCard(choice):`<span class="mage-phase-card mage-round-empty" aria-label="${esc(text('ui.no-actions'))}">—</span>`}</div>`;
    }).join('')}</div>`;
    return {progress,label:heading,markup:board(shown,false,frame)+`<div class="mage-phase-reveal mage-round-reveal" role="status" data-round-step="${scene.step+1}"><strong>${esc(heading)}</strong>${rows}</div>`,players:panelMarkup(shown),pack:'mage-brawl',sound:'mage.reveal'};
   }
   if(scene.kind==='reveal'){
    const reveals=scene.effects.map(f=>`<div class="mage-phase-player"><strong style="color:${H.playerColor(f.actor)}">${esc(s.players[f.actor].name)}</strong>${revealCard(f)}<span>${esc(text('ui.'+f.action))}</span></div>`).join('');
    return {progress,label,markup:board(shown,false,frame)+`<div class="mage-phase-reveal" role="status"><strong>${esc(label)}</strong><div class="mage-phase-cards">${reveals}</div></div>`,players:panelMarkup(shown),pack:'mage-brawl',sound:'mage.reveal'};
   }
   const effects=scene.effects||[];
   return {progress,label,markup:board(shown,false,frame),players:panelMarkup(shown),pack:'mage-brawl',sound:effects.length?(effects[0].action==='movement'?(effects[0].element==='earth'?'mage.shield':'mage.move'):'mage.'+effects[0].element):scene.phase==='shrink'?'mage.fall':''};
  };
  const live=frame=>({markup:board(d,!ui.replay,frame),players:panelMarkup(d,true),progress:globalThis.PlayroomMessages.text('progress.round',{number:s.scene.round.number}),label:text(d.phase==='loot'?'ui.loot':d.phase==='respawn'?'ui.respawn':'ui.plan')});
  const inline=ui.publicFrames?null:live();
  const field=ui.publicFrames?ui.publicFrames({key:'arena',plan,renderFrame,live:ui.publicFrames.supportsFragments?live:live()}):root.PlayroomGameComponents.publicFrames({lazy:true,plan,frames:plan.scenes.slice(0,plan.final).map((_,index)=>renderFrame(index)),live:inline.markup,livePlayers:inline.players,liveProgress:inline.progress,controls:false,label:inline.label,playLabel:text('ui.replay'),skipLabel:text('ui.live'),speedLabel:text('ui.speed')});
  const players=ui.publicFrames?playerContent(d,true):playerContent(plan.scenes[0]?.state||d);
  return {api:3,family:'board',showTurn:false,className:'mage-scene'+(plan.final?' is-public-playback':''),fieldSizing:'scroll',layout:{focus:'field',wideHand:true},playerContent:players,elements:{auxiliary:(ui.region?ui.region('memo',[],()=>`<div class="mage-memo-source" hidden><template data-game-memo data-title="Памятка">${memoMarkup()}</template></div>`):`<div class="mage-memo-source" hidden><template data-game-memo data-title="Памятка">${memoMarkup()}</template></div>`),field:`<div class="mage-field">${field}</div>`,hand,actions:ui.replay||own.length||reserveHand||d.loot?.player===viewer||!controls?'':`<div class="mage-controls">${controls}</div>`}};
 }
 const illustrations=art.create();
 const memoMarkup=()=>`<div class="mage-memo"><div class="mage-memo-order">${illustrations('order')}</div><table class="mage-memo-table"><thead><tr><th></th>${['movement','attack','ultimate'].map(a=>`<th scope="col">${actionIcon(a)}<span>${esc(text('ui.'+a))}</span></th>`).join('')}</tr></thead><tbody>${Object.keys(colors).map(e=>`<tr><th scope="row" style="color:${colors[e]}">${svg(ink[e])}<span>${esc(text('element.'+e))}</span></th>${['movement','attack','ultimate'].map(a=>`<td style="color:${colors[e]}" aria-label="${esc(text('action-help.'+e+'.'+a))}" title="${esc(text('action-help.'+e+'.'+a))}">${svg(actionArt(e,a),'mage-action-diagram').replace('<svg ',`<svg style="color:${colors[e]}" `)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 const coverAsset=root.PlayroomPack?.asset('assets/covers/arena-v8.webp');
 const cover=()=>C.cover(`<image x="6" y="2" width="288" height="172" preserveAspectRatio="xMidYMid meet" href="${esc(coverAsset||'')}"/>`);
 V.register('mage-brawl',render,cover,{illustrations,surfaces:{table:render,player:render}});
})(globalThis);

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("mage-brawl",tutorial(tr));
})(globalThis);
