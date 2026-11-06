import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createChibi,setCharacter,disposeCharacter} from '../src/character.js';
import {applyCharacterPose,CHARACTER_SCALE} from '../src/character-motion.js';
import {setHalo} from '../src/halo.js';

function characterHelpers(){
 const materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
 const mesh=(geometry,color,parent,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
 return {mat,cyl:(top,bottom,height,color,parent,x,y,z)=>mesh(new THREE.CylinderGeometry(top,bottom,height,12),color,parent,x,y,z),line:(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),12,radius,4),color,parent)};
}

function sample(character,action,duration,start=0){for(let frame=0;frame<=Math.ceil(duration*60);frame++)applyCharacterPose(character,action,start+frame/60);character.updateMatrixWorld(true);}

for(const gender of ['female','male'])test(`Cất chuỗi hạt khi làm hành động và hiện lại khi nghỉ: ${gender}`,()=>{
 const character=createChibi(characterHelpers(),gender);let time=0;
 for(const action of ['walk','jump','kneel','bow','incense','feed','sweep','meditate']){
  sample(character,action,1,time);time+=2;assert.equal(character.userData.mala.visible,false,action);
  sample(character,'idle',1,time);time+=2;assert.equal(character.userData.mala.visible,true,'Đứng nghỉ phải hiện lại chuỗi hạt');
 }
 disposeCharacter(character);
});

for(const gender of ['female','male'])test(`Tỷ lệ đồng đều, quỳ bằng khớp, lạy không xuyên sàn: ${gender}`,()=>{
 const helpers=characterHelpers(),character=createChibi(helpers,gender);setHalo(character,1);character.updateMatrixWorld(true);
 const standing=new THREE.Box3().setFromObject(character.userData.model).getSize(new THREE.Vector3());
 for(const action of ['kneel','bow','meditate','walk','idle']){
  sample(character,action,action==='meditate'?1:1.8);
  assert.deepEqual(character.scale.toArray(),[CHARACTER_SCALE,CHARACTER_SCALE,CHARACTER_SCALE]);
  assert.deepEqual(character.userData.model.scale.toArray(),[1,1,1]);assert.deepEqual(character.userData.body.scale.toArray(),[1,1,1]);assert.equal(character.rotation.x,0);
  if(action==='kneel'||action==='bow'){
   assert.ok(character.userData.knees.every(knee=>knee.rotation.x>2));
   assert.ok(character.userData.model.position.y<-.34);
   const minimum=new THREE.Box3().setFromObject(character.userData.model,true).min.y;assert.ok(minimum>-.02,`${action}: ${minimum}`);
   if(action==='bow')assert.ok(character.userData.body.rotation.x>1.4);else assert.equal(character.userData.body.rotation.x,0);
  }
 }
 sample(character,'idle',1,2);const restored=new THREE.Box3().setFromObject(character.userData.model).getSize(new THREE.Vector3());
 assert.ok(restored.distanceTo(standing)<.001);assert.ok(character.userData.knees.every(knee=>knee.rotation.x===0));
 assert.ok(Math.abs(character.userData.halo.position.y-2.14)<.001);
 setCharacter(character,helpers,gender==='male'?'female':'male');applyCharacterPose(character,'idle',4);
 assert.deepEqual(character.scale.toArray(),[.7,.7,.7]);assert.equal(character.userData.knees.length,2);disposeCharacter(character);
});

test('Một lượt lạy hạ gối, cúi thân rồi trở về đứng, không dùng thời gian tuyệt đối làm pha',()=>{
 const character=createChibi(characterHelpers(),'female');
 sample(character,'bow',.2,100);assert.ok(character.userData.body.rotation.x<.01);
 sample(character,'bow',1.8,100);assert.ok(character.userData.body.rotation.x>1.4);
 sample(character,'bow',3.5,100);sample(character,'idle',.7,103.5);
 assert.equal(character.userData.body.rotation.x,0);assert.equal(character.userData.model.position.y,0);disposeCharacter(character);
});

test('Chuyển tiếp quỳ và lạy giữ người trên sàn, không chỉ tư thế cuối',()=>{
 const character=createChibi(characterHelpers(),'female');
 for(const action of ['kneel','bow']){
  character.userData.poseState=undefined;
  for(let frame=0;frame<=210;frame++){
   applyCharacterPose(character,action,frame/60);
   if(frame%6===0){character.updateMatrixWorld(true);const minimum=new THREE.Box3().setFromObject(character.userData.model,true).min.y;assert.ok(minimum>-.025,`${action}, ${frame}: ${minimum}`);}
  }
 }
 disposeCharacter(character);
});

for(const gender of ['male','female'])test(`Bàn tay đủ ngón, giấu tràng hạt khi dâng nhang và ngồi xếp bằng: ${gender}`,()=>{
 const character=createChibi(characterHelpers(),gender),{hands,mala,legs,knees,feet,body}=character.userData;
 for(const hand of hands){assert.equal(hand.getObjectsByProperty('name','Ngón tay').length,4);assert.ok(hand.getObjectByName('Ngón cái'));assert.equal(hand.getObjectsByProperty('name','Đốt ngón tay').length,4);}
 sample(character,'incense',1);assert.equal(mala.visible,false);assert.ok(hands.every(hand=>hand.userData.fingers.every(finger=>finger.rotation.x<-.8)));
 sample(character,'meditate',1,2);assert.equal(mala.visible,false);assert.equal(body.rotation.x,0);
 for(const index of [0,1]){
  const side=index===0?-1:1,knee=knees[index].getWorldPosition(new THREE.Vector3()),ankle=feet[index].getWorldPosition(new THREE.Vector3()),toe=feet[index].localToWorld(new THREE.Vector3(0,-.05,.25)),hand=hands[index].getWorldPosition(new THREE.Vector3());
  assert.ok(side*knee.x>.25);assert.ok(Math.abs(ankle.x)<Math.abs(knee.x));assert.ok(side*toe.x<0,'Bàn chân phải hướng vào và bắt chéo trước thân');
  assert.ok(hand.distanceTo(knee)<.2,'Tay nghỉ gần đầu gối');assert.ok(hand.y>knee.y+.1,'Lòng bàn tay nằm trên mặt đầu gối, không chìm vào quần');
  const palmUp=new THREE.Vector3(0,0,1).applyQuaternion(hands[index].getWorldQuaternion(new THREE.Quaternion()));assert.ok(palmUp.y>.9);
  assert.ok(new THREE.Box3().setFromObject(legs[index]).min.y>-.025,'Chân không xuyên bồ đoàn');
 }
 sample(character,'idle',1,4);assert.equal(body.position.y,.82);assert.equal(mala.visible,true);assert.equal(character.userData.model.position.y,0);assert.ok(knees.every(knee=>knee.rotation.x===0));disposeCharacter(character);
});
