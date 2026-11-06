import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {WORLD,HALL_LEVELS,HALL_STAIRS,HALL_FLOORS,HALL_LANDING,HALL_LANDINGS,HALL_STAIR_CLEARANCE,floorHeight,canWalk,hallLevel} from '../src/world-layout.js';
import {buildMainHall} from '../src/main-hall.js';
import {buildObjectColliders,clearObjectColliders} from '../src/object-collision.js';

test('Tầng 1 thu hẹp bề ngang, giữ chiều dài và đường thang đối xứng',()=>{
 const floor=HALL_FLOORS[0],sides=HALL_STAIRS.filter(stair=>stair.bottom===HALL_LEVELS[0]),central=HALL_STAIRS.find(stair=>stair.bottom===HALL_LANDING.height);
 assert.ok(Math.abs(floor.halfWidth*2-26.4*.9)<1e-8);assert.ok(Math.abs(floor.front-floor.back-50.3)<1e-8);
 assert.equal(floor.wallX,10.38);assert.ok(Math.abs(floor.wallFront-floor.wallBack-28.6)<1e-8);
 assert.equal(HALL_LANDING.left,-floor.halfWidth);assert.equal(HALL_LANDING.right,floor.halfWidth);
 assert.equal(sides.length,2);assert.equal(sides[0].x,-sides[1].x);
 for(const stair of sides){assert.equal(stair.start,floor.front-HALL_STAIR_CLEARANCE.apron);assert.equal(stair.end,HALL_LANDING.front);assert.ok(stair.start-stair.end>9);assert.equal(Math.abs(stair.x),floor.halfWidth-stair.width/2-HALL_STAIR_CLEARANCE.sideAisle);assert.ok(floor.halfWidth-Math.abs(stair.x)-stair.width/2>1.59);}
 assert.equal(central.x,0);assert.equal(central.start,HALL_LANDING.back);assert.ok(central.width>7);
 for(const side of [-1,1])for(const z of [0,floor.front-.6]){
  const x=WORLD.hall.x+side*(floor.halfWidth-.5),worldZ=WORLD.hall.z+z;
  assert.equal(floorHeight(x,worldZ,HALL_LEVELS[0]),HALL_LEVELS[0]);assert.equal(canWalk(x,worldZ,HALL_LEVELS[0]),true);
 }
 assert.equal(floorHeight(WORLD.hall.x,WORLD.hall.z+31,HALL_LEVELS[0]),HALL_LEVELS[0]);
 assert.equal(canWalk(WORLD.hall.x,WORLD.hall.z+31,HALL_LEVELS[0]),true);
 assert.ok(WORLD.incense.z>WORLD.hall.z+HALL_STAIRS[0].start+1);
});

test('Ba sàn chồng nhau giữ đúng cao độ, không tự nhảy tầng',()=>{
 for(const height of HALL_LEVELS){assert.equal(floorHeight(19,-8,height),height);assert.equal(hallLevel(height),HALL_LEVELS.indexOf(height)+1);}
 assert.equal(canWalk(19,.12,0),false);
 assert.equal(canWalk(19,WORLD.hall.z+HALL_LANDINGS[1].front+.2,16.5),false);
 assert.equal(canWalk(WORLD.incense.x,WORLD.incense.z,0),true);
});

test('Chân thang xéo ngắn hơn, khoảng cách tới lan can tăng gấp đôi',()=>{
 assert.equal(HALL_STAIR_CLEARANCE.apron,1.2*2);assert.equal(HALL_STAIR_CLEARANCE.sideAisle,.8*2);
 for(const index of [0,1])for(const stair of HALL_STAIRS.filter(stair=>stair.bottom===HALL_LEVELS[index])){
  const floor=HALL_FLOORS[index];assert.equal(stair.start,floor.front-2.4);
  assert.ok(Math.abs(floor.halfWidth-Math.abs(stair.x)-stair.width/2-1.6)<1e-8);
 }
});

test('Thang giữa nối cầu ngang với rìa ngoài sàn, không chui vào trong sàn',()=>{
 for(const index of [1,2]){
  const stair=HALL_STAIRS.find(stair=>stair.x===0&&stair.top===HALL_LEVELS[index]);
  assert.equal(stair.end,HALL_FLOORS[index].front);assert.ok(stair.start>stair.end);
  for(const offset of [-stair.width/2+.1,0,stair.width/2-.1])for(const distance of [0,.1,.5,1]){
   const x=WORLD.hall.x+offset,z=WORLD.hall.z+stair.end-distance;
   assert.equal(floorHeight(x,z,stair.top),stair.top);assert.equal(canWalk(x,z,stair.top),true);
  }
 }
});

