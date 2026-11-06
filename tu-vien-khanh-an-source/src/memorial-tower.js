import * as THREE from 'three';
import {MEMORIAL_TOWERS} from './world-layout.js';
import {sealRoofWalls} from './roof-junction.js';

export function buildMemorialTowers({scene,mat,box,cyl,ball,line,mesh}){
 const garden=new THREE.Group();garden.name='Cụm bảo tháp đá theo ảnh';scene.add(garden);
 const stone=mat('#929d98'),edge=mat('#b4bbb0'),brick=mat('#a66b53'),red=mat('#8d3e34'),dark=mat('#3e4949'),tile=mat('#687271'),gold=mat('#c8a24b',.4);
 const surface=tile.clone();surface.side=THREE.DoubleSide;
 function roof(parent,width,height){
  const group=new THREE.Group();group.name='Mái tháp đá bốn góc vút';parent.add(group);
  const corners=[[-1,-1],[1,-1],[1,1],[-1,1]],courses=Math.ceil(width/.25);
  for(let face=0;face<4;face++){
   const vertices=[],indices=[],next=(face+1)%4;
   const point=(along,blend)=>{
    const x=THREE.MathUtils.lerp(corners[face][0],corners[next][0],along)*width/2,z=THREE.MathUtils.lerp(corners[face][1],corners[next][1],along)*width/2;
    return [x*(1-blend*.82),height+.9*blend+.24*Math.pow(1-blend,7)+.43*Math.pow(Math.abs(along*2-1),10)*(1-blend),z*(1-blend*.82)];
   };
   for(let course=0;course<=courses;course++){
    const rib=[];
    for(let slope=0;slope<=10;slope++){
     const position=point(course/courses,slope/10);vertices.push(...position);rib.push([position[0],position[1]+.025,position[2]]);
     if(course<courses&&slope<10){const offset=course*11+slope;indices.push(offset,offset+11,offset+1,offset+1,offset+11,offset+12);}
    }
    line(rib,dark,.021,group);
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();mesh(geometry,surface,group);
   line(Array.from({length:courses+1},(_,course)=>point(course/courses,0)),edge,.09,group);
   line(Array.from({length:11},(_,slope)=>point(0,slope/10)),dark,.075,group);
  }
 }
 for(const [index,layout] of MEMORIAL_TOWERS.entries()){
  const tower=new THREE.Group();tower.name=index?'Bảo tháp đá hai tầng':'Bảo tháp đá ba tầng';tower.position.set(layout.x,0,layout.z);tower.scale.setScalar(layout.scale);garden.add(tower);
  box(4.8,.28,4.8,stone,tower,0,.14,0);box(4.3,.25,4.3,edge,tower,0,.405,0);
  for(let level=0;level<layout.levels;level++){
   const base=.53+level*3.25,width=3.55-level*.32,height=2.7;
   box(width,height,width,brick,tower,0,base+height/2,0);
   for(const side of [-1,1]){
    const face=new THREE.Group();face.name='Cửa song đỏ và trụ đá bảo tháp';face.position.set(0,base,side*width/2);face.rotation.y=side<0?Math.PI:0;tower.add(face);
    box(1.55,2.25,.12,red,face,0,1.15,.1);
    for(let slat=-.6;slat<.7;slat+=.15)box(.045,1.25,.06,dark,face,slat,1.65,.19);
    for(const x of [-.7,0,.7])box(.07,2.2,.08,red,face,x,1.15,.22);
    for(const y of [.32,1.1,2.2])box(1.5,.08,.08,red,face,0,y,.22);
    for(const x of [-width/2+.17,width/2-.17]){
     box(.38,height,.34,stone,face,x,height/2,.08);
     for(let row=0;row<8;row++)box(.4,.035,.37,edge,face,x,.18+row*.32,.09);
    }
    for(let row=0;row<10;row++)for(const x of [-1.2,1.2])box(.5,.018,.025,edge,face,x,.2+row*.25,.035);
    for(let bracket=-1.4;bracket<=1.4;bracket+=.7)for(let step=0;step<2;step++)box(.17,.16,.3+step*.2,dark,face,bracket,height-.22+step*.16,.17+step*.12);
   }
   const roofWidth=width+3.3,blend=(1-width/roofWidth)/.82;
   roof(tower,roofWidth,base+height);
   sealRoofWalls({parent:tower,width,back:-width/2,front:width/2,bottom:base+height,material:stone,heightAt(x,z){const along=Math.min(Math.abs(x),Math.abs(z))/(width/2);return base+height+.9*blend+.24*Math.pow(1-blend,7)+.43*Math.pow(along,10)*(1-blend)-.015;}});
   box(roofWidth*.18,.12,roofWidth*.18,dark,tower,0,base+height+.85,0);
  }
  const peak=.53+(layout.levels-1)*3.25+2.7+.92;
  cyl(.07,.11,2.5,gold,tower,0,peak+1.2,0,12);
  for(let ring=0;ring<7;ring++)cyl(.5-ring*.052,.58-ring*.052,.18,gold,tower,0,peak+.18+ring*.27,0,24);
  cyl(0,.17,.55,gold,tower,0,peak+2.2,0,12);
  ball(.12,gold,tower,0,peak+2.52,0);
 }
 return garden;
}
