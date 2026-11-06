import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(process.env.GAME_URL||'http://localhost:5173');await page.locator('#graphics-quality').waitFor();
 await page.locator('[data-place="residence"]').click();await page.waitForTimeout(2200);
 assert.equal(await page.locator('#place').innerText(),'Nhà tăng');
 assert.ok(Number(await page.locator('#scene canvas').getAttribute('data-saved-draw-calls'))>8400);
 await page.screenshot({path:'/tmp/khanh-an-residence-reference.png'});
 await page.keyboard.down('w');await page.waitForTimeout(350);await page.keyboard.up('w');
 await page.waitForTimeout(500);await page.locator('[data-place="residence"]').click();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1200);
 await page.screenshot({path:'/tmp/khanh-an-residence-mobile.png'});
 const bounds=await page.locator('[data-place="residence"]').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390);
 await page.locator('#enter').click();await page.waitForTimeout(350);
 assert.equal(await page.locator('#place').innerText(),'Chính điện · Tầng 1/3');
 assert.deepEqual(errors,[]);console.log('Đạt: nhà tăng mới, góc nhìn toàn cảnh, chuyển sang di chuyển, điện thoại và trở lại chính điện.');
}finally{await browser.close();}
