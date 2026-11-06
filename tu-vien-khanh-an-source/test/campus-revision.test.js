import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildMemorialTowers} from '../src/memorial-tower.js';
import {buildWelcomeStone} from '../src/welcome-stone.js';
import {buildMainHall} from '../src/main-hall.js';
import {WORLD,MEMORIAL_TOWERS,HALL_LEVELS,HALL_FLOORS,placeName,canWalk} from '../src/world-layout.js';
import {buildObjectColliders,clearObjectColliders} from '../src/object-collision.js';
import {treePlacementAllowed} from '../src/living-world.js';
import {createPineRow} from '../src/pine-billboards.js';

afterEach(clearObjectColliders);

test('Hàng tùng Nhật sau Quan Âm dùng chung một texture billboard',()=>{
 const scene=new THREE.Scene(),row=createPineRow(scene);assert.equal(row.children.length,7);
 assert.ok(row.children.every(tree=>tree.isSprite&&tree.position.z<WORLD.quanAm.z-10&&!tree.castShadow&&!tree.material.depthWrite));
 assert.equal(new Set(row.children.map(tree=>tree.material.map)).size,1);assert.equal(buildObjectColliders(scene),0);
});
function helpers(){
 const scene=new THREE.Scene(),materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
 const mesh=(geometry,color,parent=scene,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
 const box=(width,height,depth,color,parent,x,y,z)=>mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z);
 const cyl=(top,bottom,height,color,parent,x,y,z,segments=16)=>mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z);
 const ball=(radius,color,parent,x,y,z,scale=[1,1,1])=>{const object=mesh(new THREE.SphereGeometry(radius,12,8),color,parent,x,y,z);object.scale.set(...scale);return object;};
 const line=(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),16,radius,6),color,parent);
 const sign=(text,width,height,parent,x,y,z)=>mesh(new THREE.PlaneGeometry(width,height),mat('#665533'),parent,x,y,z);
 return {scene,mat,mesh,box,cyl,ball,line,sign};
}

test('Chuông và bảo tháp đổi vị trí; tháp có mái cong, cửa đỏ, chóp vàng',()=>{
 assert.deepEqual(WORLD.bell,{x:-29,z:23});assert.deepEqual(WORLD.tower,{x:-35,z:10});
 const context=helpers(),group=buildMemorialTowers(context),roofs=[];
 group.traverse(object=>{if(object.name==='Mái tháp đá bốn góc vút')roofs.push(object);if(object.geometry)for(const value of object.geometry.attributes.position.array)assert.ok(Number.isFinite(value));});
 assert.equal(group.children.length,2);assert.equal(roofs.length,5);
 for(const [index,tower] of group.children.entries()){
  assert.equal(tower.position.x,MEMORIAL_TOWERS[index].x);assert.equal(tower.position.z,MEMORIAL_TOWERS[index].z);
 }
 buildObjectColliders(context.scene);assert.equal(canWalk(WORLD.tower.x,WORLD.tower.z,0),false);
 assert.equal(placeName(WORLD.bell.x,WORLD.bell.z+4.7),'Tháp chuông');assert.equal(placeName(WORLD.tower.x,WORLD.tower.z+5.2),'Bảo tháp');
});

test('Đá thư pháp có hình khối, dòng chữ đúng và va chạm riêng',()=>{
 const context=helpers(),group=buildWelcomeStone(context),boulder=group.getObjectByName('Tảng đá dựng khắc chữ');
 assert.equal(boulder.userData.inscription,'TU VIỆN KHÁNH AN');
 const bounds=new THREE.Box3().setFromObject(group);assert.ok(bounds.max.y>5.5);assert.ok(bounds.min.x>4&&bounds.max.x<11);
 assert.deepEqual(WORLD.welcomeStone,{x:7.5,z:29.5});assert.equal(group.position.x,WORLD.welcomeStone.x);assert.equal(group.position.z,WORLD.welcomeStone.z);
 assert.equal(treePlacementAllowed(8,29,.7),false);
 buildObjectColliders(context.scene);assert.equal(canWalk(WORLD.welcomeStone.x,WORLD.welcomeStone.z,0),false);assert.equal(canWalk(0,WORLD.welcomeStone.z,0),true);
 assert.equal(canWalk(-6.8,28,0),true);assert.equal(canWalk(WORLD.welcomeStone.x,WORLD.welcomeStone.z+3,0),true);
 assert.equal(placeName(WORLD.welcomeStone.x,WORLD.welcomeStone.z+3),'Đá thư pháp');
});

test('Mặt tường chân chính điện không còn cụm lá và hoa xuyên ra ngoài',()=>{
 const context=helpers();buildMainHall(context);
 const hall=context.scene.getObjectByName('Chính điện ba tầng');
 assert.equal(hall.children.filter(object=>object.isInstancedMesh).length,0);
});

test('Tường sau tầng 2–3 kín cả tâm, có pháp luân và hoa sen',()=>{
 const context=helpers();buildMainHall(context);
 for(const index of [1,2]){
  const floor=HALL_FLOORS[index],height=HALL_LEVELS[index],level=context.scene.getObjectByName(`Tầng ${index+1}`);
  const relief=level.getObjectByName('Phù điêu Phật giáo trên tường kín');assert.equal(relief.userData.level,index+1);assert.ok(relief.getObjectByName('Pháp luân tám nan'));
  let lotuses=0;relief.traverse(object=>{if(object.name==='Hoa sen phù điêu')lotuses++;});assert.equal(lotuses,2);
  context.scene.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(WORLD.hall.x,height+1.8,WORLD.hall.z+floor.wallBack-1),new THREE.Vector3(0,0,1));
  const walls=[];level.traverse(object=>{if(object.name==='Tường sau ban Phật kín')walls.push(object);});assert.ok(ray.intersectObjects(walls,true).length>0);
  assert.equal(canWalk(WORLD.hall.x,WORLD.hall.z+floor.wallBack,height),false);
 }
});
