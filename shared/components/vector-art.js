// One coordinate plane for scalable artwork; no browser-dependent geometry.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomVectorArt=api;})(globalThis,function(){
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=v=>typeof v==='number'&&Number.isFinite(v);
 function box(value){if(!Array.isArray(value))throw Error('ART_BOX_INVALID');const [x,y,width,height]=value;if(value.length!==4||![x,y,width,height].every(number)||width<=0||height<=0)throw Error('ART_BOX_INVALID');return {x,y,width,height};}
 function fit(source,target,{alignX=.5,alignY=.5,mode='meet'}={}){
  const s=box(source),t=box(target);if(!number(alignX)||alignX<0||alignX>1||!number(alignY)||alignY<0||alignY>1||!['meet','slice'].includes(mode))throw Error('ART_ALIGNMENT_INVALID');
  const scale=Math[mode==='meet'?'min':'max'](t.width/s.width,t.height/s.height),width=s.width*scale,height=s.height*scale;
  return Object.freeze({scale,x:t.x+(t.width-width)*alignX-s.x*scale,y:t.y+(t.height-height)*alignY-s.y*scale,width,height});
 }
 function viewport({width,height,x=0,y=0,content='',className='',attrs='',rotation=0}={}){
  box([x,y,width,height]);if(typeof content!=='string'||![0,90,180,270].includes(rotation))throw Error('ART_CONTENT_INVALID');
  const swap=rotation===90||rotation===270,transform={0:'',90:`translate(${height} 0) rotate(90)`,180:`translate(${width} ${height}) rotate(180)`,270:`translate(0 ${width}) rotate(-90)`}[rotation];
  return `<svg xmlns="http://www.w3.org/2000/svg"${className?` class="${esc(className)}"`:''} data-art-plane="${width} ${height}" viewBox="${x} ${y} ${swap?height:width} ${swap?width:height}" preserveAspectRatio="xMidYMid meet" ${attrs}>${transform?`<g transform="${transform}">${content}</g>`:content}</svg>`;
 }
 function text(value,{x,y,size=15,weight=800,anchor='middle',baseline='central',fill='currentColor',attrs=''}={}){
  if(![x,y,size].every(number)||size<=0||!['start','middle','end'].includes(anchor)||!['central','alphabetic','hanging'].includes(baseline))throw Error('ART_TEXT_INVALID');
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="${baseline}" font-family="system-ui,sans-serif" font-size="${size}" font-weight="${weight}" fill="${esc(fill)}" ${attrs}>${esc(value)}</text>`;
 }
 function normalize(markup){
  if(typeof markup!=='string')throw Error('ART_SVG_REQUIRED');const m=/^<svg\b([^>]*)>([\s\S]*)<\/svg>$/.exec(markup);if(!m)throw Error('ART_SVG_REQUIRED');
  const b=/\bviewBox="([^"]+)"/.exec(m[1]);if(!b)throw Error('ART_BOX_REQUIRED');const values=b[1].trim().split(/[\s,]+/).map(Number);const r=box(values);
  let attrs=m[1].replace(/\s*(?:xmlns|viewBox|preserveAspectRatio|data-art-plane)="[^"]*"/g,'');
  return viewport({x:r.x,y:r.y,width:r.width,height:r.height,content:m[2],attrs:attrs.trim()});
 }
 const render=fn=>(...args)=>normalize(fn(...args));
 function place(markup,{x,y,width,height,className='',attrs=''}={}){
  const normalized=normalize(markup),m=/^<svg\b([^>]*)>([\s\S]*)<\/svg>$/.exec(normalized),source=/viewBox="([^"]+)"/.exec(m[1])[1].split(/\s+/).map(Number),f=fit(source,[x,y,width,height]);
  const inherited=m[1].replace(/\s*(?:xmlns|viewBox|preserveAspectRatio|width|height|x|y)="[^"]*"/g,'').trim();
  return `<g data-art-slot="${x} ${y} ${width} ${height}" transform="translate(${f.x} ${f.y}) scale(${f.scale})" ${attrs}><g ${inherited}${className?` class="${esc(className)}"`:''}>${m[2]}</g></g>`;
 }
 return Object.freeze({box,fit,viewport,text,normalize,render,place});
});
