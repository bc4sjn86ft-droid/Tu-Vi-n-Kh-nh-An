export const YOUTUBE_MUSIC_ID='lmYlOxyOESw';
let apiPromise;

function loadYouTube(){
 if(globalThis.YT?.Player)return Promise.resolve(globalThis.YT);
 if(!apiPromise)apiPromise=new Promise((resolve,reject)=>{
  const previous=globalThis.onYouTubeIframeAPIReady;
  globalThis.onYouTubeIframeAPIReady=()=>{previous?.();resolve(globalThis.YT);};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{apiPromise=null;reject(new Error('Không tải được YouTube'));};document.head.append(script);
 });
 return apiPromise;
}

export function createYouTubeMusic({enabled=true,volume=.8,onStatus=()=>{}}={}){
 if(typeof document==='undefined')return {setEnabled(){},setVolume(){},unlock(){}};
 let player,ready=false,loading=false;
 const card=document.createElement('section');card.id='youtube-music';card.className='youtube-music';card.setAttribute('aria-label','Nhạc nền YouTube');card.hidden=!enabled;
 const heading=document.createElement('div');heading.className='youtube-heading';heading.textContent='♫ Nhạc nền · YouTube';
 const mount=document.createElement('div');mount.id='youtube-player';
 const status=document.createElement('small');status.textContent='Đang tải nhạc…';
 const link=document.createElement('a');link.href=`https://www.youtube.com/watch?v=${YOUTUBE_MUSIC_ID}`;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Mở bản nhạc trên YouTube ↗';
 card.append(heading,mount,status,link);document.body.append(card);
 function sync(){if(!ready)return;player.setVolume(Math.round(volume*100));if(enabled){player.unMute();player.playVideo();}else player.pauseVideo();}
 async function start(){
  if(loading||player||!enabled)return;loading=true;
  try{
   const api=await loadYouTube();
   player=new api.Player(mount,{width:224,height:200,videoId:YOUTUBE_MUSIC_ID,playerVars:{autoplay:1,playsinline:1,controls:1,loop:1,playlist:YOUTUBE_MUSIC_ID,origin:location.origin},events:{
    onReady(){ready=true;status.textContent='Chạm nút phát nếu trình duyệt chặn tự mở.';sync();},
    onStateChange(event){const playing=event.data===1;status.textContent=playing?'Đang phát nhạc nền':enabled?'Chạm nút phát để nghe nhạc.':'Đã tắt nhạc nền';onStatus(playing?'playing':'paused');},
    onAutoplayBlocked(){status.textContent='Chạm nút phát trong khung YouTube để nghe nhạc.';onStatus('blocked');},
    onError(){status.textContent='YouTube không phát được tại đây. Dùng liên kết bên dưới.';onStatus('error');}
   }});
  }catch{loading=false;status.textContent='Không kết nối được YouTube. Bấm ♫ để thử lại.';onStatus('error');}
 }
 start();
 return {setEnabled(value){enabled=value;card.hidden=!enabled;if(enabled)start();sync();},setVolume(value){volume=value;if(ready)player.setVolume(Math.round(volume*100));},unlock(){if(enabled){start();sync();}}};
}
