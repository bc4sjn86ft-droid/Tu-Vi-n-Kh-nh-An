import * as THREE from 'three';
import {MILESTONES} from './progress.js';
export function setHalo(g,level){level=Math.max(0,Math.min(3,Math.floor(level)||0));if(g.userData.haloLevel===level)return;const old=g.userData.halo;if(old){g.remove(old);old.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}g.userData.haloLevel=level;const aura=new THREE.Group();aura.name='Hào quang sau đầu';aura.position.set(0,2.14,-.64);g.add(aura);g.userData.halo=aura;if(!level)return;const color=MILESTONES[level-1].color;
 // Torus defaults to the XY plane: upright behind the face, never horizontal.
 for(let i=0;i<level;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.67+i*.095,.012,8,80),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8}));aura.add(ring);}
 const glow=new THREE.Mesh(new THREE.RingGeometry(.59,.71+(level-1)*.095,80),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false}));aura.add(glow);
 for(let i=0;i<level*12;i++){const a=i/(level*12)*Math.PI*2,r=.7+(level-1)*.095;const dot=new THREE.Mesh(new THREE.SphereGeometry(.013,6,4),new THREE.MeshBasicMaterial({color}));dot.position.set(Math.cos(a)*r,Math.sin(a)*r,0);aura.add(dot);}
}
export function animateHalo(g,t){const aura=g.userData.halo;if(aura)aura.rotation.z=Math.sin(t*.5)*.035;}
