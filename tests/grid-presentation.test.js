import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCellOverlay, createRoadSurface } from '../src/art/grid-presentation.js';

const bounds = object => new THREE.Box3().setFromObject(object);
test('fine-cell overlay outlines an L footprint without filling its unowned corner', () => {
  const cells = Object.freeze([{x: 3,z: 6},{x: 4,z: 6},{x: 3,z: 7}].map(Object.freeze));
  const overlay = createCellOverlay(cells);
  const box = bounds(overlay);
  assert.ok(Math.abs(box.min.x - .5) < 1e-6);
  assert.ok(Math.abs(box.max.x - 7/6) < 1e-6);
  assert.ok(Math.abs(box.min.z - 1.5) < 1e-6);
  assert.ok(Math.abs(box.max.z - 13/6) < 1e-6);
  overlay.updateMatrixWorld(true);
  const ray = new THREE.Raycaster(new THREE.Vector3(1,4,2),new THREE.Vector3(0,-1,0));
  assert.equal(ray.intersectObjects(overlay.children, true).filter(hit=>hit.object.isMesh).length,0);
  assert.equal(overlay.children.find(o=>o.isLineSegments).geometry.attributes.position.count,16);
});

test('road surface owns only canonical cells and stays at ground, preserving a concave shape', () => {
  const building = {id:'r1',type:'road',x:3,z:6,rotation:0,roadWidth:2,cells:[{x:0,z:0},{x:1,z:0},{x:0,z:1}]};
  const original = JSON.stringify(building);
  const road = createRoadSurface(building);
  const box = bounds(road);
  assert.ok(box.max.y < .04);
  assert.ok(Math.abs(box.max.x-box.min.x-2/3) < .005);
  road.updateMatrixWorld(true);
  const ray = new THREE.Raycaster(new THREE.Vector3(1,4,2),new THREE.Vector3(0,-1,0));
  assert.equal(ray.intersectObject(road,true).length,0);
  assert.equal(JSON.stringify(building), original);
});
