// Short, offline synthesized cues use the host's volume/mute and audio lifecycle.
(function(root){
 const note=(frequency,to,wave='sine',duration=.18,at=0,gain=.09)=>({frequency,to,wave,duration,at,gain});
 (root.PlayroomCatalog ||= {})['mage-brawl'] ||= {};
 root.PlayroomCatalog['mage-brawl'].sounds={
  'mage.reveal':{label:SDK.text("presentation.0443393743e0"),notes:[note(440,660,'triangle'),note(660,880,'sine',.18,.12)]},
  'mage.move':{label:SDK.text("presentation.a810d8af7b46"),notes:[note(260,420,'triangle',.12)]},
  'mage.shield':{label:SDK.text("presentation.919700e291b6"),notes:[note(220,440,'sine',.22),note(660,660,'triangle',.16,.06,.04)]},
  'mage.air':{label:SDK.text("presentation.d448689a6eff"),notes:[note(700,1600,'noise',.26,0,.06)]},
  'mage.earth':{label:SDK.text("presentation.fac3937a6f49"),notes:[note(140,55,'triangle',.22),note(100,60,'noise',.08,0,.04)]},
  'mage.water':{label:SDK.text("presentation.1bf25d25f14e"),notes:[note(540,230,'sine',.25),note(810,370,'sine',.22,.05,.04)]},
  'mage.fire':{label:SDK.text("presentation.b402d8db653a"),notes:[note(180,65,'noise',.26,0,.06),note(350,90,'triangle',.2)]},
  'mage.fall':{label:SDK.text("presentation.58dbb487a9cd"),notes:[note(400,80,'sine',.3)]}
 };
})(globalThis);
