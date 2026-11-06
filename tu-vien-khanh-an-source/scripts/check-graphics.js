import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  window.drawCount=0;
  for(const method of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
   const original=WebGL2RenderingContext.prototype[method];
   WebGL2RenderingContext.prototype[method]=function(...args){window.drawCount++;return original.apply(this,args);};
  }
 });
 await page.goto(process.env.GAME_URL||'http://localhost:5174');
 const quality=page.locator('#graphics-quality');await quality.waitFor();
 assert.equal(await quality.inputValue(),'auto');
 const saved=Number(await page.locator('#scene canvas').getAttribute('data-saved-draw-calls'));assert.ok(saved>100);
 await page.waitForTimeout(2000);
 const metrics=await page.evaluate(()=>new Promise(resolve=>{
  let frames=0;const start=performance.now(),draws=window.drawCount;
  function sample(now){frames++;if(now-start>2500)resolve({fps:Math.round(frames*1000/(now-start)),drawCallsPerFrame:Math.round((window.drawCount-draws)/frames)});else requestAnimationFrame(sample);}
  requestAnimationFrame(sample);
 }));
 console.log('Tự động:',metrics,'Lượt vẽ tĩnh tiết kiệm:',saved);
 for(const mode of ['smooth','high','balanced']){await quality.selectOption(mode);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>localStorage.getItem('khanhan-graphics')),mode);}
 await page.reload();await quality.waitFor();assert.equal(await quality.inputValue(),'balanced');
 await page.locator('#enter').click();await page.locator('#meditation-button').waitFor();
 await page.locator('#meditation-button').click();assert.equal(await page.locator('#meditation-button').getAttribute('aria-pressed'),'true');
 await page.keyboard.press('t');
 await page.setViewportSize({width:390,height:844});
 const bounds=await quality.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390);
 const destinations=await page.locator('.destinations').boundingBox();assert.ok(destinations.y>=bounds.y+bounds.height);
 await quality.selectOption('smooth');await page.waitForTimeout(500);
 await page.screenshot({path:'/tmp/khanh-an-graphics-mobile.png'});
 assert.deepEqual(errors,[]);console.log('Đạt: chất lượng đồ họa, lưu lựa chọn, chuyển bóng đổ, ngồi bồ đoàn và giao diện điện thoại.');
}finally{await browser.close();}
