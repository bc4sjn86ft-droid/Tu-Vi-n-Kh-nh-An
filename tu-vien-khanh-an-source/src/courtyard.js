import * as THREE from 'three';
import {CAMPUS_BOUNDS} from './world-layout.js';

export const COURTYARD_TOP=0;
export function buildCourtyard({scene,box,mat}){
 const bounds=CAMPUS_BOUNDS,width=bounds.maxX-bounds.minX,depth=bounds.maxZ-bounds.minZ,columns=22,rows=21,tileWidth=width/columns,tileDepth=depth/rows;
 const group=new THREE.Group();group.name='Nền sân một lớp';scene.add(group);
 const base=box(width,.24,depth,'#a9a28d',group,0,-.24,(bounds.minZ+bounds.maxZ)/2);base.name='Nền dưới mạch gạch';base.castShadow=false;
 const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(tileWidth-.045,.08,tileDepth-.045),mat('#ffffff'),columns*rows),transform=new THREE.Object3D(),color=new THREE.Color();tiles.name='Lớp gạch sân duy nhất';tiles.receiveShadow=true;tiles.castShadow=false;
 for(let row=0;row<rows;row++)for(let column=0;column<columns;column++){
  const x=bounds.minX+(column+.5)*tileWidth,z=bounds.minZ+(row+.5)*tileDepth,index=row*columns+column,isPath=Math.abs(x)<6||(x>7&&x<31&&z>8),variation=((row*17+column*11)%7-3)*.007;
  transform.position.set(x,COURTYARD_TOP-.04,z);transform.updateMatrix();tiles.setMatrixAt(index,transform.matrix);
  color.set(isPath?'#d9cfb6':'#c7c5b2');color.offsetHSL(0,0,variation);tiles.setColorAt(index,color);
 }
 tiles.instanceMatrix.needsUpdate=true;tiles.instanceColor.needsUpdate=true;group.add(tiles);return group;
}
