import {chromium} from '@playwright/test';
import {WebSocket} from 'ws';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true}),observer=new WebSocket('ws://localhost:5173/world'),actions=[];
observer.on('message',raw=>{const message=JSON.parse(raw);if(message.type==='move')actions.push(message.player.action);});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:5173');await page.locator('canvas').waitFor();
 const route=await page.evaluate(async()=>{
  const {POND_BRIDGE,WORLD,floorHeight,canWalk,HALL_CUSHIONS}=await import('/src/world-layout.js');let height=0;const blocked=[];
  for(let z=POND_BRIDGE.rampFront+.3;z>=WORLD.quanAm.z+4.1;z-=.04){if(!canWalk(WORLD.pond.x,z,height))blocked.push({z,height});height=floorHeight(WORLD.pond.x,z,height);}
  return {blocked,seats:HALL_CUSHIONS.filter(seat=>seat.level===1).length};
 });assert.deepEqual(route.blocked,[]);assert.equal(route.seats,28);
 await page.locator('[data-place="pond"]').click();await page.waitForTimeout(900);await page.screenshot({path:'/tmp/khanh-an-pond-bridge.png'});
 const panel=page.locator('.quan-am-interactions');assert.equal(await panel.isVisible(),false);
 await page.locator('[data-place="quanam"]').click();await panel.waitFor();
 await panel.locator('[data-quanam-action="kneel"]').click();await page.waitForTimeout(250);assert.ok(actions.includes('kneel'));
 await panel.locator('[data-quanam-action="bow"]').click();await page.waitForFunction(()=>document.getElementById('quest-total').textContent==='1/12');assert.ok(actions.includes('bow'));
 await panel.locator('[data-quanam-action="incense"]').click();await page.waitForFunction(()=>document.getElementById('quest-total').textContent==='2/12');assert.ok(actions.includes('incense'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('khanhan-stock')).incense),2);
 await page.screenshot({path:'/tmp/khanh-an-quanam-rituals.png'});
 await page.setViewportSize({width:390,height:844});const bounds=await panel.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390);await page.screenshot({path:'/tmp/khanh-an-quanam-rituals-mobile.png'});
 await page.locator('[data-place="yard"]').click();await panel.waitFor({state:'hidden'});assert.deepEqual(errors,[]);
 console.log('Đạt: cầu thông suốt qua hồ, bồ đoàn bổ sung, quỳ/lạy/dâng hương trước Quan Âm, nhiệm vụ và kho nhang, đồng bộ hành động và nút trên điện thoại.');
}finally{observer.terminate();await browser.close();}
