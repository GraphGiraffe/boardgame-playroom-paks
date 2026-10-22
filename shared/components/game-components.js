// Canonical scalable Web component geometry. Values, visibility and actions are external.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomGameComponents=api;})(globalThis,function(){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
    return `<svg class="piece-art" viewBox="0 0 ${swap?height:width} ${swap?width:height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false" data-art-variant="${small?'compact':'main'}"><g${transform?` transform="${transform}"`:''}><foreignObject width="${width}" height="${height}"><div xmlns="http://www.w3.org/1999/xhtml" class="piece-artboard" style="width:${width}px;height:${height}px">${small?compact:main}</div></foreignObject></g></svg>`;
  }
function countBadge(count,label=globalThis.PlayroomMessages.text("ui.game-components.737f7561bd7f"),{corner=false,hand=false}={}) {
    if(!Number.isSafeInteger(count)||count<0)throw Error('Invalid piece count');
    return `<span class="piece-count${corner?' is-corner':''}${hand?' is-hand':''}${hand&&count>=100?' is-long-count':''}" data-piece-count="${count}" aria-label="${esc(label)}: ${count}">${count}</span>`;
  }
function shipSilhouette(size){const width=16+size*9;return `<svg class="fleet-ship-icon" width="${width}" height="20" viewBox="0 0 ${width} 20" aria-hidden="true"><path d="M2 11H${width-3}l-5 7H8Z" fill="currentColor"/><path d="M5 10H${width-8}" fill="none" stroke="currentColor" stroke-width="2"/>${Array.from({length:size},(_,i)=>`<rect x="${7+i*9}" y="4" width="4" height="6" rx="1" fill="currentColor"/>`).join('')}</svg>`;}
const checkerArt=(king,movable)=>`<svg class="checker-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="56" r="42" fill="var(--checker-shadow)"/><circle class="piece-contour" cx="50" cy="49" r="42" fill="var(--checker-fill)" stroke="var(--checker-edge)" stroke-width="7"/><circle cx="50" cy="49" r="31" fill="none" stroke="var(--checker-ring)" stroke-width="4"/>${king?'<path d="M27 60 23 37 37 47 50 29 63 47 77 37 73 60ZM29 66H71" fill="none" stroke="var(--checker-mark)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>':''}</svg>`;
const dots={0:[],1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8],7:[0,2,3,4,5,6,8],8:[0,1,2,3,5,6,7,8],9:[0,1,2,3,4,5,6,7,8]};
const half=n=>`<span class="domino-half" aria-hidden="true">${Array.from({length:9},(_,i)=>`<i class="${(dots[n]||dots[9]).includes(i)?'pip':''}"></i>`).join('')}</span>`;

 const pipPlaces=Object.freeze({1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]});
 function dieArt(value,{frame='flat'}={}){if(value!==null&&value!==undefined&&(!Number.isInteger(value)||value<0||value>1000))throw Error('DIE_VALUE_INVALID');
  const raised=frame==='raised',dots=pipPlaces[value]||[];
  const body=raised?'<rect x="3" y="7" width="54" height="50" rx="11" fill="var(--die-side,#c6c9b2)"/><rect class="piece-contour" x="3" y="3" width="54" height="50" rx="11" fill="var(--die-face,#fffbed)" stroke="var(--die-rim,#ede9d4)" stroke-width="2"/>':'<g transform="scale(1.1111111111)"><rect class="piece-contour" x="2" y="2" width="50" height="50" rx="10" fill="var(--die-face,#fffbed)" stroke="var(--die-rim,#c5cebc)" stroke-width="3"/></g>';
  const mark=value>6?'<text x="30" y="30" text-anchor="middle" dominant-baseline="central" fill="var(--die-mark,currentColor)" font-family="system-ui,sans-serif" font-size="22" font-weight="800">'+value+'</text>':dots.map(i=>'<circle cx="'+((raised?18:14)+i%3*(raised?12:16))+'" cy="'+((raised?17:14)+Math.floor(i/3)*(raised?12:16))+'" r="'+(raised?3.7:4)+'" fill="var(--die-mark,'+(raised?'#456750':'currentColor')+')"/>').join('');
  return '<svg class="'+(raised?'shared-die-art is-raised':'shared-die-art')+'" viewBox="0 0 60 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'+body+mark+'</svg>';
 }
 const dominoFace=(a,b,rotation=0)=>art({main:'<div class="domino-art-face">'+half(a)+'<span class="domino-divider"></span>'+half(b)+'</div>',width:48,height:84,rotation});
 function boardCells(columns=8,rows=8,flipped=false){if(!Number.isInteger(columns)||columns<1||columns>32||!Number.isInteger(rows)||rows<1||rows>32)throw Error('BOARD_SIZE_INVALID');return Array.from({length:columns*rows},(_,i)=>{const index=flipped?columns*rows-i-1:i,row=Math.floor(index/columns),column=index%columns;return {index,row,column,dark:(row+column)%2===1};});}
 const bubbleClass=({kind='game',result=null}={})=>'game-speech is-'+(kind==='chat'?'chat':'game')+(result==='success'?' is-success':result==='error'?' is-error':'');
 function scoreTable({head,body,foot='',className='',attributes=''}={}){if(typeof head!=='string'||typeof body!=='string'||typeof foot!=='string')throw Error('SCORE_TABLE_INVALID');return '<table class="'+esc(className)+'" '+attributes+'><thead>'+head+'</thead><tbody>'+body+'</tbody>'+(foot?'<tfoot>'+foot+'</tfoot>':'')+'</table>';}
 function statusBadge(value,{icon}={}){
  const badge=typeof value==='string'?{label:value}:value,label=esc(badge.label);
  if(badge.position==='avatar-bottom')return `<span data-piece-type="badge" class="player-avatar-label${badge.icon?' is-icon':''}" role="img" aria-label="${label}" title="${label}">${badge.icon?icon(badge.icon):label}</span>`;
  const tone=['success','danger'].includes(badge.tone)?'is-'+badge.tone:'',color=/^#[0-9a-f]{6}$/i.test(badge.color||'')?` style="background:${badge.color};color:#fff;border-color:${badge.color}"`:'';
  return `<span data-piece-type="badge" class="player-status-badge ${tone}"${color}${badge.motion?` data-motion-counter="${esc(badge.motion)}"`:''}>${badge.icon?`<span class="player-status-icon" role="img" aria-label="${label}" title="${label}" tabindex="0" data-tooltip="${label}">${icon(badge.icon)}</span>`:label}</span>`;
 }
 function scoreBadge(counter,{roundTokenArt}={}){return `<span class="player-score is-${counter.kind}" data-score-kind="${counter.kind}" data-score-id="${esc(counter.id||counter.kind)}" data-motion-counter="${esc(counter.id||counter.kind)}" aria-label="${esc(counter.label)}: ${counter.value}" title="${esc(counter.label)}: ${counter.value}">${counter.kind==='pieces'?roundTokenArt({value:counter.value}):counter.value}</span>`;}
 // Physical card geometry belongs to the type; a deck supplies only its printing.
 function cardFrame(drawing){
  if(/data-piece-type="card-deck"/.test(drawing.slice(0,drawing.indexOf('>'))))return drawing;
  const match=/^<svg\b([^>]*)>([\s\S]*)<\/svg>$/.exec(drawing);if(!match)throw Error('CARD_PRINT_SVG_REQUIRED');
  const box=/viewBox="([^"]+)"/.exec(match[1])?.[1]||'0 0 100 140';
  const metadata=(match[1].match(/data-[\w-]+="[^"]*"/g)||[]).join(' '),classes=/class="([^"]+)"/.exec(match[1])?.[1]||'';
  return `<svg class="piece-art card-deck-art ${esc(classes)}" data-piece-type="card-deck" ${metadata} viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><rect class="card-depth" x=".5" y="2.5" width="99" height="136" rx="12.5" fill="var(--color-material-card-side,#aebcae)" stroke="var(--card-outline,#94a58f)" stroke-width="1"/><rect class="card-surface" x="1.5" y="1.5" width="97" height="134" rx="11.5" fill="var(--color-material-card-face,#fffbed)"/><g style="clip-path:path('M13 1.5H87A11.5 11.5 0 0 1 98.5 13V124A11.5 11.5 0 0 1 87 135.5H13A11.5 11.5 0 0 1 1.5 124V13A11.5 11.5 0 0 1 13 1.5Z')"><svg class="card-deck-print" x="1.5" y="1.5" width="97" height="134" style="width:97px;height:134px;overflow:hidden" viewBox="${esc(box)}" preserveAspectRatio="none">${match[2]}</svg></g><rect class="card-rim piece-contour" x="1.5" y="1.5" width="97" height="134" rx="11.5" fill="none" stroke="var(--color-material-card-rim,#e5e6d4)" stroke-width="3"/><rect class="card-outline" x=".5" y=".5" width="99" height="136" rx="12.5" fill="none" stroke="var(--card-outline,#94a58f)" stroke-width="1"/></svg>`;
 }
 function cardPose({x,half,count,enabled=true,maxAngle=9,minAngle=3,countAngle=12,radiusDivisor=10}){
  if(!enabled)return {angle:0,y:0};
  half=Math.max(1,half);x=Math.max(-half,Math.min(half,x));
  const angle=Math.min(maxAngle,minAngle+countAngle/Math.max(1,count)),radius=Math.max(half/Math.sin(angle*Math.PI/180),half*half/radiusDivisor);
  return {angle:Math.asin(x/radius)*180/Math.PI,y:radius-Math.sqrt(radius*radius-x*x)};
 }
 function cardBack({backUrl=''}={}){
  return cardFrame(`<svg class="piece-art card-back-art" viewBox="0 0 70 98" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${backUrl?`<image href="${esc(backUrl)}" width="70" height="98" preserveAspectRatio="xMidYMid meet"/>`:'<rect width="70" height="98" rx="12" fill="#fffdf3"/><rect x="5" y="5" width="60" height="88" rx="7" fill="#3d6853"/><rect x="10.5" y="10.5" width="49" height="77" rx="5" fill="none" stroke="#b7c9a9" stroke-opacity=".47"/><path d="M35 30C38 43 41 46 54 49C41 52 38 55 35 68C32 55 29 52 16 49C29 46 32 43 35 30Z" fill="#dce8c8"/>'}</svg>`);
 }
 function cardFace({rank='',suit='',backUrl='',hidden=false,compact=false,inlineIndex=false,suitOnly=false,crown=false,main:recipe,variant='main',...geometry}={}){
  if(hidden)return cardBack({backUrl});
  if(typeof recipe==='string')return cardFrame(art({main:recipe,compact,...geometry},variant));
  if(suitOnly&&!hidden)return art({main:`<div class="shared-face suit-only"><strong>${esc(suit)}</strong></div>`,width:70,height:98});
  const main=`<div class="shared-face${inlineIndex?' inline-index-face':''}"><span class="shared-card-corner card-corner">${esc(rank)}<small>${esc(suit)}</small></span><strong>${esc(suit)}</strong>${crown?'<svg class="shared-card-crown" viewBox="0 0 40 32" aria-hidden="true"><path d="m3 10 8 7L20 2l9 15 8-7-5 20H8Z" fill="var(--color-material-card-crown,#c9a44f)"/></svg>':''}<span class="shared-card-corner card-corner bottom">${esc(rank)}<small>${esc(suit)}</small></span></div>`;
  return cardFrame(art({main,width:70,height:98},compact?'compact':'main'));
 }
 function characterFace({character='',characterSources={},source=''}={}, {variant='minimal'}={}){
  const uri=characterSources[variant]||characterSources.minimal||source;
  return cardFrame(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="xMidYMid meet" aria-hidden="true" data-character-style="${esc(variant)}" data-character-id="${esc(character)}"><image href="${esc(uri)}" x="4" y="20" width="92" height="96" preserveAspectRatio="xMidYMid meet"/></svg>`);
 }
 // A type owns geometry/rendering operations. Asset variants and pack rules specialize it.
 const pieceTypes=Object.freeze({
  'card-deck':Object.freeze({ratio:Object.freeze([5,7]),frame:cardFrame,face:cardFrame,back:cardFrame,pose:cardPose,stacking:Object.freeze({horizontal:.32,arc:.42,vertical:.23,faceDown:.14})}),
  die:Object.freeze({ratio:Object.freeze([1,1]),render:params=>dieArt(params.value,params)}),
  checker:Object.freeze({ratio:Object.freeze([1,1]),render:params=>checkerArt(params.king,params.movable)}),
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
   return markup;
  }
 }
 function createHelpers(H,source){
function card(value,attrs='disabled',extra=''){
  const tag=attrs==='disabled'?'span':'button',hidden=!value||value.hidden;
  const rank=hidden?'':value.joker?globalThis.PlayroomMessages.text("ui.game-components.2f0a8ec85914"):({14:globalThis.PlayroomMessages.text("ui.game-components.7614b90a1064"),13:globalThis.PlayroomMessages.text("ui.game-components.130b874a5c04"),12:globalThis.PlayroomMessages.text("ui.game-components.55cea60d6cce"),11:globalThis.PlayroomMessages.text("ui.game-components.8b7b577aa31e")})[value.rank]||value.rank,suit=hidden?'':value.suit||'';
  const red=!hidden&&(value.color==='red'||suit==='♥'||suit==='♦');
  const label=hidden?globalThis.PlayroomMessages.text("ui.game-components.c13a6680430c"):value.joker?globalThis.PlayroomMessages.text("ui.game-components.232b69813cbf",{p0:String(red?globalThis.PlayroomMessages.text("ui.game-components.21b4d916f326"):globalThis.PlayroomMessages.text("ui.game-components.1ca9b6b05dfc"))}):`${rank} ${suit}`;

  return `<${tag} data-size-role="card" class="shared-card ${hidden?'shared-card-back':''} ${red?'shared-red':''} ${extra}" ${tag==='button'?attrs:''} ${!hidden&&value.id?`data-entity="card-${H.esc(value.id)}"`:''} aria-label="${H.esc(label)}">${H.assetArt(hidden?'card-back':'card-face',{rank,suit,hidden,crown:!!value?.crown,backUrl:hidden?source('card-back',value?.assetSet):'',...(hidden?{assetSet:value?.assetSet,backUrls:Object.fromEntries((value?.assetSet?[value.assetSet]:['standard-deck','mini-split-deck']).map(set=>[set,source('card-back',set)]))}:{})},params=>cardFace(params))}</${tag}>`;
 }
function cardSlot({suit='',attrs='disabled',className='',label='',kind='empty'}={}){
  return `<button data-size-role="card" class="shared-card-slot ${esc(className)} ${suit==='♥'||suit==='♦'?'shared-red':''}" ${attrs} data-card-slot="${esc(kind)}" aria-label="${esc(label)}">${suit?H.assetArt('card-face',{suit,suitOnly:true},cardFace):''}</button>`;
 }
const cover=content=>H.svg(`<ellipse data-cover-shadow cx="151" cy="158" rx="112" ry="14" fill="#365e4720"/><g data-cover-art>${content}</g>`);
  const die=(value,attrs='disabled',extra='')=>'<button class="shared-die '+extra+'" '+attrs+' aria-label="'+globalThis.PlayroomMessages.text("ui.game-components.c21f8ac4292c")+H.esc(value||globalThis.PlayroomMessages.text("ui.game-components.22c66b66eaa1"))+'">'+H.assetArt('die',{value},()=>dieArt(value))+'</button>';
  return Object.freeze({button:options=>button(options,{icon:H.icon}),card,cardSlot,die,cover,checkerArt:(king,movable)=>H.assetArt('checker',{king,movable},()=>checkerArt(king,movable)),dominoFace:(a,b,rotation=0)=>H.assetArt('domino',{a,b,rotation},()=>dominoFace(a,b,rotation)),shipSilhouette:size=>H.assetArt('ship',{size},()=>shipSilhouette(size)),scoreTable:params=>H.assetArt('score-table',params,()=>scoreTable(params)),boardCells,dieArt:(value,params={})=>H.assetArt('die',{value,...params},()=>dieArt(value,params)),bubbleClass});
 }
 return Object.freeze({button,art,countBadge,shipSilhouette,checkerArt,dominoFace,dieArt,boardCells,bubbleClass,scoreTable,createHelpers,AssetResolver,defaultRenderers,pieceTypes,cardFrame,cardFace,cardBack,characterFace,scoreBadge});
});
