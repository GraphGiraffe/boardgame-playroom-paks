(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomLudoBoard=api;})(globalThis,function(){
 'use strict';const starts=[0,13,26,39],safe=new Set([...starts,...starts.map(n=>(n+8)%52)]);
 const home=row=>row.every(cell=>cell===57),team=player=>player%2,partner=player=>(player+2)%4;
 const globalCell=(owner,progress)=>(starts[owner]+progress)%52;
 const owners=(position,actor)=>position.preset==='teams'&&home(position.data.pawns[actor])?[partner(actor)]:[actor];
 const stranded=(position,actor)=>owners(position,actor).every(player=>position.data.pawns[player].every(n=>n<0||n===57));
 function destination(position,action){
  const d=position.data,from=d.pawns[action.owner][action.pawn],to=from<0?0:from+d.dice[action.dieIndex],captured=[];
  if(to<52&&!safe.has(globalCell(action.owner,to))){const cell=globalCell(action.owner,to);
   for(let player=0;player<d.pawns.length;player++)if(player!==action.owner&&!(position.preset==='teams'&&team(player)===team(action.owner)))
    for(let pawn=0;pawn<4;pawn++)if(d.pawns[player][pawn]>=0&&d.pawns[player][pawn]<52&&globalCell(player,d.pawns[player][pawn])===cell)
     captured.push({owner:player,pawn,from:d.pawns[player][pawn]});
  }
  return {from,to,captured};
 }
 function moves(position,actor){const d=position.data;if(d.phase!=='move')return [];const commands=[];
  d.dice.forEach((die,dieIndex)=>{if(d.used[dieIndex])return;for(const owner of owners(position,actor))for(let pawn=0;pawn<4;pawn++){
   const from=d.pawns[owner][pawn],exit=from<0&&(die===6||d.guarantee),to=exit?0:from>=0&&from<57&&from+die<=57?from+die:null;
   if(to!==null)commands.push({type:'move',owner,pawn,dieIndex});
  }});return commands;
 }
 return Object.freeze({starts,home,team,partner,globalCell,owners,stranded,moves,destination});
});
