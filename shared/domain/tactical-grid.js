// Pure square-grid geometry and ordered displacement; no game or rendering knowledge.
(function(r,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;r.PlayroomTacticalGrid=a;})(globalThis,function(){
 const directions=[[ -1,0],[0,1],[1,0],[0,-1]],add=(a,b)=>[a[0]+b[0],a[1]+b[1]],key=p=>p.join(','),same=(a,b)=>!!a&&!!b&&a[0]===b[0]&&a[1]===b[1],inside=(p,size)=>!!p&&p.every(n=>Number.isInteger(n)&&n>=0&&n<size);
 const rotate=(p,n)=>{let [y,x]=p;for(let i=0;i<((n%4)+4)%4;i++)[y,x]=[x,-y];return [y,x];};
 function ray(origin,vector,size,limit=size){const out=[];for(let p=add(origin,vector);inside(p,size)&&out.length<limit;p=add(p,vector))out.push(p);return out;}
 function train(start,vector,{occupant,blocked,stop=()=>false,limit=1024}){let p=start;const members=[];for(let i=0;i<limit;i++){const id=occupant(p);if(id==null)return {members,terminal:p,blocked:blocked(p),shield:null};if(stop(id,vector))return {members,terminal:p,blocked:true,shield:id};members.push({id,from:p,to:add(p,vector)});p=add(p,vector);}throw Error('GRID_CHAIN_CYCLE');}
 function combine(vectors){const unique=[...new Map(vectors.map(v=>[key(v),v])).values()];return [0,1].map(i=>Math.max(-1,Math.min(1,unique.reduce((s,v)=>s+v[i],0))));}
 return Object.freeze({directions,add,key,same,inside,rotate,ray,train,combine,area:(p,pattern,rotation=0)=>pattern.map(v=>add(p,rotate(v,rotation)))});
});
