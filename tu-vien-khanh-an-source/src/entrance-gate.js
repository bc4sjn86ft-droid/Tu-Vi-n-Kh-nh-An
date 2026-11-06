import * as THREE from 'three';
import {WORLD,CAMPUS_BOUNDS} from './world-layout.js';

export function buildEntranceGate({scene,box,mesh,mat,line}){
 const gate=new THREE.Group();gate.name='Cổng tam quan liền tường bao';gate.position.set(WORLD.gate.x,0,WORLD.gate.z);scene.add(gate);
 const stone='#929d98',edge='#bac1b8',shadow='#65736f',wood='#58382b',gold='#dfb35d';
 function group(name,parent=gate){const object=new THREE.Group();object.name=name;parent.add(object);return object;}
 function panel(text,width,height,parent,x,y,z){
  const object=box(width,height,.13,wood,parent,x,y,z);object.name='Biển thư pháp cổng';object.userData.inscription=text;
  for(const side of [-1,1]){
   box(width+.15,.07,.18,'#805137',parent,x,y+side*height/2,z);
   box(.07,height+.15,.18,'#805137',parent,x+side*width/2,y,z);
  }
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
  const context=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  function draw(){context.clearRect(0,0,1024,256);context.fillStyle=gold;context.font='700 150px "KhanhAnThuPhap", serif';context.textAlign='center';context.textBaseline='middle';context.fillText(text,512,137,965);texture.needsUpdate=true;}
  draw();document.fonts.load('700 150px "KhanhAnThuPhap"').then(draw);
  const lettering=mesh(new THREE.PlaneGeometry(width*.94,height*.9),new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,roughness:.8}),parent,x,y,z+.071);lettering.name=text;
 }
 function pillar(x,height){
  const post=group('Trụ đá cổng');post.position.x=x;
  box(.95,.25,1.1,shadow,post,0,.125,0);box(.76,height,.8,stone,post,0,height/2,0);
  for(const [offset,width] of [[-.1,.9],[.08,1.05],[.26,1.18]])box(width,.13,1.02,edge,post,0,height+offset,0);
  box(.17,height-.4,.04,edge,post,-.23,height/2,.42);box(.17,height-.4,.04,edge,post,.23,height/2,.42);
 }
 function brackets(parent,width,base,depth){
  for(let x=-width/2+.5;x<=width/2-.4;x+=.9){
   box(.12,.22,depth+.25,shadow,parent,x,base-.18,0);
   box(.23,.35,depth*.62,stone,parent,x,base-.43,0);
   box(.32,.24,depth*.38,edge,parent,x,base-.66,0);
   box(.1,.12,.2,gold,parent,x,base-.2,depth/2+.03);
  }
  box(width-.6,.26,.35,shadow,parent,0,base-.76,0);
 }
 function tiledRoof(parent,width,depth,base,rise){
  const roof=group('Mái ngói xám cổng',parent),vertices=[],indices=[],steps=20,columns=Math.ceil(width/.23);
  function height(x,z){const slope=Math.abs(z/(depth/2));return base+rise*(1-Math.pow(slope,1.2))+.18*Math.pow(slope,8)+.12*Math.pow(Math.abs(x/(width/2)),10);}
  for(let step=0;step<=steps;step++){
   const z=(step/steps-.5)*depth;
   for(let column=0;column<=columns;column++){
    const x=(column/columns-.5)*width;vertices.push(x,height(x,z),z);
    if(step<steps&&column<columns){const offset=step*(columns+1)+column;indices.push(offset,offset+1,offset+columns+1,offset+1,offset+columns+2,offset+columns+1);}
   }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const tiles=mat('#555e5d').clone();tiles.side=THREE.DoubleSide;mesh(geometry,tiles,roof);
  for(let x=-width/2;x<=width/2+.001;x+=.23){
   const points=[];for(let step=0;step<=steps;step++){const z=(step/steps-.5)*depth;points.push([x,height(x,z)+.025,z]);}
   line(points,'#87908a',.028,roof);
  }
  for(const side of [-1,1]){
   const points=[];for(let step=0;step<=16;step++){const x=(step/16-.5)*width;points.push([x,height(x,side*depth/2),side*depth/2]);}
   line(points,edge,.085,roof);
  }
  line([[-width/2,base+rise+.15,0],[0,base+rise+.08,0],[width/2,base+rise+.15,0]],shadow,.1,roof);
  brackets(roof,width,base,depth);
  for(let x=-width/2+.5;x<=width/2-.4;x+=.9){
   const points=[];for(let step=0;step<=steps;step++){const z=(step/steps-.5)*depth;points.push([x,height(x,z)-.09,z]);}
   line(points,stone,.065,roof);
   for(const side of [-1,1]){
    const z=side*depth*.28,top=height(x,z)-.1,bottom=base-.3;
    box(.16,top-bottom,.24,stone,roof,x,(top+bottom)/2,z);
   }
  }
 }
 function door(parent,width,height){
  const leaf=group('Cánh cửa gỗ',parent);box(width,height,.16,wood,leaf,0,height/2+.05,0);
  const boards=Math.ceil(width/.2);
  for(let board=0;board<boards;board++)box(.018,height-.08,.025,'#795240',leaf,-width/2+(board+.5)*width/boards,height/2+.05,.092);
  for(const y of [.24,height-.14])box(width,.12,.06,'#443027',leaf,0,y,.12);
  return leaf;
 }
 for(const x of [-2.65,2.65])pillar(x,5.65);
 for(const side of [-1,1]){
  pillar(side*(CAMPUS_BOUNDS.gateRight-CAMPUS_BOUNDS.gateLeft)/2,3.55);
  const wing=group('Cổng phụ có cửa gỗ');wing.position.x=side*4.15;
  door(wing,1.85,3.15);box(2.6,.28,.72,stone,wing,0,3.5,0);tiledRoof(wing,3.65,3.4,4.45,.65);
  const hinge=group('Cửa chính mở vào sân');hinge.position.set(side*2.65,0,-.08);hinge.rotation.y=-side*Math.PI/2;
  const leaf=door(hinge,2.35,3.3);leaf.position.x=-side*1.175;
 }
 box(5.3,.35,.85,stone,gate,0,3.8,0);box(5.3,.32,.8,stone,gate,0,5.4,0);
 panel('Tu Viện Khánh An',4.65,1.05,gate,0,4.65,.52);
 for(const side of [-1,1]){
  box(5.1,.32,.25,shadow,gate,0,5.9,side*.7);
  for(let x=-2.3;x<=2.3;x+=.38)box(.09,.48,.14,stone,gate,x,6.05,side*.7);
 }
 tiledRoof(gate,7.65,4.1,6.65,.85);
 return gate;
}
