import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildPond} from '../src/pond.js';
import {buildIncenseBurner} from '../src/incense-burner.js';
import {treePlacementAllowed} from '../src/living-world.js';
import {WORLD,POND,POND_BRIDGE,HALL_CUSHIONS,pondBridgeHeight,floorHeight,canWalk,nearQuanAm} from '../src/world-layout.js';
import {buildObjectColliders,clearObjectColliders} from '../src/object-collision.js';
import {buildWindowWall} from '../src/hall-windows.js';

afterEach(clearObjectColliders);

function context(){
 const scene=new THREE.Scene(),materials=new Map();
 const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color}));return materials.get(color);};
 const mesh=(geometry,color,parent=scene,x=0,y=0,z=0)=>{const object=new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);object.position.set(x,y,z);parent.add(object);return object;};
 const box=(width,height,depth,color,parent,x,y,z)=>mesh(new THREE.BoxGeometry(width,height,depth),color,parent,x,y,z);
 const cyl=(top,bottom,height,color,parent,x,y,z,segments=24)=>mesh(new THREE.CylinderGeometry(top,bottom,height,segments),color,parent,x,y,z);
 const ball=(radius,color,parent,x,y,z,scale=[1,1,1])=>{const object=mesh(new THREE.SphereGeometry(radius,16,12),color,parent,x,y,z);object.scale.set(...scale);return object;};
 const line=(points,color,radius,parent)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),24,radius,6),color,parent);
 return {scene,mesh,box,cyl,ball,line,mat};
}

test('Hồ dài thêm 20%, cầu đi được từ sân qua hồ tới Quan Âm',()=>{
 assert.equal(POND.radiusZ/POND.radiusX,1.2);const helpers=context();buildPond(helpers);buildObjectColliders(helpers.scene);
 let height=0;
 for(let z=POND_BRIDGE.rampFront+.3;z>=WORLD.quanAm.z+4.1;z-=.04){
  assert.equal(canWalk(WORLD.pond.x,z,height),true,`Cầu bị chặn tại ${z}, ${height}`);height=floorHeight(WORLD.pond.x,z,height);
 }
 assert.equal(pondBridgeHeight(0,-5),POND_BRIDGE.height);assert.equal(canWalk(3,-5,0),false);
 assert.ok(nearQuanAm({x:0,y:height,z:WORLD.quanAm.z+4.1}));
 assert.ok(helpers.scene.getObjectByName('Cầu dọc hồ dẫn tới Quan Âm'));
});

test('Cây không đặt trong khoảng mái và mặt bằng công trình',()=>{
 for(const [x,z,scale] of [[8,8,.7],[8,15,.7],[8,22,.7],[6,-10,.85],[32,15,.9],[-15,8,.8],[-6,-8,.85]])assert.equal(treePlacementAllowed(x,z,scale),false);
 assert.equal(treePlacementAllowed(-38,25,.7),true);
});

test('Cửa sổ là khoảng mở cao có chớp gỗ, không phải ảnh trên tường kín',()=>{
 const helpers=context(),wall=buildWindowWall(helpers,helpers.scene,{span:8,base:0,x:0,z:0}),windows=[];wall.traverse(object=>{if(object.name==='Cửa sổ cao chớp gỗ')windows.push(object);});assert.equal(windows.length,2);
 wall.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(-2,2.2,2),new THREE.Vector3(0,0,-1));
 assert.equal(ray.intersectObject(wall,true).length,0);
});

test('Lư hương đá có lòng bát rỗng và 28 cánh sen phù điêu',()=>{
 const helpers=context(),urn=buildIncenseBurner(helpers),petals=[];urn.traverse(object=>{if(object.name==='Cánh sen phù điêu')petals.push(object);});assert.equal(petals.length,28);
 assert.ok(urn.getObjectByName('Bát hương rỗng lòng'));const bounds=new THREE.Box3().setFromObject(urn);assert.ok(bounds.max.y>2.7);assert.ok(bounds.max.x-bounds.min.x>2.4);
 urn.traverse(object=>{if(object.geometry)for(const value of object.geometry.attributes.position.array)assert.ok(Number.isFinite(value));});
});

test('Bồ đoàn bổ sung ở hai tầng dưới, không bịt lối giữa phía trước',()=>{
 assert.equal(HALL_CUSHIONS.filter(seat=>seat.level===1).length,28);assert.equal(HALL_CUSHIONS.filter(seat=>seat.level===2).length,10);
 assert.ok(!HALL_CUSHIONS.some(seat=>seat.level===1&&Math.abs(seat.x-WORLD.hall.x)<1&&seat.z-WORLD.hall.z>6));
});
