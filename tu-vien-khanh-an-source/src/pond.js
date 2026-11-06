import * as THREE from 'three';
import {WORLD,POND,POND_BRIDGE,pondBridgeHeight} from './world-layout.js';

export function buildPond({scene,box,cyl,ball,mat,line}){
 const garden=new THREE.Group();garden.name='Hồ cá dài và cầu tới Quan Âm';scene.add(garden);
 const water=cyl(POND.radiusX,POND.radiusX,.12,new THREE.MeshStandardMaterial({color:'#3c8f83',transparent:true,opacity:.62,roughness:.18,metalness:.18,depthWrite:false}),garden,WORLD.pond.x,.38,WORLD.pond.z,80);water.scale.z=POND.radiusZ/POND.radiusX;water.name='Mặt hồ dài thêm 20%';
 for(let index=0;index<40;index++){
  const angle=index*Math.PI/20,x=WORLD.pond.x+Math.cos(angle)*(POND.radiusX+.12),z=WORLD.pond.z+Math.sin(angle)*(POND.radiusZ+.12);
  if(Math.abs(x-WORLD.pond.x)<1.8)continue;
  const stone=ball(.42+(index%3)*.07,index%2?'#929a82':'#b1b39d',garden,x,.19,z,[1.1,.75,.85]);stone.rotation.y=angle;
 }
 for(let index=0;index<18;index++){
  const angle=index*2.4,x=Math.cos(angle)*(1.5+index%3),z=WORLD.pond.z+Math.sin(angle)*(2+index%3*.55);
  if(Math.abs(x)<1.6)continue;
  const leaf=cyl(.3,.3,.025,'#6c9575',garden,x,.44,z,28);leaf.scale.z=.83;
  if(index%2===0){
   for(let petal=0;petal<7;petal++){const turn=petal*Math.PI*2/7,flower=ball(.14,'#e6a8bc',garden,x+Math.cos(turn)*.12,.49,z+Math.sin(turn)*.12,[.7,.7,1.25]);flower.rotation.y=turn;}
   ball(.065,'#e6c879',garden,x,.55,z,[1,.6,1]);
  }
 }
 for(let index=0;index<30;index++){
  const angle=index*2.4,x=Math.cos(angle)*(POND.radiusX+.8),z=WORLD.pond.z+Math.sin(angle)*(POND.radiusZ+.8);
  if(Math.abs(x)<1.85)continue;
  for(let blade=0;blade<3;blade++)line([[x,.12,z],[x+Math.sin(index+blade)*.18,.7+blade*.1,z+.12]],'#5e8150',.035,garden);
 }
 const bridge=new THREE.Group();bridge.name='Cầu dọc hồ dẫn tới Quan Âm';garden.add(bridge);
 const layout=POND_BRIDGE,count=Math.ceil((layout.rampFront-layout.rampBack)/.18),depth=(layout.rampFront-layout.rampBack)/count;
 for(let plank=0;plank<count;plank++){
  const z=layout.rampBack+(plank+.5)*depth,height=pondBridgeHeight(WORLD.pond.x,z);
  box(layout.halfWidth*2,.09,depth-.014,plank%3?'#916c4c':'#a27a54',bridge,WORLD.pond.x,height-.045,z);
 }
 for(const side of [-1,1]){
  const x=WORLD.pond.x+side*(layout.halfWidth+.14);
  for(const height of [.56,1.04])box(.1,.1,layout.front-layout.back,'#71523b',bridge,x,layout.height+height,(layout.front+layout.back)/2);
  for(let z=layout.back;z<=layout.front+.01;z+=1.8){box(.16,1.25,.16,'#71523b',bridge,x,layout.height+.54,z);ball(.13,'#b79562',bridge,x,layout.height+1.2,z);}
 }
 for(let z=layout.rampBack-.4;z>WORLD.quanAm.z+2.4;z-=.8)box(2.5,.1,.72,'#d2c6af',garden,WORLD.pond.x,.05,z);
 for(let index=0;index<6;index++)ball(.62,'#8c9784',garden,-4.1+(index%2)*.65,.4+Math.floor(index/2)*.42,-10.6,[1,.8,.85]);
 const waterfall=new THREE.Group();waterfall.name='Thác nước bên hồ';garden.add(waterfall);
 for(let stream=0;stream<10;stream++)box(.055,1.4,.025,new THREE.MeshStandardMaterial({color:'#d7eee2',transparent:true,opacity:.45,roughness:.15}),waterfall,-4.1+stream*.07,.95,-10.1);
 return {garden,update(time){waterfall.children.forEach((stream,index)=>{stream.material.opacity=.28+Math.sin(time*4+index)*.1;stream.scale.y=.95+Math.sin(time*3+index*.4)*.06;});}};
}
