import * as THREE from 'three';
import {canWalk,floorHeight,CAMPUS_BOUNDS} from './world-layout.js';
import {applyMeditationPose} from './meditation.js';
import {updateIncenseRitual} from './incense-ritual.js';
import {ARM_LENGTHS,applyHandPose} from './hands.js';

export const CHARACTER_SCALE=.7;
export const WALK_SPEED=2.6*1.3;
export const WALK_CYCLE_RATE=6.5;

export function createMovementController(){
 let velocityX=0,velocityZ=0;
 return {stop(){velocityX=0;velocityZ=0;},update({position,dx,dz,theta,dt,height}){
  const length=Math.hypot(dx,dz),blend=1-Math.exp(-dt*(length?15:22));
  const targetX=length?(dx*Math.cos(theta)+dz*Math.sin(theta))/length*WALK_SPEED:0,targetZ=length?(-dx*Math.sin(theta)+dz*Math.cos(theta))/length*WALK_SPEED:0;
  velocityX+=(targetX-velocityX)*blend;velocityZ+=(targetZ-velocityZ)*blend;
  if(!length&&Math.hypot(velocityX,velocityZ)<.025){velocityX=0;velocityZ=0;}
  const previousX=position.x,previousZ=position.z,bounds=CAMPUS_BOUNDS,steps=Math.max(1,Math.ceil(Math.hypot(velocityX,velocityZ)*dt/.08));let surface=height;
  for(let step=0;step<steps;step++){
   const nextX=Math.max(bounds.minX,Math.min(bounds.maxX,position.x+velocityX*dt/steps)),nextZ=Math.max(bounds.minZ,Math.min(bounds.maxZ,position.z+velocityZ*dt/steps));
   if(canWalk(nextX,nextZ,surface)){position.x=nextX;position.z=nextZ;}
   else{if(canWalk(nextX,position.z,surface))position.x=nextX;if(canWalk(position.x,nextZ,surface))position.z=nextZ;}
   surface=floorHeight(position.x,position.z,surface);
  }
  return {distance:Math.hypot(position.x-previousX,position.z-previousZ),rotation:Math.atan2(velocityX,velocityZ),speed:Math.hypot(velocityX,velocityZ)};
 }};
}

const down=new THREE.Vector3(0,-1,0);
const ease=value=>{const blend=Math.max(0,Math.min(1,value));return blend*blend*(3-2*blend);};

function reachHand(character,index,target){
 const arm=character.userData.arms?.[index],forearm=character.userData.forearms?.[index];if(!arm||!forearm)return;
 const {upper:upperLength,lower:lowerLength}=ARM_LENGTHS;
 const shoulderToHand=target.clone().sub(arm.position),distance=Math.max(.001,Math.min(upperLength+lowerLength-.001,shoulderToHand.length())),direction=shoulderToHand.normalize();
 const along=(upperLength**2-lowerLength**2+distance**2)/(2*distance),bend=new THREE.Vector3(index===0?-1:1,-.25,0);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
 const elbow=direction.clone().multiplyScalar(along).addScaledVector(bend,Math.sqrt(Math.max(0,upperLength**2-along**2)));
 arm.quaternion.setFromUnitVectors(down,elbow.clone().normalize());
 const lower=direction.multiplyScalar(distance).sub(elbow).normalize().applyQuaternion(arm.quaternion.clone().invert());forearm.quaternion.setFromUnitVectors(down,lower);
}

function followHead(character){
 const {halo,body,model}=character.userData;if(!halo)return;
 halo.position.set(0,2.14+(body?body.position.y-.82:0),-.64);halo.rotation.x=0;
 if(body){halo.position.y-=body.position.y;halo.position.applyQuaternion(body.quaternion).add(body.position);halo.rotation.x=body.rotation.x;}
 if(model)halo.position.add(model.position);
}

