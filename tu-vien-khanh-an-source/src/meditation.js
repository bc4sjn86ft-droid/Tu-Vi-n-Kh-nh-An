import * as THREE from 'three';
import {HALL_CUSHIONS} from './world-layout.js';

export function nearestCushion(position,seats=HALL_CUSHIONS,range=1.3){
 let nearest=null,distance=range;
 for(const seat of seats){
  const current=Math.hypot(position.x-seat.x,position.z-seat.z);
  if(Math.abs(position.y-seat.y)<.55&&current<distance){nearest=seat;distance=current;}
 }
 return nearest;
}

export function applyMeditationPose(character,seated){
 const {model,body,mala,knees=[],feet=[],forearms=[]}=character.userData;
 if(model){model.position.set(0,seated?-.4:0,0);model.rotation.set(0,0,0);}
 if(body){body.rotation.set(0,0,0);body.position.y=seated?.62:.82;}
 if(mala)mala.rotation.set(0,0,0);
 knees.forEach(knee=>knee.rotation.set(seated?1.6:0,0,0));
 feet.forEach(foot=>foot.rotation.set(seated?-.7:0,0,0));
 forearms.forEach(arm=>arm.rotation.set(0,0,0));
 const legs=character.userData.legs||[];
 legs.forEach((leg,index)=>{
  const side=index===0?-1:1;
  leg.rotation.set(seated?-1.15:0,seated?side*.65:0,seated?side*.45:0);
  leg.position.set(side*(seated?.28:.195),seated?.55:.78,seated?.12:0);
  if(seated&&knees[index]&&feet[index]){
   leg.position.set(side*.16,.7,0);
   const down=new THREE.Vector3(0,-1,0),thigh=new THREE.Vector3(side*.4,.63,.16).sub(leg.position).normalize();leg.quaternion.setFromUnitVectors(down,thigh);
   const kneePosition=leg.position.clone().addScaledVector(thigh,.3),shin=new THREE.Vector3(side*.12,index===0?.64:.69,.29).sub(kneePosition).normalize().applyQuaternion(leg.quaternion.clone().invert());
   knees[index].quaternion.setFromUnitVectors(down,shin);
   feet[index].quaternion.copy(leg.quaternion).multiply(knees[index].quaternion).invert().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-side*Math.PI/2));
  }
 });
 const scale=character.userData.baseScale??1;character.scale.setScalar(scale);
 character.rotation.x=0;
 if(seated)character.userData.arms?.forEach((arm,index)=>{arm.rotation.x=-.85;arm.rotation.z=index===0?.3:-.3;});
}

export function createMeditation({player,onSit,onStand}){
 const button=document.createElement('button');button.id='meditation-button';button.className='meditation-button';button.hidden=true;document.querySelector('main').append(button);
 let seated=null,nearby=null;
 function render(){nearby=nearestCushion(player.position);button.hidden=!nearby&&!seated;button.textContent=seated?'Đứng dậy · T':'Ngồi vào bồ đoàn · T';button.setAttribute('aria-pressed',String(!!seated));}
 function stand(){if(!seated)return;seated=null;onStand();render();}
 function toggle(){
  if(seated){stand();return;}
  const seat=nearestCushion(player.position);
  if(!seat)return;
  if(onSit(seat)===false)return;
  seated=seat;render();
 }
 button.onclick=toggle;
 return {stand,toggle,isSeated:()=>!!seated,update(){
  if(seated&&(Math.hypot(player.position.x-seated.x,player.position.z-seated.z)>.4||Math.abs(player.position.y-seated.y)>.55))stand();
  render();
 }};
}
