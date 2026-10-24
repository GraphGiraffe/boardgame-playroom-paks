(function(root){
 'use strict';
 const source=typeof require==='function'&&!root.PlayroomPack,P=source?require('./presentation/scene.js'):root.PlayroomPackPresentation,V=root.PlayroomViews,H=V.helpers,C=root.PlayroomShared;
 const tr=H.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales),text=(k,params={})=>tr.format(P.message(k,params)),esc=H.esc;
 const colors={air:'#729d98',earth:'#aa844b',water:'#508fa9',fire:'#cb7054'};
 const ink={air:'<path d="M23 39h37c16 0 16-19 4-19-7 0-10 5-10 8M17 51h58c16 0 16 20 4 20-7 0-10-5-10-8M29 64h21c12 0 12 16 2 16" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>',earth:'<path d="m18 68 16-34 21-8 25 21 4 24-42 8Z" fill="currentColor"/><path d="m34 34 11 24 35-11M45 58l-3 21" fill="none" stroke="#fffbed" stroke-width="4"/>',water:'<path d="M50 17C41 31 25 47 25 62a25 25 0 0 0 50 0C75 47 59 31 50 17Z" fill="currentColor"/><path d="M36 58q-2 13 10 17" fill="none" stroke="#fffbed" stroke-width="5" stroke-linecap="round"/>',fire:'<path d="M52 15c6 24 25 28 25 47a27 27 0 0 1-54 0c0-10 5-21 14-29-1 12 1 18 7 21 8-11 9-22 8-39Z" fill="currentColor"/><path d="M52 51c0 12-10 17-10 24a10 10 0 0 0 20 0c0-8-8-15-10-24Z" fill="#fffbed"/>'};
 // Flat paving is shared by solid floor, missing stones and stake traps.
 const paving=['M3 3H35L33 30H3Z','M39 3H73L75 30H37Z','M77 3H97V30H79Z','M3 34H20L22 64H3Z','M24 34H62L60 64H26Z','M66 34H97V64H64Z','M3 68H42L40 97H3Z','M46 68H76L78 97H44Z','M80 68H97V97H82Z'];
 const stoneFloor=(missing=[])=>'<rect width="100" height="100" fill="'+(missing.length?'#474c42':'#aca98e')+'"/>'+paving.map((d,i)=>missing.includes(i)?'':`<path d="${d}" fill="${['#ddd9c1','#cbc9b0','#e6dfc8'][i%3]}" stroke="#efead6" stroke-width="1.5" stroke-linejoin="round"/>`).join('');
 const stakes=[[26,29],[73,29],[26,75],[73,75]].map(([x,y])=>`<g transform="translate(${x} ${y})"><ellipse cy="6" rx="13" ry="10" fill="#625a46"/><path d="M-9 9 1-17 11 9Z" fill="#9b714b" stroke="#725337" stroke-width="1.5" stroke-linejoin="round"/><path d="M1-17 2 9H-9Z" fill="#d8ba84"/><path d="m1-17-3 8h6Z" fill="#f3dfb3"/></g>`).join('');
 // Other terrains retain their accepted illustrations.
 const terrain={
  ground:stoneFloor(),
  base:stoneFloor()+'<circle cx="50" cy="50" r="42" fill="#c2c0a7" stroke="#8c907b" stroke-width="3"/><circle cx="50" cy="50" r="37" fill="none" stroke="#eeead5" stroke-width="2"/><path d="M50 8V20M50 80V92M8 50H20M80 50H92M20 20l9 9m42 42 9 9M20 80l9-9m42-42 9-9" stroke="#8c907b" stroke-width="2"/><circle cx="50" cy="50" r="29" data-base-color fill="color-mix(in srgb,var(--mage-base-color,#b6b99a) 45%,#ccc9b4)" stroke="#8c907b" stroke-width="2"/><circle cx="50" cy="50" r="13" fill="#fffef8"/>',
  wall:stoneFloor()+'<path d="M14 14H98V98H14Z" fill="#53685d" opacity=".3"/><path d="M7 7H90V90H7Z" fill="#53685d"/><path d="M7 7H90L81 19H19Z" fill="#8b9d80"/><path d="M7 7 19 19V81L7 90Z" fill="#536b55"/><path d="M90 7V90L81 81V19Z" fill="#53685d"/><path d="M7 90 19 81H81L90 90Z" fill="#3b5145"/><path d="M19 19H81V81H19Z" fill="#526756"/><g stroke-linejoin="round" stroke-linecap="round"><path d="M19 19H29L24 26H19ZM71 19H81V28L75 25ZM19 47 27 54 24 65 19 68ZM19 74 27 81H19ZM74 75 81 70V81H70Z" fill="#344d3e"/><path d="M27 29 36 36 34 45m2-9 8-3 M26 55 34 52 41 56 M75 75 67 68 65 60m2 8-8 3 M72 26 66 33 68 40" fill="none" stroke="#293f35" stroke-width="1.45"/><path d="M32 25H66M29 32V43M34 75H66" fill="none" stroke="#8b9d80" stroke-width="1.4"/></g><path d="M7 7H90V90H7Z M19 19H81V81H19Z M7 7 19 19M90 7 81 19M90 90 81 81M7 90 19 81" fill="none" stroke="#293f35" stroke-width="1.8" stroke-linejoin="round"/>',
  spikes:stoneFloor()+stakes,
  falling_floor:stoneFloor([1,4,7])+'<path d="m39 4 7 6-4 14-4 5m22 7-5 10 4 8-6 9m-7 6 6 9-4 18" fill="none" stroke="#8b8c73" stroke-width="2"/><path d="m47 17 8 3-5 7Zm-4 32 7 5-6 4m14 24 9 5-5 7Z" fill="#aaa88c"/>',
  puddle:'<path d="M9 51Q6 25 33 30T78 27Q99 36 85 53T75 83Q42 95 18 77T9 51" fill="#79afb8"/><path d="M17 49Q15 35 36 39T78 36Q88 39 78 51T68 74Q41 83 24 70T17 49" fill="#a6d4d4"/><path d="M27 53q18-8 39-4M35 66q11 4 23 0" fill="none" stroke="#e5f3e6" stroke-width="3" stroke-linecap="round"/><path d="m12 62-2-18m5 15 7-20m59 30 5-16" stroke="#6c916e" stroke-width="3"/>',
  desert:'<circle cx="75" cy="25" r="11" fill="#f1c875"/><path d="M0 71Q26 27 60 52T100 44V100H0Z" fill="#d7b978"/><path d="M0 89Q29 56 58 65T100 54V100H0Z" fill="#eace91"/><path d="M3 89Q36 70 62 75M51 55q14 3 22 0" fill="none" stroke="#b89a64" stroke-width="2"/>',
  air_island:'<path d="M9 68q-9-15 10-17 1-16 18-10 13-15 26 0 16-10 23 5 20 1 12 18Z" fill="#f7f9ec"/><path d="m23 53 27 38 27-38Z" fill="#849d88"/><path d="m50 91 0-38h27Z" fill="#617f70"/><ellipse cx="50" cy="50" rx="30" ry="11" fill="#bed0a9"/><path d="M11 76q15 6 28 0m30-45q14-5 25 0" fill="none" stroke="#b2d2c9" stroke-width="3" stroke-linecap="round"/>',
  forest:'<ellipse cx="50" cy="84" rx="42" ry="10" fill="#9eb58a"/><path d="M27 46v40M71 42v42M49 59v31" stroke="#8c7655" stroke-width="5"/><path d="m27 17-17 30h9L7 65h40L35 47h10Zm44-6L55 39h8L50 63h42L80 39h8Z" fill="#648b69"/><path d="m49 34-20 34h10L26 85h46L58 68h11Z" fill="#7fa278"/><path d="m27 17 0 43-15 5m59-54v46l-17 6M49 34v42L31 85" fill="#9fbc8b"/>'
 };
 const svg=(body,cls='')=>`<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${body}</svg>`;
 const terrainBadgeColors={fire:H.playerColor(1),earth:H.playerColor(5),water:H.playerColor(2),air:H.playerColor(6)};
 const terrainBonuses={puddle:['water','fire'],desert:['earth','water'],air_island:['air','earth'],forest:['fire','air']};
 const terrainArt=t=>{
  const bonus=terrainBonuses[t],badges=bonus?`<g class="mage-terrain-bonuses" stroke-linejoin="round"><g transform="translate(.5 24.5) scale(.75)"><rect x="2" y="74" width="47" height="24" rx="5" fill="#fffbed" fill-opacity=".91"/><g fill="${terrainBadgeColors[bonus[0]]}" stroke="${terrainBadgeColors[bonus[0]]}"><path d="m9 88 11-11 4-1-1 4-11 11Zm-3-4 10 10m-9-1 3-3" stroke-width="2.5"/><text x="26" y="92" stroke="none" font-size="17" font-weight="800">+1</text></g></g><g transform="translate(24.5 24.5) scale(.75)"><rect x="73" y="74" width="25" height="24" rx="5" fill="#fffbed" fill-opacity=".91"/><path d="M78 79Q86 76 94 79V85Q93 91 86 95 79 91 78 85Z" fill="${terrainBadgeColors[bonus[1]]}" stroke="${terrainBadgeColors[bonus[1]]}" stroke-width="1.5"/></g></g>`:'';
  const art=terrain[t]||'';
  return svg((bonus?`<g transform="translate(0 -6)">${art}</g>`:art)+badges,'mage-terrain');
 };
 const elementArt=e=>svg(ink[e]);
 // Each face illustrates only the selected action, in the same orientation as the arena.
 const arrow=(x,y,dx,dy)=>`<path d="M${x} ${y}l${dx} ${dy}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="m${x+dx-5} ${y+dy+6} 5-6 5 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" transform="rotate(${Math.atan2(dy,dx)*180/Math.PI+90} ${x+dx} ${y+dy})"/>`;
 function actionArt(e,action,direction=0){
  const cell=(x,y,value='')=>`<rect x="${x-10}" y="${y-10}" width="20" height="20" rx="3" fill="currentColor" fill-opacity=".13" stroke="currentColor" stroke-width="2"/>${value?`<text transform="rotate(${-direction*90} ${x} ${y})" x="${x}" y="${y+4}" text-anchor="middle" font-size="12" font-weight="800" fill="currentColor">${value}</text>`:''}`;
  const actor='<circle cx="50" cy="73" r="9" fill="currentColor"/><path d="m46 71 4-4 4 4" fill="none" stroke="#fffbed" stroke-width="2"/>';
  if(action==='movement'){
   if(e==='earth')return actor+'<path d="M23 52Q50 12 77 52L72 60Q50 28 28 60Z" fill="currentColor"/>'+arrow(50,27,0,18)+arrow(20,37,12,12)+arrow(80,37,-12,12);
   if(e==='air')return actor+cell(76,47)+arrow(55,67,16,-16);
   if(e==='water')return actor+cell(50,45)+arrow(50,67,0,-14)+'<circle cx="50" cy="45" r="5" fill="currentColor"/>'+arrow(50,38,0,-20);
   return actor+cell(50,46)+cell(50,20)+'<path d="M38 72Q15 44 39 21" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>'+arrow(33,25,8,-5);
  }
  if(e==='air'){
   if(action==='ultimate')return actor.replaceAll('73','50').replaceAll('71','48').replaceAll('67','44')+[[25,25,-10,-10],[75,25,10,-10],[25,75,-10,10],[75,75,10,10]].map(([x,y,dx,dy])=>cell(x,y)+arrow(x,y,dx,dy)).join('');
   return actor+[[24,70],[50,45],[76,70]].map(([x,y])=>cell(x,y)+arrow(x,y-4,0,-18)).join('');
  }
  if(e==='earth')return actor+cell(50,action==='ultimate'?22:40,'2')+(action==='ultimate'?'<path d="M50 59V34" stroke="currentColor" stroke-width="4" stroke-dasharray="4 4"/>':arrow(50,61,0,-10));
  if(e==='water')return actor+cell(50,44,'1')+cell(50,19,'1')+arrow(50,61,0,-6)+(action==='ultimate'?'<path d="M75 65v16M67 73h16" stroke="currentColor" stroke-width="5"/>':'');
  if(action==='ultimate')return `<g transform="translate(0 10)">${actor}</g>`+[[50,36],[27,36],[73,36],[50,13],[50,59]].map(([x,y])=>cell(x,y,'1')).join('')+'<path d="M50 72V70" stroke="currentColor" stroke-width="4"/>';
  return actor+cell(50,24,'1')+'<path d="M50 59V37" stroke="currentColor" stroke-width="4" stroke-dasharray="4 4"/>'+(action==='ultimate'?[[25,24],[75,24],[50,49]].map(([x,y])=>cell(x,y,'1')).join(''):'');
 }
 // Illustrations face north; rotating the hand rotates the whole spell painting.
 function illustration(e,action){
  const shield='<path d="M18 46Q50 17 82 46L75 71Q50 89 25 71Z" fill="#9a8357"/><path d="M18 46Q50 17 82 46L73 52Q50 32 27 52Z" fill="#e6c88a"/><path d="M27 52 33 68 46 74V44Zm46 0-6 16-13 6V44Z" fill="#bc9d65"/>';
  const fist='<path d="M27 76V45Q27 36 35 36H40V26Q40 19 48 19H55Q62 19 62 27V30H69Q77 30 77 38V43H82Q90 43 90 51V70L72 84H43Z" fill="#ab895b"/><path d="M40 36V56M62 30V54M77 43V61M28 60h17l13 12" fill="none" stroke="#6e6248" stroke-width="3"/><path d="M43 26h12v10H43Zm-12 17h6v9h-6m34-16h7v9h-7" fill="#e5cc91"/>';
  const tornado=(x,y,k=1)=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M-23-25Q8-42 26-25T-17-9Q20-22 22-7T-12 8Q15 0 11 13T-3 29" fill="#8fbcb4" stroke="#5e8f8a" stroke-width="2"/><path d="M-18-24Q4-32 22-25M-14-8Q3-14 18-8M-8 8q6-3 15 0" fill="none" stroke="#e7f2e7" stroke-width="4" stroke-linecap="round"/></g>`;
  if(e==='earth')return action==='movement'?shield:`<path d="m25 85-8-11 10-2-8-10m51-44 6-8 3 9m10 14 8-2-4 9" fill="none" stroke="#d5b779" stroke-width="3"/>${action==='ultimate'?'<path d="M47 82V9m-12 9L47 7l13 12" stroke="#d8c28c" stroke-width="8" fill="none" stroke-linecap="round"/>':''}<g transform="translate(-6 -2)">${fist}</g>`;
  if(e==='air')return action==='movement'?'<path d="M11 83Q27 44 74 19L69 35Q45 46 39 60Q65 47 87 50Q65 61 49 76Q27 84 11 83Z" fill="#88b8b1"/><path d="M17 76Q32 50 73 27M33 74q22-18 43-18" fill="none" stroke="#e6f4ed" stroke-width="4" stroke-linecap="round"/><path d="M52 39Q63 8 82 17T81 40Q71 43 73 34" fill="none" stroke="#5e9695" stroke-width="3" stroke-linecap="round"/>':(action==='ultimate'?tornado(25,35,.6)+tornado(76,35,.6)+tornado(26,78,.6)+tornado(76,78,.6):tornado(24,55,.58)+tornado(76,55,.58)+tornado(50,44,.9));
  if(e==='water')return action==='movement'?'<path d="M9 79Q31 66 42 32 57 7 76 23 87 37 74 48 63 51 64 39 62 30 56 38 53 61 91 72L87 84Z" fill="#649fae"/><path d="M17 78q30-10 38-42 6-13 15-6M39 79q18-20 37-9" fill="none" stroke="#d7efeb" stroke-width="5" stroke-linecap="round"/><path d="M27 64q-16-4-13-14m66 8q12-11 10-19" fill="none" stroke="#91c5cd" stroke-width="3"/>':'<path d="M29 91Q54 53 39 27L31 9Q56 22 59 44 71 23 75 16 82 52 61 88Z" fill="#5698b0"/><path d="M40 86Q62 54 48 24M54 85Q76 46 73 29" fill="none" stroke="#c8ebe9" stroke-width="5" stroke-linecap="round"/><path d="m28 19-8-9m47 2 3-8m12 25 10-4" stroke="#8cc4d0" stroke-width="4" stroke-linecap="round"/>'+(action==='ultimate'?'<circle cx="24" cy="66" r="12" fill="#b9d6af"/><path d="M24 59v14m-7-7h14" stroke="#fffbed" stroke-width="3"/>':'');
  // The rounded head leads north; long forked tails stay behind it.
  const fireball='<path d="M32 40 23 91 43 72 51 96 64 68 82 86 70 39Z" fill="#e6a44e"/><path d="M39 43 33 80 49 64 53 83 63 54Z" fill="#cc6c48"/><circle cx="51" cy="32" r="24" fill="#cb6042"/><path d="M40 17Q55 8 67 26 75 44 57 49 39 53 33 37 28 25 40 17Z" fill="#efad58"/><path d="M44 19Q61 13 65 28 67 40 52 43 39 42 38 31 36 24 44 19Z" fill="#fff0b1"/><path d="M21 67 17 83m66-27 4 19" stroke="#dfa254" stroke-width="3" stroke-linecap="round"/>';
  if(action==='movement')return '<path d="M27 87Q5 59 18 33 24 20 36 17" fill="none" stroke="#e4b36b" stroke-width="5" stroke-linecap="round"/><path d="M23 87 17 69 30 76 27 57Q46 68 42 81L49 91 34 85 30 94Z" fill="#e7a347"/><path d="m27 82-2-10 10 9-3 6Z" fill="#fff0b1"/><path d="m49 48-5 17 12 15 7-5-10-15 11-13m1-7 5 14 14 5-3 8-21-7-8-17" fill="#9c674e"/><path d="M47 31Q59 27 68 38L61 54Q47 57 33 65L40 45 31 43 38 35Z" fill="#cb6042"/><path d="m47 34-6 18 15-9 7-9Z" fill="#efad58"/><circle cx="59" cy="21" r="10" fill="#9c674e"/><path d="M51 17q8-8 16 2l-2 5H53Z" fill="#f3d89a"/><path d="m64 36 12-10-2-12" fill="none" stroke="#9c674e" stroke-width="7" stroke-linecap="round"/>';
  return (action==='ultimate'?'<path d="m17 28-9-3m76 2 9-4M18 48l-9 6m75-8 9 6" fill="none" stroke="#e4a756" stroke-width="4" stroke-linecap="round"/>':'')+fireball;
 }
 const card=(e,action)=>root.PlayroomGameComponents.cardFrame(svg(`<rect width="100" height="100" rx="10" fill="#fff9e9"/><circle cx="50" cy="53" r="42" fill="${colors[e]}" opacity=".11"/><g class="mage-spell-paint">${illustration(e,action)}</g>`,'mage-spell-art'),{shape:'square'});
 const ultimateToken=()=>root.PlayroomGameComponents.pieceTypes.badge.render({id:'ultimate',kind:'points',value:1,label:text('ui.ultimate'),display:{icon:'crown',capacity:1}});
 const actionIcon=value=>value==='ultimate'?ultimateToken():H.icon(value==='movement'?'arrow':'sword');
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
   return (fx.projectile?[fx.projectile.end,...fx.cells.slice(1)]:fx.cells.length?fx.cells:[fx.aim||fx.origin]).map(q=>{
    const tx=q[1]*100+50,ty=q[0]*100+50,dist=Math.hypot(tx-x,ty-y),angle=Math.atan2(ty-y,tx-x)*180/Math.PI;
    const impact=fx.projectile?.miss?'':`<circle class="mage-impact" cx="${tx}" cy="${ty}" r="29"/>`;
    if(fx.element==='water')return `<g class="mage-attack-water"><path class="mage-jet" pathLength="1" d="M${x} ${y}Q${(x+tx)/2+12} ${(y+ty)/2-12} ${tx} ${ty}"/><path class="mage-jet mage-jet-light" pathLength="1" d="M${x} ${y}Q${(x+tx)/2-7} ${(y+ty)/2+7} ${tx} ${ty}"/>${impact}</g>`;
    if(fx.element==='air')return `<g class="mage-attack-air"><path class="mage-gust" pathLength="1" d="M${x} ${y}L${tx} ${ty}"/><g transform="translate(${tx} ${ty}) rotate(${fx.direction*90})"><g class="mage-tornado"><path d="M-27-23Q32-38 29-21T-24-7Q26-20 22-3T-17 9Q15 1 13 15T-5 26"/><path d="m-14-30 14-15 14 15"/></g></g></g>`;
    const art=fx.element==='earth'?'<path d="M-25 19V-12Q-25-20-17-20H-9V-29Q-9-36-1-36H6Q13-36 13-29V-26H23Q31-26 31-18V-8H37Q45-8 45 0V20L29 32H-9Z"/><path d="M-9-20V2M13-26V1M31-8V10M-25 7H-6L4 18" class="mage-fist-lines"/>':'<path d="M-6-17Q-32-22-54-6L-29-3-58 15Q-29 12-6 20Z" fill="#efab55"/><circle r="23" fill="#cb563b"/><path d="M9-15Q25 10 3 17Q-13 17-11 4L-2-2 0 8Q9 2 9-15Z" fill="#ffe8a0"/>';
    return `<g class="mage-attack-${fx.element}" transform="translate(${x} ${y}) rotate(${angle})"><g class="mage-projectile" style="--flight:${dist}px">${art}</g></g>${impact}`;
   }).join('');
  }
  function board(shown,interactive=!ui.replay){
   const inset=shown.phase==='shrink'?Math.max(0,shown.inset-1):shown.inset||0,columns=d.size-2*inset;
   const occupants=new Map(shown.players.flatMap((p,i)=>p.pos?[[key(p.pos),i]]:[])),fx=shown.effect,spellEffects=shown.effects||(fx?[fx]:[]);
   const cells=shown.board.map((tile,index)=>{
    const pos=[Math.floor(index/d.size),index%d.size];if(pos.some(v=>v<inset||v>=d.size-inset))return '';
    const basePlayer=d.startingBases?.findIndex(q=>key(q)===key(pos))??-1,id=occupants.get(key(pos)),respawn=interactive&&actions.find(c=>c.type==='respawn'&&key(c.pos)===key(pos)),label=text('tile.'+(tile||'void')),revealed=shown.plans?.[id];
    const planLabel=revealed?text('ui.'+revealed.action)+(shown.phase==='reveal-actions'?'':' · '+text('element.'+revealed.element)+' · '+text('ui.direction.'+revealed.direction)):'';
    return `<button type="button" role="gridcell" style="--mage-base-color:${basePlayer>=0?H.playerColor(basePlayer):'#b6b99a'};--mage-selected:${colors[marks.has(key(pos))?element:first?.element]||colors.air}" class="mage-cell tile-${tile||'void'}${respawn?' is-playable':''}${interactive&&(marks.has(key(pos))||fixedMarks.has(key(pos)))?' mage-preview':''}${shown.shrink&&pos.some(v=>v===shown.inset||v===d.size-shown.inset-1)?' mage-risk':''}${fx?.actor===id?' mage-acting':''}" ${respawn?H.actionAttr(respawn):'disabled'} data-tooltip="${esc(text('tile-help.'+(tile||'void')))}" title="${esc(label)}" aria-label="${esc(label)}${id!==undefined?' · '+esc(s.players[id].name)+(planLabel?' · '+esc(planLabel):''):''}">${terrainArt(tile)}</button>`;
   }).join('');
   const pieces=shown.players.map((p,id)=>{
    const moves=shown.motions?.filter(m=>m.player===id)||[],motion=moves.at(-1),out=shown.outcomes?.find(o=>o.player===id),pos=p.pos||out?.at||motion?.to;
    if(!pos)return '';
    const myChoice=interactive&&id===viewer&&d.phase==='planning'&&!!element,health=P.healthMetric(p,d.config);
    const old=moves[0]?.from,revealed=shown.plans?.[id],state=feedback(shown,id),displayPos=pos.map(v=>Math.max(-.2,Math.min(columns-.8,v-inset)));
    return `<div class="mage-piece${old?' mage-moving':''}" data-mage-player="${id}" style="--col:${displayPos[1]};--row:${displayPos[0]};--move-col:${old?old[1]-inset-displayPos[1]:0};--move-row:${old?old[0]-inset-displayPos[0]:0}">${myChoice?`<span class="mage-facing" style="--mage-direction:${directionAngle(element,action,direction)}deg" aria-hidden="true">${svg('<path d="m50 4 12 19H38Z" fill="var(--mage-selected)" stroke="#fffbed" stroke-width="2" stroke-linejoin="round"/>')}</span>`:''}<span class="mage-token${id===viewer&&!ui.replay?' is-selected':''}${myChoice?' mage-selected-token':''}" data-public-feedback="${state}" style="--mage-color:${H.playerColor(id)}" aria-label="${esc(s.players[id].name)}">${shown.shields?.[id]!==undefined?`<span class="mage-shield" style="transform:rotate(${shown.shields[id]*90}deg)">${svg('<path d="M12 38Q50 0 88 38" fill="none" stroke="#fffbed" stroke-width="9" stroke-linecap="round"/>')}</span>`:''}${p.ultimate?`<span class="mage-ultimate">${ultimateToken()}</span>`:''}${revealed?`<span class="mage-revealed">${actionIcon(revealed.action)}</span>`:''}${C.pieceIndicators({value:health.value,capacity:health.display.capacity,label:tr.format(health.label),className:'mage-token-health'})}</span></div>`;
   }).join('');
   const trails=(shown.motions||[]).map(m=>`<path class="mage-trail" pathLength="1" style="color:${colors[m.element]}" d="M${m.from[1]*100+50} ${m.from[0]*100+50}L${m.to[1]*100+50} ${m.to[0]*100+50}"/>`).join('');
   const effects=`<svg class="mage-effects mage-routes" viewBox="${inset*100} ${inset*100} ${columns*100} ${columns*100}" aria-hidden="true">${trails}</svg><svg class="mage-effects mage-attacks" viewBox="${inset*100} ${inset*100} ${columns*100} ${columns*100}" aria-hidden="true" style="color:${colors[fx?.element]||'#fffbed'}">${spellEffects.map(f=>`<g style="color:${colors[f.element]}">${attackArt(f)}</g>`).join('')}</svg>`;
   return `<div class="mage-grid" role="grid" aria-label="${esc(text('ui.arena'))}" style="--mage-columns:${columns};--mage-selected:${colors[element]||colors.air}">${cells}${effects}${interactive&&double?planGhosts(inset,columns):''}<div class="mage-pieces">${pieces}</div></div>`;
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
  const help=button(text('ui.card-help'),'data-command="card-help"','help');
  const rotate=delta=>H.button({variant:'outline',className:'mage-rotate',label:'',icon:'undo',ariaLabel:text(delta<0?'ui.rotate-left':'ui.rotate-right'),attrs:`data-view-layout="stable" data-view-key="mageDirection" data-view-value="${rotation+delta}"`,disabled:!!accepted});
  const slider=mine?.pos&&d.phase==='planning'?`<div class="shared-board-tabs mage-action-switch">${H.components.actionSelector({key:'mageAction',label:text('ui.action'),value:action,disabled:accepted,stable:true,choices:types.map(value=>({value,label:text('ui.'+value),html:actionIcon(value),disabled:blockedType(value),marker:first&&d.config?.differentActionTypes&&first.action===value?'1':null}))})}</div>`:'';
  const commit=accepted?actions.find(c=>c.type==='unready'):choice;
  const reset=double?H.button({label:'',icon:'undo',ariaLabel:text('ui.reset-plan'),attrs:H.actionAttr({type:'unready'}),variant:'outline',className:'mage-reset-plan',disabled:!(first||accepted)||d.phase!=='planning'}):'';
  const controls=mine&&d.phase==='planning'&&mine.pos?H.button({label:'',icon:'check',ariaLabel:double?text(first?'ui.second-action':'ui.first-action'):text('actions.'+(accepted?'unready':'plan')),attrs:commit?H.actionAttr(commit):'',disabled:!commit,variant:'outline',active:!!accepted,className:'mage-ready'}):'';
  let hand=!ui.replay&&own.length?`<div class="mage-hand"><div class="mage-hand-toolbar">${reset}${slider}<span class="mage-controls">${controls}${help}</span></div><div class="mage-hand-row">${rotate(-1)}${H.hand(own.map((c,i)=>({e:c.element,i})).sort((a,b)=>(b.i===lockedIndex)-(a.i===lockedIndex)).map(({e,i})=>{const locked=i===lockedIndex,cardAction=locked?first.action:action,cardDirectionValue=locked?first.direction:direction,cardRotation=locked?first.direction:visualDirection;return {id:cardId(i),selected:i===selectedIndex,locked,html:`<button class="hand-card mage-card${!accepted&&!locked?' is-playable':''}${i===selectedIndex||locked?' selected is-selected':''}${locked?' mage-plan-locked':''}" type="button" data-piece-type="card-deck" data-card-shape="square" data-mage-action="${cardAction}" style="--mage-direction:${cardRotation*90}deg" data-entity="${esc(H.components.entityKey({namespace:'card',id:cardId(i)}))}" data-view-layout="stable" data-view-key="mageCardId" data-view-value="${cardId(i)}" data-tooltip="${esc(text('element-help.'+e))}" ${accepted||locked?'disabled':''} aria-label="${esc(text('element.'+e)+' · '+text('ui.'+cardAction)+' · '+text('ui.direction.'+cardDirectionValue))}">${card(e,cardAction)}${cardDirection(e,cardAction,cardDirectionValue)}${locked?'<span class="mage-plan-order">1</span>':''}<template data-card-help-art>${svg(`<g transform="rotate(${cardDirectionValue*90} 50 50)">${actionArt(e,cardAction,cardDirectionValue)}</g>`,'mage-action-diagram')}</template></button>`};}),own.length,text('ui.'+action),'',{layout:'overlap'})}${rotate(1)}</div></div>`:'';
  if(!ui.replay&&d.loot?.player===viewer)hand=`<div class="mage-loot-hand">${H.button({label:text('ui.loot-from',{name:s.players[d.loot.victim].name}),variant:'outline',attrs:`data-player-target="${d.loot.victim}" aria-haspopup="dialog" aria-expanded="false"`})}</div>`;
  function playerContent(shown,live=false){
   const scene={...s.scene,players:(s.scene?.players||[]).map(p=>{const v=shown.players[p.player];return {...p,handCount:v.maxHand,metrics:P.playerMetrics(v,d.config).map(metric=>({...metric,label:tr.format(metric.label)}))};})};
   return H.playerContent({...s,data:shown,scene},viewer,null,{inactive:i=>shown.players[i].lives===0,ready:i=>live?d.window?.ready.includes(i):!!shown.ready?.includes(i),decisionPlayer:i=>!ui.replay&&live&&ui.hotseat&&!s.players[i].bot&&d.window?.participants.includes(i)?i:null}).map(content=>({...content,orderPosition:false,showFirstPlayer:false,showSelfLabel:false,headingCounters:content.counters.filter(c=>['lives','health'].includes(c.id)).map(c=>c.id)}));
  }
  const panelMarkup=(shown,live=false)=>playerContent(shown,live).map((content,i)=>H.playerPanel({...s,turn:live&&d.phase!=='planning'?s.turn:-1},i,viewer,content,live?actions:[]).replace('<article ',`<article data-public-feedback="${feedback(shown,i)}" `)).join('');
  const plan=s.scene.plan;
  const frames=plan.scenes.slice(0,plan.final).map(scene=>{
   const shown=scene.state,label=scene.kind==='start'?text('phase.start'):(double?text('ui.action-number',{number:scene.step+1})+' · ':'')+text('phase.'+scene.phase);
   if(scene.kind==='reveal'){
    const reveals=scene.effects.map(f=>`<div class="mage-phase-player"><strong style="color:${H.playerColor(f.actor)}">${esc(s.players[f.actor].name)}</strong><div class="mage-phase-card" style="--mage-direction:${f.direction*90}deg">${card(f.element,f.action)}${cardDirection(f.element,f.action,f.direction)}</div><span>${esc(text('ui.'+f.action))}</span></div>`).join('');
    return {label,markup:board(shown,false)+`<div class="mage-phase-reveal" role="status"><strong>${esc(label)}</strong><div class="mage-phase-cards">${reveals}</div></div>`,players:panelMarkup(shown),pack:'mage-brawl',sound:'mage.reveal'};
   }
   const effects=scene.effects||[];
   return {label,markup:board(shown,false),players:panelMarkup(shown),pack:'mage-brawl',sound:effects.length?(effects[0].action==='movement'?(effects[0].element==='earth'?'mage.shield':'mage.move'):'mage.'+effects[0].element):scene.phase==='shrink'?'mage.fall':''};
  });
  const field=root.PlayroomGameComponents.publicFrames({plan,frames,live:board(d),livePlayers:panelMarkup(d,true),controls:false,label:text(d.phase==='loot'?'ui.loot':d.phase==='respawn'?'ui.respawn':'ui.plan'),playLabel:text('ui.replay'),skipLabel:text('ui.live'),speedLabel:text('ui.speed')});
  const players=playerContent(d.frames?.[0]||d,!d.frames?.length);
  return {api:3,family:'board',showTurn:false,className:'mage-scene'+(frames.length?' is-public-playback':''),fieldSizing:'scroll',layout:{focus:'field',wideHand:true},playerContent:players,elements:{field:`<div class="mage-field">${field}</div>`,hand,actions:ui.replay||own.length||d.loot?.player===viewer?'':`<div class="mage-controls">${controls}</div>`}};
 }
 const coverAsset=root.PlayroomPack?.asset('assets/covers/arena-v8.webp');
 const cover=()=>C.cover(`<image x="6" y="2" width="288" height="172" preserveAspectRatio="xMidYMid meet" href="${esc(coverAsset||'')}"/>`);
 V.register('mage-brawl',render,cover,{surfaces:{table:render,player:render}});
})(globalThis);
