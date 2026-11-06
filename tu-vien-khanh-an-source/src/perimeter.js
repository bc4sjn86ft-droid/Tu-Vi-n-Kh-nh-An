import * as THREE from 'three';
import {CAMPUS_BOUNDS} from './world-layout.js';

export function buildPerimeter({scene,box,cyl}){
 const group=new THREE.Group();group.name='Tường bao tu viện';scene.add(group);const bounds=CAMPUS_BOUNDS;
 const segments=[[[bounds.minX,bounds.minZ],[bounds.maxX,bounds.minZ]],[[bounds.minX,bounds.minZ],[bounds.minX,bounds.maxZ]],[[bounds.maxX,bounds.minZ],[bounds.maxX,bounds.maxZ]],[[bounds.minX,bounds.maxZ],[bounds.gateLeft,bounds.maxZ]],[[bounds.gateRight,bounds.maxZ],[bounds.maxX,bounds.maxZ]]];
 for(const [from,to] of segments){
  const wall=new THREE.Group(),length=Math.hypot(to[0]-from[0],to[1]-from[1]);wall.name='Đoạn tường bao';wall.position.set(from[0],0,from[1]);wall.rotation.y=-Math.atan2(to[1]-from[1],to[0]-from[0]);group.add(wall);
  box(length,.7,.5,'#8f9690',wall,length/2,.35,0);box(length,2.35,.35,'#ded8c5',wall,length/2,1.86,0);
  for(const height of [.72,2.88])box(length,.14,.44,'#655043',wall,length/2,height,0);
  for(const side of [-1,1]){const roof=box(length+.25,.12,.55,'#50585a',wall,length/2,3.14,side*.22);roof.rotation.x=side*.35;}
  box(length+.35,.13,.15,'#616a69',wall,length/2,3.3,0);
  const posts=Math.ceil(length/4);for(let post=0;post<=posts;post++){
   const x=post/posts*length;box(.5,3.3,.56,'#b7b9aa',wall,x,1.65,0);box(.67,.16,.72,'#4f5858',wall,x,3.35,0);cyl(.1,.22,.2,'#6d7470',wall,x,3.5,0,4);
  }
 }
 return group;
}
