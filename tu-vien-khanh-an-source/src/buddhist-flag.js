import * as THREE from 'three';

export function buildBuddhistFlag({mesh,mat,line},parent,x,y,z,rotation=0){
 const flag=new THREE.Group();flag.name='Cờ Phật đản';flag.position.set(x,y,z);flag.rotation.y=rotation;flag.userData.noCollision=true;parent.add(flag);
 const palette=['#335bb5','#f1cc39','#bd3d32','#f3e9d5','#e99a42'];
 for(let stripe=0;stripe<6;stripe++){
  const segments=stripe===5?5:1;
  for(let row=0;row<segments;row++){
   const geometry=new THREE.PlaneGeometry(.15,.82/segments,3,6),positions=geometry.attributes.position;
   for(let vertex=0;vertex<positions.count;vertex++){const height=positions.getY(vertex)+(segments===1?0:(2-row)*.82/5),width=positions.getX(vertex)+(stripe-2.5)*.15;positions.setZ(vertex,Math.sin(height*5+width*2)*.045);}
   geometry.computeVertexNormals();const material=mat(palette[stripe===5?row:stripe]).clone();material.side=THREE.DoubleSide;
   mesh(geometry,material,flag,(stripe-2.5)*.15,-.41+(segments===1?0:(2-row)*.82/5),0);
  }
 }
 line([[-.52,0,0],[.52,0,0]],'#735844',.018,flag);line([[-.43,0,0],[-.43,.25,0]],'#b4a183',.012,flag);line([[.43,0,0],[.43,.25,0]],'#b4a183',.012,flag);
 return flag;
}
