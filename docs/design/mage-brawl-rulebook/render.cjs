'use strict';
const path=require('node:path'),{pathToFileURL}=require('node:url');
const app=process.env.PLAYROOM_APP_ROOT||path.resolve(__dirname,'../../../../playroom');
const {chromium,executablePath}=require(path.join(app,'scripts/codex/browser.cjs'));
(async()=>{
 const input=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);
 const browser=await chromium.launch({headless:true,executablePath:executablePath(),args:['--no-sandbox','--disable-background-networking']});
 try{
  const page=await browser.newPage({viewport:{width:900,height:1100}});
  const documents=[
   {pdf:output,remove:'.memo-sheet',count:16},
   {pdf:path.join(path.dirname(output),'Стихийная-потасовка-4-памятки-A5.pdf'),remove:'.page:not(.memo-sheet)',count:1}
  ];
  for(const document of documents){
   await page.goto(pathToFileURL(input).href);
   await page.evaluate(selector=>{for(const element of window.document.querySelectorAll(selector))element.remove();},document.remove);
   await page.evaluate(()=>document.fonts.ready);
   const overflow=await page.evaluate(()=>[...document.querySelectorAll('.page')].flatMap((p,i)=>{
    const floor=p.querySelector('footer').getBoundingClientRect().top-5;
    return [...p.querySelector('.body').children].filter(c=>c.getBoundingClientRect().bottom>floor).map(c=>({page:i+1,text:c.textContent.slice(0,65),bottom:c.getBoundingClientRect().bottom-floor}));
   }));
   if(overflow.length)throw Error('Page overflow: '+JSON.stringify(overflow));
   const pages=await page.locator('.page').count();
   if(pages!==document.count)throw Error(`Expected ${document.count} pages, got ${pages}`);
   await page.pdf({path:document.pdf,width:'148mm',height:'210mm',printBackground:true,preferCSSPageSize:true,outline:true,tagged:true});
   console.log(JSON.stringify({pages,pdf:document.pdf,overflow:0}));
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
