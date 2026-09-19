import test from 'node:test';
import assert from 'node:assert/strict';
import {findPassage} from '../passage.js';
test('finds an exact passage across PDF items and layout hyphens',()=>{
 const items=[{str:'Heading '},{str:'DO ska se till att diskrimine-'},{str:'ringslagen följs. Nästa mening.'}];
 const ranges=findPassage(items,'DO ska se till att diskrimine- ringslagen följs.');
 assert.deepEqual(ranges.map(r=>items[r.index].str.slice(r.start,r.end)),['DO ska se till att diskrimine','ringslagen följs']);
});
test('preserves offsets for a passage inside a larger text item',()=>{
 const ranges=findPassage([{str:'Före. Sverige är en sekulär stat. Efter.'}],'Sverige är en sekulär stat.');
 assert.deepEqual(ranges,[{index:0,start:6,end:32}]);
});
test('does not highlight unrelated text or an empty excerpt',()=>{
 assert.deepEqual(findPassage([{str:'Sverige'}],'Norge'),[]);
 assert.deepEqual(findPassage([{str:'Sverige'}],''),[]);
});
