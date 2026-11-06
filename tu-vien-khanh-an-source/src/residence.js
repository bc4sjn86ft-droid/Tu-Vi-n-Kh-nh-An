import * as THREE from 'three';
import {WORLD,RESIDENCE} from './world-layout.js';
import {buildStoneRailing} from './stone-railing.js';
import {buildBuddhistFlag} from './buddhist-flag.js';
import {sealRoofWalls} from './roof-junction.js';

function brickMaterial(mat){
 const material=mat('#b78968').clone();material.name='Gạch nung mạch vữa nhà tăng';
 if(typeof document==='undefined')return material;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const context=canvas.getContext('2d');context.fillStyle='#c2a18a';context.fillRect(0,0,512,512);
 for(let row=0;row<20;row++)for(let column=-1;column<7;column++){
  const shade=154+(row*17+column*11)%24;
  context.fillStyle=`rgb(${shade+24},${shade-13},${shade-37})`;
  context.fillRect(column*88+(row%2)*44+2,row*26+2,84,22);
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;
 material.color.set('#ffffff');material.map=texture;return material;
}

export function buildResidence(helpers){
 const {scene,mat,box,cyl,ball,line,mesh,sign}=helpers,layout=RESIDENCE;
 const building=new THREE.Group();building.name='Nhà tăng theo ảnh thực tế';building.position.set(WORLD.residence.x,0,WORLD.residence.z);building.rotation.y=layout.rotation;scene.add(building);
 const red=mat('#a73f32'),darkRed=mat('#77362c'),cream=mat('#e9ddc5'),wood=mat('#583b2a'),gold=mat('#c8a451',.45),tile=mat('#4c5759'),tileEdge=mat('#7a8381'),stone=mat('#c7ceca'),brick=brickMaterial(mat);
 const roofMaterial=tile.clone();roofMaterial.side=THREE.DoubleSide;
 function group(name,parent=building){const object=new THREE.Group();object.name=name;parent.add(object);return object;}
 function rail(from,to,parent=building){return buildStoneRailing({parent,from,to,box,cyl,ball,mesh,mat});}
 function lantern(parent,x,y,z){
  const lamp=group('Đèn lồng trắng dưới mái nhà tăng',parent);lamp.position.set(x,y,z);lamp.userData.noCollision=true;
  cyl(.018,.018,.28,darkRed,lamp,0,-.14,0,6);
  const shade=mat('#f1dfb2').clone();shade.emissive=new THREE.Color('#ffc26b');shade.emissiveIntensity=.35;
  box(.25,.37,.25,shade,lamp,0,-.47,0);
  for(const yy of [-.28,-.68])box(.3,.055,.3,cream,lamp,0,yy,0);
  for(const xx of [-.13,.13])for(const zz of [-.13,.13])box(.018,.38,.018,cream,lamp,xx,-.47,zz);
 }
 function brackets(parent,width,depth,height){
  for(let x=-width/2+.6;x<width/2;x+=1.3)for(const side of [-1,1]){
   for(let level=0;level<3;level++)box(.16,.14,.38+level*.18,level%2?cream:darkRed,parent,x,height+level*.18,side*(depth/2-.25));
  }
  for(let z=-depth/2+1;z<depth/2;z+=1.6)for(const side of [-1,1]){
   for(let level=0;level<3;level++)box(.38+level*.18,.14,.16,level%2?cream:darkRed,parent,side*(width/2-.25),height+level*.18,z);
  }
 }
 function roofSurface(parent,rows,columns,point){
  const positions=[],indices=[];
  for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){
   positions.push(...point(row/rows,column/columns));
   if(row<rows&&column<columns){const index=row*(columns+1)+column;indices.push(index,index+columns+1,index+1,index+1,index+columns+1,index+columns+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return mesh(geometry,roofMaterial,parent);
 }
 function hipRoof(parent,width,depth,height,rise,innerWidth=.12,innerDepth=.12){
  const roof=group('Mái ngói bốn góc cong',parent),corners=[[-width/2,-depth/2],[width/2,-depth/2],[width/2,depth/2],[-width/2,depth/2]],inner=[[-innerWidth/2,-innerDepth/2],[innerWidth/2,-innerDepth/2],[innerWidth/2,innerDepth/2],[-innerWidth/2,innerDepth/2]];
  for(let face=0;face<4;face++){
   const next=(face+1)%4,count=Math.ceil((face%2?depth:width)/.29);
   const point=(along,blend)=>{
    const outerX=THREE.MathUtils.lerp(corners[face][0],corners[next][0],along),outerZ=THREE.MathUtils.lerp(corners[face][1],corners[next][1],along);
    return [THREE.MathUtils.lerp(outerX,THREE.MathUtils.lerp(inner[face][0],inner[next][0],along),blend),height+rise*blend+.22*Math.pow(1-blend,7)+.32*Math.pow(Math.abs(along*2-1),10)*(1-blend),THREE.MathUtils.lerp(outerZ,THREE.MathUtils.lerp(inner[face][1],inner[next][1],along),blend)];
   };
   roofSurface(roof,count,10,point);
   for(let course=0;course<=count;course++)line(Array.from({length:11},(_,step)=>{const position=point(course/count,step/10);position[1]+=.025;return position;}),tileEdge,.023,roof);
   line(Array.from({length:count+1},(_,course)=>point(course/count,0)),darkRed,.09,roof);
   const hip=Array.from({length:11},(_,step)=>{const position=point(0,step/10);position[1]+=.06;return position;});line(hip,tileEdge,.085,roof);
  }
  return roof;
 }
 function gableRoof(parent,width,depth,height,rise){
  const roof=group('Mái dốc hai mặt ngói xám',parent),count=Math.ceil(depth/.27);
  const point=(along,blend,side)=>[side*width/2*(1-blend),height+rise*Math.pow(blend,.85)+.24*Math.pow(1-blend,8)+.2*Math.pow(Math.abs(along*2-1),12)*(1-blend),(along-.5)*depth];
  for(const side of [-1,1]){
   roofSurface(roof,count,14,(along,blend)=>point(along,blend,side));
   for(let course=0;course<=count;course++)line(Array.from({length:15},(_,step)=>{const position=point(course/count,step/14,side);position[1]+=.035;return position;}),tileEdge,.025,roof);
   line(Array.from({length:count+1},(_,course)=>point(course/count,0,side)),darkRed,.12,roof);
   for(const end of [0,1])line(Array.from({length:15},(_,step)=>{const position=point(end,step/14,side);position[1]+=.06;return position;}),tileEdge,.105,roof);
  }
  line([[0,height+rise+.45,-depth/2-.35],[0,height+rise+.1,-depth/2+1],[0,height+rise+.08,depth/2-1],[0,height+rise+.45,depth/2+.35]],tileEdge,.13,roof);
  return roof;
 }
 function crest(parent,x,y,z,scale=1){
  const ornament=group('Phù điêu sen vàng đầu hồi',parent);ornament.position.set(x,y,z);ornament.scale.setScalar(scale);ornament.userData.noCollision=true;
  const shape=new THREE.Shape();shape.moveTo(-.12,-.65);shape.bezierCurveTo(-.45,-.95,-.62,-.45,-.8,-.5);shape.bezierCurveTo(-1.2,-.65,-1.05,.05,-.65,.06);shape.lineTo(-.8,.38);shape.quadraticCurveTo(0,1.05,.8,.38);shape.lineTo(.65,.06);shape.bezierCurveTo(1.05,.05,1.2,-.65,.8,-.5);shape.bezierCurveTo(.62,-.45,.45,-.95,.12,-.65);shape.closePath();
  mesh(new THREE.ExtrudeGeometry(shape,{depth:.08,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:1,curveSegments:10}),gold,ornament);
  for(let petal=0;petal<7;petal++){const angle=(petal-3)*.3,leaf=ball(.16,gold,ornament,Math.sin(angle)*.45,.35+Math.cos(angle)*.27,.15,[.5,1.7,.28]);leaf.rotation.z=-angle;}
  line([[-.42,.14,.18],[0,.04,.18],[.42,.14,.18]],darkRed,.025,ornament);
  const wheel=mesh(new THREE.TorusGeometry(.32,.018,6,24),darkRed,ornament,0,.51,.21);wheel.scale.y=1.12;
  for(const side of [-1,1])line([[side*.08,.22,.22],[side*.35,.34,.22],[side*.24,.55,.22],[0,.38,.22]],darkRed,.018,ornament);
  if(typeof document!=='undefined'){
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
   const context=canvas.getContext('2d');context.fillStyle='#664b25';context.font='bold 38px serif';context.textAlign='center';context.textBaseline='middle';context.fillText('TU VIỆN KHÁNH AN',256,64);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
   mesh(new THREE.PlaneGeometry(1.35,.34),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}),ornament,0,-.19,.16);
  }
 }
 function gable(parent,width,base,height,z,withCrest=true){
  const face=group('Đầu hồi sọc trắng đỏ',parent),shape=new THREE.Shape();shape.moveTo(-width/2,base);shape.lineTo(0,base+height);shape.lineTo(width/2,base);shape.closePath();
  const panel=mesh(new THREE.ShapeGeometry(shape),red,face,0,0,z);panel.material=red.clone();panel.material.side=THREE.DoubleSide;
  for(let x=-width/2+.45;x<width/2;x+=.72){const top=height*(1-(Math.abs(x)+.13)/(width/2));if(top>.1)box(.24,top,.06,cream,face,x,base+top/2,z+.05);}
  line([[-width/2,base,z+.13],[0,base+height,z+.13],[width/2,base,z+.13]],gold,.065,face);
  if(withCrest)crest(face,0,base+height*.64,z+.19,Math.min(1.3,width/7));
  return face;
 }
 function woodWindow(parent,width,height){
  const window=group('Cửa gỗ nhà tăng',parent);box(width,height,.12,wood,window,0,height/2,.02);
  for(const xx of [-width/2,width/2])box(.1,height+.12,.17,darkRed,window,xx,height/2,.08);
  for(const yy of [0,height*.4,height])box(width+.12,.09,.18,darkRed,window,0,yy,.09);
  for(let xx=-width/2+.13;xx<width/2;xx+=.18)box(.035,height*.55,.045,cream,window,xx,height*.7,.11);
  for(let row=0;row<3;row++)box(width-.2,.035,.07,red,window,0,height*.47+row*.2,.13);
  return window;
 }
 function awning(parent,width,y,z){
  const canopy=group('Mái nhỏ che cửa',parent);canopy.position.set(0,y,z);
  const surface=box(width,.1,1.05,tile,canopy,0,0,.25);surface.rotation.x=.13;
  for(let xx=-width/2;xx<=width/2;xx+=.2){const rib=cyl(.035,.035,1.04,tileEdge,canopy,xx,.055,.25,6);rib.rotation.x=Math.PI/2+.13;}
  box(width,.16,.12,red,canopy,0,-.16,.73);
 }
 function entrance(parent,width,height){
  const door=group('Cửa ra vào hai cánh mở',parent);door.userData.openingWidth=width;
  for(const side of [-1,1]){
   box(.14,height+.12,.26,red,door,side*(width/2+.07),height/2,0);
   const hinge=group('Cánh cửa gỗ mở',door);hinge.position.x=side*width/2;hinge.rotation.y=-side*1.8;
   const leaf=woodWindow(hinge,width/2-.05,height-.08);leaf.position.x=-side*(width/4-.025);
   ball(.045,gold,leaf,side*(width/4-.15),height*.43,.16);
  }
  box(width+.4,.22,.32,red,door,0,height+.08,0);
  return door;
 }
 for(const [index,height] of layout.levels.entries()){
  const floor=group(`Nhà tăng · tầng ${index+1}`);floor.userData.level=index+1;
  const floorBack=index===1?layout.tower.terraceBack:layout.back;
  box(layout.halfWidth*2,.26,layout.front-floorBack,red,floor,0,height-.185,(layout.front+floorBack)/2);
  box(layout.halfWidth*2-.12,.045,layout.front-floorBack-.12,stone,floor,0,height-.0225,(layout.front+floorBack)/2);
  const wallHeight=index===0?4.99:4.94;
  for(const side of [-1,1]){
   for(let bay=0;bay<3;bay++){
    const z=-2.9+bay*5,wall=group('Gian tường gạch và cửa gỗ',floor);wall.position.set(side*layout.wallX,height,z);wall.rotation.y=side*Math.PI/2;
    if(index===1){
     box(4.7,wallHeight,.22,brick,wall,0,wallHeight/2,0);
     const window=woodWindow(wall,1.8,3.25);window.position.set(0,.22,.15);awning(wall,2.25,3.75,.12);
    }else{
     if(side===-1&&(bay===0||bay===1)){
      for(const edge of [-1,1])box(1.15,wallHeight,.22,brick,wall,edge*1.775,wallHeight/2,0);
      box(2.4,wallHeight-3.85,.22,brick,wall,0,(wallHeight+3.85)/2,0);
      const door=entrance(wall,2.4,3.7);door.position.z=.12;awning(wall,3.1,4.05,.1);
     }else box(4.7,wallHeight,.22,brick,wall,0,wallHeight/2,0);
     if(bay===2){
      const surround=mesh(new THREE.TorusGeometry(.63,.11,8,32),cream,wall,0,2.2,.19);surround.name='Cửa sổ tròn tầng dưới';
      const disk=mesh(new THREE.CircleGeometry(.58,32),wood,wall,0,2.2,.17);disk.name='Song cửa sổ tròn';
      for(const xx of [-.28,0,.28])box(.04,.97,.05,red,wall,xx,2.2,.21);
     }
    }
   }
   for(let z=layout.wallBack;z<=layout.wallFront+.01;z+=5)box(.36,wallHeight+.2,.36,red,floor,side*layout.wallX,height+wallHeight/2,z);
   rail([side*(layout.halfWidth-.15),height,floorBack+.15],[side*(layout.halfWidth-.15),height,layout.front-.15],floor);
  }
  for(const z of [layout.wallBack,layout.wallFront]){
   const entry=(index===0&&z===layout.wallFront)||(index===1&&z===layout.wallBack);
   for(const side of [-1,1])box(entry?4.45:5.45,wallHeight,.25,brick,floor,side*(entry?3.5:3),height+wallHeight/2,z);
   if(entry)box(2.55,wallHeight-3.85,.25,brick,floor,0,height+(wallHeight+3.85)/2,z);
   for(const x of entry?[-layout.wallX,layout.wallX]:[-layout.wallX,0,layout.wallX])box(.38,wallHeight+.2,.4,red,floor,x,height+wallHeight/2,z);
   box(11.9,.3,.48,red,floor,0,height+wallHeight,z);
  }
  if(index===1){const entry=entrance(floor,2.4,3.7);entry.position.set(0,height,layout.wallBack-.2);entry.rotation.y=Math.PI;}
  if(index===0){
   const entry=entrance(floor,2.4,3.7);entry.position.set(0,height,layout.wallFront+.2);awning(floor,3.1,height+4.05,layout.wallFront+.2);
   for(const [left,right] of [[-layout.halfWidth+.15,-1.55],[1.55,layout.halfWidth-.15]])rail([left,height,layout.front-.15],[right,height,layout.front-.15],floor);
  }else rail([-layout.halfWidth+.15,height,layout.front-.15],[layout.halfWidth-.15,height,layout.front-.15],floor);
  rail([-layout.halfWidth+.15,height,floorBack+.15],[layout.halfWidth-.15,height,floorBack+.15],floor);
  const roomDepth=layout.wallFront-layout.wallBack,roomCenter=(layout.wallFront+layout.wallBack)/2;
  const bracketGroup=group('Kèo hiên liên kết tường nhà tăng',floor);bracketGroup.position.z=roomCenter;brackets(bracketGroup,12,roomDepth,height+4.45);
  for(const side of [-1,1])box(.25,.3,roomDepth+.4,red,floor,side*5.85,height+wallHeight,roomCenter);
 }
 for(let step=0;step<2;step++)box(2.8,.18*(step+1),.44,stone,building,0,.09*(step+1),layout.front+.66-step*.44);
 sign('NHÀ TĂNG',2.2,.48,building,0,4.65,layout.wallFront+.24);
 const mainRoof=group('Bộ mái chính nhà tăng');mainRoof.position.z=2.4;
 hipRoof(mainRoof,17.2,19.8,10.7,1.25,12.7,15.2);
 gableRoof(mainRoof,16.1,18.6,11.35,4.0);
 gable(mainRoof,11.75,11.55,3.7,7.95);
 const rearGable=gable(mainRoof,11.75,11.55,3.7,7.95,false);rearGable.rotation.y=Math.PI;
 sealRoofWalls({parent:building,width:layout.wallX*2,back:layout.wallBack,front:layout.wallFront,bottom:10.52,material:red,name:'Tường đầu hồi và xà khép sát mái chính',heightAt(x,z){const blend=1-Math.abs(x)/8.05;return 11.35+4*Math.pow(blend,.85)+.24*Math.pow(1-blend,8)+.2*Math.pow(Math.abs((z-2.4)/9.3),12)*(1-blend)-.02;}});
 for(const side of [-1,1]){
  for(let z=-6.6;z<11.7;z+=3.2)lantern(building,side*7.2,10.55,z);
  for(const x of [-5.8,-2.9,0,2.9,5.8])lantern(building,x,10.6,side<0?-6.6:11.1);
 }
 for(const x of [-4,0,4])buildBuddhistFlag({mesh,mat,line},building,x,10.35,11.15);
 for(const z of [-5,-1,3,7])buildBuddhistFlag({mesh,mat,line},building,-7.05,10.35,z,-Math.PI/2);
 const frontTower=group('Lầu mái nhỏ đầu hồi');frontTower.position.z=5.6;
 box(3.7,3.15,3.7,red,frontTower,0,15.65,0);
 for(const side of [-1,1]){
  for(const x of [-1.8,1.8])box(.24,3.4,.24,darkRed,frontTower,x,15.7,side*1.8);
  for(let x=-1.4;x<=1.4;x+=.55)box(.15,1.6,.08,cream,frontTower,x,14.95,side*1.9);
  const window=woodWindow(frontTower,1.9,1.25);window.position.set(0,16,side*1.89);window.rotation.y=side<0?Math.PI:0;
  const sidePanel=group('Ô vàng mặt trước lầu nhỏ',frontTower);sidePanel.position.set(side*1.9,14.45,0);sidePanel.rotation.y=side*Math.PI/2;
  box(2.25,2.2,.08,gold,sidePanel,0,1.1,0);
  for(let row=0;row<7;row++)for(let column=0;column<7;column++){const xx=(column-3)*.28,yy=.22+row*.28;line([[xx-.08,yy+.1,.06],[xx+.08,yy+.1,.06],[xx+.08,yy-.08,.06],[xx-.04,yy-.08,.06]],darkRed,.012,sidePanel);}
 }
 hipRoof(frontTower,6.4,6.4,17.2,.8,3.4,3.4);gableRoof(frontTower,5.4,5.4,17.7,1.35);gable(frontTower,3.8,17.95,1.1,2.18,false);brackets(frontTower,4.5,4.5,16.7);
 for(const side of [-1,1])for(const x of [-2.4,2.4])lantern(frontTower,x,17.2,side*2.4);
 const terrace=group('Hành lang tầng 2 nối tháp riêng');terrace.userData.level=2;
 for(const x of [-6.6,6.6])for(const z of [-15,-11]){box(.45,5.25,.45,red,terrace,x,2.9,z);box(.85,.28,.85,stone,terrace,x,.5,z);}
 const tower=group('Tháp nhà tăng có bảo đỉnh vàng');tower.position.z=layout.tower.z;
 for(const [index,base] of layout.tower.bases.entries()){
  const width=index===2?4.7:5.1,height=3.65;
  box(width,height,width,red,tower,0,base+height/2,0);
  for(const side of [-1,1]){
   const panel=group('Ô hoa văn vàng trên tháp',tower);panel.position.set(0,base+.7,side*(width/2+.04));panel.rotation.y=side<0?Math.PI:0;
   box(2.15,2.65,.08,gold,panel,0,1.325,0);
   for(let row=0;row<9;row++)for(let column=0;column<7;column++){
    const x=(column-3)*.28,y=.16+row*.29;
    line([[x-.08,y+.12,.07],[x+.08,y+.12,.07],[x+.08,y-.08,.07],[x-.04,y-.08,.07],[x-.04,y+.02,.07]],darkRed,.014,panel);
   }
   for(const xx of [-width/2,width/2])box(.3,height+.2,.3,darkRed,tower,xx,base+height/2,side*width/2);
   const screen=group('Song gỗ hông tháp',tower);screen.position.set(side*(width/2+.03),base+.7,0);screen.rotation.y=side*Math.PI/2;
   for(let xx=-1.5;xx<=1.5;xx+=.3)box(.1,2.5,.1,wood,screen,xx,1.25,0);
   box(2.15,2.65,.08,gold,screen,0,1.325,.12);
   for(let row=0;row<9;row++)for(let column=0;column<7;column++){
    const xx=(column-3)*.28,yy=.16+row*.29;
    line([[xx-.08,yy+.12,.18],[xx+.08,yy+.12,.18],[xx+.08,yy-.08,.18],[xx-.04,yy-.08,.18],[xx-.04,yy+.02,.18]],darkRed,.014,screen);
   }
  }
  const balconyHeight=index===0?base-.14:base-.1;
  box(width+1.3,.2,width+1.3,red,tower,0,balconyHeight,0);
  for(const side of [-1,1]){
   for(const yy of [.45,.8,1.15]){
    box(width+.85,.08,.09,red,tower,0,balconyHeight+yy,side*(width/2+.48));
    box(.09,.08,width+.85,red,tower,side*(width/2+.48),balconyHeight+yy,0);
   }
   for(const xx of [-width/2-.45,0,width/2+.45]){
    box(.1,1.2,.1,darkRed,tower,xx,balconyHeight+.65,side*(width/2+.48));
    ball(.055,gold,tower,xx,balconyHeight+1.15,side*(width/2+.54));
   }
  }
  const roofWidth=width+3.1,rise=index===2?1.6:.95,blend=(roofWidth-width)/(roofWidth-.12);
  hipRoof(tower,roofWidth,roofWidth,base+height,rise);brackets(tower,width+.7,width+.7,base+height-.55);
  sealRoofWalls({parent:tower,width,back:-width/2,front:width/2,bottom:base+height,material:darkRed,heightAt(x,z){const along=Math.min(Math.abs(x),Math.abs(z))/(width/2);return base+height+rise*blend+.22*Math.pow(1-blend,7)+.32*Math.pow(along,10)*(1-blend)-.015;}});
  for(const side of [-1,1])for(const x of [-width/2-.6,width/2+.6])lantern(tower,x,base+height-.08,side*(width/2+.6));
 }
 const spire=group('Bảo đỉnh vàng nhiều vòng',tower);spire.position.y=layout.tower.bases.at(-1)+3.65+1.6;spire.userData.noCollision=true;
 cyl(.055,.09,4.3,gold,spire,0,2.1,0,12);
 for(let ring=0;ring<9;ring++){
  const radius=.36-ring*.018;cyl(radius*.8,radius,.095,gold,spire,0,.65+ring*.32,0,24);cyl(radius,radius*.75,.08,gold,spire,0,.73+ring*.32,0,24);
 }
 for(let petal=0;petal<12;petal++){const angle=petal*Math.PI/6,leaf=ball(.22,gold,spire,Math.cos(angle)*.34,.2,Math.sin(angle)*.34,[.5,2.2,.7]);leaf.rotation.z=Math.sin(angle)*.45;leaf.rotation.x=Math.cos(angle)*.45;}
 const jewel=mesh(new THREE.TorusGeometry(.32,.045,6,24),gold,spire,0,3.75,0);jewel.rotation.y=.5;
 const parasol=cyl(.16,.66,.22,gold,spire,0,4.12,0,12);parasol.name='Lọng vàng trên bảo đỉnh';
 for(let tassel=0;tassel<8;tassel++){const angle=tassel*Math.PI/4,x=Math.cos(angle)*.53,z=Math.sin(angle)*.53;line([[x,4.1,z],[x,3.72,z]],gold,.014,spire);ball(.045,darkRed,spire,x,3.68,z);}
 cyl(0,.14,.48,gold,spire,0,4.48,0,10);
 return building;
}
