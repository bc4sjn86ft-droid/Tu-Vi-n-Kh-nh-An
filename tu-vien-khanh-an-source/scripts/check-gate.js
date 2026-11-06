import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:5173');await page.locator('#graphics-quality').waitFor();
 const blocked=await page.evaluate(async()=>{
  const {WORLD,canWalk}=await import('/src/world-layout.js'),blocked=[];
  for(const offset of [-1.7,0,1.7])for(let z=WORLD.gate.z-3;z<=WORLD.gate.z;z+=.1)if(!canWalk(WORLD.gate.x+offset,z,0))blocked.push({offset,z});
  return blocked;
 });
 assert.deepEqual(blocked,[]);
 await page.evaluate(async()=>{
  const THREE=await import('/node_modules/three/build/three.module.js');
  const {buildEntranceGate}=await import('/src/entrance-gate.js'),{buildPerimeter}=await import('/src/perimeter.js'),{WORLD}=await import('/src/world-layout.js');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#d5d8cd');
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1440,1000);renderer.setPixelRatio(1);
  renderer.domElement.style.cssText='position:fixed;inset:0;z-index:99999';document.body.appendChild(renderer.domElement);
  const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.85});
  const mesh=(geometry,color,parent=scene,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
  const box=(width,height,depth,color,parent,x,y,z)=>mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z);
  const cyl=(top,bottom,height,color,parent,x,y,z,segments=8)=>mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z);
  const line=(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),32,radius,6),color,parent);
  buildEntranceGate({scene,mat,mesh,box,line});buildPerimeter({scene,box,cyl});box(100,.2,100,'#c9c1aa',scene,0,-.2,0);
  scene.add(new THREE.HemisphereLight('#fff5e3','#73816d',2));const light=new THREE.DirectionalLight('#fff1d5',2.5);light.position.set(-10,20,55);scene.add(light);
  const camera=new THREE.PerspectiveCamera(40,1.44,.1,200);camera.position.set(WORLD.gate.x+1,7,WORLD.gate.z+22);camera.lookAt(WORLD.gate.x,3.5,WORLD.gate.z);
  await document.fonts.load('700 150px "KhanhAnThuPhap"');await new Promise(resolve=>requestAnimationFrame(resolve));renderer.render(scene,camera);
 });
 await page.screenshot({path:'/tmp/khanh-an-gate-reference.png'});assert.deepEqual(errors,[]);
 console.log('Đạt: lối giữa cổng trong toàn cảnh thông thoáng, cổng tham chiếu dựng không lỗi, biển thư pháp tải được.');
}finally{await browser.close();}
