import * as THREE from 'three';
import {CHARACTER_SCALE} from './character-motion.js';
import {createIncenseRitual} from './incense-ritual.js';
import {createHand,ARM_LENGTHS} from './hands.js';
export const normalizeGender=value=>value==='male'?'male':'female';
export function createChibi(h,gender='female'){const root=new THREE.Group();root.userData.baseScale=CHARACTER_SCALE;root.scale.setScalar(CHARACTER_SCALE);setCharacter(root,h,gender);return root;}
export function setCharacter(root,h,gender){
 gender=normalizeGender(gender);const old=root.userData.model;if(old){root.remove(old);old.traverse(o=>{if(!o.isSprite)o.geometry?.dispose();if(o.userData.ownMaterial)o.material?.dispose();});root.userData.dress?.dispose();}
 const {mat,cyl,line}=h,ball=(r,c,p,x=0,y=0,z=0,scale=[1,1,1])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,28,20),typeof c==='string'?mat(c):c);m.position.set(x,y,z);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;},g=new THREE.Group(),female=gender==='female',skin='#f2c199',hair=mat('#61402e'),dress=mat('#b39aa9').clone(),seam='#97818f',gold=mat('#d9a334',.25);
 root.add(g);g.name='Trang phục và ngoại hình';
 // Tunic with overlapping collar, frog closures, hem stitching and wide trousers.
 const torso=cyl(.28,.41,.82,dress,g,0,1.03,0);torso.scale.z=.78;ball(.33,dress,g,0,1.4,0,[1.08,.75,.85]);
 line([[-.18,1.58,.16],[0,1.39,.28],[.19,1.55,.17]],seam,.018,g);line([[0,1.39,.28],[-.12,1.18,.31],[-.12,.66,.32]],seam,.009,g);
 for(let i=0;i<4;i++){const y=1.31-i*.13;line([[-.12,y,.326],[-.04,y-.015,.34],[.015,y,.326]],seam,.015,g);ball(.024,seam,g,-.12,y,.33);}
 const hem=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*2;hem.push([Math.sin(a)*.397,.65,Math.cos(a)*.315]);}line(hem,'#c3adba',.008,g);
 const legs=[],knees=[],feet=[];
 for(const side of [-1,1]){
  const leg=new THREE.Group();leg.name='Khớp hông';leg.position.set(side*.195,.78,0);g.add(leg);
  cyl(.176,.18,.3,dress,leg,0,-.15,0);line([[side*.17,-.04,0],[side*.18,-.28,0]],seam,.006,leg);
  const knee=new THREE.Group();knee.name='Khớp gối';knee.position.y=-.3;leg.add(knee);cyl(.18,.19,.27,dress,knee,0,-.135,0);ball(.17,dress,knee,0,0,0,[1,.8,1]);
  const foot=new THREE.Group();foot.name='Khớp cổ chân';foot.position.y=-.3;knee.add(foot);
  ball(.13,skin,foot,0,-.05,.1,[.86,.52,1.45]);for(let toe=0;toe<4;toe++)ball(.025,skin,foot,-.065+toe*.041,-.05,.25,[.7,.8,1]);
  ball(.145,'#ad9278',foot,0,-.12,.1,[.9,.24,1.5]);line([[-.11,-.04,.14],[0,.04,.12],[.11,-.04,.14]],'#e6d8bd',.035,foot);line([[0,.02,-.02],[0,.04,.12]],'#f3e6ce',.025,foot);
  if(female)for(let bead=0;bead<4;bead++)ball(.012,'#fff3da',foot,(bead-1.5)*.02,.06,.13);
  legs.push(leg);knees.push(knee);feet.push(foot);
 }
 // Round cheeks, large glossy eyes, tiny nose and warm smile.
 cyl(.12,.14,.2,skin,g,0,1.66,0);ball(.55,skin,g,0,2.11,.025,[1,.98,.88]);
 for(const side of [-1,1]){ball(.1,skin,g,side*.54,2.02,0,[1,1.18,.85]);ball(.059,'#221b16',g,side*.205,2.08,.484,[.78,1.3,.5]);ball(.014,'#fff8e8',g,side*.19,2.11,.512);ball(.067,'#ecaa91',g,side*.315,1.96,.435,[1.1,.65,.15]);line([[side*.13,2.25,.43],[side*.21,2.28,.417],[side*.29,2.25,.375]],hair,.017,g);}
 ball(.035,skin,g,0,1.99,.496,[1,.65,.7]);line([[-.065,1.91,.459],[0,1.885,.476],[.065,1.91,.459]],'#b97550',.013,g);
 if(female){
  // Long, wavy brown locks, parted fringe and a continuous braided crown.
  ball(.565,hair,g,0,2.24,-.09,[1, .88,.87]);
  for(let i=0;i<7;i++){const x=(i-3)*.125;const lock=ball(.24,hair,g,x,1.66,-.28,[.85,2.5,1]);lock.rotation.z=Math.sin(i)*.1;for(let strand=0;strand<3;strand++)line([[x+(strand-1)*.035,2.22,-.47],[x+.045,1.67,-.53],[x-.025,1.18,-.43]],'#70503b',.006,g);}
  for(const side of [-1,1]){const fringePath=[[side*.02,2.52,.21],[side*.22,2.5,.35],[side*.4,2.33,.35],[side*.53,2.16,.17]];line(fringePath,hair,.105,g);for(let strand=0;strand<3;strand++)line(fringePath.map(([x,y,z])=>[x,y+(strand-1)*.025,z+.08]),'#78533c',.006,g);}
  for(let i=0;i<34;i++){const a=i/34*Math.PI*2;for(const s of [-1,1]){const twist=i*.95+s*Math.PI;const x=Math.sin(a)*.535+s*.018*Math.cos(twist),y=2.32-Math.cos(a)*.18+Math.sin(twist)*.027,z=-Math.cos(a)*.46;const bead=ball(.066,hair,g,x,y,z,[1.25,.75,1]);bead.rotation.z=a+s*.5;}}
  for(const side of [-1,1]){for(let k=0;k<5;k++){const a=k*Math.PI*2/5;ball(.034,'#fff3de',g,side*.5+Math.cos(a)*.043,1.92+Math.sin(a)*.043,.18,[1,1,.45]);}ball(.018,'#e3c07b',g,side*.5,1.92,.2);}
  // Small tied waist bow, matching the tunic.
  for(const side of [-1,1]){line([[-.1,1,.34],[-.1+side*.1,1.045,.35],[-.1+side*.09,.97,.35],[-.1,1,.34]],seam,.018,g);line([[-.1,1,.34],[-.1+side*.07,.84,.35]],seam,.02,g);}
 }else{
  // Close-cropped cap leaves the face open; no topknot or long hair.
  const scalpPositions=[],scalpIndices=[];for(let row=0;row<=20;row++)for(let col=0;col<=48;col++){const phi=col/48*Math.PI*2,theta=row/20*(1.65-.65*Math.max(0,Math.cos(phi)));scalpPositions.push(Math.sin(phi)*Math.sin(theta)*.557,Math.cos(theta)*.557,Math.cos(phi)*Math.sin(theta)*.49);if(row<20&&col<48){const k=row*49+col;scalpIndices.push(k,k+49,k+1,k+1,k+49,k+50);}}const scalpGeometry=new THREE.BufferGeometry();scalpGeometry.setAttribute('position',new THREE.Float32BufferAttribute(scalpPositions,3));scalpGeometry.setIndex(scalpIndices);scalpGeometry.computeVertexNormals();const cap=new THREE.Mesh(scalpGeometry,mat('#b99b89'));cap.position.set(0,2.17,-.02);g.add(cap);
  const vertices=[],indices=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2,x=Math.cos(a)*.37,z=Math.sin(a)*.31,y=1.18+x*.9;vertices.push(x,y-.115,z,x,y+.115,z);if(i<64){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();const sashMaterial=gold.clone();sashMaterial.side=THREE.DoubleSide;const sash=new THREE.Mesh(geo,sashMaterial);sash.name='Khăn vàng';sash.userData.ownMaterial=true;g.add(sash);
  for(const offset of [-.1,.1]){const pts=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;pts.push([Math.cos(a)*.38,1.18+Math.cos(a)*.37*.9+offset,Math.sin(a)*.32]);}line(pts,'#f4d37c',.009,g);}
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const ornament=ball(.027,'#edc466',g,Math.cos(a)*.382,1.18+Math.cos(a)*.37*.9,Math.sin(a)*.325,[.65,1.5,.3]);ornament.rotation.z=.7;}
 }
 // Lotus embroidery on the lower right front of both outfits.
 for(const side of [-1,0,1])line([[.18,.73,.32],[.18+side*.07,.78,.33],[.18+side*.06,.88,.32],[.18,.8,.34],[.18,.73,.32]],'#e8c876',.006,g);
 const arms=[],forearms=[],hands=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.name='Khớp vai';arm.position.set(side*.34,1.44,0);g.add(arm);ball(.15,dress,arm,side*.02,-.13,0,[1,1.05,1]);
  cyl(.12,.13,.2,dress,arm,0,-.22,0);
  const forearm=new THREE.Group();forearm.name='Khớp khuỷu tay';forearm.position.y=-ARM_LENGTHS.upper;arm.add(forearm);cyl(.075,.12,.22,dress,forearm,0,-.11,0);ball(.105,dress,forearm,0,0,0);
  hands.push(createHand({ball,cyl},forearm,side,skin));
  arm.rotation.x=female?(side===1?-.45:0):-.65;arm.rotation.z=female?0:-side*.35;arms.push(arm);forearms.push(forearm);
 }
 const mala=new THREE.Group();mala.name='Chuỗi hạt';for(let i=0;i<20;i++){const a=i*Math.PI/10;ball(.035,mat('#895022',.1),mala,Math.cos(a)*.12,-.14+Math.sin(a)*.21,0);}mala.position.set(0,-.25,.1);forearms[1].add(mala);
 const body=new THREE.Group();body.name='Khớp gập thân';body.position.y=.82;g.add(body);
 for(const child of [...g.children])if(child!==body&&!legs.includes(child)){g.remove(child);body.add(child);child.position.y-=.82;}
 const incense=createIncenseRitual(body);
 Object.assign(root.userData,{model:g,body,arms,forearms,hands,dress,legs,knees,feet,mala,gender,incense});return root;
}
export function disposeCharacter(root){root.traverse(o=>{if(!o.isSprite)o.geometry?.dispose();if(o.userData.ownMaterial)o.material?.dispose();});root.userData.dress?.dispose();}
