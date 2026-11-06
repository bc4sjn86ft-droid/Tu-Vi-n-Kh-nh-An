import * as THREE from 'three';
import {WORLD} from './world-layout.js';

export function createPineRow(scene){
 let texture;
 if(typeof document==='undefined'){texture=new THREE.DataTexture(new Uint8Array([75,111,61,255]),1,1);texture.needsUpdate=true;}
 else{
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=512;const context=canvas.getContext('2d');
  context.lineCap='round';context.lineJoin='round';
  const trunk=context.createLinearGradient(160,0,211,0);trunk.addColorStop(0,'#684737');trunk.addColorStop(.6,'#9b7950');trunk.addColorStop(1,'#5a422f');
  context.strokeStyle=trunk;context.lineWidth=23;context.beginPath();context.moveTo(193,490);context.bezierCurveTo(166,416,220,324,184,242);context.bezierCurveTo(158,180,201,117,185,68);context.stroke();
  const crowns=[[185,70,65,29],[137,142,85,34],[249,205,94,36],[113,275,90,37],[254,345,104,40],[161,401,81,30]];
  for(const [index,[x,y,width,height]]of crowns.entries()){
   context.lineWidth=11;context.strokeStyle='#73533a';context.beginPath();context.moveTo(191,y+51);context.quadraticCurveTo((191+x)/2,y+12,x,y+12);context.stroke();
   const foliage=context.createLinearGradient(0,y-height,0,y+height);foliage.addColorStop(0,'#a5bf73');foliage.addColorStop(.42,'#658c4c');foliage.addColorStop(1,'#304d38');
   context.fillStyle=foliage;
   for(let tuft=0;tuft<16;tuft++){const phase=tuft*2.399+index;context.beginPath();context.ellipse(x+Math.cos(phase)*width*.63,y+Math.sin(phase)*height*.36,width*.39,height*.73,Math.sin(phase)*.1,0,Math.PI*2);context.fill();}
   for(let needle=0;needle<38;needle++){const phase=needle*2.399,spread=Math.sqrt(needle/38);context.fillStyle=needle%3?'#8ba96788':'#b5c88777';context.beginPath();context.ellipse(x+Math.cos(phase)*width*spread*.9,y+Math.sin(phase)*height*spread*.62-5,6,2.5,-.2,0,Math.PI*2);context.fill();}
  }
  texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 }
 const group=new THREE.Group();group.name='Hàng tùng Nhật chibi sau Quan Âm';scene.add(group);
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false,alphaTest:.04});
 for(let index=0;index<7;index++){
  const tree=new THREE.Sprite(material),height=6.3+index%3*.4;tree.name='Tùng Nhật billboard';tree.center.set(.5,0);tree.position.set(WORLD.quanAm.x+(index-3)*3.5,0,WORLD.quanAm.z-11.5-index%2*.55);tree.scale.set(height*.75,height,1);group.add(tree);
 }
 return group;
}
