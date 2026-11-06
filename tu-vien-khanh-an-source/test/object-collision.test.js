import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildObjectColliders,clearObjectColliders,objectBlocks,objectSurfaceHeight} from '../src/object-collision.js';
import {createMovementController} from '../src/character-motion.js';
import {HALL_CUSHIONS,floorHeight,canWalk,WORLD} from '../src/world-layout.js';

afterEach(clearObjectColliders);

test('Vật thể đặc chặn nhân vật kể cả khi bị ẩn; đồ ở tầng khác không chặn',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial(),wall=new THREE.Mesh(new THREE.BoxGeometry(.12,3,4),material);wall.position.set(-3,1.5,24);scene.add(wall);
 assert.equal(buildObjectColliders(scene),1);wall.visible=false;
 assert.equal(objectBlocks(-3,24,0),true);assert.equal(objectBlocks(-3.3,24,0),false);assert.equal(objectBlocks(-3,24,4),false);
 assert.equal(canWalk(-3,24,0),false);
 const position=new THREE.Vector3(-5,0,24),controller=createMovementController();
 for(let frame=0;frame<10;frame++)controller.update({position,dx:1,dz:0,theta:0,dt:.5,height:0});
 assert.ok(position.x<-3.27,'Bước dài không được xuyên tường mỏng');
 material.dispose();wall.geometry.dispose();
});

test('Bệ thấp có mặt đứng phía trên, không phải đi xuyên qua',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial(),platform=new THREE.Mesh(new THREE.BoxGeometry(2,.2,2),material);platform.position.set(-4,.1,24);scene.add(platform);buildObjectColliders(scene);
 assert.ok(Math.abs(objectSurfaceHeight(-4,24,0)-.2)<1e-6);
 assert.equal(objectBlocks(-4,24,.2),false);assert.equal(objectBlocks(-4,24,0),true);
 assert.ok(floorHeight(-4,24,0)>.19);assert.equal(canWalk(-4,24,0),true);
 material.dispose();platform.geometry.dispose();
});

test('Đi bộ bước lên và xuống bồ đoàn ở cả ba tầng',()=>{
 for(const seat of [HALL_CUSHIONS[0],HALL_CUSHIONS.find(seat=>seat.level===2),HALL_CUSHIONS.find(seat=>seat.level===3)]){
  const position=new THREE.Vector3(seat.x-1.1,seat.y,seat.z),controller=createMovementController();let maximum=seat.y;
  for(let frame=0;frame<41;frame++){
   controller.update({position,dx:1,dz:0,theta:0,dt:1/60,height:position.y});position.y=floorHeight(position.x,position.z,position.y);maximum=Math.max(maximum,position.y);
  }
  assert.ok(maximum>=seat.y+.359);assert.equal(position.y,seat.y);
 }
 assert.equal(WORLD.quanAm.x,WORLD.pond.x);assert.ok(WORLD.quanAm.z<WORLD.pond.z);
});
