import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createResidentModel, animateResidentModel } from './art/characters.js';
import { createBuildingModel } from './art/buildings.js';
import { pickSceneEntity, residentMotion } from './art/presentation.js';
import { MAP, CELL_SIZE, worldToCell, occupiedCells, buildingCenter } from './grid.js';
import { createCellOverlay, createRoadSurface } from './art/grid-presentation.js';

// Original, procedural diorama. World state stays exclusively in simulation.js.
export function createScene(container, { onCell, onHover, onSelect, onResidentSelect } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#c5e2df');
  scene.fog = new THREE.Fog('#c5e2df', 40, 85);
  const camera = new THREE.OrthographicCamera(-15, 15, 12, -12, .1, 160);
  camera.position.set(26.5, 29, 36);
  camera.zoom = 1.23;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.domElement.setAttribute('aria-label', 'Làng biển 3D — kéo để xoay, cuộn để phóng to');
  renderer.domElement.style.touchAction = 'none';
  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(8, 0, 9);
  controls.enableDamping = true;
  controls.dampingFactor = .09;
  controls.minPolarAngle = .28;
  controls.maxPolarAngle = Math.PI / 2.45;
  controls.minZoom = .65;
  controls.maxZoom = 6.5;
  controls.enablePan = true;
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
  controls.update();
  const hemi = new THREE.HemisphereLight('#fff6dc', '#447a71', 2.25);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0ce', 3.5);
  sun.position.set(-10, 26, 13);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: .1, far: 65 });
  sun.shadow.normalBias = .035;
  sun.shadow.bias = -.0001;
  scene.add(sun);
  const sunTarget = new THREE.Object3D(); sunTarget.position.set(10, 0, 8); scene.add(sunTarget); sun.target = sunTarget;

  const mats = {};
  const sharedMaterials = new Set();
  const mat = (color, roughness = .9) => {
    const key = color + roughness;
    if(!mats[key]) {
      mats[key]=new THREE.MeshStandardMaterial({ color, roughness });
      sharedMaterials.add(mats[key]);
    }
    return mats[key];
  };
  const colors = { sand: '#e8d3a4', cream: '#f3dfb0', roof: '#c77855', roofDark: '#a4563c', wood: '#805b42', woodLight: '#b18759', leaf: '#549274', darkLeaf: '#357b65', blue: '#447b9a', teal: '#286d72' };
  const mesh = (geometry, material, parent, x = 0, y = 0, z = 0) => {
    const obj = new THREE.Mesh(geometry, material); obj.position.set(x, y, z);
    obj.castShadow = true; obj.receiveShadow = true; parent.add(obj); return obj;
  };
  const box = (parent, w, h, d, color, x = 0, y = 0, z = 0) => mesh(new THREE.BoxGeometry(w, h, d), mat(color), parent, x, y, z);
  const cyl = (parent, r1, r2, h, color, x = 0, y = 0, z = 0, n = 8) => mesh(new THREE.CylinderGeometry(r1, r2, h, n), mat(color), parent, x, y, z);
  const sphere = (parent, r, color, x = 0, y = 0, z = 0, detail = 1) => mesh(new THREE.IcosahedronGeometry(r, detail), mat(color), parent, x, y, z);
  const line = (parent, points, color, opacity = 1) => {
    const obj = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p))), new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
    parent.add(obj); return obj;
  };
  const seeded = (n) => { const v = Math.sin(n * 127.1 + 47.3) * 43758.5453; return v - Math.floor(v); };
  const groundY = .1;
  const sea = mesh(new THREE.PlaneGeometry(250, 250), mat('#65bfc0', .43), scene, 8, -.14, 8);
  sea.rotation.x = -Math.PI / 2; sea.castShadow = false;
  // The navigable rectangular map is entirely inside this irregular sand silhouette.
  const shore = new THREE.Shape();
  const shorePoints = [[-6,-8],[26,-8],[27,2],[26.4,8],[25.3,15.7],[23,16.6],[18,16.9],[15.4,16.45],[12,16.8],[9,16.5],[6,17],[1,16.45],[-3.5,16.8],[-5.2,12]];
  shorePoints.forEach(([x,z], i) => i ? shore.lineTo(x,-z) : shore.moveTo(x,-z)); shore.closePath();
  const land = mesh(new THREE.ExtrudeGeometry(shore, { depth: .42, bevelEnabled: true, bevelSize: .45, bevelThickness: .22, bevelSegments: 2, steps: 1 }), mat(colors.sand), scene, 0, -.54, 0);
  land.rotation.x = -Math.PI / 2;
  // A quiet green inland margin gives the village a sheltered, miniature setting.
  const inland = new THREE.Group(); scene.add(inland);
  for (let i = 0; i < 17; i++) {
    const x = -4 + i * 1.9;
    const z = -3.7 - seeded(i + 10) * 2;
    const hill = sphere(inland, 1.1 + seeded(i + 11) * .8, i % 2 ? '#90a97e' : '#7b9a75', x, -.42, z, 0);
    hill.scale.set(1.65, .32 + seeded(i) * .16, 1.4);
  }
  const decor = new THREE.Group(); scene.add(decor);
  const buildRoot = new THREE.Group(); scene.add(buildRoot);
  const residentRoot = new THREE.Group(); scene.add(residentRoot);

  // Flat, irregular vegetation stays under future buildings: every map cell
  // remains buildable and these scenery marks never become invisible obstacles.
  function groundPatch(parent,x,z,r,color,stretch=1) {
    const points=[];
    for(let i=0;i<10;i++) {
      const a=i*Math.PI/5, radius=r*(.78+seeded(i+x*23+z*7)*.3);
      points.push(new THREE.Vector2(Math.cos(a)*radius*stretch,Math.sin(a)*radius));
    }
    const patch=mesh(new THREE.ShapeGeometry(new THREE.Shape(points)),mat(color),parent,x,.103,z);
    patch.rotation.x=-Math.PI/2;patch.castShadow=false;return patch;
  }
  for(let i=0;i<115;i++) {
    const x=-4+seeded(i+318)*29;
    const z=-4+seeded(i+781)*20;
    const inlandGrass=z<4.2,edge=x<1||x>17.5;
    const color=inlandGrass?['#bdc595','#c6cb9c','#aebb8b'][i%3]:edge?['#d1c9a0','#c9c89b','#d9d0a8'][i%3]:['#e4cea0','#e1c99b','#e9d6ad'][i%3];
    groundPatch(decor,x,z,.3+seeded(i+48)*(inlandGrass?1.7:.8),color,1.5);
  }
  for(let i=0;i<55;i++) {
    const x=-3+seeded(i+423)*28,z=-1+seeded(i+399)*4.4;
    for(let j=0;j<3;j++) {
      const grass=mesh(new THREE.ConeGeometry(.025,.14+seeded(i+j)*.11,3),mat(i%2?'#95a378':'#a1ad7f'),decor,x+j*.06,.15,z+j*.025);
      grass.rotation.z=(seeded(i+j+8)-.5)*.4;
    }
  }

  function palm(parent, x, z, scale = 1, angle = 0) {
    const g = new THREE.Group(); g.position.set(x, groundY, z); g.scale.setScalar(scale); g.rotation.y = angle; parent.add(g);
    const trunk = cyl(g, .055, .09, 1.2, '#a88858', .1, .6, 0); trunk.rotation.z = -.14;
    for (let h = .16; h < 1.12; h += .15) cyl(g, .071 - h * .015, .075 - h * .015, .024, '#b99a69', h * .13, h, 0);
    for (let i = 0; i < 7; i++) {
      const a = i * Math.PI * 2 / 7;
      const leafShape = new THREE.Shape(); leafShape.moveTo(0,0); leafShape.quadraticCurveTo(.17,.4,0,.92); leafShape.quadraticCurveTo(-.15,.4,0,0);
      const leaf = mesh(new THREE.ShapeGeometry(leafShape, 5), new THREE.MeshStandardMaterial({ color: i % 2 ? '#5e9b75' : '#37846b', side: THREE.DoubleSide, roughness: 1 }), g, .18, 1.18, 0);
      leaf.rotation.set(-1.18, 0, -a); leaf.rotateY(a * .05);
      // Fan blades fan out around the crown with a natural downward tip.
      const blade = new THREE.Group(); g.add(blade); blade.position.set(.18,1.2,0); blade.rotation.y = a;
      const bent = mesh(new THREE.ConeGeometry(.13,.9,4), mat(i % 2 ? '#579c76' : '#38866b'), blade, 0, -.08, .4); bent.rotation.x = 1.8; bent.scale.x = .65;
    }
    sphere(g, .105, '#7d8050', .19, 1.12, .1); sphere(g, .09, '#6c7444', .1, 1.13, -.09);
    return g;
  }
  function shrub(parent, x, z, size = .3) {
    sphere(parent,size,'#7eaa75',x,groundY+size*.45,z); sphere(parent,size*.7,'#96b77c',x+.17,groundY+size*.4,z+.08);
  }
  function bench(parent) {
    box(parent,.68,.065,.23,colors.woodLight,0,.28,0);
    box(parent,.68,.18,.045,colors.woodLight,0,.4,-.13);
    for (const x of [-.25,.25]) {box(parent,.045,.25,.045,colors.wood,x,.14,-.08);box(parent,.045,.25,.045,colors.wood,x,.14,.08);}
    for (const x of [-.12,.12]) box(parent,.02,.012,.23,colors.wood, x,.32,0);
  }
  function crate(parent,x,y,z,s=.18) {
    box(parent,s,s,s,colors.woodLight,x,y+s/2,z);
    box(parent,s+.008,.024,.02,colors.wood,x,y+s*.3,z+s/2+.004);
    box(parent,s+.008,.024,.02,colors.wood,x,y+s*.7,z+s/2+.004);
  }
  function roof(parent,width,depth,height,y,color = colors.roof) {
    const slope = Math.atan2(height, width / 2);
    const length = Math.hypot(width/2,height);
    for (const side of [-1,1]) {
      const face = box(parent,length+.07,.07,depth,color,side*width/4,y+height/2,0); face.rotation.z = -side*slope;
      for (let j=0;j<9;j++) {
        const tile = box(parent,length+.085,.025,.018, j%3 ? '#d38a64' : '#ba6b4e',side*width/4,y+height/2+.043,-depth/2+.045+j*(depth-.09)/8); tile.rotation.z = -side*slope;
      }
    }
    cyl(parent,.045,.045,depth+.045,'#dd9b73',0,y+height+.035,0).rotation.x = Math.PI / 2;
  }
  function makeBuilding(b) {
    if (b.type === 'road') {
      const road = createRoadSurface(b); road.position.y = groundY;
      road.userData.buildingId = b.id; road.traverse(o=>{if(o.isMesh)o.userData.buildingId=b.id;});
      return road;
    }
    const sample = createBuildingModel(b.type, { region: b.x >= MAP.regionStart ? 'xom-bien' : 'lang-chai', variant: Math.floor(b.x/3) % 2 });
    const center = buildingCenter(b);
    const g = sample || new THREE.Group(); g.position.set(center.x,groundY,center.z); g.rotation.y=(b.rotation||0)*Math.PI/2;
    g.userData.buildingId=b.id;
    if (sample) {
      g.traverse(o => { if (o.isMesh) o.userData.buildingId = b.id; });
      return g;
    }
    if(b.type==='tree') {
      palm(g,0,0,.95,b.x*.6);
      for(let i=0;i<4;i++) sphere(g,.07,'#b4a17e',Math.cos(i*2)*.25,.04,Math.sin(i*2)*.25,0);
    } else if(b.type==='bench') {
      box(g,.85,.025,.7,'#d3c39f',0,.012,0); bench(g);
      cyl(g,.065,.05,.12,'#bf7f5c',.36,.065,-.16);sphere(g,.09,'#78a273',.36,.17,-.16);
    } else if(b.type==='market') {
      box(g,.82,.055,.84,'#c4aa7c',0,.025,0);
      box(g,.7,.46,.43,'#d9c396',0,.27,-.17);
      for(const x of [-.37,.37]) cyl(g,.022,.022,.68,colors.wood,x,.34,.34);
      for(let i=0;i<6;i++) {const awning=box(g,.135,.045,.86,i%2?'#f2dfaf':'#638f88',-.335+i*.134,.64,0);awning.rotation.x=.12;}
      box(g,.75,.1,.27,colors.woodLight,0,.36,.15);
      box(g,.78,.035,.29,'#9f7751',0,.43,.15);
      for(let i=0;i<3;i++){box(g,.16,.045,.18,'#758f87',-.24+i*.23,.47,.15);for(let j=0;j<3;j++){const fish=sphere(g,.035,'#c9d7ce',-.28+i*.23+j*.035,.51,.15);fish.scale.set(.5,.45,1.5);}}
      crate(g,-.31,.05,.37,.17);crate(g,.31,.05,.37,.17);
    } else if(b.type==='pier') {
      for(let j=0;j<10;j++)box(g,.72,.07,.16, j%3?'#b89565':'#a98356',0,.11,-.38+j*.17);
      for(const x of [-.34,.34])for(const z of [-.4,.4,1.12])cyl(g,.035,.045,.58,colors.wood,x,-.06,z);
      for(const x of [-.34,.34])line(g,[[x,.32,-.4],[x,.3,.4],[x,.32,1.12]],'#cbbb92');
      crate(g,.16,.15,.5,.19);
    }
    g.traverse(o=>{if(o.isMesh)o.userData.buildingId=b.id;});
    return g;
  }
  function boat(parent,x,z,scale=1,color='#477f9b') {
    const g=new THREE.Group();g.position.set(x,-.02,z);g.scale.setScalar(scale);parent.add(g);
    const hull=sphere(g,.55,color,0,.03,0,1);hull.scale.set(.48,.25,1.1);
    box(g,.42,.075,.67,'#c6ac75',0,.12,.04);
    for(const x of [-.21,.21]) {
      line(g,[[0,.1,-.58],[x,.17,-.33],[x,.17,.32],[0,.11,.59]],'#dfd5ac');
      line(g,[[0,.05,-.56],[x,.085,-.32],[x,.085,.32],[0,.05,.56]],'#427481');
    }
    for(const iz of [-.2,.2])box(g,.45,.05,.07,'#426d7c',0,.17,iz);
    cyl(g,.016,.018,.65,'#9d7a51',.15,.42,-.1);
    const canopy=box(g,.44,.035,.35,'#e0c696',0,.61,-.1);canopy.rotation.x=.08;
    cyl(g,.12,.14,.18,'#68968b',0,.25,.27);
    const mast=cyl(g,.012,.014,.49,colors.wood,.15,.83,-.1);
    box(g,.15,.09,.008,'#c97b5d',.23,1.01,-.1);
    box(g,.018,.018,.011,'#e4c47c',.22,1.01,-.094);
    const net=mesh(new THREE.TorusGeometry(.105,.012,4,14),mat('#c7bd90'),g,-.1,.19,.29);net.rotation.x=Math.PI/2;
    cyl(g,.025,.025,.36,'#c98e60',-.32,.18,.02).rotation.x=.9;
    line(g,[[.18,.14,.42],[.4,.12,.78],[.6,.03,.85]],'#e1d0a4');return g;
  }
  const boats=[boat(decor,10.1,18,1.12),boat(decor,12.9,18.9,1,'#4c9296'),boat(decor,5,19.5,1.28,'#4b7b9d')];
  boats[0].rotation.y=-.25;boats[1].rotation.y=.4;boats[2].rotation.y=-.6;
  // Visual trip only: a clock-derived fishing loop, not fishing logistics,
  // arrivals, population, rewards, or a new source of simulation events.
  // The morning starts with the boat resting in view beside the pier.
  const fishingRoute=new THREE.CatmullRomCurve3([
    [10.2,17.4],[8.5,18.2],[6,21],[8,24],[14,24],[15,21],[13.1,18.3],
  ].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
  const boatPoint=new THREE.Vector3(),boatTangent=new THREE.Vector3();
  // Props are scenery only: no extra houses or invented residents.
  [[1,2,1.5],[3,3,1.2],[10,2,1.4],[13,3,1.1],[1,12,1.3],[4,13.8,1.15],[8,14,1.35],[17,2,1.4],[20,4,1.6],[19,12,1.1],[-1,5,1.6],[-2,11,1.2],[23,8,1.5]].forEach(([x,z,s],i)=>palm(decor,x,z,s,i*.7));
  for(let i=0;i<45;i++) {
    const x=-2+seeded(i+91)*26,z=-1+seeded(i+174)*4;
    shrub(decor,x,z,.18+seeded(i)*.23);
  }
  for(let i=0;i<16;i++) {
    const x=-2+seeded(i+81)*26, z=16.6+seeded(i+42)*.45;
    const r=sphere(decor,.15+seeded(i+2)*.2,i%2?'#a5ac9a':'#b5b39b',x,-.01,z,0);r.scale.set(1.4,.6,.8);
  }
  // A small drying rack and net by the public shore.
  for(const x of [7.6,8.8])cyl(decor,.025,.03,.7,colors.wood,x,.45,15.7);
  line(decor,[[7.6,.75,15.7],[8.2,.69,15.7],[8.8,.75,15.7]],'#8a7356');
  for(let i=0;i<9;i++)line(decor,[[7.65+i*.13,.72,15.7],[7.65+i*.13,.28,15.7]],'#9b9d87',.7);
  for(let i=0;i<5;i++)line(decor,[[7.65,.3+i*.09,15.7],[8.75,.3+i*.09,15.7]],'#9b9d87',.7);
  crate(decor,9.1,.12,15.4,.25);crate(decor,9.3,.12,15.5,.18);
  // Public fishing work canopy sits beyond the buildable western edge.
  const work=new THREE.Group();work.position.set(-1.9,groundY,9.6);decor.add(work);
  for(const x of [-.6,.6])for(const z of [-.45,.45])cyl(work,.035,.045,.95,colors.wood,x,.48,z);
  roof(work,1.45,1.2,.3,1,'#ad8e65');
  box(work,1.1,.07,.48,colors.woodLight,0,.43,0);
  for(const x of [-.43,.43])box(work,.045,.42,.045,colors.wood,x,.21,0);
  crate(work,-.52,.02,.32,.24);crate(work,.3,.02,-.25,.3);
  for(let i=0;i<6;i++)line(work,[[-.45+i*.17,.89,-.48],[-.43+i*.17,.15,-.48]],'#a0a181',.7);
  // Round bamboo basket boats used along the Vietnamese coast.
  for(const [x,z] of [[7.1,16.9],[7.9,17.4]]) {
    const basket=sphere(decor,.31,'#b6a06c',x,-.02,z,1);basket.scale.y=.36;
    const rim=mesh(new THREE.TorusGeometry(.28,.025,5,20),mat('#d2bc86'),decor,x,.055,z);rim.rotation.x=Math.PI/2;
    cyl(decor,.019,.018,.68,'#9a8054',x,.07,z).rotation.z=1.4;
  }
  for(let i=0;i<8;i++) {const patch=sphere(decor,.35,'#d3bf92',2+i*.9,.08,10+seeded(i)*1.5,0);patch.scale.set(1,.025,.6);}
  // Broken, fine shoreline strokes keep the ocean readable from the camera.
  const waterLines=[];
  for(let i=0;i<75;i++) {
    const x=-15+seeded(i+115)*57,z=17.6+seeded(i+267)*35;
    const stroke=line(scene,[[x,-.095,z],[x+.35+seeded(i)*1.8,-.095,z]],i%3?'#a8dcce':'#e4eee0',.45);
    waterLines.push(stroke);
  }
  const foamCurve=new THREE.CatmullRomCurve3([[-4,-.06,17.15],[1,-.06,17.05],[6,-.06,17.6],[9,-.06,17.12],[12,-.06,17.4],[15.5,-.06,17.05],[18,-.06,17.55],[23,-.06,17.2],[25,-.06,16.4]].map(p=>new THREE.Vector3(...p)));
  const foam=new THREE.Line(new THREE.BufferGeometry().setFromPoints(foamCurve.getPoints(120)),new THREE.LineBasicMaterial({color:'#f2edd2',transparent:true,opacity:.65}));scene.add(foam);
  const foamOuter=new THREE.Line(new THREE.BufferGeometry().setFromPoints(foamCurve.getPoints(120).map(p=>new THREE.Vector3(p.x,p.y-.015,p.z+.4))),new THREE.LineBasicMaterial({color:'#c4e6d7',transparent:true,opacity:.3}));scene.add(foamOuter);

  const grid=new THREE.Group();scene.add(grid);grid.visible=false;
  const minorGrid = new THREE.Group(); grid.add(minorGrid);
  for(let x=0;x<=MAP.width;x++)line(x%3===0?grid:minorGrid,[[x*CELL_SIZE-.5,.135,-.5],[x*CELL_SIZE-.5,.135,15.5]],'#8f9877',x%3===0?.25:.12);
  for(let z=0;z<=MAP.depth;z++)line(z%3===0?grid:minorGrid,[[-.5,.135,z*CELL_SIZE-.5],[21.5,.135,z*CELL_SIZE-.5]],'#8f9877',z%3===0?.25:.12);
  const lockedMat=new THREE.MeshBasicMaterial({color:'#b9c29a',transparent:true,opacity:.025,depthWrite:false});
  const locked=mesh(new THREE.PlaneGeometry(8,16),lockedMat,scene,17.5,.14,7.5);locked.rotation.x=-Math.PI/2;locked.castShadow=false;
  const boundary=new THREE.Group();scene.add(boundary);
  for(let z=0;z<16;z++) {const dash=box(boundary,.035,.014,.38,'#d8e2c6',13.5,.15,z);dash.castShadow=false;}
  const selected=new THREE.Group();scene.add(selected);selected.visible=false;
  const preview=new THREE.Group();scene.add(preview);preview.visible=false;
  let selectionSignature='', previewSignature='', previewCells=null;
  function replaceOverlay(parent,cells,color,opacity=.32) {
    for (const child of [...parent.children]) disposeObject(child);
    parent.add(createCellOverlay(cells,{color,opacity}));
  }
  function refreshPreview() {
    preview.visible=!!tool&&!!hoverCell;
    const cells = previewCells || (tool&&hoverCell ? occupiedCells({type:tool,x:hoverCell.x,z:hoverCell.z,rotation}) : []);
    const signature=JSON.stringify([cells,previewValid,tool,rotation]);
    if(signature!==previewSignature) {
      replaceOverlay(preview,cells,previewValid?'#78b89a':'#ce7967');
      if(tool&&tool!=='road'&&cells.length){
        const minX=Math.min(...cells.map(p=>p.x)),maxX=Math.max(...cells.map(p=>p.x)),minZ=Math.min(...cells.map(p=>p.z)),maxZ=Math.max(...cells.map(p=>p.z));
        const angle=rotation*Math.PI/2,centerX=((minX+maxX)/2-1)/3,centerZ=((minZ+maxZ)/2-1)/3;
        const geometry=new THREE.ConeGeometry(.065,.15,3);geometry.rotateX(Math.PI/2);
        const arrow=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:'#fff4d2',depthTest:false}));
        arrow.position.set(centerX+Math.sin(angle)*.32,.22,centerZ+Math.cos(angle)*.32);arrow.rotation.y=angle;preview.add(arrow);
      }
      previewSignature=signature;
    }
  }
  const residents=new Map(),buildings=new Map();
  function makeResident(npc,index) {
    const g=createResidentModel(npc);
    const shadow=mesh(new THREE.CircleGeometry(.105,12),new THREE.MeshBasicMaterial({color:'#5e7361',transparent:true,opacity:.19,depthWrite:false}),g,0,.008,0);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
    g.userData.residentId=npc.id;residentRoot.add(g);return g;
  }
  // Rain positions are deterministic and follow simulation time, including Scenic Pause.
  const rainCount=280,rainArray=new Float32Array(rainCount*6);
  const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(rainArray,3));
  const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:'#c4e5e6',transparent:true,opacity:.5}));rain.frustumCulled=false;rain.visible=false;scene.add(rain);
  let tool=null,rotation=0,hoverCell=null,previewValid=true,disposed=false,ambientTime=0;
  let selectedId=null;
  const daySky=new THREE.Color('#c5e2df'),nightSky=new THREE.Color('#284956');
  const noonColor=new THREE.Color('#fff0ce'),duskColor=new THREE.Color('#edb48d'),moonColor=new THREE.Color('#9dc2d1');
  const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster(),groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),-groundY),intersection=new THREE.Vector3();
  function pointAt(event) {
    const rect=renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    if(!raycaster.ray.intersectPlane(groundPlane,intersection))return null;
    const x=worldToCell(intersection.x),z=worldToCell(intersection.z);
    return x>=0&&x<MAP.width&&z>=0&&z<MAP.depth?{x,z}:null;
  }
  function setCursor(cell) {
    hoverCell=cell;previewCells=null;
    onHover?.(cell);refreshPreview();
  }
  let pointerDown=null;
  const down=e=>{pointerDown={x:e.clientX,y:e.clientY};};
  const motion=e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)<5)setCursor(pointAt(e));};
  const up=e=>{
    if(!pointerDown)return;
    const wasClick=Math.hypot(e.clientX-pointerDown.x,e.clientY-pointerDown.y)<5;pointerDown=null;
    if(!wasClick||e.button!==0)return;
    const cell=pointAt(e);setCursor(cell);
    if(tool&&cell){onCell?.(cell);return;}
    const entity = pickSceneEntity(raycaster, buildRoot, residentRoot);
    if (entity?.kind === 'resident') onResidentSelect?.({ id: entity.id });
    else if (entity?.kind === 'building') onSelect?.({ id: entity.id });
    else if(cell)onCell?.(cell);
  };
  const leave=()=>{if(!pointerDown)setCursor(null);};
  renderer.domElement.addEventListener('pointerdown',down);
  renderer.domElement.addEventListener('pointermove',motion);
  renderer.domElement.addEventListener('pointerup',up);
  renderer.domElement.addEventListener('pointerleave',leave);
  function resize(){
    const w=container.clientWidth||window.innerWidth,h=container.clientHeight||window.innerHeight;
    renderer.setSize(w,h);const aspect=w/h;const view=aspect<1?21:23;
    camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();
  }
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function disposeObject(object) {
    const geometries=new Set(),ownedMaterials=new Set();
    object.traverse(o=>{
      if(o.geometry)geometries.add(o.geometry);
      if(o.material)for(const material of Array.isArray(o.material)?o.material:[o.material]) {
        if(!sharedMaterials.has(material))ownedMaterials.add(material);
      }
    });
    for(const geometry of geometries)geometry.dispose();
    for(const material of ownedMaterials)material.dispose();
    object.removeFromParent();
  }
  function update(world,dt=0,options={}) {
    if(disposed)return;
    selectedId=options.selectedId;
    const ids=new Set();
    for(const b of world.buildings){
      ids.add(b.id);const signature=JSON.stringify([b.type,b.x,b.z,b.rotation,b.cells,b.roadWidth]);
      let item=buildings.get(b.id);
      if(!item||item.signature!==signature){if(item)disposeObject(item.group);const group=makeBuilding(b);buildRoot.add(group);item={signature,group};buildings.set(b.id,item);}
    }
    for(const [id,item]of buildings)if(!ids.has(id)){disposeObject(item.group);buildings.delete(id);}
    const npcIds=new Set();
    world.residents.forEach((npc,index)=>{
      if(npc.state==='departed'||npc.state==='temporarilyAway')return;
      npcIds.add(npc.id);let g=residents.get(npc.id);if(!g){g=makeResident(npc,index);residents.set(npc.id,g);}
      g.position.set(npc.x,groundY+.015,npc.z);
      const { moving, heading } = residentMotion(npc);
      if(moving)g.rotation.y=heading;
      animateResidentModel(g, { time: world.time, moving, reducedMotion: !!options.reducedMotion });
    });
    for(const[id,g]of residents)if(!npcIds.has(id)){disposeObject(g);residents.delete(id);}
    const chosen=world.buildings.find(b=>b.id===selectedId);
    selected.visible=!!chosen;
    const nextSelection=chosen?JSON.stringify(occupiedCells(chosen)):'';
    if(nextSelection!==selectionSignature) {replaceOverlay(selected,chosen?occupiedCells(chosen):[],'#fff0b7',.18);selectionSignature=nextSelection;}
    locked.visible=boundary.visible=!world.regionUnlocked;
    rain.visible=world.weather==='rain';
    const clock=((world.time%1440)+1440)%1440;
    const solar=Math.sin((clock-360)/1440*Math.PI*2);
    const daylight=THREE.MathUtils.smoothstep(solar,-.15,.45);
    const weatherFactor=world.weather==='rain'?.43:world.weather==='cloudy'?.7:1;
    sun.intensity=(.15+3.35*Math.max(0,solar)**.55)*weatherFactor;
    hemi.intensity=.68+daylight*1.57;
    sun.color.copy(solar<0?moonColor:duskColor).lerp(noonColor,Math.max(0,solar));
    sun.position.set(10-21*Math.cos((clock-360)/1440*Math.PI*2),solar<0?17:7+solar*22,13);
    scene.background.copy(nightSky).lerp(daySky,daylight);
    if(world.weather==='rain')scene.background.lerp(new THREE.Color('#9fb9bb'),daylight*.4);
    scene.fog.color.copy(scene.background);
    for(const color of ['#4b8080','#518383']) {
      const windowMat=mats[color+.9];
      if(windowMat){windowMat.emissive.set('#f1bb6c');windowMat.emissiveIntensity=(1-daylight)*.8;}
    }
    buildRoot.traverse(o => {
      if (o.isMesh && o.userData.window && o.material?.emissive) {
        o.material.emissive.set('#efba75');
        o.material.emissiveIntensity = (1-daylight) * .65;
      }
    });
    if(rain.visible){
      for(let i=0;i<rainCount;i++){
        const x=-3+seeded(i+45)*29,z=-3+seeded(i+19)*25,y=((seeded(i+70)*8-world.time*(options.reducedMotion?0:5))%8+8)%8;
        rainArray.set([x,y,z,x-.055,y+.27,z-.025],i*6);
      }rainGeo.attributes.position.needsUpdate=true;
    }
    // Water is decorative and continues during building and Scenic Pause.
    // Reduced motion freezes it; canonical world activity still uses world.time.
    if(!options.reducedMotion)ambientTime+=Math.min(dt,.1);
    waterLines.forEach((wave,i)=>{wave.position.x=Math.sin(ambientTime*.3+i)*.13;});
    foam.material.opacity=.55+Math.sin(ambientTime*.5)*.1;
    foamOuter.material.opacity=.23+Math.sin(ambientTime*.5+.8)*.08;
    const voyagePhase=(((world.time-480)%480)+480)%480;
    const voyageProgress=THREE.MathUtils.smoothstep(voyagePhase,70,410);
    fishingRoute.getPointAt(voyageProgress,boatPoint);
    fishingRoute.getTangentAt(voyageProgress,boatTangent);
    boats[0].position.x=boatPoint.x;
    boats[0].position.z=Math.max(16.8,boatPoint.z);
    boats[0].rotation.y=Math.atan2(boatTangent.x,boatTangent.z);
    boats.forEach((b,i)=>{b.position.y=-.02+(options.reducedMotion?0:Math.sin(world.time*.7+i)*.025);b.rotation.z=options.reducedMotion?0:Math.sin(world.time*.6+i)*.025;});
    minorGrid.visible=camera.zoom>=1.45;
    grid.traverse(o=>{if(o.isLine)o.material.opacity=(o.parent===minorGrid ? .12 : .25)*Math.min(1,camera.zoom/1.8);});
    controls.update();renderer.render(scene,camera);
  }
  return {
    update,
    setTool(type){tool=type;previewCells=null;grid.visible=!!type;refreshPreview();renderer.domElement.style.cursor=type?'crosshair':'grab';},
    setRotation(value){rotation=value;previewCells=null;refreshPreview();},
    setPreview(valid){previewValid=typeof valid==='object'?valid.ok:valid;previewCells=typeof valid==='object'&&Array.isArray(valid.cells)?valid.cells:null;refreshPreview();},
    setCursor,
    focusBuilding(b){if(!b)return;const offset=camera.position.clone().sub(controls.target);const center=buildingCenter(b);controls.target.set(center.x,0,center.z);camera.position.copy(controls.target).add(offset);camera.zoom=Math.max(camera.zoom,1.35);camera.updateProjectionMatrix();controls.update();},
    focusResident(npc){if(!npc)return;const offset=camera.position.clone().sub(controls.target);controls.target.set(npc.x,.25,npc.z);camera.position.copy(controls.target).add(offset);camera.zoom=6;camera.updateProjectionMatrix();controls.update();},
    rotate(delta){const offset=camera.position.clone().sub(controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),delta);camera.position.copy(controls.target).add(offset);controls.update();},
    zoom(delta){camera.zoom=THREE.MathUtils.clamp(camera.zoom*Math.exp(-delta),.65,6.5);camera.updateProjectionMatrix();},
    resize,
    dispose(){
      disposed=true;observer.disconnect();controls.dispose();
      renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',motion);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointerleave',leave);
      const geometries=new Set(),materials=new Set(sharedMaterials);
      scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
      for(const geometry of geometries)geometry.dispose();for(const material of materials)material.dispose();
      renderer.dispose();renderer.domElement.remove();
    },
  };
}
