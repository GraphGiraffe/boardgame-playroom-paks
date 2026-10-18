// Canonical scalable Web component geometry. Values, visibility and actions are external.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomGameComponents=api;})(globalThis,function(){
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
const checkerArt=(king,movable)=>`<svg class="checker-art" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="56" r="42" fill="var(--checker-shadow)"/><circle cx="50" cy="49" r="42" fill="var(--checker-fill)" stroke="var(--checker-edge)" stroke-width="7"/><circle cx="50" cy="49" r="31" fill="none" stroke="var(--checker-ring)" stroke-width="4"/>${king?'<path d="M27 60 23 37 37 47 50 29 63 47 77 37 73 60ZM29 66H71" fill="none" stroke="var(--checker-mark)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>':''}</svg>`;
const dots={0:[],1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8],7:[0,2,3,4,5,6,8],8:[0,1,2,3,5,6,7,8],9:[0,1,2,3,4,5,6,7,8]};
const half=n=>`<span class="domino-half" aria-hidden="true">${Array.from({length:9},(_,i)=>`<i class="${(dots[n]||dots[9]).includes(i)?'pip':''}"></i>`).join('')}</span>`;

 const pipPlaces=Object.freeze({1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]});
 function dieArt(value,{frame='flat'}={}){if(value!==null&&value!==undefined&&(!Number.isInteger(value)||value<0||value>1000))throw Error('DIE_VALUE_INVALID');
  const raised=frame==='raised',dots=pipPlaces[value]||[];
  const body=raised?'<rect x="3" y="7" width="54" height="50" rx="11" fill="var(--die-side,#c6c9b2)"/><rect x="3" y="3" width="54" height="50" rx="11" fill="var(--die-face,#fffcf0)" stroke="var(--die-rim,#ede9d4)" stroke-width="2"/>':'<g transform="scale(1.1111111111)"><rect x="2" y="2" width="50" height="50" rx="10" fill="var(--die-face,#fffdf4)" stroke="var(--die-rim,#c5cebc)" stroke-width="3"/></g>';
  const mark=value>6?'<text x="30" y="30" text-anchor="middle" dominant-baseline="central" fill="var(--die-mark,currentColor)" font-family="system-ui,sans-serif" font-size="22" font-weight="800">'+value+'</text>':dots.map(i=>'<circle cx="'+((raised?18:14)+i%3*(raised?12:16))+'" cy="'+((raised?17:14)+Math.floor(i/3)*(raised?12:16))+'" r="'+(raised?3.7:4)+'" fill="var(--die-mark,'+(raised?'#456750':'currentColor')+')"/>').join('');
  return '<svg class="'+(raised?'shared-die-art is-raised':'shared-die-art')+'" viewBox="0 0 60 60" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'+body+mark+'</svg>';
 }
 const dominoFace=(a,b,rotation=0)=>art({main:'<div class="domino-art-face">'+half(a)+'<span class="domino-divider"></span>'+half(b)+'</div>',width:48,height:84,rotation});
 function boardCells(columns=8,rows=8,flipped=false){if(!Number.isInteger(columns)||columns<1||columns>32||!Number.isInteger(rows)||rows<1||rows>32)throw Error('BOARD_SIZE_INVALID');return Array.from({length:columns*rows},(_,i)=>{const index=flipped?columns*rows-i-1:i,row=Math.floor(index/columns),column=index%columns;return {index,row,column,dark:(row+column)%2===1};});}
 const bubbleClass=({kind='game',result=null}={})=>'game-speech is-'+(kind==='chat'?'chat':'game')+(result==='success'?' is-success':result==='error'?' is-error':'');
 function scoreTable({head,body,foot='',className='',attributes=''}={}){if(typeof head!=='string'||typeof body!=='string'||typeof foot!=='string')throw Error('SCORE_TABLE_INVALID');return '<table class="'+esc(className)+'" '+attributes+'><thead>'+head+'</thead><tbody>'+body+'</tbody>'+(foot?'<tfoot>'+foot+'</tfoot>':'')+'</table>';}
 function scoreBadge(counter,{roundTokenArt}={}){return `<span class="player-score is-${counter.kind}" data-score-kind="${counter.kind}" data-score-id="${esc(counter.id||counter.kind)}" data-motion-counter="${esc(counter.id||counter.kind)}" aria-label="${esc(counter.label)}: ${counter.value}" title="${esc(counter.label)}: ${counter.value}">${counter.kind==='pieces'?roundTokenArt({value:counter.value}):counter.value}</span>`;}
 function cardFace({rank='',suit='',backUrl='',hidden=false,compact=false,main:recipe,variant='main',...geometry}={}){
  if(typeof recipe==='string')return art({main:recipe,compact,...geometry},variant);
  const main=hidden?`<div class="shared-face shared-back-face">${backUrl?`<img src="${esc(backUrl)}" alt="">`:'✦'}</div>`:`<div class="shared-face"><span class="shared-card-corner">${esc(rank)}<small>${esc(suit)}</small></span><strong>${esc(suit)}</strong><span class="shared-card-corner bottom">${esc(rank)}<small>${esc(suit)}</small></span></div>`;
  return art({main,width:70,height:98},compact?'compact':'main');
 }
 const defaultRenderers=Object.freeze({die:params=>dieArt(params.value,params),checker:params=>checkerArt(params.king,params.movable),domino:params=>dominoFace(params.a,params.b,params.rotation||0),ship:params=>shipSilhouette(params.size),
  counter:params=>countBadge(params.value,params.label,params),bubble:params=>`<span class="${bubbleClass(params)}">${esc(params.text||'')}</span>`,'score-table':scoreTable,'card-face':cardFace,'card-back':params=>cardFace({...params,hidden:true}),
  board:params=>`<svg viewBox="0 0 ${params.columns||8} ${params.rows||8}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${boardCells(params.columns||8,params.rows||8).map(cell=>`<rect x="${cell.column}" y="${cell.row}" width="1" height="1" fill="var(--color-material-board-${cell.dark?'dark':'light'},${cell.dark?'#84a187':'#e6e5ca'})"/>`).join('')}</svg>`});
 class AssetResolver {
  constructor({catalog={},skins={},palette={},renderers={}}={}){this.catalog=JSON.parse(JSON.stringify(catalog));this.skins={...skins};this.palette={...palette};this.renderers={...defaultRenderers,...renderers};}
  resolve(family){const spec=Object.hasOwn(this.catalog,family)?this.catalog[family]:null;if(!spec)throw Error('ASSET_FAMILY_UNKNOWN');const requested=this.skins[family]||spec.default,variant=spec.variants.includes(requested)?requested:spec.default;return Object.freeze({family,variant,missing:variant!==requested,ratio:spec.ratio||null,materials:Object.freeze(Object.fromEntries(Object.entries(spec.materials||{}).map(([name,slot])=>[name,this.palette[slot]||null])))});}
  uri(family,uri){if(typeof uri!=='string'||!uri.startsWith('data:image/svg+xml;'))return uri;const index=uri.indexOf(',');let svg=uri.slice(index+1);if(uri.slice(0,index).includes(';base64'))return uri;svg=decodeURIComponent(svg);for(const [source,slot]of Object.entries(this.catalog[family]?.replaceColors||{}))svg=svg.replaceAll(source,this.palette[slot]||source);return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);}
  render(family,params={}){const resolved=this.resolve(family),renderer=this.renderers[family+':'+resolved.variant]||this.renderers[family];if(typeof renderer!=='function')throw Error('ASSET_RENDERER_MISSING');return renderer(params.backUrl?{...params,backUrl:this.uri(family,params.backUrl)}:params,resolved);}
 }
 function createHelpers(H,source){
function card(value,attrs='disabled',extra=''){
  const tag=attrs==='disabled'?'span':'button',hidden=!value||value.hidden;
  const rank=hidden?'':value.joker?globalThis.PlayroomMessages.text("ui.game-components.2f0a8ec85914"):({14:globalThis.PlayroomMessages.text("ui.game-components.7614b90a1064"),13:globalThis.PlayroomMessages.text("ui.game-components.130b874a5c04"),12:globalThis.PlayroomMessages.text("ui.game-components.55cea60d6cce"),11:globalThis.PlayroomMessages.text("ui.game-components.8b7b577aa31e")})[value.rank]||value.rank,suit=hidden?'':value.suit||'';
  const red=!hidden&&(value.color==='red'||suit==='♥'||suit==='♦');
  const label=hidden?globalThis.PlayroomMessages.text("ui.game-components.c13a6680430c"):value.joker?globalThis.PlayroomMessages.text("ui.game-components.232b69813cbf",{p0:String(red?globalThis.PlayroomMessages.text("ui.game-components.21b4d916f326"):globalThis.PlayroomMessages.text("ui.game-components.1ca9b6b05dfc"))}):`${rank} ${suit}`;

  return `<${tag} class="shared-card ${hidden?'shared-card-back':''} ${red?'shared-red':''} ${extra}" ${tag==='button'?attrs:''} ${!hidden&&value.id?`data-entity="card-${H.esc(value.id)}"`:''} aria-label="${H.esc(label)}">${H.assetArt(hidden?'card-back':'card-face',{rank,suit,hidden,backUrl:hidden?source('card-back'):''},params=>cardFace(params))}</${tag}>`;
 }
const cover=content=>H.svg(`<ellipse data-cover-shadow cx="151" cy="158" rx="112" ry="14" fill="#365e4720"/><g data-cover-art>${content}</g>`);
  const die=(value,attrs='disabled',extra='')=>'<button class="shared-die '+extra+'" '+attrs+' aria-label="'+globalThis.PlayroomMessages.text("ui.game-components.c21f8ac4292c")+H.esc(value||globalThis.PlayroomMessages.text("ui.game-components.22c66b66eaa1"))+'">'+H.assetArt('die',{value},()=>dieArt(value))+'</button>';
  return Object.freeze({card,die,cover,checkerArt:(king,movable)=>H.assetArt('checker',{king,movable},()=>checkerArt(king,movable)),dominoFace:(a,b,rotation=0)=>H.assetArt('domino',{a,b,rotation},()=>dominoFace(a,b,rotation)),shipSilhouette:size=>H.assetArt('ship',{size},()=>shipSilhouette(size)),scoreTable:params=>H.assetArt('score-table',params,()=>scoreTable(params)),boardCells,dieArt:(value,params={})=>H.assetArt('die',{value,...params},()=>dieArt(value,params)),bubbleClass});
 }
 return Object.freeze({art,countBadge,shipSilhouette,checkerArt,dominoFace,dieArt,boardCells,bubbleClass,scoreTable,createHelpers,AssetResolver,defaultRenderers,cardFace,scoreBadge});
});
