import * as THREE from 'three';

function paintedMaterial(mat,stone=false){
 const material=mat(stone?'#979489':'#c3c5ae').clone();
 if(typeof document==='undefined')return material;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const context=canvas.getContext('2d');
 if(stone){
  context.fillStyle='#575f59';context.fillRect(0,0,512,256);
  for(let row=0;row<2;row++)for(let column=0;column<4;column++){
   const shade=123+(row*17+column*13)%33,gradient=context.createLinearGradient(column*128,row*128,column*128+128,row*128+128);gradient.addColorStop(0,`rgb(${shade},${shade+3},${shade-2})`);gradient.addColorStop(1,`rgb(${shade-23},${shade-19},${shade-18})`);context.fillStyle=gradient;context.fillRect(column*128+2,row*128+2,124,124);
   context.strokeStyle='#d7d6bc28';context.lineWidth=2;context.beginPath();context.moveTo(column*128+15,row*128+20);context.bezierCurveTo(column*128+80,row*128+35,column*128+30,row*128+90,column*128+117,row*128+100);context.stroke();
  }
 }else{
  context.fillStyle='#183e49';context.fillRect(0,0,512,256);context.strokeStyle='#cebc83';context.lineWidth=9;context.strokeRect(10,10,492,236);context.fillStyle='#c3c1a3';context.fillRect(30,34,452,188);
  for(let ridge=0;ridge<3;ridge++){
   context.fillStyle=['#7c9690','#557d74','#355d58'][ridge];context.beginPath();context.moveTo(30,222);
   for(let sample=0;sample<=18;sample++){const x=30+sample*25,y=130+ridge*22+Math.sin(sample*.8+ridge*2)*30;context.lineTo(x,y);}context.lineTo(482,222);context.fill();
  }
  context.strokeStyle='#dad5b7';context.lineWidth=3;
  for(let cloud=0;cloud<5;cloud++){context.beginPath();context.ellipse(80+cloud*88,65+cloud%2*23,30,8,0,0,Math.PI*1.8);context.stroke();}
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 if(stone){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,1);texture.anisotropy=2;}
 material.color.set('#ffffff');material.map=texture;return material;
}

export function buildCoveredCorridors({scene,mat,box,cyl,line,mesh}){
 const garden=new THREE.Group();garden.name='Hành lang gỗ đỏ và họa tiết sơn thủy';scene.add(garden);
 const red=mat('#94362f'),teal=mat('#315e59'),green=mat('#668575'),cream=mat('#d9cda7'),roofMaterial=mat('#3e4949').clone(),stone=paintedMaterial(mat,true),mural=paintedMaterial(mat);
 roofMaterial.side=THREE.DoubleSide;
 for(const x of [-10,36]){
  const corridor=new THREE.Group();corridor.name='Hành lang có mái theo ảnh';corridor.position.set(x,0,8);corridor.rotation.y=Math.PI/2;garden.add(corridor);
  const floor=box(26,.2,4,stone,corridor,0,.1,0);floor.name='Sàn đá hành lang duy nhất';
  const heightAt=(blend,along)=>3.9+1.1*Math.pow(blend,.82)+.18*Math.pow(1-blend,6)+.18*Math.pow(Math.abs(along*2-1),8)*(1-blend);
  for(const side of [-1,1]){
   const positions=[],indices=[];
   for(let span=0;span<=52;span++){
    const along=span/52,points=[];
    for(let slope=0;slope<=12;slope++){
     const blend=slope/12,xx=(along-.5)*27.5,zz=side*2.65*(1-blend),yy=heightAt(blend,along);positions.push(xx,yy,zz);points.push([xx,yy+.025,zz]);
     if(span<52&&slope<12){const offset=span*13+slope;indices.push(offset,offset+13,offset+1,offset+1,offset+13,offset+14);}
    }
    line(points,'#6a7470',.023,corridor);
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();const roof=mesh(geometry,roofMaterial,corridor);roof.name='Mái hành lang ngói cong';
   box(27.3,.18,.14,red,corridor,0,3.94,side*2.5);
  }
  box(26,.12,3.7,teal,corridor,0,3.82,0);
  for(let bay=0;bay<=8;bay++){
   const xx=-13+bay*3.25;
   for(const side of [-1,1]){
    const post=cyl(.19,.23,3.65,red,corridor,xx,2.025,side*1.65,16);post.name='Cột son hành lang';
    cyl(.26,.29,.15,cream,corridor,xx,.275,side*1.65,12);
    for(let tier=0;tier<3;tier++)box(.45+tier*.14,.13,.45+tier*.14,tier%2?cream:teal,corridor,xx,3.53+tier*.15,side*1.65);
    box(.24,.55,.24,teal,corridor,xx,4.1,side*1.65);
   }
   const panel=box(.16,.7,3.2,mural,corridor,xx,3.28,0);panel.name='Hoành phi sơn thủy dưới xà';
   for(const yy of [2.9,3.67])box(.22,.09,3.45,red,corridor,xx,yy,0);
   for(const side of [-1,1])box(.22,.8,.08,cream,corridor,xx,3.28,side*1.6);
   for(const side of [-1,1])line(Array.from({length:13},(_,step)=>{const blend=step/12;return [xx,heightAt(blend,(xx/27.5+.5))-.08,side*2.65*(1-blend)];}),teal,.085,corridor);
   if(bay===8)continue;
   for(const side of [-1,1]){
    const center=xx+1.625;
    for(const yy of [.3,1.02])box(3.1,.1,.12,red,corridor,center,yy,side*1.65);
    box(3.1,.065,.1,cream,corridor,center,.66,side*1.65);
    for(let motif=0;motif<4;motif++){
     const start=xx+.35+motif*.7;
     for(const edge of [-1,1]){box(.045,.56,.07,green,corridor,start+edge*.23,.66,side*1.65);box(.46,.045,.07,cream,corridor,start,.66+edge*.2,side*1.65);}
    }
    for(const yy of [2.55,2.81])box(3.1,.07,.08,teal,corridor,center,yy,side*1.65);
    for(let lattice=0;lattice<9;lattice++)box(.045,.26,.07,cream,corridor,xx+.25+lattice*.34,2.68,side*1.65);
   }
  }
 }
 return garden;
}
