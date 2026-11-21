(function(root){
 'use strict';
 const Asset=root.PlayroomAsset||(typeof require==='function'?require('./asset.js'):null);

 // Card appearance and public reveals are usable without a deck or a move port.
 class CardFaceAsset extends Asset {
  constructor(){super('card');}

  describe(card,options){
   // A face override must never run for an authorized back-only record.
   return card.hidden?card:super.describe(card,options);
  }

  reveal(card,title){
   if(card.hidden)throw Error('SDK_CARD_REVEAL_HIDDEN');
   return {
    kind:'card',card:this.describe(card,{role:'reveal'}),
    ...(card.id===undefined?{}:{entity:this.ref(card.id)}),
    ...(title===undefined?{}:{title}),
   };
  }
 }
 if(typeof module==='object'&&module.exports)module.exports=CardFaceAsset;
 root.PlayroomCardFaceAsset=CardFaceAsset;
})(globalThis);
