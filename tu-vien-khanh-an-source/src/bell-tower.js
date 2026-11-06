import * as THREE from 'three';
import {WORLD,nearBell} from './world-layout.js';

export function buildBellTower({scene,box,cyl,line,mesh,mat}){
 const tower=new THREE.Group();tower.name='Tháp chuông mái cong';tower.position.set(WORLD.bell.x,0,WORLD.bell.z);scene.add(tower);
 const wood='#783e2d',trim='#a3ada6',roofColor='#424c4d',bronze=mat('#716c54',.6);
 box(6,.35,6,'#adb3a6',tower,0,.175,0);box(5.55,.04,5.55,'#b57d55',tower,0,.37,0);
 for(const x of [-2.15,2.15])for(const z of [-2.15,2.15]){
  cyl(.35,.4,.2,trim,tower,x,.45,z);cyl(.28,.31,4.75,wood,tower,x,2.85,z);
  for(let tier=0;tier<3;tier++)box(.7+tier*.23,.18,.7+tier*.23,wood,tower,x,5.1+tier*.19,z);
 }
 for(const side of [-1,1]){
  box(5.2,.32,.35,wood,tower,0,3.8,side*2.15);box(.35,.32,5.2,wood,tower,side*2.15,3.8,0);
  box(5.2,.3,.35,wood,tower,0,5.15,side*2.15);box(.35,.3,5.2,wood,tower,side*2.15,5.15,0);
  const screen=new THREE.Group();screen.name='Ô cửa tròn chạm gỗ';screen.position.z=side*2.15;tower.add(screen);
  for(const edge of [-1,1]){box(.12,1.15,.15,wood,screen,edge*.8,4.48,0);box(1.7,.12,.15,wood,screen,0,4.48+edge*.55,0);}
  const circle=mesh(new THREE.TorusGeometry(.42,.035,6,24),wood,screen,0,4.48,.02);
  circle.name='Hoa văn vòng tròn';
  for(const edge of [-1,1]){box(.045,1.05,.12,wood,screen,edge*.38,4.48,.02);box(1.55,.045,.12,wood,screen,0,4.48+edge*.27,.02);}
  for(const x of [-1.75,-1.25,1.25,1.75])box(.3,1.06,.16,wood,screen,x,4.48,0);
 }
 const roof=new THREE.Group();roof.name='Mái chuông bốn góc vút';tower.add(roof);
 const outer=[[-3.65,-3.65],[3.65,-3.65],[3.65,3.65],[-3.65,3.65]],peak=9.2;
 function roofHeight(blend,along){return 5.65+(peak-5.65)*Math.pow(blend,.85)+.2*Math.pow(1-blend,6)+1.25*Math.pow(Math.abs(along*2-1),8)*Math.pow(1-blend,5);}
 for(let side=0;side<4;side++){
  const next=(side+1)%4,vertices=[],indices=[],tiles=30,steps=12,edge=[];
  for(let tile=0;tile<=tiles;tile++){
   const along=tile/tiles,points=[];
   for(let slope=0;slope<=steps;slope++){
    const blend=slope/steps,x=THREE.MathUtils.lerp(outer[side][0],outer[next][0],along)*(1-blend),z=THREE.MathUtils.lerp(outer[side][1],outer[next][1],along)*(1-blend);
    const y=roofHeight(blend,along);
    vertices.push(x,y,z);points.push([x,y+.035,z]);if(slope===0)edge.push([x,y,z]);
    if(tile<tiles&&slope<steps){const offset=tile*(steps+1)+slope;indices.push(offset,offset+steps+1,offset+1);if(slope<steps-1)indices.push(offset+1,offset+steps+1,offset+steps+2);}
   }
   line(points,'#6f7976',.028,roof);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();const material=mat(roofColor).clone();material.side=THREE.DoubleSide;mesh(geometry,material,roof);line(edge,trim,.09,roof);
 }
 for(const [x,z] of outer){
  const ornament=new THREE.Group();ornament.name='Đao mây góc mái';roof.add(ornament);
  line([[x*.82,6.05,z*.82],[x,7.05,z],[x*1.06,7.6,z*1.06],[x*1.02,7.85,z*1.02]],trim,.1,ornament);
  const curl=mesh(new THREE.TorusGeometry(.15,.055,5,12,Math.PI*1.7),trim,ornament,x*1.02,7.8,z*1.02);curl.rotation.y=Math.atan2(x,z);
 }
 const finial=cyl(0,.15,.4,trim,roof,0,peak+.14,0,12);finial.name='Chóp nhọn mái chuông';
 const support=new THREE.Group();support.name='Khung cột và kèo liên kết mái';tower.add(support);
 for(const x of [-2.15,2.15])for(const z of [-2.15,2.15]){
  const blend=1-Math.abs(x)/3.65,top=roofHeight(blend,0)-.1,bottom=5.4;
  const post=cyl(.24,.26,top-bottom,wood,support,x,(top+bottom)/2,z);post.name='Cột nối tới kèo mái';
  const points=[];for(let sample=0;sample<=20;sample++){const blend=sample/20;points.push([Math.sign(x)*3.65*(1-blend),roofHeight(blend,0)-.1,Math.sign(z)*3.65*(1-blend)]);}
  const rafter=line(points,wood,.12,support);rafter.name='Kèo gỗ sát mặt dưới mái';
 }
 for(const side of [-1,1]){box(4.65,.25,.3,wood,support,0,6.4,side*2.15);box(.3,.25,4.65,wood,support,side*2.15,6.4,0);}
 const bell=new THREE.Group();bell.name='Đại hồng chung';tower.add(bell);
 const profile=[[1.02,1.25],[.95,1.36],[.82,1.48],[.78,2.8],[.65,3.25],[.3,3.5],[.08,3.54]].map(([radius,y])=>new THREE.Vector2(radius,y));
 mesh(new THREE.LatheGeometry(profile,32),bronze,bell);
 for(const y of [1.35,1.58,2.7,2.9]){const ring=mesh(new THREE.TorusGeometry(y<1.5?.95:.8,.045,6,32),bronze,bell,0,y,0);ring.rotation.x=Math.PI/2;}
 for(let index=0;index<24;index++){
  const angle=index*Math.PI/12;for(const y of [1.9,2.13,2.36])cyl(.035,.035,.08,bronze,bell,Math.cos(angle)*.8,y,Math.sin(angle)*.8,6).rotation.z=Math.PI/2;
 }
 cyl(.06,.06,1.55,'#443b2d',tower,0,4.3,0);
 const striker=new THREE.Group();striker.name='Dùi thỉnh chuông';striker.position.set(0,3.8,2.25);striker.userData.noCollision=true;tower.add(striker);
 for(const z of [-.65,.65])line([[0,0,0],[0,-1.65,z]],'#b29b6e',.022,striker);
 const log=cyl(.17,.17,1.9,'#4e3025',striker,0,-1.65,0,12);log.rotation.x=Math.PI/2;log.name='Gỗ gõ dọc hướng tâm chuông';
 let struckAt=-100;
 return {tower,strike(time){struckAt=time;},update(time){const elapsed=time-struckAt;striker.rotation.x=elapsed>=0&&elapsed<4?Math.sin(elapsed*5)*Math.exp(-elapsed)*.38:0;}};
}

export function createBellInteraction({player,onRing,busy}){
 const button=document.createElement('button');button.id='bell-button';button.className='meditation-button';button.hidden=true;document.querySelector('main').append(button);
 let nextRing=0;
 function ring(){const now=performance.now();if(!nearBell(player.position)||busy()||now<nextRing)return false;nextRing=now+5000;onRing();return true;}
 button.onclick=ring;
 return {ring,update(){button.hidden=!nearBell(player.position);button.disabled=busy()||performance.now()<nextRing;button.textContent=button.disabled?'Lắng nghe tiếng chuông…':'Thỉnh chuông · C';}};
}
