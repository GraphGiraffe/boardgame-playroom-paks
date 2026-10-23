// Short, offline synthesized cues use the host's volume/mute and audio lifecycle.
(function(root){
 const note=(frequency,to,wave='sine',duration=.18,at=0,gain=.09)=>({frequency,to,wave,duration,at,gain});
 (root.PlayroomCatalog ||= {})['mage-brawl'] ||= {};
 root.PlayroomCatalog['mage-brawl'].sounds={
  'mage.reveal':{label:'Маги: раскрытие планов',notes:[note(440,660,'triangle'),note(660,880,'sine',.18,.12)]},
  'mage.move':{label:'Маги: шаг',notes:[note(260,420,'triangle',.12)]},
  'mage.shield':{label:'Маги: щит',notes:[note(220,440,'sine',.22),note(660,660,'triangle',.16,.06,.04)]},
  'mage.air':{label:'Маги: порыв воздуха',notes:[note(700,1600,'noise',.26,0,.06)]},
  'mage.earth':{label:'Маги: удар камня',notes:[note(140,55,'triangle',.22),note(100,60,'noise',.08,0,.04)]},
  'mage.water':{label:'Маги: волна',notes:[note(540,230,'sine',.25),note(810,370,'sine',.22,.05,.04)]},
  'mage.fire':{label:'Маги: огонь',notes:[note(180,65,'noise',.26,0,.06),note(350,90,'triangle',.2)]},
  'mage.fall':{label:'Маги: падение',notes:[note(400,80,'sine',.3)]}
 };
})(globalThis);
