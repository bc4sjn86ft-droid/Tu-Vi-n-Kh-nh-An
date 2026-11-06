import * as THREE from 'three';
import {buildStoneRailing} from './stone-railing.js';
import {sculptBuddha} from './buddha.js';
import {buildWindowWall} from './hall-windows.js';
import {buildBuddhistFlag} from './buddhist-flag.js';
import {buildAltarReliefs} from './altar-reliefs.js';
import {buildHallPlaque} from './hall-plaque.js';
import {WORLD,HALL_LEVELS,HALL_FLOORS,HALL_STAIRS,HALL_LANDINGS,HALL_STAIR_CLEARANCE,HALL_CUSHIONS,CUSHION_DIMENSIONS,hallLevel,insideHallRoom} from './world-layout.js';

export function buildMainHall({scene,box,ball,cyl,line,mesh,mat}){
 const hall=new THREE.Group();hall.name='Chính điện ba tầng';hall.position.set(WORLD.hall.x,0,WORLD.hall.z);scene.add(hall);
 const timber='#58392d',stone='#bec4c2',cream='#e8e1cf',gold='#bfa161',levels=[],roofs=[],fronts=[],approach=[],columns=new Set();
 function rail(parent,from,to,height,posts=true){return buildStoneRailing({parent,from:[from[0],height,from[1]],to:[to[0],height,to[1]],box,cyl,ball,mesh,mat,posts});}
 function edgeRail(parent,left,right,z,height,stairs){
  const openings=stairs.map(stair=>[stair.x-stair.width/2-HALL_STAIR_CLEARANCE.mouth,stair.x+stair.width/2+HALL_STAIR_CLEARANCE.mouth]).sort((first,second)=>first[0]-second[0]);
  let cursor=left;
  for(const [start,end] of openings){
   if(end<=left||start>=right)continue;
   const boundary=Math.min(right,Math.max(left,start));if(boundary-cursor>.6)rail(parent,[cursor,z],[boundary,z],height);
   cursor=Math.min(right,Math.max(cursor,end));
  }
  if(right-cursor>.6)rail(parent,[cursor,z],[right,z],height);
 }
 function column(parent,index,x,z){
  const key=`${index}:${x.toFixed(2)}:${z.toFixed(2)}`;if(columns.has(key))return;columns.add(key);
  const height=HALL_LEVELS[index],group=new THREE.Group();group.name='Cột gỗ';group.position.set(x,height,z);group.userData.columnKey=key;parent.add(group);
  cyl(.36,.42,.22,stone,group,0,.11,0);cyl(.27,.31,5.65,timber,group,0,3,0);
  for(let bracket=0;bracket<3;bracket++)box(.8+bracket*.35,.18,.7+bracket*.18,timber,group,0,5.08+bracket*.24,0);
  if(index===0&&Math.abs(x)===6)for(let ornament=0;ornament<8;ornament++){
   const yy=1+ornament*.53;line([[-.1,yy,.3],[.12,yy+.18,.3],[-.08,yy+.36,.3]],gold,.014,group);
  }
 }
 function lantern(parent,x,y,z,index,illuminated=false){
  const group=new THREE.Group();group.name='Đèn lồng chính điện';group.position.set(x,y,z);parent.add(group);
  const paper=new THREE.MeshStandardMaterial({color:'#ffe0a0',emissive:'#ffad46',emissiveIntensity:1.6,roughness:.7});
  const body=cyl(.19,.24,.65,paper,group,0,0,0,8);body.castShadow=false;
  for(const side of [-1,1]){cyl(.25,.25,.08,timber,group,0,side*.36,0,8);cyl(.12,.12,.1,gold,group,0,side*.44,0,8);}
  for(let rib=0;rib<8;rib++){const angle=rib*Math.PI/4;box(.025,.66,.025,timber,group,Math.cos(angle)*.225,0,Math.sin(angle)*.225);}
  line([[0,.46,0],[0,.95,0]],timber,.025,group);
  if(illuminated){
   const glow=mesh(new THREE.SphereGeometry(.33,12,8),new THREE.MeshBasicMaterial({color:'#ffc16f',transparent:true,opacity:.11,depthWrite:false}),group);glow.castShadow=false;glow.receiveShadow=false;
   const light=new THREE.PointLight('#ffc680',36,13,2);light.name='Ánh sáng đèn lồng';light.userData.level=index+1;light.castShadow=false;group.add(light);
  }
 }

 function roof(width,depth,height,centerZ,rise,openingWidth=0,openingDepth=0,stairOpening=null){
  const group=new THREE.Group();group.name='Mái ngói cong';group.position.z=centerZ;group.userData.top=height+rise;hall.add(group);roofs.push(group);
  const corners=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]],inner=[[-openingWidth/2,-openingDepth/2],[openingWidth/2,-openingDepth/2],[openingWidth/2,openingDepth/2],[-openingWidth/2,openingDepth/2]];
  const blocked=(x,z)=>stairOpening&&Math.abs(x)<stairOpening.halfWidth&&z+centerZ>stairOpening.back;
  function roofLine(points,color,radius){let run=[];for(const point of points){if(blocked(point[0],point[2])){if(run.length>1)line(run,color,radius,group);run=[];}else run.push(point);}if(run.length>1)line(run,color,radius,group);}
  for(let side=0;side<4;side++){
   const next=(side+1)%4,vertices=[],indices=[],tiles=Math.ceil((side%2?depth:width)/.3),edge=[];
   for(let tile=0;tile<=tiles;tile++){
    const along=tile/tiles,points=[];
    for(let slope=0;slope<=12;slope++){
     const blend=slope/12,outerX=THREE.MathUtils.lerp(corners[side][0],corners[next][0],along),outerZ=THREE.MathUtils.lerp(corners[side][1],corners[next][1],along),innerX=THREE.MathUtils.lerp(inner[side][0],inner[next][0],along),innerZ=THREE.MathUtils.lerp(inner[side][1],inner[next][1],along);
     const x=THREE.MathUtils.lerp(outerX,innerX,blend),z=THREE.MathUtils.lerp(outerZ,innerZ,blend),y=height+rise*blend+.38*Math.pow(1-blend,8)+.26*Math.pow(Math.abs(along*2-1),10)*(1-blend);
     vertices.push(x,y,z);points.push([x,y+.035,z]);if(slope===0)edge.push([x,y,z]);
     if(tile<tiles&&slope<12){const offset=tile*13+slope;indices.push(offset,offset+13,offset+1,offset+1,offset+13,offset+14);}
    }
    roofLine(points,'#697174',.035);
   }
   const visible=[];for(let triangle=0;triangle<indices.length;triangle+=3){const corners=indices.slice(triangle,triangle+3);if(!corners.some(vertex=>blocked(vertices[vertex*3],vertices[vertex*3+2])))visible.push(...corners);}
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(visible);geometry.computeVertexNormals();const material=mat('#42494b').clone();material.side=THREE.DoubleSide;mesh(geometry,material,group);roofLine(edge,timber,.14);
   line([[inner[side][0],height+rise+.04,inner[side][1]],[inner[next][0],height+rise+.04,inner[next][1]]],timber,.12,group);
  }
  return group;
 }
 function fitRoofBelowFloor(group,height){
  const bounds=new THREE.Box3().setFromObject(group),offset=Math.min(0,height-.32-.15-bounds.max.y);
  group.position.y+=offset;group.userData.top=bounds.max.y+offset;
 }
 function towerCrown(){
  const crown=roof(16,14,26.15,-4.4,1.1,12,7.6);crown.userData.top=31.85;
  const upper=new THREE.Group();upper.name='Chóp mái dốc hai mặt';crown.add(upper);
  for(const side of [-1,1]){
   const vertices=[],indices=[],tiles=44;
   for(let tile=0;tile<=tiles;tile++){
    const x=-6.2+tile/tiles*12.4,points=[];
    for(let slope=0;slope<=16;slope++){
     const blend=slope/16,z=side*3.8*(1-blend),y=27.25+4.6*Math.pow(blend,.83)+.15*Math.pow(1-blend,8);
     vertices.push(x,y,z);points.push([x,y+.035,z]);
     if(tile<tiles&&slope<16){const offset=tile*17+slope;indices.push(offset,offset+17,offset+1,offset+1,offset+17,offset+18);}
    }
    line(points,'#727b7b',.04,upper);
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const material=mat('#485256').clone();material.side=THREE.DoubleSide;mesh(geometry,material,upper);
   const shape=new THREE.Shape();shape.moveTo(-3.8,27.4);
   const outline=[];
   for(let sample=0;sample<=32;sample++){const z=-3.8+sample/32*7.6,blend=1-Math.abs(z)/3.8,y=27.25+4.6*Math.pow(blend,.83)+.15*Math.pow(1-blend,8);shape.lineTo(z,y);outline.push([side*6.1,y+.04,z]);}shape.closePath();
   const gable=mesh(new THREE.ShapeGeometry(shape),timber,upper,side*6.05,0,0);gable.rotation.y=Math.PI/2;
   for(let rib=-3.2;rib<=3.3;rib+=.4){const height=4.25*(1-Math.abs(rib)/3.8);box(.08,height,.07,gold,upper,side*6.08,27.35+height/2,rib);}
   line(outline,'#737c7b',.13,upper);
  }
  line([[-6.5,32.12,0],[-5.5,31.9,0],[0,31.87,0],[5.5,31.9,0],[6.5,32.12,0]],'#707b7a',.16,upper);
  for(let x=-5.8;x<=5.8;x+=.36){const ridge=cyl(.16,.16,.32,'#697473',upper,x,31.94,0,10);ridge.rotation.z=Math.PI/2;}
  return crown;
 }
 for(const [index,height] of HALL_LEVELS.entries()){
  const floor=HALL_FLOORS[index],group=new THREE.Group(),front=new THREE.Group();group.name=`Tầng ${index+1}`;hall.add(group);group.add(front);levels.push(group);fronts.push(front);
  const incoming=HALL_STAIRS.filter(stair=>stair.top===height),cuts=[-floor.halfWidth,floor.halfWidth,...incoming.flatMap(stair=>[stair.x-stair.width/2,stair.x+stair.width/2])].filter(value=>value>=-floor.halfWidth&&value<=floor.halfWidth).sort((first,second)=>first-second);
  for(let segment=0;segment<cuts.length-1;segment++){
   const left=cuts[segment],right=cuts[segment+1],middle=(left+right)/2,opening=incoming.find(stair=>Math.abs(middle-stair.x)<stair.width/2);
   const spans=opening?[[floor.back,Math.min(floor.front,opening.end)],[Math.max(floor.back,opening.start),floor.front]]:[[floor.back,floor.front]];
   for(const [back,end] of spans)if(end>back&&right>left)box(right-left,.32,end-back,index===0?'#886347':stone,group,middle,height-.16,(back+end)/2);
  }
  const roomDepth=floor.wallFront-floor.wallBack,roomCenter=(floor.wallFront+floor.wallBack)/2;
  for(const side of [-1,1]){
   buildWindowWall({box,mesh},group,{span:roomDepth,base:height,x:side*floor.wallX,z:roomCenter,rotation:side*Math.PI/2});
   const bayWidth=floor.wallX-3.6;
   buildWindowWall({box,mesh},front,{span:bayWidth,base:height,x:side*(3.6+bayWidth/2),z:floor.wallFront,count:Math.max(1,Math.floor(bayWidth/3))});
   for(let zz=floor.wallBack;zz<=floor.wallFront;zz+=4)column(group,index,side*floor.wallX,zz);
   column(group,index,side*floor.wallX,floor.wallFront);
   column(front,index,side*3.45,floor.wallFront);
   rail(group,[side*floor.halfWidth,floor.back],[side*floor.halfWidth,floor.front],height);
  }
  const rearWall=box(floor.wallX*2,5.7,.24,cream,group,0,height+2.85,floor.wallBack);rearWall.name='Tường sau ban Phật kín';
  box(floor.wallX*2,.4,.45,timber,front,0,height+5.7,floor.wallFront);
  box(floor.wallX*2,.32,.4,timber,group,0,height+5.65,floor.wallBack);
  rail(group,[-floor.halfWidth,floor.back],[floor.halfWidth,floor.back],height);
  const mouths=HALL_STAIRS.filter(stair=>(stair.top===height&&Math.abs(stair.end-floor.front)<1e-6)||(stair.bottom===height&&Math.abs(stair.start-floor.front)<1e-6));
  edgeRail(group,-floor.halfWidth,floor.halfWidth,floor.front,height,mouths);
  if(index===0){for(const x of [-6,6])for(const z of [-6,2])column(group,index,x,z);for(const z of [-6,2])box(floor.wallX*2,.35,.35,timber,group,0,height+5.6,z);}
  for(let xx=-floor.wallX+1;xx<floor.wallX;xx+=2.3)if(Math.abs(xx)>4)lantern(front,xx,height+4.8,floor.wallFront+.65,index);
  for(const side of [-1,1])lantern(group,side*(index===0?4:2.5),height+4.5,(floor.wallBack+floor.wallFront)/2,index,true);
  for(const side of [-1,1])for(let z=floor.wallBack+2;z<floor.wallFront-1;z+=4){
   lantern(group,side*(floor.wallX+.65),height+4.8,z,index);
   if(z+2<floor.wallFront)buildBuddhistFlag({mesh,mat,line},group,side*(floor.wallX+.7),height+5.35,z+2,side*Math.PI/2);
  }
  for(let x=-floor.wallX+1.9;x<floor.wallX;x+=3.8){
   lantern(group,x,height+4.8,floor.wallBack-.55,index);
   if(Math.abs(x)>4)buildBuddhistFlag({mesh,mat,line},front,x,height+5.35,floor.wallFront+.7);
  }
  buildHallPlaque({mesh},front,index===0?'Tu Viện Khánh An':index===1?'Không Gian Thiền':'Tĩnh Tâm',height+4.95,floor.wallFront+.42);
  if(index>0){
   buildAltarReliefs({mesh,mat,box,ball,line},group,{height,wallX:floor.wallX,wallBack:floor.wallBack,level:index+1});
   const shrine=new THREE.Group(),statueZ=index===1?-8:-6.7;shrine.name=`Ban Phật tầng ${index+1}`;shrine.position.set(0,height-.93,statueZ+10.5);group.add(shrine);
   sculptBuddha({temple:shrine,mat,box,ball,cyl,line,mesh},0,index===1?.9:.8);
   box(3.8,1,.85,timber,group,0,height+.5,statueZ+2);box(4,.12,1,gold,group,0,height+1.06,statueZ+2);
   for(const side of [-1,1]){cyl(.1,.12,.32,cream,group,side*1.3,height+1.3,statueZ+2);ball(.05,'#ffd292',group,side*1.3,height+1.5,statueZ+2);}
  }
  for(const seat of HALL_CUSHIONS.filter(seat=>seat.level===index+1)){
   const cushion=new THREE.Group();cushion.name=seat.id;cushion.position.set(seat.x-WORLD.hall.x,height,seat.z-WORLD.hall.z);group.add(cushion);
   const dimensions=CUSHION_DIMENSIONS;
   box(dimensions.matWidth,dimensions.matTop,dimensions.matDepth,'#bc9958',cushion,0,dimensions.matTop/2,0);box(dimensions.padWidth,dimensions.padTop-dimensions.matTop,dimensions.padDepth,'#713b32',cushion,0,(dimensions.matTop+dimensions.padTop)/2,0);cyl(.52,dimensions.radius,dimensions.top-dimensions.padTop,'#a65b45',cushion,0,(dimensions.padTop+dimensions.top)/2,0,40);
   const seam=mesh(new THREE.TorusGeometry(.5,.018,6,40),gold,cushion,0,.35,0);seam.rotation.x=Math.PI/2;
  }
 }
 const groundFloor=HALL_FLOORS[0],foundationWidth=groundFloor.halfWidth*2;
 box(foundationWidth,3.6,8.1-groundFloor.back,'#92958d',hall,0,1.8,(8.1+groundFloor.back)/2);
 box(foundationWidth,3.6,groundFloor.front-8.1,'#9a9285',hall,0,1.8,(groundFloor.front+8.1)/2);
 for(const stair of HALL_STAIRS){
  const group=new THREE.Group();group.name='Cầu thang đi bộ';hall.add(group);const count=Math.ceil((stair.top-stair.bottom)/.18),depth=(stair.start-stair.end)/count;
  approach.push(group);
  for(let step=0;step<count;step++){
   const top=stair.bottom+(step+1)/count*(stair.top-stair.bottom),zz=stair.start-(step+.5)*depth,tread=box(stair.width,.2,depth,stone,group,stair.x,top-.1,zz);tread.userData.noCollision=true;
  }
  for(const side of [-1,1]){
   const xx=stair.x+side*(stair.width/2+HALL_STAIR_CLEARANCE.railOffset);
   buildStoneRailing({parent:group,from:[xx,stair.bottom,stair.start],to:[xx,stair.top,stair.end],box,cyl,ball,mesh,mat});
   for(const [z,height] of [[stair.start,stair.bottom],[stair.end,stair.top]]){
    const floorIndex=HALL_LEVELS.indexOf(height),floor=HALL_FLOORS[floorIndex],landing=HALL_LANDINGS.find(candidate=>candidate.height===height&&(candidate.front===z||candidate.back===z));
    const edge=floor&&floor.front===z?{left:-floor.halfWidth,right:floor.halfWidth}:landing;
    if(!edge)continue;
    const opening=stair.x+side*(stair.width/2+HALL_STAIR_CLEARANCE.mouth),boundary=side<0?edge.left:edge.right,target=Math.abs(boundary-opening)<=.6?boundary:opening;
    rail(group,[xx,z],[target,z],height,false);
   }
  }
 }
 for(const [index,landing] of HALL_LANDINGS.entries()){
  const bridge=new THREE.Group();bridge.name='Cầu nối chiếu nghỉ';hall.add(bridge);approach.push(bridge);
  box(landing.right-landing.left,.38,landing.front-landing.back,stone,bridge,0,landing.height-.19,(landing.front+landing.back)/2);
  edgeRail(bridge,landing.left,landing.right,landing.front,landing.height,HALL_STAIRS.filter(stair=>stair.top===landing.height));
  edgeRail(bridge,landing.left,landing.right,landing.back,landing.height,HALL_STAIRS.filter(stair=>stair.bottom===landing.height));
  for(const side of [-1,1]){rail(bridge,[side*landing.right,landing.back],[side*landing.right,landing.front],landing.height);const top=landing.height-.4,bottom=HALL_LEVELS[index],support=box(.5,top-bottom,.5,timber,bridge,side*(landing.right-3),(top+bottom)/2,(landing.front+landing.back)/2);support.name='Cột đỡ dưới sàn chiếu nghỉ';}
 }
 const canopyBack=groundFloor.back-2.7,canopyFront=groundFloor.wallFront+5.5,centralStair=HALL_STAIRS.find(stair=>stair.bottom===HALL_LANDINGS[0].height);
 fitRoofBelowFloor(roof(foundationWidth+3.4,canopyFront-canopyBack,9.55,(canopyBack+canopyFront)/2,2.6,14,13,{halfWidth:centralStair.width/2+.7,back:centralStair.end-.1}),HALL_LEVELS[1]);
 fitRoofBelowFloor(roof(22,19,18.1,-4.1,2.1,10,9,{halfWidth:2.6,back:1.3}),HALL_LEVELS[2]);
 towerCrown();
 for(const side of [-1,1]){
  const gable=new THREE.Group();gable.position.set(side*7,0,8.7);gable.name='Đầu hồi mái';hall.add(gable);roofs.push(gable);
  const shape=new THREE.Shape();shape.moveTo(-3.1,10.15);shape.lineTo(0,12.9);shape.lineTo(3.1,10.15);shape.closePath();mesh(new THREE.ShapeGeometry(shape),timber,gable);
  for(let xx=-2.5;xx<=2.5;xx+=.35){const height=2.4*(1-Math.abs(xx)/2.8);box(.065,height,.08,gold,gable,xx,10.2+height/2,.08);}
  line([[-3.3,10.3,.1],[0,13.05,.1],[3.3,10.3,.1]],timber,.13,gable);
  for(const slope of [-1,1]){
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([slope*3.3,10.3,.1,0,13.05,.1,0,13.05,-3.2,slope*3.3,10.3,-3.2],3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();const material=mat('#42494b').clone();material.side=THREE.DoubleSide;mesh(geometry,material,gable);
   for(let zz=-3.2;zz<.2;zz+=.28)line([[slope*3.3,10.35,zz],[slope*1.5,11.65,zz],[0,13.1,zz]],'#697174',.035,gable);
  }
  fitRoofBelowFloor(gable,HALL_LEVELS[1]);
 }
 return {update(position){
  const inside=insideHallRoom(position),active=hallLevel(position.y);
  roofs.forEach(roof=>{roof.visible=!inside;});levels.forEach((level,index)=>{level.visible=!inside||index<active;fronts[index].visible=!inside;});
  approach.forEach(object=>{object.visible=!inside;});
 }};
}
