(function(root){
 'use strict';
 const Asset=root.PlayroomAsset||(typeof require==='function'?require('./asset.js'):null);

 // Packs supply legal commands and public zones. The host maps these logical
 // addresses to the active field in live play, history and other viewports.
 class BoardAsset extends Asset {
  constructor(zone='field'){super('board');this.zone=zone;}

  target(cell,zone=this.zone){return cell==null?{zone}:{zone,cell};}

  activateCell(command,cell,zone){return {command,kind:'activate',target:this.target(cell,zone)};}

  layout({topology='fixed',kind='board',zones=[],objects=[],interactions=[]}={}){
   return {geometry:{topology},zones:[{id:this.zone,kind},...zones],objects,interactions};
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=BoardAsset;
 root.PlayroomBoardAsset=BoardAsset;
})(globalThis);
