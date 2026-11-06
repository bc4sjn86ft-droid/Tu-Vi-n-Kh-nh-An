import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage();
 await page.addInitScript(()=>localStorage.setItem('khanhan-music','off'));
 await page.goto(process.env.GAME_URL||'http://localhost:5173');
 await page.locator('.destinations button').first().waitFor();
 for(const [width,height]of [[1440,730],[1280,800],[1024,768],[768,1024],[390,844],[375,667],[844,390]]){
  await page.setViewportSize({width,height});
  for(const inHall of [false,true]){
   await page.evaluate(value=>document.body.classList.toggle('in-hall',value),inHall);
   for(const expanded of [false,true]){
    await page.evaluate(value=>{document.querySelector('#chat-body').style.display=value?'block':'none';},expanded);
    const result=await page.evaluate(()=>{
     const selectors=['.quest-panel','.chat','.map-card','.destinations','.player-tag'].filter(selector=>getComputedStyle(document.querySelector(selector)).display!=='none');
     const bounds=selectors.map(selector=>{const rect=document.querySelector(selector).getBoundingClientRect();return {selector,left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height};});
     const overlaps=[];
     for(let first=0;first<bounds.length;first++)for(let second=first+1;second<bounds.length;second++){
      const a=bounds[first],b=bounds[second];
      if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)overlaps.push([a.selector,b.selector]);
     }
     const destinations=document.querySelector('.destinations');destinations.scrollTop=destinations.scrollHeight;
     const last=destinations.lastElementChild.getBoundingClientRect(),container=destinations.getBoundingClientRect();
     return {bounds,overlaps,lastVisible:last.bottom<=container.bottom+1&&last.top>=container.top-1};
    });
    const context=`${width}×${height}, hall=${inHall}, chat=${expanded}`;
    assert.deepEqual(result.overlaps,[],context);
    for(const rect of result.bounds)assert.ok(rect.left>=0&&rect.top>=0&&rect.right<=width+1&&rect.bottom<=height+1&&rect.height>20,`${context}: ${JSON.stringify(rect)}`);
    assert.ok(result.lastVisible,`${context}: vị trí tele cuối cùng phải cuộn tới được`);
   }
  }
 }
 console.log('Đạt: nhiệm vụ, chat, bản đồ, tele và chọn nhân vật không chồng lấn ở 7 kích thước, trong/ngoài điện, chat đóng/mở.');
}finally{await browser.close();}
