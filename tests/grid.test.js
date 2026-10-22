import test from 'node:test';
import assert from 'node:assert/strict';
import {MAP,CELL_SIZE,cellToWorld,worldToCell,footprint,occupiedCells,buildingCenter,roadStroke} from '../src/grid.js';
import {createWorld,place,move,remove,canPlace,placeRoad,canPlaceRoad,tick,validateWorld,stats,isConnected} from '../src/simulation.js';
const clone=w=>JSON.parse(JSON.stringify(w));
test('fine cells preserve original physical map and round trip every center',()=>{
 assert.equal(MAP.width,66);assert.equal(MAP.depth,48);assert.equal(CELL_SIZE,1/3);
 assert.equal(cellToWorld(1),0);assert.equal(cellToWorld(64),21);
 assert.equal(cellToWorld(0)-CELL_SIZE/2,-.5);
 for(let i=0;i<66;i++)assert.equal(worldToCell(cellToWorld(i)),i);
 assert.deepEqual(buildingCenter({type:'house',x:15,z:18,rotation:0}),{x:5,z:6});
});
test('rectangular helper rotates full footprint and custom road ownership reanchors',()=>{
 assert.deepEqual(footprint({type:'house',footprint:{width:2,depth:3}},1),{width:3,depth:2});
 const road={type:'road',x:4,z:6,rotation:1,cells:[{x:0,z:0},{x:1,z:0},{x:0,z:2}]};
 assert.deepEqual(footprint(road),{width:3,depth:2});
 assert.equal(new Set(occupiedCells(road).map(p=>`${p.x},${p.z}`)).size,3);
 assert.ok(occupiedCells(road).every(p=>p.x>=4&&p.x<=6&&p.z>=6&&p.z<=7));
});
test('full footprint rejects map/locked/coast collisions without mutation',()=>{
 const w=createWorld();const before=clone(w);
 for(const [type,x,z] of [['house',65,1],['house',40,1],['pier',3,44],['house',16,19]])assert.equal(place(w,type,x,z).ok,false);
 assert.deepEqual(w,before);assert.equal(canPlace(w,'house',39,1).ok,true);assert.equal(place(w,'pier',3,45).ok,true);
});
test('two-cell road L stroke covers joints, skips prior road ownership and is atomic',()=>{
 const w=createWorld();const cells=roadStroke({x:2,z:3},{x:6,z:6});
 assert.equal(cells.length,18);assert.ok(cells.some(p=>p.x===7&&p.z===7));
 const a=placeRoad(w,{x:2,z:3},{x:6,z:3});assert.ok(a.ok);assert.equal(a.building.roadWidth,2);assert.equal(occupiedCells(a.building).length,12);
 const b=placeRoad(w,{x:6,z:3},{x:6,z:6});assert.ok(b.ok);assert.equal(occupiedCells(b.building).length,6);
 assert.equal(new Set(w.buildings.flatMap(occupiedCells).map(p=>`${p.x},${p.z}`)).size,w.buildings.flatMap(occupiedCells).length);
 const snap=clone(w);assert.equal(canPlaceRoad(w,{x:10,z:18},{x:18,z:18}).ok,false);assert.equal(placeRoad(w,{x:10,z:18},{x:18,z:18}).ok,false);assert.deepEqual(w,snap);
 remove(w,a.building.id);assert.equal(occupiedCells(w.buildings.find(n=>n.id===b.building.id)).length,6);validateWorld(w);
});
test('moving a custom road preserves its ID and rotated shape with atomic rejection',()=>{
 const w=createWorld(),r=placeRoad(w,{x:2,z:3},{x:6,z:6}).building;const count=occupiedCells(r).length;const id=r.id;
 assert.ok(move(w,id,25,1,1).ok);assert.equal(r.id,id);assert.equal(occupiedCells(r).length,count);
 const snap=clone(w);assert.equal(move(w,id,64,1,2).ok,false);assert.deepEqual(w,snap);validateWorld(w);
});
test('perimeter access and physical speed use canonical two-cell roads',()=>{
 const w=createWorld();assert.equal(w.version,2);assert.deepEqual(stats(w),{population:4,housed:4,connected:4,capacity:4,waiting:0});
 const cafe=place(w,'cafe',12,23).building;assert.ok(cafe);assert.equal(isConnected(w,cafe),true);
 for(let i=0;i<100;i++){tick(w,.1);validateWorld(clone(w));}
 const n=w.residents.find(n=>n.activity==='walking'&&n.route.length>3);assert.ok(n);
 const p={x:n.x,z:n.z};tick(w,.01);assert.ok(Math.abs(Math.abs(n.x-p.x)+Math.abs(n.z-p.z)-.0075)<1e-7);
});
test('validator rejects malformed custom shape, overlap and forged footprints',()=>{
 const base=createWorld();for(const change of [w=>w.buildings[0].footprint={width:1,depth:1},w=>{w.buildings.find(b=>b.type==='road').cells=[{x:0,z:0},{x:0,z:0}];},w=>{w.buildings[0].x=41;},w=>{const r=w.buildings.find(b=>b.type==='road');r.cells=[{x:0,z:0},{x:100,z:0}];},w=>{w.buildings[0].cells=[{x:0,z:0}];}]){const w=clone(base);change(w);assert.throws(()=>validateWorld(w));}
});
test('route waypoints must be actual fine-cell centers rather than rounded impostors',()=>{
 const w=createWorld();tick(w,1);const n=w.residents.find(n=>n.route.length);assert.ok(n);
 n.route[0].x+=.001;assert.throws(()=>validateWorld(w));
});
test('new compact seed survives extended life and mixed road edits with the same resident ledger',()=>{
 const w=createWorld(), ids=w.residents.map(n=>n.id), homes=w.residents.map(n=>n.homeId);
 assert.ok(place(w,'cafe',12,23).ok);assert.ok(place(w,'bench',23,23).ok);
 for(let i=0;i<120;i++){tick(w,.37);if(i%10===0)validateWorld(clone(w));}
 assert.deepEqual(w.residents.map(n=>n.id),ids);assert.deepEqual(w.residents.map(n=>n.homeId),homes);
 const stamp=placeRoad(w,{x:27,z:22},{x:31,z:28});assert.ok(stamp.ok);validateWorld(w);
 remove(w,stamp.building.id);validateWorld(w);
 assert.ok(w.residents.some(n=>n.memories.some(m=>m.kind==='visit')));
});
test('save validation rejects a destination offset within the same rounded road cell',()=>{
 const w=createWorld();tick(w,1);const n=w.residents.find(n=>n.targetBuildingId);assert.ok(n);
 n.route=[];n.activity='idle';n.targetX+=.001;assert.throws(()=>validateWorld(w));
});
