import * as THREE from 'three';

export function buildAltarReliefs({mesh,mat,box,ball,line},parent,{height,wallX,wallBack,level}){
 const group=new THREE.Group();group.name='Phù điêu Phật giáo trên tường kín';group.userData.level=level;group.userData.noCollision=true;group.position.set(0,height,wallBack+.18);parent.add(group);
 const gold=mat('#bd994b',.3),border=mat('#815331'),panel=mat('#d3bf95');
 box(wallX*2-.7,4.9,.06,panel,group,0,2.85,0);
 for(const x of [-wallX+.45,wallX-.45])box(.06,4.75,.08,border,group,x,2.85,.05);
 for(const y of [.48,5.22])box(wallX*2-.9,.06,.08,border,group,0,y,.05);
 const wheel=new THREE.Group();wheel.name='Pháp luân tám nan';wheel.position.set(0,4.25,.15);group.add(wheel);
 for(const radius of [.13,.57,.72])mesh(new THREE.TorusGeometry(radius,.035,6,48),gold,wheel);
 for(let spoke=0;spoke<8;spoke++){
  const angle=spoke*Math.PI/4,x=Math.cos(angle),y=Math.sin(angle);
  line([[x*.12,y*.12,0],[x*.77,y*.77,0]],gold,.025,wheel);ball(.055,gold,wheel,x*.77,y*.77,0,[1,1,.45]);
 }
 for(const side of [-1,1]){
  const lotus=new THREE.Group();lotus.name='Hoa sen phù điêu';lotus.position.set(side*wallX*.62,2.85,.14);group.add(lotus);
  for(let petal=-3;petal<=3;petal++){
   const angle=petal*.26,shape=new THREE.Shape();shape.moveTo(0,-.12);shape.bezierCurveTo(-.25,.1,-.28,.55,0,.85);shape.bezierCurveTo(.28,.55,.25,.1,0,-.12);
   const leaf=mesh(new THREE.ShapeGeometry(shape),gold,lotus,Math.sin(angle)*.26,.1,.008*(3-Math.abs(petal)));leaf.rotation.z=-angle;
  }
  line([[-.68,-.1,.03],[0,-.3,.03],[.68,-.1,.03]],gold,.035,lotus);
  line([[0,-.28,.02],[0,-.95,.02],[side*.38,-1.3,.02]],gold,.025,lotus);
 }
 return group;
}
