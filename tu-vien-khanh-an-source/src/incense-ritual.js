import * as THREE from 'three';
import {softTexture} from './sky.js';

let smokeTexture;
export function createIncenseRitual(body){
 const group=new THREE.Group();group.name='Ba nén nhang trong tay';group.visible=false;group.scale.setScalar(0);body.add(group);
 const wood=new THREE.MeshStandardMaterial({color:'#ae7040'}),ember=new THREE.MeshBasicMaterial({color:'#ff7835'});
 for(const offset of [-1,0,1]){
  const stick=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.68,5),wood);stick.name='Nén nhang';stick.userData.ownMaterial=offset===0;stick.position.set(offset*.045,.3,0);group.add(stick);
  const tip=new THREE.Mesh(new THREE.SphereGeometry(.015,5,4),ember);tip.userData.ownMaterial=offset===0;tip.position.set(offset*.045,.64,0);group.add(tip);
 }
 const smoke=new THREE.Group();smoke.name='Khói nhang billboard';group.add(smoke);
 smokeTexture??=softTexture();
 for(let index=0;index<8;index++){
  const material=new THREE.SpriteMaterial({map:smokeTexture,color:'#e0ddd2',transparent:true,opacity:.2,depthWrite:false});
  const puff=new THREE.Sprite(material);puff.userData.ownMaterial=true;smoke.add(puff);
 }
 return group;
}

export function updateIncenseRitual(character,active,time,elapsed){
 const prop=character.userData.incense;if(!prop)return;
 prop.visible=active;prop.scale.setScalar(active?1:0);if(!active)return;
 const dip=Math.sin(Math.min(1,elapsed/5)*Math.PI*3)**2*.11;
 prop.position.set(0,.52-dip,.52);prop.rotation.x=-dip*.7;
 prop.getObjectByName('Khói nhang billboard').children.forEach((puff,index)=>{
  const phase=(time*.3+index/8)%1;
  puff.position.set(Math.sin(time*1.1+index)*.06+phase*.14,.66+phase*.85,Math.cos(index+time)*.035);
  puff.scale.setScalar(.08+phase*.25);puff.material.opacity=Math.sin(phase*Math.PI)*.23;
 });
}
