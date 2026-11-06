import * as THREE from 'three';
import {WORLD} from './world-layout.js';
import {buildIncenseBurner} from './incense-burner.js';

export function buildQuanAm({scene,mesh,mat,sign}){
 const statue=new THREE.Group();statue.name='Quan Âm tự tại trên bệ đá';statue.position.set(WORLD.quanAm.x,0,WORLD.quanAm.z);scene.add(statue);
 const marble=mat('#eeeef0'),light=mat('#faf9f5'),shadow=mat('#c5c9cf'),rock=mat('#d3d6d8');
 const cloth=marble.clone();cloth.side=THREE.DoubleSide;
 function smooth(name,position,scale,material=marble,parent=statue){
  const object=mesh(new THREE.SphereGeometry(1,36,24),material,parent,...position);object.scale.set(...scale);object.name=name;return object;
 }
 function stroke(points,radius,material=light,parent=statue){
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),40,radius,8,false),material,parent);
 }
 function drape(name,sections,folds,amplitude){
  const curve=new THREE.CatmullRomCurve3(sections.map(section=>new THREE.Vector3(...section.slice(0,3)))),rows=48,columns=64,vertices=[],indices=[];
  for(let row=0;row<=rows;row++){
   const progress=row/rows,center=curve.getPoint(progress),section=progress*(sections.length-1),index=Math.min(sections.length-2,Math.floor(section)),width=THREE.MathUtils.lerp(sections[index][3],sections[index+1][3],section-index);
   for(let column=0;column<=columns;column++){
    const across=column/columns*2-1,phase=across*Math.PI*folds+2.2*Math.sin(progress*Math.PI)*Math.cos(across*Math.PI/2),ripple=Math.cos(phase)*amplitude*.45*(.25+.75*Math.sin(progress*Math.PI/2));
    vertices.push(center.x+across*width,center.y+.07*Math.cos(across*Math.PI*2)*Math.sin(progress*Math.PI),center.z+Math.sqrt(Math.max(0,1-across*across))*.16+ripple);
    if(row<rows&&column<columns){const vertex=row*(columns+1)+column;indices.push(vertex,vertex+columns+1,vertex+1,vertex+1,vertex+columns+1,vertex+columns+2);}
   }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const object=mesh(geometry,cloth,statue);object.name=name;return object;
 }
 const base=mesh(new THREE.BoxGeometry(5.5,.22,3.5),rock,statue,0,.11,0);base.name='Đế đá nguyên khối';
 smooth('Khối đá liền nền',[0,.75,0],[2.45,.55,1.5],rock);
 for(let index=0;index<19;index++){
  const angle=index*2.39996,radius=index<12?1.65:.8,stone=mesh(new THREE.IcosahedronGeometry(1,0),index%3?rock:marble,statue,Math.cos(angle)*radius,.5+(index%4)*.12,Math.sin(angle)*radius*.65);
  stone.scale.set(.65+(index%3)*.13,.65+(index%4)*.13,.65);stone.rotation.set(.1*index,.7*index,.13*index);stone.name='Mỏm đá chạm';
  stone.updateMatrix();stone.geometry.computeBoundingBox();const bounds=stone.geometry.boundingBox.clone().applyMatrix4(stone.matrix);stone.position.y+=Math.max(0,.22-bounds.min.y);
 }
 smooth('Tảng đá ngồi', [0,1.95,-.22],[2.35,.58,1.02],rock);
 drape('Vạt áo phủ bệ đá',[[-.05,2.47,.55,2.22],[0,2.17,.92,2.28],[.06,1.64,1.01,2.16],[.1,1.36,1.04,1.95]],12,.085);
 smooth('Hông ngồi',[0,2.62,0],[.8,.48,.55]);
 const body=mesh(new THREE.LatheGeometry([[.64,2.6],[.65,2.9],[.5,3.2],[.53,3.6],[.66,3.92],[.55,4.15],[.28,4.28]].map(point=>new THREE.Vector2(...point)),64),marble,statue);body.scale.z=.72;body.name='Thân tượng ngồi';
 smooth('Cổ',[0,4.4,.015],[.24,.32,.23]);
 smooth('Đùi chân co',[-.92,2.88,.2],[.52,.66,.52]);
 smooth('Đầu gối chân co',[-1.03,3.3,.37],[.43,.48,.44]);
 stroke([[-1.05,3.21,.42],[-1.29,2.76,.51],[-1.39,2.32,.68]],.23);
 smooth('Bàn chân đặt trên bệ',[-1.3,2.38,.77],[.28,.14,.43],light);
 smooth('Đùi chân buông',[.56,2.64,.45],[.49,.43,.65]);
 stroke([[.73,2.48,.74],[.8,1.94,.97],[.83,1.28,1.12]],.23);
 smooth('Bàn chân buông',[.86,1.17,1.29],[.25,.13,.38],light);
 for(let toe=0;toe<5;toe++)smooth('Ngón chân',[.65+toe*.09,1.18,1.56-Math.abs(toe-1)*.025],[.052,.075,.11],light);
 drape('Áo phủ đầu gối co',[[-.47,3.85,.22,.26],[-.93,3.51,.64,.41],[-1.05,2.96,.84,.5],[-1.08,2.42,.99,.6]],7,.045);
 drape('Vạt áo chân buông',[[.2,2.98,.55,.63],[.65,2.57,1.02,.57],[.76,1.91,1.28,.49],[.74,1.3,1.31,.45]],9,.055);
 drape('Áo choàng vai trái',[[-.42,4.18,.03,.27],[-.62,3.92,.36,.3],[-.64,3.41,.53,.24],[-.52,2.85,.62,.27]],5,.035);
 drape('Áo choàng vai phải',[[.43,4.17,.02,.27],[.65,3.86,.3,.27],[.55,3.34,.47,.23],[.25,2.91,.59,.48]],5,.04);
 drape('Dải áo chéo ngực',[[.39,4.02,.34,.14],[.2,3.7,.45,.19],[-.12,3.43,.52,.26],[-.36,3.19,.54,.29]],3,.025);
 for(let fold=0;fold<7;fold++){
  const height=3.56-fold*.12;
  stroke([[-.47,height+.13,.34],[-.23,height-.13,.51],[.12,height-.19,.52],[.45,height+.02,.37]],.018,fold%2?light:shadow);
 }
 for(const side of [-1,1]){
  smooth('Vai áo',[side*.62,3.98,0],[.32,.3,.36]);
  stroke([[side*.42,4.2,.1],[side*.62,4.1,.3],[side*.82,3.94,.14]],.033);
 }
 stroke([[-.7,3.94,.05],[-1.08,3.67,.17],[-1.39,3.42,.43]],.2,marble);
 stroke([[-1.39,3.42,.43],[-1.57,3.17,.64],[-1.6,2.98,.79]],.15,light);
 stroke([[.7,3.94,.02],[.83,3.35,.04],[1.01,2.55,.23]],.18,light);
 function hand(name,position,rotation){
  const palm=new THREE.Group();palm.name=name;palm.position.set(...position);palm.rotation.set(...rotation);statue.add(palm);
  smooth('Lòng bàn tay',[0,0,0],[.16,.21,.085],light,palm);
  for(let finger=0;finger<4;finger++){
   const offset=(finger-1.5)*.08,length=[.22,.29,.27,.21][finger];
   stroke([[offset,-.1,.01],[offset,-.22,.035],[offset*.96,-.18-length,.065]],.036,light,palm);
   stroke([[offset-.022,-.23,.069],[offset+.023,-.23,.069]],.004,shadow,palm);
  }
  stroke([[.13,.02,0],[.24,-.07,.04],[.23,-.2,.065]],.048,light,palm);
 }
 hand('Tay thả trên gối',[-1.61,2.96,.82],[0,0,-.08]);
 hand('Tay chống trên bệ',[1.1,2.49,.3],[-Math.PI/2,0,-.35]);
 smooth('Khuôn mặt Quan Âm',[0,4.98,.04],[.43,.59,.37],light);
 smooth('Cằm',[0,4.66,.1],[.25,.17,.18],light);
 smooth('Tóc búi phía sau',[0,5.14,-.17],[.47,.59,.32],shadow);
 for(const side of [-1,1]){
  smooth('Tai dài',[side*.43,4.96,.015],[.095,.24,.09],light);
  stroke([[side*.44,5.1,.07],[side*.48,4.94,.085],[side*.43,4.77,.08]],.017,marble);
  stroke([[side*.075,5.14,.37],[side*.19,5.17,.35],[side*.3,5.12,.26]],.019,marble);
  stroke([[side*.07,5.015,.405],[side*.17,4.99,.389],[side*.28,5.02,.31]],.011,shadow);
  stroke([[side*.08,5.04,.4],[side*.18,5.025,.386],[side*.28,5.04,.31]],.017,marble);
  smooth('Gò má',[side*.2,4.87,.27],[.13,.105,.04],light);
  stroke([[side*.38,5.41,.1],[side*.46,5.24,.03],[side*.41,4.76,-.09],[side*.56,4.25,.09]],.06,marble);
 }
 smooth('Sống mũi',[0,4.98,.397],[.064,.14,.08],light);smooth('Đầu mũi',[0,4.88,.436],[.075,.056,.065],light);
 stroke([[-.1,4.74,.369],[0,4.73,.411],[.1,4.74,.369]],.012,shadow);
 stroke([[-.08,4.716,.371],[0,4.705,.397],[.08,4.716,.371]],.012,marble);
 smooth('Bạch hào',[0,5.26,.353],[.026,.033,.012],marble);
 const crownShape=new THREE.Shape();crownShape.moveTo(-.44,0);crownShape.quadraticCurveTo(-.5,.3,-.29,.47);crownShape.quadraticCurveTo(-.16,.6,0,.83);crownShape.quadraticCurveTo(.16,.6,.29,.47);crownShape.quadraticCurveTo(.5,.3,.44,0);crownShape.closePath();
 const crown=mesh(new THREE.ExtrudeGeometry(crownShape,{depth:.12,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:3,curveSegments:24}),marble,statue,0,5.43,-.08);crown.name='Mão Quan Âm chạm cánh sen';
 for(const side of [-1,1])for(let petal=0;petal<3;petal++){
  const offset=petal*.08;
  stroke([[side*(.35-offset),5.47,.09],[side*(.34-offset),5.72,.09],[0,6.13-offset,.09]],.014,light);
 }
 stroke([[-.42,5.45,.17],[0,5.38,.32],[.42,5.45,.17]],.045,light);
 smooth('Tượng nhỏ trên mão',[0,5.73,.11],[.075,.1,.045],light);
 smooth('Đầu Phật nhỏ trên mão',[0,5.86,.12],[.047,.058,.037],light);
 for(const side of [-1,1]){
  smooth('Chân kiết già trên mão',[side*.055,5.65,.13],[.07,.03,.035],light);
  const earring=mesh(new THREE.TorusGeometry(.06,.011,8,28),light,statue,side*.44,4.76,.08);earring.name='Hoa tai chạm đá';
  smooth('Cánh mũi',[side*.043,4.865,.44],[.025,.02,.026],marble);
  smooth('Lỗ mũi',[side*.037,4.848,.448],[.012,.007,.008],shadow);
  for(let band=0;band<2;band++)stroke([[side*.71,3.66+band*.07,-.09],[side*.87,3.65+band*.07,.02],[side*.81,3.64+band*.07,.16]],.025,light);
  for(let strand=0;strand<6;strand++)stroke([[side*(.12+strand*.05),5.46,-.08],[side*(.22+strand*.035),5.35,-.18],[side*.42,5.15-strand*.025,-.13]],.012,marble);
 }
 for(let fold=0;fold<7;fold++){
  const y=2.69-fold*.105;
  stroke([[-1.58,y+.15,.67],[-1.25,y-.04,.97],[-.75,y-.2,1.02],[-.28,y-.14,.82]],.012,fold%2?light:marble);
 }
 drape('Áo choàng sau tay chống',[[.8,3.88,-.12,.2],[1.02,3.18,-.12,.27],[1.24,2.58,.02,.34],[1.7,1.68,.75,.36]],5,.025);
 for(let finger=0;finger<4;finger++)smooth('Móng tay chạm đá',[-1.61+(finger-1.5)*.08,2.57+(finger===0||finger===3?.05:0),.9],[.024,.041,.009],marble);
 for(let bead=0;bead<25;bead++){
  const progress=bead/24,x=(progress-.5)*.72,y=4.25-.3*Math.sin(progress*Math.PI);
  smooth('Chuỗi anh lạc',[x,y,.43],[.035,.04,.026],light);
 }
 stroke([[0,3.95,.45],[0,3.79,.48],[0,3.66,.5]],.025,light);
 for(const side of [-1,1])stroke([[side*.24,4.35,.21],[side*.22,4.26,.28],[0,4.2,.3]],.025,light);
 const rockMaterial=rock.clone();rockMaterial.vertexColors=true;
 statue.traverse(object=>{
  if(!object.isMesh||object.material!==rock)return;
  const positions=object.geometry.attributes.position,colors=[],color=new THREE.Color();
  for(let vertex=0;vertex<positions.count;vertex++){const shade=.81+.07*Math.sin(positions.getX(vertex)*27+positions.getY(vertex)*31+positions.getZ(vertex)*19);color.setRGB(shade,shade+.012,shade+.022);colors.push(color.r,color.g,color.b);}
  object.geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));object.material=rockMaterial;
 });
 const offering=buildIncenseBurner({scene,mesh,mat,cyl:(top,bottom,height,material,parent,x,y,z,segments=24)=>mesh(new THREE.CylinderGeometry(top,bottom,height,segments),material,parent,x,y,z),line:(points,material,radius,parent)=>stroke(points,radius,material,parent)},statue,[0,0,3],.34);offering.name='Lư hương trước Quan Âm';
 sign('QUAN ÂM TỰ TẠI',2.8,.4,statue,0,.32,1.77);
 return statue;
}
