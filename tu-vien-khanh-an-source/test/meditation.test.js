import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {HALL_CUSHIONS,HALL_LEVELS,CUSHION_DIMENSIONS,floorHeight,canWalk,WORLD} from '../src/world-layout.js';
import {nearestCushion,applyMeditationPose} from '../src/meditation.js';

test('Bồ đoàn nằm trên đúng sàn; chỉ chọn chỗ gần và cùng tầng',()=>{
 assert.equal(new Set(HALL_CUSHIONS.map(seat=>seat.id)).size,HALL_CUSHIONS.length);
 for(const seat of HALL_CUSHIONS){
  assert.equal(floorHeight(seat.x,seat.z,seat.y),seat.y+CUSHION_DIMENSIONS.top);assert.equal(canWalk(seat.x,seat.z,seat.y),true);
  assert.equal(floorHeight(seat.x+1.1,seat.z,seat.y+CUSHION_DIMENSIONS.top),seat.y);
  assert.equal(nearestCushion({x:seat.x,z:seat.z,y:seat.y+CUSHION_DIMENSIONS.top}).id,seat.id);
  assert.equal(nearestCushion({x:seat.x+.3,z:seat.z,y:seat.y}).id,seat.id);
  assert.equal(nearestCushion({x:seat.x,z:seat.z,y:seat.y+1},[seat]),null);
 }
 assert.equal(nearestCushion({x:0,y:0,z:18}),null);
 assert.equal(floorHeight(WORLD.hall.x,-19,HALL_LEVELS[0]),HALL_LEVELS[0]);
});

test('Tư thế ngồi gập chân và khôi phục đầy đủ khi đứng',()=>{
 const character=new THREE.Group();character.userData.legs=[new THREE.Group(),new THREE.Group()];character.userData.arms=[new THREE.Group(),new THREE.Group()];
 applyMeditationPose(character,true);assert.ok(character.userData.legs[0].rotation.x<-.8);assert.equal(character.scale.y,1);
 applyMeditationPose(character,false);assert.equal(character.scale.y,1);character.userData.legs.forEach(leg=>{assert.equal(leg.rotation.x,0);assert.equal(leg.rotation.y,0);assert.equal(leg.rotation.z,0);assert.equal(leg.position.y,.78);});
});
