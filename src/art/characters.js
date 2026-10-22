import * as THREE from 'three';

// Authored geometry, interpreted from the concept sheets. No billboard, root
// motion, simulation state or shared cross-instance disposable resources.
const appearances = {
  hai: { skin: '#b8794f', light: '#c88b5d', hair: '#b6b3a6', hairLight: '#d2cec0', shirt: '#3e5871', cuff: '#61768a', pants: '#60614a', sole: '#534637', strap: '#8c7954', width: 1.05, height: 1, age: true },
  lan: { skin: '#c48c68', light: '#d69e78', hair: '#413b36', hairLight: '#595147', shirt: '#87a89d', cuff: '#aac2b5', pants: '#c49a4d', sole: '#645544', strap: '#766348', width: 1.12, height: .95, bun: true, apron: true },
  minh: { skin: '#bd845c', light: '#d79b6a', hair: '#302e2e', hairLight: '#4b423a', shirt: '#e5d6b8', cuff: '#f0e4cd', pants: '#3e4f64', sole: '#42443f', strap: '#465462', width: .92, height: 1.04, overshirt: true, bag: true },
  an: { skin: '#c78b65', light: '#dc9f78', hair: '#35322f', hairLight: '#504139', shirt: '#ebdfc6', cuff: '#ebdfc6', pants: '#ce7d69', sole: '#a8997b', strap: '#e0cfaa', width: .93, height: .94, bob: true, overalls: true, bag: true },
};
const generic = { skin: '#b98662', light: '#cf9b75', hair: '#51453b', hairLight: '#6b5746', shirt: '#779394', cuff: '#a0b1a8', pants: '#7e7360', sole: '#584f43', strap: '#766952', width: 1, height: .98 };

