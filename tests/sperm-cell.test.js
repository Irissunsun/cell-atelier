import test from 'node:test';
import assert from 'node:assert/strict';
import * as registry from '../specimens.js';
import {readFileSync} from 'node:fs';

test('collection retains a human sperm-cell teaching model',()=>{
 const cell=registry.specimens['sperm-cell'];
 assert.deepEqual(cell.keys,['acrosome','nucleus','mitochondria','flagellum']);
 assert.deepEqual(cell.hidden,[]);
 assert.equal(cell.procedural,undefined);
 assert.match(cell.omitted,/细胞膜实际连续包围/);
 assert.match(cell.omitted,/9\+2/);
});

test('sperm-cell explanations are scoped to its specialized structures',()=>{
 const nucleus=registry.structureEntry('sperm-cell','nucleus',{});
 assert.match(nucleus[3],/单倍体/);
 const mitochondria=registry.structureEntry('sperm-cell','mitochondria',{});
 assert.match(mitochondria[3],/中段/);
 const acrosome=registry.structureEntry('sperm-cell','acrosome',{});
 assert.match(acrosome[3],/受精/);
 const flagellum=registry.structureEntry('sperm-cell','flagellum',{});
 assert.match(flagellum[5],/轴丝/);
});

test('Blender sperm model preserves all four selectable structures including the tail',()=>{
 const data=readFileSync(new URL('../public/sperm-cell.glb',import.meta.url));
 const gltf=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
 const keys=gltf.nodes.filter(n=>n.mesh!==undefined).map(n=>n.extras?.organelle);
 assert.deepEqual(keys.sort(),['acrosome','flagellum','mitochondria','nucleus']);
 const tail=gltf.nodes.find(n=>n.extras?.organelle==='flagellum');
 const a=gltf.accessors[gltf.meshes[tail.mesh].primitives[0].attributes.POSITION];
 assert.ok(a.max[0]-a.min[0]>7,'tail curve must export as a complete mesh');
 assert.ok(!gltf.cameras?.length);
});
