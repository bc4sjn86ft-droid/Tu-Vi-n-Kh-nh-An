import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CHARACTER_SCALE,WALK_SPEED,applyCharacterPose,createMovementController} from '../src/character-motion.js';
import {CAMPUS_BOUNDS,canWalk} from '../src/world-layout.js';
import {buildCourtyard,COURTYARD_TOP} from '../src/courtyard.js';
import {buildPerimeter} from '../src/perimeter.js';

test('Nhân vật giữ tỷ lệ giảm 30% trong mọi tư thế',()=>{
 const character=new THREE.Group();character.userData.baseScale=CHARACTER_SCALE;
 character.userData.legs=[new THREE.Group(),new THREE.Group()];character.userData.arms=[new THREE.Group(),new THREE.Group()];character.userData.model=new THREE.Group();
 for(const action of ['idle','walk','kneel','bow','meditate','idle']){
  applyCharacterPose(character,action,1.4);assert.deepEqual(character.scale.toArray(),[.7,.7,.7]);
 }
 assert.equal(character.scale.y,.7);assert.equal(character.userData.model.position.y,0);
});

test('Di chuyển tăng 30%, tăng tốc mượt và không chạy chéo nhanh hơn',()=>{
 assert.equal(WALK_SPEED,2.6*1.3);
 function travel(dx,dz){const controller=createMovementController(),position=new THREE.Vector3(-4,0,24);let result;for(let frame=0;frame<60;frame++)result=controller.update({position,dx,dz,theta:0,dt:1/60,height:0});return {controller,position,result};}
 const straight=travel(0,1),diagonal=travel(1,1);
 assert.ok(straight.result.speed>3.379&&straight.result.speed<=WALK_SPEED);assert.ok(Math.abs(straight.result.speed-diagonal.result.speed)<1e-9);
 assert.ok(Math.abs(straight.position.distanceTo(new THREE.Vector3(-4,0,24))-diagonal.position.distanceTo(new THREE.Vector3(-4,0,24)))<1e-9);
 straight.controller.stop();const stopped=straight.controller.update({position:straight.position,dx:0,dz:0,theta:0,dt:1/60,height:0});assert.equal(stopped.distance,0);
});

function helpers(){
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
 const box=(width,height,depth,color,parent,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 return {scene,box,mat:()=>material,cyl:(top,bottom,height,color,parent,x,y,z)=>box(top*2,height,bottom*2,color,parent,x,y,z)};
}

test('Sân chỉ có một lớp gạch, không có mặt phẳng trùng cao độ',()=>{
 const context=helpers(),yard=buildCourtyard(context),tiles=yard.getObjectByName('Lớp gạch sân duy nhất'),matrix=new THREE.Matrix4(),position=new THREE.Vector3();
 assert.equal(yard.children.length,2);assert.equal(tiles.count,22*21);
 for(let index=0;index<tiles.count;index++){tiles.getMatrixAt(index,matrix);position.setFromMatrixPosition(matrix);assert.ok(Math.abs(position.y+.04-COURTYARD_TOP)<1e-7);}
 const base=yard.getObjectByName('Nền dưới mạch gạch');assert.ok(base.position.y+base.geometry.parameters.height/2<COURTYARD_TOP-.08);
});

test('Tường bao kín bốn cạnh, chừa lối đi tại cổng chính',()=>{
 const context=helpers(),wall=buildPerimeter(context),bounds=CAMPUS_BOUNDS;
 assert.equal(wall.children.length,5);
 for(const [x,z] of [[bounds.minX,0],[bounds.maxX,0],[0,bounds.minZ],[0,bounds.maxZ]])assert.equal(canWalk(x,z,0),false);
 assert.equal(canWalk((bounds.gateLeft+bounds.gateRight)/2,bounds.maxZ-.1,0),true);
});
