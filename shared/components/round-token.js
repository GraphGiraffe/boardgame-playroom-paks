// Canonical scalable token geometry. Change this source in playroom-paks/shared/components.
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.PlayroomComponents=api;
})(globalThis,function(){
  'use strict';
  const firstSymbol=(textY=12.5)=>`<circle cx="12" cy="12" r="9"/><text class="first-symbol-digit" x="12" y="${textY}" text-anchor="middle" dominant-baseline="central" fill="currentColor" stroke="none" font-family="system-ui, sans-serif" font-size="14" font-weight="800">1</text>`;
  const numberPaths=Object.freeze({
    0:'M12 6c-4 0-5 3-5 6s1 6 5 6 5-3 5-6-1-6-5-6Z',
    1:'M12 7v11',
    2:'M7 9c0-2 2-3 5-3s5 1 5 4c0 2-2 4-10 8h10',
    3:'M8 7c1-1 2-1 4-1 3 0 5 1 5 3 0 2-2 3-5 3 3 0 5 1 5 3 0 2-2 3-5 3-2 0-4-1-5-2',
    4:'M15 18V6L7 14h10',
    5:'M17 6H8l-1 6c2-1 4-1 6-1 3 0 5 1 5 4s-2 4-6 4c-2 0-4-1-5-2',
    6:'M16 7c-4-2-8 1-9 5-1 5 1 7 5 7 3 0 5-2 5-4s-2-4-5-4c-2 0-4 1-5 3',
    7:'M7 6h11L9 18',
    8:'M12 12c-3 0-5-1-5-3s2-3 5-3 5 1 5 3-2 3-5 3Zm0 0c-3 0-5 1-5 3s2 4 5 4 5-2 5-4-2-3-5-3Z',
    9:'M17 11c-1 2-3 3-5 3-3 0-5-2-5-4s2-4 5-4c4 0 6 3 5 7-1 4-4 6-9 5'
  });
  function numberPath(value){if(!Object.hasOwn(numberPaths,value))throw Error('Invalid number mark');return numberPaths[value];}
  function numberMark(value){return `<svg class="number-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${numberPath(value)}"/></svg>`;}
  function roundTokenArt({value=null,first=false}={}) {
    if(value!==null&&(!Number.isSafeInteger(value)||value<0))throw Error('Invalid round token value');
    const label=String(first?1:value??''),size=label.length===1?52:label.length===2?39:Math.max(21,Math.floor(78/(label.length*.58)));
    const mark=first?`<svg x="4" y="-1" width="92" height="92" viewBox="0 0 24 24" fill="none" stroke="var(--round-token-mark,currentColor)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color="var(--round-token-mark,currentColor)">${firstSymbol(12.5)}</svg>`:label?`<text x="50" y="45" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-weight="800" font-size="${size}" fill="var(--round-token-mark,currentColor)">${label}</text>`:'';
    return `<svg class="round-token-art medallion-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="55" r="42" fill="var(--round-token-side,#a7ae93)"/><circle cx="50" cy="45" r="41" fill="var(--round-token-fill,#eadfc0)" stroke="var(--round-token-rim,#fff9e9)" stroke-width="4"/>${mark}</svg>`;
  }
  return Object.freeze({firstSymbol,numberPath,numberMark,roundTokenArt});
});
