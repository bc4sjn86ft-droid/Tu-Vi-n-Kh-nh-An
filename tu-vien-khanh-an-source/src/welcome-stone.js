import * as THREE from 'three';
import {WORLD} from './world-layout.js';

export function buildWelcomeStone({scene,mat,mesh,box,ball,cyl,line}){
 const garden=new THREE.Group();garden.name='Đá khắc thư pháp Tu viện Khánh An';garden.position.set(WORLD.welcomeStone.x,0,WORLD.welcomeStone.z);scene.add(garden);
 const shape=new THREE.Shape();shape.moveTo(-1.15,0);for(const point of [[-1.35,1],[-1.23,2.1],[-1.31,3.2],[-1,4.05],[-1.15,4.8],[-.75,5.5],[-.15,5.7],[.5,5.4],[.62,4.8],[1,4.3],[.93,3.65],[1.24,3.4],[1.14,2.2],[1.3,1.2],[1.06,.04]])shape.lineTo(...point);shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:true,bevelThickness:.18,bevelSize:.16,bevelSegments:2,curveSegments:10});
 const positions=geometry.attributes.position,colors=[];
 for(let vertex=0;vertex<positions.count;vertex++){
  const x=positions.getX(vertex),y=positions.getY(vertex),z=positions.getZ(vertex),grain=Math.sin(x*58+y*17+z*47)*Math.sin(x*11-y*61)*.055,color=new THREE.Color('#aa9d87');color.offsetHSL(0,0,grain);colors.push(color.r,color.g,color.b);
 }
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));const stone=mat('#ffffff').clone();stone.vertexColors=true;
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const context=canvas.getContext('2d'),image=context.createImageData(256,256);let seed=4129;
  for(let index=0;index<image.data.length;index+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const shade=205+seed%51;image.data[index]=shade;image.data[index+1]=shade;image.data[index+2]=shade;image.data[index+3]=255;}
  context.putImageData(image,0,0);const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  stone.map=texture;stone.bumpMap=texture;stone.bumpScale=.045;stone.roughness=.96;
 }
 const boulder=mesh(geometry,stone,garden,0,0,-.42);boulder.name='Tảng đá dựng khắc chữ';boulder.userData.inscription='TU VIỆN KHÁNH AN';
 box(2.8,.14,1.45,'#7c8068',garden,0,.03,0);
 for(const side of [-1,1])ball(.85,'#8f806a',garden,side*1.65,.43,side*.25,[.65,1,.7]);
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1536;const context=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  function write(){
   context.clearRect(0,0,768,1536);context.textAlign='center';context.textBaseline='middle';context.font='700 220px "KhanhAnThuPhap", "Brush Script MT", cursive';
   for(const [index,word] of ['Tu','Viện','Khánh','An'].entries()){
    const y=220+index*340;context.lineWidth=5;context.strokeStyle='#5e4936';context.strokeText(word,386,y,690);context.fillStyle='#dabc6e';context.fillText(word,384,y-2,690);
   }
   texture.needsUpdate=true;
  }
  write();document.fonts.load('700 220px "KhanhAnThuPhap"').then(write).catch(()=>{});
  const inscription=mesh(new THREE.PlaneGeometry(2.12,4.65),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}),garden,0,2.8,.43);inscription.name='Chữ thư pháp vàng khắc trên đá';inscription.castShadow=false;
 }
 const plants=new THREE.Group();plants.name='Tiểu cảnh quanh bia đá';plants.userData.noCollision=true;garden.add(plants);
 for(let blade=0;blade<15;blade++){
  const angle=blade*Math.PI*2/15,x=Math.cos(angle)*1.65,z=Math.sin(angle)*.75;
  line([[x,.08,z],[x*1.12,.65,z*1.15],[x*1.25,.48,z*1.3]],'#687b4e',.035,plants);
 }
 cyl(.13,.2,.45,'#a7aa92',garden,1.9,.23,.8,8);box(.42,.28,.42,'#d1c8ab',garden,1.9,.6,.8);
 return garden;
}
