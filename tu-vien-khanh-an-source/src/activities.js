import * as THREE from 'three';
import {setHalo,animateHalo} from './halo.js';
import {WORLD,inHall,nearQuanAm} from './world-layout.js';
import {createKoi} from './koi.js';
import {createCourtyardLeaves,courtyardLeafAllowed} from './courtyard-leaves.js';
import {TASKS,MILESTONES,cleanProgress,totalProgress,haloLevel,completeTask} from './progress.js';
export function createActivities({scene,player,mat,ball,cyl,box,line,toast}){
 let progress;try{progress=cleanProgress(JSON.parse(localStorage.getItem('khanhan-tasks-v1')));}catch{progress=cleanProgress();}
 let pending=null,feedAt=-100,lastHalo=-1;
 const panel=document.createElement('section');panel.className='quest-panel';panel.innerHTML='<button id="quest-toggle" aria-expanded="true"><span>✧ Nhiệm vụ an lành</span><b id="quest-total"></b></button><div id="quest-body"></div>';document.querySelector('.left-panel').prepend(panel);
 document.getElementById('quest-toggle').onclick=()=>{const body=document.getElementById('quest-body');body.hidden=!body.hidden;document.getElementById('quest-toggle').setAttribute('aria-expanded',String(!body.hidden));};
 const prompt=document.createElement('div');prompt.className='activity-prompt';prompt.innerHTML='<span id="activity-location"></span><button id="activity-button"></button><small id="activity-hint"></small>';document.querySelector('main').append(prompt);
 const fish=createKoi({scene,mat,ball});
 const ripples=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.5,.015,5,32),new THREE.MeshBasicMaterial({color:'#ffd49c',transparent:true,opacity:.4}));m.rotation.x=Math.PI/2;m.position.set(WORLD.pond.x,.45,WORLD.pond.z);scene.add(m);ripples.push(m);}
 const crumbs=[];for(let i=0;i<16;i++){const m=ball(.045,'#c99753',scene);m.visible=false;crumbs.push(m);}
 const leaves=createCourtyardLeaves(scene);
 const broom=new THREE.Group();cyl(.025,.025,1.4,'#84512e',broom,0,0,0);for(let i=0;i<11;i++)line([[0,-.65,0],[(i-5)*.035,-1.05,0]],'#c6a362',.018,broom);broom.position.set(.6,.9,.35);broom.rotation.z=-.4;broom.visible=false;player.add(broom);
 function render(){const total=totalProgress(progress),level=haloLevel(progress);document.getElementById('quest-total').textContent=`${total}/12`;document.getElementById('quest-body').innerHTML=TASKS.map(t=>`<div class="quest-row ${progress[t.id]===t.goal?'done':''}" data-task="${t.id}"><div><b>${progress[t.id]===t.goal?'✓ ':''}${t.name}</b><span>${progress[t.id]}/${t.goal}</span></div><small>${t.area}</small><progress value="${progress[t.id]}" max="${t.goal}"></progress></div>`).join('')+`<div class="halo-milestones">${MILESTONES.map((m,i)=>`<span class="${level>i?'earned':''}" style="--halo:${m.color}">◉<small>${m.at} · ${m.name}</small></span>`).join('')}</div><p class="quest-note">${level?'Hào quang: '+MILESTONES[level-1].name:'Hoàn thành 3 lượt để mở hào quang đầu tiên.'}</p>`;setHalo(player,level);lastHalo=level;}
 function region(){const {x,z}=player.position;if(nearQuanAm(player.position))return null;if(Math.hypot(x-WORLD.pond.x,z-WORLD.pond.z)<9)return 'feed';if(player.position.y<.1&&courtyardLeafAllowed(x,z))return 'sweep';return null;}
 function start(type,now){if(pending){toast('Hãy hoàn thành cử chỉ hiện tại trước nhé.');return false;}if((type==='feed'||type==='sweep')&&region()!==type){toast(type==='feed'?'Đến bờ hồ sen để cho cá ăn.':'Đến sân tu viện để quét lá.');return false;}if(type==='bow'&&!inHall(player.position.x,player.position.z)&&!nearQuanAm(player.position)){return true;}if(!TASKS.some(t=>t.id===type))return true;pending={type,start:now,x:player.position.x,z:player.position.z,duration:type==='incense'?4000:type==='bow'?3500:3000};document.getElementById('activity-button').disabled=true;if(type==='feed')feedAt=now/1000;return true;}
 function cancel(){if(!pending)return;pending=null;broom.visible=false;toast('Đã dừng cử chỉ. Hãy đứng yên để hoàn thành nhiệm vụ.');}
 function update(now){const t=now/1000;const near=region();prompt.hidden=nearQuanAm(player.position)||(!near&&!pending);document.getElementById('activity-location').textContent=pending?'Đang thực hiện…':near==='feed'?'Hồ sen · Đàn cá đang đợi bạn':'Sân tu viện · Cùng giữ sân sạch lá';document.getElementById('activity-button').textContent=pending?`${Math.min(100,Math.round((now-pending.start)/pending.duration*100))}%`:near==='feed'?'Cho cá ăn · F':'Quét lá · F';document.getElementById('activity-button').disabled=!!pending;document.getElementById('activity-hint').textContent='Đứng yên cho đến khi hoàn thành cử chỉ';
 if(pending){if(Math.hypot(player.position.x-pending.x,player.position.z-pending.z)>.2)cancel();else if(now-pending.start>=pending.duration){const type=pending.type;if(type==='sweep')leaves.clearNear(pending.x,pending.z);pending=null;const oldTotal=totalProgress(progress);progress=completeTask(progress,type);try{localStorage.setItem('khanhan-tasks-v1',JSON.stringify(progress));}catch{}const level=haloLevel(progress);if(level>lastHalo)toast(`Đã mở hào quang ${MILESTONES[level-1].name}!`);else toast(totalProgress(progress)>oldTotal?'Đã hoàn thành một lượt nhiệm vụ an lành.':'Cảm ơn bạn đã tiếp tục chăm sóc tu viện.');render();}}
 broom.visible=pending?.type==='sweep';if(broom.visible){broom.rotation.x=Math.sin(t*8)*.55;player.userData.arms[1].rotation.x=-.6+Math.sin(t*8)*.25;}
 if(pending?.type==='feed'){player.userData.arms[0].rotation.x=-1+Math.sin(t*5)*.25;}
 leaves.update(pending?.type==='sweep'?{x:pending.x,z:pending.z,amount:(now-pending.start)/pending.duration}:null);
 const elapsed=t-feedAt;fish.update(t,elapsed);
 ripples.forEach((r,i)=>{const scale=(t*.7+i*.4)%2.5;r.scale.setScalar(scale);r.material.opacity=(1-scale/2.5)*(elapsed<3?.6:.2);});crumbs.forEach((m,i)=>{const p=(elapsed-i*.025)/.8;m.visible=p>0&&p<1;if(m.visible)m.position.set(3-p*3+Math.sin(i)*.5,1+Math.sin(p*Math.PI)*1.2-p*.8,-2-p*3+Math.cos(i)*.7);});
 animateHalo(player,t);
 }
 render();return {update,start,cancel,region,setHalo,level:()=>haloLevel(progress),pending:()=>!!pending};
}
