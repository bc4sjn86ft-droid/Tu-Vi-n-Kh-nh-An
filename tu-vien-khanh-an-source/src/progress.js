export const TASKS=[{id:'feed',name:'Chăm đàn cá',area:'Hồ sen',goal:3},{id:'sweep',name:'Sân chùa sạch lá',area:'Sân tu viện',goal:5},{id:'bow',name:'Lễ Phật thành tâm',area:'Chính điện · Quan Âm',goal:3},{id:'incense',name:'Một nén tâm hương',area:'Lư hương · Quan Âm',goal:1}];
export const MILESTONES=[{at:3,name:'Mầm thiện',color:'#91efb1'},{at:7,name:'Tâm an',color:'#ffd779'},{at:12,name:'Sen thanh tịnh',color:'#c6b4ff'}];
export function cleanProgress(value={}){return Object.fromEntries(TASKS.map(t=>[t.id,Math.max(0,Math.min(t.goal,Math.floor(Number(value?.[t.id])||0)))]));}
export function totalProgress(p){return TASKS.reduce((sum,t)=>sum+p[t.id],0);}
export function haloLevel(p){return MILESTONES.filter(m=>totalProgress(p)>=m.at).length;}
export function completeTask(p,id){const next=cleanProgress(p);const task=TASKS.find(t=>t.id===id);if(task)next[id]=Math.min(task.goal,next[id]+1);return next;}
