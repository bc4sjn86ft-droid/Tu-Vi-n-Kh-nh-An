import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildResidence} from '../src/residence.js';
import {WORLD,RESIDENCE,canWalk,floorHeight,residenceToWorld} from '../src/world-layout.js';
import {treePlacementAllowed} from '../src/living-world.js';
import {buildObjectColliders,clearObjectColliders} from '../src/object-collision.js';
import {batchStaticScene} from '../src/static-batching.js';

afterEach(clearObjectColliders);

function helpers(){
 const scene=new THREE.Scene(),materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
 const mesh=(geometry,color,parent=scene,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;};
 const box=(width,height,depth,color,parent,x,y,z)=>mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z);
 const cyl=(top,bottom,height,color,parent,x,y,z,segments=16)=>mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z);
 const ball=(radius,color,parent,x,y,z,scale=[1,1,1])=>{const object=mesh(new THREE.SphereGeometry(radius,12,8),color,parent,x,y,z);object.scale.set(...scale);return object;};
 const line=(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),16,radius,6),color,parent);
 const sign=(text,width,height,parent,x,y,z)=>{const object=mesh(new THREE.PlaneGeometry(width,height),mat('#654331'),parent,x,y,z);object.name=text;return object;};
 return {scene,mat,mesh,box,cyl,ball,line,sign};
}

test('Nhà tăng có hai tầng, mái ngói, đầu hồi sọc, hai tháp và bảo đỉnh',()=>{
 const context=helpers(),building=buildResidence(context),names=new Map();
 building.traverse(object=>{
  names.set(object.name,(names.get(object.name)||0)+1);
  if(object.geometry)for(const value of object.geometry.attributes.position.array)assert.ok(Number.isFinite(value));
 });
 for(const name of ['Nhà tăng · tầng 1','Nhà tăng · tầng 2','Bộ mái chính nhà tăng','Lầu mái nhỏ đầu hồi','Tháp nhà tăng có bảo đỉnh vàng','Bảo đỉnh vàng nhiều vòng','Lọng vàng trên bảo đỉnh'])assert.equal(names.get(name),1,name);
 assert.ok(names.get('Đầu hồi sọc trắng đỏ')>=3);assert.ok(names.get('Lan can đá chạm mây')>=8);assert.ok(names.get('Đèn lồng trắng dưới mái nhà tăng')>=20);assert.equal(names.get('Cờ Phật đản'),7);
 const bounds=new THREE.Box3().setFromObject(building);assert.ok(bounds.max.y>24&&bounds.max.y<26);
 assert.ok(bounds.min.x>-43&&bounds.max.x<-12);assert.ok(bounds.min.z>-39&&bounds.max.z<2);
 assert.equal(building.position.z,WORLD.residence.z);assert.equal(names.get('Cửa sổ tròn tầng dưới'),2);
 assert.equal(building.rotation.y,Math.PI/2);assert.equal(names.get('Cửa ra vào hai cánh mở'),4);
 const tower=building.getObjectByName('Tháp nhà tăng có bảo đỉnh vàng');assert.equal(tower.position.z,RESIDENCE.tower.z);assert.equal(RESIDENCE.tower.bases[0],RESIDENCE.levels[1]);
 assert.ok(tower.position.z+5.1/2<RESIDENCE.wallBack-2);assert.ok(building.getObjectByName('Hành lang tầng 2 nối tháp riêng'));
 assert.ok(building.getObjectByName('Tường đầu hồi và xà khép sát mái chính'));assert.equal(names.get('Diềm tường khép kín sát mái'),3);
 building.traverse(object=>{if(object.name==='Cờ Phật đản'){assert.equal(object.position.y,10.35);assert.ok(Math.abs(object.position.x)>RESIDENCE.wallX||object.position.z>RESIDENCE.wallFront);}});
});

test('Bậc lên và hành lang nhà tăng đi được, không xuyên thân nhà hoặc lan can',()=>{
 const context=helpers();buildResidence(context);buildObjectColliders(context.scene);
 let position={...residenceToWorld(0,RESIDENCE.front+1.3),y:0};
 function walk(x,z){
  const start={...position},steps=Math.ceil(Math.hypot(x-start.x,z-start.z)/.04);
  for(let step=1;step<=steps;step++){
   const nextX=start.x+(x-start.x)*step/steps,nextZ=start.z+(z-start.z)*step/steps;
   assert.equal(canWalk(nextX,nextZ,position.y),true,`Lối đi bị chặn tại ${nextX},${nextZ},${position.y}`);
   position={x:nextX,z:nextZ,y:floorHeight(nextX,nextZ,position.y)};
  }
 }
 function localWalk(x,z){const world=residenceToWorld(x,z);walk(world.x,world.z);}
 localWalk(0,RESIDENCE.front-.7);
 assert.ok(Math.abs(position.y-.36)<1e-6);
 localWalk(0,8.2);localWalk(0,0);
 assert.equal(canWalk(WORLD.residence.x,WORLD.residence.z,.36),true);
 localWalk(-4.4,RESIDENCE.doorBays[0]);localWalk(-6.6,RESIDENCE.doorBays[0]);localWalk(-6.6,-9.3);
 const blocked=residenceToWorld(-RESIDENCE.halfWidth+.15,0);assert.equal(canWalk(blocked.x,blocked.z,.36),false);
 const result=batchStaticScene(context.scene);assert.ok(result.savedDrawCalls>300);
 assert.equal(canWalk(position.x,position.z,position.y),true);
});

test('Khoảng trống cây theo mái mới, không chạm hồ hay chính điện',()=>{
 assert.equal(treePlacementAllowed(WORLD.residence.x+RESIDENCE.roofFront+.3,WORLD.residence.z,1),false);
 assert.equal(treePlacementAllowed(WORLD.residence.x,WORLD.residence.z-RESIDENCE.roofHalfWidth-.2,1),false);
 assert.ok(WORLD.residence.x+RESIDENCE.roofFront<-10);
});

test('Sân tầng 2 liên tục tới tháp riêng, cửa sau không chặn lối nối',()=>{
 const context=helpers();buildResidence(context);buildObjectColliders(context.scene);
 for(const [x,z]of [[4,-14],[4,-9],[0,-7],[0,RESIDENCE.wallBack],[0,-4]]){
  const world=residenceToWorld(x,z);assert.ok(Math.abs(floorHeight(world.x,world.z,5.6)-5.6)<1e-6);assert.equal(canWalk(world.x,world.z,5.6),true,`Lối nối bị chặn tại ${x}, ${z}`);
 }
});
