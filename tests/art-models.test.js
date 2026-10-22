import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3, Raycaster } from 'three';
import { createResidentModel, animateResidentModel } from '../src/art/characters.js';
import { createBuildingModel } from '../src/art/buildings.js';

function bounds(object) { object.updateMatrixWorld(true); return new Box3().setFromObject(object); }
function dispose(object) {
  const geometry = new Set(), materials = new Set();
  object.traverse(o => { if (o.geometry) geometry.add(o.geometry); if (o.material) materials.add(o.material); });
  geometry.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
}
test('Hải model is an ID-bound 3D figure with feet at ground and readable human scale', () => {
  const npc = Object.freeze({ id: 'hai', name: 'Bác Hải' });
  const model = createResidentModel(npc);
  const box = bounds(model), size = box.getSize(new Vector3());
  assert.equal(model.userData.residentId, 'hai');
  assert.ok(size.y >= .50 && size.y <= .68, `height ${size.y}`);
  assert.ok(box.min.y >= -.015 && box.min.y <= .02, `feet ${box.min.y}`);
  assert.ok(size.x < .35 && size.z < .35, `body bounds ${size.toArray()}`);
  assert.ok(model.getObjectByName('head'));
  assert.ok(model.getObjectByName('left-leg'));
  assert.ok(model.getObjectByName('right-arm'));
  dispose(model);
});
test('appearance follows canonical identity rather than resident array index', () => {
  const first = createResidentModel({ id: 'hai' });
  const second = createResidentModel({ id: 'hai' });
  assert.equal(first.userData.appearanceId, second.userData.appearanceId);
  assert.equal(first.userData.appearanceId, 'hai');
  const other = createResidentModel({ id: 'new-resident-77' });
  assert.notEqual(other.userData.appearanceId, 'hai');
  dispose(first); dispose(second); dispose(other);
});
test('shirt front details remain visible outside the torso rather than buried by its lean', () => {
  const model = createResidentModel({ id: 'hai' });
  model.updateMatrixWorld(true);
  const placket = model.getObjectByName('shirt-placket');
  const center = new Box3().setFromObject(placket).getCenter(new Vector3());
  const raycaster = new Raycaster(new Vector3(center.x, center.y, 1), new Vector3(0, 0, -1));
  const hits = raycaster.intersectObject(model, true);
  assert.ok(hits.length > 0);
  assert.notEqual(hits[0].object.name, 'shirt', 'front fastening must not be occluded by the shirt volume');
  dispose(model);
});
test('in-place walk animation is deterministic at a fixed simulation time and never moves canonical root', () => {
  const model = createResidentModel({ id: 'hai' });
  model.position.set(5, .1, 7);
  animateResidentModel(model, { time: 480.2, moving: true, reducedMotion: false });
  const start = model.getObjectByName('left-leg').rotation.x;
  animateResidentModel(model, { time: 480.2, moving: true, reducedMotion: false });
  assert.equal(model.getObjectByName('left-leg').rotation.x, start);
  assert.deepEqual(model.position.toArray(), [5, .1, 7]);
  animateResidentModel(model, { time: 480.7, moving: true, reducedMotion: false });
  assert.notEqual(model.getObjectByName('left-leg').rotation.x, start);
  animateResidentModel(model, { time: 481, moving: false, reducedMotion: true });
  assert.ok(Math.abs(model.getObjectByName('left-leg').rotation.x) < .001);
  dispose(model);
});
for (const type of ['house', 'cafe']) {
  test(`${type} has solid geometry, contained one-tile bounds and works in every quarter turn`, () => {
    const model = createBuildingModel(type, { region: 'lang-chai', variant: 0 });
    assert.ok(model?.isGroup);
    let count = 0; model.traverse(o => { if (o.isMesh) count++; });
    assert.ok(count > 0, 'asset contains actual 3D mesh geometry');
    for (let turn = 0; turn < 4; turn++) {
      model.rotation.y = turn * Math.PI / 2;
      const box = bounds(model), size = box.getSize(new Vector3());
      assert.ok(box.min.x >= -.5 && box.max.x <= .5 && box.min.z >= -.5 && box.max.z <= .5, `${type} turn ${turn} ${box.min.toArray()} ${box.max.toArray()}`);
      assert.ok(box.min.y >= -.01 && size.y > .7 && size.y < 1.6);
    }
    assert.ok(model.getObjectByName('entrance'));
    dispose(model);
  });
}
test('building factory returns null for out-of-scope types rather than pretending an asset exists', () => {
  assert.equal(createBuildingModel('pier', { region: 'lang-chai' }), null);
});
