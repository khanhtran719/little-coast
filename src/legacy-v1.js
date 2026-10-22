// Frozen v1 validation only; old snapshots are checked before migration.
const MAP = Object.freeze({width:22,depth:16,regionStart:14,anchor:Object.freeze({x:0,z:7})});
const CATALOG = Object.freeze({
 house:{name:'Nhà ngư dân',description:'Thêm 2 chỗ ở. Có đường nối làng mới đón cư dân.',capacity:2},
 road:{name:'Đường dân sinh',description:'Nối công trình tới lối vào làng và tạo tuyến đi bộ.'},
 cafe:{name:'Quán nước',description:'Hai chỗ ghé nghỉ, gặp nhau khi có đường đi.',capacity:2},
 tree:{name:'Cây xanh',description:'Thay đổi cảnh quan; không cần đường, không tự tăng dân.'},
 bench:{name:'Ghế nghỉ',description:'Một chỗ nghỉ có lối tiếp cận. Trời mưa ít người ghé.',capacity:1},
 market:{name:'Chợ cá',description:'Tụ họp buổi sáng khi có bến cá cùng mạng đường.',capacity:2},
 pier:{name:'Bến cá',description:'Đặt sát bờ biển, tạo điểm dừng và nhịp thuyền.',capacity:2},
});
const DAY=1440, SPEED=.75, MAX_HISTORY=250;
const active=n=>!['departed','temporarilyAway'].includes(n.state);
const key=(x,z)=>`${x},${z}`;
const directions=[[1,0],[-1,0],[0,1],[0,-1]];
const own=(o,k)=>Object.hasOwn(o,k);
const validType=t=>typeof t==='string'&&own(CATALOG,t);
const result=(ok,message,building)=>({ok,message,...(building?{building}: {})});
const freshId=(w,prefix)=>`${prefix}-${w.nextId++}`;
const findBuilding=(w,b)=>typeof b==='string'?w.buildings.find(n=>n.id===b):b;
function graph(w){
 const roads=new Map(w.buildings.filter(b=>b.type==='road').map(b=>[key(b.x,b.z),b]));
 const connected=new Set();const pending=[MAP.anchor];
 for(let i=0;i<pending.length;i++){
  const p=pending[i],k=key(p.x,p.z);if(connected.has(k)||!roads.has(k))continue;
  connected.add(k);for(const [dx,dz] of directions)pending.push({x:p.x+dx,z:p.z+dz});
 }
 return {roads,connected};
}
const validRotation=r=>Number.isInteger(r)&&r>=0&&r<=3;
function supported(n,g){
 const fx=Math.floor(n.x),cx=Math.ceil(n.x),fz=Math.floor(n.z),cz=Math.ceil(n.z);
 return (Number.isInteger(n.x)&&g.roads.has(key(n.x,fz))&&g.roads.has(key(n.x,cz)))||(Number.isInteger(n.z)&&g.roads.has(key(fx,n.z))&&g.roads.has(key(cx,n.z)));
}
/** Validate imported snapshots before they become authoritative; never repairs untrusted state. */
function validateWorld(w){
 const fail=message=>{throw new Error(`Bản lưu không hợp lệ: ${message}`);};
 const plain=o=>o&&typeof o==='object'&&!Array.isArray(o)&&(Object.getPrototypeOf(o)===Object.prototype||Object.getPrototypeOf(o)===null);
 const finite=(n,min=0,max=Number.MAX_SAFE_INTEGER)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
 const integer=(n,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 const string=(s,max=500)=>typeof s==='string'&&s.length>0&&s.length<=max;
 const cell=(x,z)=>integer(x,0,MAP.width-1)&&integer(z,0,MAP.depth-1);
 const ids=new Set();let largest=0;
 const id=s=>{if(!string(s,100)||ids.has(s))fail('định danh trùng hoặc sai');ids.add(s);const match=/^(?:b|j|npc)-(\d+)$/.exec(s);if(match)largest=Math.max(largest,Number(match[1]));};
 if(!plain(w)||w.version!==1||!string(w.id,100)||!integer(w.revision)||!integer(w.nextId,1)||!finite(w.time,480)||!['living','slow','pause'].includes(w.mode)||!['sunny','cloudy','rain'].includes(w.weather)||typeof w.regionUnlocked!=='boolean'||typeof w.ambient!=='boolean'||!integer(w.lastDepartureDay,-1,Math.floor(w.time/DAY)))fail('thông tin thế giới');
 if((own(w,'lastReentryTime')&&!finite(w.lastReentryTime,480,w.time))||!finite(w.lastArrivalTime,480,w.time)||!integer(w.arrivalDay,0,Math.floor(w.time/DAY))||!integer(w.arrivalsToday,0,2)||typeof w.milestoneRoadUsed!=='boolean')fail('sổ lượt cư dân');
 if(!Array.isArray(w.buildings)||w.buildings.length>MAP.width*MAP.depth||!Array.isArray(w.residents)||w.residents.length>200||!Array.isArray(w.journal)||w.journal.length>MAX_HISTORY)fail('danh sách quá lớn hoặc sai');
 const occupied=new Set(),buildings=new Map();
 for(const b of w.buildings){
  if(!plain(b)||!validType(b.type)||!cell(b.x,b.z)||!validRotation(b.rotation)||!['seed','player'].includes(b.createdBy)||(!w.regionUnlocked&&b.x>=MAP.regionStart)||(b.type==='pier'&&b.z!==15))fail('công trình');
  id(b.id);const k=key(b.x,b.z);if(occupied.has(k))fail('công trình chồng nhau');occupied.add(k);buildings.set(b.id,b);
 }
 const g=graph(w),homeCount=new Map();
 for(const n of w.residents){
  if(!plain(n)||!string(n.name,100)||!['housed','waiting','atRisk','departureEligible','departed','temporarilyAway'].includes(n.state)||!finite(n.x,0,21)||!finite(n.z,0,15)||!cell(n.targetX,n.targetZ)||!['idle','walking','house','cafe','bench','market','pier'].includes(n.activity)||!finite(n.activityUntil)||!integer(n.journeyCount)||typeof n.named!=='boolean'||!finite(n.protectionTime,0,DAY)||!Array.isArray(n.route)||n.route.length>MAP.width*MAP.depth||!Array.isArray(n.memories)||n.memories.length>64)fail('cư dân');
  id(n.id);
  if(n.activity==='walking'&&!n.route.length)fail('đi bộ thiếu tuyến');
  if(['departureEligible','departed','temporarilyAway'].includes(n.state)&&n.protectionTime<DAY)fail('chưa hết bảo vệ');
  if(['atRisk','departureEligible','departed','temporarilyAway'].includes(n.state)&&w.time-n.waitingSince<3*DAY)fail('chưa đủ thời gian chờ');
  if(n.state==='housed'){if(buildings.get(n.homeId)?.type!=='house')fail('nhà tham chiếu bị mất');homeCount.set(n.homeId,(homeCount.get(n.homeId)||0)+1);if(homeCount.get(n.homeId)>2)fail('vượt sức chứa nhà');}
  else if(n.homeId!==null||!finite(n.waitingSince,480,w.time))fail('trạng thái chờ nhà');
  if(n.state==='temporarilyAway'&&(!n.named||!finite(n.awaySince,480,w.time)))fail('tạm vắng thiếu thời điểm hoặc danh tính');
  if(n.state==='departed'&&n.named)fail('nhân vật có tên bị xóa thường trú');
  if(!active(n)&&(n.route.length||n.targetBuildingId!==null))fail('cư dân vắng có hành trình');
  if(n.targetBuildingId!==null&&!buildings.has(n.targetBuildingId))fail('đích không tồn tại');
  if(!g.roads.size){if(n.route.length)fail('tuyến không có đường');}
  else if(!supported(n,g))fail('cư dân đứng ngoài đường');
  let p={x:n.x,z:n.z};
  for(const q of n.route){if(!plain(q)||!cell(q.x,q.z)||!g.roads.has(key(q.x,q.z))||Math.abs(q.x-p.x)+Math.abs(q.z-p.z)>1.0000001||(q.x!==p.x&&q.z!==p.z))fail('tuyến đi không hợp lệ');p=q;}
  if(n.route.length&&(n.activity!=='walking'||(!n.targetBuildingId&&n.route.length!==1)||p.x!==n.targetX||p.z!==n.targetZ))fail('đích tuyến đi');
  if(n.targetBuildingId){const b=buildings.get(n.targetBuildingId);if(Math.abs(b.x-n.targetX)+Math.abs(b.z-n.targetZ)!==1)fail('lối vào đích');}
  for(const m of n.memories){if(!plain(m)||!['road','visit','interaction'].includes(m.kind)||!string(m.text)||!finite(m.time,480,w.time)||(m.kind!=='interaction'&&(!string(m.buildingId,100)||!validType(m.type)||(buildings.has(m.buildingId)&&buildings.get(m.buildingId).type!==m.type))))fail('ký ức');}
 }
 for(const e of w.journal){if(!plain(e)||!string(e.text,1000)||!finite(e.time,480,w.time)||!string(e.kind,100))fail('nhật ký');id(e.id);}
 if(w.nextId<=largest)fail('bộ đếm định danh');
 // Reject non-JSON payloads, cycles and excessive nesting even in extension fields.
 const visited=new Set();let nodes=0;
 function json(value,depth=0){
  if(depth>20||++nodes>100000)fail('dữ liệu quá lớn');
  if(typeof value==='string'){if(value.length>10000)fail('văn bản quá dài');return;}
  if(value===null||typeof value==='boolean')return;
  if(typeof value==='number'){if(!Number.isFinite(value))fail('số không hữu hạn');return;}
  if(typeof value!=='object'||visited.has(value)||(!Array.isArray(value)&&!plain(value)))fail('không phải JSON');
  visited.add(value);for(const [k,v]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(k))fail('khóa không hợp lệ');json(v,depth+1);}visited.delete(value);
 }
 json(w);return w;
}

export { validateWorld as validateLegacyWorld };