export function applyCharacterPose(character,action,time){
 const previous=character.userData.poseState;
 const state=previous??{action,start:time,last:time,kneel:0,bow:0};
 if(state.action!==action){state.action=action;state.start=time;}
 const elapsed=Math.max(0,time-state.start),blend=1-Math.exp(-Math.max(0,time-state.last)*22);state.last=time;character.userData.poseState=state;
 const kneelTarget=action==='kneel'?ease(elapsed/.6)*(1-ease((elapsed-4.4)/.6)):action==='bow'?ease(elapsed/.6)*(1-ease((elapsed-2.9)/.6)):0;
 const bowTarget=action==='bow'?ease((elapsed-.65)/.65)*(1-ease((elapsed-2.1)/.7)):0;
 state.kneel+=(kneelTarget-state.kneel)*blend;state.bow+=(bowTarget-state.bow)*blend;
 if(state.kneel<.0001)state.kneel=0;if(state.bow<.0001)state.bow=0;
 applyMeditationPose(character,action==='meditate');
 if(character.userData.mala)character.userData.mala.visible=action==='idle'&&state.kneel<.001&&state.bow<.001;
 updateIncenseRitual(character,action==='incense',time,elapsed);
 if(action==='meditate'){
  state.kneel=0;state.bow=0;
  if(character.userData.body)for(const index of [0,1])reachHand(character,index,new THREE.Vector3(index===0?-.42:.42,.8-character.userData.body.position.y,.2));
  applyHandPose(character,action);
  followHead(character);return;
 }
 const walking=action==='walk',phase=time*WALK_CYCLE_RATE,{model,body,legs=[],knees=[],feet=[],arms=[]}=character.userData;
 if(model){
  const lowering=-.35*state.kneel,ankleHeight=.78+lowering-.3*Math.cos(.6*state.kneel)-.3*Math.cos(Math.PI/2*state.kneel);
  model.position.y=lowering+Math.max(0,.155-ankleHeight)+(walking?Math.sin(phase*2)*.025:0);model.rotation.z=walking?Math.cos(phase)*.018:0;
 }
 if(body)body.rotation.x=1.48*state.bow;
 if(body&&action==='incense')body.rotation.x=Math.sin(Math.min(1,elapsed/5)*Math.PI*3)**2*.09;
 legs.forEach((leg,index)=>{
  const step=phase+index*Math.PI;leg.rotation.x=-.6*state.kneel+(walking?Math.sin(step)*.34:0);leg.rotation.z=walking?Math.sin(step)*.025:0;
  leg.position.y=.78+(walking?Math.max(0,Math.cos(step))*.07:0);leg.position.z=walking?Math.sin(step)*.035:0;
  if(knees[index])knees[index].rotation.x=(Math.PI/2+.6)*state.kneel;
  if(feet[index])feet[index].rotation.x=-leg.rotation.x-(knees[index]?.rotation.x??0);
 });
 arms.forEach((arm,index)=>{
  arm.rotation.set(walking?Math.sin(phase+index*Math.PI)*.27:action==='incense'?-1.05:character.userData.gender==='male'?-.65:index===1?-.45:0,0,action==='incense'?(index?-.45:.45):character.userData.gender==='male'?(index?-.35:.35):0);
  if(state.kneel>.001&&body){
   const side=index===0?-1:1,target=new THREE.Vector3(side*THREE.MathUtils.lerp(.065,.37,state.bow),THREE.MathUtils.lerp(1.2,.48,state.bow),THREE.MathUtils.lerp(.29,.83,state.bow));
   target.sub(body.position).applyQuaternion(body.quaternion.clone().invert());
   const resting=down.clone().multiplyScalar(ARM_LENGTHS.upper+ARM_LENGTHS.lower).applyQuaternion(arm.quaternion).add(arm.position);target.lerp(resting,1-state.kneel);reachHand(character,index,target);
  }
  if(action==='incense')reachHand(character,index,new THREE.Vector3(index===0?-.1:.1,character.userData.incense?.position.y??.52,.44));
 });
 const {mala,forearms=[]}=character.userData;
 if(mala&&body&&arms[1]&&forearms[1]&&state.bow>0){
  const flat=body.quaternion.clone().multiply(arms[1].quaternion).multiply(forearms[1].quaternion).invert().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2));
  mala.quaternion.slerp(flat,state.bow);
 }
 applyHandPose(character,action);followHead(character);
}
