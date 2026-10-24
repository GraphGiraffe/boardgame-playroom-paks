'use strict';
const W=require('../../shared/domain/decision-window.js');
function submit(window,actor,command,legal){
  // Commands must first match the actual authoritative legal choices.
  if(command!==null&&!legal.some(candidate=>JSON.stringify(candidate)===JSON.stringify(command)))throw Error('ACTION_UNAVAILABLE');
  const complete=W.put(window,actor,command);
  return {complete,publicWindow:W.describe(window)};
}
function resolve(window){
  if(W.describe(window).ready.length!==window.participants.length)throw Error('WINDOW_INCOMPLETE');
  // This function runs only in authority. Real rules resolve both choices together.
  return window.participants.map(actor=>({actor,command:{...window.plans[actor]}}));
}
module.exports={submit,resolve};
if(require.main===module){
  const window=W.create('round:1',[0,1]),first={card:'deck:1',direction:1},second={card:'deck:2',direction:0};
  const pending=submit(window,0,first,[first]);
  submit(window,0,null,[]); // cancellation advances revision without exposing a plan
  submit(window,0,first,[first]);
  const ready=submit(window,1,second,[second]);
  const resolved=resolve(window); // do not send raw commands to spectators
  console.log(JSON.stringify({pending:pending.publicWindow,ready:ready.publicWindow,resolvedCount:resolved.length}));
}
