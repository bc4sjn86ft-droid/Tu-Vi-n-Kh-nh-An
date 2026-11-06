import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const url=process.env.GAME_URL||'http://localhost:5173';
 await page.goto(url);await page.locator('#graphics-quality').waitFor();
 await page.waitForFunction(()=>document.fonts.check('700 220px "KhanhAnThuPhap"'));
 for(const [place,label] of [['residence','Nhà tăng'],['tower','Bảo tháp'],['bell','Tháp chuông'],['stone','Đá thư pháp']]){
  await page.locator(`[data-place="${place}"]`).click();await page.waitForTimeout(1500);
  assert.equal(await page.locator('#place').innerText(),label);
  await page.screenshot({path:`/tmp/khanh-an-revision-${place}.png`});
 }
 if(url.includes(':5173')){
  const result=await page.evaluate(async()=>{
   const {WORLD,RESIDENCE,HALL_LEVELS,HALL_FLOORS,residenceToWorld,floorHeight,canWalk}=await import('/src/world-layout.js');
   const blocked=[];let position={...residenceToWorld(0,RESIDENCE.front+1.4),y:0};
   function walk(localX,localZ){
    const end=residenceToWorld(localX,localZ),start={...position},steps=Math.ceil(Math.hypot(end.x-start.x,end.z-start.z)/.04);
    for(let step=1;step<=steps;step++){
     const x=start.x+(end.x-start.x)*step/steps,z=start.z+(end.z-start.z)*step/steps;
     if(!canWalk(x,z,position.y)){blocked.push({x,z,y:position.y});return;}
     position={x,z,y:floorHeight(x,z,position.y)};
    }
   }
   walk(0,8.2);walk(0,0);walk(-4.4,RESIDENCE.doorBays[0]);walk(-6.6,RESIDENCE.doorBays[0]);
   return {blocked,height:position.y,stoneApproach:canWalk(WORLD.welcomeStone.x,WORLD.welcomeStone.z+3,0),stoneBlocked:!canWalk(WORLD.welcomeStone.x,WORLD.welcomeStone.z,0),rearWalls:[1,2].map(index=>canWalk(WORLD.hall.x,WORLD.hall.z+HALL_FLOORS[index].wallBack,HALL_LEVELS[index]))};
  });
  assert.deepEqual(result.blocked,[]);assert.ok(Math.abs(result.height-.36)<.001);assert.deepEqual(result.rearWalls,[false,false]);assert.equal(result.stoneApproach,true);assert.equal(result.stoneBlocked,true);
 }
 await page.setViewportSize({width:390,height:844});await page.locator('[data-place="stone"]').click();await page.waitForTimeout(800);
 await page.screenshot({path:'/tmp/khanh-an-revision-stone-mobile.png'});
 assert.deepEqual(errors,[]);console.log('Đạt: nhà tăng xoay, cửa đi được trong toàn cảnh, vị trí chuông–tháp, phông thư pháp tải nội bộ và tường sau kín.');
}finally{await browser.close();}
