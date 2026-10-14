(function(E){
 'use strict';const fleets={russian:[4,3,3,2,2,2,1,1,1,1],classic:[5,4,3,3,2]};
 const cells=(start,length,vertical)=>{const r=Math.floor(start/10),c=start%10;if(vertical?r+length>10:c+length>10)return null;return Array.from({length},(_,i)=>start+(vertical?10*i:i));};
 function halo(ship){const out=new Set();for(const n of ship){const r=Math.floor(n/10),c=n%10;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(r+dr>=0&&r+dr<10&&c+dc>=0&&c+dc<10)out.add((r+dr)*10+c+dc);}return [...out];}
 function valid(existing,ship,noTouch){const occupied=new Set(existing.flatMap(x=>x));if(ship.some(n=>occupied.has(n)))return false;if(noTouch)for(const n of ship){const r=Math.floor(n/10),c=n%10;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(r+dr>=0&&r+dr<10&&c+dc>=0&&c+dc<10&&occupied.has((r+dr)*10+c+dc))return false;}return true;}
 function placements(existing,length,noTouch){const out=[];for(let start=0;start<100;start++)for(const vertical of [false,true]){if(length===1&&vertical)continue;const ship=cells(start,length,vertical);if(ship&&valid(existing,ship,noTouch))out.push({start,vertical,ship});}return out;}
 function autoPlace(s,existing,sizes,noTouch){let result;for(let attempt=0;attempt<200&&!result;attempt++){const list=existing.map(x=>x.slice());let failed=false;for(let i=list.length;i<sizes.length;i++){const possible=placements(list,sizes[i],noTouch);if(!possible.length){failed=true;break;}list.push(possible[Math.floor(E.random(s)*possible.length)].ship);}if(!failed)result=list;}if(!result)throw Error('Не удалось разместить флот');return result;}
 E.register({id:'battleship',version:'0.1.5',stateVersion:3,name:'Морской бой',min:2,max:2,scoreLabel:'победы',description:'Два флота и две проверенные версии правил.',
  result(s){return {label:'Победа',values:s.players.map((_,i)=>s.winner===i?1:0),detailLabel:'Попаданий',details:s.data.shots.map(shots=>shots.filter(shot=>shot.hit).length)};},
  presets:[{id:'russian',label:'Русский · 10 кораблей'},{id:'classic',label:'Пять кораблей · 5/4/3/3/2'}],
  rules:['В русском варианте корабли 4/3/3/2/2/2/1/1/1/1, не соприкасаются даже по диагонали; попадание даёт ещё выстрел.','В варианте пяти кораблей флот 5/4/3/3/2, корабли также не соприкасаются, за ход один выстрел.','Во время подготовки перетаскивайте корабли из счётчиков на поле, поворачивайте, перемещайте или убирайте за поле. Авторасстановка заменяет текущий флот; после расстановки нажмите «Готово». Побеждает первым потопивший все корабли соперника.'],
  create(s,o={}){s.turn=o.resolvedFirstPlayer??0;s.data={announceSinking:o.announceSinking!=='off',ships:[[],[]],shots:[[],[]],marks:[[],[]],sunk:[[],[]],phase:'setup',starter:s.turn,orientation:[false,false],ready:[false,false]};},
  validateState(s){
   const d=s.data,sizes=fleets[s.preset];
   E.assertState(['setup','battle'].includes(d.phase)&&[0,1].includes(d.starter)&&Array.isArray(d.orientation)&&d.orientation.length===2&&d.orientation.every(v=>typeof v==='boolean')&&Array.isArray(d.ready)&&d.ready.length===2&&d.ready.every(v=>typeof v==='boolean'),'этап боя');
   E.assertState(Array.isArray(d.ships)&&d.ships.length===2&&Array.isArray(d.shots)&&d.shots.length===2,'флоты');
   for(let p=0;p<2;p++){
    const ships=d.ships[p],remaining=sizes.slice();
    E.assertState(Array.isArray(ships)&&ships.length<=sizes.length,'корабли');
    for(const ship of ships){
     const n=ship?.length,at=remaining.indexOf(n);
     E.assertState(at>=0&&Array.isArray(ship)&&ship.every(c=>Number.isInteger(c)&&c>=0&&c<100)&&ship.every((c,i)=>i===0||c-ship[i-1]===ship[1]-ship[0])&&(n===1||[1,10].includes(ship[1]-ship[0]))&&(n===1||ship[1]-ship[0]===10||Math.floor(ship[0]/10)===Math.floor(ship.at(-1)/10)),'форма корабля');
     remaining.splice(at,1);
    }
    for(let i=0;i<ships.length;i++)E.assertState(valid(ships.slice(0,i),ships[i],true),'соприкосновение кораблей');
    E.assertState(!d.ready[p]||!remaining.length,'готовность флота');
    E.assertState(Array.isArray(d.shots[p])&&new Set(d.shots[p].map(x=>x.cell)).size===d.shots[p].length&&d.shots[p].every(x=>x&&Number.isInteger(x.cell)&&x.cell>=0&&x.cell<100&&typeof x.hit==='boolean'),'выстрелы');
   }
   E.assertState(d.phase==='setup'||d.ready.every(Boolean),'флоты готовы');
   E.assertState(typeof d.announceSinking==='boolean'&&Array.isArray(d.marks)&&d.marks.length===2&&d.marks.every(row=>Array.isArray(row)&&row.every(c=>Number.isInteger(c)&&c>=0&&c<100))&&Array.isArray(d.sunk)&&d.sunk.length===2,'объявления');
  },
  legal(s,actor){
   const d=s.data;if(d.phase==='battle')return Array.from({length:100},(_,cell)=>cell).filter(cell=>!d.shots[actor].some(x=>x.cell===cell)&&!d.marks[actor].includes(cell)).map(cell=>({type:'fire',cell,label:`Выстрел ${String.fromCharCode(65+cell%10)}${Math.floor(cell/10)+1}`}));
   if(d.ready[actor])return [];
   const existing=d.ships[actor],remaining=fleets[s.preset].slice();for(const ship of existing)remaining.splice(remaining.indexOf(ship.length),1);
   const actions=[{type:'auto',label:'Расставить флот автоматически'},{type:'orient',label:d.orientation[actor]?'Повернуть вертикальный корабль горизонтально':'Повернуть горизонтальный корабль вертикально'}];
   if(!remaining.length)actions.push({type:'ready',label:'Готово · начать бой'});
   for(const size of new Set(remaining))for(const p of placements(existing,size,true))actions.push({type:'place',size,start:p.start,vertical:p.vertical,label:`Корабль ${size} · ${p.vertical?'вертикально':'горизонтально'} ${String.fromCharCode(65+p.start%10)}${Math.floor(p.start/10)+1}`});
   for(let ship=0;ship<existing.length;ship++){
    actions.push({type:'remove',ship,label:`Убрать корабль ${existing[ship].length} с поля`});
    for(const p of placements(existing.filter((_,i)=>i!==ship),existing[ship].length,true))if(p.ship.some((c,i)=>c!==existing[ship][i]))actions.push({type:'move',ship,start:p.start,vertical:p.vertical,label:`Переместить корабль ${existing[ship].length} на ${String.fromCharCode(65+p.start%10)}${Math.floor(p.start/10)+1}`});
   }
   return actions;
  },
  apply(s,actor,a){const d=s.data,sizes=fleets[s.preset];if(d.phase==='setup'){
    if(a.type==='orient'){d.orientation[actor]=!d.orientation[actor];return;}
    if(a.type==='ready'){
     d.ready[actor]=true;E.event(s,`${s.players[actor].name} подготовил флот`,actor,'action');
     if(d.ready.every(Boolean)){d.phase='battle';s.turn=d.starter;E.event(s,'Бой начинается',null,'action',{sound:{id:'sea.start'}});}else s.turn=1-actor;
     return;
    }
    if(a.type==='auto')d.ships[actor]=autoPlace(s,[],sizes,true);
    if(a.type==='place')d.ships[actor].push(cells(a.start,a.size,a.vertical));
    if(a.type==='move')d.ships[actor][a.ship]=cells(a.start,d.ships[actor][a.ship].length,a.vertical);
    if(a.type==='remove')d.ships[actor].splice(a.ship,1);
    E.event(s,`${s.players[actor].name} ${a.type==='remove'?'убрал корабль':a.type==='move'?'переместил корабль':a.type==='auto'?'расставил флот':'разместил корабль'}`,actor,'move');
    return;
   }
   const opponent=1-actor,ship=d.ships[opponent].find(ship=>ship.includes(a.cell)),hit=!!ship;d.shots[actor].push({cell:a.cell,hit});E.random(s);
    const sunk=hit&&ship.every(cell=>d.shots[actor].some(x=>x.cell===cell&&x.hit));
    if(sunk){d.sunk[actor].push(ship.slice());if(d.announceSinking){const area=halo(ship);d.marks[actor]=[...new Set([...d.marks[actor],...area.filter(cell=>!d.shots[actor].some(x=>x.cell===cell))])];}}
    E.event(s,`${s.players[actor].name}: ${String.fromCharCode(65+a.cell%10)}${Math.floor(a.cell/10)+1} — ${sunk&&d.announceSinking?'потоплен':hit?'попадание':'мимо'}`,actor,hit?'attack':'move',{presentation:{type:'fire',cell:a.cell},sound:{id:sunk&&d.announceSinking?'sea.sunk':hit?'sea.hit':'sea.miss'}});
    if(hit&&d.ships[opponent].flat().every(cell=>d.shots[actor].some(x=>x.cell===cell))){E.finish(s,actor,`${s.players[actor].name} потопил весь флот`);return;}if(s.preset==='classic'||!hit)s.turn=opponent;},
  project(out,viewer){
   const d=out.data,setup=d.phase==='setup';
   d.fleetCounts=d.ships.map((ships,p)=>{
    if(setup&&p!==viewer)return null;
    if(!setup&&out.status!=='finished'&&!d.announceSinking&&p!==viewer)return null;
    return [...new Set(fleets[out.preset])].map(size=>({size,count:fleets[out.preset].filter(n=>n===size).length-(setup?ships.filter(ship=>ship.length===size).length:d.sunk[1-p].filter(ship=>ship.length===size).length)}));
   });
   if(out.status==='finished')return;
   for(let p=0;p<2;p++)if(p!==viewer)d.ships[p]=setup?[]:d.ships[p].map(ship=>ship.map(()=>null));
   if(!d.announceSinking)d.sunk=d.sunk.map((ships,p)=>p===1-viewer?ships:[]);
  },
  bot(s,actor,actions){const ready=actions.find(a=>a.type==='ready');if(ready)return ready;const auto=actions.find(a=>a.type==='auto');if(auto)return auto;
   // All targeting uses the shooter's observations, never the opponent's fleet.
   const d=s.data,shots=d.shots[actor],knownSunk=d.announceSinking?d.sunk[actor]:[],blocked=new Set([...shots.filter(x=>!x.hit).map(x=>x.cell),...d.marks[actor],...knownSunk.flat()]),hits=shots.filter(x=>x.hit&&!knownSunk.flat().includes(x.cell)).map(x=>x.cell),available=new Set(actions.map(a=>a.cell));
   let sizes=fleets[s.preset].slice();for(const ship of knownSunk){const i=sizes.indexOf(ship.length);if(i>=0)sizes.splice(i,1);}
   const score=new Map();if(hits.length)for(const length of sizes)for(let start=0;start<100;start++)for(const vertical of [false,true]){const line=cells(start,length,vertical);if(!line||line.some(c=>blocked.has(c)))continue;const matched=hits.filter(c=>line.includes(c));if(!matched.length)continue;
    // Non-touching fleets: a hit next to this hypothetical ship must belong to it.
    if(halo(line).some(c=>hits.includes(c)&&!line.includes(c)))continue;
    for(const c of line)if(available.has(c))score.set(c,(score.get(c)||0)+matched.length*matched.length);
   }
   const best=Math.max(0,...score.values()),choices=best?actions.filter(a=>score.get(a.cell)===best):actions;
   return choices[Math.floor((s.rng/4294967296)*choices.length)];
  }
 });
})(globalThis.TabletopCore);
