import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as registry from '../specimens.js';

test('collection retains a scoped, mature mammalian erythrocyte',()=>{
 const cell=registry.specimens['red-blood-cell'];
 assert.ok(cell);
 assert.match(cell.sub,/哺乳动物/);
 assert.deepEqual(cell.keys,['membrane','rbc_cytoplasm']);
 assert.match(cell.omitted,/无细胞核/);
 assert.match(cell.omitted,/无线粒体/);
});
test('red-cell content overrides generic membrane and explains hemoglobin without fake organelles',()=>{
 assert.equal(typeof registry.structureEntry,'function');
 const entry=registry.structureEntry('red-blood-cell','membrane',{membrane:['generic']});
 assert.match(entry[6],/双凹/);
 const cytoplasm=registry.structureEntry('red-blood-cell','rbc_cytoplasm',{});
 assert.match(cytoplasm[3],/血红蛋白/);
 assert.match(cytoplasm[6],/不是细胞器/);
 assert.deepEqual(registry.structureEntry('animal-cell','membrane',{membrane:['original']}),['original']);
});
test('selecting red-cell interior reveals it, selecting membrane restores it',()=>{
 assert.equal(typeof registry.membraneHiddenAfterSelection,'function');
 const f=registry.membraneHiddenAfterSelection;
 assert.equal(f('red-blood-cell','rbc_cytoplasm',false),true);
 assert.equal(f('red-blood-cell','membrane',true),false);
 assert.equal(f('animal-cell','nucleus',false),false);
 assert.equal(f('animal-cell','nucleus',true),true);
});
test('exported red cell has only two meaningful meshes and a closed double depression',()=>{
 const cell=registry.specimens['red-blood-cell'];
 assert.ok(cell,'red-cell specimen is registered');
 const data=readFileSync(new URL('../public/red-blood-cell.glb',import.meta.url));
 const jsonLength=data.readUInt32LE(12);
 const gltf=JSON.parse(data.subarray(20,20+jsonLength).toString());
 const nodes=gltf.nodes.filter(n=>n.mesh!==undefined);
 assert.deepEqual(nodes.map(n=>n.extras.organelle).sort(),[...cell.keys].sort());
 const node=nodes.find(n=>n.extras.organelle==='membrane');
 const primitive=gltf.meshes[node.mesh].primitives[0];
 const acc=gltf.accessors[primitive.attributes.POSITION];
 const view=gltf.bufferViews[acc.bufferView];
 const start=28+jsonLength+(view.byteOffset||0)+(acc.byteOffset||0);
 const points=Array.from({length:acc.count},(_,i)=>Array.from({length:3},(_,k)=>data.readFloatLE(start+i*(view.byteStride||12)+k*4)));
 // glTF Y is Blender Z. The center must exist on both sides (no doughnut hole).
 const center=points.filter(([x,y,z])=>Math.hypot(x,z)<.04).map(p=>p[1]);
 assert.ok(center.some(y=>y>.1)&&center.some(y=>y<-.1));
 const thick=points.filter(([x,y,z])=>Math.hypot(x,z)>1.5&&Math.hypot(x,z)<2.4).map(p=>p[1]);
 assert.ok(Math.max(...thick)>Math.max(...center)*1.5);
 assert.ok(Math.min(...thick)<Math.min(...center)*1.5);
 const height=Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1]));
 const width=Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0]));
 assert.ok(height/width<.32,'red cell must read as a thin disc, not a thick doughnut');
});
