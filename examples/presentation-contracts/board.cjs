'use strict';
// Rendering and playback share public physical references, never artwork IDs.
const C=require('../../shared/components/game-components.js');
function present(visible){
 return {contractVersion:1,id:'stones',family:'board',geometry:{topology:'grid',columns:4,rows:4},
  zones:[{id:'field',kind:'board'}],objects:visible.map(piece=>({
   ref:{namespace:'stone',id:piece.id},zone:'field',cell:piece.cell,owner:piece.owner})),
  interactions:[],players:[]};
}
function transition(before,after){
 const initial=present(before),final=present(after);
 return {initial,final,keys:initial.objects.map(object=>C.entityKey(object.ref))};
}
module.exports={present,transition};
if(require.main===module){
 console.log(JSON.stringify(transition(
  [{id:'copy:1',cell:0,owner:0},{id:'copy:2',cell:5,owner:1}],
  [{id:'copy:1',cell:10,owner:0}])));
}
