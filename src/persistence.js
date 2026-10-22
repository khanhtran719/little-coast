const FORMAT = 'little-coast-save';
const MAX_BYTES = 2_000_000;

export function openStorage(getStorage) {
  try {
    const storage = getStorage();
    storage.getItem('little-coast.world.v1');
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
  validate(world);
  const payload = JSON.stringify(world);
  const text = JSON.stringify({ format: FORMAT, version: 1, checksum: checksum(payload), world });
  if (text.length > MAX_BYTES) throw new Error('Bản lưu vượt quá kích thước cho phép.');
  return text;
}

export function decodeSave(text, validate) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) throw new Error('Bản lưu quá lớn hoặc không hợp lệ.');
  const data = JSON.parse(text);
  if (data?.format !== FORMAT || data.version !== 1 || !data.world || data.checksum !== checksum(JSON.stringify(data.world))) {
    throw new Error('Bản lưu không đúng định dạng hoặc dữ liệu đã bị thay đổi.');
  }
  validate(data.world);
  return data.world;
}

export function createSaveStore(storage, validate) {
  if (typeof validate !== 'function') throw new Error('Save validation is required');
  const keys = { primary: 'little-coast.world.v1', backup: 'little-coast.backup.v1' };
  function save(world) {
    const encoded = encodeSave(world, validate);
    const current = storage.getItem(keys.primary);
    if (current) {
      let valid = false;
      try { decodeSave(current, validate); valid = true; } catch { /* Retain the existing backup when primary is damaged. */ }
      if (valid) storage.setItem(keys.backup, current);
    }
    storage.setItem(keys.primary, encoded);
    return encoded;
  }
  return {
    keys,
    save,
    load() {
      const current = storage.getItem(keys.primary), backup = storage.getItem(keys.backup);
      if (!current && !backup) return { world: null, recovered: false };
      if (current) {
        try { return { world: decodeSave(current, validate), recovered: false }; } catch { /* Try last known good. */ }
      }
      if (backup) {
        try { return { world: decodeSave(backup, validate), recovered: true }; } catch { /* Report corruption without silently creating a new save. */ }
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
