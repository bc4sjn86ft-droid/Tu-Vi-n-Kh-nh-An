import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({channel:'chromium',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:850}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:5173/src/character.js');
 const result=await page.evaluate(async()=>{
  const THREE=await import('/node_modules/.vite/deps/three.js'),{createChibi}=await import('/src/character.js'),{applyCharacterPose}=await import('/src/character-motion.js');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#ded6ca');
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1440,850);renderer.setPixelRatio(1);document.body.style.margin='0';document.body.replaceChildren(renderer.domElement);
  const camera=new THREE.PerspectiveCamera(34,1440/850,.1,60);camera.position.set(5.2,4.8,9.5);camera.lookAt(0,.6,0);
  scene.add(new THREE.HemisphereLight('#ffffff','#9b8872',2.5));const sun=new THREE.DirectionalLight('#fff1d4',3);sun.position.set(-3,6,5);scene.add(sun);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({color:'#c5b49d'}));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
  const grid=new THREE.GridHelper(30,60,'#afa28e','#b8ab96');grid.position.y=-.015;scene.add(grid);
  const materials=new Map(),mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
  const mesh=(geometry,color,parent,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
  const helpers={mat,cyl:(top,bottom,height,color,parent,x,y,z)=>mesh(new THREE.CylinderGeometry(top,bottom,height,20),color,parent,x,y,z),line:(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),24,radius,6),color,parent)};
  const poses=['idle','kneel','bow','meditate'],characters=[];
  for(const [row,gender] of ['female','male'].entries())for(const [column,action] of poses.entries()){
   const character=createChibi(helpers,gender);character.name=`${gender}: ${action}`;character.position.set((column-1.5)*2,0,(row-.5)*3.3);character.rotation.y=.15;scene.add(character);
   for(let frame=0;frame<=108;frame++)applyCharacterPose(character,action,frame/60);
   characters.push(character);
  }
  renderer.render(scene,camera);
  return characters.map(character=>({name:character.name,scale:character.scale.toArray(),bodyScale:character.userData.body.scale.toArray(),minimum:new THREE.Box3().setFromObject(character.userData.model,true).min.y}));
 });
 await page.screenshot({path:'/tmp/khanh-an-postures.png'});
 for(const state of result){assert.deepEqual(state.scale,[.7,.7,.7]);assert.deepEqual(state.bodyScale,[1,1,1]);assert.ok(state.minimum>-.06,`${state.name}: hình học xuyên sàn ${state.minimum}`);}
 assert.deepEqual(errors,[]);console.log('Đạt: hai nhân vật thu nhỏ đồng đều; đứng, quỳ, lạy và ngồi không bóp méo hình học.');
}finally{await browser.close();}
