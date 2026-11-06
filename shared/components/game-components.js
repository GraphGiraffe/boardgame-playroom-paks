// Canonical scalable Web component geometry. Values, visibility and actions are external.
(function(root,factory){const api=factory(root);if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomGameComponents=api;})(globalThis,function(root){
 'use strict';
 const V=root.PlayroomVectorArt||(typeof require==='function'?require('./vector-art.js'):null);
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Entity namespaces are semantic kinds; IDs identify physical instances, never faces.
function entityRef(namespace,id){
 if(typeof namespace!=='string'||!/^[a-z][a-z0-9_]{0,31}$/.test(namespace)||typeof id!=='string'||!id||id.length>256)throw Error('ENTITY_REF_INVALID');
 return Object.freeze({namespace,id});
}
function entityKey(ref){
 if(!ref||typeof ref!=='object'||Array.isArray(ref)||Object.keys(ref).some(key=>!['namespace','id'].includes(key)))throw Error('ENTITY_REF_INVALID');
 const value=entityRef(ref.namespace,ref.id);return value.namespace+'-'+value.id;
}
function validMetric(value,{requireId=false,requireLabel=false,localized=false}={}){
 const record=item=>item!==null&&typeof item==='object'&&!Array.isArray(item);
 const identifier=id=>typeof id==='string'&&/^[a-z][a-z0-9-]{0,63}$/.test(id);
 if(!record(value)||!['points','wins','pieces'].includes(value.kind)||!Number.isSafeInteger(value.value)||value.value<0)return false;
 if(value.id===undefined?requireId:!identifier(value.id))return false;
 if(value.label===undefined?requireLabel:!(typeof value.label==='string'||!localized&&record(value.label)&&typeof value.label.key==='string'))return false;
 const d=value.display;
 return d===undefined||record(d)&&['heart','meeple','crown'].includes(d.icon)&&
  (d.capacity===undefined||Number.isInteger(d.capacity)&&d.capacity>=1&&d.capacity<=64)&&
  (d.overlap===undefined||typeof d.overlap==='boolean');
}
function actionSelector({key,label,choices,value,disabled=false,stable=false,className=''}){
  if(typeof key!=='string'||!key||typeof label!=='string'||!label||!Array.isArray(choices)||!choices.length)throw Error('ACTION_SELECTOR_INVALID');
  const ids=new Set();
  for(const choice of choices){
    if(typeof choice.value!=='string'||!choice.value||ids.has(choice.value)||typeof choice.label!=='string'||!choice.label)throw Error('ACTION_SELECTOR_CHOICE_INVALID');
    ids.add(choice.value);
  }
  const index=choices.findIndex(choice=>choice.value===value);
  if(index<0)throw Error('ACTION_SELECTOR_VALUE_INVALID');
  return `<div class="shared-page-tabs ${esc(className)}" style="--page-count:${choices.length};--page-index:${index}" role="group" aria-label="${esc(label)}">${choices.map(choice=>`<button type="button" ${stable?'data-view-layout="stable" ':''}data-view-key="${esc(key)}" data-view-value="${esc(choice.value)}" aria-pressed="${choice.value===value}" aria-label="${esc(choice.label)}" title="${esc(choice.label)}"${disabled||choice.disabled?' disabled':''}>${choice.html??esc(choice.label)}${choice.marker!=null?`<span class="shared-action-marker" aria-hidden="true">${esc(choice.marker)}</span>`:''}</button>`).join('')}</div>`;
}
function button({icon='',label='',ariaLabel=label,attrs='',variant='primary',className='',disabled=false,active,type='button'}={}, {icon:renderIcon}={}){
    icon=String(icon??'');label=String(label??'');ariaLabel=String(ariaLabel??'');
    if(!icon&&!label)throw Error('Button needs an icon or a label');
    if(icon&&typeof renderIcon!=='function')throw Error('Button needs an icon renderer');
    if(!ariaLabel)throw Error('Button needs an accessible label');
    if(!['primary','secondary','danger','plain','outline','game'].includes(variant))throw Error('Unknown button variant');
    if(!['button','submit','reset'].includes(type))throw Error('Invalid button type');
    const iconOnly=!!icon&&!label,legacy=iconOnly?'icon-btn ui-icon-button':variant==='game'?'scene-button':'btn'+({secondary:' secondary',danger:' coral',plain:' plain',outline:' plain'}[variant]||'');
    return `<button type="${type}" class="ui-button ui-button--${variant} ${iconOnly?'ui-button--icon':'ui-button--label'} ${legacy} ${esc(className)}${active?' active':''}" ${attrs} aria-label="${esc(ariaLabel)}"${iconOnly?` title="${esc(ariaLabel)}"`:''}${typeof active==='boolean'?` aria-pressed="${active}"`:''}${disabled?' disabled':''}>${icon&&renderIcon?renderIcon(icon):''}${label?`<span class="ui-button-label">${esc(label)}</span>`:''}</button>`;
  }
function art({main,compact,width=72,height=103,rotation=0}, variant='main') {
    if (typeof main !== 'string' || !Number.isFinite(width) || !Number.isFinite(height) || width<=0 || height<=0 || width>4096 || height>4096) throw Error('Invalid card artwork');
    if(![0,90,180,270].includes(rotation))throw Error('Invalid artwork rotation');
    const small=variant==='compact' && typeof compact==='string' && compact.length>0,swap=rotation===90||rotation===270;
    const transform=({0:'',90:`translate(${height} 0) rotate(90)`,180:`translate(${width} ${height}) rotate(180)`,270:`translate(0 ${width}) rotate(-90)`})[rotation];
    const markup=small?compact:main;
    if(/^<svg\b/.test(markup))return V.viewport({width:swap?height:width,height:swap?width:height,className:'piece-art',attrs:`aria-hidden="true" focusable="false" data-art-variant="${small?'compact':'main'}"`,content:`<g${transform?` transform="${transform}"`:''}>${V.place(markup,{x:0,y:0,width,height})}</g>`});
    // Compatibility with immutable archived viewApi-3 HTML recipes.
    return `<svg class="piece-art" viewBox="0 0 ${swap?height:width} ${swap?width:height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" data-art-variant="${small?'compact':'main'}"><g${transform?` transform="${transform}"`:''}><foreignObject width="${width}" height="${height}"><div xmlns="http://www.w3.org/1999/xhtml" class="piece-artboard" style="width:${width}px;height:${height}px">${small?compact:main}</div></foreignObject></g></svg>`;
  }
function publicFrames({plan,frames,source=null,live,livePlayers='',liveProgress='',label,playLabel,skipLabel,speedLabel,controls=true,lazy=false}) {
  const {id,initial,final,groups}=plan||{};
  if(source){
   const f=source.initial;
   if(typeof id!=='string'||!Array.isArray(groups)||groups.length>32||initial!==0||final!==groups.length||typeof source.id!=='string'||!f||typeof f.markup!=='string'||typeof f.label!=='string')throw Error('PUBLIC_PLAN_INVALID');
   return `<section class="public-sequence" data-public-sequence="${esc(id)}" data-public-lazy data-public-frame-source="${esc(source.id)}" data-presentation-plan="${esc(JSON.stringify({id,initial,final,groups}))}"><div class="public-sequence-stage"><div data-public-display data-dom-key="public-display" data-public-frame="0">${f.markup}${f.players?`<template data-sequence-players>${f.players}</template>`:''}</div></div></section>`;
  }
  if(!Array.isArray(groups)||groups.length!==frames?.length||initial!==0||final!==frames?.length)throw Error('PUBLIC_PLAN_INVALID');
  if(typeof id!=='string'||!Array.isArray(frames)||frames.length>32||frames.some(f=>typeof f.markup!=='string'||typeof f.label!=='string'))throw Error('PUBLIC_FRAMES_INVALID');

  if(lazy){
   const records=[...frames,{markup:live,label,players:livePlayers,progress:liveProgress}].map((f,i)=>({...f,duration:groups[i]?.duration||650}));
   const bank=JSON.stringify(records).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
   const f=records[0],players=f.players?`<template data-sequence-players>${f.players}</template>`:'';
   return `<section class="public-sequence" data-public-sequence="${esc(id)}" data-public-lazy data-presentation-plan="${esc(JSON.stringify({id,initial,final,groups}))}"><div class="public-sequence-stage"><div data-public-display data-dom-key="public-display" data-public-frame="0">${f.markup}${players}</div></div><template data-public-frame-bank>${bank}</template></section>`;
  }
  return `<section class="public-sequence" data-public-sequence="${esc(id)}" data-presentation-plan="${esc(JSON.stringify({id,initial,final,groups}))}"><div class="public-sequence-stage">${[...frames,{markup:live,label,players:livePlayers,progress:liveProgress}].map((f,i)=>`<div data-public-frame="${i}" data-frame-label="${esc(f.label)}" data-frame-progress="${esc(f.progress||'')}"${f.sound?` data-frame-sound="${esc(f.sound)}"`:""}${f.pack?` data-frame-pack="${esc(f.pack)}"`:""}${groups[i]?` data-frame-duration="${esc(groups[i].duration)}"`:""}${i?' hidden':''}>${f.markup}${f.players?`<template data-sequence-players>${f.players}</template>`:''}</div>`).join('')}</div>${controls?`<div class="public-sequence-controls"${frames.length?'':' style="visibility:hidden"'}><button type="button" class="scene-button" data-sequence-play aria-label="${esc(playLabel)}">${frames.length?'Ⅱ':'▶'}</button><output data-sequence-label aria-live="polite">${esc(frames[0]?.label||label)}</output><button type="button" class="scene-button" data-sequence-speed aria-label="${esc(speedLabel)}">1×</button><button type="button" class="scene-button" data-sequence-skip>${esc(skipLabel)}</button></div>`:''}</section>`;
}
function countBadge(count,label=globalThis.PlayroomMessages.text("ui.game-components.737f7561bd7f"),{corner=false,hand=false}={}) {
    if(!Number.isSafeInteger(count)||count<0)throw Error('Invalid piece count');
    return `<span class="piece-count${corner?' is-corner':''}${hand?' is-hand':''}${hand&&count>=100?' is-long-count':''}" data-piece-count="${count}" aria-label="${esc(label)}: ${count}">${count}</span>`;
  }
function shipSilhouette(size){const width=16+size*9;return `<svg class="fleet-ship-icon" width="${width}" height="20" viewBox="0 0 ${width} 20" aria-hidden="true"><path d="M2 11H${width-3}l-5 7H8Z" fill="currentColor"/><path d="M5 10H${width-8}" fill="none" stroke="currentColor" stroke-width="2"/>${Array.from({length:size},(_,i)=>`<rect x="${7+i*9}" y="4" width="4" height="6" rx="1" fill="currentColor"/>`).join('')}</svg>`;}
const checkerArt=(king,movable)=>`<svg class="checker-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="56" r="42" fill="var(--checker-shadow)"/><circle class="piece-contour" cx="50" cy="49" r="42" fill="var(--checker-fill)" stroke="var(--checker-edge)" stroke-width="7"/><circle cx="50" cy="49" r="31" fill="none" stroke="var(--checker-ring)" stroke-width="4"/>${king?'<path d="M27 60 23 37 37 47 50 29 63 47 77 37 73 60ZM29 66H71" fill="none" stroke="var(--checker-mark)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>':''}</svg>`;
const dots={0:[],1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8],7:[0,2,3,4,5,6,8],8:[0,1,2,3,5,6,7,8],9:[0,1,2,3,4,5,6,7,8]};

 const pipPlaces=Object.freeze({1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]});
 function dieArt(value,{frame='flat'}={}){if(value!==null&&value!==undefined&&(!Number.isInteger(value)||value<0||value>1000))throw Error('DIE_VALUE_INVALID');
  const raised=frame==='raised',dots=pipPlaces[value]||[];
  const body=raised?'<rect x="3" y="7" width="54" height="50" rx="11" fill="var(--die-side,#c6c9b2)"/><rect class="piece-contour" x="3" y="3" width="54" height="50" rx="11" fill="var(--die-face,#fffbed)" stroke="var(--die-rim,#ede9d4)" stroke-width="2"/>':'<g transform="scale(1.1111111111)"><rect class="piece-contour" x="2" y="2" width="50" height="50" rx="10" fill="var(--die-face,#fffbed)" stroke="var(--die-rim,#c5cebc)" stroke-width="3"/></g>';
  const mark=value>6?'<text x="30" y="30" text-anchor="middle" dominant-baseline="central" fill="var(--die-mark,currentColor)" font-family="system-ui,sans-serif" font-size="22" font-weight="800">'+value+'</text>':dots.map(i=>'<circle cx="'+((raised?18:14)+i%3*(raised?12:16))+'" cy="'+((raised?17:14)+Math.floor(i/3)*(raised?12:16))+'" r="'+(raised?3.7:4)+'" fill="var(--die-mark,'+(raised?'#456750':'currentColor')+')"/>').join('');
  return '<svg class="'+(raised?'shared-die-art is-raised':'shared-die-art')+'" viewBox="0 0 60 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'+body+mark+'</svg>';
 }
 function dominoFace(a,b,rotation=0){
  const marks=(value,y)=>`<g data-domino-half="${y?'lower':'upper'}">${(dots[value]||dots[9]).map(i=>`<circle cx="${14+i%3*10}" cy="${y+11+Math.floor(i/3)*10}" r="4" fill="var(--color-material-domino-ink,#365f4c)"/>`).join('')}</g>`;
  return V.viewport({width:48,height:84,rotation,className:'piece-art domino-print',attrs:'aria-hidden="true" focusable="false"',content:`<rect class="piece-contour" x="1" y="1" width="46" height="82" rx="7" fill="var(--color-material-domino-face,#fffbed)" stroke="var(--color-material-domino-rim,#9cae98)" stroke-width="2"/><path d="M8 42H40" stroke="var(--color-material-domino-rim,#9cae98)" stroke-width="1.5"/>${marks(a,0)}${marks(b,42)}`});
 }
 function boardCells(columns=8,rows=8,flipped=false){if(!Number.isInteger(columns)||columns<1||columns>32||!Number.isInteger(rows)||rows<1||rows>32)throw Error('BOARD_SIZE_INVALID');return Array.from({length:columns*rows},(_,i)=>{const index=flipped?columns*rows-i-1:i,row=Math.floor(index/columns),column=index%columns;return {index,row,column,dark:(row+column)%2===1};});}
 const bubbleClass=({kind='game',result=null}={})=>'game-speech is-'+(kind==='chat'?'chat':'game')+(result==='success'?' is-success':result==='error'?' is-error':'');
 function scoreTable({head,body,foot='',className='',attributes=''}={}){if(typeof head!=='string'||typeof body!=='string'||typeof foot!=='string')throw Error('SCORE_TABLE_INVALID');return '<table class="'+esc(className)+'" '+attributes+'><thead>'+head+'</thead><tbody>'+body+'</tbody>'+(foot?'<tfoot>'+foot+'</tfoot>':'')+'</table>';}
 function statusBadge(value,{icon}={}){
  const badge=typeof value==='string'?{label:value}:value,label=esc(badge.label);
  if(['avatar-bottom','avatar-center'].includes(badge.position))return `<span data-piece-type="badge" class="player-avatar-label${badge.icon?' is-icon':''}${badge.position==='avatar-center'?' is-center':''}${badge.value>1?' has-multiplier':''}"${/^#[0-9a-f]{6}$/i.test(badge.color||'')?` style="background:${badge.color};color:#111"`:''} role="img" aria-label="${label}" title="${label}">${badge.icon?icon(badge.icon):label}${badge.icon&&badge.value>1?`<b>×${badge.value}</b>`:''}</span>`;
  const tone=['success','danger'].includes(badge.tone)?'is-'+badge.tone:'',color=/^#[0-9a-f]{6}$/i.test(badge.color||'')?` style="background:${badge.color};color:#fff;border-color:${badge.color}"`:'';
  return `<span data-piece-type="badge" class="player-status-badge ${tone}"${color}${badge.motion?` data-motion-counter="${esc(badge.motion)}"`:''}>${badge.icon?`<span class="player-status-icon" role="img" aria-label="${label}" title="${label}" tabindex="0" data-tooltip="${label}">${icon(badge.icon)}</span>`:label}</span>`;
 }
 const tokenShapes={heart:'M12 21S2 14 2 8a5 5 0 0 1 10-2A5 5 0 0 1 22 8c0 6-10 13-10 13Z',meeple:'M9 3a3 3 0 1 1 6 0v3l7 6-3 3-4-3 4 10h-6l-1-6-1 6H5l4-10-4 3-3-3 7-6Z',crown:'M3 6l5 5 4-8 4 8 5-5-2 13H5ZM6 22h12'};
 // Structured items separate physical identity/selection from their printed markup.
 function handLayout(items,{width='var(--scene-card-width,var(--size-card))',peek='24px'}={}){
  if(!Array.isArray(items))throw Error('HAND_ITEMS_REQUIRED');
  const ids=new Set();
  for(const item of items){
   if(!item||typeof item.id!=='string'||!item.id||typeof item.html!=='string'||ids.has(item.id)||['selected','locked'].some(key=>item[key]!==undefined&&typeof item[key]!=='boolean'))throw Error('HAND_ITEM_INVALID');
   ids.add(item.id);
  }
  const raised=items.map(item=>item.selected===true||item.locked===true);
  return {html:items.map(item=>item.html).join(''),count:items.length,
   columns:items.map((item,i)=>i===items.length-1||raised[i]||raised[i+1]?width:`minmax(${peek},${width})`).join(' ')};
 }
 function tokenStrip({value,capacity=1,icon}={}){
  if(!Number.isSafeInteger(value)||value<0||!Number.isSafeInteger(capacity)||capacity<0||capacity>64||!Object.hasOwn(tokenShapes,icon))throw Error('TOKEN_STRIP_INVALID');
  const slots=Math.max(capacity,Math.min(value,8));
  return Array.from({length:slots},(_,i)=>V.viewport({width:24,height:26,className:'counter-token'+(i>=value?' is-empty':''),attrs:`style="z-index:${i<value?slots*2-i:slots-i}" aria-hidden="true"`,content:`<path d="${tokenShapes[icon]}"/>`})).join('')+(value>slots?`<b>×${value}</b>`:'');
 }
 function pieceIndicators({value,capacity,label='',className=''}={}){
  if(!Number.isSafeInteger(value)||!Number.isSafeInteger(capacity)||capacity<1||capacity>64||value<0||value>capacity)throw Error('PIECE_INDICATORS_INVALID');
  return `<svg class="piece-indicators ${esc(className)}" viewBox="0 0 ${capacity*12} 12" role="img" aria-label="${esc(label)}: ${value}">${Array.from({length:capacity},(_,i)=>`<circle class="piece-indicator${i>=value?' is-empty':''}" cx="${6+i*12}" cy="6" r="4.3"/>`).join('')}</svg>`;
 }
 const rotationController=Object.freeze({
  direction(turns,steps=4){if(!Number.isSafeInteger(turns)||!Number.isSafeInteger(steps)||steps<2)throw Error('ROTATION_INVALID');return (turns%steps+steps)%steps;},
  align(turns,direction,steps=4){this.direction(turns,steps);if(!Number.isSafeInteger(direction)||direction<0||direction>=steps)throw Error('ROTATION_INVALID');return turns+((direction-this.direction(turns,steps)+steps+Math.floor(steps/2))%steps-Math.floor(steps/2));}
 });
 function scoreBadge(counter,{roundTokenArt}={}){
  const display=counter.display,tokens=display?tokenStrip({value:counter.value,...display}):'';
  return `<span class="player-score is-${counter.kind}${display?' is-token-counter token-'+display.icon+(display.overlap?' is-overlapping':''):''}" data-score-kind="${counter.kind}" data-score-id="${esc(counter.id||counter.kind)}" data-motion-counter="${esc(counter.id||counter.kind)}" aria-label="${esc(counter.label)}: ${counter.value}" title="${esc(counter.label)}: ${counter.value}">${display?tokens:counter.kind==='pieces'?roundTokenArt({value:counter.value}):counter.value}</span>`;
 }

 // Physical card geometry belongs to the type; a deck supplies only its printing.
 function cardFrame(drawing,{shape='portrait',foreground=''}={}){
  if(!['portrait','square'].includes(shape))throw Error('CARD_SHAPE_INVALID');const height=shape==='square'?100:140;
  if(/data-piece-type="card-deck"/.test(drawing.slice(0,drawing.indexOf('>'))))return V.normalize(drawing);
  const normalized=V.normalize(drawing),header=normalized.slice(0,normalized.indexOf('>')),metadata=(header.match(/data-(?!art-)[\w-]+="[^"]*"/g)||[]).join(' ');
  const printing=V.place(normalized,{x:1.5,y:1.5,width:97,height:height-6,attrs:'data-art-role="print"'});
  const indexInk=foreground?V.place(foreground,{x:1.5,y:1.5,width:97,height:height-6,attrs:'data-art-role="index-ink"'}):'';
  const clip=`M13 1.5H87A11.5 11.5 0 0 1 98.5 13V${height-16}A11.5 11.5 0 0 1 87 ${height-4.5}H13A11.5 11.5 0 0 1 1.5 ${height-16}V13A11.5 11.5 0 0 1 13 1.5Z`;
  return V.viewport({width:100,height,className:'piece-art card-deck-art',attrs:`data-piece-type="card-deck" ${metadata} data-card-shape="${shape}" aria-hidden="true" focusable="false"`,content:`<rect class="card-depth" x=".5" y="2.5" width="99" height="${height-4}" rx="12.5" fill="var(--color-material-card-side,#aebcae)" stroke="var(--card-outline,#94a58f)" stroke-width="1"/><rect class="card-surface" x="1.5" y="1.5" width="97" height="${height-6}" rx="11.5" fill="var(--color-material-card-face,#fffbed)"/><g style="clip-path:path('${clip}')">${printing}</g><rect class="card-rim piece-contour" x="1.5" y="1.5" width="97" height="${height-6}" rx="11.5" fill="none" stroke="var(--color-material-card-rim,#e5e6d4)" stroke-width="3"/><rect class="card-outline" x=".5" y=".5" width="99" height="${height-4}" rx="12.5" fill="none" stroke="var(--card-outline,#94a58f)" stroke-width="1"/>${indexInk}`});
 }
 function cardPose({x,half,count,enabled=true,maxAngle=9,minAngle=3,countAngle=12,radiusDivisor=10}){
  if(!enabled)return {angle:0,y:0};
  half=Math.max(1,half);x=Math.max(-half,Math.min(half,x));
  const angle=Math.min(maxAngle,minAngle+countAngle/Math.max(1,count)),radius=Math.max(half/Math.sin(angle*Math.PI/180),half*half/radiusDivisor);
  return {angle:Math.asin(x/radius)*180/Math.PI,y:radius-Math.sqrt(radius*radius-x*x)};
 }
 function cardBack({backUrl='',shape='portrait'}={}){
  return cardFrame(`<svg class="piece-art card-back-art" viewBox="0 0 70 98" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${backUrl?`<image href="${esc(backUrl)}" width="70" height="98" preserveAspectRatio="xMidYMid meet"/>`:'<rect width="70" height="98" rx="12" fill="#fffdf3"/><rect x="5" y="5" width="60" height="88" rx="7" fill="#3d6853"/><rect x="10.5" y="10.5" width="49" height="77" rx="5" fill="none" stroke="#b7c9a9" stroke-opacity=".47"/><path d="M35 30C38 43 41 46 54 49C41 52 38 55 35 68C32 55 29 52 16 49C29 46 32 43 35 30Z" fill="#dce8c8"/>'}</svg>`,{shape});
 }
 function cardFace({rank='',suit='',backUrl='',hidden=false,compact=false,inlineIndex=false,suitOnly=false,crown=false,main:recipe,variant='main',...geometry}={}){
  if(hidden)return cardBack({backUrl,shape:geometry.shape});
  if(typeof recipe==='string')return cardFrame(art({main:recipe,compact,...geometry},variant));
  const mark=V.text(suit,{x:35,y:49,size:suitOnly?40:34,attrs:'data-art-anchor="center"'});
  if(suitOnly)return V.viewport({width:70,height:70,className:'piece-art suit-only',attrs:'aria-hidden="true" focusable="false"',content:V.text(suit,{x:35,y:35,size:54})});
  // Indices share the left inset and stay in the declared overlap window.
  // Their ink is above the physical rim; only the face illustration is clipped.
  const rankAttrs=String(rank).length>1?'textLength="10" lengthAdjust="spacingAndGlyphs"':'';
  const corner=inlineIndex?V.text(rank,{x:0,y:8.5,size:14,anchor:'start',attrs:rankAttrs})+V.text(suit,{x:14,y:8.5,size:14,anchor:'start'}):V.text(rank,{x:0,y:9,anchor:'start',attrs:rankAttrs})+V.text(suit,{x:5,y:23,size:14});
  const origin=inlineIndex?[4,4]:[4,5],index=`<g data-card-index="top" transform="translate(${origin[0]} ${origin[1]})">${corner}</g>`,inverted=`<g data-card-index="bottom" transform="translate(${70-origin[0]} ${98-origin[1]}) rotate(180)">${corner}</g>`;
  const crownArt=crown?'<svg x="42" y="10" width="23" height="19" viewBox="0 0 40 32" preserveAspectRatio="xMidYMid meet"><path d="m3 10 8 7L20 2l9 15 8-7-5 20H8Z" fill="var(--color-material-card-crown,#c9a44f)"/></svg>':'';
  return cardFrame(V.viewport({width:70,height:98,className:'piece-art standard-card-print'+(inlineIndex?' inline-index-face':''),attrs:'aria-hidden="true" focusable="false"',content:mark+crownArt}),{foreground:V.viewport({width:70,height:98,content:index+inverted})});
 }
 function characterFace({character='',characterSources={},source=''}={}, {variant='minimal'}={}){
  const uri=characterSources[variant]||characterSources.minimal||source;
  return cardFrame(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true" data-character-style="${esc(variant)}" data-character-id="${esc(character)}"><image href="${esc(uri)}" x="4" y="20" width="92" height="96" preserveAspectRatio="xMidYMid meet"/></svg>`);
 }
 // A type owns geometry/rendering operations. Asset variants and pack rules specialize it.
 const pieceTypes=Object.freeze({
  'card-deck':Object.freeze({ratio:Object.freeze([5,7]),frame:V.render(cardFrame),face:V.render(cardFrame),back:V.render(cardFrame),pose:cardPose,stacking:Object.freeze({horizontal:.32,arc:.42,vertical:.23,faceDown:.14})}),
  die:Object.freeze({ratio:Object.freeze([1,1]),render:params=>V.normalize(dieArt(params.value,params))}),
  checker:Object.freeze({ratio:Object.freeze([1,1]),render:params=>V.normalize(checkerArt(params.king,params.movable))}),
  domino:Object.freeze({ratio:Object.freeze([4,7]),render:params=>dominoFace(params.a,params.b,params.rotation||0)}),
  counter:Object.freeze({render:params=>countBadge(params.value,params.label,params)}),
  badge:Object.freeze({render:scoreBadge,status:statusBadge})
 });
 const defaultRenderers=Object.freeze({'character-face':characterFace,die:pieceTypes.die.render,checker:pieceTypes.checker.render,domino:pieceTypes.domino.render,ship:params=>shipSilhouette(params.size),
  counter:pieceTypes.counter.render,bubble:params=>`<span class="${bubbleClass(params)}">${esc(params.text||'')}</span>`,'score-table':scoreTable,'card-face':cardFace,'card-back':params=>cardFace({...params,hidden:true}),
  board:params=>`<svg viewBox="0 0 ${params.columns||8} ${params.rows||8}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${boardCells(params.columns||8,params.rows||8).map(cell=>`<rect x="${cell.column}" y="${cell.row}" width="1" height="1" fill="var(--color-material-board-${cell.dark?'dark':'light'},${cell.dark?'#84a187':'#e6e5ca'})"/>`).join('')}</svg>`});
 class AssetResolver {
  constructor({catalog={},skins={},palette={},renderers={},skinFor=null}={}){this.skinFor=skinFor;this.catalog=JSON.parse(JSON.stringify(catalog));this.skins={...skins};this.palette={...palette};this.renderers={...defaultRenderers,...renderers};}
  resolve(family,params={}){const spec=Object.hasOwn(this.catalog,family)?this.catalog[family]:null;if(!spec)throw Error('ASSET_FAMILY_UNKNOWN');const requested=this.skinFor?.(family,params.packId)||this.skins[family]||spec.default,variant=spec.variants.includes(requested)?requested:spec.default;return Object.freeze({family,type:spec.type||null,variant,stacking:spec.stacking?.[variant]||pieceTypes[spec.type]?.stacking||null,missing:variant!==requested,ratio:spec.ratio||null,materials:Object.freeze(Object.fromEntries(Object.entries(spec.materials||{}).map(([name,slot])=>[name,this.palette[slot]||null])))});}
  uri(family,uri){if(typeof uri!=='string'||!uri.startsWith('data:image/svg+xml;'))return uri;const index=uri.indexOf(',');let svg=uri.slice(index+1);if(uri.slice(0,index).includes(';base64'))return uri;svg=decodeURIComponent(svg);for(const [source,slot]of Object.entries(this.catalog[family]?.replaceColors||{}))svg=svg.replaceAll(source,this.palette[slot]||source);return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}
  render(family,params={}){
   if(family==='card-back'&&params.backUrls){
    const face=this.resolve('card-face',params).variant;
    const set=params.assetSet||(['mini-split','mini-split-four-color'].includes(face)?'mini-split-deck':'standard-deck');
    params={...params,backUrl:params.backUrls[set]||params.backUrl};
   }
   const resolved=this.resolve(family,params),renderer=this.renderers[family+':'+resolved.variant]||this.renderers[family];
   if(typeof renderer!=='function')throw Error('ASSET_RENDERER_MISSING');
   const standardFace=family==='card-face'&&typeof params.main!=='string'&&!params.hidden;
   const mini=standardFace&&['mini-split','mini-split-four-color'].includes(resolved.variant)&&globalThis.PlayroomMiniSplitDeck;
   const inline=standardFace&&['compact-index','compact-index-four-color'].includes(resolved.variant);
   let markup=inline?cardFace({...params,inlineIndex:true}):mini?(globalThis.PlayroomMiniSplitDeck.face(params)||cardFace(params)):renderer(params.backUrl?{...params,backUrl:this.uri(family,params.backUrl)}:params,resolved);
   if(standardFace&&['classic-four-color','mini-split-four-color','compact-index-four-color'].includes(resolved.variant)){
    const ink={'♥':'var(--color-material-card-red,#b94f40)','♣':'var(--color-material-card-club,#2d68ab)','♦':'var(--color-material-card-diamond,#ac6711)','♠':'var(--color-material-card-ink,#264e43)'}[params.suit];
    // Keep colour inside the SVG children so live skin changes remove it cleanly.
    if(ink)markup=markup.replace(/^(<svg[^>]*>)/,`$1<g class="four-color-suit" style="color:${ink}">`).replace(/<\/svg>$/,'</g></svg>');
   }
   if(resolved.type==='card-deck'&&!params.suitOnly)markup=pieceTypes['card-deck'].frame(markup);
   if(resolved.type&&resolved.type!=='card-deck')markup=markup.replace(/^(<[^ >]+)/,`$1 data-piece-type="${resolved.type}"`);
   if(family==='card-face'&&resolved.stacking)markup=markup.replace(/^(<svg[^>]*)(>)/,`$1 data-card-stacking="${esc(JSON.stringify(resolved.stacking))}"$2`);
   return /^<svg\b/.test(markup)?V.normalize(markup):markup;
  }
 }
 function createHelpers(H,source){
function cardDescriptor(value,attrs='disabled',extra=''){
  const tag=attrs==='disabled'?'span':'button',hidden=!value||value.hidden;
  const rank=hidden?'':value.joker?globalThis.PlayroomMessages.text("ui.game-components.2f0a8ec85914"):({14:globalThis.PlayroomMessages.text("ui.game-components.7614b90a1064"),13:globalThis.PlayroomMessages.text("ui.game-components.130b874a5c04"),12:globalThis.PlayroomMessages.text("ui.game-components.55cea60d6cce"),11:globalThis.PlayroomMessages.text("ui.game-components.8b7b577aa31e")})[value.rank]||value.rank,suit=hidden?'':value.suit||'';
  const red=!hidden&&(value.color==='red'||suit==='♥'||suit==='♦');
  const label=hidden?globalThis.PlayroomMessages.text("ui.game-components.c13a6680430c"):value.joker?globalThis.PlayroomMessages.text("ui.game-components.232b69813cbf",{p0:String(red?globalThis.PlayroomMessages.text("ui.game-components.21b4d916f326"):globalThis.PlayroomMessages.text("ui.game-components.1ca9b6b05dfc"))}):`${rank} ${suit}`;

  return {tag,className:`shared-card ${hidden?'shared-card-back':''} ${red?'shared-red':''} ${extra}`,attrs:tag==='button'?attrs:'',entity:!hidden&&value.id?entityKey(entityRef('card',value.id)):null,label,family:hidden?'card-back':'card-face',params:{rank,suit,hidden,crown:!!value?.crown,backUrl:hidden?source('card-back',value?.assetSet):'',...(hidden?{assetSet:value?.assetSet,backUrls:Object.fromEntries((value?.assetSet?[value.assetSet]:['standard-deck','mini-split-deck']).map(set=>[set,source('card-back',set)]))}:{})}};
 }
function renderCard({tag,className,attrs,entity,label,family,params}){
  return `<${tag} data-size-role="card" class="${className}" ${attrs} ${entity?`data-entity="${H.esc(entity)}"`:''} aria-label="${H.esc(label)}">${H.assetArt(family,params,p=>cardFace(p))}</${tag}>`;
 }
function card(value,attrs='disabled',extra=''){return renderCard(cardDescriptor(value,attrs,extra));}

function cardSlot({suit='',attrs='disabled',className='',label='',kind='empty',tag='button'}={}){
  if(!['button','span'].includes(tag))throw Error('Invalid card slot tag');
  return `<${tag} data-size-role="card" class="shared-card-slot ${esc(className)} ${suit==='♥'||suit==='♦'?'shared-red':''}" ${attrs} data-card-slot="${esc(kind)}" aria-label="${esc(label)}">${suit?H.assetArt('card-face',{suit,suitOnly:true},cardFace):''}</${tag}>`;
 }
const cover=content=>H.svg(`<ellipse data-cover-shadow cx="151" cy="158" rx="112" ry="14" fill="#365e4720"/><g data-cover-art>${content}</g>`);
  const die=(value,attrs='disabled',extra='')=>'<button class="shared-die '+extra+(/\bdisabled\b/.test(attrs)?'':' is-playable')+(/aria-pressed="true"/.test(attrs)?' is-selected':'')+'" '+attrs+' aria-label="'+globalThis.PlayroomMessages.text("ui.game-components.c21f8ac4292c")+H.esc(value||globalThis.PlayroomMessages.text("ui.game-components.22c66b66eaa1"))+'">'+H.assetArt('die',{value},()=>dieArt(value))+'</button>';
  return Object.freeze({entityRef,entityKey,validMetric,actionSelector,handLayout,tokenStrip,pieceIndicators,rotationController,button:options=>button(options,{icon:H.icon}),card,cardDescriptor,renderCard,cardSlot,die,cover,checkerArt:(king,movable)=>H.assetArt('checker',{king,movable},()=>checkerArt(king,movable)),dominoFace:(a,b,rotation=0)=>H.assetArt('domino',{a,b,rotation},()=>dominoFace(a,b,rotation)),shipSilhouette:size=>H.assetArt('ship',{size},()=>shipSilhouette(size)),scoreTable:params=>H.assetArt('score-table',params,()=>scoreTable(params)),boardCells,dieArt:(value,params={})=>H.assetArt('die',{value,...params},()=>dieArt(value,params)),bubbleClass});
 }
 return Object.freeze({vector:V,entityRef,entityKey,validMetric,actionSelector,handLayout,tokenStrip,pieceIndicators:V.render(pieceIndicators),rotationController,button,art,publicFrames,countBadge,shipSilhouette:V.render(shipSilhouette),checkerArt:V.render(checkerArt),dominoFace,dieArt:V.render(dieArt),boardCells,bubbleClass,scoreTable,createHelpers,AssetResolver,defaultRenderers,pieceTypes,cardFrame:V.render(cardFrame),cardFace:V.render(cardFace),cardBack:V.render(cardBack),characterFace:V.render(characterFace),scoreBadge});
});
