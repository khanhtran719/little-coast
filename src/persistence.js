import { upgradeWorld } from './migration.js';

const FORMAT = 'little-coast-save';
const MAX_BYTES = 2_000_000;
const CURRENT_VERSION = 2;
const CURRENT_KEYS = Object.freeze({ primary: 'little-coast.world.v2', backup: 'little-coast.backup.v2' });
const LEGACY_KEYS = Object.freeze({ primary: 'little-coast.world.v1', backup: 'little-coast.backup.v1' });

export function openStorage(getStorage) {
  try {
    const storage = getStorage();
    storage.getItem(CURRENT_KEYS.primary);
    return { storage, persistent: true };
  } catch {
    const memory = new Map();
    return { persistent: false, storage: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) } };
  }
}

function checksum(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}

export function encodeSave(world, validate) {
  if (world?.version !== CURRENT_VERSION) throw new Error('Chỉ có thể ghi thế giới phiên bản hiện tại.');
  validate(world);
  const payload = JSON.stringify(world);
  // Envelope v1 describes the checksum format; world.version describes the map schema.
  const text = JSON.stringify({ format: FORMAT, version: 1, checksum: checksum(payload), world });
  if (text.length > MAX_BYTES) throw new Error('Bản lưu vượt quá kích thước cho phép.');
  return text;
}

function readEnvelope(text) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) throw new Error('Bản lưu quá lớn hoặc không hợp lệ.');
  const data = JSON.parse(text);
  if (data?.format !== FORMAT || data.version !== 1 || !data.world || data.checksum !== checksum(JSON.stringify(data.world))) {
    throw new Error('Bản lưu không đúng định dạng hoặc dữ liệu đã bị thay đổi.');
  }
  return data.world;
}

function decodeRecord(text, validate, expectedVersion = null) {
  // Integrity must be checked before running either validator or the migrator.
  const original = readEnvelope(text);
  if (expectedVersion !== null && original.version !== expectedVersion) {
    throw new Error('Phiên bản thế giới không khớp khóa lưu.');
  }
  const migrated = original.version === 1;
  const world = migrated ? upgradeWorld(original) : original;
  if (world?.version !== CURRENT_VERSION) throw new Error('Phiên bản thế giới chưa được hỗ trợ.');
  validate(world);
  return { world, migrated };
}

export function decodeSave(text, validate) {
  return decodeRecord(text, validate).world;
}

export function createSaveStore(storage, validate) {
  if (typeof validate !== 'function') throw new Error('Save validation is required');
  const keys = CURRENT_KEYS;
  function save(world) {
    const encoded = encodeSave(world, validate);
    const current = storage.getItem(keys.primary);
    if (current) {
      let valid = false;
      try { decodeRecord(current, validate, CURRENT_VERSION); valid = true; } catch { /* Retain the existing backup when primary is damaged. */ }
      if (valid) storage.setItem(keys.backup, current);
    }
    storage.setItem(keys.primary, encoded);
    return encoded;
  }
  return {
    keys,
    legacyKeys: LEGACY_KEYS,
    save,
    load() {
      const current = storage.getItem(keys.primary), backup = storage.getItem(keys.backup);
      const hasCurrent = current !== null || backup !== null;
      // A present but invalid v2 record is an error, never permission to roll back to v1.
      const candidates = hasCurrent
        ? [current, backup]
        : [storage.getItem(LEGACY_KEYS.primary), storage.getItem(LEGACY_KEYS.backup)];
      if (candidates.every(value => value === null)) return { world: null, recovered: false, migrated: false };
      for (let index = 0; index < candidates.length; index++) {
        if (candidates[index] === null) continue;
        try {
          return { ...decodeRecord(candidates[index], validate, hasCurrent ? CURRENT_VERSION : 1), recovered: index === 1 };
        } catch { /* Try the same schema's Last Known Good. Loading never writes. */ }
      }
      throw new Error('Không đọc được bản lưu và điểm khôi phục. Hãy nhập một bản sao lưu hoặc chọn bắt đầu lại.');
    },
    export: world => encodeSave(world, validate),
    import(text) {
      const world = decodeSave(text, validate);
      save(world);
      return world;
    },
  };
}
