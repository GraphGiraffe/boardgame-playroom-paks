'use strict';
// Run from any directory: node examples/presentation-contracts/sequential.cjs
const C=require('../../shared/components/game-components.js');
function present(projected,selectedId){
  const cards=projected.hand; // authorized faces only, never authority.deck
  const items=cards.map(card=>({id:card.id,selected:card.id===selectedId,locked:false,
    html:C.cardFace(card)}));
  return {hand:C.handLayout(items),objects:cards.map((card,index)=>({
    ref:{namespace:'card',id:card.id},zone:'own-hand',index}))};
}
function played(event){
  const card=event.params.card; // the domain explicitly made this face public
  return {kind:'play',reveal:{kind:'card',card,entity:{namespace:'card',id:card.id}}};
}
module.exports={present,played};
if(require.main===module){
  const cards=[{id:'deck:1',rank:'7',suit:'♥'},{id:'deck:2',rank:'7',suit:'♥'}];
  const shown=present({hand:cards},'deck:2');
  console.log(JSON.stringify({count:shown.hand.count,objects:shown.objects,effect:played({params:{card:cards[1]}})}));
}
