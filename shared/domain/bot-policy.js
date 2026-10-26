// Independent deterministic streams: reading/retrying a decision never advances game RNG.
(function(r,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;r.PlayroomBotPolicy=a;})(globalThis,function(){
 function random(seed,key){let x=(seed>>>0)||1;for(const c of String(key))x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
 function normalize(value={},ids){const strategy=value.strategy??'auto',difficulty=value.difficulty??'medium',errorRate=value.difficulty?({easy:35,medium:18,hard:6}[difficulty]):value.errorRate??18;if(!['easy','medium','hard'].includes(difficulty)||strategy!=='auto'&&!ids.includes(strategy)||!Number.isInteger(errorRate)||errorRate<0||errorRate>100)throw Error('BOT_SETTINGS_INVALID');return {strategy,difficulty,errorRate};}
 function resolve(value,ids,seed,actor){const config=normalize(value,ids);return {...config,resolvedStrategy:config.strategy==='auto'?ids[Math.floor(random(seed,'profile:'+actor)()*ids.length)]:config.strategy};}
 function mistake(preferred,candidates,{rate,random,score,safe,meaningful}){if(random()*100>=rate)return preferred;const pool=candidates.filter(c=>c!==preferred&&safe(c)&&meaningful(c)&&score(c)<score(preferred));return pool.length?pool[Math.floor(random()*pool.length)]:preferred;}
 return Object.freeze({random,normalize,resolve,mistake});
});
