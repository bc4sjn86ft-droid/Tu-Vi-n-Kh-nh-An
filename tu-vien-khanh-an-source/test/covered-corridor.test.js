import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCoveredCorridors} from '../src/covered-corridor.js';
import {buildObjectColliders,clearObjectColliders,objectBlocks} from '../src/object-collision.js';
import {batchStaticScene} from '../src/static-batching.js';

test('Hành lang có cột son, xà sơn thủy, mái ngói và lối giữa thông thoáng',()=>{
 const scene=new THREE.Scene(),materials=new Map(),mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
 const mesh=(geometry,color,parent,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
 const box=(width,height,depth,color,parent,x,y,z)=>mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z),cyl=(top,bottom,height,color,parent,x,y,z)=>mesh(new THREE.CylinderGeometry(top,bottom,height,12),color,parent,x,y,z),line=()=>new THREE.Object3D();
 const corridors=buildCoveredCorridors({scene,mat,mesh,box,cyl,line});assert.equal(corridors.children.length,2);
 assert.equal(corridors.getObjectsByProperty('name','Cột son hành lang').length,36);assert.equal(corridors.getObjectsByProperty('name','Hoành phi sơn thủy dưới xà').length,18);
 assert.equal(corridors.getObjectsByProperty('name','Sàn đá hành lang duy nhất').length,2);assert.equal(corridors.getObjectsByProperty('name','Mái hành lang ngói cong').length,4);
 buildObjectColliders(scene);
 try{for(const x of [-10,36])for(let z=-4;z<=20;z+=.2)assert.equal(objectBlocks(x,z,.2),false,`${x}, ${z}`);assert.ok(batchStaticScene(scene).savedDrawCalls>200);}finally{clearObjectColliders();}
});
