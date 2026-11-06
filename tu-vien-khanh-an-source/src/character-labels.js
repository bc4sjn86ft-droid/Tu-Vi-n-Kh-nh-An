import * as THREE from 'three';

export const SPEECH_DURATION=5000;
export function speechFrame(speech,now){
 if(!speech||now>=speech.start+SPEECH_DURATION)return {visible:false,text:''};
 const letters=Array.from(speech.text),count=speech.typing?Math.min(letters.length,Math.max(0,Math.floor((now-speech.start)/32))):letters.length;
 return {visible:true,text:letters.slice(0,count).join('')};
}

export function createCharacterLabels({camera,host=document.querySelector('main'),clock=()=>performance.now()}){
 const layer=document.createElement('div');layer.className='character-labels';layer.setAttribute('aria-label','Tên và lời thoại nhân vật');host.prepend(layer);
 const entries=new Map(),point=new THREE.Vector3();
 function track(character,name,id){
  let entry=entries.get(character);
  if(!entry){const node=document.createElement('div'),title=document.createElement('span'),bubble=document.createElement('div');node.className='character-label';title.className='character-name';bubble.className='character-speech';bubble.hidden=true;node.append(bubble,title);layer.append(node);entry={node,title,bubble,speech:null};entries.set(character,entry);}
  entry.title.textContent=String(name||'Khách hành hương').slice(0,40);entry.node.dataset.characterId=String(id||'');
 }
 function untrack(character){const entry=entries.get(character);entry?.node.remove();entries.delete(character);}
 function say(character,text,{typing=false}={}){const entry=entries.get(character);if(!entry||!String(text).trim())return;entry.speech={text:String(text).trim().slice(0,240),typing,start:clock()};}
 return {track,untrack,say,update(){
  const width=layer.clientWidth,height=layer.clientHeight,now=clock();
  for(const [character,entry]of entries){
   const body=character.userData.body;
   if(body)body.localToWorld(point.set(0,1.94,0));else character.localToWorld(point.set(0,2.85,0));
   point.y+=.12;const distance=point.distanceTo(camera.position);point.project(camera);
   entry.node.hidden=point.z< -1||point.z>1||Math.abs(point.x)>1.1||Math.abs(point.y)>1.1||distance>95;
   if(!entry.node.hidden)entry.node.style.transform=`translate(${(point.x*.5+.5)*width}px,${(-point.y*.5+.5)*height}px) translate(-50%,-100%)`;
   const frame=speechFrame(entry.speech,now);entry.bubble.hidden=!frame.visible;if(entry.bubble.textContent!==frame.text)entry.bubble.textContent=frame.text;
  }
 },dispose(){layer.remove();entries.clear();}};
}
