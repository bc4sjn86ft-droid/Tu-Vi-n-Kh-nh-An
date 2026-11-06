import {nearQuanAm,WORLD} from './world-layout.js';

export function createQuanAmInteractions({player,act,busy}){
 const panel=document.createElement('section');panel.className='quan-am-interactions';panel.hidden=true;panel.setAttribute('aria-label','Tương tác trước Quan Âm');
 const heading=document.createElement('strong');heading.textContent='Trước Quan Âm · Giữ tâm an lành';panel.append(heading);
 for(const [action,label] of [['kneel','Quỳ lễ · Q'],['bow','Lạy Quan Âm · E'],['incense','Dâng hương · R']]){
  const button=document.createElement('button');button.textContent=label;button.dataset.quanamAction=action;
  button.onclick=()=>{if(!nearQuanAm(player.position))return;player.rotation.y=Math.atan2(WORLD.quanAm.x-player.position.x,WORLD.quanAm.z-player.position.z);act(action);};panel.append(button);
 }
 document.querySelector('main').append(panel);
 return {update(){const pending=busy();panel.hidden=!nearQuanAm(player.position);panel.setAttribute('aria-busy',String(pending));heading.textContent=pending?'Đang thực hiện nghi lễ…':'Trước Quan Âm · Giữ tâm an lành';panel.querySelectorAll('button').forEach(button=>{button.disabled=pending;});}};
}
