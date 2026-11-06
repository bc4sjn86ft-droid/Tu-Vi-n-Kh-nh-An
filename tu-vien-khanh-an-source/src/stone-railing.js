import * as THREE from 'three';

export function buildStoneRailing({parent,from,to,box,cyl,ball,mesh,mat,posts=true}){
 const horizontal=Math.hypot(to[0]-from[0],to[2]-from[2]);if(horizontal<.01)return null;
 const group=new THREE.Group();group.name='Lan can đá chạm mây';group.position.set(...from);group.rotation.y=-Math.atan2(to[2]-from[2],to[0]-from[0]);parent.add(group);
 group.userData.from=[...from];group.userData.to=[...to];
 const rise=to[1]-from[1],slope=rise/horizontal,count=Math.ceil(horizontal/1.55),span=horizontal/count,stone=mat('#c7ceca'),edge=mat('#dce0d5');
 for(let index=0;index<=count;index++){
  const xx=index*span,yy=xx*slope;
  if(posts){box(.25,1.12,.25,stone,group,xx,yy+.56,0);box(.34,.12,.34,edge,group,xx,yy+1.13,0);cyl(.07,.13,.16,edge,group,xx,yy+1.26,0,8);}
  if(index===count)continue;
  const width=span-.25,shape=new THREE.Shape();shape.moveTo(0,.2);shape.lineTo(width,.2);shape.lineTo(width,.91);shape.lineTo(0,.91);shape.closePath();
  const hole=new THREE.Path(),left=width*.17,right=width*.83,middle=width/2;
  hole.moveTo(left,.57);hole.bezierCurveTo(left-.05,.72,middle-.18,.74,middle-.14,.64);hole.bezierCurveTo(middle-.07,.74,middle+.07,.74,middle+.14,.64);hole.bezierCurveTo(right+.03,.74,right+.07,.63,right,.54);hole.lineTo(right-.08,.48);hole.quadraticCurveTo(middle,.58,left+.08,.48);hole.closePath();if(width>.5)shape.holes.push(hole);
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.16,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1,curveSegments:8,steps:1}),positions=geometry.attributes.position;
  for(let vertex=0;vertex<positions.count;vertex++)positions.setY(vertex,positions.getY(vertex)+slope*positions.getX(vertex));geometry.computeVertexNormals();
  mesh(geometry,stone,group,xx+.125,yy+slope*.125,-.08);
  const length=Math.hypot(span,rise/count),angle=Math.atan(slope);
  for(const [height,thickness,depth] of [[.14,.12,.23],[1.01,.14,.29]]){
   const beam=box(length,thickness,depth,edge,group,xx+span/2,yy+rise/count/2+height,0);beam.rotation.z=angle;
  }
 }
 return group;
}
