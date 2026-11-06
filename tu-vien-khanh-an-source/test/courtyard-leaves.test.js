import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {courtyardLeafAllowed,courtyardLeafPositions,createCourtyardLeaves,LEAF_COLORS} from '../src/courtyard-leaves.js';

test('Lá xanh vàng rải đều sân, tránh nhà và hồ, vị trí tái lập được',()=>{
 const leaves=courtyardLeafPositions();assert.deepEqual(leaves,courtyardLeafPositions());assert.ok(leaves.length>300&&leaves.length<900);
 for(const leaf of leaves)assert.ok(courtyardLeafAllowed(leaf.x,leaf.z));
 for(const side of [-1,1])for(const end of [-1,1])assert.ok(leaves.filter(leaf=>leaf.x*side>4&&leaf.z*end>4).length>10);
 assert.equal(new Set(leaves.map(leaf=>leaf.color)).size,LEAF_COLORS.length);
 assert.equal(courtyardLeafAllowed(19,-8),false);assert.equal(courtyardLeafAllowed(0,-5),false);assert.equal(courtyardLeafAllowed(-25,-8),false);
});

test('Lá dùng một InstancedMesh, quét cục bộ và không cập nhật ma trận lúc đứng yên',()=>{
 const scene=new THREE.Scene(),leaves=createCourtyardLeaves(scene),positions=courtyardLeafPositions(),matrix=new THREE.Matrix4();
 assert.equal(scene.children.length,1);assert.ok(leaves.mesh.isInstancedMesh);assert.equal(leaves.mesh.count,positions.length);assert.equal(leaves.mesh.userData.noCollision,true);
 const version=leaves.mesh.instanceMatrix.version;leaves.update();assert.equal(leaves.mesh.instanceMatrix.version,version);
 const first=positions[0],far=positions.findIndex(leaf=>Math.hypot(leaf.x-first.x,leaf.z-first.z)>10);
 leaves.update({x:first.x,z:first.z,amount:.5});leaves.mesh.getMatrixAt(0,matrix);assert.ok(matrix.elements[13]>.026);
 leaves.update();leaves.mesh.getMatrixAt(0,matrix);assert.ok(Math.abs(matrix.elements[13]-.026)<1e-6);
 leaves.clearNear(first.x,first.z);leaves.mesh.getMatrixAt(0,matrix);assert.equal(new THREE.Vector3().setFromMatrixScale(matrix).length(),0);leaves.mesh.getMatrixAt(far,matrix);assert.ok(new THREE.Vector3().setFromMatrixScale(matrix).length()>0);
 assert.equal(leaves.mesh.castShadow,false);assert.equal(leaves.mesh.material.type,'MeshBasicMaterial');
});