test('Hai nhánh cầu thang lên xuống liên tục qua đủ ba tầng',()=>{
 for(const side of [-1,1]){
  const ground=HALL_STAIRS[0],lowerSide=HALL_STAIRS.find(stair=>stair.bottom===HALL_LEVELS[0]&&stair.x*side>0),main=HALL_STAIRS.find(stair=>stair.bottom===HALL_LANDING.height),upperSide=HALL_STAIRS.find(stair=>stair.bottom===HALL_LEVELS[1]&&stair.x*side>0),upperMain=HALL_STAIRS.find(stair=>stair.top===HALL_LEVELS[2]);
  let position={x:WORLD.hall.x,z:WORLD.hall.z+ground.start+.5,height:0};
  function walk(localX,localZ){
   const x=WORLD.hall.x+localX,z=WORLD.hall.z+localZ,start={...position},steps=Math.ceil(Math.hypot(x-start.x,z-start.z)/.06);
   for(let step=1;step<=steps;step++){
    const nextX=start.x+(x-start.x)*step/steps,nextZ=start.z+(z-start.z)*step/steps;
    assert.ok(canWalk(nextX,nextZ,position.height),`Đường bị chặn tại ${nextX}, ${nextZ}, ${position.height}`);
    const height=floorHeight(nextX,nextZ,position.height);assert.ok(Math.abs(height-position.height)<.1);position={x:nextX,z:nextZ,height};
   }
  }
  const lowerMiddle=(HALL_LANDING.front+HALL_LANDING.back)/2,upperMiddle=(HALL_LANDINGS[1].front+HALL_LANDINGS[1].back)/2;
  walk(0,ground.end);assert.equal(position.height,HALL_LEVELS[0]);
  walk(0,ground.end-.6);walk(lowerSide.x,ground.end-.6);walk(lowerSide.x,lowerSide.start);walk(lowerSide.x,lowerSide.end);assert.ok(Math.abs(position.height-HALL_LANDING.height)<1e-9);
  walk(lowerSide.x,lowerMiddle);walk(0,lowerMiddle);walk(0,main.start);walk(0,main.end);assert.equal(position.height,HALL_LEVELS[1]);
  walk(0,main.end-.6);walk(upperSide.x,main.end-.6);walk(upperSide.x,upperSide.start);walk(upperSide.x,upperSide.end);
  walk(upperSide.x,upperMiddle);walk(0,upperMiddle);walk(0,upperMain.start);walk(0,upperMain.end);assert.equal(position.height,HALL_LEVELS[2]);
  walk(0,upperMain.start);walk(0,upperMiddle);walk(upperSide.x,upperMiddle);walk(upperSide.x,upperSide.end);walk(upperSide.x,upperSide.start);assert.equal(position.height,HALL_LEVELS[1]);
  walk(upperSide.x,main.end-.6);walk(0,main.end-.6);walk(0,main.end);walk(0,main.start);walk(0,lowerMiddle);walk(lowerSide.x,lowerMiddle);
  walk(lowerSide.x,lowerSide.end);walk(lowerSide.x,lowerSide.start);assert.equal(position.height,HALL_LEVELS[0]);
  walk(lowerSide.x,ground.end-.6);walk(0,ground.end-.6);walk(0,ground.end);walk(0,ground.start+.5);assert.equal(position.height,0);
 }
});

test('Cao độ mọi cầu thang khớp chân và chiếu nghỉ',()=>{
 for(const stair of HALL_STAIRS){
  const x=WORLD.hall.x+stair.x;
  assert.equal(floorHeight(x,WORLD.hall.z+stair.start,stair.bottom),stair.bottom);
  assert.equal(floorHeight(x,WORLD.hall.z+stair.end,stair.top),stair.top);
  for(let sample=1;sample<20;sample++){const height=stair.bottom+(stair.top-stair.bottom)*sample/20,z=WORLD.hall.z+stair.start+(stair.end-stair.start)*sample/20;assert.ok(Math.abs(floorHeight(x,z,height)-height)<1e-9);}
 }
});

