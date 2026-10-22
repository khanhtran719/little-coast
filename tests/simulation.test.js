import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld, stats, place, move, remove, canPlace, tick, setMode, setWeather, getDialogue, unlockRegion, validateWorld, MAP, CATALOG} from '../src/simulation.js';

const clone = w => JSON.parse(JSON.stringify(w));
const run = (w, seconds) => { for(let i=0;i<seconds;i++) tick(w,1); };

test('seed has four distinct housed people, truthful history and canonical map', () => {
 const w=createWorld(); assert.equal(validateWorld(clone(w)).version,1);
 assert.deepEqual(stats(w),{population:4,housed:4,connected:4,capacity:4,waiting:0});
 assert.ok(w.residents.some(n=>n.id==='hai')); assert.equal(w.time,480); assert.equal(MAP.width,22);
 assert.equal(Object.keys(CATALOG).length,7); assert.doesNotMatch(w.journal.map(e=>e.text).join(' '),/bạn vừa xây/i);
});
test('placing a house adds capacity but never people, and rejects invalid footprints atomically',()=>{
 const w=createWorld(); assert.ok(place(w,'house',3,6).ok); assert.equal(stats(w).population,4); assert.equal(stats(w).capacity,6);
 const before=clone(w); for(const args of [['road',3,6],['pier',3,5],['tree',14,3],['bogus',2,3],['road',NaN,2],['road',1.2,2]]) assert.equal(place(w,...args).ok,false);
 assert.deepEqual(w,before); assert.equal(canPlace(w,'tree',13,3).ok,true); assert.deepEqual(w,before);
});
test('isolated roads do not become anchors and road cuts do not evict',()=>{
 const w=createWorld(); place(w,'house',3,4);place(w,'road',3,5); run(w,1441); assert.equal(stats(w).population,4);
 const road=w.buildings.find(b=>b.type==='road'&&b.x===2&&b.z===7); remove(w,road.id);
 assert.equal(stats(w).housed,4); assert.equal(stats(w).connected,0); assert.equal(stats(w).waiting,0);
});
test('move preserves identity, occupants and history; deleting a house softly relocates',()=>{
 const w=createWorld(); const house=w.buildings.find(b=>b.type==='house'); const ids=w.residents.filter(n=>n.homeId===house.id).map(n=>n.id);
 assert.ok(move(w,house.id,3,6).ok); assert.deepEqual(w.residents.filter(n=>n.homeId===house.id).map(n=>n.id),ids);
 assert.ok(remove(w,house.id).ok); assert.equal(stats(w).population,4); assert.equal(stats(w).waiting,2);
 place(w,'house',4,6); tick(w,1); assert.equal(stats(w).waiting,0); assert.equal(stats(w).population,4);
});
test('single clock freezes hidden/pause, slows predictably, and pause prohibits weather changes',()=>{
 const w=createWorld(); tick(w,4); assert.equal(w.time,484);setMode(w,'slow');tick(w,4);assert.equal(w.time,485);
 const hidden=clone(w);tick(w,20000,false);assert.deepEqual(w,hidden);
 setMode(w,'pause');const frozen=clone(w);tick(w,1000);assert.equal(setWeather(w,'rain').ok,false);assert.deepEqual(w,frozen);
 assert.equal(setMode(w,'bad').ok,false);setMode(w,'living');assert.ok(setWeather(w,'rain').ok);assert.equal(w.weather,'rain');
});
test('first arrival needs a full day, connected vacancy, and daily budget survives round trip',()=>{
 const w=createWorld();place(w,'house',3,6);place(w,'house',4,6);place(w,'house',6,6);
 run(w,1439);assert.equal(stats(w).population,4);run(w,1);assert.equal(stats(w).population,5);
 run(w,720);assert.equal(stats(w).population,6);const saved=validateWorld(clone(w));run(saved,500);assert.equal(stats(saved).population,6);
 run(saved,1440);assert.ok(stats(saved).population<=8);
});
test('waiting residents have first claim over arrivals',()=>{
 const w=createWorld();remove(w,w.buildings.find(b=>b.type==='house').id);run(w,1500);place(w,'house',4,6);tick(w,1);
 assert.equal(stats(w).waiting,0);assert.equal(stats(w).population,4);
});
test('residents walk contiguous actual roads, use cafes/benches/pier and remember actual experiences',()=>{
 const w=createWorld();place(w,'cafe',4,8);place(w,'bench',7,8);const seen=new Set();const starts=w.residents.map(n=>[n.x,n.z]);
 for(let i=0;i<240;i++){tick(w,1);for(const n of w.residents){seen.add(n.activity);const roads=w.buildings.filter(b=>b.type==='road');assert.ok(roads.some(b=>Math.abs(n.x-b.x)<0.00001&&Math.abs(n.z-b.z)<=1)||roads.some(b=>Math.abs(n.z-b.z)<0.00001&&Math.abs(n.x-b.x)<=1));}}
 assert.ok(w.residents.some((n,i)=>n.x!==starts[i][0]||n.z!==starts[i][1]));
 assert.ok(seen.has('cafe'));assert.ok(seen.has('bench'));assert.ok(seen.has('pier'));
 assert.ok(w.residents.some(n=>n.memories.some(m=>m.kind==='visit')));assert.equal(validateWorld(clone(w)).version,1);
});
test('dialogue does not claim unseen construction, preserves factual memories after removal',()=>{
 const w=createWorld();const before=stats(w);assert.doesNotMatch(getDialogue(w,'hai'),/vừa ghé|vừa đi qua/);
 place(w,'cafe',4,8);run(w,180);const visitor=w.residents.find(n=>n.memories.some(m=>m.kind==='visit'&&m.type==='cafe'));assert.ok(visitor);
 const cafe=w.buildings.find(b=>b.type==='cafe');remove(w,cafe.id);assert.match(getDialogue(w,visitor.id),/trước|từng/);assert.deepEqual(stats(w),before);
 const text=getDialogue(w,'missing');assert.equal(typeof text,'string');assert.equal(validateWorld(clone(w)).version,1);
});
test('new road memory occurs only on traversal, once as a city milestone',()=>{
 const w=createWorld();place(w,'road',12,8);place(w,'cafe',13,8);const road=w.buildings.find(b=>b.x===12&&b.z===8);
 assert.equal(w.milestoneRoadUsed,false);run(w,200);assert.ok(w.residents.some(n=>n.memories.some(m=>m.kind==='road'&&m.buildingId===road.id)));
 assert.equal(w.journal.filter(e=>e.kind==='first-road-use').length,1);const copy=clone(w);run(copy,100);assert.equal(copy.journal.filter(e=>e.kind==='first-road-use').length,1);
});
test('experimental region gate requires six connected people plus accessible cafe and bench',()=>{
 const w=createWorld();assert.equal(unlockRegion(w).ok,false);place(w,'house',3,6);place(w,'cafe',4,8);place(w,'bench',7,8);run(w,2160);
 assert.equal(stats(w).population,6);assert.ok(unlockRegion(w).ok);assert.ok(place(w,'tree',14,2).ok);assert.equal(validateWorld(clone(w)).version,1);
});
test('untrusted saves reject malformed IDs, collisions, numbers, references, and population accounting',()=>{
 const valid=createWorld();
 const corruptions=[w=>w.version=2,w=>w.buildings.push({...w.buildings[0]}),w=>w.buildings[0].x=Infinity,w=>w.buildings[0].x=1.5,w=>w.buildings[0].type='toString',w=>w.buildings[0].rotation=NaN,w=>w.buildings[1].id=w.residents[0].id,w=>w.residents[0].homeId='missing',w=>w.residents[0].x=NaN,w=>w.residents[0].state='evil',w=>w.residents[0].route=[{x:9,z:3}],w=>w.residents.push({...w.residents[0],id:'unique'}),w=>w.time=-1,w=>w.mode='bad',w=>w.weather='bad',w=>w.arrivalsToday=20,w=>w.nextId=1,w=>w.journal[0].text={},w=>w.regionUnlocked='yes',w=>w.residents[0].targetBuildingId='missing'];
 for(const corrupt of corruptions){const w=clone(valid);corrupt(w);assert.throws(()=>validateWorld(w));}
 assert.throws(()=>validateWorld(null));assert.throws(()=>validateWorld([]));
});
test('road removal cancels invalid routes and save remains valid',()=>{
 const w=createWorld();run(w,5);for(const b of [...w.buildings].filter(b=>b.type==='road'&&b.x===7))remove(w,b.id);
 run(w,10);assert.equal(stats(w).population,4);assert.equal(validateWorld(clone(w)).version,1);
});

