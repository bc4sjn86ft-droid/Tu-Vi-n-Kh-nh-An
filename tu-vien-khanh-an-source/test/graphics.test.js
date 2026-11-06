import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {batchStaticScene} from '../src/static-batching.js';
import {GRAPHICS_PROFILES,adaptivePixelRatio} from '../src/graphics.js';
import {buildObjectColliders,objectBlocks,clearObjectColliders} from '../src/object-collision.js';

test('Độ phân giải tự động giảm khi chậm, phục hồi có giới hạn',()=>{
 assert.equal(adaptivePixelRatio(1.25,30,1.25),1.1);
 assert.equal(adaptivePixelRatio(.65,20,1.25),.65);
 assert.equal(adaptivePixelRatio(.8,60,1.25),.9);
 assert.equal(adaptivePixelRatio(1.25,60,1.25),1.25);
 assert.equal(adaptivePixelRatio(1,50,1.25),1);
 assert.equal(GRAPHICS_PROFILES.smooth.shadows,false);
 assert.ok(GRAPHICS_PROFILES.balanced.ratio<GRAPHICS_PROFILES.high.ratio);
});

test('Gộp vật thể tĩnh giữ vị trí, vật liệu, hiển thị và va chạm',()=>{
 const scene=new THREE.Scene(),parent=new THREE.Group(),material=new THREE.MeshStandardMaterial();parent.position.set(4,0,1);parent.rotation.y=.3;scene.add(parent);
 for(let index=0;index<5;index++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.4,2,.4),material);mesh.position.set(index*.6,1,0);parent.add(mesh);}
 const originalBounds=new THREE.Box3().setFromObject(parent);
 try{
  buildObjectColliders(scene);assert.equal(objectBlocks(4,1,0),true);
  const result=batchStaticScene(scene);assert.equal(result.sourceMeshes,5);assert.equal(result.batches,1);assert.equal(result.savedDrawCalls,4);
  assert.equal(parent.children.length,1);assert.equal(parent.children[0].material,material);
  assert.ok(new THREE.Box3().setFromObject(parent).min.distanceTo(originalBounds.min)<.00001);
  assert.ok(new THREE.Box3().setFromObject(parent).max.distanceTo(originalBounds.max)<.00001);
  parent.visible=false;assert.equal(parent.children[0].parent.visible,false);
  assert.equal(objectBlocks(4,1,0),true);
 }finally{clearObjectColliders();}
});

test('Không gộp vật thể động, trong suốt hoặc xuyên nhóm hiển thị',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
 const moving=new THREE.Mesh(new THREE.BoxGeometry(),material);moving.userData.noBatch=true;scene.add(moving);
 const transparent=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({transparent:true,opacity:.5}));scene.add(transparent);
 for(let index=0;index<3;index++){const parent=new THREE.Group();parent.add(new THREE.Mesh(new THREE.BoxGeometry(),material));scene.add(parent);}
 const result=batchStaticScene(scene);assert.equal(result.batches,0);assert.equal(moving.parent,scene);assert.equal(transparent.parent,scene);
});
