(function(root){
 'use strict';
 root.PlayroomPackTutorial=tr=>{
  const goals=[['table','play'],['card','play'],['draw','draw'],['suit','choose-suit'],['mau','declare-mau'],['next','next-deal']];
  const tutorial=({actions})=>({steps:goals.flatMap(([id,type])=>actions.some(command=>command.type===type)?[{
   id,actions:[type],available:true,text:tr.format({key:'mau.tutorial.'+id}),...(id==='card'?{interaction:true,binding:'source'}:id==='table'?{binding:'destination'}:{})
  }]:[])});
  tutorial.goals=goals.map(([id])=>({id,revision:1,text:tr.format({key:'mau.tutorial.'+id})}));
  return tutorial;
 };
})(globalThis);
