import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Original mesh work from the coastal concept sheets. All resources belong to
// this returned asset instance; no simulation state, DOM or textures are read.
export function createBuildingModel(type, { region = 'lang-chai', variant = 0 } = {}) {
  if (type !== 'house' && type !== 'cafe') return null;
  const root = new THREE.Group();
  root.name = `${type}-coastal-sample`;
  root.userData = { assetId: `${type}-${region}-sample-v1`, fidelity: 'procedural-concept-sample', forwardAxis: '+Z', unitsPerTile: 1 };
  const palette = {
    plaster: region === 'xom-bien' ? '#e8a28a' : '#edc16b', cream: '#f3dfb1', stone: '#d3c19d',
    teal: '#367e7c', tealLight: '#589b91', dark: '#244c49', wood: '#986b40', woodLight: '#c09258',
    tile: '#ce734c', tileLight: '#e38b5d', tileDark: '#b65c3c', blue: '#699ab0',
    leaf: '#608747', leafLight: '#87a552', flower: '#d6659c', flowerLight: '#ed91b5', ceramic: '#e6e4c7',
  };
  const materials = new Map(), geometries = new Map();
  const material = (color) => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .88 }));
    return materials.get(color);
  };
  const geo = (key, make) => {
    if (!geometries.has(key)) geometries.set(key, make());
    return geometries.get(key);
  };
  const mesh = (geometry, color, x, y, z, name) => {
    const o = new THREE.Mesh(geometry, material(color));
    o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
    if (name) o.name = name; root.add(o); return o;
  };
  const box = (w, h, d, color, x, y, z, name, round = false) => mesh(
    geo(`box:${w}:${h}:${d}:${round}`, () => round ? new RoundedBoxGeometry(w, h, d, 1, Math.min(w,h,d) * .12) : new THREE.BoxGeometry(w,h,d)),
    color,x,y,z,name);
  const cylinder = (r1,r2,h,color,x,y,z,n=8,name) => mesh(geo(`cyl:${r1}:${r2}:${h}:${n}`,()=>new THREE.CylinderGeometry(r1,r2,h,n)),color,x,y,z,name);
  const ball = (r,color,x,y,z,sx=1,sy=1,sz=1) => {
    const detail=0;
    const o=mesh(geo(`ball:${r}`,()=>new THREE.IcosahedronGeometry(r,detail)),color,x,y,z); o.scale.set(sx,sy,sz); return o;
  };
  const beam = (a,b,r,color) => {
    const start=new THREE.Vector3(...a), end=new THREE.Vector3(...b), direction=end.clone().sub(start);
    const o=cylinder(r,r,direction.length(),color,...start.clone().add(end).multiplyScalar(.5).toArray(),6);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()); return o;
  };
  const terrace = () => {
    box(.90,.065,.87,palette.stone,0,.0325,0,'foundation',true);
    for(let row=0;row<2;row++)for(let col=0;col<5;col++)
      box(.168,.018,.128,(col+row)%3===0?'#ddcda8':palette.cream,-.354+col*.177,.074,.235+row*.138);
    box(.65,.033,.105,palette.stone,0,.017,.427,'front-step',true);
  };
  const gable = (width, height, shoulder, depth, y, z) => {
    const shape=new THREE.Shape();shape.moveTo(-width/2,0);shape.lineTo(width/2,0);shape.lineTo(width/2,shoulder);shape.lineTo(0,height);shape.lineTo(-width/2,shoulder);shape.closePath();
    mesh(geo(`gable:${width}:${height}:${shoulder}:${depth}`,()=>new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1})),palette.plaster,0,y,z,'gable-endwall');
  };
  // A curved half cylinder with both exposed ends, instead of painted stripes.
  // Local +Z is the tile's downward roof-slope axis, local +Y its convex side.
  const halfTile = (radius,length) => geo(`tile:${radius}:${length}`,()=>{
    const vertices=[],indices=[],segments=6;
    for(let end=0;end<2;end++)for(let j=0;j<=segments;j++){
      const a=-Math.PI/2+j*Math.PI/segments;
      vertices.push(Math.sin(a)*radius,Math.cos(a)*radius,end*length-length/2);
    }
    for(let j=0;j<segments;j++){
      const a=j,b=j+1,c=j+segments+1,d=j+segments+2;indices.push(a,c,b,b,c,d);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
  });
  const roof = (eave, ridge, zStart, zEnd) => {
    const halfWidth=.435,rise=ridge-eave,columns=7,rows=6;
    const slopeLength=Math.hypot(halfWidth,rise), tileWidth=(zEnd-zStart)/columns;
    // Plaster fascia edges, timber underside, pitched clay courses.
    for(const side of [-1,1]){
      const slope=new THREE.Vector3(side*halfWidth,-rise,0).normalize();
      const orientation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),slope);
      const panel=box(slopeLength,.025,zEnd-zStart,palette.tileDark,side*halfWidth/2,(eave+ridge)/2-.02,(zStart+zEnd)/2);
      panel.rotation.z=-side*Math.atan2(rise,halfWidth);
      for(let col=0;col<columns;col++)for(let row=0;row<rows;row++){
        const t=(row+.48)/rows;
        const o=mesh(halfTile(tileWidth*.48,slopeLength/rows+.012),(row+col+variant)%4===0?palette.tileLight:palette.tile,
          side*halfWidth*t,ridge-rise*t,(zStart+tileWidth*(col+.5)),'clay-roof-tile');
        o.quaternion.copy(orientation);
      }
      beam([side*halfWidth,eave-.025,zStart],[side*halfWidth,eave-.025,zEnd],.019,palette.cream);
      for(const z of [zStart,zEnd])beam([0,ridge-.018,z],[side*halfWidth,eave-.018,z],.022,palette.cream);
    }
    for(let j=0;j<7;j++)mesh(halfTile(.037,(zEnd-zStart)/7+.006),palette.tileLight,0,ridge+.005,zStart+(j+.5)*(zEnd-zStart)/7,'ridge-cap');
    for(const z of [zStart-.012,zEnd+.012])ball(.036,palette.tileLight,0,ridge+.016,z,.8,1,1);
  };
  const shutter = (x,y,z,side=false) => {
    const group=new THREE.Group();group.position.set(x,y,z);if(side)group.rotation.y=Math.PI/2;root.add(group);
    const add=(w,h,d,color,px,py,pz,name)=>{const o=box(w,h,d,color,0,0,0,name);root.remove(o);group.add(o);o.position.set(px,py,pz);return o;};
    add(.21,.27,.028,palette.cream,0,0,0,'window-frame');
    const glass=add(.17,.225,.035,palette.dark,0,0,.018,'window-pane');
    glass.material=glass.material.clone();glass.material.userData.window=true;glass.userData.window=true;
    for(const s of [-1,1]){
      add(.086,.23,.025,palette.teal,s*.112,0,.039,'teal-shutter');
      for(let j=0;j<7;j++){const o=add(.067,.014,.014,palette.tealLight,s*.112,-.09+j*.029,.057);o.rotation.x=-.22;}
    }
    add(.25,.022,.075,palette.cream,0,-.145,.014,'window-sill');
    return group;
  };
  const pot = (x,z,scale=1,flowers=false) => {
    const y=.075,s=scale;
    cylinder(.046*s,.033*s,.088*s,palette.tile,x,y+.044*s,z,9,'terracotta-pot');
    cylinder(.051*s,.051*s,.018*s,palette.tileLight,x,y+.084*s,z,9);
    cylinder(.038*s,.038*s,.005*s,'#67513a',x,y+.095*s,z,8);
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      beam([x,y+.095*s,z],[x+Math.cos(a)*.045*s,y+.18*s,z+Math.sin(a)*.043*s],.007*s,palette.leaf);
      ball(.033*s,i%2?palette.leaf:palette.leafLight,x+Math.cos(a)*.044*s,y+.167*s,z+Math.sin(a)*.041*s,.64,1.5,.65);
    }
    if(flowers)for(let j=0;j<4;j++)ball(.018*s,j%2?palette.flower:palette.flowerLight,x+Math.cos(j*1.8)*.038*s,y+.215*s,z+Math.sin(j*1.8)*.029*s);
  };
  const bougainvillea = (x,z,top) => {
    pot(x,z,.95);
    beam([x,.16,z],[x,.40,z],.012,palette.wood);
    beam([x,.40,z],[x-.012,top-.055,z+.012],.009,palette.wood);
    // Connected, overlapping clusters climb a visible front column. Keep the
    // café's uppermost cluster below the roof instead of peeking over its ridge.
    for(let j=0;j<9;j++){
      const y=.235+j*(top-.30)/8,px=x+Math.sin(j*1.35)*.021,pz=z+Math.cos(j*.85)*.023;
      beam([x,y-.06,z],[px,y,pz],.005,palette.wood);
      ball(.048,j%2?palette.leaf:palette.leafLight,px,y,pz,1,1.04,1);
      if(j>1)for(let k=0;k<3;k++)
        ball(.021,k%2?palette.flowerLight:palette.flower,px+Math.cos(k*2.1)*.029,y+.015+k*.008,pz+.031,1,.95,1);
    }
  };
  const basket = (x,z) => {
    cylinder(.052,.044,.085,palette.woodLight,x,.12,z,10,'woven-basket');
    for(let j=0;j<4;j++){
      const o=mesh(geo('basket-ring',()=>new THREE.TorusGeometry(.049,.003,3,10)),palette.wood,x,.086+j*.022,z);o.rotation.x=Math.PI/2;
    }
    for(let j=0;j<8;j++){const a=j*Math.PI/4;beam([x+Math.cos(a)*.047,.078,z+Math.sin(a)*.047],[x+Math.cos(a)*.05,.162,z+Math.sin(a)*.05],.0025,palette.cream);}
  };
  terrace();
  if(type==='house'){
    // Recessed central doorway reads as a sheltered, inhabitable veranda.
    box(.69,.74,.53,palette.plaster,0,.45,-.084,'plaster-body',true);
    box(.71,.078,.55,palette.cream,0,.115,-.084,'plaster-plinth',true);
    gable(.69,.375,.113,.53,.82,-.349);
    roof(.865,1.195,-.38,.225);
    box(.205,.45,.025,palette.dark,.015,.315,.193,'entrance',true);
    for(let j=0;j<4;j++)box(.037,.43,.016,j%2?palette.teal:palette.tealLight,-.058+j*.047,.315,.211);
    for(const x of [-.108,.138])box(.026,.49,.038,palette.cream,x,.327,.211);
    box(.27,.035,.044,palette.cream,.015,.585,.211);
    ball(.01,palette.woodLight,.065,.313,.233);
    for(const x of [-.30,.30]){
      cylinder(.018,.023,.46,palette.wood,x,.31,.376,8,'veranda-post');
      box(.067,.026,.063,palette.cream,x,.095,.376,undefined,true);
      beam([x,.50,.375],[x*.73,.59,.375],.01,palette.woodLight);
    }
    box(.76,.035,.22,palette.wood,0,.573,.30,'porch-eave');
    for(let j=0;j<10;j++){
      const awning=box(.074,.027,.245,j%3===0?'#7fa5b4':palette.blue,-.342+j*.076,.594,.306,'porch-awning');awning.rotation.x=.19;
    }
    shutter(-.225,.39,.194).scale.setScalar(.70);
    shutter(.354,.47,-.09,true);
    box(.116,.13,.018,palette.cream,0,1.015,.19,'gable-vent-frame');
    box(.082,.096,.022,palette.teal,0,1.015,.202,'gable-vent');
    for(let i=0;i<4;i++)box(.075,.012,.016,palette.tealLight,0,.983+i*.022,.218);
    // A rear vent gives the asset a resolved back when the camera orbits.
    box(.125,.10,.018,palette.dark,.12,.615,-.361,'rear-vent');
    for(let i=0;i<4;i++)box(.105,.01,.023,palette.cream,.12,.58+i*.024,-.372);
    basket(-.233,.267);bougainvillea(.355,.325,.84);
  } else {
    box(.69,.535,.44,palette.plaster,0,.3375,-.115,'cafe-plaster-body',true);
    box(.71,.065,.46,palette.cream,0,.106,-.115,'cafe-plinth',true);
    gable(.69,.325,.103,.44,.605,-.335);
    roof(.65,.93,-.365,.135);
    box(.575,.305,.032,palette.dark,0,.415,.122,'serving-window');
    for(const x of [-.297,.297])box(.025,.36,.05,palette.wood,x,.422,.143,'serving-frame');
    box(.61,.032,.072,palette.woodLight,0,.603,.157,'serving-header');
    box(.61,.045,.16,palette.woodLight,0,.274,.191,'serving-counter',true);
    box(.57,.17,.035,palette.wood,0,.172,.174,'counter-apron');
    for(let i=0;i<8;i++)box(.01,.145,.009,palette.woodLight,-.255+i*.073,.174,.198);
    // Dark back recess and shelves establish depth, without fake customers.
    box(.5,.016,.06,palette.wood,.0,.43,.151,'back-shelf');
    box(.17,.42,.019,palette.teal,-.225,.295,.115,'entrance');
    for(let i=0;i<4;i++)box(.008,.39,.009,palette.tealLight,-.287+i*.04,.295,.131);
    for(const x of [-.342,.342]){
      cylinder(.014,.019,.47,palette.wood,x,.31,.365,8,'awning-post');
      beam([x,.51,.36],[x*.76,.59,.30],.008,palette.woodLight);
    }
    const stripeCount=10;
    for(let i=0;i<stripeCount;i++){
      const x=-.333+i*.074,color=i%2?palette.cream:palette.blue;
      const stripe=box(.074,.02,.327,color,x,.604,.285,'striped-awning');stripe.rotation.x=.26;
      box(.074,.049,.016,color,x,.539,.444,'awning-scallop');
      const scallop=cylinder(.036,.036,.012,color,x,.521,.446,10);scallop.rotation.x=Math.PI/2;
    }
    // Small wheel-thrown teapot, lid, spout and handle at the counter.
    ball(.035,palette.ceramic,.11,.332,.221,1,.87,1);
    cylinder(.024,.026,.009,palette.teal,.11,.363,.221,9);
    ball(.007,palette.teal,.11,.372,.221);
    beam([.133,.337,.223],[.17,.35,.223],.009,palette.ceramic);
    const handle=mesh(geo('teapot-handle',()=>new THREE.TorusGeometry(.024,.005,4,9)),palette.ceramic,.074,.337,.221);handle.rotation.y=Math.PI/2;
    for(const x of [.205,.26]){
      cylinder(.017,.012,.025,palette.ceramic,x,.313,.236,8,'tea-cup');
      cylinder(.013,.013,.002,palette.wood,x,.327,.236,8);
    }
    for(let i=0;i<3;i++)cylinder(.023,.025,.05,[palette.tile,palette.blue,palette.ceramic][i],-.05+i*.065,.46,.146,8,'shelf-jar');
    // Furniture remains inside this asset's tile and follows Move/Delete.
    box(.23,.025,.14,palette.woodLight,.045,.234,.359,'tea-table',true);
    for(const x of [-.045,.135])for(const z of [.31,.405])box(.015,.145,.015,palette.wood,x,.151,z);
    for(const x of [-.155,.235]){
      box(.095,.025,.095,palette.tileLight,x,.157,.35,'low-stool');
      for(const sx of [-1,1])for(const sz of [-1,1])box(.013,.07,.013,palette.wood,x+sx*.033,.111,.35+sz*.033);
    }
    shutter(.355,.37,-.15,true);
    pot(.365,.16,.90);basket(.25,-.34);bougainvillea(-.365,.325,.64);
  }
  // Bake static detail into one draw object per material. The entrance and
  // window remain distinct real meshes for interaction/daylight hooks. Named
  // feature anchors remain available without keeping hundreds of draw objects.
  root.updateMatrixWorld(true);
  const batches=new Map(), oldGeometry=new Set(), retainedGeometry=new Set(), named=new Set();
  const original=[];root.traverse(o=>{if(o.isMesh)original.push(o);});
  for(const o of original){
    oldGeometry.add(o.geometry);
    if(o.name==='entrance'||o.userData.window){retainedGeometry.add(o.geometry);continue;}
    const baked=o.geometry.clone().applyMatrix4(o.matrixWorld);
    // RoundedBox is non-indexed; normalise all parts before merging.
    const compatible=baked.index?baked.toNonIndexed():baked;
    if(compatible!==baked)baked.dispose();
    compatible.deleteAttribute('uv'); // No sample material uses a texture.
    if(!batches.has(o.material))batches.set(o.material,[]);
    batches.get(o.material).push(compatible);
    if(o.name&&!named.has(o.name)){
      const marker=new THREE.Object3D();marker.name=o.name;marker.position.setFromMatrixPosition(o.matrixWorld);
      marker.userData.featureAnchor=true;root.add(marker);named.add(o.name);
    }
    o.removeFromParent();
  }
  let batchIndex=0;
  for(const [surface,parts]of batches){
    const combined=mergeGeometries(parts,false);
    const o=new THREE.Mesh(combined,surface);o.name=`surface-batch-${batchIndex++}`;
    o.castShadow=true;o.receiveShadow=true;root.add(o);
    parts.forEach(g=>g.dispose());
  }
  oldGeometry.forEach(g=>{if(!retainedGeometry.has(g))g.dispose();});
  if(type==='house'){
    // The first camera review read the tall blank façade as two storeys. Keep
    // this sample a broad single-storey dwelling without changing tile scale.
    const presentation=new THREE.Group();presentation.name='single-storey-proportion';
    for(const child of [...root.children])presentation.add(child);
    presentation.scale.y=.82;root.add(presentation);
  }
  return root;
}
