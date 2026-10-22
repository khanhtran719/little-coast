/** Deterministic, serializable world model. All coordinates use the same x/z grid as rendering. */
export const MAP = Object.freeze({width:22,depth:16,regionStart:14,anchor:Object.freeze({x:0,z:7})});
export const CATALOG = Object.freeze({
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
function journal(w,text,kind='event'){
 w.journal.push({id:freshId(w,'j'),text,time:w.time,kind});
 if(w.journal.length>MAX_HISTORY)w.journal.shift();
}
function graph(w){
 const roads=new Map(w.buildings.filter(b=>b.type==='road').map(b=>[key(b.x,b.z),b]));
 const connected=new Set();const pending=[MAP.anchor];
 for(let i=0;i<pending.length;i++){
  const p=pending[i],k=key(p.x,p.z);if(connected.has(k)||!roads.has(k))continue;
  connected.add(k);for(const [dx,dz] of directions)pending.push({x:p.x+dx,z:p.z+dz});
 }
 return {roads,connected};
}
function adjacentRoads(b,g,connectedOnly=true){return directions.map(([dx,dz])=>g.roads.get(key(b.x+dx,b.z+dz))).filter(r=>r&&(!connectedOnly||g.connected.has(key(r.x,r.z))));}
export function isConnected(w,building){
 const b=findBuilding(w,building);if(!b)return false;const g=graph(w);
 return b.type==='road'?g.connected.has(key(b.x,b.z)):adjacentRoads(b,g).length>0;
}
export function stats(w){
 const g=graph(w),houses=w.buildings.filter(b=>b.type==='house'),houseMap=new Map(houses.map(b=>[b.id,b]));
 const housed=w.residents.filter(n=>n.state==='housed'&&houseMap.has(n.homeId));
 return {population:w.residents.filter(active).length,housed:housed.length,connected:housed.filter(n=>adjacentRoads(houseMap.get(n.homeId),g).length).length,capacity:houses.length*2,waiting:w.residents.filter(active).length-housed.length};
}
export function buildingStatus(w,building){
 const b=findBuilding(w,building);if(!b)return {connected:false,ready:false,occupancy:0,label:'Không còn công trình'};
 const connected=isConnected(w,b);let ready=b.type==='tree'||connected;
 let label=b.type==='tree'?'Cảnh quan':connected?'Sẵn sàng — chưa có người dùng':'Chưa có đường nối lối vào làng';
 const occupancy=b.type==='house'?w.residents.filter(n=>n.homeId===b.id).length:w.residents.filter(n=>n.targetBuildingId===b.id&&n.activity===b.type).length;
 if(b.type==='bench'&&w.weather==='rain'){ready=false;label='Trời mưa — tạm nghỉ ngoài trời';}
 if(b.type==='market'&&ready){
  if(!w.buildings.some(n=>n.type==='pier'&&isConnected(w,n))){ready=false;label='Chưa có hoạt động bến cá kết nối';}
  else if(w.time%DAY<360||w.time%DAY>=720){ready=false;label='Ngoài giờ chợ (06:00–12:00)';}
 }
 if(occupancy&&ready)label=b.type==='house'?`${occupancy}/2 cư dân`:`Đang có ${occupancy} người ghé`;
 if(b.type==='road'&&connected)label='Đường nối lối vào làng';
 return {connected,ready,occupancy,label};
}
function makeResident(w,id,name,home,index){
 const road=adjacentRoads(home,graph(w))[0]||MAP.anchor;
 return {id,name,homeId:home.id,state:'housed',x:road.x,z:road.z,targetX:road.x,targetZ:road.z,activity:'idle',route:[],targetBuildingId:null,activityUntil:w.time+index*2,journeyCount:index,memories:[],named:id==='hai',protectionTime:0};
}
export function createWorld(){
 const w={version:1,id:'little-coast-local',revision:0,nextId:1,time:480,mode:'living',weather:'sunny',buildings:[],residents:[],journal:[],regionUnlocked:false,lastArrivalTime:480,arrivalDay:0,arrivalsToday:0,milestoneRoadUsed:false,ambient:false,lastDepartureDay:-1,lastReentryTime:480};
 const seed=(type,x,z)=>{const b={id:freshId(w,'b'),type,x,z,rotation:0,createdBy:'seed'};w.buildings.push(b);return b;};
 const homes=[seed('house',5,6),seed('house',8,6)];
 for(let x=0;x<=12;x++)seed('road',x,7);
 for(let z=8;z<=14;z++)seed('road',11,z);
 seed('pier',11,15);seed('market',12,11);
 w.residents=[makeResident(w,'hai','Bác Hải',homes[0],0),makeResident(w,'lan','Cô Lan',homes[0],1),makeResident(w,'minh','Anh Minh',homes[1],2),makeResident(w,'an','Chị An',homes[1],3)];
 journal(w,'Làng Chài bắt đầu một buổi sáng với bốn cư dân và bến cá đã có từ trước.','seed');
 return w;
}
export function canPlace(w,type,x,z,ignoreId=null){
 if(!validType(type))return result(false,'Loại công trình không hợp lệ.');
 if(!Number.isInteger(x)||!Number.isInteger(z)||x<0||x>=MAP.width||z<0||z>=MAP.depth)return result(false,'Chọn một ô đất trong bản đồ.');
 if(!w.regionUnlocked&&x>=MAP.regionStart)return result(false,'Xóm Biển chưa mở.');
 if(type==='pier'&&z!==MAP.depth-1)return result(false,'Bến cá cần đặt sát bờ biển.');
 if(w.buildings.some(b=>b.id!==ignoreId&&b.x===x&&b.z===z))return result(false,'Ô đất này đã có công trình.');
 return result(true,'Có thể đặt.');
}
const validRotation=r=>Number.isInteger(r)&&r>=0&&r<=3;
function supported(n,g){
 const fx=Math.floor(n.x),cx=Math.ceil(n.x),fz=Math.floor(n.z),cz=Math.ceil(n.z);
 return (Number.isInteger(n.x)&&g.roads.has(key(n.x,fz))&&g.roads.has(key(n.x,cz)))||(Number.isInteger(n.z)&&g.roads.has(key(fx,n.z))&&g.roads.has(key(cx,n.z)));
}
function resetTravel(w){
 const g=graph(w),roads=[...g.roads.values()];
 for(const n of w.residents){
  let shifted=false;
  if(!supported(n,g)&&roads.length){
   const nearest=roads.reduce((best,b)=>!best||Math.hypot(n.x-b.x,n.z-b.z)<Math.hypot(n.x-best.x,n.z-best.z)?b:best,null);
   n.x=nearest.x;n.z=nearest.z;shifted=true;
  }
  const destination=findBuilding(w,n.targetBuildingId);
  const routeValid=n.route.every(p=>g.roads.has(key(p.x,p.z))&&g.connected.has(key(p.x,p.z)));
  const destinationValid=!n.targetBuildingId||(destination&&Math.abs(destination.x-n.targetX)+Math.abs(destination.z-n.targetZ)===1&&isConnected(w,destination));
  if(!shifted&&routeValid&&destinationValid)continue;
  const between=!Number.isInteger(n.x)||!Number.isInteger(n.z);
  // If the current road segment still exists, finish only that segment before replanning.
  const endpoint=between&&supported(n,g)?roads.filter(r=>(r.x===n.x||r.z===n.z)&&Math.abs(n.x-r.x)+Math.abs(n.z-r.z)<1).sort((a,b)=>Math.hypot(n.x-a.x,n.z-a.z)-Math.hypot(n.x-b.x,n.z-b.z))[0]:null;
  n.route=endpoint?[{x:endpoint.x,z:endpoint.z}]:[];n.targetBuildingId=null;
  n.targetX=endpoint?endpoint.x:Math.round(n.x);n.targetZ=endpoint?endpoint.z:Math.round(n.z);
  n.activity=endpoint?'walking':'idle';n.activityUntil=w.time;
 }
}
export function place(w,type,x,z,rotation=0){
 const check=canPlace(w,type,x,z);if(!check.ok)return check;if(!validRotation(rotation))return result(false,'Góc xoay không hợp lệ.');
 const building={id:freshId(w,'b'),type,x,z,rotation,createdBy:'player'};w.buildings.push(building);if(type==='road')resetTravel(w);w.revision++;
 return result(true,`${CATALOG[type].name} đã đặt. ${buildingStatus(w,building).label}.`,building);
}
export function move(w,id,x,z,rotation=0){
 const building=typeof id==='string'?findBuilding(w,id):null;if(!building)return result(false,'Không tìm thấy công trình.');
 const check=canPlace(w,building.type,x,z,id);if(!check.ok)return check;if(!validRotation(rotation))return result(false,'Góc xoay không hợp lệ.');
 if(building.x===x&&building.z===z&&building.rotation===rotation)return result(true,'Công trình vẫn ở vị trí cũ.',building);
 Object.assign(building,{x,z,rotation});resetTravel(w);w.revision++;
 return result(true,'Đã chuyển; giữ nguyên công trình và cư dân.',building);
}
export function remove(w,id){
 const building=typeof id==='string'?findBuilding(w,id):null;if(!building)return result(false,'Không tìm thấy công trình.');
 w.buildings=w.buildings.filter(b=>b.id!==id);
 const displaced=w.residents.filter(n=>n.homeId===id).length;
 for(const n of w.residents)if(n.homeId===id){n.homeId=null;n.state='waiting';n.waitingSince=w.time;n.protectionTime=0;}
 resetTravel(w);w.revision++;if(displaced)journal(w,`${displaced} cư dân vẫn ở trong làng, chờ chỗ ở mới sau khi nhà được dỡ.`,'relocation-wait');
 return result(true,building.type==='house'?'Đã dỡ nhà; cư dân được giữ lại, chờ chỗ ở hợp lệ.':'Đã dỡ công trình.',building);
}
export function setMode(w,mode){
 if(!['living','slow','pause'].includes(mode))return result(false,'Chế độ không hợp lệ.');
 if(w.mode!==mode){w.mode=mode;w.revision++;}return result(true,mode==='pause'?'Ngắm cảnh: thế giới tạm dừng.':mode==='slow'?'Nhịp chậm ¼ tốc độ.':'Nhịp sống bình thường.');
}
export function setAmbient(w,ambient){
 if(typeof ambient!=='boolean')return result(false,'Chế độ ngắm làng không hợp lệ.');
 if(w.ambient!==ambient){w.ambient=ambient;w.revision++;}
 return result(true,ambient?'Ngắm làng: cư dân thiếu nhà được bảo vệ khỏi rời làng.':'Xây dựng: bộ đếm bảo vệ cư dân tiếp tục.');
}
export function setWeather(w,weather){
 if(!['sunny','cloudy','rain'].includes(weather))return result(false,'Thời tiết không hợp lệ.');
 if(w.mode==='pause')return result(false,'Tiếp tục thời gian trước khi đổi thời tiết.');
 if(w.weather!==weather){w.weather=weather;w.revision++;}return result(true,'Đã đổi thời tiết.');
}
function vacancies(w,g){return w.buildings.filter(b=>b.type==='house'&&adjacentRoads(b,g).length&&w.residents.filter(n=>n.homeId===b.id).length<2);}
function allocate(w){
 const g=graph(w);let housedSomeone=false;
 const waiting=w.residents.filter(n=>active(n)&&n.state!=='housed').sort((a,b)=>(['atRisk','departureEligible'].includes(a.state)?0:1)-(['atRisk','departureEligible'].includes(b.state)?0:1)||(a.waitingSince-b.waitingSince));
 for(const n of waiting){const house=vacancies(w,g)[0];if(!house)break;n.homeId=house.id;n.state='housed';delete n.waitingSince;housedSomeone=true;}
 if(housedSomeone){journal(w,'Cư dân đang chờ đã nhận được chỗ ở mới có đường nối làng.','relocation');return;}
 const returning=w.residents.find(n=>n.state==='temporarilyAway'&&w.time-n.awaySince>=DAY&&w.time-(w.lastReentryTime??480)>=DAY);
 const returnHome=returning&&vacancies(w,g)[0];
 if(returnHome){
  returning.homeId=returnHome.id;returning.state='housed';returning.protectionTime=0;delete returning.waitingSince;delete returning.awaySince;
  const entry=adjacentRoads(returnHome,g)[0];Object.assign(returning,{x:entry.x,z:entry.z,targetX:entry.x,targetZ:entry.z,route:[],targetBuildingId:null,activity:'idle',activityUntil:w.time+8});
  w.lastReentryTime=w.time;journal(w,`${returning.name} trở về làng, nhận chỗ ở có kết nối; những kỷ niệm cũ vẫn được giữ.`,'reentry');return;
 }

 const day=Math.floor(w.time/DAY);if(w.arrivalDay!==day){w.arrivalDay=day;w.arrivalsToday=0;}
 if(w.residents.some(n=>active(n)&&n.state!=='housed')||w.time-480<DAY||w.time-w.lastArrivalTime<720||w.arrivalsToday>=2||w.residents.length>=200)return;
 const house=vacancies(w,g)[0];if(!house)return;
 const id=freshId(w,'npc'),number=w.residents.length-3;w.residents.push(makeResident(w,id,`Cư dân mới ${number}`,house,w.residents.length));
 w.lastArrivalTime=w.time;w.arrivalsToday++;journal(w,'Một cư dân mới chuyển đến nhà trống có đường nối làng.','arrival');
}
function routeBetween(g,start,end){
 const startKey=key(start.x,start.z),endKey=key(end.x,end.z);if(!g.roads.has(startKey)||!g.roads.has(endKey))return null;
 const queue=[start],parents=new Map([[startKey,null]]);let found=false;
 for(let i=0;i<queue.length;i++){const p=queue[i],k=key(p.x,p.z);if(k===endKey){found=true;break;}
  for(const [dx,dz]of directions){const q={x:p.x+dx,z:p.z+dz},qk=key(q.x,q.z);if(g.connected.has(qk)&&!parents.has(qk)){parents.set(qk,p);queue.push(q);}}
 }
 if(!found)return null;const path=[];let p=end;while(key(p.x,p.z)!==startKey){path.unshift({x:p.x,z:p.z});p=parents.get(key(p.x,p.z));}return path;
}
function remember(n,memory){if(!n.memories.some(m=>m.kind===memory.kind&&m.buildingId===memory.buildingId)){n.memories.push(memory);if(n.memories.length>64)n.memories.shift();}}
function roadUsed(w,n,p,g){
 const b=g.roads.get(key(p.x,p.z));if(!b||b.createdBy!=='player')return;
 remember(n,{kind:'road',buildingId:b.id,type:'road',text:`Đã đi qua lối tại (${b.x}, ${b.z}).`,time:w.time});
 if(!w.milestoneRoadUsed){w.milestoneRoadUsed=true;journal(w,`${n.name} đã thực sự đi qua một lối mới bạn đặt.`,'first-road-use');}
}
function chooseTrip(w,n,g){
 const opportunities=w.buildings.filter(b=>['cafe','bench','pier','market'].includes(b.type)&&buildingStatus(w,b).ready&&w.residents.filter(r=>r!==n&&r.targetBuildingId===b.id).length<(CATALOG[b.type].capacity||2));
 const home=findBuilding(w,n.homeId);if(home&&isConnected(w,home))opportunities.push(home);
 if(!opportunities.length){n.activity='idle';n.activityUntil=w.time+5;return;}
 for(let attempt=0;attempt<opportunities.length;attempt++){
  const b=opportunities[(n.journeyCount+attempt)%opportunities.length];const entries=adjacentRoads(b,g);
  for(const end of entries){const path=routeBetween(g,{x:n.x,z:n.z},end);if(path===null)continue;
   n.journeyCount++;n.targetBuildingId=b.id;n.route=path;n.targetX=end.x;n.targetZ=end.z;n.activity=path.length?'walking':b.type;n.activityUntil=w.time+8;
   if(!path.length)arrive(w,n);return;
  }
 }
 n.activity='idle';n.activityUntil=w.time+5;
}
function arrive(w,n){
 const b=findBuilding(w,n.targetBuildingId);n.activity=b?b.type:'idle';n.activityUntil=w.time+8;
 if(b&&b.type!=='house')remember(n,{kind:'visit',buildingId:b.id,type:b.type,text:`Đã ghé ${CATALOG[b.type].name.toLowerCase()} tại (${b.x}, ${b.z}).`,time:w.time});
}
function walk(w,n,seconds,g){
 let remaining=seconds*SPEED;
 while(n.route.length&&remaining>0){
  const p=n.route[0];if(!g.roads.has(key(p.x,p.z))){n.route=[];n.activity='idle';n.targetBuildingId=null;return;}
  const distance=Math.abs(p.x-n.x)+Math.abs(p.z-n.z);
  if(distance<=remaining+1e-9){n.x=p.x;n.z=p.z;remaining-=distance;n.route.shift();roadUsed(w,n,p,g);}
  else{const ratio=remaining/distance;n.x+=(p.x-n.x)*ratio;n.z+=(p.z-n.z)*ratio;remaining=0;}
 }
 if(!n.route.length&&n.activity==='walking')arrive(w,n);
}
export function tick(w,realSeconds,visible=true){
 if(!visible||w.mode==='pause'||!Number.isFinite(realSeconds)||realSeconds<=0||realSeconds>86400)return result(false,'Thời gian không tiến.');
 let remaining=realSeconds*(w.mode==='slow'?.25:1);const g=graph(w);
 while(remaining>1e-9){const step=Math.min(remaining,1);w.time+=step;remaining-=step;allocate(w);
  for(const n of w.residents){
   if(!active(n))continue;
   if(n.state==='atRisk'&&!w.ambient){n.protectionTime=Math.min(DAY,n.protectionTime+step);if(n.protectionTime>=DAY)n.state='departureEligible';}
   if(n.state==='waiting'&&w.time-n.waitingSince>=3*DAY)n.state='atRisk';
   if(n.route.length)walk(w,n,step,g);else if(w.time>=n.activityUntil)chooseTrip(w,n,g);
  }
  if(!w.ambient){for(const n of w.residents.filter(r=>r.named&&r.state==='departureEligible')){
   n.state='temporarilyAway';n.awaySince=w.time;n.route=[];n.targetBuildingId=null;n.activity='idle';
   journal(w,`${n.name} tạm vắng sau thời gian chờ nhà và bảo vệ; danh tính cùng ký ức được giữ nguyên.`,'temporary-away');
  }}
  const departureDay=Math.floor(w.time/DAY);
  if(!w.ambient&&w.lastDepartureDay!==departureDay){const leaving=w.residents.find(n=>n.state==='departureEligible'&&!n.named);if(leaving){leaving.state='departed';leaving.route=[];leaving.targetBuildingId=null;leaving.activity='idle';w.lastDepartureDay=departureDay;journal(w,`${leaving.name} rời làng sau thời gian chờ và bảo vệ; lịch sử được giữ lại.`,'departure');}}
 }
 w.revision++;return result(true,'Thế giới đã tiến triển.');
}
export function getDialogue(w,npcId){
 const n=w.residents.find(p=>p.id===npcId);if(!n)return 'Không tìm thấy cư dân này.';
 const memory=[...n.memories].reverse().find(m=>m.kind!=='interaction');const hai=n.id==='hai';let text;
 if(!active(n))text=hai?'Bác đang tạm vắng. Khi có chỗ ở phù hợp, bác sẽ lại về thăm làng, cháu nhé.':'Tôi đã rời làng. Những kỷ niệm cũ vẫn còn.';
 else if(n.state!=='housed')text=hai?'Bác vẫn ở đây, cháu ạ. Có một căn nhà với lối đi thuận tiện thì bác yên tâm hơn.':'Tôi vẫn ở trong làng, đang chờ một căn nhà có đường đi thuận tiện.';
 else if(memory){
  const b=findBuilding(w,memory.buildingId);
  text=b?(memory.kind==='road'?(hai?'Bác đã đi qua lối mới ấy rồi, cháu ạ. Bác vẫn thích đi thong thả.':'Tôi đã đi qua lối mới ấy.'):(hai?`Bác đã ghé ${CATALOG[memory.type].name.toLowerCase()} rồi, cháu ạ. Có một chỗ dừng chân cũng vui.`:`Tôi đã ghé ${CATALOG[memory.type].name.toLowerCase()} ở làng.`)):(hai?'Bác vẫn nhớ nơi mình từng ghé trước đây. Giờ góc ấy đã khác rồi, cháu nhỉ.':'Tôi vẫn nhớ nơi mình từng ghé trước đây, dù giờ nơi ấy đã thay đổi.');
 }else text=hai?'Bác thích góc yên tĩnh nhìn ra biển, cháu ạ. Cứ thong thả mà ngắm làng thôi.':'Tôi đang sống trong làng. Có lúc tôi đi dạo, có lúc nghỉ chân bên đường.';
 if(!n.memories.some(m=>m.kind==='interaction')){remember(n,{kind:'interaction',text:'Đã trò chuyện với người chơi.',time:w.time});w.revision++;}
 return `${n.name}: “${text}”`;
}
export function unlockRegion(w){
 if(w.regionUnlocked)return result(true,'Xóm Biển đã mở.');
 const s=stats(w);if(s.connected<6||!['cafe','bench'].every(type=>w.buildings.some(b=>b.type===type&&isConnected(w,b))))return result(false,'Quy tắc thử nghiệm: cần 6 cư dân ở nhà có đường nối làng, một quán nước và một ghế nghỉ có kết nối.');
 w.regionUnlocked=true;w.revision++;journal(w,'Bạn mở Xóm Biển theo quy tắc thử nghiệm của prototype.','unlock');return result(true,'Đã mở Xóm Biển — quy tắc thử nghiệm.');
}

/** Validate imported snapshots before they become authoritative; never repairs untrusted state. */
export function validateWorld(w){
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
