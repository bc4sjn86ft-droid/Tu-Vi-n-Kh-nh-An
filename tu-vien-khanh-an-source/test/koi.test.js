import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createKoi} from '../src/koi.js';
import {WORLD} from '../src/world-layout.js';

test('Cá koi có vây, đuôi hai thùy và biến dạng bơi liên tục trong hồ',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial(),ball=(radius,color,parent,x=0,y=0,z=0)=>{const object=new THREE.Mesh(new THREE.SphereGeometry(radius,8,6),material);object.position.set(x,y,z);parent.add(object);return object;};
 const koi=createKoi({scene,ball});assert.equal(koi.school.length,12);
 const first=koi.school[0],positions=first.parts[0].geometry.attributes.position;
 for(const name of ['Thân cá thuôn mềm','Đuôi cá xòe hai thùy','Vây ngực mềm','Vây lưng'])assert.ok(first.fish.getObjectByName(name));
 koi.update(1,-1);const before=Float32Array.from(positions.array);koi.update(1+1/60,-1);
 let changed=0;for(let vertex=0;vertex<positions.count;vertex++){const delta=Math.abs(positions.getX(vertex)-before[vertex*3]);assert.ok(delta<.01);if(delta>1e-7)changed++;}assert.ok(changed>100);
 for(let time=0;time<20;time+=.2){
  koi.update(time,time-4);
  for(const {fish,parts,heart} of koi.school){
   assert.ok(fish.position.y<.32,'Cá chỉ ngoi nhẹ lên mặt nước, không nhảy');
   assert.ok(Math.hypot(fish.position.x-WORLD.pond.x,fish.position.z-WORLD.pond.z)<3.5);
   for(const {geometry} of parts)for(const value of geometry.attributes.normal.array)assert.ok(Number.isFinite(value));
  }
 }
 koi.update(50,1.5);assert.ok(koi.school.every(({heart})=>heart.visible));assert.equal(new Set(koi.school.map(({heart})=>heart.material.map)).size,1);
 koi.update(55,8);assert.ok(koi.school.every(({heart})=>!heart.visible));
 scene.traverse(object=>{if(object.geometry)object.geometry.dispose();if(object.material&&object.material!==material)object.material.dispose();});material.dispose();
});
