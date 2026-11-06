import * as THREE from 'three';
import {buildCoveredCorridors} from './covered-corridor.js';

export {createChibi} from './character.js';

export function enrichTemple({scene,temple,mat,box,ball,cyl,line,mesh,roof,sign}){
 const gold=mat('#d6aa49',.45),dark='#39251e';
 // A carved altar screen and warm pools of light behind the three statues.
 for(const x of [-5,0,5]){box(4.5,5.5,.22,dark,temple,x,3.9,-13.25);box(4.2,5.2,.12,'#ac7932',temple,x,3.9,-13.1);for(let k=-1.9;k<2;k+=.22)box(.025,5,.06,gold,temple,x+k,3.9,-13.01);const light=new THREE.PointLight('#ffbf59',16,10,2);light.position.set(x,4.5,-8);temple.add(light);}
 for(const x of [-8,-3,3,8]){cyl(.25,.36,.6,'#302c28',temple,x,2.45,-8);for(let i=0;i<9;i++){const a=i*2.4,xx=x+Math.cos(a)*.4,y=3+(i%3)*.21,zz=-8+Math.sin(a)*.3;line([[x,2.7,-8],[xx,y,zz]],'#53653b',.018,temple);for(let k=0;k<5;k++){const b=k*Math.PI*2/5;ball(.09,i%2?'#e9acc3':'#f6d1da',temple,xx+Math.cos(b)*.09,y+Math.sin(b)*.09,zz,[1,1,.6]);}}}
 for(const x of [-8,-4,4,8]){cyl(.16,.3,.15,gold,temple,x,2.13,-7.25);cyl(.055,.07,.4,'#f2dcac',temple,x,2.4,-7.25);ball(.06,mat('#ffcd5d'),temple,x,2.65,-7.25,[.7,1.8,.7]);}
 for(const x of [-8,8])for(const z of [-3,3]){line([[x,7.3,z],[x,6.4,z]],dark,.025,temple);cyl(.23,.32,.55,mat('#ffd180'),temple,x,6.1,z,6);cyl(.4,.3,.13,gold,temple,x,6.43,z,6);cyl(.3,.38,.13,gold,temple,x,5.77,z,6);}
 // Covered walkways connect the courtyard to the garden.
 buildCoveredCorridors({scene,mat,box,cyl,line,mesh});

}
