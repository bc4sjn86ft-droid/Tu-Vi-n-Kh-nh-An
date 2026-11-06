import * as THREE from 'three';
import {CAMPUS_BOUNDS,WORLD,POND,inHall,residenceSurfaces,floorHeight,canWalk} from './world-layout.js';

export const LEAF_COLORS=['#648c40','#8aaa4b','#b9be50','#d8bf4b','#e2cb65'];
export function courtyardLeafAllowed(x,z){
 return !inHall(x,z)&&!residenceSurfaces(x,z).length&&Math.hypot((x-WORLD.pond.x)/(POND.radiusX+.7),(z-WORLD.pond.z)/(POND.radiusZ+.7))>1&&Math.abs(floorHeight(x,z,0))<.001&&canWalk(x,z,0);
}

export function courtyardLeafPositions(){
 const leaves=[],bounds=CAMPUS_BOUNDS;let seed=7413;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let row=bounds.minZ+1.8;row<bounds.maxZ-1.8;row+=2.8)for(let column=bounds.minX+1.8;column<bounds.maxX-1.8;column+=2.8){
  const x=column+(random()-.5)*2,z=row+(random()-.5)*2,angle=random()*Math.PI*2,scale=.7+random()*.6;
  if(courtyardLeafAllowed(x,z))leaves.push({x,z,angle,scale,color:Math.floor(random()*LEAF_COLORS.length),cleared:false});
 }
 return leaves;
}

export function createCourtyardLeaves(scene){
 const shape=new THREE.Shape();shape.moveTo(0,-.32);shape.bezierCurveTo(-.22,-.1,-.15,.18,0,.33);shape.bezierCurveTo(.16,.12,.2,-.12,0,-.32);
 const geometry=new THREE.ShapeGeometry(shape,4),material=new THREE.MeshBasicMaterial({color:'#ffffff',side:THREE.DoubleSide});
 const leaves=courtyardLeafPositions(),mesh=new THREE.InstancedMesh(geometry,material,leaves.length),transform=new THREE.Object3D();
 mesh.name='Lá xanh vàng rải khắp sân';mesh.userData.noCollision=true;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;
 leaves.forEach((leaf,index)=>mesh.setColorAt(index,new THREE.Color(LEAF_COLORS[leaf.color])));scene.add(mesh);
 let wasSweeping=false;
 function update(sweep=null){
  if(!sweep&&!wasSweeping&&mesh.userData.initialized)return;
  for(const [index,leaf]of leaves.entries()){
   const nearby=sweep&&Math.hypot(leaf.x-sweep.x,leaf.z-sweep.z)<3.5,amount=nearby?Math.max(0,Math.min(1,sweep.amount)):0;
   transform.position.set(leaf.x+amount*.9,.026+Math.sin(amount*Math.PI)*.18,leaf.z+amount*.5);
   transform.rotation.set(-Math.PI/2,0,leaf.angle+amount*.7);transform.scale.setScalar(leaf.cleared?0:leaf.scale*(1-amount*.85));transform.updateMatrix();mesh.setMatrixAt(index,transform.matrix);
  }
  mesh.instanceMatrix.needsUpdate=true;mesh.userData.initialized=true;wasSweeping=!!sweep;
 }
 update();
 return {mesh,update,clearNear(x,z){for(const leaf of leaves)if(Math.hypot(leaf.x-x,leaf.z-z)<3.5)leaf.cleared=true;wasSweeping=true;update();}};
}