test('Ambient protects At Risk residents; Building protection accumulates one day before bounded departures', async()=>{
 const {setAmbient}=await import('../src/simulation.js');
 const w=createWorld();for(const home of [...w.buildings].filter(b=>b.type==='house'))remove(w,home.id);
 assert.equal(typeof setAmbient,'function');setAmbient(w,true);run(w,3*1440);assert.ok(w.residents.every(n=>n.state==='atRisk'));assert.equal(stats(w).population,4);
 run(w,2*1440);assert.equal(stats(w).population,4);assert.ok(w.residents.every(n=>n.protectionTime===0));
 setAmbient(w,false);run(w,720);setAmbient(w,true);run(w,500);setAmbient(w,false);run(w,719);assert.equal(stats(w).population,4);run(w,1);
 assert.equal(stats(w).population,2);assert.equal(w.residents.find(n=>n.id==='hai').state,'temporarilyAway');
 assert.equal(validateWorld(clone(w)).version,1);run(w,10);assert.equal(stats(w).population,2);
});
test('all surviving road edits leave a valid ledger and NPC routes',()=>{
 const w=createWorld();tick(w,.3);for(const b of [...w.buildings].filter(b=>b.type==='road')){remove(w,b.id);validateWorld(clone(w));tick(w,.2);validateWorld(clone(w));}
 assert.equal(stats(w).population,4);
});
test('fractional motion and repeated deterministic inputs survive save validation',()=>{
 const a=createWorld(),b=createWorld();for(const w of [a,b]){place(w,'cafe',4,8);place(w,'bench',7,8);}
 for(let i=0;i<500;i++){tick(a,.016);tick(b,.016);if(i%37===0)validateWorld(clone(a));}
 assert.deepEqual(a,b);
});
test('save rejects walking without a route, impossible lifecycle, and contradictory memories',()=>{
 for(const change of [w=>w.residents[0].activity='walking',w=>w.residents[0].state='departureEligible',w=>w.residents[0].memories.push({kind:'visit',buildingId:w.buildings[0].id,type:'cafe',text:'fake',time:480})]){
  const w=createWorld();change(w);assert.throws(()=>validateWorld(w));
 }
});
test('first conversation respects bounded memory storage and invalid command IDs are atomic',()=>{
 const w=createWorld(),n=w.residents[0];n.memories=Array.from({length:64},(_,i)=>({kind:'road',buildingId:`old-${i}`,type:'road',text:'Một con đường cũ.',time:480}));
 validateWorld(clone(w));getDialogue(w,n.id);assert.equal(n.memories.length,64);validateWorld(clone(w));
 const before=clone(w);assert.equal(remove(w,{id:'bad',type:'evil'}).ok,false);assert.equal(move(w,{id:'bad',type:'evil'},2,2).ok,false);assert.deepEqual(w,before);
});
test('routine editing does not spam event-driven journal and pier copy hides grid implementation',()=>{
 const w=createWorld();const initial=w.journal.length;
 for(let x=0;x<10;x++)place(w,'tree',x,1);
 const tree=w.buildings.find(b=>b.type==='tree');move(w,tree.id,0,2);remove(w,tree.id);
 assert.equal(w.journal.length,initial);assert.doesNotMatch(canPlace(w,'pier',1,2).message,/hàng|15/);
});
test('unrelated tree edits preserve fractional walkers and their routes exactly',()=>{
 const w=createWorld();place(w,'tree',0,0);tick(w,1);tick(w,.4);const before=clone(w).residents;
 assert.ok(before.some(n=>!Number.isInteger(n.x)||!Number.isInteger(n.z)));
 const tree=w.buildings.find(b=>b.type==='tree');move(w,tree.id,1,0);assert.deepEqual(w.residents,before);remove(w,tree.id);assert.deepEqual(w.residents,before);validateWorld(clone(w));
});
test('removing a walking destination preserves supported fractional location then safely replans',()=>{
 const w=createWorld();place(w,'cafe',4,8);run(w,4);tick(w,.4);
 const cafe=w.buildings.find(b=>b.type==='cafe');const walker=w.residents.find(n=>n.targetBuildingId===cafe.id&&(!Number.isInteger(n.x)||!Number.isInteger(n.z)));assert.ok(walker);
 const pos={x:walker.x,z:walker.z};remove(w,cafe.id);assert.equal(walker.x,pos.x);assert.equal(walker.z,pos.z);validateWorld(clone(w));run(w,5);validateWorld(clone(w));
});
test('Bác Hải uses bác/cháu voice with factual first-person memories',()=>{
 const w=createWorld();assert.match(getDialogue(w,'hai'),/Bác.*cháu|bác.*cháu/);assert.doesNotMatch(getDialogue(w,'hai'),/Tôi/);
 place(w,'cafe',4,8);run(w,180);const text=getDialogue(w,'hai');assert.match(text,/bác/i);assert.doesNotMatch(text,/Tôi|ồn quá|đỡ phải vòng/);
});
test('Named temporary absence preserves identity and returns once after separate cooldown before new arrivals',()=>{
 const w=createWorld();getDialogue(w,'hai');const hai=w.residents.find(n=>n.id==='hai');const memories=clone(w).residents.find(n=>n.id==='hai').memories;
 remove(w,hai.homeId);run(w,4*1440);assert.equal(hai.state,'temporarilyAway');assert.equal(stats(w).population,2);assert.deepEqual(hai.memories.filter(m=>m.kind==='interaction'),memories);
 place(w,'house',3,6);place(w,'house',4,6);tick(w,1);assert.equal(hai.state,'temporarilyAway');assert.equal(stats(w).population,3); // New arrival may use vacancy before return is eligible.
 setMode(w,'pause');const frozen=clone(w);tick(w,86400);assert.deepEqual(w,frozen);setMode(w,'living');
 const copy=validateWorld(clone(w));run(copy,1439);const returned=copy.residents.find(n=>n.id==='hai');assert.equal(returned.state,'housed');assert.equal(returned.id,'hai');assert.deepEqual(returned.memories.filter(m=>m.kind==='interaction'),memories.filter(m=>m.kind==='interaction'));
 assert.equal(copy.journal.filter(e=>e.kind==='reentry').length,1);const again=validateWorld(clone(copy));run(again,100);assert.equal(again.journal.filter(e=>e.kind==='reentry').length,1);
});
test('replacing the complete road network restores valid NPC support before saving',()=>{
 const w=createWorld();run(w,2);for(const road of [...w.buildings].filter(b=>b.type==='road'))remove(w,road.id);
 assert.ok(place(w,'road',0,0).ok);assert.equal(validateWorld(clone(w)).version,1);assert.equal(stats(w).population,4);
});
test('earlier legitimate schema1 saves omit the added reentry ledger and remain loadable without reset',()=>{
 const w=createWorld();delete w.lastReentryTime;const before=clone(w);assert.equal(validateWorld(w),w);assert.deepEqual(w,before);
 tick(w,1);assert.equal(validateWorld(clone(w)).version,1);assert.equal(w.time,481);assert.equal(stats(w).population,4);
 const corrupt=clone(w);corrupt.lastReentryTime=null;assert.throws(()=>validateWorld(corrupt));
});
