import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3 } from 'three';
import { createResidentModel, animateResidentModel } from '../src/art/characters.js';
import { createBuildingModel } from '../src/art/buildings.js';
import { createWorld, validateWorld } from '../src/simulation.js';
import { encodeSave, decodeSave } from '../src/persistence.js';

function freezeDeep(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeDeep);
    Object.freeze(value);
  }
  return value;
}

function disposeModels(models) {
  const geometries = new Set(), materials = new Set();
  for (const model of models) model.traverse(node => {
    if (node.geometry) geometries.add(node.geometry);
    for (const material of [node.material].flat()) if (material) materials.add(material);
  });
  geometries.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
}

// Compare generated appearance without depending on Three.js object UUIDs or allocation order.
function visualSignature(model) {
  model.updateMatrixWorld(true);
  const parts = [];
  model.traverse(node => {
    if (!node.isMesh) return;
    parts.push({
      transform: node.matrixWorld.toArray(),
      positions: Array.from(node.geometry.attributes.position.array),
      colors: [node.material].flat().map(material => material.color?.getHex()),
    });
  });
  return JSON.stringify(parts);
}

test('presentation factories and walk animation do not modify the canonical seed world', () => {
  const world = freezeDeep(createWorld());
  const before = JSON.stringify(world);
  const models = world.residents.map(resident => createResidentModel(resident));
  for (const model of models) {
    animateResidentModel(model, { time: world.time, moving: true, reducedMotion: false });
  }
  for (const building of world.buildings.filter(item => ['house', 'cafe'].includes(item.type))) {
    models.push(createBuildingModel(building.type, freezeDeep({ region: 'lang-chai', variant: 0 })));
  }
  assert.equal(JSON.stringify(world), before);
  assert.doesNotThrow(() => validateWorld(world));
  disposeModels(models);
});

test('resident appearance survives canonical list reordering and validated save reload', () => {
  const world = createWorld(), models = [];
  const original = new Map(world.residents.map(resident => {
    const model = createResidentModel(resident); models.push(model);
    return [resident.id, visualSignature(model)];
  }));
  world.residents.reverse();
  const loaded = decodeSave(encodeSave(world, validateWorld), validateWorld);
  for (const resident of loaded.residents) {
    const model = createResidentModel(resident); models.push(model);
    assert.equal(model.userData.residentId, resident.id);
    assert.equal(visualSignature(model), original.get(resident.id), resident.id);
  }
  assert.equal(new Set(original.values()).size, 4, 'each canonical resident has a distinct 3D appearance');
  disposeModels(models);
});

test('animation preserves canonical transform and identity, with deterministic pause and finite matrices', () => {
  const model = createResidentModel({ id: 'hai', name: 'Bác Hải' });
  model.position.set(5.25, .1, 7);
  model.rotation.y = -Math.PI / 2;
  const originalTransform = [...model.position.toArray(), ...model.quaternion.toArray(), ...model.scale.toArray()];
  const residentId = model.userData.residentId;
  for (const reducedMotion of [false, true]) for (const moving of [true, false]) {
    const state = { time: 492.375, moving, reducedMotion };
    animateResidentModel(model, state);
    const paused = visualSignature(model);
    animateResidentModel(model, state);
    assert.equal(visualSignature(model), paused, 'same paused simulation time has no pose drift');
    assert.deepEqual([...model.position.toArray(), ...model.quaternion.toArray(), ...model.scale.toArray()], originalTransform);
    assert.equal(model.userData.residentId, residentId);
    model.traverse(node => assert.ok(node.matrixWorld.elements.every(Number.isFinite)));
  }
  disposeModels([model]);
});

test('deleting one factory instance cannot dispose the resources still used by another instance', () => {
  const pairs = [
    [createResidentModel({ id: 'hai' }), createResidentModel({ id: 'hai' })],
    [createBuildingModel('house', { region: 'lang-chai' }), createBuildingModel('house', { region: 'lang-chai' })],
    [createBuildingModel('cafe', { region: 'xom-bien' }), createBuildingModel('cafe', { region: 'xom-bien' })],
  ];
  for (const [removed, retained] of pairs) {
    let retainedDisposals = 0;
    retained.traverse(node => {
      if (node.geometry) node.geometry.addEventListener('dispose', () => retainedDisposals++);
      for (const material of [node.material].flat()) if (material) material.addEventListener('dispose', () => retainedDisposals++);
    });
    disposeModels([removed]);
    assert.equal(retainedDisposals, 0, 'scene disposal owns instance resources; no shared factory cache may be destroyed');
    disposeModels([retained]);
  }
});

test('both region variants of sample buildings fit the canonical tile in every supported orientation', () => {
  const models = [];
  for (const type of ['house', 'cafe']) for (const region of ['lang-chai', 'xom-bien']) {
    const model = createBuildingModel(type, freezeDeep({ region, variant: 0 })); models.push(model);
    const entrance = model.getObjectByName('entrance');
    assert.ok(entrance, `${type} ${region}: entrance`);
    assert.ok(entrance.position.z > 0, 'front entrance faces canonical +Z before rotation');
    for (let turn = 0; turn < 4; turn++) {
      model.rotation.y = turn * Math.PI / 2;
      model.updateMatrixWorld(true);
      const bounds = new Box3().setFromObject(model), size = bounds.getSize(new Vector3());
      assert.ok(bounds.min.toArray().every(Number.isFinite) && bounds.max.toArray().every(Number.isFinite));
      assert.ok(bounds.min.x >= -.5 && bounds.max.x <= .5 && bounds.min.z >= -.5 && bounds.max.z <= .5,
        `${type} ${region} turn ${turn}: ${JSON.stringify(bounds)}`);
      assert.ok(bounds.min.y >= -.01 && size.y < 1.6, `${type} ${region}: ground or height`);
    }
  }
  disposeModels(models);
});