export function createResidentModel(npc) {
  const appearanceId = Object.hasOwn(appearances, npc.id) ? npc.id : 'coastal-resident';
  const p = appearances[appearanceId] || generic;
  const root = new THREE.Group();
  root.name = `resident-${npc.id}`;
  root.userData.residentId = npc.id;
  root.userData.appearanceId = appearanceId;
  root.userData.artVersion = 'procedural-sample-v1';
  // Local caches belong exclusively to this resident. Teardown can safely
  // collect unique geometries/materials beneath the root and dispose once.
  const materials = new Map();
  const material = color => {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .88 }));
    return materials.get(color);
  };
  const sphereGeometry = new THREE.SphereGeometry(1, 10, 6);
  const detailGeometry = new THREE.SphereGeometry(1, 8, 4);
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const shape = (parent, geometry, color, xyz, scale, name) => {
    const mesh = new THREE.Mesh(geometry, material(color));
    mesh.position.set(...xyz); mesh.scale.set(...scale);
    if (name) mesh.name = name;
    mesh.userData.residentId = npc.id;
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  };
  const ellipsoid = (parent, color, xyz, scale, name, small = false) => shape(parent, small ? detailGeometry : sphereGeometry, color, xyz, scale, name);
  const box = (parent, color, xyz, scale, name) => shape(parent, cubeGeometry, color, xyz, scale, name);
  const joint = (name, parent, xyz) => {
    const group = new THREE.Group(); group.name = name; group.position.set(...xyz); parent.add(group); return group;
  };
  const panel = (parent, color, vertices) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));
    geometry.computeVertexNormals();
    const m = shape(parent, geometry, color, [0,0,0], [1,1,1]);
    // Explicit front and back triangles keep the collar visible from both sides.
    return m;
  };
  const body = joint('body', root, [0, 0, 0]);
  const head = joint('head', body, [0, .45, .008]);
  // Warm mature face: a broad cranial volume, shaped jaw, ears and nose. The
  // eyelids intentionally cover the upper eye to avoid a surprised toy stare.
  shape(head, new THREE.SphereGeometry(1, 16, 10), p.skin, [0,.068,0], [.057,.069,.046], 'skull');
  ellipsoid(head, p.light, [0,.039,.016], [.045,.043,.037], 'jaw');
  ellipsoid(body, p.skin, [0,.452,.002], [.024,.028,.024], 'neck');
  for (const side of [-1,1]) {
    ellipsoid(head, p.skin, [side*.057,.058,.002], [.012,.022,.012], 'ear', true);
    ellipsoid(head, '#9c6347', [side*.060,.059,.010], [.006,.012,.004], 'inner-ear', true);
    ellipsoid(head, p.light, [side*.029,.047,.036], [.024,.020,.014], 'cheek', true);
    ellipsoid(head, '#e0dac2', [side*.022,.082,.040], [.0155,.0085,.008], 'eye-white', true);
    ellipsoid(head, '#533c2a', [side*.022+.001,.081,.047], [.0065,.0065,.004], 'iris', true);
    ellipsoid(head, '#282b28', [side*.022+.001,.081,.050], [.0034,.0048,.0018], 'pupil', true);
    ellipsoid(head, '#fff7dd', [side*.022-.0005,.083,.051], [.0013,.0015,.001], 'eye-glint', true);
    ellipsoid(head, p.skin, [side*.022,.089,.044], [.0175,.006,.008], 'upper-eyelid', true);
    const brow = ellipsoid(head, p.age ? '#797d76' : p.hair, [side*.023,.099+(side > 0 ? .002 : 0),.041], [.020,.005,.0055], 'eyebrow', true);
    brow.rotation.z = side*.20;
  }
  ellipsoid(head, p.skin, [0,.065,.044], [.009,.021,.011], 'nose-bridge', true);
  ellipsoid(head, p.light, [0,.056,.056], [.013,.009,.012], 'nose', true);
  ellipsoid(head, '#a6654e', [0,.030,.047], [.023,.005,.004], 'smile', true);
  ellipsoid(head, p.light, [0,.025,.047], [.021,.004,.004], 'lower-lip', true);
  ellipsoid(head, p.light, [0,.012,.031], [.022,.012,.014], 'chin', true);
  if (p.age) {
    for (const side of [-1,1]) {
      const moustache = ellipsoid(head, '#bdbaa9', [side*.010,.039,.051], [.015,.006,.006], 'silver-moustache', true);
      moustache.rotation.z = side*.16;
      ellipsoid(head, '#a9a99b', [side*.038,.072,.040], [.006,.002,.002], 'laugh-line', true);
    }
    ellipsoid(head, '#b2afa0', [0,.011,.044], [.016,.0035,.003], 'chin-stubble', true);
  }
  // Separate broad locks follow a swept crown and receding hairline. No tiny
  // photoreal strands: the hairstyle must survive the isometric camera.
  ellipsoid(head, p.hair, [0,.111,-.013], [.058,.039,.044], 'hair-crown');
  for (const side of [-1,1]) {
    ellipsoid(head, p.hair, [side*.049,.094,-.007], [.013,.034,.032], 'temple-hair');
    ellipsoid(head, p.hair, [side*.050,.067,-.010], [.010,.020,.024], 'sideburn', true);
  }
  for (let i=0; i<5; i++) {
    const lock = ellipsoid(head, i%2 ? p.hair : p.hairLight, [-.039+i*.019,.128+Math.sin(i*.65)*.007,.004], [.021,.020,.036], 'swept-hair-lock');
    lock.rotation.z = -.30; lock.rotation.x = -.28;
  }
  if (p.bun) {
    ellipsoid(head, p.hair, [-.022,.064,-.052], [.034,.032,.029], 'low-bun');
    ellipsoid(head, p.hairLight, [-.024,.063,-.073], [.021,.019,.008], 'bun-fold', true);
  }
  if (p.bob) for (const side of [-1,1]) {
    const lock = ellipsoid(head, p.hair, [side*.050,.039,-.008], [.023,.050,.038], 'bob-lock');
    lock.rotation.z = side*.2;
  }
  // Sculpted shirt taper, fuller at shoulders than hips.
  const profile = [[.046,.278],[.060,.286],[.063,.324],[.069,.380],[.080,.412],[.062,.435],[.027,.445]];
  const torsoGeometry = new THREE.LatheGeometry(profile.map(([r,y]) => new THREE.Vector2(r,y)), 12);
  // The profile already stores local absolute Y. Rotating this mesh about
  // ground level would translate its chest through the separately authored
  // pockets/collar and bury them inside the fabric.
  shape(body, torsoGeometry, p.shirt, [0,0,0], [1,1,.64], 'shirt');
  ellipsoid(body, p.pants, [0,.277,-.003], [.063,.038,.036], 'hips');
  const front = .047;
  box(body, p.cuff, [0,.350,front], [.008,.139,.005], 'shirt-placket');
  for (const y of [.31,.35,.39]) ellipsoid(body, '#c0b99d', [0,y,front+.004], [.003,.003,.002], 'button', true);
  for (const side of [-1,1]) {
    box(body, p.shirt, [side*.038,.382,.043], [.037,.037,.006], 'breast-pocket');
    box(body, p.cuff, [side*.038,.397,.047], [.038,.004,.004], 'pocket-welt');
    ellipsoid(body, '#b9b29a', [side*.038,.391,.050], [.0025,.0025,.0015], 'pocket-button', true);
    const a = [side*.015,.443,.020], b = [side*.044,.426,.040], c = [side*.018,.405,.052];
    panel(body, p.cuff, [a,b,c,c,b,a]);
  }
  if (p.apron) {
    box(body, '#d2a04e', [0,.287,.043], [.126,.125,.010], 'apron');
    box(body, '#b78840', [0,.344,.043], [.133,.011,.012], 'apron-waist');
    box(body, '#bf9045', [0,.284,.052], [.081,.044,.007], 'apron-pocket');
  }
  if (p.overalls) {
    box(body, p.pants, [0,.355,.049], [.083,.094,.009], 'overall-bib');
    for (const side of [-1,1]) box(body, p.pants, [side*.041,.413,.042], [.015,.067,.010], 'overall-strap');
    box(body, '#bc6e5b', [0,.350,.056], [.054,.031,.007], 'overall-pocket');
  }
  if (p.overshirt) {
    box(body, '#b7654e', [0,.366,.051], [.045,.121,.008], 'undershirt');
  }
  const arms = [], legs = [];
  // One continuous garment volume per leg; gentle radius changes suggest a
  // trouser taper without the former stacked thigh/calf ellipsoid silhouette.
  const trouserGeometry = new THREE.LatheGeometry([
    [0,-.188],[.025,-.188],[.027,-.165],[.030,-.125],
    [.032,-.080],[.034,-.040],[.032,0],[.023,.010],
  ].map(([r,y]) => new THREE.Vector2(r,y)), 12);
  const cuffGeometry = new THREE.LatheGeometry([
    [.024,-.194],[.029,-.191],[.030,-.185],[.029,-.179],[.026,-.178],
  ].map(([r,y]) => new THREE.Vector2(r,y)), 12);
  for (const side of [-1,1]) {
    const name = side < 0 ? 'right' : 'left';
    const arm = joint(`${name}-arm`, body, [side*.080,.410,0]);
    arms.push(arm);
    arm.rotation.z = side*.09;
    ellipsoid(arm, p.shirt, [side*.006,-.034,0], [.026,.052,.027], 'sleeve');
    ellipsoid(arm, p.cuff, [side*.009,-.076,.001], [.027,.014,.028], 'rolled-cuff');
    ellipsoid(arm, p.skin, [side*.010,-.113,.003], [.017,.040,.017], 'forearm');
    ellipsoid(arm, p.light, [side*.011,-.158,.007], [.017,.023,.012], 'hand');
    const thumb = ellipsoid(arm, p.skin, [side*-.002,-.152,.017], [.007,.013,.008], 'thumb', true);
    thumb.rotation.z = side*.25;
    const leg = joint(`${name}-leg`, body, [side*.033,.269,0]);
    legs.push(leg);
    shape(leg, trouserGeometry, p.pants, [side*.003,0,-.001], [1,1,1.02], 'trouser-leg');
    shape(leg, cuffGeometry, p.pants, [side*.003,0,-.001], [1,1,1.02], 'trouser-cuff');
    ellipsoid(leg, p.skin, [side*.003,-.212,.001], [.018,.028,.019], 'ankle');
    ellipsoid(leg, p.sole, [side*.003,-.258,.016], [.031,.010,.047], 'sandal-sole');
    ellipsoid(leg, p.light, [side*.003,-.244,.020], [.025,.013,.038], 'foot');
    const strap = ellipsoid(leg, p.strap, [side*.003,-.235,.023], [.029,.006,.013], 'sandal-strap', true);
    strap.rotation.y = side*.14;
    ellipsoid(leg, p.strap, [side*.003,-.239,-.007], [.027,.007,.012], 'sandal-heel', true);
    for (let i=0;i<3;i++) ellipsoid(leg, p.light, [side*.003-.013+i*.012,-.244,.052], [.005,.007,.010], 'toe', true);
  }
  if (p.bag) {
    const bagColor = p.overalls ? '#386d68' : '#46576b';
    const strap = box(body, bagColor, [0,.370,.061], [.013,.19,.009], 'satchel-strap');
    strap.rotation.z = -.55;
    ellipsoid(body, bagColor, [-.065,.283,.035], [.037,.043,.021], 'satchel');
    box(body, '#ae9462', [-.065,.299,.056], [.006,.006,.004], 'satchel-clasp');
  }
  body.scale.set(p.width, p.height, 1);
  const animated = [body, head, ...arms, ...legs];
  root.userData.pose = animated.map(object => ({ object, position: object.position.clone(), rotation: object.rotation.clone(), scale: object.scale.clone() }));
  root.userData.joints = { body, head, arms, legs };
  return root;
}

export function animateResidentModel(model, { time = 0, moving = false, reducedMotion = false } = {}) {
  const pose = model.userData.pose;
  if (!pose) return;
  // Reset before applying absolute-time poses: fixed time yields identical
  // matrices, pause holds still, and reduced motion restores the authored pose.
  for (const rest of pose) {
    rest.object.position.copy(rest.position);
    rest.object.rotation.copy(rest.rotation);
    rest.object.scale.copy(rest.scale);
  }
  if (reducedMotion) return;
  const { body, head, arms, legs } = model.userData.joints;
  if (moving) {
    const phase = time * 7.0, swing = Math.sin(phase);
    for (let i=0;i<2;i++) {
      const angle = swing * .24 * (i ? -1 : 1);
      legs[i].rotation.x = angle;
      // Lift the pivot just enough that rigid grouped feet never cross ground.
      legs[i].position.y += .013 * Math.abs(swing);
      arms[i].rotation.x = -angle * .72;
    }
    head.rotation.z += Math.sin(phase)*.016;
  } else {
    body.scale.y *= 1 + Math.sin(time*1.9)*.003;
    head.rotation.y += Math.sin(time*.7)*.018;
  }
}
