import * as THREE from 'three';

export function buildHallPlaque({mesh},parent,text,y,z){
 const material=new THREE.MeshBasicMaterial({color:'#f0d795'});
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=256;
  const context=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  function paint(){
   context.fillStyle='#37251e';context.fillRect(0,0,1536,256);
   context.strokeStyle='#c99f55';context.lineWidth=7;context.strokeRect(12,12,1512,232);
   context.lineWidth=2;context.strokeRect(25,25,1486,206);
   for(const side of [-1,1]){
    context.save();context.translate(side===-1?112:1424,130);context.scale(side===-1?1:-1,1);
    context.strokeStyle='#e0bc73';context.lineWidth=3;
    for(const angle of [-.85,-.42,0,.42,.85]){
     context.save();context.rotate(angle);context.beginPath();context.moveTo(0,43);context.bezierCurveTo(-35,8,-24,-39,0,-57);context.bezierCurveTo(24,-39,35,8,0,43);context.stroke();context.restore();
    }
    for(const offset of [-78,72]){context.beginPath();context.moveTo(-51,offset);context.bezierCurveTo(-26,offset-26,-2,offset+17,26,offset);context.bezierCurveTo(54,offset-20,67,offset+10,48,offset+14);context.stroke();}
    context.restore();
   }
   context.textAlign='center';context.textBaseline='middle';context.font='700 112px "KhanhAnThuPhap", cursive';
   context.fillStyle='#f3d68c';context.fillText(text,768,133,1160);texture.needsUpdate=true;
  }
  paint();document.fonts.load('700 112px "KhanhAnThuPhap"').then(paint).catch(()=>{});
  material.map=texture;material.color.set('#ffffff');
 }
 const plaque=mesh(new THREE.PlaneGeometry(6.6,1.1),material,parent,0,y,z);
 plaque.name='Hoành phi thư pháp chính điện';plaque.userData.inscription=text;plaque.userData.noCollision=true;
 plaque.castShadow=false;plaque.receiveShadow=false;
 return plaque;
}
