import {chromium} from '@playwright/test';
import {WebSocket} from 'ws';
import assert from 'node:assert/strict';
import {HALL_LEVELS,CUSHION_DIMENSIONS} from '../src/world-layout.js';

const url=process.env.GAME_URL||'http://localhost:5173',socketUrl=new URL('/world',url);socketUrl.protocol=socketUrl.protocol==='https:'?'wss:':'ws:';
const browser=await chromium.launch({channel:'chromium',headless:true}),observer=new WebSocket(socketUrl),states=[];
observer.on('message',raw=>{const message=JSON.parse(raw);if(message.type==='move')states.push(message.player);});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(url);await page.locator('canvas').waitFor();await page.waitForTimeout(1200);
 assert.equal(await page.locator('#meditation-button').isVisible(),false);
 await page.screenshot({path:'/tmp/khanh-an-hall-revised-exterior.png'});
 await page.locator('#enter').click();const button=page.locator('#meditation-button');await button.waitFor();
 assert.match(await button.innerText(),/Ngồi vào bồ đoàn/);await button.click();
 await page.waitForFunction(()=>document.getElementById('meditation-button').getAttribute('aria-pressed')==='true');
 await page.waitForTimeout(5400);assert.match(await button.innerText(),/Đứng dậy/);
 const seated=states.find(state=>state.action==='meditate');assert.ok(seated);assert.equal(seated.y,HALL_LEVELS[0]+CUSHION_DIMENSIONS.top);
 const late=new WebSocket(socketUrl);
 const welcome=await new Promise((resolve,reject)=>{late.on('message',raw=>{const message=JSON.parse(raw);if(message.type==='welcome')resolve(message);});late.on('error',reject);});
 assert.equal(welcome.players.find(player=>player.id===seated.id).action,'meditate');late.close();
 await page.screenshot({path:'/tmp/khanh-an-meditating.png'});
 await page.keyboard.press('t');assert.equal(await button.getAttribute('aria-pressed'),'false');
 await button.click();await page.keyboard.down('w');await page.waitForTimeout(250);await page.keyboard.up('w');assert.equal(await button.getAttribute('aria-pressed'),'false');
 await button.click();await page.keyboard.press('q');assert.equal(await button.getAttribute('aria-pressed'),'false');
 await page.locator('[data-place="yard"]').click();await page.waitForTimeout(150);assert.equal(await button.isVisible(),false);
 await page.setViewportSize({width:390,height:844});await page.locator('#enter').click();await button.waitFor();await button.click();
 await page.waitForFunction(()=>document.getElementById('meditation-button').getAttribute('aria-pressed')==='true');const bounds=await button.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390);
 await page.screenshot({path:'/tmp/khanh-an-meditating-mobile.png'});await button.click();await page.waitForFunction(()=>document.getElementById('meditation-button').getAttribute('aria-pressed')==='false');
 assert.deepEqual(errors,[]);console.log('Đạt: ngồi gần bồ đoàn, giữ tư thế, đứng bằng T/di chuyển/hành động, đồng bộ người vào sau và nút cảm ứng.');
}finally{observer.terminate();await browser.close();}
