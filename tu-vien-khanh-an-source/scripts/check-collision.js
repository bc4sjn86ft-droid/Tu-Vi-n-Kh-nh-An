import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:5173');await page.locator('canvas').waitFor();
 const result=await page.evaluate(async()=>{
  const {WORLD,HALL_LEVELS,HALL_FLOORS,HALL_STAIRS,HALL_LANDINGS,HALL_CUSHIONS,floorHeight,canWalk}=await import('/src/world-layout.js');
  const blocked=[];
  for(const side of [-1,1]){
   let position={x:WORLD.hall.x,z:WORLD.hall.z+HALL_STAIRS[0].start+.5,y:0};
   function walk(x,z){
    const start={...position},steps=Math.ceil(Math.hypot(x-start.x,z-start.z)/.05);
    for(let step=1;step<=steps;step++){
     const nextX=start.x+(x-start.x)*step/steps,nextZ=start.z+(z-start.z)*step/steps;
     if(!canWalk(nextX,nextZ,position.y)){blocked.push({x:nextX,z:nextZ,y:position.y});return;}
     position={x:nextX,z:nextZ,y:floorHeight(nextX,nextZ,position.y)};
    }
   }
   walk(WORLD.hall.x,WORLD.hall.z+HALL_STAIRS[0].end);
   for(const index of [0,1]){
    const branch=HALL_STAIRS.find(stair=>stair.bottom===HALL_LEVELS[index]&&stair.x*side>0),landing=HALL_LANDINGS[index],central=HALL_STAIRS.find(stair=>stair.bottom===landing.height);
    walk(WORLD.hall.x,WORLD.hall.z+HALL_FLOORS[index].front-.6);
    walk(WORLD.hall.x+branch.x,WORLD.hall.z+HALL_FLOORS[index].front-.6);
    walk(WORLD.hall.x+branch.x,WORLD.hall.z+branch.start);walk(WORLD.hall.x+branch.x,WORLD.hall.z+branch.end);
    walk(WORLD.hall.x+branch.x,WORLD.hall.z+(landing.front+landing.back)/2);
    walk(WORLD.hall.x,WORLD.hall.z+(landing.front+landing.back)/2);
    walk(WORLD.hall.x,WORLD.hall.z+central.start);walk(WORLD.hall.x,WORLD.hall.z+central.end);
   }
  }
  return {blocked,cushions:HALL_CUSHIONS.map(seat=>({id:seat.id,walkable:canWalk(seat.x,seat.z,seat.y+.36),height:floorHeight(seat.x,seat.z,seat.y)-seat.y})),burnerBlocked:!canWalk(WORLD.incense.x,WORLD.incense.z,0),statueBlocked:!canWalk(WORLD.quanAm.x,WORLD.quanAm.z,0)};
 });
 assert.deepEqual(result.blocked,[]);for(const seat of result.cushions){assert.equal(seat.walkable,true,seat.id);assert.ok(Math.abs(seat.height-.36)<1e-6);}
 assert.equal(result.burnerBlocked,true);assert.equal(result.statueBlocked,true);assert.deepEqual(errors,[]);
 await page.locator('[data-place="pond"]').click();await page.waitForTimeout(700);await page.screenshot({path:'/tmp/khanh-an-koi-revised.png'});
 console.log('Đạt: đi từ sân lên đủ ba tầng ở hai bên với toàn bộ vật thể thực, bồ đoàn có mặt đứng, lư hương và Quan Âm chặn di chuyển.');
}finally{await browser.close();}
