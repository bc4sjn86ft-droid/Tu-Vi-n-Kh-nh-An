import * as THREE from 'three';
import {WORLD,RESIDENCE,MEMORIAL_TOWERS,HALL_FLOORS,floorHeight} from './world-layout.js';
import {buildQuanAm} from './quan-am.js';
import {buildResidence} from './residence.js';
import {buildMemorialTowers} from './memorial-tower.js';
import {buildWelcomeStone} from './welcome-stone.js';
import {createPineRow} from './pine-billboards.js';

export function gardenTree({scene,mat,cyl,line},x,z,scale=1){
 if(!treePlacementAllowed(x,z,scale))return null;
 const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);
 const bark=mat('#69533e');const trunk=cyl(.17,.36,3.8,bark,g,.1,1.9,0);trunk.rotation.z=-.13;
 const centers=[];for(let i=0;i<7;i++){const a=i*2.4,r=.8+(i%3)*.45,h=2.9+(i%3)*.7;const end=[Math.cos(a)*r,h,Math.sin(a)*r];line([[.1,1.3,0],[.3,2.4,0],end],bark,.09,g);centers.push(end);}
 const count=490,leaves=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),mat('#d5e0b0'),count),dummy=new THREE.Object3D();const colors=['#426c35','#638f43','#82a84f','#a4b960'];
 for(let i=0;i<count;i++){const c=centers[i%centers.length],a=i*2.39996,r=Math.sqrt((i%67)/67)*1.5;dummy.position.set(c[0]+Math.cos(a)*r,c[1]+Math.sin(i*1.73)*.35,c[2]+Math.sin(a)*r*.85);dummy.scale.set(.18+(i%4)*.04,.08,.25);dummy.rotation.set(i*.4,a,i*.7);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,new THREE.Color(colors[i%4]));}leaves.castShadow=true;leaves.receiveShadow=true;g.add(leaves);g.name='Cây tán lá phân tầng';return g;
}

export function treePlacementAllowed(x,z,scale=1){
 const radius=3.6*scale,floor=HALL_FLOORS[0],buildings=[
  [WORLD.hall.x-floor.halfWidth-1.7,WORLD.hall.x+floor.halfWidth+1.7,WORLD.hall.z+floor.back-2.7,WORLD.hall.z+floor.front],
  [WORLD.residence.x+RESIDENCE.roofBack,WORLD.residence.x+RESIDENCE.roofFront,WORLD.residence.z-RESIDENCE.roofHalfWidth,WORLD.residence.z+RESIDENCE.roofHalfWidth],[17,35,-35.5,-24.5],[-12.5,-7.5,-6,22],[33.5,38.5,-6,22],
  [WORLD.bell.x-4.3,WORLD.bell.x+4.3,WORLD.bell.z-4.3,WORLD.bell.z+10],
  [WORLD.gate.x-6.5,WORLD.gate.x+6.5,WORLD.gate.z-2.3,WORLD.gate.z+2.3],
  [WORLD.welcomeStone.x-2.2,WORLD.welcomeStone.x+2.2,WORLD.welcomeStone.z-1.3,WORLD.welcomeStone.z+1.3],
  ...MEMORIAL_TOWERS.map(tower=>[tower.x-3.8*tower.scale,tower.x+3.8*tower.scale,tower.z-3.8*tower.scale,tower.z+3.8*tower.scale])
 ];
 return !buildings.some(([left,right,back,front])=>x+radius>left&&x-radius<right&&z+radius>back&&z-radius<front);
}

export function buildCampus(h){
 const {scene,temple,mat,box,ball,cyl,line,roof,sign}=h;
 // A long garden axis and separate forecourt in front of the hall.
 function building(x,z,w,d,label){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(w,.4,d,'#c8c3ac',g,0,.2,0);box(w,3.6,d,'#e4d4b5',g,0,2,0);for(let xx=-w/2+1;xx<w/2;xx+=2.5){box(1.2,2,.15,'#614633',g,xx,1.8,d/2+.1);for(let k=-.4;k<.5;k+=.2)box(.04,1.8,.06,'#ae8054',g,xx+k,1.8,d/2+.2);}roof(w+2,d+2,4,g);sign(label,w*.45,.8,g,0,3.5,d/2+.15);return g;}
 buildResidence(h);building(26,-30,16,9,'KHU PHÒNG SƯ THẦY');
 buildMemorialTowers(h);buildWelcomeStone(h);
 buildQuanAm(h);
 createPineRow(scene);

 for(const [x,z,s] of [[-6,-8,.85],[6,-10,.85],[-8,-19,1.1],[8,-18,.9],[-15,8,.8],[32,15,.9],[-38,-16,1.3],[35,-18,1.2]])gardenTree(h,x,z,s);

 // Carved black-and-gold altar fronts, ceiling beams and offering details.
 const gold=mat('#cfa94f',.4);
 for(const x of [-7,-3.5,0,3.5,7]){box(3.2,.85,.1,'#2e231d',temple,x,1.5,-6.72);for(const y of [1.12,1.85])box(3.15,.035,.035,gold,temple,x,y,-6.64);for(let i=0;i<8;i++){const a=i*Math.PI/4;const petal=ball(.11,gold,temple,x+Math.cos(a)*.35,1.5+Math.sin(a)*.23,-6.62,[1.5,.55,.3]);petal.rotation.z=a;}}
 for(const x of [-6,0,6]){cyl(.4,.3,.14,gold,temple,x,2.18,-7.3);for(let i=0;i<5;i++)ball(.12,['#db9a38','#a0a850','#ca7041'][i%3],temple,x+Math.sin(i*2.4)*.24,2.32+(i===4?.13:0),-7.3+Math.cos(i*2.4)*.15);}
 for(const x of [-4,4])for(let i=0;i<5;i++){const y=2.6+i*.12,xx=x+(i-2)*.2;line([[x,2.1,-8],[xx,y,-8]],gold,.025,temple);ball(.065,'#ffe7ac',temple,xx,y+.1,-8,[.7,1.5,.7]);}
 return {update(){}};
}

