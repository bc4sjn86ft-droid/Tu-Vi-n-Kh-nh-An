import {objectBlocks,objectSurfaceHeight} from './object-collision.js';

export const CAMPUS_BOUNDS={minX:-43,maxX:43,minZ:-39,maxZ:43,gateLeft:13.5,gateRight:24.5};
export const WORLD={hall:{x:19,z:-8,y:3},pond:{x:0,z:-5},incense:{x:19,z:34},yard:{x:0,z:18},gate:{x:19,z:CAMPUS_BOUNDS.maxZ},quarters:{x:26,z:-30},residence:{x:-25,z:-8},quanAm:{x:0,z:-19},tower:{x:-35,z:10},bell:{x:-29,z:23},welcomeStone:{x:7.5,z:29.5}};
export const RESIDENCE={rotation:Math.PI/2,halfWidth:7.4,back:-12,front:11.6,wallX:5.85,wallBack:-5.4,wallFront:9.6,tower:{z:-11.5,bases:[5.6,10.45,15.3],terraceBack:-16},levels:[.36,5.6],doorBays:[-2.9,2.1],roofHalfWidth:8.6,roofBack:-15.8,roofFront:12.3};
export const MEMORIAL_TOWERS=[{...WORLD.tower,levels:3,scale:1},{x:-26.3,z:11.3,levels:2,scale:.8}];
export function residenceToWorld(x,z){return {x:WORLD.residence.x+z,z:WORLD.residence.z-x};}
export function residenceLocal(x,z){return {x:WORLD.residence.z-z,z:x-WORLD.residence.x};}
export function residenceSurfaces(x,z){const local=residenceLocal(x,z);return RESIDENCE.levels.filter((height,index)=>Math.abs(local.x)<=RESIDENCE.halfWidth&&local.z>=(index===1?RESIDENCE.tower.terraceBack:RESIDENCE.back)&&local.z<=RESIDENCE.front);}
export function residenceWallAt(x,z,height){
 const local=residenceLocal(x,z),floor=RESIDENCE.levels.findIndex(level=>Math.abs(level-height)<.7);
 if(floor<0)return false;
 if(Math.abs(Math.abs(local.x)-RESIDENCE.wallX)<.3&&local.z>RESIDENCE.wallBack&&local.z<RESIDENCE.wallFront){
  const entrance=floor===0&&local.x<0&&RESIDENCE.doorBays.some(center=>Math.abs(local.z-center)<1.04);
  return !entrance;
 }
 if(Math.abs(local.z-RESIDENCE.wallFront)<.3&&Math.abs(local.x)<RESIDENCE.wallX)return !(floor===0&&Math.abs(local.x)<1.04);
 return Math.abs(local.z-RESIDENCE.wallBack)<.3&&Math.abs(local.x)<RESIDENCE.wallX&&!(floor===1&&Math.abs(local.x)<1.04);
}
export const POND={radiusX:4.5,radiusZ:4.5*1.2};
export const POND_BRIDGE={halfWidth:1.2,back:-11.3,front:1.3,rampBack:-13.5,rampFront:3.5,height:.65};
export function pondBridgeHeight(x,z){
 const bridge=POND_BRIDGE;if(Math.abs(x-WORLD.pond.x)>bridge.halfWidth||z<bridge.rampBack||z>bridge.rampFront)return null;
 if(z<bridge.back)return bridge.height*(z-bridge.rampBack)/(bridge.back-bridge.rampBack);
 if(z>bridge.front)return bridge.height*(bridge.rampFront-z)/(bridge.rampFront-bridge.front);
 return bridge.height;
}
export function nearQuanAm(position){return position.y<.8&&Math.hypot(position.x-WORLD.quanAm.x,position.z-WORLD.quanAm.z)<5.3;}
export function nearBell(position){return position.y<.8&&Math.hypot(position.x-WORLD.bell.x,position.z-WORLD.bell.z)<5.8;}
export const HALL_LEVELS=[3.93,12.5,20.5];
export const HALL_FLOORS=[
 {halfWidth:11.88,back:-16.3,front:34,wallX:10.38,wallBack:-15.8,wallFront:12.8},
 {halfWidth:8.4,back:-11.5,front:14.4,wallX:6.8,wallBack:-10,wallFront:1.6},
 {halfWidth:6.4,back:-10,front:1.4,wallX:4.7,wallBack:-8.6,wallFront:-.2}
];
export const HALL_STAIR_CLEARANCE={mouth:.7,railOffset:.35,apron:2.4,sideAisle:1.6};
export const HALL_LANDING={left:-HALL_FLOORS[0].halfWidth,right:HALL_FLOORS[0].halfWidth,back:19.3,front:22.1,height:8.2};
export const HALL_LANDINGS=[HALL_LANDING,{left:-8.4,right:8.4,back:6.2,front:9,height:16.4}];
export const HALL_STAIRS=[
 {x:0,width:10.6,start:HALL_FLOORS[0].front+6,end:HALL_FLOORS[0].front,bottom:0,top:HALL_LEVELS[0]},
 ...[-1,1].map(side=>({x:side*(HALL_FLOORS[0].halfWidth-1.2-HALL_STAIR_CLEARANCE.sideAisle),width:2.4,start:HALL_FLOORS[0].front-HALL_STAIR_CLEARANCE.apron,end:HALL_LANDING.front,bottom:HALL_LEVELS[0],top:HALL_LANDING.height})),
 {x:0,width:7.4,start:HALL_LANDING.back,end:HALL_FLOORS[1].front,bottom:HALL_LANDING.height,top:HALL_LEVELS[1]},
 ...[-1,1].map(side=>({x:side*(HALL_FLOORS[1].halfWidth-.9-HALL_STAIR_CLEARANCE.sideAisle),width:1.8,start:HALL_FLOORS[1].front-HALL_STAIR_CLEARANCE.apron,end:HALL_LANDINGS[1].front,bottom:HALL_LEVELS[1],top:HALL_LANDINGS[1].height})),
 {x:0,width:4.4,start:6.2,end:1.4,bottom:HALL_LANDINGS[1].height,top:HALL_LEVELS[2]}
];
export const HALL_CUSHIONS=[
 ...[-8,-4,0,4,8].flatMap(x=>[-4,-1,2,5].map(z=>({x:WORLD.hall.x+x,z:WORLD.hall.z+z,y:HALL_LEVELS[0],level:1}))),
 ...[-8,-4,4,8].flatMap(x=>[8,10.5].map(z=>({x:WORLD.hall.x+x,z:WORLD.hall.z+z,y:HALL_LEVELS[0],level:1}))),
 ...[1,2].flatMap(index=>(index===1?[-4,-2,0,2,4]:[-2,0,2]).flatMap(x=>(index===1?[-4.5,-1.5]:[-3.5,-1.4]).map(z=>({x:WORLD.hall.x+x,z:WORLD.hall.z+z,y:HALL_LEVELS[index],level:index+1}))))
].map((seat,index)=>({...seat,id:`bo-doan-${index+1}`}));
export const CUSHION_DIMENSIONS={matWidth:1.5,matDepth:1.4,matTop:.06,padWidth:1.37,padDepth:1.27,padTop:.18,radius:.56,top:.36};
export function cushionHeight(x,z,baseHeight){
 let height=baseHeight;
 for(const seat of HALL_CUSHIONS){
  if(Math.abs(baseHeight-seat.y)>.05)continue;
  const dx=Math.abs(x-seat.x),dz=Math.abs(z-seat.z),cushion=CUSHION_DIMENSIONS;
  if(dx<=cushion.matWidth/2+.12&&dz<=cushion.matDepth/2+.12)height=Math.max(height,seat.y+cushion.matTop);
  if(dx<=cushion.padWidth/2+.12&&dz<=cushion.padDepth/2+.12)height=Math.max(height,seat.y+cushion.padTop);
  if(Math.hypot(dx,dz)<=cushion.radius+.12)height=Math.max(height,seat.y+cushion.top);
 }
 return height;
}
export function stairContains(stair,x,z){return Math.abs(x-stair.x)<=stair.width/2+1e-6&&z>=stair.end-1e-6&&z<=stair.start+1e-6;}
export function inHall(x,z){const floor=HALL_FLOORS[0],localX=x-WORLD.hall.x,localZ=z-WORLD.hall.z;return Math.abs(localX)<floor.halfWidth+.1&&localZ>=floor.back&&localZ<=floor.front;}
export function hallSurfaces(x,z){
 const localX=x-WORLD.hall.x,localZ=z-WORLD.hall.z,surfaces=[];
 for(const [index,height] of HALL_LEVELS.entries()){
  const floor=HALL_FLOORS[index];
  if(Math.abs(localX)<=floor.halfWidth+1e-6&&localZ>=floor.back-1e-6&&localZ<=floor.front+1e-6){
   const opening=HALL_STAIRS.some(stair=>(stair.top===height||stair.bottom===height)&&stairContains(stair,localX,localZ)&&localZ>stair.end&&localZ<stair.start);
   if(!opening)surfaces.push(height);
  }
 }
 for(const landing of HALL_LANDINGS)if(localX>=landing.left-1e-6&&localX<=landing.right+1e-6&&localZ>=landing.back-1e-6&&localZ<=landing.front+1e-6)surfaces.push(landing.height);
 for(const stair of HALL_STAIRS)if(stairContains(stair,localX,localZ)){const blend=Math.max(0,Math.min(1,(stair.start-localZ)/(stair.start-stair.end)));surfaces.push(stair.bottom+blend*(stair.top-stair.bottom));}
 return surfaces;
}
export function floorHeight(x,z,currentY=HALL_LEVELS[0]){const surfaces=[...hallSurfaces(x,z),...residenceSurfaces(x,z)],bridge=pondBridgeHeight(x,z);if(bridge!==null)surfaces.push(bridge);const base=surfaces.length?surfaces.reduce((closest,height)=>Math.abs(height-currentY)<Math.abs(closest-currentY)?height:closest):0;return objectSurfaceHeight(x,z,cushionHeight(x,z,base));}
export function hallLevel(height){return HALL_LEVELS.reduce((closest,level,index)=>Math.abs(level-height)<Math.abs(HALL_LEVELS[closest]-height)?index:closest,0)+1;}
export function insideHallRoom(position){const index=hallLevel(position.y)-1,floor=HALL_FLOORS[index],x=position.x-WORLD.hall.x,z=position.z-WORLD.hall.z;return Math.abs(position.y-HALL_LEVELS[index])<1.9&&Math.abs(x)<floor.wallX&&z>floor.wallBack&&z<floor.wallFront;}
export function hallWallAt(x,z,height){
 const localX=x-WORLD.hall.x,localZ=z-WORLD.hall.z,index=HALL_LEVELS.findIndex(level=>Math.abs(level-height)<.75);
 if(index<0)return false;
 const floor=HALL_FLOORS[index];
 if(Math.abs(localZ-floor.wallBack)<.3&&Math.abs(localX)<floor.wallX+.2)return true;
 if(Math.abs(Math.abs(localX)-floor.wallX)<.3&&localZ>floor.wallBack&&localZ<floor.wallFront)return true;
 return Math.abs(localZ-floor.wallFront)<.3&&Math.abs(localX)>3.6&&Math.abs(localX)<floor.wallX+.2;
}
export function canWalk(x,z,currentY){
 const bounds=CAMPUS_BOUNDS;
 if(x<bounds.minX+.6||x>bounds.maxX-.6||z<bounds.minZ+.6||z>bounds.maxZ)return false;
 if(z>bounds.maxZ-.6&&(x<bounds.gateLeft+.4||x>bounds.gateRight-.4))return false;
 if(Math.hypot((x-WORLD.pond.x)/POND.radiusX,(z-WORLD.pond.z)/POND.radiusZ)<1&&pondBridgeHeight(x,z)===null)return false;
 if(x>18&&x<34&&z>-35&&z<-25)return false;
 const surface=floorHeight(x,z,currentY);
 if(currentY!==undefined&&(Math.abs(surface-currentY)>.4||hallWallAt(x,z,currentY)||residenceWallAt(x,z,currentY)))return false;
 if(objectBlocks(x,z,surface))return false;
 return true;
}
export function placeName(x,z){if(inHall(x,z))return 'Chính điện';if(Math.hypot(x-WORLD.quanAm.x,z-WORLD.quanAm.z)<7)return 'Tượng Quan Âm';if(Math.hypot(x,z+5)<10)return 'Hồ sen';if(Math.hypot(x-WORLD.bell.x,z-WORLD.bell.z)<6)return 'Tháp chuông';if(MEMORIAL_TOWERS.some(tower=>Math.hypot(x-tower.x,z-tower.z)<6.4))return 'Bảo tháp';const local=residenceLocal(x,z);if(Math.abs(local.x)<RESIDENCE.halfWidth+3&&local.z>RESIDENCE.back-2&&local.z<RESIDENCE.front+3)return 'Nhà tăng';if(Math.hypot(x-WORLD.welcomeStone.x,z-WORLD.welcomeStone.z)<4)return 'Đá thư pháp';if(z<=-22&&x>13)return 'Khu phòng sư thầy';if(z>33&&x>10)return 'Cổng chính';return 'Sân an lạc';}
