// Battleship geometry belongs to the pack, including its ten-column rules.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomBattleshipGeometry=api;
})(globalThis,function(){
  'use strict';const fleets={russian:[4,3,3,2,2,2,1,1,1,1],classic:[5,4,3,3,2]};
 const cells=(start,length,vertical)=>{const r=Math.floor(start/10),c=start%10;if(vertical?r+length>10:c+length>10)return null;return Array.from({length},(_,i)=>start+(vertical?10*i:i));};
 function halo(ship){const out=new Set();for(const n of ship){const r=Math.floor(n/10),c=n%10;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(r+dr>=0&&r+dr<10&&c+dc>=0&&c+dc<10)out.add((r+dr)*10+c+dc);}return [...out];}
 function valid(existing,ship,noTouch){const occupied=new Set(existing.flatMap(x=>x));if(ship.some(n=>occupied.has(n)))return false;if(noTouch)for(const n of ship){const r=Math.floor(n/10),c=n%10;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(r+dr>=0&&r+dr<10&&c+dc>=0&&c+dc<10&&occupied.has((r+dr)*10+c+dc))return false;}return true;}
 function placements(existing,length,noTouch){const blocked=new Set(existing.flatMap(ship=>noTouch?halo(ship):ship));const out=[];for(let start=0;start<100;start++)for(const vertical of [false,true]){if(length===1&&vertical)continue;const ship=cells(start,length,vertical);if(ship&&!ship.some(cell=>blocked.has(cell)))out.push({start,vertical,ship});}return out;}
 function autoPlace(s,existing,sizes,noTouch,random){let result;for(let attempt=0;attempt<200&&!result;attempt++){const list=existing.map(x=>x.slice());let failed=false;for(let i=list.length;i<sizes.length;i++){const possible=placements(list,sizes[i],noTouch);if(!possible.length){failed=true;break;}list.push(possible[Math.floor(random(s)*possible.length)].ship);}if(!failed)result=list;}if(!result)throw Error('FLEET_PLACEMENT_FAILED');return result;}
  return Object.freeze({fleets,cells,halo,valid,placements,autoPlace,columns:10});
});
