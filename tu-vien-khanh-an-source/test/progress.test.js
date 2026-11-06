import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cleanProgress,completeTask,haloLevel,totalProgress} from '../src/progress.js';
test('Nhiệm vụ giới hạn tiến độ và mở đúng ba mốc hào quang',()=>{let p=cleanProgress();assert.equal(haloLevel(p),0);for(let i=0;i<3;i++)p=completeTask(p,'feed');assert.equal(haloLevel(p),1);p=completeTask(p,'feed');assert.equal(totalProgress(p),3);for(let i=0;i<4;i++)p=completeTask(p,'sweep');assert.equal(haloLevel(p),2);p=completeTask(p,'sweep');for(let i=0;i<3;i++)p=completeTask(p,'bow');p=completeTask(p,'incense');assert.equal(totalProgress(p),12);assert.equal(haloLevel(p),3);assert.deepEqual(cleanProgress({feed:100,sweep:-1,bow:'2',incense:null}),{feed:3,sweep:0,bow:2,incense:0});});
