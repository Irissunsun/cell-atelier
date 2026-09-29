import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {specimens,structureEntry} from '../specimens.js';

test('Blender GLB preserves selectable prokaryotic structures and excludes studio objects',()=>{
 const data=readFileSync(new URL('../public/cyanobacterium.glb',import.meta.url));
 assert.equal(data.toString('utf8',0,4),'glTF');
 const gltf=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
 const nodes=gltf.nodes.filter(n=>n.mesh!==undefined),keys=new Set(nodes.map(n=>n.extras?.organelle));
 assert.deepEqual([...keys].sort(),[...specimens.cyanobacterium.keys].sort());
 for(const key of ['nucleus','chloroplast','mitochondria'])assert.ok(!keys.has(key));
 for(const key of keys)assert.equal(structureEntry('cyanobacterium',key,{})?.length,7);
 assert.ok(!gltf.cameras?.length,'studio camera must stay in Blender');
 assert.ok(!specimens.cyanobacterium.procedural,'webpage must load exported GLB');
 assert.match(structureEntry('cyanobacterium','wall',{})[3],/肽聚糖/);
 assert.match(structureEntry('cyanobacterium','thylakoids',{})[3],/不被叶绿体包裹/);
 for(const mesh of gltf.meshes)for(const primitive of mesh.primitives){
  const a=gltf.accessors[primitive.attributes.POSITION];
  assert.ok(a.min.every(Number.isFinite)&&a.max.every(Number.isFinite));
 }
});
