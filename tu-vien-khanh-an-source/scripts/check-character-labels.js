import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const errors=[],url=process.env.GAME_URL||'http://localhost:5173';
 async function visitor(){
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>{
   localStorage.setItem('khanhan-music','off');localStorage.setItem('khanhan-name','Bạn Bình An');
   const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);this.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.type==='welcome')window.__playerId=message.id;});}};
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(url);await page.waitForFunction(()=>window.__playerId);return {page,context,id:await page.evaluate(()=>window.__playerId)};
 }
 const first=await visitor(),second=await visitor();
 const label=(page,id)=>page.locator(`.character-label[data-character-id="${id}"]`);
 await label(first.page,second.id).waitFor();assert.equal(await label(first.page,first.id).locator('.character-name').innerText(),'Bạn Bình An');
 assert.equal(await label(second.page,first.id).locator('.character-name').innerText(),'Bạn Bình An');
 const message='Chúc bạn an lành <img src=x onerror=alert(1)>';
 await first.page.locator('#chat-input').fill(message);await first.page.locator('#chat-input').press('Enter');
 for(const page of [first.page,second.page]){
  const bubble=label(page,first.id).locator('.character-speech');await bubble.waitFor();assert.equal(await bubble.innerText(),message);assert.equal(await bubble.locator('img').count(),0);
  const bounds=await bubble.boundingBox();assert.ok(bounds.y>76&&bounds.y+bounds.height<1000,'Bong bóng nằm trong vùng cảnh, không bị đẩy lên ngoài màn hình');
  assert.equal(await label(page,second.id).locator('.character-speech').isVisible(),false);
 }
 await first.page.screenshot({path:'/tmp/khanh-an-chat-overhead.png'});
 await label(first.page,first.id).locator('.character-speech').waitFor({state:'hidden',timeout:7000});await label(second.page,first.id).locator('.character-speech').waitFor({state:'hidden',timeout:2000});
 await second.context.close();await label(first.page,second.id).waitFor({state:'detached'});
 await first.page.locator('#profile').click();await first.page.locator('#name-input').fill('Thiện Tâm');await first.page.locator('#save-name').click();assert.equal(await label(first.page,first.id).locator('.character-name').innerText(),'Thiện Tâm');
 if(url.includes(':5173')){
  const result=await first.page.evaluate(async()=>{
   const THREE=await import('/node_modules/three/build/three.module.js'),{createMonks}=await import('/src/living-world.js');const calls=[],scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial(),mesh=(geometry,parent,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;};
   const helpers={scene,mat:()=>material,cyl:(top,bottom,height,color,parent,x,y,z)=>mesh(new THREE.CylinderGeometry(top,bottom,height,6),parent,x,y,z),ball:(radius,color,parent,x,y,z)=>mesh(new THREE.SphereGeometry(radius,6,4),parent,x,y,z),line:()=>new THREE.Object3D()};
   const monks=createMonks(helpers,{position:new THREE.Vector3(17,0,12)},()=>{},{track(){},say(character,text,options){calls.push({name:character.name,text,typing:options.typing});}});
   monks.update(100,0);const automatic=calls.length;monks.update(100.5,0);const withoutRepeat=calls.length;document.querySelectorAll('.npc-talk')[1].click();document.querySelectorAll('.npc-talk')[1].remove();scene.traverse(object=>object.geometry?.dispose());material.dispose();return {automatic,withoutRepeat,calls};
  });assert.ok(result.automatic>0);assert.equal(result.automatic,result.withoutRepeat);assert.ok(result.calls.length>result.automatic);assert.ok(result.calls.every(call=>call.typing&&call.text.length>10));
 }
 await first.page.setViewportSize({width:390,height:844});await first.page.waitForTimeout(300);await first.page.screenshot({path:'/tmp/khanh-an-names-mobile.png'});
 assert.deepEqual(errors,[]);console.log('Đạt: tên người chơi, hai người trùng tên, chat đúng người/ẩn sau 5 giây, chống HTML, đổi tên/rời phòng và lời chào NPC chạy chữ.');
}finally{await browser.close();}
