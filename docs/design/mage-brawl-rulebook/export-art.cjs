// Read the pack's accepted illustrations without changing runtime or loading a game.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const pack=path.resolve(__dirname,'../../../packs/mage-brawl');
let source=fs.readFileSync(path.join(pack,'view.js'),'utf8');
source=source.slice(0,source.indexOf(' const coverAsset='))+`root.BookletArt={terrainArt,illustration,actionArt,elementArt,footprints,colors};})(globalThis);`;
const palette=['#4d8066','#d56c60','#57a1bd','#d5ad43','#9875ad','#af8c4b','#6ba8a1'];
const context={PlayroomPackPresentation:{},PlayroomPackResources:{locales:{}},PlayroomViews:{helpers:{translator:()=>({format:()=>''}),esc:s=>s,playerColor:i=>palette[i%palette.length]}}};
vm.runInNewContext(source,context);
const a=context.BookletArt,out={terrain:{},illustration:{},diagrams:{},elements:{},colors:a.colors,footprints:a.footprints(),pawnArt:require(path.resolve(pack,'../../shared/components/round-token.js')).roundTokenArt({profile:'pawn'})};
for(const t of ['ground','base','wall','spikes','falling_floor','puddle','desert','air_island','forest'])out.terrain[t]=a.terrainArt(t);
for(const e of ['air','earth','water','fire']){out.elements[e]=a.elementArt(e);for(const action of ['movement','attack','ultimate']){out.illustration[e+'-'+action]=a.illustration(e,action);out.diagrams[e+'-'+action]=a.actionArt(e,action);}}
console.log(JSON.stringify(out));
