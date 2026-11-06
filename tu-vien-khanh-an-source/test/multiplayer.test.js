import {HALL_LEVELS,WORLD} from '../src/world-layout.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {WebSocket} from 'ws';
const waitMessage=(ws,filter)=>new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{ws.off('message',handler);reject(new Error('Hết thời gian chờ'));},5000);function handler(raw){const m=JSON.parse(raw);if(filter(m)){clearTimeout(timeout);ws.off('message',handler);resolve(m);}}ws.on('message',handler);});
test('Thỉnh chuông đồng bộ cả phòng, từ chối người ở xa và chống bấm liên tục',async()=>{
 const port=23000+Math.floor(Math.random()*1000),server=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:String(port),NODE_ENV:'production'},stdio:['ignore','pipe','pipe']}),clients=[];
 try{
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
  const first=new WebSocket(`ws://localhost:${port}/world`);clients.push(first);await waitMessage(first,message=>message.type==='welcome');
  const second=new WebSocket(`ws://localhost:${port}/world`);clients.push(second);await waitMessage(second,message=>message.type==='welcome');
  const events=[];second.on('message',raw=>{const message=JSON.parse(raw);if(message.type==='bell')events.push(message);});
  first.send(JSON.stringify({type:'bell'}));await new Promise(resolve=>setTimeout(resolve,80));assert.equal(events.length,0);
  const moved=waitMessage(first,message=>message.type==='move');first.send(JSON.stringify({type:'move',x:WORLD.bell.x,z:WORLD.bell.z+4,y:0,rotation:0,action:'idle'}));await moved;
  const heard=waitMessage(second,message=>message.type==='bell');first.send(JSON.stringify({type:'bell'}));await heard;assert.equal(events.length,1);
  first.send(JSON.stringify({type:'bell'}));await new Promise(resolve=>setTimeout(resolve,80));assert.equal(events.length,1);
 }finally{clients.forEach(client=>client.terminate());server.kill();}
});
test('Người chơi tầng 3 giữ cao độ với người đang chơi và người vào sau',async()=>{
 const port=21000+Math.floor(Math.random()*1000),server=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:String(port),NODE_ENV:'production'},stdio:['ignore','pipe','pipe']}),clients=[];
 try{
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
  const first=new WebSocket(`ws://localhost:${port}/world`);clients.push(first);const welcome=await waitMessage(first,message=>message.type==='welcome');
  const second=new WebSocket(`ws://localhost:${port}/world`);clients.push(second);await waitMessage(second,message=>message.type==='welcome');
  const moved=waitMessage(second,message=>message.type==='move'&&message.player.id===welcome.id);
  first.send(JSON.stringify({type:'move',x:19,z:-8,y:HALL_LEVELS[2],rotation:0,action:'meditate'}));const remote=(await moved).player;assert.equal(remote.y,HALL_LEVELS[2]);assert.equal(remote.action,'meditate');
  const late=new WebSocket(`ws://localhost:${port}/world`);clients.push(late);const state=await waitMessage(late,message=>message.type==='welcome');assert.equal(state.players.find(player=>player.id===welcome.id).y,HALL_LEVELS[2]);
 }finally{clients.forEach(client=>client.terminate());server.kill();}
});
test('Hai người chơi đồng bộ di chuyển, trò chuyện và rời phòng',async()=>{const port=19000+Math.floor(Math.random()*1000);const server=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:String(port),NODE_ENV:'production'},stdio:['ignore','pipe','pipe']});const clients=[];try{await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});const response=await fetch(`http://localhost:${port}`);assert.equal(response.status,200);assert.match(await response.text(),/Tu viện Khánh An/);const a=new WebSocket(`ws://localhost:${port}/world`);clients.push(a);const welcomeA=await waitMessage(a,m=>m.type==='welcome');const b=new WebSocket(`ws://localhost:${port}/world`);clients.push(b);const welcomeB=await waitMessage(b,m=>m.type==='welcome');assert.equal(welcomeB.players.length,2);const moved=waitMessage(b,m=>m.type==='move'&&m.player.id===welcomeA.id);a.send(JSON.stringify({type:'move',x:39,z:40,rotation:1,action:'feed',halo:3}));const state=(await moved).player;assert.equal(state.action,'feed');assert.equal(state.halo,3);assert.equal(state.x,39);assert.equal(state.z,40);const appearance=waitMessage(b,m=>m.type==='move'&&m.player.id===welcomeA.id&&m.player.gender==='male');a.send(JSON.stringify({type:'appearance',gender:'male'}));assert.equal((await appearance).player.gender,'male');const c=new WebSocket(`ws://localhost:${port}/world`);clients.push(c);const late=await waitMessage(c,m=>m.type==='welcome');assert.equal(late.players.find(p=>p.id===welcomeA.id).gender,'male');const chat=waitMessage(b,m=>m.type==='chat');a.send(JSON.stringify({type:'chat',text:'Chúc bạn bình an'}));const message=await chat;assert.equal(message.text,'Chúc bạn bình an');assert.equal(message.playerId,welcomeA.id);const left=waitMessage(b,m=>m.type==='leave');a.close();assert.equal((await left).id,welcomeA.id);}finally{clients.forEach(c=>c.terminate());server.kill();}});
