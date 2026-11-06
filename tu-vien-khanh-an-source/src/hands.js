import * as THREE from 'three';

export const ARM_LENGTHS={upper:.32,lower:.3};

export function createHand({ball,cyl},forearm,side,skin){
 const hand=new THREE.Group();hand.name='Bàn tay';hand.position.set(0,-ARM_LENGTHS.lower,.04);forearm.add(hand);
 cyl(.035,.042,.075,skin,forearm,0,-.245,.025,10);
 ball(.065,skin,hand,0,0,0,[.87,1,.48]);
 const fingers=[];
 for(let index=0;index<4;index++){
  const length=[.072,.088,.082,.064][index],finger=new THREE.Group();finger.name='Ngón tay';finger.position.set((index-1.5)*.026,-.042,.005);hand.add(finger);
  ball(.018,skin,finger,0,-length*.24,0,[.85,length*.3/.018, .85]);
  const tip=new THREE.Group();tip.name='Đốt ngón tay';tip.position.y=-length*.48;finger.add(tip);
  ball(.016,skin,tip,0,-length*.25,0,[.85,length*.32/.016,.85]);fingers.push(finger);
 }
 const thumb=new THREE.Group();thumb.name='Ngón cái';thumb.position.set(-side*.049,.012,.012);thumb.rotation.z=-side*.6;hand.add(thumb);
 ball(.021,skin,thumb,0,-.027,.008,[.85,1.65,.85]);ball(.017,skin,thumb,0,-.054,.015,[.85,1.1,.85]);
 hand.userData={fingers,thumb};return hand;
}

export function applyHandPose(character,action){
 const {hands=[],arms=[],forearms=[]}=character.userData;
 hands.forEach((hand,index)=>{
  hand.rotation.set(0,0,0);
  if(action==='meditate'&&arms[index]&&forearms[index]){
   const upward=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,index===0?-.25:.25));
   hand.quaternion.copy(arms[index].quaternion).multiply(forearms[index].quaternion).invert().multiply(upward);
  }
  hand.userData.fingers.forEach((finger,fingerIndex)=>{
   finger.rotation.set(action==='incense'?-.95:action==='meditate'?-.12:-.22,0,(fingerIndex-1.5)*.035);
   finger.children.find(child=>child.name==='Đốt ngón tay').rotation.x=action==='incense'?-.8:-.16;
  });
  hand.userData.thumb.rotation.x=action==='incense'?-.65:-.15;
 });
}
