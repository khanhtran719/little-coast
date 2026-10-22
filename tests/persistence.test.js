import test from 'node:test';
import assert from 'node:assert/strict';
import { createSaveStore, encodeSave, decodeSave, openStorage } from '../src/persistence.js';

const validate = value => {
  if (value?.version !== 1 || !Number.isFinite(value.time) || !Array.isArray(value.buildings)) throw new Error('Invalid world');
  return value;
};
const fixture = time => ({ version: 1, time, buildings: [], revision: time });
function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data };
}
test('export/import preserves complete data and detects checksum corruption', () => {
  const save = encodeSave(fixture(40), validate);
  assert.deepEqual(decodeSave(save, validate), fixture(40));
  assert.throws(() => decodeSave(save.replace('"time":40', '"time":41'), validate));
});
test('an invalid world cannot replace the last valid save', () => {
  const memory = storage(), store = createSaveStore(memory, validate);
  store.save(fixture(10));
  assert.throws(() => store.save({ ...fixture(20), time: null }));
  assert.equal(store.load().world.time, 10);
});
test('a corrupted primary recovers the previous complete snapshot', () => {
  const memory = storage(), store = createSaveStore(memory, validate);
  store.save(fixture(10));
  store.save(fixture(20));
  memory.setItem(store.keys.primary, 'truncated data');
  const result = store.load();
  assert.equal(result.world.time, 10);
  assert.equal(result.recovered, true);
});
test('quota errors preserve the existing valid primary', () => {
  const memory = storage(), store = createSaveStore(memory, validate);
  store.save(fixture(10));
  memory.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => store.save(fixture(20)));
  assert.equal(store.load().world.time, 10);
});
test('invalid imports and future save formats are rejected without altering storage', () => {
  const memory = storage(), store = createSaveStore(memory, validate);
  store.save(fixture(10));
  assert.throws(() => store.import('{"format":"unknown","version":9}'));
  assert.equal(store.load().world.time, 10);
});
test('missing storage is distinct from corrupt storage and recovery does not silently reset', () => {
  const memory = storage(), store = createSaveStore(memory, validate);
  assert.equal(store.load().world, null);
  memory.setItem(store.keys.primary, '{}');
  assert.throws(() => store.load());
});
test('denied browser storage still permits an explicit temporary session and export', () => {
  const session = openStorage(() => { throw new Error('SecurityError'); });
  assert.equal(session.persistent, false);
  const store = createSaveStore(session.storage, validate);
  store.save(fixture(12));
  assert.equal(store.load().world.time, 12);
  assert.equal(decodeSave(store.export(fixture(12)), validate).time, 12);
});
