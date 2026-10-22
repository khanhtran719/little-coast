import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSaveStore, decodeSave, encodeSave, openStorage } from '../src/persistence.js';

const legacyFixture = JSON.parse(readFileSync(new URL('./fixtures/world-v1.json', import.meta.url), 'utf8'));
const legacyKeys = { primary: 'little-coast.world.v1', backup: 'little-coast.backup.v1' };
const currentKeys = { primary: 'little-coast.world.v2', backup: 'little-coast.backup.v2' };
const validate = world => {
  if (world?.version !== 2 || !Number.isFinite(world.time) || !Array.isArray(world.buildings)) throw new Error('Invalid current world');
  return world;
};
const currentFixture = time => ({ version: 2, time, buildings: [], revision: time });
function storage(entries = []) {
  const data = new Map(entries);
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
// Reproduce the original v1 checksummed format without using the current-only writer.
function oldEnvelope(world = legacyFixture) {
  let hash = 2166136261;
  const payload = JSON.stringify(world);
  for (let i = 0; i < payload.length; i++) hash = Math.imul(hash ^ payload.charCodeAt(i), 16777619);
  return JSON.stringify({ format: 'little-coast-save', version: 1, checksum: (hash >>> 0).toString(16), world });
}

test('normal writes use v2 keys and never change either legacy snapshot', () => {
  const primary = oldEnvelope(), backup = `  ${primary}\n`;
  const memory = storage([[legacyKeys.primary, primary], [legacyKeys.backup, backup]]);
  const store = createSaveStore(memory, validate);
  store.save(currentFixture(500));
  store.save(currentFixture(510));
  assert.deepEqual(store.keys, currentKeys);
  assert.equal(memory.getItem(legacyKeys.primary), primary);
  assert.equal(memory.getItem(legacyKeys.backup), backup);
  assert.equal(decodeSave(memory.getItem(currentKeys.primary), validate).time, 510);
  assert.equal(decodeSave(memory.getItem(currentKeys.backup), validate).time, 500);
});

test('legacy load upgrades in memory with exact identity, clock and no storage writes', () => {
  const text = oldEnvelope();
  const memory = storage([[legacyKeys.primary, text]]), before = [...memory.data];
  const loaded = createSaveStore(memory, validate).load();
  assert.equal(loaded.world.version, 2);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.recovered, false);
  assert.equal(loaded.world.time, legacyFixture.time);
  assert.deepEqual(loaded.world.residents, legacyFixture.residents);
  assert.deepEqual(loaded.world.buildings.map(b => b.id), legacyFixture.buildings.map(b => b.id));
  assert.deepEqual([...memory.data], before);
});

test('legacy backup can recover absent or corrupt v1 primary without touching either key', () => {
  for (const primary of [null, 'broken']) {
    const text = oldEnvelope();
    const memory = storage([[legacyKeys.backup, text], ...(primary ? [[legacyKeys.primary, primary]] : [])]);
    const before = [...memory.data];
    const loaded = createSaveStore(memory, validate).load();
    assert.equal(loaded.world.version, 2);
    assert.equal(loaded.migrated, true);
    assert.equal(loaded.recovered, true);
    assert.deepEqual([...memory.data], before);
  }
});

test('v2 takes precedence and corrupt v2 cannot silently roll back to good v1', () => {
  const old = oldEnvelope();
  const memory = storage([[legacyKeys.primary, old], [currentKeys.primary, encodeSave(currentFixture(700), validate)]]);
  const store = createSaveStore(memory, validate);
  assert.equal(store.load().world.time, 700);
  assert.equal(store.load().migrated, false);
  memory.setItem(currentKeys.primary, 'corrupt');
  assert.throws(() => store.load(), /khôi phục/);
  assert.equal(memory.getItem(legacyKeys.primary), old);
});

test('corrupt v2 recovers v2 backup while preserving good v1 and rejecting empty v2 records', () => {
  const memory = storage([[legacyKeys.primary, oldEnvelope()], [currentKeys.primary, ''], [currentKeys.backup, encodeSave(currentFixture(650), validate)]]);
  const before = [...memory.data];
  const loaded = createSaveStore(memory, validate).load();
  assert.equal(loaded.world.time, 650);
  assert.equal(loaded.recovered, true);
  assert.equal(loaded.migrated, false);
  assert.deepEqual([...memory.data], before);
  memory.setItem(currentKeys.backup, '');
  assert.throws(() => createSaveStore(memory, validate).load());
});

test('v1 import validates before migration and saves v2 without mutating input or legacy data', () => {
  const text = oldEnvelope(), memory = storage([[legacyKeys.primary, text]]);
  const store = createSaveStore(memory, validate), imported = store.import(text);
  assert.equal(imported.version, 2);
  assert.equal(memory.getItem(legacyKeys.primary), text);
  assert.equal(JSON.parse(memory.getItem(currentKeys.primary)).world.version, 2);
  const before = [...memory.data];
  const invalid = structuredClone(legacyFixture);
  invalid.buildings[1].id = invalid.buildings[0].id;
  assert.throws(() => store.import(oldEnvelope(invalid)));
  assert.throws(() => store.import(text.replace('"time":480', '"time":481')));
  assert.deepEqual([...memory.data], before);
});

test('checksum is rejected before running validation or migration', () => {
  const data = JSON.parse(oldEnvelope());
  data.world.version = 99;
  let validations = 0;
  assert.throws(() => decodeSave(JSON.stringify(data), () => { validations++; }), /đã bị thay đổi/);
  assert.equal(validations, 0);
});

test('current writer rejects v1 or malformed v2 and migration quota failures retain legacy copies', () => {
  const text = oldEnvelope(), memory = storage([[legacyKeys.primary, text], [legacyKeys.backup, text]]);
  const store = createSaveStore(memory, validate);
  assert.throws(() => store.save(legacyFixture));
  assert.throws(() => store.save({ ...currentFixture(500), time: null }));
  const migrated = store.load().world;
  memory.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.throws(() => store.save(migrated));
  assert.equal(memory.getItem(legacyKeys.primary), text);
  assert.equal(memory.getItem(legacyKeys.backup), text);
  assert.equal(memory.getItem(currentKeys.primary), null);
});

test('storage availability probes current key and blocked sessions still export current data', () => {
  const readable = storage();
  readable.getItem = key => { if (key !== currentKeys.primary) throw new Error('Unexpected key'); return null; };
  assert.equal(openStorage(() => readable).persistent, true);
  const denied = openStorage(() => { throw new Error('SecurityError'); });
  assert.equal(denied.persistent, false);
  const store = createSaveStore(denied.storage, validate);
  store.save(currentFixture(555));
  assert.equal(decodeSave(store.export(store.load().world), validate).time, 555);
});
