import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildBellTower} from '../src/bell-tower.js';
import {createClouds} from '../src/sky.js';
import {createChibi,setCharacter} from '../src/character.js';
import {applyCharacterPose} from '../src/character-motion.js';
import {buildObjectColliders,clearObjectColliders} from '../src/object-collision.js';
import {batchStaticScene} from '../src/static-batching.js';
import {WORLD,HALL_FLOORS,nearBell,canWalk,floorHeight} from '../src/world-layout.js';
import {createTempleAudio,BELL_PARTIALS} from '../src/audio.js';

afterEach(clearObjectColliders);
function helpers(){
 const scene=new THREE.Scene(),materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
 const mesh=(geometry,color,parent=scene,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
 const box=(width,height,depth,color,parent,x,y,z)=>mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z);
 const cyl=(top,bottom,height,color,parent,x,y,z,segments=12)=>mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z);
 const line=(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),20,radius,5),color,parent);
 return {scene,mat,mesh,box,cyl,line};
}

test('Bia lùi sát chân tường hơn nhưng không chồng bệ hoặc cầu thang',()=>{
 const wallFront=WORLD.hall.z+HALL_FLOORS[0].front;
 assert.ok(WORLD.welcomeStone.z-wallFront>2&&WORLD.welcomeStone.z-wallFront<4);
 assert.ok(WORLD.welcomeStone.x<WORLD.hall.x-6);
});

test('Tháp chuông mái vút, ô cửa gỗ, chuông và dùi động giữ được sau gộp hình',()=>{
 const context=helpers(),bell=buildBellTower(context);
 for(const name of ['Mái chuông bốn góc vút','Đại hồng chung','Dùi thỉnh chuông'])assert.ok(bell.tower.getObjectByName(name));
 const bounds=new THREE.Box3().setFromObject(bell.tower);assert.ok(bounds.max.y>7.8);
 assert.equal(bell.tower.getObjectsByProperty('name','Đao mây góc mái').length,4);
 const peak=bell.tower.getObjectByName('Chóp nhọn mái chuông');assert.ok(peak.position.y>9.2);
 const posts=bell.tower.getObjectsByProperty('name','Cột nối tới kèo mái');assert.equal(posts.length,4);
 for(const post of posts){const bounds=new THREE.Box3().setFromObject(post);assert.ok(bounds.min.y<=5.41&&bounds.max.y>7);}
 const log=bell.tower.getObjectByName('Gỗ gõ dọc hướng tâm chuông');assert.equal(log.rotation.x,Math.PI/2);assert.equal(log.rotation.z,0);
 buildObjectColliders(context.scene);
 assert.equal(nearBell({x:WORLD.bell.x,z:WORLD.bell.z+4.7,y:0}),true);
 assert.equal(nearBell({x:WORLD.bell.x,z:WORLD.bell.z,y:12.5}),false);
 assert.equal(canWalk(WORLD.bell.x,WORLD.bell.z,0),false);
 let height=0;for(let z=WORLD.bell.z+4;z>WORLD.bell.z+2;z-=.05){assert.equal(canWalk(WORLD.bell.x,z,height),true);height=floorHeight(WORLD.bell.x,z,height);}
 assert.ok(height>.34&&height<.4);
 batchStaticScene(context.scene);bell.strike(10);bell.update(10.2);assert.ok(Math.abs(bell.tower.getObjectByName('Dùi thỉnh chuông').rotation.x)>.1);bell.update(15);assert.equal(bell.tower.getObjectByName('Dùi thỉnh chuông').rotation.x,0);
});

test('Mây chỉ gồm 16 billboard dùng chung một texture, không tạo va chạm',()=>{
 const scene=new THREE.Scene(),clouds=createClouds(scene);assert.equal(clouds.group.children.length,16);
 assert.ok(clouds.group.children.every(object=>object.isSprite&&!object.material.depthWrite));
 assert.equal(new Set(clouds.group.children.map(object=>object.material.map)).size,1);
 assert.equal(buildObjectColliders(scene),0);const start=clouds.group.children[0].position.x;clouds.update(30);assert.notEqual(clouds.group.children[0].position.x,start);
});

