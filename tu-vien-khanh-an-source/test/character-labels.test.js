import {test} from 'node:test';
import assert from 'node:assert/strict';
import {speechFrame,SPEECH_DURATION} from '../src/character-labels.js';
import {NPC_GREETINGS} from '../src/living-world.js';

test('Chat hiện nguyên văn trong đúng 5 giây, tin mới có mốc thời gian riêng',()=>{
 const speech={text:'Chúc bạn bình an 🌸',start:1000,typing:false};assert.equal(SPEECH_DURATION,5000);
 assert.deepEqual(speechFrame(speech,1000),{visible:true,text:speech.text});assert.equal(speechFrame(speech,5999).visible,true);assert.equal(speechFrame(speech,6000).visible,false);
 assert.equal(speechFrame({...speech,start:5500},6000).visible,true);assert.equal(speechFrame(null,6000).visible,false);
});

test('NPC chạy chữ tiếng Việt rồi ẩn sau 5 giây, không cắt đôi emoji',()=>{
 for(const text of NPC_GREETINGS){const speech={text,start:100,typing:true};assert.equal(speechFrame(speech,100).text,'');assert.equal(speechFrame(speech,164).text,Array.from(text).slice(0,2).join(''));assert.equal(speechFrame(speech,4500).text,text);assert.equal(speechFrame(speech,5100).visible,false);}
 assert.equal(speechFrame({text:'🌸 An lành',start:0,typing:true},32).text,'🌸');
});
