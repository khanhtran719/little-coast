import test from 'node:test';
import assert from 'node:assert/strict';
import { comparisonLayout } from '../src/art/grid-comparison.js';

test('grid-only comparison preserves every model position and count while narrowing only road and grid',()=>{
  const old = comparisonLayout('baseline'), fine = comparisonLayout('fine');
  assert.deepEqual(old.buildings,fine.buildings);
  assert.deepEqual(old.residents,fine.residents);
  assert.equal(old.cellSize,1);
  assert.equal(fine.cellSize,1/3);
  assert.equal(old.road.maxZ-old.road.minZ,1);
  assert.ok(Math.abs(fine.road.maxZ-fine.road.minZ-2/3)<1e-12);
  assert.deepEqual(old.cameraBounds,fine.cameraBounds);
});

test('compact comparison changes placement rather than scale, population or framing',()=>{
  const old = comparisonLayout('fine'), compact = comparisonLayout('compact');
  assert.deepEqual(old.buildings.map(b=>b.type),compact.buildings.map(b=>b.type));
  assert.deepEqual(old.residents,compact.residents);
  assert.deepEqual(old.cameraBounds,compact.cameraBounds);
  const spread = layout => Math.max(...layout.buildings.map(b=>b.x))-Math.min(...layout.buildings.map(b=>b.x));
  assert.ok(spread(compact)<spread(old));
  assert.equal(compact.buildings.length,3);
  assert.equal(compact.residents.length,1);
  assert.throws(()=>comparisonLayout('invented'));
});
