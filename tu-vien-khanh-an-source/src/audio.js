import {createYouTubeMusic} from './youtube-music.js';

export const BELL_PARTIALS=[{ratio:1,level:.42,decay:8},{ratio:2.01,level:.24,decay:6},{ratio:2.76,level:.16,decay:4.6},{ratio:4.08,level:.09,decay:3},{ratio:5.43,level:.04,decay:2}];

export function createTempleAudio({musicButton,effectsButton,volumeInput,storage=localStorage,AudioContextClass=globalThis.AudioContext||globalThis.webkitAudioContext,musicFactory=createYouTubeMusic}={}){
 let context,master,effects;
 let musicVolume=.8;
 try{const saved=storage.getItem('khanhan-music-volume');if(saved!==null&&saved!==undefined&&Number.isFinite(Number(saved)))musicVolume=Math.max(0,Math.min(1,Number(saved)));}catch{}
 const read=key=>{try{return storage.getItem(key)!=='off';}catch{return true;}};
 let music=read('khanhan-music'),sounds=read('khanhan-sounds');
 const youtube=musicFactory({enabled:music,volume:musicVolume,onStatus(status){if(musicButton)musicButton.dataset.musicState=status;}});
 function render(){
  for(const [button,enabled,label] of [[musicButton,music,'nhạc nền'],[effectsButton,sounds,'âm thanh nghi lễ']]){
   if(!button)continue;button.classList.toggle('on',enabled);button.setAttribute('aria-pressed',String(enabled));button.title=(enabled?'Tắt ':'Bật ')+label;button.setAttribute('aria-label',button.title);
  }
  if(musicButton)musicButton.dataset.audioState=context?.state||'waiting';
 }
 function tone(frequency,level,duration,bus,delay=0){
  const start=context.currentTime+delay,oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(level,start+.012);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  oscillator.connect(gain);gain.connect(bus);oscillator.start(start);oscillator.stop(start+duration+.05);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }
 function initialize(){
  if(context||!AudioContextClass)return;
  context=new AudioContextClass();master=context.createGain();master.gain.value=.75;
  const limiter=context.createDynamicsCompressor();master.connect(limiter);limiter.connect(context.destination);
  effects=context.createGain();effects.gain.value=sounds?1:0;effects.connect(master);
  context.onstatechange=render;
 }
 async function unlock(){youtube.unlock();try{initialize();if(context&&context.state!=='running'&&context.state!=='closed')await context.resume();render();}catch{render();}}
 function play(type,volume=1){
  if(!sounds||volume<=0)return;
  const requested=Date.now();
  function emit(){
   if(!context||context.state!=='running'||!sounds||Date.now()-requested>1000)return;
   if(['bell','kneel','bow','incense'].includes(type))for(const partial of BELL_PARTIALS)tone(138.59*partial.ratio,partial.level*volume*(type==='bell'?1:.75),partial.decay,effects);
  }
  if(context?.state==='running')emit();else unlock().then(emit);
 }
 function toggle(key){
  if(key==='music'){music=!music;youtube.setEnabled(music);}
  else{sounds=!sounds;if(effects)effects.gain.setTargetAtTime(sounds?1:0,context.currentTime,.03);}
  try{storage.setItem(key==='music'?'khanhan-music':'khanhan-sounds',(key==='music'?music:sounds)?'on':'off');}catch{}
  unlock();render();
 }
 if(musicButton)musicButton.onclick=()=>toggle('music');if(effectsButton)effectsButton.onclick=()=>toggle('sounds');
 if(volumeInput){volumeInput.value=String(Math.round(musicVolume*100));volumeInput.oninput=()=>{const value=Number(volumeInput.value);if(!Number.isFinite(value))return;musicVolume=Math.max(0,Math.min(1,value/100));youtube.setVolume(musicVolume);try{storage.setItem('khanhan-music-volume',String(musicVolume));}catch{}unlock();};}
 globalThis.addEventListener?.('pointerdown',unlock,{capture:true});globalThis.addEventListener?.('keydown',unlock,{capture:true});
 render();unlock();
 return {unlock,play,update(){},state:()=>({music,sounds,musicVolume,status:context?.state||'unavailable'})};
}
