import test from 'node:test';
import assert from 'node:assert/strict';
import { BoxGeometry, MeshBasicMaterial, Mesh, Group, Raycaster, Vector3 } from 'three';
import { pickSceneEntity, residentMotion } from '../src/art/presentation.js';

test('closest visible building occludes a resident rather than selecting people through walls', () => {
  const building = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
  building.position.z = 2; building.userData.buildingId = 'b-1';
  const resident = new Mesh(new BoxGeometry(.3, .5, .3), new MeshBasicMaterial());
  resident.userData.residentId = 'hai';
  const buildings = new Group(), residents = new Group(); buildings.add(building); residents.add(resident);
  buildings.updateMatrixWorld(true); residents.updateMatrixWorld(true);
  const raycaster = new Raycaster(new Vector3(0, 0, 5), new Vector3(0, 0, -1));
  assert.deepEqual(pickSceneEntity(raycaster, buildings, residents), { kind: 'building', id: 'b-1' });
  resident.position.z = 3; residents.updateMatrixWorld(true);
  assert.deepEqual(pickSceneEntity(raycaster, buildings, residents), { kind: 'resident', id: 'hai' });
  building.geometry.dispose(); building.material.dispose(); resident.geometry.dispose(); resident.material.dispose();
});
test('empty scenery has no invented selectable identity', () => {
  const raycaster = new Raycaster(new Vector3(0, 0, 5), new Vector3(0, 0, -1));
  assert.equal(pickSceneEntity(raycaster, new Group(), new Group()), null);
});
test('walk facing follows the next road segment, not a diagonal toward the ultimate destination', () => {
  const npc = Object.freeze({ activity: 'walking', x: 5.25, z: 7, route: [{ x: 6, z: 7 }, { x: 6, z: 8 }], targetX: 6, targetZ: 8 });
  assert.deepEqual(residentMotion(npc), { moving: true, heading: Math.PI / 2 });
  assert.deepEqual(residentMotion({ ...npc, activity: 'cafe', route: [], targetX: 6, targetZ: 7 }), { moving: false, heading: null });
});
