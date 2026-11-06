import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:5173');await page.locator('canvas').waitFor();
 for(const gender of ['female','male']){
  const states=await page.evaluate(async gender=>{
   const THREE=await import('/node_modules/three/build/three.module.js'),{createChibi,disposeCharacter}=await import('/src/character.js'),{applyCharacterPose}=await import('/src/character-motion.js');
   window.__characterCheck?.();
   const scene=new THREE.Scene();scene.background=new THREE.Color('#e5e0d5');
   const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1200,800);document.body.append(renderer.domElement);renderer.domElement.style.cssText='position:fixed;inset:0;width:1200px;height:800px;z-index:10000';
   const camera=new THREE.PerspectiveCamera(34,1.5,.1,50);camera.position.set(1.7,2.5,7);camera.lookAt(0,.95,0);scene.add(new THREE.HemisphereLight('#fff8ee','#87775f',2.5));const light=new THREE.DirectionalLight('#ffffff',3);light.position.set(-3,5,5);scene.add(light);
   const materials=new Map(),mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.7}));return materials.get(color);};
   const mesh=(geometry,color,parent,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
   const helpers={mat,cyl:(top,bottom,height,color,parent,x,y,z,segments=12)=>mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z),line:(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),12,radius,5),color,parent)};
   const characters=[],states=[];
   for(const [index,action]of ['idle','incense','meditate'].entries()){
    const character=createChibi(helpers,gender);character.position.x=(index-1)*1.65;character.rotation.y=-.12;scene.add(character);characters.push(character);
    if(action==='meditate'){helpers.cyl(.52,.58,.36,'#b77a48',scene,character.position.x,.18,0,32);character.position.y=.36;}
    for(let frame=0;frame<=120;frame++)applyCharacterPose(character,action,frame/60);
    states.push({action,beads:character.userData.mala.visible,fingers:character.userData.hands.map(hand=>hand.userData.fingers.length)});
   }
   renderer.render(scene,camera);window.__characterCheck=()=>{characters.forEach(disposeCharacter);materials.forEach(material=>material.dispose());renderer.dispose();renderer.domElement.remove();};return states;
  },gender);
  assert.deepEqual(states.map(state=>state.beads),[true,false,false]);assert.ok(states.every(state=>state.fingers.every(count=>count===4)));
  await page.screenshot({path:`/tmp/khanh-an-character-${gender}.png`});
 }
 assert.deepEqual(errors,[]);console.log('Đạt: bàn tay nam/nữ, tràng hạt theo hành động và tư thế xếp bằng; ảnh kiểm tra trong /tmp/khanh-an-character-*.png.');
}finally{await browser.close();}
