import * as THREE from 'three';
import {WORLD} from './world-layout.js';

export function buildIncenseBurner({scene,mesh,mat,cyl,line},parent=scene,position=[WORLD.incense.x,0,WORLD.incense.z],scale=1){
 const urn=new THREE.Group();urn.name='Lư hương đá chạm cánh sen';urn.position.set(...position);urn.scale.setScalar(scale);parent.add(urn);
 const stone=mat('#a2b4a5'),edge=mat('#c2cdbd'),groove=mat('#7f9789');
 cyl(.64,.75,.18,stone,urn,0,.09,0,8);cyl(.49,.6,.62,stone,urn,0,.49,0,8);cyl(1.02,1.09,.22,stone,urn,0,.9,0,8);
 for(const height of [.8,1.02])cyl(1.08,1.08,.055,edge,urn,0,height,0,8);
 for(let face=0;face<8;face++){
  const group=new THREE.Group();group.rotation.y=face*Math.PI/4;urn.add(group);
  line([[-.32,.82,1],[-.2,.94,1.025],[-.08,.86,1.025],[0,.94,1.025],[.13,.86,1.025],[.31,.94,1]],edge,.018,group);
  for(const side of [-1,1])line([[side*.18,.25,.51],[side*.2,.52,.52],[side*.15,.71,.52]],edge,.016,group);
 }
 const profile=[[.68,1.02],[.86,1.15],[1.05,1.4],[1.2,1.72],[1.25,2.08],[1.23,2.2],[1.12,2.2],[1.1,2.05],[.97,1.68],[.75,1.49]].map(point=>new THREE.Vector2(...point));
 const bowl=mesh(new THREE.LatheGeometry(profile,96),stone,urn);bowl.name='Bát hương rỗng lòng';
 for(const [radius,height] of [[1.235,2.2],[1.13,2.17]]){const rim=mesh(new THREE.TorusGeometry(radius,.035,8,96),edge,urn,0,height,0);rim.rotation.x=Math.PI/2;}
 const radiusAt=height=>{
  for(let index=1;index<6;index++)if(height<=profile[index].y){const previous=profile[index-1],next=profile[index];return THREE.MathUtils.lerp(previous.x,next.x,(height-previous.y)/(next.y-previous.y));}
  return profile[5].x;
 };
 for(let row=0;row<2;row++)for(let petal=0;petal<14;petal++){
  const angle=petal*Math.PI/7+row*Math.PI/14,base=row?1.65:1.08,height=row?.51:.82,points=[];
  for(let segment=0;segment<=24;segment++){
   const across=segment/24*2-1,turn=angle+across*Math.PI/14,y=base+height*Math.sqrt(Math.max(0,1-across*across)),radius=radiusAt(y)+.025;
   points.push([Math.sin(turn)*radius,y,Math.cos(turn)*radius]);
  }
  line(points,edge,.025,urn);
  const vertices=[],indices=[],rows=12,columns=16;
  for(let rowIndex=0;rowIndex<=rows;rowIndex++)for(let column=0;column<=columns;column++){
   const across=column/columns*2-1,progress=rowIndex/rows,turn=angle+across*Math.PI/14,y=base+progress*height*Math.sqrt(Math.max(0,1-across*across)),radius=radiusAt(y)+.012+.035*Math.sin(progress*Math.PI)*Math.cos(across*Math.PI/2);
   vertices.push(Math.sin(turn)*radius,y,Math.cos(turn)*radius);
   if(rowIndex<rows&&column<columns){const vertex=rowIndex*(columns+1)+column;indices.push(vertex,vertex+1,vertex+columns+1,vertex+1,vertex+columns+2,vertex+columns+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const relief=mesh(geometry,stone,urn);relief.name='Cánh sen phù điêu';
  const middleY=base+height*.45,middleRadius=radiusAt(middleY)+.015;
  line([[Math.sin(angle)*radiusAt(base),base,Math.cos(angle)*radiusAt(base)],[Math.sin(angle)*middleRadius,middleY,Math.cos(angle)*middleRadius],[Math.sin(angle)*radiusAt(base+height),base+height,Math.cos(angle)*radiusAt(base+height)]],groove,.008,urn);
 }
 cyl(1.07,1.07,.07,mat('#a19a87'),urn,0,2.03,0,64);
 for(let stick=0;stick<35;stick++){
  const angle=stick*2.39996,radius=Math.sqrt(stick/35)*.85,x=Math.cos(angle)*radius,z=Math.sin(angle)*radius,length=.4+(stick%5)*.09;
  cyl(.008,.008,length,mat('#a56746'),urn,x,2.06+length/2,z,6);
  if(stick<5)cyl(.01,.01,.025,mat('#d38b58'),urn,x,2.07+length,z,6);
 }
 return urn;
}
