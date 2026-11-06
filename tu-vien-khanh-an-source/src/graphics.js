export const GRAPHICS_PROFILES={
 auto:{label:'Tự động',ratio:1.25,shadows:true,shadowSize:1024,lights:true},
 smooth:{label:'Mượt',ratio:.85,shadows:false,shadowSize:512,lights:false},
 balanced:{label:'Cân bằng',ratio:1.25,shadows:true,shadowSize:1024,lights:true},
 high:{label:'Đẹp',ratio:2,shadows:true,shadowSize:2048,lights:true}
};

export function adaptivePixelRatio(ratio,fps,maximum){
 if(fps<42)return Math.max(.65,Math.round((ratio-.15)*100)/100);
 if(fps>57)return Math.min(maximum,Math.round((ratio+.1)*100)/100);
 return ratio;
}

export function createGraphics({renderer,sun,scene,host,storage=localStorage,pixelRatio=()=>devicePixelRatio}){
 const lights=[];scene.traverse(object=>{if(object.isPointLight)lights.push({object,visible:object.visible});});
 const panel=document.createElement('div');panel.className='graphics-controls';
 panel.innerHTML='<label for="graphics-quality">Đồ họa</label><select id="graphics-quality" aria-label="Chất lượng đồ họa">'+Object.entries(GRAPHICS_PROFILES).map(([value,profile])=>`<option value="${value}">${profile.label}</option>`).join('')+'</select><output id="graphics-fps" aria-live="off">Đang đo…</output>';
 host.append(panel);
 const select=panel.querySelector('select'),output=panel.querySelector('output');
 let mode='auto',ratio=1,frames=0,elapsed=0,warmup=3,cooldown=0;
 function save(){try{storage.setItem('khanhan-graphics',mode);}catch{}}
 function apply(value){
  mode=Object.hasOwn(GRAPHICS_PROFILES,value)?value:'auto';select.value=mode;
  const profile=GRAPHICS_PROFILES[mode];ratio=Math.min(pixelRatio()||1,profile.ratio);
  renderer.setPixelRatio(ratio);
  const shadowsChanged=renderer.shadowMap.enabled!==profile.shadows;
  renderer.shadowMap.enabled=profile.shadows;
  if(sun.shadow.mapSize.x!==profile.shadowSize){
   sun.shadow.mapSize.set(profile.shadowSize,profile.shadowSize);
   sun.shadow.map?.dispose();sun.shadow.map=null;
   sun.shadow.mapPass?.dispose();sun.shadow.mapPass=null;
   renderer.shadowMap.needsUpdate=true;
  }
  if(shadowsChanged)scene.traverse(object=>{if(object.material)for(const material of Array.isArray(object.material)?object.material:[object.material])material.needsUpdate=true;});
  lights.forEach(({object,visible})=>{object.visible=visible&&profile.lights;});
  frames=0;elapsed=0;warmup=3;cooldown=0;output.textContent='Đang đo…';save();
 }
 let stored;try{stored=storage.getItem('khanhan-graphics');}catch{}
 apply(stored||'auto');select.addEventListener('change',()=>apply(select.value));
 return {resize(){ratio=Math.min(ratio,pixelRatio()||1,GRAPHICS_PROFILES[mode].ratio);renderer.setPixelRatio(ratio);},update(seconds){
  if(!Number.isFinite(seconds)||seconds<=0||seconds>.5){frames=0;elapsed=0;return;}
  if(warmup>0){warmup-=seconds;return;}
  frames++;elapsed+=seconds;cooldown=Math.max(0,cooldown-seconds);
  if(elapsed<2)return;
  const fps=frames/elapsed;output.textContent=`${Math.round(fps)} FPS`;frames=0;elapsed=0;
  if(mode!=='auto'||cooldown>0)return;
  const next=adaptivePixelRatio(ratio,fps,Math.min(pixelRatio()||1,GRAPHICS_PROFILES.auto.ratio));
  if(next!==ratio){ratio=next;renderer.setPixelRatio(ratio);cooldown=8;}
 }};
}
