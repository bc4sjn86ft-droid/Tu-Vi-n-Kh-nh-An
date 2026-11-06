import * as THREE from 'three';

export function sealRoofWalls({parent,width,back,front,bottom,heightAt,material,name='Diềm tường khép kín sát mái'}){
 const group=new THREE.Group();group.name=name;group.userData.noCollision=true;parent.add(group);
 const finish=material.clone();finish.side=THREE.DoubleSide;
 const edges=[[[-width/2,back],[width/2,back]],[[width/2,back],[width/2,front]],[[width/2,front],[-width/2,front]],[[-width/2,front],[-width/2,back]]];
 for(const [from,to]of edges){
  const positions=[],indices=[];
  for(let sample=0;sample<=32;sample++){
   const blend=sample/32,x=THREE.MathUtils.lerp(from[0],to[0],blend),z=THREE.MathUtils.lerp(from[1],to[1],blend),top=heightAt(x,z);
   positions.push(x,bottom,z,x,top,z);
   if(sample<32){const offset=sample*2;indices.push(offset,offset+2,offset+1,offset+1,offset+2,offset+3);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();group.add(new THREE.Mesh(geometry,finish));
 }
 return group;
}
