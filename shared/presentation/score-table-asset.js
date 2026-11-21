(function(root){
 'use strict';
 const BoardAsset=root.PlayroomBoardAsset||(typeof require==='function'?require('./board-asset.js'):null);

 // A ledger labels precomputed values and indexes exact authorized writes.
 // Scoring and confirmation remain in the owning pack.
 class ScoreTableAsset extends BoardAsset {
  categoryRows(ids,scores,{actions,player,label,preview,actionLabel}){
   const byCategory=new Map(actions.map(command=>[command.key,command]));
   return ids.map(id=>{
    const title=label(id),points=preview(id),hint=actionLabel(title,points),command=byCategory.get(id)??null;
    return {id,label:title,cells:scores.map((row,index)=>({player:index,value:row[id]??null,
     preview:points,label:hint,command:index===player?command:null}))};
   });
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=ScoreTableAsset;
 root.PlayroomScoreTableAsset=ScoreTableAsset;
})(globalThis);
