import express from 'express';
import {floorHeight,nearBell} from './src/world-layout.js';
import {createServer} from 'node:http';
import {WebSocketServer,WebSocket} from 'ws';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const app=express(), server=createServer(app), wss=new WebSocketServer({server,path:'/world',maxPayload:4096});
const players=new Map();let lastBell=0;
const send=(ws,data)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(data));};
const broadcast=data=>wss.clients.forEach(ws=>send(ws,data));
wss.on('connection',ws=>{
 const id=randomUUID(), player={id,name:'Khách hành hương',x:(Math.random()-.5)*4,z:15,y:0,rotation:0,action:'idle',gender:'female'};players.set(id,player);
 send(ws,{type:'welcome',id,players:[...players.values()]});broadcast({type:'join',player});
 let lastChat=0,lastMove=0;
 ws.on('message',raw=>{try{const m=JSON.parse(raw);if(m.type==='move'&&Date.now()-lastMove>35){lastMove=Date.now();if(!Number.isFinite(m.x)||!Number.isFinite(m.z)||!Number.isFinite(m.rotation))return;Object.assign(player,{x:Math.max(-43,Math.min(43,m.x)),z:Math.max(-39,Math.min(43,m.z)),y:floorHeight(Math.max(-43,Math.min(43,m.x)),Math.max(-39,Math.min(43,m.z)),Number.isFinite(m.y)?m.y:player.y),rotation:m.rotation,action:['idle','walk','jump','kneel','bow','incense','feed','sweep','meditate'].includes(m.action)?m.action:'idle',halo:Number.isInteger(m.halo)?Math.max(0,Math.min(3,m.halo)):0});broadcast({type:'move',player});}if(m.type==='bell'&&nearBell(player)&&Date.now()-lastBell>=4500){lastBell=Date.now();broadcast({type:'bell',playerId:id});}if(m.type==='appearance'&&['male','female'].includes(m.gender)){player.gender=m.gender;broadcast({type:'move',player});}if(m.type==='name'&&typeof m.name==='string'){player.name=m.name.trim().slice(0,24)||'Khách hành hương';broadcast({type:'move',player});}if(m.type==='chat'&&typeof m.text==='string'&&Date.now()-lastChat>800){lastChat=Date.now();const text=m.text.trim().slice(0,240);if(text)broadcast({type:'chat',playerId:id,name:player.name,text});}}catch{}});
 ws.on('close',()=>{players.delete(id);broadcast({type:'leave',id});});
});
if(process.env.NODE_ENV==='production'){app.use(express.static(fileURLToPath(new URL('./dist',import.meta.url))));}else{const {createServer:createVite}=await import('vite');app.use((await createVite({server:{middlewareMode:true},appType:'spa'})).middlewares);}
server.listen(Number(process.env.PORT)||5173,'0.0.0.0',()=>console.log('Tu viện Khánh An: http://localhost:'+(process.env.PORT||5173)));
