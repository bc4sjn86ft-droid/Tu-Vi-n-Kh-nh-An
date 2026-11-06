import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {setHalo,animateHalo} from '../src/halo.js';
test('Halo remains upright behind the head for all reward levels and follows facing direction',()=>{const character=new THREE.Group();for(let level=1;level<=3;level++){setHalo(character,level);const halo=character.userData.halo;assert.equal(halo.position.y,2.14);assert.ok(halo.position.z<-.5);animateHalo(character,10);assert.equal(halo.rotation.x,0);assert.equal(halo.rotation.y,0);const ring=halo.children[0];ring.geometry.computeBoundingBox();const size=ring.geometry.boundingBox.getSize(new THREE.Vector3());assert.ok(size.x>1&&size.y>1&&size.z<.05);character.rotation.y=Math.PI;character.updateMatrixWorld(true);assert.ok(halo.getWorldPosition(new THREE.Vector3()).z>0);}setHalo(character,0);assert.equal(character.userData.halo.children.length,0);});
