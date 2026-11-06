import * as THREE from 'three';

export const PLAYER_RADIUS=.22;
export const PLAYER_HEIGHT=1.62;
const cellSize=3,cells=new Map();

export function clearObjectColliders(){cells.clear();}

export function buildObjectColliders(scene){
 clearObjectColliders();scene.updateMatrixWorld(true);let count=0;
 scene.traverse(object=>{
  if(!object.isMesh||object.isInstancedMesh||['PlaneGeometry','BufferGeometry','ShapeGeometry'].includes(object.geometry.type)||object.material.transparent)return;
  for(let parent=object;parent;parent=parent.parent)if(parent.name.startsWith('bo-doan-')||parent.userData.noCollision)return;
  const bounds=new THREE.Box3().setFromObject(object),size=bounds.getSize(new THREE.Vector3());
  if(size.y<.025||Math.max(size.x,size.z)<.06)return;
  const collider={minX:bounds.min.x,maxX:bounds.max.x,minY:bounds.min.y,maxY:bounds.max.y,minZ:bounds.min.z,maxZ:bounds.max.z,step:object.geometry.type==='BoxGeometry'&&size.y<=.4};
  for(let x=Math.floor(collider.minX/cellSize);x<=Math.floor(collider.maxX/cellSize);x++)for(let z=Math.floor(collider.minZ/cellSize);z<=Math.floor(collider.maxZ/cellSize);z++){
   const key=`${x}:${z}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(collider);
  }
  count++;
 });
 return count;
}

export function objectSurfaceHeight(x,z,baseHeight){
 let height=baseHeight;
 for(let cellX=Math.floor((x-PLAYER_RADIUS)/cellSize);cellX<=Math.floor((x+PLAYER_RADIUS)/cellSize);cellX++)for(let cellZ=Math.floor((z-PLAYER_RADIUS)/cellSize);cellZ<=Math.floor((z+PLAYER_RADIUS)/cellSize);cellZ++)for(const collider of cells.get(`${cellX}:${cellZ}`)||[]){
  if(!collider.step||collider.maxY>baseHeight+.4||collider.maxY<=height)continue;
  const nearestX=Math.max(collider.minX,Math.min(collider.maxX,x)),nearestZ=Math.max(collider.minZ,Math.min(collider.maxZ,z));
  if(Math.hypot(x-nearestX,z-nearestZ)<PLAYER_RADIUS)height=collider.maxY;
 }
 return height;
}

export function objectBlocks(x,z,height){
 const visited=new Set();
 for(let cellX=Math.floor((x-PLAYER_RADIUS)/cellSize);cellX<=Math.floor((x+PLAYER_RADIUS)/cellSize);cellX++)for(let cellZ=Math.floor((z-PLAYER_RADIUS)/cellSize);cellZ<=Math.floor((z+PLAYER_RADIUS)/cellSize);cellZ++){
  for(const collider of cells.get(`${cellX}:${cellZ}`)||[]){
   if(visited.has(collider))continue;visited.add(collider);
   if(collider.maxY<=height+.045||collider.minY>=height+PLAYER_HEIGHT)continue;
   const nearestX=Math.max(collider.minX,Math.min(collider.maxX,x)),nearestZ=Math.max(collider.minZ,Math.min(collider.maxZ,z));
   if(Math.hypot(x-nearestX,z-nearestZ)<PLAYER_RADIUS)return true;
  }
 }
 return false;
}
