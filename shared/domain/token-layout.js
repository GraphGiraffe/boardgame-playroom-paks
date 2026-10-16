/* Token composition geometry. Coordinates and depth never alter the token SVG. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomTokenLayout=api;})(globalThis,function(){
  'use strict';
  function cell(index,count){if(!Number.isInteger(index)||!Number.isInteger(count)||count<1||index<0||index>=count)throw Error('TOKEN_LAYOUT_INVALID');const columns=Math.ceil(Math.sqrt(count)),rows=Math.ceil(count/columns),row=Math.floor(index/columns),rowLength=Math.min(columns,count-row*columns);return {x:count>1?(index%columns-(rowLength-1)/2)/rowLength:0,y:count>1?(row-(rows-1)/2)/rows:0};}
  function triangle(index,{rows=[1,3],stepX=.64,stepY=.61,tip=1.06}={}){if(!Number.isInteger(index)||index<0||index>=rows.reduce((a,b)=>a+b,0))throw Error('TOKEN_LAYOUT_INVALID');let row=0,offset=index;while(offset>=rows[row])offset-=rows[row++];return {x:(offset-(rows[row]-1)/2)*stepX,y:tip-row*stepY};}
  const fan=(index,{stepX=5,stepY=3,count=3}={})=>({x:index*stepX,y:index*stepY,z:count-index});
  const stack=(index,{stepX=0,stepY=-3}={})=>({x:index*stepX,y:index*stepY,z:index});
  return Object.freeze({cell,triangle,fan,stack});
});
