import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function batchStaticScene(scene){
 scene.updateMatrixWorld(true);
 const parents=[];scene.traverse(parent=>{if(parent.children.length)parents.push(parent);});
 let sourceMeshes=0,batches=0;
 for(const parent of parents){
  const groups=new Map();
  for(const object of parent.children){
   if(!object.isMesh||object.isInstancedMesh||object.isSkinnedMesh||object.children.length||!object.visible||Array.isArray(object.material)||object.material.transparent||object.geometry.morphAttributes.position||object.userData.noBatch)continue;
   const geometry=object.geometry;
   if(!geometry.index||!geometry.attributes.position||object.matrix.determinant()<0||Object.values(geometry.attributes).some(attribute=>attribute.isInterleavedBufferAttribute)||geometry.drawRange.count!==Infinity)continue;
   geometry.computeBoundingBox();
   const center=geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(object.matrixWorld);
   const attributes=Object.entries(geometry.attributes).sort(([first],[second])=>first.localeCompare(second)).map(([name,attribute])=>`${name}:${attribute.itemSize}:${attribute.normalized}:${attribute.array.constructor.name}`).join(',');
   const key=[object.material.uuid,object.castShadow,object.receiveShadow,object.renderOrder,object.layers.mask,attributes,Math.floor(center.x/10),Math.floor(center.y/10),Math.floor(center.z/10)].join('|');
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key).push(object);
  }
  for(const objects of groups.values()){
   if(objects.length<3)continue;
   const geometries=objects.map(object=>object.geometry.clone().applyMatrix4(object.matrix));
   const geometry=mergeGeometries(geometries,false);
   geometries.forEach(source=>source.dispose());
   if(!geometry)continue;
   geometry.computeBoundingSphere();
   const first=objects[0],batch=new THREE.Mesh(geometry,first.material);
   batch.name='Chi tiết tĩnh đã gộp';batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;batch.renderOrder=first.renderOrder;batch.layers.mask=first.layers.mask;
   batch.userData.sourceMeshes=objects.length;batch.userData.noCollision=true;
   batch.matrixAutoUpdate=false;parent.add(batch);
   objects.forEach(object=>parent.remove(object));sourceMeshes+=objects.length;batches++;
  }
 }
 return {sourceMeshes,batches,savedDrawCalls:sourceMeshes-batches};
}
