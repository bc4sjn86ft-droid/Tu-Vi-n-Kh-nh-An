import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildResidence} from '../src/residence.js';
import {buildMainHall} from '../src/main-hall.js';
import {RESIDENCE,HALL_LEVELS,residenceToWorld,floorHeight} from '../src/world-layout.js';
import {batchStaticScene} from '../src/static-batching.js';

function helpers({roofLines=false}={}){
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
 const context={scene,mat:()=>material};
 context.mesh=(geometry,color,parent=scene,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;};
 context.box=(width,height,depth,color,parent,x,y,z)=>context.mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z);
 context.cyl=(top,bottom,height,color,parent,x,y,z,segments=8)=>context.mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z);
 context.ball=(radius,color,parent,x,y,z)=>context.mesh(new THREE.SphereGeometry(radius,6,4),color,parent,x,y,z);
 context.line=roofLines?(points,color,radius,parent)=>context.mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),32,radius,6),color,parent):()=>new THREE.Object3D();context.sign=()=>{};
 return context;
}

test('Mái và đầu hồi nằm hoàn toàn dưới đáy sàn trên, kể cả gờ ngói sau gộp hình',()=>{
 const context=helpers({roofLines:true});buildMainHall(context);
 const root=context.scene.getObjectByName('Chính điện ba tầng'),roofs=root.children.filter(object=>object.name==='Mái ngói cong'),gables=root.children.filter(object=>object.name==='Đầu hồi mái');
 assert.equal(gables.length,2);
 const covered=[{object:roofs[0],floor:HALL_LEVELS[1]},{object:roofs[1],floor:HALL_LEVELS[2]},...gables.map(object=>({object,floor:HALL_LEVELS[1]}))];
 for(const batched of [false,true]){
  if(batched)batchStaticScene(context.scene);
  for(const {object,floor} of covered){
   const bounds=new THREE.Box3().setFromObject(object);
   assert.ok(bounds.max.y<=floor-.32-.1,`${object.name} trồi lên đáy sàn: ${bounds.max.y}`);
  }
 }
});

test('Lớp hoàn thiện nhà tăng tách khỏi sàn thô, giữ nguyên cao độ trước và sau gộp hình',()=>{
 const context=helpers(),building=buildResidence(context);
 for(const [index,height] of RESIDENCE.levels.entries()){
  const floor=building.getObjectByName(`Nhà tăng · tầng ${index+1}`),[base,finish]=floor.children;
  const baseTop=base.position.y+base.geometry.parameters.height/2,finishBottom=finish.position.y-finish.geometry.parameters.height/2;
  assert.ok(finishBottom-baseTop>=.009);
  assert.ok(Math.abs(finish.position.y+finish.geometry.parameters.height/2-height)<1e-6);
 }
 for(const batched of [false,true]){
  if(batched)batchStaticScene(context.scene);
  context.scene.updateMatrixWorld(true);
  for(const height of RESIDENCE.levels)for(const localX of [0,6.6]){
   const point=residenceToWorld(localX,0),ray=new THREE.Raycaster(new THREE.Vector3(point.x,height+.03,point.z),new THREE.Vector3(0,-1,0),0,.04);
   const hits=ray.intersectObject(building,true);
   assert.equal(hits.length,1,`Mỗi điểm sàn chỉ có một mặt trên (${batched}, ${height}, ${localX})`);
   assert.ok(Math.abs(hits[0].point.y-height)<1e-6);
   assert.equal(floorHeight(point.x,point.z,height),height);
  }
 }
});

test('Các mặt bậc thang, chiếu nghỉ và sàn chính điện không chồng diện tích cùng cao độ',()=>{
 const context=helpers();buildMainHall(context);
 const root=context.scene.getObjectByName('Chính điện ba tầng'),surfaces=[];
 root.updateMatrixWorld(true);
 for(const group of root.children){
  if(!/^(Tầng |Cầu thang đi bộ$|Cầu nối chiếu nghỉ$)/.test(group.name))continue;
  for(const object of group.children){
   const dimensions=object.geometry?.parameters;
   if(object.geometry?.type!=='BoxGeometry'||dimensions.height>.4||dimensions.depth<.05||dimensions.width<.5)continue;
   surfaces.push({bounds:new THREE.Box3().setFromObject(object),name:group.name});
  }
 }
 assert.ok(surfaces.length>100);
 for(const [index,first] of surfaces.entries())for(const second of surfaces.slice(index+1)){
  if(Math.abs(first.bounds.max.y-second.bounds.max.y)>1e-5)continue;
  const overlapX=Math.min(first.bounds.max.x,second.bounds.max.x)-Math.max(first.bounds.min.x,second.bounds.min.x);
  const overlapZ=Math.min(first.bounds.max.z,second.bounds.max.z)-Math.max(first.bounds.min.z,second.bounds.min.z);
  assert.ok(overlapX<1e-5||overlapZ<1e-5,`${first.name} và ${second.name} chồng mặt sàn`);
 }
});
