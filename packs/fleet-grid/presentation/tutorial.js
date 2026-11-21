/* Pure tutorial definition: public projection and UI selection in, goals out. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackTutorial=factory;})(globalThis,function(tr){
 'use strict';
 const definitions={"ship": {"selector": "[data-select^=\"new:\"]"}, "place": {"selector": ".battle-grid [data-action*='\"type\":\"place\"']"}, "select": {"selector": ".battle-grid [data-select^=\"ship:\"]"}, "rotate": {"selector": "[data-guide-step=\"rotate\"]"}, "remove": {"selector": "[data-guide-step=\"remove\"]"}, "move": {"selector": ".battle-grid [data-action*='\"type\":\"move\"']"}, "ready": {"selector": "[data-action*='\"type\":\"ready\"']"}, "fire": {"selector": "[data-action*='\"type\":\"fire\"']"}, "enemy": {"selector": "[data-view-key=\"fleet\"][data-view-value=\"enemy\"]"}};
 definitions.own={selector:'[data-view-key="fleet"][data-view-value="own"][aria-pressed="false"]',interaction:true};
 definitions.enemy={selector:'[data-view-key="fleet"][data-view-value="enemy"][aria-pressed="false"]',interaction:true};
 definitions.follow={selector:'[data-view-preference="followOpponent"]',interaction:true};
 const tutorial=({state,viewer,ui={},guideProgress={seen:[]}})=>{
  const scene=state.scene,ships=scene.fleets[viewer]?.ships||[],seen=new Set(guideProgress.seen),selected=ui.selected?.startsWith('ship:')&&ships[Number(ui.selected.slice(5))];
  const previous=guideProgress.checkpoint,observed=[];

  if(previous){if(ships.length>previous.ships.length)observed.push('place');if(ships.length<previous.ships.length)observed.push('remove');if(scene.orientation[viewer]!==previous.orientation)observed.push('rotate');if(ships.length===previous.ships.length)ships.forEach((ship,i)=>{const old=previous.ships[i];if(ship.some((cell,j)=>cell!==old[j]))observed.push((ship.length>1&&ship[1]-ship[0]===10)!==(old.length>1&&old[1]-old[0]===10)?'rotate':'move');});}
  for(const id of observed)seen.add(id);
  let ids;
  if(!scene.setup)ids=['own','enemy','follow','fire'];
  else if(scene.ready?.[viewer])ids=[];
  else if(selected)ids=['rotate','move','remove','ship','ready'];
  else if(ships.length&&['rotate','move','remove'].some(id=>!seen.has(id)))ids=['select','ship','place','ready'];
  else ids=ships.length?['ship','place','ready']:['ship','rotate','place'];
  // After selecting any reserve ship, guide placement instead of insisting on a particular size.
  if(scene.setup&&ui.selected?.startsWith('new:'))ids=['place','rotate','ship',...ids.filter(id=>!['place','rotate','ship'].includes(id))];
  if(scene.setup&&scene.fleets[viewer]?.indicators.every(item=>item.value===0)&&!selected)ids=['ready','select'];
  const completion=Object.keys(definitions).map(id=>({id,actions:{place:['place'],ship:['place'],select:['move','remove'],remove:['remove'],ready:['ready'],fire:['fire']}[id],match:id==='rotate'?a=>a.type==='orient'||a.type==='move'&&a.vertical!==(ships[a.ship]?.length>1&&ships[a.ship][1]-ships[a.ship][0]===10):id==='move'?a=>a.type==='move'&&a.start!==ships[a.ship]?.[0]:undefined}));
  return {completion,required:['ship','place','select','rotate','move','remove','ready','fire','own','enemy','follow'],steps:ids.map(id=>({id,...definitions[id],actions:{place:['place'],remove:['remove'],ready:['ready'],fire:['fire']}[id],text:tr.format({key:'battleship.tutorial.'+id,params:{}})})),observed,checkpoint:{ships:ships.map(ship=>ship.slice()),orientation:scene.orientation[viewer]},phase:scene.setup?'setup':'battle',wait:scene.setup,concurrent:scene.setup,restartPhase:true};
 };
 tutorial.revisions={"enemy":2};
 tutorial.goals=["ship","place","select","rotate","move","remove","ready","own","enemy","follow","fire"].map(id=>({id,revision:tutorial.revisions[id]||1,text:tr.format({key:"battleship.tutorial."+id,params:{}})}));
 return tutorial;
});
