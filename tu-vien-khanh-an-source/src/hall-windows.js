import * as THREE from 'three';

export function buildWindowWall({box,mesh},parent,{span,base,x,z,rotation=0,count=Math.max(1,Math.floor(span/4))}){
 const wall=new THREE.Group();wall.name='Vách cửa sổ gỗ cao';wall.position.set(x,base,z);wall.rotation.y=rotation;parent.add(wall);
 const timber='#50382b',cream='#e8e1cf',opening=Math.min(1.95,span/count-.65),bottom=.85,top=4.45;
 box(span,bottom-.075,.24,cream,wall,0,(bottom+.075)/2,0);box(span,5.625-top,.24,cream,wall,0,(5.625+top)/2,0);
 let cursor=-span/2;
 for(let index=0;index<count;index++){
  const center=-span/2+(index+.5)*span/count,left=center-opening/2,right=center+opening/2;
  if(left>cursor)box(left-cursor,top-bottom,.24,cream,wall,(left+cursor)/2,(top+bottom)/2,0);
  const window=new THREE.Group();window.name='Cửa sổ cao chớp gỗ';window.position.set(center,0,0);wall.add(window);
  for(const side of [-1,1])box(.16,top-bottom+.25,.36,timber,window,side*(opening/2-.03),(bottom+top)/2,0);
  for(const height of [bottom,top,top-.68])box(opening+.3,.17,.36,timber,window,0,height,0);
  for(let slat=0;slat<7;slat++)box(.065,.57,.18,timber,window,(slat-3)*(opening-.24)/7,top-.34,0);
  for(const side of [-1,1]){
   const shutter=new THREE.Group();shutter.name='Cánh cửa chạm nan';shutter.position.set(side*opening/2,bottom,0);shutter.rotation.y=side*.82;window.add(shutter);
   const width=opening*.27;
   for(const edge of [0,width])box(.055,2.85,.09,timber,shutter,-side*edge,1.45,0);
   for(const height of [.06,1.48,2.85])box(width,.065,.1,timber,shutter,-side*width/2,height,0);
   for(let row=0;row<11;row++)for(let column=0;column<3;column++)box(.025,.23,.045,'#846144',shutter,-side*(column+.5)*width/3,.23+row*.23,0);
  }
  window.userData.opening={left,right,bottom,top:top-.77};cursor=right;
 }
 if(cursor<span/2)box(span/2-cursor,top-bottom,.24,cream,wall,(cursor+span/2)/2,(top+bottom)/2,0);
 return wall;
}