for(const gender of ['male','female'])test(`Ba nén nhang, vái nhẹ và khói chỉ hiện khi dâng hương: ${gender}`,()=>{
 const context=helpers(),character=createChibi(context,gender);
 for(let frame=0;frame<150;frame++)applyCharacterPose(character,'incense',frame/60);
 const prop=character.userData.incense;assert.equal(prop.visible,true);assert.equal(prop.getObjectsByProperty('name','Nén nhang').length,3);
 character.updateMatrixWorld(true);const heldAt=prop.getWorldPosition(new THREE.Vector3());
 for(const forearm of character.userData.forearms)assert.ok(forearm.localToWorld(new THREE.Vector3(0,-.24,.04)).distanceTo(heldAt)<.15);
 assert.ok(character.userData.body.rotation.x>0&&character.userData.body.rotation.x<.1);
 const smoke=prop.getObjectByName('Khói nhang billboard');assert.equal(smoke.children.length,8);assert.ok(smoke.children.every(object=>object.isSprite&&object.material.opacity>=0&&object.material.opacity<.24));
 const first=smoke.children[0].position.y;applyCharacterPose(character,'incense',2.8);assert.notEqual(smoke.children[0].position.y,first);
 applyCharacterPose(character,'idle',3);assert.equal(prop.visible,false);assert.deepEqual(character.scale.toArray(),[.7,.7,.7]);
 setCharacter(character,context,gender==='male'?'female':'male');assert.equal(character.getObjectsByProperty('name','Ba nén nhang trong tay').length,1);
});

test('Nhạc mặc định bật, hai nút tắt độc lập và âm chuông có đuôi ngân hữu hạn',async()=>{
 const nodes=[],values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
 const button=()=>({classList:{toggle(){}},dataset:{},setAttribute(){}}),musicButton=button(),effectsButton=button();
 const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(value){this.value=value;}});
 class Context{
  constructor(){this.state='suspended';this.currentTime=1;this.destination={};}
  resume(){this.state='running';return Promise.resolve();}
  createGain(){return {gain:param(),connect(){},disconnect(){}};}
  createDynamicsCompressor(){return {connect(){}};}
  createOscillator(){const oscillator={frequency:param(),connect(){},disconnect(){},start(){},stop(time){this.stopAt=time;}};nodes.push(oscillator);return oscillator;}
 }
 const volumeInput={value:''},youtube={enabled:true,volume:.8,setEnabled(value){this.enabled=value;},setVolume(value){this.volume=value;},unlock(){}};
 const audio=createTempleAudio({musicButton,effectsButton,volumeInput,storage,AudioContextClass:Context,musicFactory:()=>youtube});await audio.unlock();assert.equal(audio.state().music,true);assert.equal(volumeInput.value,'80');
 const musicStart=nodes.length;audio.update();assert.equal(nodes.length,musicStart);
 volumeInput.value='95';volumeInput.oninput();assert.equal(audio.state().musicVolume,.95);assert.equal(values.get('khanhan-music-volume'),'0.95');assert.equal(youtube.volume,.95);
 musicButton.onclick();assert.equal(audio.state().music,false);assert.equal(audio.state().sounds,true);assert.equal(values.get('khanhan-music'),'off');assert.equal(youtube.enabled,false);
 const before=nodes.length;audio.play('bell');assert.equal(nodes.length-before,BELL_PARTIALS.length);assert.ok(nodes.slice(before).every(node=>node.stopAt<10));
 for(const action of ['kneel','bow','incense']){const start=nodes.length;audio.play(action);assert.equal(nodes.length-start,5);assert.equal(nodes[start].frequency.value,138.59);}
 effectsButton.onclick();const muted=nodes.length;audio.play('bow');assert.equal(nodes.length,muted);
 const restored=createTempleAudio({storage,AudioContextClass:null});assert.equal(restored.state().music,false);assert.equal(restored.state().sounds,false);
 assert.equal(restored.state().musicVolume,.95);
});
