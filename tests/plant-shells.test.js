import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('plant view shells are closed meshes with semantic outer layers',()=>{
 const data=readFileSync(new URL('../public/plant-shells.glb',import.meta.url));
 const size=data.readUInt32LE(12),g=JSON.parse(data.subarray(20,20+size)),bin=20+size+8;
 assert.deepEqual(g.nodes.filter(n=>n.mesh!==undefined).map(n=>n.extras.organelle).sort(),['membrane','wall']);
 for(const n of g.nodes.filter(n=>n.mesh!==undefined)){
  assert.equal(n.extras.wholeShell,true);
  for(const p of g.meshes[n.mesh].primitives){
   const pos=g.accessors[p.attributes.POSITION],pv=g.bufferViews[pos.bufferView];
   const ids=g.accessors[p.indices],iv=g.bufferViews[ids.bufferView],edges=new Map();
   const vertex=i=>[0,1,2].map(k=>data.readFloatLE(bin+(pv.byteOffset||0)+(pos.byteOffset||0)+i*(pv.byteStride||12)+4*k).toFixed(5)).join(',');
   const get=i=>{const o=bin+(iv.byteOffset||0)+(ids.byteOffset||0)+i*(ids.componentType===5123?2:4);return ids.componentType===5123?data.readUInt16LE(o):data.readUInt32LE(o);};
   for(let i=0;i<ids.count;i+=3){const v=[0,1,2].map(k=>vertex(get(i+k)));for(let k=0;k<3;k++){const key=[v[k],v[(k+1)%3]].sort().join('|');edges.set(key,(edges.get(key)||0)+1);}}
   assert.ok([...edges.values()].every(count=>count===2),'every geometric edge belongs to exactly two triangles');
  }
 }
});