test('Mô hình ba tầng có sàn, cầu thang, mái và chế độ nhìn xuyên tầng trên',()=>{
 const scene=new THREE.Scene(),material=new THREE.MeshStandardMaterial();
 const helpers={scene,mat:()=>material};
 helpers.mesh=(geometry,color,parent=scene,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,material);object.position.set(x,y,z);parent.add(object);return object;};
 helpers.box=(width,height,depth,color,parent,x,y,z)=>helpers.mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z);
 helpers.cyl=(top,bottom,height,color,parent,x,y,z,segments=8)=>helpers.mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z);
 helpers.ball=(radius,color,parent,x,y,z)=>helpers.mesh(new THREE.SphereGeometry(radius,6,4),color,parent,x,y,z);
 helpers.line=()=>new THREE.Object3D();helpers.sign=()=>{};
 const hall=buildMainHall(helpers),root=scene.getObjectByName('Chính điện ba tầng');
 for(const level of root.children.filter(child=>child.name.startsWith('Tầng '))){
  const windows=[],flags=[],lanterns=[];level.traverse(object=>{if(object.name==='Cửa sổ cao chớp gỗ')windows.push(object);if(object.name==='Cờ Phật đản')flags.push(object);if(object.name==='Đèn lồng chính điện')lanterns.push(object);});
  assert.ok(windows.length>=4);assert.ok(flags.length>=3);assert.ok(lanterns.length>=8);
  const plaque=level.getObjectByName('Hoành phi thư pháp chính điện');assert.ok(plaque);assert.equal(plaque.geometry.parameters.width,6.6);
  for(const decoration of [...flags,...lanterns].filter(object=>object.parent===plaque.parent))assert.ok(Math.abs(decoration.position.x)>4,'Đèn và cờ phải nằm ngoài khoảng trống hoành phi');
 }
 assert.equal(root.children.filter(child=>child.name==='Cầu thang đi bộ').length,HALL_STAIRS.length);
 assert.equal(root.children.filter(child=>child.name.startsWith('Tầng ')).length,3);
 assert.ok(root.getObjectByName('Chóp mái dốc hai mặt'));
 assert.ok(root.getObjectByName('Ban Phật tầng 2'));assert.ok(root.getObjectByName('Ban Phật tầng 3'));
 const lanterns=[];root.traverse(object=>{if(object.isPointLight)lanterns.push(object);});assert.equal(lanterns.length,6);
 for(const level of [1,2,3])assert.equal(lanterns.filter(light=>light.userData.level===level&&light.intensity>0).length,2);
 assert.equal(root.children.filter(child=>child.name==='Cầu nối chiếu nghỉ').length,2);
 const supports=root.getObjectsByProperty('name','Cột đỡ dưới sàn chiếu nghỉ');assert.equal(supports.length,4);
 for(const support of supports){const top=support.position.y+support.geometry.parameters.height/2,landing=HALL_LANDINGS.find(landing=>Math.abs(landing.height-top-.4)<1e-6);assert.ok(landing);assert.ok(top<landing.height-.38-.01);}
 const crown=root.getObjectByName('Chóp mái dốc hai mặt'),crownBounds=new THREE.Box3().setFromObject(crown);assert.ok(crownBounds.max.y-crownBounds.min.y>4.4);
 root.traverse(object=>{if(object.geometry){object.geometry.computeBoundingBox();assert.ok(Number.isFinite(object.geometry.boundingBox.max.y));}});
 hall.update(new THREE.Vector3(19,3.93,-8));assert.equal(root.getObjectByName('Tầng 2').visible,false);assert.equal(root.getObjectByName('Mái ngói cong').visible,false);
 const columns=[];root.traverse(object=>{if(object.name==='Cột gỗ')columns.push(object.userData.columnKey);});assert.equal(new Set(columns).size,columns.length);
 const roofs=root.children.filter(child=>child.name==='Mái ngói cong');assert.ok(roofs[0].userData.top<HALL_LEVELS[1]-.1);assert.ok(roofs[1].userData.top<HALL_LEVELS[2]-.1);
 root.updateMatrixWorld(true);
 const mainStair=HALL_STAIRS.find(stair=>stair.bottom===HALL_LANDING.height),roofBounds=new THREE.Box3().setFromObject(roofs[0]);
 assert.ok(roofBounds.max.x>WORLD.hall.x+HALL_FLOORS[0].halfWidth+1.5);
 assert.ok(roofBounds.min.x<WORLD.hall.x-HALL_FLOORS[0].halfWidth-1.5);
 assert.ok(Math.abs((roofBounds.max.x+roofBounds.min.x)/2-WORLD.hall.x)<1e-5);
 assert.ok(roofBounds.min.z<WORLD.hall.z+HALL_FLOORS[0].back-2.5);
 assert.ok(Math.abs(roofBounds.max.x-roofBounds.min.x-27.16)<1e-4);
 assert.ok(roofBounds.max.z>WORLD.hall.z+18.2);
 assert.ok(roofBounds.max.z-roofBounds.min.z>37);
 for(const surface of roofs[0].children.filter(child=>child.geometry?.index)){
  const positions=surface.geometry.attributes.position,indices=surface.geometry.index;
  for(const vertex of indices.array){
   const x=positions.getX(vertex),z=positions.getZ(vertex)+roofs[0].position.z;
   assert.ok(Math.abs(x)>=mainStair.width/2+.7-1e-5||z<=mainStair.end-.1+1e-5,'Mái che lấn vào thang giữa');
  }
 }
 const mouth=new THREE.Box3(new THREE.Vector3(WORLD.hall.x-mainStair.width/2,HALL_LEVELS[1]-.01,WORLD.hall.z+HALL_FLOORS[1].front-.08),new THREE.Vector3(WORLD.hall.x+mainStair.width/2,HALL_LEVELS[1]+1.5,WORLD.hall.z+HALL_FLOORS[1].front+.08));
 for(const railing of root.getObjectByName('Tầng 2').children.filter(child=>child.name==='Lan can đá chạm mây'))assert.equal(new THREE.Box3().setFromObject(railing).intersectsBox(mouth),false);
 const railBounds=[];root.traverse(object=>{if(object.name==='Lan can đá chạm mây')railBounds.push(new THREE.Box3().setFromObject(object));});
 for(const [index,stair] of HALL_STAIRS.entries())for(const [z,height] of [[stair.start,stair.bottom],[stair.end,stair.top]]){
  const entrance=new THREE.Box3(new THREE.Vector3(WORLD.hall.x+stair.x-stair.width/2+.05,height+.02,WORLD.hall.z+z-.4),new THREE.Vector3(WORLD.hall.x+stair.x+stair.width/2-.05,height+1.85,WORLD.hall.z+z+.4));
  for(const bounds of railBounds)assert.equal(bounds.intersectsBox(entrance),false,`Lan can chắn miệng thang ${index} tại ${z}`);
 }
 for(const landing of HALL_LANDINGS)assert.ok(landing.front-landing.back>=2.79);
 const flights=root.children.filter(child=>child.name==='Cầu thang đi bộ');
 for(const [index,stair] of HALL_STAIRS.entries()){
  const rails=flights[index].children.filter(child=>child.name==='Lan can đá chạm mây'),sloping=rails.filter(child=>child.userData.from[1]!==child.userData.to[1]);
  assert.equal(sloping.length,2);
  for(const railing of sloping){
   assert.equal(railing.userData.from[2],stair.start);assert.equal(railing.userData.from[1],stair.bottom);
   assert.equal(railing.userData.to[2],stair.end);assert.equal(railing.userData.to[1],stair.top);
   const endpoint=railing.userData.to;
   assert.ok(rails.some(link=>link!==railing&&link.userData.from.every((value,axis)=>Math.abs(value-endpoint[axis])<1e-8)),`Thiếu đoạn nối lan can đầu thang ${index}`);
  }
 }
 for(const side of [-1,1])for(const index of [0,1]){
  const branch=HALL_STAIRS.find(stair=>stair.bottom===HALL_LEVELS[index]&&stair.x*side>0),landing=HALL_LANDINGS[index];
  for(const [z,height] of [[HALL_FLOORS[index].front-.6,HALL_LEVELS[index]],[(landing.back+landing.front)/2,landing.height]]){
   const corridor=new THREE.Box3(new THREE.Vector3(WORLD.hall.x+Math.min(0,branch.x)-.3,height+.02,WORLD.hall.z+z-.3),new THREE.Vector3(WORLD.hall.x+Math.max(0,branch.x)+.3,height+1.85,WORLD.hall.z+z+.3));
   for(const bounds of railBounds)assert.equal(bounds.intersectsBox(corridor),false,`Lan can chắn lối rẽ tầng ${index+1}, phía ${side}`);
  }
 }
 hall.update(new THREE.Vector3(19,HALL_LEVELS[2],-8));assert.equal(root.getObjectByName('Tầng 3').visible,true);
 hall.update(new THREE.Vector3(0,0,18));assert.equal(root.getObjectByName('Mái ngói cong').visible,true);
 buildObjectColliders(scene);
 try{
  for(const stair of HALL_STAIRS)for(let sample=0;sample<=40;sample++){
   const z=stair.start+(stair.end-stair.start)*sample/40,height=stair.bottom+(stair.top-stair.bottom)*sample/40;
   assert.equal(canWalk(WORLD.hall.x+stair.x,WORLD.hall.z+z,height),true,`Vật thể chắn giữa thang tại ${stair.x}, ${z}`);
  }
 }finally{clearObjectColliders();}
 root.traverse(object=>object.geometry?.dispose());material.dispose();
});

test('Tường sau và vách hai bên chặn di chuyển nhưng cửa chính vẫn đi được',()=>{
 assert.equal(canWalk(WORLD.hall.x+HALL_FLOORS[0].wallX,-8,HALL_LEVELS[0]),false);
 assert.equal(canWalk(19,WORLD.hall.z+HALL_FLOORS[0].wallBack,HALL_LEVELS[0]),false);
 assert.equal(canWalk(27,WORLD.hall.z+HALL_FLOORS[0].wallFront,HALL_LEVELS[0]),false);
 assert.equal(canWalk(19,WORLD.hall.z+HALL_FLOORS[0].wallFront,HALL_LEVELS[0]),true);
 assert.equal(canWalk(19,-6.4,HALL_LEVELS[1]),true);
});
