import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, place, move, placeRoad } from '../src/simulation.js';
import { constructionPlan } from '../src/construction.js';

test('a footprint preview rejects an occupied far corner and a failed placement changes nothing', () => {
  const world = createWorld();
  assert.ok(place(world, 'tree', 6, 3).ok);
  const before = JSON.stringify(world);
  const plan = constructionPlan(world, { type:'house', cell:{x:4,z:1} });
  assert.equal(plan.cells.length, 9);
  assert.equal(plan.ok, false);
  assert.equal(place(world, 'house', 4, 1).ok, false);
  assert.equal(JSON.stringify(world), before);
});

test('a Move preview uses the existing road shape and ignores its own occupied cells', () => {
  const world = createWorld();
  const road = placeRoad(world, {x:3,z:3}, {x:8,z:3}).building;
  const plan = constructionPlan(world, {type:'road', cell:{x:3,z:6}, movingId:road.id, rotation:1});
  assert.ok(plan.ok);
  assert.ok(plan.cells.length > 4);
  assert.ok(move(world, road.id, 3, 6, 1).ok);
  const final = constructionPlan(world, {type:'road', cell:{x:3,z:6}, movingId:road.id, rotation:1});
  assert.deepEqual(final.cells, plan.cells);
});

test('road draft previews a two-cell L strip and validation agrees with its committed command', () => {
  const world = createWorld();
  const from = {x:2,z:2}, to = {x:8,z:6};
  const plan = constructionPlan(world, {type:'road', cell:to, roadStart:from});
  assert.ok(plan.ok);
  const cells = new Set(plan.cells.map(p=>`${p.x},${p.z}`));
  assert.ok(cells.has('2,2') && cells.has('2,3') && cells.has('8,6') && cells.has('9,6'));
  assert.ok(placeRoad(world, from, to).ok);
});

test('all preview plans are read-only and a footprint crossing the locked edge is invalid', () => {
  const world = createWorld(), before = JSON.stringify(world);
  const plan = constructionPlan(world, {type:'cafe', cell:{x:40,z:3}, rotation:2});
  assert.equal(plan.ok, false);
  assert.equal(plan.cells.length, 9);
  assert.equal(JSON.stringify(world), before);
  assert.deepEqual(constructionPlan(world, {type:null,cell:null}).cells, []);
});
