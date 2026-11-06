import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildQuanAm} from '../src/quan-am.js';
import {WORLD,HALL_FLOORS} from '../src/world-layout.js';

test('Quan Âm ngồi tự tại có chân co, chân buông, bàn tay, mão và áo rủ 3D',()=>{
 const scene=new THREE.Scene(),materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
 const mesh=(geometry,material,parent,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;};
 const statue=buildQuanAm({scene,mesh,mat,sign:()=>{}});
 assert.equal(scene.children.length,1);assert.deepEqual(statue.position.toArray(),[WORLD.quanAm.x,0,WORLD.quanAm.z]);
 for(const name of ['Đế đá nguyên khối','Tảng đá ngồi','Đầu gối chân co','Bàn chân buông','Tay thả trên gối','Tay chống trên bệ','Khuôn mặt Quan Âm','Mão Quan Âm chạm cánh sen'])assert.ok(statue.getObjectByName(name),name);
 assert.ok(statue.getObjectByName('Đầu gối chân co').position.y>statue.getObjectByName('Hông ngồi').position.y);
 assert.ok(statue.getObjectByName('Bàn chân buông').position.y<statue.getObjectByName('Bàn chân đặt trên bệ').position.y-1);
 assert.ok(statue.getObjectByName('Tay thả trên gối').position.x<0);assert.ok(statue.getObjectByName('Tay chống trên bệ').position.x>0);
 const drape=statue.getObjectByName('Vạt áo chân buông');assert.ok(drape.geometry.attributes.position.count>3000);assert.equal(drape.material.side,THREE.DoubleSide);
 const bounds=new THREE.Box3().setFromObject(statue);assert.ok(bounds.max.y>6.2);assert.ok(bounds.min.y>=-1e-6);
 assert.ok(bounds.max.x<WORLD.hall.x-HALL_FLOORS[0].halfWidth-.2);
 statue.traverse(object=>{
  if(!object.geometry)return;
  for(const attribute of ['position','normal'])for(const value of object.geometry.attributes[attribute].array)assert.ok(Number.isFinite(value));
  object.geometry.dispose();
 });
 drape.material.dispose();for(const material of materials.values())material.dispose();
});
