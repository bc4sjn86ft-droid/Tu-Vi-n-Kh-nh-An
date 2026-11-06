import * as THREE from 'three';

export function softTexture(cloud=false){
 const size=64,data=new Uint8Array(size*size*4);
 for(let row=0;row<size;row++)for(let column=0;column<size;column++){
  const x=column/(size-1)*2-1,y=row/(size-1)*2-1,index=(row*size+column)*4;
  const density=cloud?Math.exp(-((x+.4)**2*14+y*y*16))+Math.exp(-(x*x*9+(y-.12)**2*10))+Math.exp(-((x-.4)**2*15+y*y*20)):Math.exp(-(x*x+y*y)*6);
  data[index]=data[index+1]=data[index+2]=255;data[index+3]=Math.round(Math.max(0,Math.min(1,density-.015))*180);
 }
 const texture=new THREE.DataTexture(data,size,size);texture.needsUpdate=true;return texture;
}

export function createClouds(scene){
 const group=new THREE.Group();group.name='Mây trời billboard';scene.add(group);
 const material=new THREE.SpriteMaterial({map:softTexture(true),color:'#ffeddb',transparent:true,opacity:.55,depthWrite:false,fog:false});
 for(let index=0;index<16;index++){
  const angle=index*Math.PI/8,radius=80+index%3*12,sprite=new THREE.Sprite(material);sprite.position.set(Math.cos(angle)*radius,30+index%4*7,Math.sin(angle)*radius);sprite.scale.set(30+index%3*8,11+index%2*4,1);sprite.userData.originX=sprite.position.x;group.add(sprite);
 }
 return {group,update(time){group.children.forEach((sprite,index)=>{sprite.position.x=sprite.userData.originX+Math.sin(time*.012+index)*5;});}};
}
