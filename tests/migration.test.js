import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {upgradeWorld} from '../src/migration.js';
import {validateWorld,tick,stats} from '../src/simulation.js';
import {occupiedCells,buildingCenter} from '../src/grid.js';
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/world-v1.json',import.meta.url),'utf8'));
const clone=w=>JSON.parse(JSON.stringify(w));
const distance=n=>n.route.reduce((a,p)=>({value:a.value+Math.abs(p.x-a.x)+Math.abs(p.z-a.z),...p}),{value:0,x:n.x,z:n.z}).value;
test('v1 import preserves physical buildings, owned road IDs, identities and ledger without ticking',()=>{
 const old=fixture();const snapshot=clone(old);const w=upgradeWorld(old);
 assert.notEqual(w,old);assert.deepEqual(old,snapshot);assert.equal(validateWorld(w),w);assert.equal(w.version,2);
 for(let i=0;i<old.buildings.length;i++){const a=old.buildings[i],b=w.buildings[i];assert.deepEqual(buildingCenter(b),{x:a.x,z:a.z});assert.equal(b.id,a.id);assert.equal(occupiedCells(b).length,9);if(a.type==='road')assert.equal(b.roadWidth,3);}
 assert.deepEqual(w.residents,old.residents);for(const k of ['time','revision','nextId','journal','regionUnlocked'])assert.deepEqual(w[k],old[k]);assert.deepEqual(stats(w),{population:4,housed:4,connected:4,capacity:4,waiting:0});
 assert.equal(upgradeWorld(w),w);
});
test('fractional legacy walking route is subdivided without changing motion, destination or memory',()=>{
 const old=fixture(),n=old.residents[0];Object.assign(n,{x:5.75,z:7,route:[{x:6,z:7},{x:7,z:7},{x:8,z:7}],targetX:8,targetZ:7,targetBuildingId:old.buildings[1].id,activity:'walking'});
 n.memories.push({kind:'road',buildingId:old.buildings.find(b=>b.type==='road').id,type:'road',text:'Lối cũ.',time:480});
 const w=upgradeWorld(old),m=w.residents[0];assert.equal(m.x,5.75);assert.equal(m.z,7);assert.equal(m.homeId,n.homeId);assert.deepEqual(m.memories,n.memories);assert.equal(distance(m),distance(n));assert.ok(m.route.length>n.route.length);
 tick(w,.1);assert.ok(Math.abs(m.x-5.825)<1e-9);validateWorld(w);
});
test('legacy validation runs before conversion and rejects old collisions or forged extension shapes',()=>{
 for(const change of [w=>w.buildings[1].x=w.buildings[0].x,w=>w.residents[0].x=100,w=>w.version=3,w=>w.buildings[0].rotation=4]){const old=fixture();change(old);assert.throws(()=>upgradeWorld(old));}
 const old=fixture();old.buildings[0].cells=[{x:0,z:0}];const w=upgradeWorld(old);assert.equal(occupiedCells(w.buildings[0]).length,9);assert.equal(w.buildings[0].cells,undefined);
});
test('legacy road-recovery segment without a destination migrates without teleport or lost distance',()=>{
 const old=fixture(),n=old.residents[0];Object.assign(n,{x:5.1,z:7,route:[{x:6,z:7}],targetX:6,targetZ:7,targetBuildingId:null,activity:'walking'});
 const w=upgradeWorld(old),m=w.residents[0];assert.equal(m.x,5.1);assert.ok(Math.abs(distance(m)-.9)<1e-9);tick(w,.1);assert.ok(Math.abs(m.x-5.175)<1e-9);validateWorld(w);
});
test('legitimate zero-distance legacy walking endpoint remains a loadable paused pose',()=>{
 const old=fixture(),n=old.residents[0];old.mode='pause';Object.assign(n,{x:5,z:7,route:[{x:5,z:7}],targetX:5,targetZ:7,targetBuildingId:old.buildings[0].id,activity:'walking'});
 const w=upgradeWorld(old);assert.deepEqual(w.residents[0],n);assert.equal(w.mode,'pause');validateWorld(w);
});
