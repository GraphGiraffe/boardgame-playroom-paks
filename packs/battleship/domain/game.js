(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory;
  root.PlayroomPackDefinitionFactory=factory;
})(globalThis,function(ports,G){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  const event=(name,actor,params={})=>({type:'battleship.'+name,actor,params,visibility:{kind:'public'}});
  function create({playerCount,firstPlayer,preset,rng,options={}}){
    if(playerCount!==2||!G.fleets[preset]||![0,1].includes(firstPlayer))throw Error('BATTLESHIP_OPTIONS_INVALID');
    return {playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,
      data:{announceSinking:options.announceSinking!=='off',ships:[[],[]],shots:[[],[]],marks:[[],[]],sunk:[[],[]],
        phase:'setup',starter:firstPlayer,orientation:[false,false],ready:[false,false]}};
  }
  function validate(position){
    const d=position.data,sizes=G.fleets[position.preset];
    if(!sizes||!Number.isSafeInteger(position.rng)||position.rng<0||position.rng>4294967295||
       !['setup','battle'].includes(d.phase)||![0,1].includes(d.starter)||
       !Array.isArray(d.orientation)||d.orientation.length!==2||!d.orientation.every(v=>typeof v==='boolean')||
       !Array.isArray(d.ready)||d.ready.length!==2||!d.ready.every(v=>typeof v==='boolean')||
       !Array.isArray(d.ships)||d.ships.length!==2||!Array.isArray(d.shots)||d.shots.length!==2)return false;
    for(let p=0;p<2;p++){
      const ships=d.ships[p],remaining=sizes.slice();
      if(!Array.isArray(ships)||ships.length>sizes.length)return false;
      for(const ship of ships){
        const length=ship?.length,at=remaining.indexOf(length);
        if(at<0||!Array.isArray(ship)||!ship.every(cell=>Number.isInteger(cell)&&cell>=0&&cell<100)||
          !ship.every((cell,index)=>index===0||cell-ship[index-1]===ship[1]-ship[0])||
          length>1&&![1,10].includes(ship[1]-ship[0])||
          length>1&&ship[1]-ship[0]!==10&&Math.floor(ship[0]/10)!==Math.floor(ship.at(-1)/10))return false;
        remaining.splice(at,1);
      }
      if(ships.some((ship,index)=>!G.valid(ships.slice(0,index),ship,true))||d.ready[p]&&remaining.length||
         !Array.isArray(d.shots[p])||new Set(d.shots[p].map(x=>x.cell)).size!==d.shots[p].length||
         !d.shots[p].every(x=>x&&Number.isInteger(x.cell)&&x.cell>=0&&x.cell<100&&typeof x.hit==='boolean'))return false;
    }
    return (d.phase==='setup'||d.ready.every(Boolean))&&typeof d.announceSinking==='boolean'&&
      Array.isArray(d.marks)&&d.marks.length===2&&d.marks.every(row=>Array.isArray(row)&&row.every(cell=>Number.isInteger(cell)&&cell>=0&&cell<100))&&
      Array.isArray(d.sunk)&&d.sunk.length===2;
  }
  function actions(position,actor){
    if(position.status!=='playing'||position.turn!==actor)return [];
    const d=position.data;
    if(d.phase==='battle')return Array.from({length:100},(_,cell)=>cell)
      .filter(cell=>!d.shots[actor].some(x=>x.cell===cell)&&!d.marks[actor].includes(cell))
      .map(cell=>({command:{type:'fire',cell},visibility:'public'}));
    if(d.ready[actor])return [];
    const existing=d.ships[actor],remaining=G.fleets[position.preset].slice();
    for(const ship of existing)remaining.splice(remaining.indexOf(ship.length),1);
    const commands=[{type:'auto'},{type:'orient'}];
    if(!remaining.length)commands.push({type:'ready'});
    for(const size of new Set(remaining))for(const p of G.placements(existing,size,true))commands.push({type:'place',size,start:p.start,vertical:p.vertical});
    for(let ship=0;ship<existing.length;ship++){
      commands.push({type:'remove',ship});
      for(const p of G.placements(existing.filter((_,index)=>index!==ship),existing[ship].length,true)){
        if(p.ship.some((cell,index)=>cell!==existing[ship][index]))commands.push({type:'move',ship,start:p.start,vertical:p.vertical});
      }
    }
    // Neither fleet setup choices nor their availability are public information.
    return commands.map(command=>({command,visibility:'private'}));
  }
  function reduce(position,actor,a){
    const next=clone(position),d=next.data,events=[];
    if(d.phase==='setup'){
      if(a.type==='orient')d.orientation[actor]=!d.orientation[actor];
      else if(a.type==='ready'){
        d.ready[actor]=true;events.push(event('ready',actor));
        if(d.ready.every(Boolean)){d.phase='battle';next.turn=d.starter;events.push(event('started',null));}
        else next.turn=1-actor;
      }else{
        if(a.type==='auto')d.ships[actor]=G.autoPlace(next,[],G.fleets[next.preset],true,ports.random);
        if(a.type==='place')d.ships[actor].push(G.cells(a.start,a.size,a.vertical));
        if(a.type==='move')d.ships[actor][a.ship]=G.cells(a.start,d.ships[actor][a.ship].length,a.vertical);
        if(a.type==='remove')d.ships[actor].splice(a.ship,1);
        events.push(event('arranged',actor,{operation:a.type}));
      }
    }else{
      const opponent=1-actor,ship=d.ships[opponent].find(ship=>ship.includes(a.cell)),hit=!!ship;
      d.shots[actor].push({cell:a.cell,hit});ports.random(next);
      const sunk=hit&&ship.every(cell=>d.shots[actor].some(x=>x.cell===cell&&x.hit));
      if(sunk){
        d.sunk[actor].push(ship.slice());
        if(d.announceSinking)d.marks[actor]=[...new Set([...d.marks[actor],...G.halo(ship).filter(cell=>!d.shots[actor].some(x=>x.cell===cell))])];
      }
      events.push(event('fired',actor,{cell:a.cell,hit,sunk:!!(sunk&&d.announceSinking)}));
      if(hit&&d.ships[opponent].flat().every(cell=>d.shots[actor].some(x=>x.cell===cell))){
        next.status='finished';next.winners=[actor];events.push(event('won',actor));
      }else if(next.preset==='classic'||!hit)next.turn=opponent;
    }
    return {position:next,events,turnEnded:position.data.phase==='battle'&&(next.turn!==actor||next.status==='finished')};
  }
  function project(position,viewer){
    const d=clone(position.data),setup=d.phase==='setup',sizes=G.fleets[position.preset];
    d.fleetCounts=d.ships.map((ships,player)=>{
      if(setup&&player!==viewer||!setup&&position.status!=='finished'&&!d.announceSinking&&player!==viewer)return null;
      return [...new Set(sizes)].map(size=>({size,count:sizes.filter(n=>n===size).length-
        (setup?ships.filter(ship=>ship.length===size).length:d.sunk[1-player].filter(ship=>ship.length===size).length)}));
    });
    if(position.status!=='finished'){
      for(let player=0;player<2;player++)if(player!==viewer)d.ships[player]=setup?[]:d.ships[player].map(ship=>ship.map(()=>null));
      if(!d.announceSinking)d.sunk=d.sunk.map((ships,player)=>player===1-viewer?ships:[]);
    }
    return d;
  }
  function bot(projection,actor,commands){
    const ready=commands.find(a=>a.type==='ready'),auto=commands.find(a=>a.type==='auto');
    if(ready||auto)return ready||auto;
    const d=projection.data,shots=d.shots[actor],knownSunk=d.announceSinking?d.sunk[actor]:[];
    const blocked=new Set([...shots.filter(x=>!x.hit).map(x=>x.cell),...d.marks[actor],...knownSunk.flat()]);
    const hits=shots.filter(x=>x.hit&&!knownSunk.flat().includes(x.cell)).map(x=>x.cell),available=new Set(commands.map(a=>a.cell));
    const sizes=G.fleets[projection.preset].slice();
    for(const ship of knownSunk){const index=sizes.indexOf(ship.length);if(index>=0)sizes.splice(index,1);}
    const score=new Map();
    if(hits.length)for(const length of sizes)for(let start=0;start<100;start++)for(const vertical of [false,true]){
      const line=G.cells(start,length,vertical);if(!line||line.some(cell=>blocked.has(cell)))continue;
      const matched=hits.filter(cell=>line.includes(cell));if(!matched.length)continue;
      if(G.halo(line).some(cell=>hits.includes(cell)&&!line.includes(cell)))continue;
      for(const cell of line)if(available.has(cell))score.set(cell,(score.get(cell)||0)+matched.length*matched.length);
    }
    const best=Math.max(0,...score.values()),choices=best?commands.filter(a=>score.get(a.cell)===best):commands;
    return choices[(shots.length+actor)%choices.length];
  }
  function result(position){
    const values=[0,1].map(player=>position.winners.includes(player)?1:0);
    return {winners:position.winners,places:values.map(value=>value?1:2),metrics:[{id:'wins',values},
      {id:'hits',values:position.data.shots.map(shots=>shots.filter(shot=>shot.hit).length)}]};
  }
  return Object.freeze({contractVersion:1,id:'battleship',minPlayers:2,maxPlayers:2,preparing:position=>position.data.phase==='setup',create,validate,actions,reduce,project,bot,result});
});
