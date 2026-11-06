import * as THREE from 'three';
import {WORLD,POND} from './world-layout.js';

export function createKoi({scene,ball}){
 const school=[];
 const size=64,data=new Uint8Array(size*size*4);
 for(let row=0;row<size;row++)for(let column=0;column<size;column++){
  const x=(column/(size-1)*2-1)*1.3,y=(row/(size-1)*2-1)*1.3,offset=(row*size+column)*4,inside=Math.pow(x*x+y*y-1,3)-x*x*y*y*y<=0;
  data.set([255,117,145,inside?255:0],offset);
 }
 const heartTexture=new THREE.DataTexture(data,size,size);heartTexture.needsUpdate=true;
 const heartMaterial=new THREE.SpriteMaterial({map:heartTexture,transparent:true,depthWrite:false});
 function surface(rows,columns,point){
  const vertices=[],indices=[];
  for(let row=0;row<=rows;row++)for(let column=0;column<=columns;column++){
   vertices.push(...point(row/rows,column/columns));
   if(row<rows&&column<columns){const vertex=row*(columns+1)+column;indices.push(vertex,vertex+1,vertex+columns+1,vertex+1,vertex+columns+2,vertex+columns+1);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
 }
 for(let index=0;index<12;index++){
  const fish=new THREE.Group();fish.name=`Cá koi ${index+1}`;scene.add(fish);
  const body=surface(44,28,(along,around)=>{
   const z=-.57+along*1.13,angle=around*Math.PI*2,shape=Math.pow(Math.sin(Math.PI*along),.65),width=(.055+.14*along)*shape,height=(.045+.12*along)*shape;
   return [Math.cos(angle)*width,Math.sin(angle)*height,z];
  });
  const colors=[],orange=new THREE.Color(index%4===0?'#e9b341':'#db5827'),white=new THREE.Color('#f2e8d7'),dark=new THREE.Color('#303733'),color=new THREE.Color();
  for(let vertex=0;vertex<body.attributes.position.count;vertex++){
   const x=body.attributes.position.getX(vertex),y=body.attributes.position.getY(vertex),z=body.attributes.position.getZ(vertex),pattern=Math.sin(z*13+index*2)+Math.cos(x*19+y*14+index*.7);
   color.copy(white).lerp(orange,THREE.MathUtils.smoothstep(pattern,-.1,.65));
   if(index%3===0)color.lerp(dark,1-THREE.MathUtils.smoothstep(pattern,-1.5,-.9));
   colors.push(color.r,color.g,color.b);
  }
  body.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const skin=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.03,side:THREE.DoubleSide}),bodyMesh=new THREE.Mesh(body,skin);bodyMesh.name='Thân cá thuôn mềm';fish.add(bodyMesh);
  const finMaterial=new THREE.MeshStandardMaterial({color:index%4===0?'#e5c67b':'#edbd9d',side:THREE.DoubleSide,transparent:true,opacity:.68,roughness:.55,depthWrite:false});
  const parts=[{geometry:body,original:Float32Array.from(body.attributes.position.array)}];
  function fin(name,geometry){const object=new THREE.Mesh(geometry,finMaterial);object.name=name;fish.add(object);parts.push({geometry,original:Float32Array.from(geometry.attributes.position.array)});return object;}
  fin('Đuôi cá xòe hai thùy',surface(18,20,(along,across)=>{
   const spread=(across*2-1)*(.025+along*.24),notch=(1-Math.abs(across*2-1))*.12*along*along;
   return [Math.sin(across*Math.PI)*.025*along,spread,-.53-along*.43+notch];
  }));
  for(const side of [-1,1])fin('Vây ngực mềm',surface(12,16,(along,across)=>[
   side*(.12+along*.26*Math.sin(across*Math.PI/2)), -.045-along*.035+.022*Math.sin(across*Math.PI),.24-along*(.1+across*.24)
  ]));
  fin('Vây lưng',surface(12,16,(along,across)=>[0,.08+Math.sin(along*Math.PI)*across*.17,.28-along*.62]));
  for(const side of [-1,1]){
   ball(.024,'#202c2b',fish,side*.098,.058,.395,[.55,1,1]);ball(.007,'#f6f3de',fish,side*.108,.068,.405);
   const barbel=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(side*.025,-.025,.53),new THREE.Vector3(side*.055,-.04,.55),new THREE.Vector3(side*.08,-.055,.54)]),8,.004,4),finMaterial);fish.add(barbel);
  }
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(.023,.006,6,18),finMaterial);mouth.position.set(0,-.012,.555);fish.add(mouth);
  const heart=new THREE.Sprite(heartMaterial);heart.name='Trái tim khi cá ăn';heart.position.set(0,.65,.35);heart.scale.set(.3,.3,1);heart.visible=false;fish.add(heart);
  fish.scale.setScalar(.85+(index%4)*.09);school.push({fish,parts,heart});
 }
 return {school,update(time,elapsed){
  for(const [index,{fish,parts,heart}] of school.entries()){
   const speed=.1+index*.004,angle=time*speed+index*2.399,radius=1.45+(index%4)*.5;
   const lengthScale=POND.radiusZ/POND.radiusX,x=Math.cos(angle)*radius+.22*Math.sin(time*.18+index),z=Math.sin(angle)*radius*.85*lengthScale,vx=-Math.sin(angle)*radius*speed+.0396*Math.cos(time*.18+index),vz=Math.cos(angle)*radius*.85*lengthScale*speed;
   const feeding=elapsed-index*.1,blend=feeding>=0&&feeding<5?Math.min(1,feeding/.8,(5-feeding)/1.2):0;
   fish.position.set(WORLD.pond.x+x,.24+Math.sin(time*.8+index)*.008+.065*blend,WORLD.pond.z+z);fish.rotation.set(-.05*blend+Math.sin(time*.6+index)*.015,Math.atan2(vx,vz),Math.sin(time*.9+index)*.02);
   heart.visible=blend>.1;heart.position.y=.62+Math.sin(time*2+index)*.04;heart.scale.setScalar(.28+.025*Math.sin(time*3+index));
   for(const {geometry,original} of parts){
    const positions=geometry.attributes.position;
    for(let vertex=0;vertex<positions.count;vertex++){
     const z=original[vertex*3+2],weight=Math.max(0,(.35-z)/1.3),wave=time*3.6+z*5.5+index;
     positions.setXYZ(vertex,original[vertex*3]+Math.sin(wave)*.105*weight*weight,original[vertex*3+1]+Math.sin(wave+.7)*.012*weight,z);
    }
    positions.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
   }
  }
 }};
}
