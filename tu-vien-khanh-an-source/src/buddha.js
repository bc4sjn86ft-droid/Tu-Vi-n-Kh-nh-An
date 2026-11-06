import * as THREE from 'three';

export function sculptBuddha({temple,mat,box,ball,cyl,line,mesh},x,size){
 const statue=new THREE.Group();statue.name=x===0?'Tượng Phật trung tâm':x<0?'Tượng Phật bên trái':'Tượng Phật bên phải';statue.position.set(x,1,-10.5);statue.scale.setScalar(size);temple.add(statue);
 const gold=mat('#bb8f39',.42),highlight=mat('#d8b15f',.35),shade=mat('#90672d',.3);
 function smooth(radius,material,parent,xx,yy,zz,scale=[1,1,1]){const object=mesh(new THREE.SphereGeometry(radius,40,28),material,parent,xx,yy,zz);object.scale.set(...scale);return object;}
 function hand(xx,yy,zz,rotation,raised=false){
  const group=new THREE.Group();group.name='Bàn tay với năm ngón';group.position.set(xx,yy,zz);group.rotation.set(...rotation);statue.add(group);
  smooth(.14,highlight,group,0,0,0,[.8,1.1,.42]);
  for(let finger=0;finger<4;finger++){
   const offset=(finger-1.5)*.052,length=[.15,.2,.18,.13][finger];
   line([[offset,.06,0],[offset,.1+length*.5,.015],[offset*.9,.1+length,.01]],highlight,.025,group);
   line([[offset-.015,.1+length*.52,.038],[offset+.015,.1+length*.52,.038]],shade,.003,group);
   smooth(.014,gold,group,offset*.9,.09+length,.036,[.8,1.1,.2]);
  }
  line([[-.09,-.03,0],[-.17,.02,.025],[-.15,.13,.025]],highlight,.035,group);
  line([[-.06,-.04,.06],[0,-.07,.06],[.06,.02,.06]],shade,.004,group);
  if(raised){const crease=mesh(new THREE.TorusGeometry(.035,.004,4,16),shade,group,0,.015,.065);crease.scale.y=1.3;}
 }
 box(3.9,.45,2.9,'#3c2b21',statue,0,.225,0);
 for(const yy of [.1,.4])box(3.95,.065,2.95,gold,statue,0,yy,0);
 for(let carving=-1.6;carving<=1.6;carving+=.32){const bead=mesh(new THREE.TorusGeometry(.07,.018,5,12),highlight,statue,carving,.27,1.46);bead.scale.y=1.2;}
 cyl(1.49,1.67,.27,gold,statue,0,.6,0,64);
 const petalShape=new THREE.Shape();petalShape.moveTo(0,-.25);petalShape.bezierCurveTo(-.26,-.2,-.32,.2,0,.48);petalShape.bezierCurveTo(.32,.2,.26,-.2,0,-.25);
 const petalGeometry=new THREE.ExtrudeGeometry(petalShape,{depth:.045,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:3,curveSegments:16,steps:1});
 for(let row=0;row<3;row++)for(let petal=0;petal<24;petal++){
  const angle=petal*Math.PI/12+row*.13,radius=1.47-row*.12,object=mesh(petalGeometry,row%2?highlight:gold,statue,Math.sin(angle)*radius,.67+row*.17,Math.cos(angle)*radius*.76);object.rotation.set(-.25,angle,0);
  const vein=mesh(new THREE.PlaneGeometry(.012,.34),shade,object,0,.08,.083);vein.rotation.z=.08;
 }
 for(const side of [-1,1]){
  const knee=smooth(.75,gold,statue,side*.65,1.25,.22,[1.3,.43,.95]);knee.rotation.z=side*.1;
  smooth(.25,highlight,statue,side*.4,1.38,.8,[1.45,.4,.75]);
  for(let toe=0;toe<5;toe++)smooth(.045,highlight,statue,side*(.24+toe*.07),1.4,.9,[.6,.45,1]);
 }
 const profile=[[.6,1.32],[.67,1.5],[.61,1.8],[.57,2.12],[.58,2.38],[.49,2.62],[.26,2.78]].map(([radius,height])=>new THREE.Vector2(radius,height));
 const torso=mesh(new THREE.LatheGeometry(profile,72),gold,statue);torso.scale.z=.73;
 cyl(.18,.23,.3,highlight,statue,0,2.8,0,40);
 const head=smooth(.45,highlight,statue,0,3.28,.02,[.9,1.22,.84]);head.name='Khuôn mặt tượng';
 smooth(.27,highlight,statue,0,3.04,.16,[.98,.7,.83]);
 for(const side of [-1,1]){
  smooth(.1,gold,statue,side*.42,3.25,.01,[.8,1.8,.65]);
  line([[side*.42,3.39,.065],[side*.47,3.25,.065],[side*.43,3.07,.055],[side*.4,3.12,.07]],shade,.012,statue);
  line([[side*.075,3.43,.372],[side*.17,3.46,.36],[side*.29,3.4,.28]],shade,.015,statue);
  line([[side*.075,3.32,.397],[side*.17,3.29,.389],[side*.27,3.32,.32]],shade,.01,statue);
  line([[side*.08,3.34,.395],[side*.17,3.32,.397],[side*.26,3.34,.325]],gold,.013,statue);
  smooth(.1,highlight,statue,side*.2,3.18,.31,[1.1,.65,.55]);
  const upperArm=smooth(.23,gold,statue,side*.59,2.22,.02,[.95,1.8,1]);upperArm.rotation.z=side*.22;
 }
 smooth(.075,highlight,statue,0,3.25,.385,[.6,1.45,.8]);smooth(.07,highlight,statue,0,3.17,.407,[.75,.53,.75]);
 for(const side of [-1,1])smooth(.028,shade,statue,side*.045,3.15,.416,[.7,.4,.45]);
 line([[-.1,3.04,.37],[0,3.025,.409],[.1,3.04,.37]],shade,.008,statue);
 line([[-.085,3.015,.374],[0,3.003,.396],[.085,3.015,.374]],gold,.01,statue);
 smooth(.023,gold,statue,0,3.51,.37);smooth(.025,highlight,statue,0,3.51,.387,[.6,.6,.3]);
 const curls=[];
 for(let row=0;row<9;row++){
  const latitude=(row+.5)/9*Math.PI*.55,count=Math.max(8,Math.round(Math.sin(latitude)*38));
  for(let curl=0;curl<count;curl++){const angle=curl/count*Math.PI*2+row*.18;curls.push([Math.sin(latitude)*Math.cos(angle)*.41,3.51+Math.cos(latitude)*.31,Math.sin(latitude)*Math.sin(angle)*.37]);}
 }
 const hair=new THREE.InstancedMesh(new THREE.SphereGeometry(.034,8,6),gold,curls.length),transform=new THREE.Object3D();
 curls.forEach((position,index)=>{transform.position.set(...position);transform.updateMatrix();hair.setMatrixAt(index,transform.matrix);});hair.castShadow=true;statue.add(hair);
 smooth(.14,gold,statue,0,3.86,0,[.85,.9,.85]);smooth(.075,highlight,statue,0,4,0,[.8,1.2,.8]);
 for(let fold=0;fold<8;fold++){
  const yy=2.67-fold*.105;line([[-.48,yy+.08,.21],[-.32,yy-.16,.39],[.05,yy-.31,.46],[.4,yy-.14,.28]],fold%2?highlight:shade,.011,statue);
 }
 for(let fold=0;fold<7;fold++)for(const side of [-1,1])line([[side*.25,1.42,.78],[side*.65,1.24-fold*.035,.84],[side*1.14,1.3-fold*.035,.49]],shade,.01,statue);
 line([[-.49,2.63,.1],[-.58,2.2,.2],[-.5,1.8,.35],[-.78,1.4,.65]],highlight,.04,statue);
 if(x>0){
  line([[.6,2.05,.05],[.74,2.28,.2],[.62,2.62,.35]],gold,.14,statue);hand(.6,2.71,.35,[0,0,-.12],true);
  line([[-.59,2,.05],[-.5,1.75,.36],[-.16,1.69,.64]],gold,.13,statue);hand(-.1,1.68,.67,[-Math.PI/2,0,Math.PI/2]);
 }else{
  line([[-.59,2,.05],[-.5,1.75,.36],[-.16,1.69,.64]],gold,.13,statue);hand(-.1,1.68,.67,[-Math.PI/2,0,Math.PI/2]);
  if(x===0){line([[.6,2,.05],[.78,1.62,.34],[.82,1.27,.6]],gold,.13,statue);hand(.82,1.17,.66,[0,0,Math.PI]);}
  else{line([[.59,2,.05],[.5,1.76,.35],[.15,1.72,.68]],gold,.13,statue);hand(.12,1.76,.68,[-Math.PI/2,0,-Math.PI/2]);}
 }
 for(const radius of [1.02,1.1,1.38,1.44])mesh(new THREE.TorusGeometry(radius,.014,6,96),highlight,statue,0,3.18,-.6);
 for(let ray=0;ray<48;ray++){
  const angle=ray*Math.PI/24;line([[Math.cos(angle)*1.12,3.18+Math.sin(angle)*1.12,-.6],[Math.cos(angle)*1.36,3.18+Math.sin(angle)*1.36,-.6]],gold,.008,statue);
 }
 return statue;
}
