import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildEntranceGate} from '../src/entrance-gate.js';
import {buildPerimeter} from '../src/perimeter.js';
import {WORLD,CAMPUS_BOUNDS,canWalk} from '../src/world-layout.js';
import {buildObjectColliders,clearObjectColliders} from '../src/object-collision.js';
import {batchStaticScene} from '../src/static-batching.js';

afterEach(clearObjectColliders);
function helpers(){
 const scene=new THREE.Scene(),materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
 const mesh=(geometry,color,parent=scene,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
 const box=(width,height,depth,color,parent,x,y,z)=>mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z);
 const cyl=(top,bottom,height,color,parent,x,y,z,segments=8)=>mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z);
 const line=(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),32,radius,6),color,parent);
 return {scene,mat,mesh,box,cyl,line};
}

test('Cổng tam quan có ba mái, biển thư pháp và trụ ngoài nối trực tiếp tường bao',()=>{
 const context=helpers(),gate=buildEntranceGate(context);buildPerimeter(context);
 assert.equal(WORLD.gate.z,CAMPUS_BOUNDS.maxZ);
 assert.equal(WORLD.gate.x,(CAMPUS_BOUNDS.gateLeft+CAMPUS_BOUNDS.gateRight)/2);
 const names=new Map();gate.traverse(object=>{names.set(object.name,(names.get(object.name)||0)+1);if(object.geometry)for(const value of object.geometry.attributes.position.array)assert.ok(Number.isFinite(value));});
 assert.equal(names.get('Mái ngói xám cổng'),3);assert.equal(names.get('Trụ đá cổng'),4);
 assert.equal(names.get('Cổng phụ có cửa gỗ'),2);assert.equal(names.get('Cửa chính mở vào sân'),2);
 assert.equal(gate.getObjectByName('Biển thư pháp cổng').userData.inscription,'Tu Viện Khánh An');
 gate.updateMatrixWorld(true);
 const posts=gate.children.filter(object=>object.name==='Trụ đá cổng').map(object=>new THREE.Box3().setFromObject(object));
 for(const x of [CAMPUS_BOUNDS.gateLeft,CAMPUS_BOUNDS.gateRight])assert.ok(posts.some(bounds=>bounds.containsPoint(new THREE.Vector3(x,1,CAMPUS_BOUNDS.maxZ))));
 const bounds=new THREE.Box3().setFromObject(gate);assert.ok(bounds.max.y>7&&bounds.max.y<8);
});

test('Lối giữa thông thoáng, cửa phụ và hai mối nối tường chặn xuyên vật thể',()=>{
 const context=helpers();buildEntranceGate(context);buildPerimeter(context);buildObjectColliders(context.scene);
 function check(){
  for(const offset of [-1.7,0,1.7])for(let z=WORLD.gate.z-3;z<=WORLD.gate.z;z+=.1)assert.equal(canWalk(WORLD.gate.x+offset,z,0),true);
  for(const offset of [-5.5,-4.15,-2.65,2.65,4.15,5.5])assert.equal(canWalk(WORLD.gate.x+offset,WORLD.gate.z-.1,0),false);
 }
 check();assert.ok(batchStaticScene(context.scene).savedDrawCalls>100);check();
});