export const NPC_GREETINGS=['Chào con, chúc con một ngày an lành.','Chúc con tâm luôn bình an, bước chân nhẹ nhàng.','Mỗi việc lành nhỏ đều nuôi dưỡng bình an.','Chào con, mời con thong thả tham quan tu viện.'];
export function createMonks(h,player,toast,labels){const {scene,mat,ball,cyl,line}=h;const monks=[];const routes=[[[17,12],[24,18],[20,29],[13,22]], [[-12,5],[-9,14],[-5,22],[-12,15]],[[6,-17],[6,-10],[7,0],[6,-8]],[[29,-22],[35,-18],[35,-8],[29,-20]]];const names=['Thầy trụ trì · NPC','Sư thầy · NPC','Sư thầy chăm vườn · NPC','Sư thầy tri khách · NPC'];
 for(let i=0;i<4;i++){const g=new THREE.Group(),robe=mat(i===0?'#bc8738':i===2?'#986141':'#b5945e');cyl(.3,.48,1.25,robe,g,0,.88,0);ball(.42,robe,g,0,1.45,0,[1,1,.8]);ball(.43,'#d7ac83',g,0,2.06,0,[.95,1.1,.95]);for(const side of [-1,1]){ball(.09,'#d7ac83',g,side*.4,2,0);ball(.025,'#443325',g,side*.14,2.08,.38);ball(.14,robe,g,side*.42,1.35,.1,[1,2,1]);ball(.09,'#d7ac83',g,side*.26,1.05,.33);}line([[-.05,1.91,.4],[0,1.9,.41],[.05,1.91,.4]],'#986947',.01,g);for(let k=0;k<5;k++)line([[-.29,1.6-k*.12,.25],[0,1.35-k*.1,.37],[.33,1.08-k*.1,.25]],'#ddba73',.018,g);const feet=[];for(const side of [-1,1])feet.push(ball(.13,'#d7ac83',g,side*.2,.12,.1,[.7,.65,1.5]));if(i===0)for(let k=0;k<12;k++){const a=k/12*Math.PI;ball(.038,'#62422b',g,Math.cos(a)*.29,1.5-Math.sin(a)*.3,.38);}g.scale.setScalar(.7);g.name=names[i];labels?.track(g,names[i],`npc-${i}`);scene.add(g);const path=new THREE.CatmullRomCurve3(routes[i].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'catmullrom',.25);monks.push({g,path,feet,phase:i*.21,name:names[i],nextGreeting:0,greetingIndex:i});}
 const button=document.createElement('button');button.className='npc-talk';button.hidden=true;document.querySelector('main').append(button);let nearest=null;button.onclick=()=>{if(!nearest)return;const text=NPC_GREETINGS[nearest.greetingIndex++%NPC_GREETINGS.length];if(labels)labels.say(nearest.g,text,{typing:true});else toast(text);};
 return {update(t,dt){nearest=null;let min=4;monks.forEach((m,i)=>{const walking=(t+i*5)%24<19;if(walking)m.phase=(m.phase+Math.max(0,dt)*.018*1.3+1)%1;const p=m.path.getPointAt(m.phase),tangent=m.path.getTangentAt(m.phase);m.g.position.copy(p);m.g.position.y=floorHeight(p.x,p.z)+(walking?Math.sin(t*5.2)*.015:0);const desired=Math.atan2(tangent.x,tangent.z);m.g.rotation.y+=Math.atan2(Math.sin(desired-m.g.rotation.y),Math.cos(desired-m.g.rotation.y))*Math.min(1,dt*5.2);m.feet.forEach((f,j)=>{f.position.z=.1+(walking?Math.sin(t*5.2+j*Math.PI)*.1:0);f.position.y=.12+(walking?Math.max(0,Math.cos(t*5.2+j*Math.PI))*.035:0);});const dist=m.g.position.distanceTo(player.position);if(dist<6&&t>=m.nextGreeting){labels?.say(m.g,NPC_GREETINGS[m.greetingIndex++%NPC_GREETINGS.length],{typing:true});m.nextGreeting=t+22+i*2;}if(dist<min){min=dist;nearest=m;}});button.hidden=!nearest;if(nearest)button.textContent='Trò chuyện với '+nearest.name.replace(' · NPC','');}};
}
