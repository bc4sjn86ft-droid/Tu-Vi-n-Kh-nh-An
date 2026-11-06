import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{localStorage.setItem('khanhan-music','off');localStorage.setItem('khanhan-tasks-v1',JSON.stringify({sweep:0}));});
 await page.goto(process.env.GAME_URL||'http://localhost:5173');
 const sweep=page.locator('#activity-button');await sweep.waitFor();assert.match(await sweep.innerText(),/Quét lá/);
 await sweep.click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('khanhan-tasks-v1')||'{}').sweep===1);
 assert.equal(await sweep.isDisabled(),false);
 await sweep.click();await page.keyboard.down('d');await page.waitForTimeout(300);await page.keyboard.up('d');
 await page.waitForFunction(()=>!document.querySelector('#activity-button').disabled);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('khanhan-tasks-v1')).sweep),1);
 assert.deepEqual(errors,[]);console.log('Đạt: quét lá mới hoàn thành nhiệm vụ, di chuyển hủy quét và không có lỗi dựng hình.');
}finally{await browser.close();}
