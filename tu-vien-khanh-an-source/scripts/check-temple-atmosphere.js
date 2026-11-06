import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true,args:['--autoplay-policy=user-gesture-required']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 await page.route('https://www.youtube.com/iframe_api',route=>route.fulfill({contentType:'application/javascript',body:`window.__youtubeCalls=[];window.YT={Player:class{constructor(mount,options){this.options=options;const frame=document.createElement('iframe');frame.title='YouTube';frame.width=224;frame.height=200;mount.replaceWith(frame);setTimeout(()=>options.events.onReady(),0);}setVolume(value){window.__youtubeCalls.push(['volume',value]);}unMute(){}playVideo(){window.__youtubeCalls.push(['play']);}pauseVideo(){window.__youtubeCalls.push(['pause']);}}};window.onYouTubeIframeAPIReady();`}));
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const Native=window.AudioContext;window.__audioTones=[];
  window.AudioContext=class extends Native{
   constructor(...args){super(...args);window.__audioContext=this;}
   createOscillator(){const oscillator=super.createOscillator(),start=oscillator.start.bind(oscillator);oscillator.start=(...args)=>{window.__audioTones.push(oscillator.frequency.value);return start(...args);};return oscillator;}
   createDynamicsCompressor(){const compressor=super.createDynamicsCompressor(),connect=compressor.connect.bind(compressor);compressor.connect=destination=>{const analyser=this.createAnalyser();window.__audioAnalyser=analyser;connect(analyser);return analyser.connect(destination);};return compressor;}
  };
 });
 const url=process.env.GAME_URL||'http://localhost:5173';await page.goto(url);await page.locator('#graphics-quality').waitFor();
 assert.equal(await page.locator('#youtube-music iframe').count(),1);assert.equal(await page.locator('#music').getAttribute('aria-pressed'),'true');
 await page.locator('[data-place="bell"]').click();await page.waitForFunction(()=>window.__audioContext?.state==='running');
 const volume=page.locator('#music-volume');assert.equal(await volume.inputValue(),'80');
 await page.waitForFunction(()=>window.__youtubeCalls?.some(call=>call[0]==='play'));
 await volume.fill('0');await volume.dispatchEvent('input');assert.ok(await page.evaluate(()=>window.__youtubeCalls.some(call=>call[0]==='volume'&&call[1]===0)));
 await volume.fill('90');await volume.dispatchEvent('input');assert.ok(await page.evaluate(()=>window.__youtubeCalls.some(call=>call[0]==='volume'&&call[1]===90)));
 const button=page.locator('#bell-button');await button.waitFor();await page.waitForTimeout(250);
 const before=await page.evaluate(()=>window.__audioTones.length);await button.click();
 await page.waitForFunction(count=>window.__audioTones.length>=count+5,before);assert.equal(await button.isDisabled(),true);
 await page.waitForTimeout(500);await page.screenshot({path:'/tmp/khanh-an-bell-ritual.png'});
 await page.locator('#music').click();assert.equal(await page.locator('#music').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('#youtube-music').isVisible(),false);assert.ok(await page.evaluate(()=>window.__youtubeCalls.some(call=>call[0]==='pause')));
 await page.locator('[data-place="yard"]').click();
 const ritual=await page.evaluate(()=>window.__audioTones.length);await page.locator('[data-action="bow"]').click();await page.waitForFunction(count=>window.__audioTones.length>=count+5,ritual);assert.ok(Math.abs(await page.evaluate(index=>window.__audioTones[index],ritual)-138.59)<.001);
 await page.locator('#effects-audio').click();assert.equal(await page.locator('#effects-audio').getAttribute('aria-pressed'),'false');
 const muted=await page.evaluate(()=>window.__audioTones.length);await page.locator('[data-action="kneel"]').click();await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.__audioTones.length),muted);
 await page.locator('#effects-audio').click();await page.locator('[data-place="incense"]').click();const incense=await page.evaluate(()=>window.__audioTones.length);await page.locator('[data-action="incense"]').click();await page.waitForFunction(count=>window.__audioTones.length>=count+5,incense);assert.ok(Math.abs(await page.evaluate(index=>window.__audioTones[index],incense)-138.59)<.001);await page.waitForTimeout(1100);await page.screenshot({path:'/tmp/khanh-an-incense-ritual.png'});
 if(url.includes(':5173')){
  const detail=await page.evaluate(async()=>{
   const THREE=await import('/node_modules/three/build/three.module.js'),{createClouds}=await import('/src/sky.js'),{WORLD}=await import('/src/world-layout.js');
   const clouds=createClouds(new THREE.Scene());return {sprites:clouds.group.children.filter(object=>object.isSprite).length,stoneZ:WORLD.welcomeStone.z};
  });assert.equal(detail.sprites,16);assert.equal(detail.stoneZ,29.5);
 }
 await page.reload();await page.locator('#graphics-quality').waitFor();assert.equal(await volume.inputValue(),'90');assert.equal(await page.locator('#music').getAttribute('aria-pressed'),'false');assert.equal(await page.locator('#effects-audio').getAttribute('aria-pressed'),'true');
 await page.setViewportSize({width:390,height:844});await page.locator('[data-place="bell"]').click();await button.waitFor();const bounds=await button.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=390);
 assert.deepEqual(errors,[]);console.log('Đạt: điều khiển YouTube qua API giả lập, âm lễ và cooldown, tắt riêng/lưu âm lượng, nhang và nút chuông trên điện thoại.');
}finally{await browser.close();}
