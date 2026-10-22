import './style.css';
import { icon } from './icons.js';
import { createScene } from './scene.js';
import { createWorld, stats, place, remove, move, canPlace, tick, setMode, setAmbient, setWeather, getDialogue, unlockRegion, validateWorld, buildingStatus, CATALOG, MAP } from './simulation.js';
import { createSaveStore, openStorage } from './persistence.js';

const $ = selector => document.querySelector(selector);
const escape = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const app = $('#app');
const toolNames = { house: 'Nhà ở', road: 'Lối đi', cafe: 'Quán nước', tree: 'Cây xanh', bench: 'Ghế nghỉ', market: 'Chợ cá', pier: 'Bến cá' };
let world = createWorld(), scene, selectedId = null, tool = null, movingId = null, rotation = 0;
let writer = false, blocked = false, lastSavedRevision = -1, lastSave = 0, toastTimer;
let hoverCell = null, cursor = { x: 6, z: 8 }, ambient = false, audioContext, audioGain, audioOn = false;
let reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let panelKey = '';
let lastFrameTime = performance.now();
const storageSession = openStorage(() => window.localStorage);
const store = createSaveStore(storageSession.storage, validateWorld);

app.insertAdjacentHTML('beforeend', `
  <div class="hud" id="hud">
    <header class="brand"><div class="brand-mark">${icon('wave')}</div><div><h1 class="brand-title">Little Coast</h1><div class="brand-subtitle">Một chút bình yên bên biển</div></div></header>
    <div class="top-right">
      <div class="time-card glass"><div><div class="day" id="day">Ngày 1 · Làng Chài</div><div class="time" id="clock">08:00</div></div><div class="time-divider"></div><button class="weather-button" id="weather-button" aria-label="Đổi thời tiết">${icon('sun')}<span>Nắng nhẹ</span></button></div>
      <button class="square glass" id="audio-button" title="Bật tiếng biển" aria-label="Bật tiếng biển" aria-pressed="false">${icon('mute')}</button>
      <button class="square glass" id="journal-button" title="Nhật ký làng" aria-label="Nhật ký làng">${icon('book')}</button>
      <button class="square glass" id="ambient-button" title="Ngắm cảnh" aria-label="Ngắm cảnh" aria-pressed="false">${icon('eye')}</button>
      <button class="square glass" id="settings-button" title="Lưu và tùy chọn" aria-label="Lưu và tùy chọn">${icon('gear')}</button>
    </div>
    <section class="population glass" aria-label="Dân cư và chỗ ở"><div class="stat"><div class="stat-top">${icon('people')}<span id="population">4</span></div><small>Cư dân trong làng</small></div><div class="stat"><div class="stat-top">${icon('house')}<span id="vacancies">0</span></div><small>Chỗ ở còn trống</small></div></section>
    <div class="location">Làng Chài · Ven biển Việt Nam</div>
    <aside class="side-panel glass" id="side-panel" aria-label="Thông tin làng"></aside>
    <div class="camera-controls"><button class="square glass" id="zoom-in" aria-label="Phóng to">+</button><button class="square glass" id="zoom-out" aria-label="Thu nhỏ">−</button><button class="square glass" id="rotate-view" aria-label="Xoay góc nhìn">${icon('rotate')}</button><button class="square glass" id="help-button" aria-label="Hướng dẫn điều khiển">${icon('help')}</button></div>
    <div class="tool-hint" id="tool-hint" role="status"></div>
    <nav class="toolbar glass" aria-label="Công cụ xây dựng">${Object.entries(toolNames).map(([type, name], i) => `<button class="tool" data-tool="${type}" aria-label="Xây ${name.toLowerCase()}" aria-pressed="false"><kbd>${i + 1}</kbd>${icon(type)}<span>${name}</span></button>`).join('')}<div class="toolbar-caption">Xây một góc làng. Kể một câu chuyện.</div></nav>
    <aside class="region-card" id="region-card"></aside>
    <div class="time-controls glass" role="group" aria-label="Tốc độ thời gian"><small id="mode-label">Đang sống</small><button class="square" data-mode="pause" aria-label="Scenic Pause — dừng thời gian" aria-pressed="false">${icon('pause')}</button><button class="square" data-mode="slow" aria-label="Slow — thời gian chậm" aria-pressed="false">${icon('slow')}</button><button class="square" data-mode="living" aria-label="Living — thời gian bình thường" aria-pressed="true">${icon('play')}</button></div>
    <div class="prototype-label">BẢN CHƠI THỬ · LƯU TRÊN MÁY</div>
    <button class="ambient-exit glass" id="exit-ambient">${icon('eye')}Trở về xây dựng <span class="muted">Esc</span></button>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  </div>
  <dialog class="dialog" id="dialog" aria-labelledby="dialog-title"></dialog>
  <input class="sr-only" type="file" accept=".json,application/json" id="import-file" aria-label="Nhập bản lưu Little Coast" />
`);

function toast(text) {
  const element = $('#toast'); element.textContent = text; element.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), 3800);
}
function canEdit() {
  if (blocked) { toast('Hãy chọn khôi phục hoặc bắt đầu làng mới trước.'); return false; }
  if (!writer) { toast('Làng đang mở ở tab khác. Đóng tab đó rồi tải lại để tiếp tục.'); return false; }
  return true;
}
function save(manual = false) {
  if (!writer || blocked) return false;
  try {
    store.save(world); lastSavedRevision = world.revision; lastSave = performance.now();
    if (manual) toast(storageSession.persistent ? 'Đã lưu làng trên trình duyệt này.' : 'Đã giữ tạm trong phiên này. Hãy xuất bản sao trước khi đóng.');
    return true;
  } catch (error) { toast(`Chưa lưu được. Hãy xuất bản sao lưu. ${error.message}`); return false; }
}
function commit(result) {
  toast(result.message);
  if (result.ok) { save(); refresh(); }
  return result.ok;
}
function setTool(type) {
  tool = type; movingId = null; rotation = 0;
  scene?.setTool(type); scene?.setRotation(rotation);
  document.querySelectorAll('[data-tool]').forEach(button => button.setAttribute('aria-pressed', button.dataset.tool === type));
  if (type) {
    selectedId = null;
    showTool(type);
    $('#tool-hint').innerHTML = `<span>${escape(CATALOG[type].name)}</span><span class="keyboard-hint"><kbd>R</kbd> Xoay · <kbd>Esc</kbd> Hủy</span>`;
  } else { $('#tool-hint').textContent = ''; renderPanel(); }
}
function onCell({ x, z }) {
  cursor = { x, z };
  if (!tool || !canEdit()) return;
  const result = movingId ? move(world, movingId, x, z, rotation) : place(world, tool, x, z, rotation);
  if (commit(result) && movingId) { selectedId = result.building.id; setTool(null); }
}
function onHover(cell) {
  hoverCell = cell;
  if (cell && tool) scene?.setPreview(canPlace(world, tool, cell.x, cell.z, movingId).ok);
}
function selectBuilding({ id }) {
  if (tool) return;
  selectedId = id;
  renderPanel();
}
function showTool(type) {
  panelKey = '';
  const descriptions = {
    house: 'Một mái nhà mới, thêm hai chỗ ở. Nối lối đi về làng để đón cư dân; người sẽ đến theo nhịp riêng.',
    road: 'Nối những góc làng lại với nhau. Một lối đi chỉ hoạt động khi liền mạch với đường vào làng.',
    cafe: 'Một nơi ngồi lại bên tách trà. Người trong làng sẽ ghé khi có lối vào và một chút thời gian rảnh.',
    tree: 'Thêm một bóng xanh bên mái nhà hoặc lối dạo. Cây tạo cảnh quan, không tự sinh thêm cư dân.',
    bench: 'Một chỗ dừng chân nhìn làng. Đặt cạnh đường có kết nối để người trong xóm có thể ghé nghỉ.',
    market: 'Một góc tụ họp buổi sáng. Cần đường nối làng và bến cá đang hoạt động cùng mạng đường.',
    pier: 'Nơi thuyền ra khơi rồi trở về. Đặt ở hàng đất sát biển và nối lối đi; bến cá không tự đón dân.',
  };
  $('#side-panel').hidden = false;
  $('#side-panel').innerHTML = `<button class="panel-close" data-action="cancel-tool" aria-label="Hủy công cụ">${icon('close')}</button><div class="panel-eyebrow">${icon(type)} Đang xây dựng</div><h2>${CATALOG[type].name}</h2><p>${descriptions[type]}</p><div class="status-badge">Không tốn tiền hay vật liệu</div><div class="panel-rule"></div><p class="compact-tip">Chọn một ô đất để đặt. Kéo để xoay cảnh, cuộn để phóng to. Bàn phím: chọn vùng cảnh, dùng ← ↑ → ↓ và Enter.</p>`;
}
function renderPanel() {
  if (tool) return;
  const panel = $('#side-panel');
  const building = world.buildings.find(b => b.id === selectedId);
  if (building) {
    const status = buildingStatus(world, building);
    const key = `${building.id}:${status.label}:${status.occupancy}:${status.connected}`;
    panel.hidden = false;
    if (panelKey === key) return;
    panelKey = key;
    panel.innerHTML = `<button class="panel-close" data-action="close-panel" aria-label="Đóng thông tin">${icon('close')}</button><div class="panel-eyebrow">${icon(building.type)} Một góc của làng</div><h2>${escape(CATALOG[building.type].name)}</h2><div class="status-badge">${escape(status.label)}</div><p>${escape(CATALOG[building.type].description)}</p>${building.type === 'house' ? `<p><strong>${status.occupancy}/2</strong> người đang ở · ${status.connected ? 'Có lối vào hợp lệ' : 'Chưa nối đường vào làng'}</p>` : ''}<div class="panel-rule"></div><div class="button-row"><button class="secondary-button" data-action="move-building">${icon('move')}Di chuyển</button><button class="secondary-button danger" data-action="remove-building">${icon('trash')}Dỡ bỏ</button></div>`;
    return;
  }
  const hour = world.time % 1440 / 60;
  const greeting = hour < 12 ? 'sáng' : hour < 18 ? 'chiều' : 'tối';
  const key = `welcome:${greeting}`;
  panel.hidden = false;
  if (panelKey === key) return;
  panelKey = key;
  panel.innerHTML = `<button class="panel-close" data-action="close-panel" aria-label="Đóng lời chào">${icon('close')}</button><div class="panel-eyebrow">${icon('wave')} Chào buổi ${greeting}</div><h2>Làng nhỏ,<br>chuyện của bạn.</h2><p>Một xóm nhỏ đã ở đây. Bạn muốn bờ biển này đổi khác thế nào?</p><div class="hint-row">${icon('road')}<span>Nối thêm một lối dạo,<br>để những bước chân tìm đến.</span></div><div class="hint-row">${icon('cafe')}<span>Mở một quán nước,<br>cho xóm có chỗ ngồi lại.</span></div><div class="panel-rule"></div><button class="text-button" data-action="talk">Ghé chào bác Hải ${icon('arrow')}</button>`;
}
function refresh() {
  const s = stats(world), minute = Math.floor(world.time % 1440);
  $('#population').textContent = s.population;
  $('#vacancies').textContent = Math.max(0, s.capacity - s.housed);
  $('#clock').textContent = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
  $('#day').textContent = `Ngày ${Math.floor(world.time / 1440) + 1} · Làng Chài`;
  const weather = { sunny: ['sun', 'Nắng nhẹ'], cloudy: ['cloudy', 'Mây nhẹ'], rain: ['rain', 'Mưa êm'] }[world.weather];
  $('#weather-button').innerHTML = `${icon(weather[0])}<span>${weather[1]}</span>`;
  $('#mode-label').textContent = { living: 'Đang sống', slow: 'Chầm chậm', pause: 'Dừng ngắm' }[world.mode];
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', button.dataset.mode === world.mode));
  const cafe = world.buildings.some(b => b.type === 'cafe' && buildingStatus(world, b).connected);
  const bench = world.buildings.some(b => b.type === 'bench' && buildingStatus(world, b).connected);
  const goals = Number(s.connected >= 6) + Number(cafe) + Number(bench);
  $('#region-card').innerHTML = `<div class="region-title">${icon(world.regionUnlocked ? 'wave' : 'lock')} Xóm Biển</div><p>${world.regionUnlocked ? 'Một dải bờ biển mới đã sẵn sàng cho câu chuyện của bạn.' : `${s.connected}/6 cư dân có kết nối · ${cafe ? '✓' : '○'} Quán nước · ${bench ? '✓' : '○'} Ghế nghỉ`}</p>${world.regionUnlocked ? '' : `<progress value="${goals}" max="3" aria-label="Tiến trình mở Xóm Biển"></progress><button class="text-button" data-action="unlock" ${goals < 3 ? 'disabled' : ''}>${goals === 3 ? 'Mở Xóm Biển' : 'Một chặng nhỏ phía trước'} ${icon('arrow')}</button>`}`;
  if (selectedId) renderPanel();
}
const dialog = $('#dialog');
function showDialog(title, body, eyebrow = 'Little Coast', closable = true) {
  dialog.innerHTML = `<div class="dialog-inner">${closable ? `<button class="panel-close" data-action="close-dialog" aria-label="Đóng">${icon('close')}</button>` : ''}<div class="panel-eyebrow">${escape(eyebrow)}</div><h2 id="dialog-title">${escape(title)}</h2>${body}</div>`;
  if (!dialog.open) dialog.showModal();
}
dialog.addEventListener('cancel', event => { if (blocked) event.preventDefault(); });
function talk() {
  const npc = world.residents.find(n => n.id === 'hai');
  if (!npc || npc.state === 'temporarilyAway') { toast('Bác Hải đang tạm vắng. Ký ức của bác vẫn được giữ.'); return; }
  const text = getDialogue(world, 'hai');
  showDialog('Bác Hải', `<div class="dialog-portrait" aria-hidden="true">H</div><p class="dialogue-text">${escape(text)}</p><div class="dialogue-options"><button class="secondary-button" data-action="talk">Bác thấy xóm mình hôm nay thế nào? ${icon('arrow')}</button><button class="secondary-button" data-action="close-dialog">Cháu ra ngắm biển một chút.</button></div>`, 'Một người trong xóm');
  if (writer && !blocked) save();
}
function journal() {
  showDialog('Chuyện làng mình', `<p>Những điều đã diễn ra, được giữ lại ở đây.</p><div class="journal-list">${world.journal.length ? [...world.journal].reverse().map(entry => `<article class="journal-entry"><small>Ngày ${Math.floor(entry.time / 1440) + 1} · ${String(Math.floor(entry.time % 1440 / 60)).padStart(2, '0')}:${String(Math.floor(entry.time % 60)).padStart(2, '0')}</small><p>${escape(entry.text)}</p></article>`).join('') : '<p class="empty-journal">Những câu chuyện đang chờ được viết…</p>'}</div>`, 'Nhật ký ven biển');
}
function settings() {
  showDialog('Giữ một góc bình yên', `<p>Làng được lưu trong trình duyệt này. Xuất một bản sao để mang sang máy khác hoặc giữ lại trước khi xóa dữ liệu website.</p><div class="settings-list"><button class="primary-button" data-action="save">${icon('save')}Lưu làng ngay</button><button class="secondary-button" data-action="export">${icon('download')}Xuất bản sao lưu (.json)</button><button class="secondary-button" data-action="import">${icon('upload')}Nhập bản lưu từ máy</button><button class="secondary-button" data-action="journal">${icon('book')}Mở nhật ký làng</button><button class="secondary-button" data-action="ambient">${icon('eye')}Ngắm cảnh</button><button class="secondary-button" data-action="audio">${icon(audioOn ? 'mute' : 'sound')}${audioOn ? 'Tắt' : 'Bật'} tiếng biển</button><button class="secondary-button" data-action="help">${icon('help')}Cách chơi và phím tắt</button></div><p class="compact-tip">Tự lưu sau thay đổi và khoảng 15 giây khi làng đang sống. Bản thử dùng hội thoại cục bộ; không gửi dữ liệu lên dịch vụ AI.</p>`, 'Lưu & tùy chọn');
}
function help() {
  showDialog('Chậm một chút cũng được.', `<p>Chọn công trình ở thanh dưới, rồi chọn ô đất để xây. Không tốn tiền hoặc vật liệu. Nhà thêm chỗ ở, cư dân đến theo thời gian khi có đường hợp lệ.</p><div class="keys"><kbd>1</kbd>–<kbd>7</kbd> Chọn công trình<br><kbd>R</kbd> Xoay công trình · <kbd>Esc</kbd> Hủy / trở lại<br>Kéo chuột trái: xoay cảnh · Chuột phải: dịch cảnh<br>Cuộn chuột: phóng to / thu nhỏ<br><kbd>Space</kbd> Dừng / tiếp tục · <kbd>A</kbd> Ngắm cảnh<br>Để xây bằng bàn phím: chọn công cụ, Tab đến vùng làng,<br>dùng <kbd>←</kbd><kbd>↑</kbd><kbd>→</kbd><kbd>↓</kbd> và <kbd>Enter</kbd> để đặt.</div><p>Bản thử: một ngày dài 24 phút; cư dân mới đến sớm nhất sau một ngày đã chơi, tối đa 2 người/ngày. Xóm Biển cần 6 cư dân có đường vào làng, một quán nước và một ghế nghỉ có kết nối. Các thông số này đang được thử nghiệm.</p><p>Tab bị ẩn thì thời gian dừng, không tính bù khi quay lại. “Dừng ngắm” vẫn cho phép đọc, trò chuyện và lưu.</p>`, 'Không có một cách chơi duy nhất');
}
function toggleAmbient() {
  ambient = !ambient;
  if (writer && !blocked) setAmbient(world, ambient);
  setTool(null); document.body.classList.toggle('ambient', ambient);
  $('#ambient-button').setAttribute('aria-pressed', ambient);
  if (ambient) toast('Chỉ còn bạn, ngôi làng và biển. Esc để trở về.');
  save();
}
async function toggleAudio() {
  try {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
      const length = audioContext.sampleRate * 4, buffer = audioContext.createBuffer(1, length, audioContext.sampleRate), data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i++) { last = (last + (Math.random() * 2 - 1) * .025) / 1.025; data[i] = last * 5; }
      const source = audioContext.createBufferSource(); source.buffer = buffer; source.loop = true;
      const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 620;
      audioGain = audioContext.createGain(); audioGain.gain.value = 0;
      source.connect(filter).connect(audioGain).connect(audioContext.destination); source.start();
    }
    await audioContext.resume(); audioOn = !audioOn;
    audioGain.gain.setTargetAtTime(audioOn ? .23 : 0, audioContext.currentTime, .4);
    $('#audio-button').innerHTML = icon(audioOn ? 'sound' : 'mute');
    $('#audio-button').setAttribute('aria-pressed', audioOn);
    $('#audio-button').setAttribute('aria-label', audioOn ? 'Tắt tiếng biển' : 'Bật tiếng biển');
    toast(audioOn ? 'Tiếng biển đã bật.' : 'Tiếng biển đã tắt.');
  } catch { toast('Trình duyệt chưa phát được âm thanh. Bạn có thể thử lại.'); }
}
function exportSave() {
  try {
    const blob = new Blob([store.export(world)], { type: 'application/json' }), url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `little-coast-ngay-${Math.floor(world.time / 1440) + 1}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Đã xuất bản sao làng của bạn.');
  } catch (error) { toast(`Chưa xuất được: ${error.message}`); }
}
document.addEventListener('click', event => {
  const target = event.target.closest('button'); if (!target) return;
  if (target.dataset.tool) { setTool(tool === target.dataset.tool ? null : target.dataset.tool); return; }
  if (target.dataset.mode) { if (canEdit()) commit(setMode(world, target.dataset.mode)); return; }
  const action = target.dataset.action;
  if (action === 'close-dialog') dialog.close();
  if (action === 'close-panel') { selectedId = null; $('#side-panel').hidden = true; }
  if (action === 'cancel-tool') setTool(null);
  if (action === 'talk') talk();
  if (action === 'journal') journal();
  if (action === 'help') help();
  if (action === 'save') { if (canEdit()) save(true); }
  if (action === 'export') exportSave();
  if (action === 'import') { if (writer) $('#import-file').click(); else canEdit(); }
  if (action === 'audio') toggleAudio();
  if (action === 'ambient') { dialog.close(); toggleAmbient(); }
  if (action === 'unlock' && canEdit()) commit(unlockRegion(world));
  if (action === 'move-building' && canEdit()) {
    const building = world.buildings.find(b => b.id === selectedId);
    if (!building) return;
    setTool(building.type); movingId = building.id; rotation = building.rotation; scene.setRotation(rotation);
    $('#tool-hint').innerHTML = `<span>Di chuyển · ${escape(CATALOG[building.type].name)}</span><span><kbd>Esc</kbd> Hủy</span>`;
  }
  if (action === 'remove-building' && canEdit() && selectedId) { const id = selectedId; selectedId = null; commit(remove(world, id)); renderPanel(); }
  if (action === 'new-after-error' && writer) { world = createWorld(); blocked = false; dialog.close(); save(true); renderPanel(); refresh(); }
});
$('#weather-button').addEventListener('click', () => {
  if (!canEdit()) return;
  const choices = ['sunny', 'cloudy', 'rain']; commit(setWeather(world, choices[(choices.indexOf(world.weather) + 1) % choices.length]));
});
$('#audio-button').onclick = toggleAudio;
$('#journal-button').onclick = journal;
$('#settings-button').onclick = settings;
$('#help-button').onclick = help;
$('#ambient-button').onclick = toggleAmbient;
$('#exit-ambient').onclick = toggleAmbient;
$('#zoom-in').onclick = () => scene?.zoom(-.2);
$('#zoom-out').onclick = () => scene?.zoom(.2);
$('#rotate-view').onclick = () => scene?.rotate(Math.PI / 4);
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file || !writer) return;
  try {
    if (file.size > 2_000_000) throw new Error('Bản lưu quá lớn.');
    const loaded = store.import(await file.text());
    world = loaded; blocked = false; ambient = !!world.ambient; document.body.classList.toggle('ambient', ambient);
    selectedId = null; setTool(null); refresh(); dialog.close(); toast('Đã khôi phục làng từ bản lưu.');
  } catch (error) { toast(`Không nhập bản lưu: ${error.message}`); }
  event.target.value = '';
});
document.addEventListener('keydown', event => {
  if (dialog.open || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
  if (event.key === 'Escape') { if (ambient) toggleAmbient(); else setTool(null); return; }
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.code === 'Space' && document.activeElement.tagName !== 'BUTTON') { event.preventDefault(); if (canEdit()) commit(setMode(world, world.mode === 'pause' ? 'living' : 'pause')); }
  if (/^[1-7]$/.test(event.key)) setTool(Object.keys(toolNames)[Number(event.key) - 1]);
  if (event.key.toLowerCase() === 'r' && tool) { rotation = (rotation + 1) % 4; scene?.setRotation(rotation); toast(`Xoay ${rotation * 90}°`); }
  if (event.key.toLowerCase() === 'a') toggleAmbient();
  if (tool && document.activeElement === $('#world')) {
    const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (delta) {
      event.preventDefault(); cursor = { x: Math.max(0, Math.min(MAP.width - 1, cursor.x + delta[0])), z: Math.max(0, Math.min(MAP.depth - 1, cursor.z + delta[1])) };
      scene?.setCursor(cursor); onHover(cursor); $('#tool-hint').textContent = `${CATALOG[tool].name} · ô ${cursor.x}, ${cursor.z} · Enter để đặt · Esc để hủy`;
    }
    if (event.key === 'Enter') { event.preventDefault(); onCell(cursor); }
  }
});

function loadWorld() {
  try {
    const loaded = store.load(); world = loaded.world || createWorld(); ambient = !!world.ambient;
    document.body.classList.toggle('ambient', ambient);
    if (loaded.recovered) toast('Đã khôi phục điểm lưu hợp lệ trước đó. Một số thay đổi gần nhất có thể chưa được lưu.');
  } catch (error) {
    blocked = true;
    showDialog('Bản lưu cần được khôi phục', `<p>${escape(error.message)}</p><div class="settings-list"><button class="primary-button" data-action="import">${icon('upload')}Nhập bản sao lưu</button><button class="secondary-button" data-action="new-after-error">Bắt đầu làng mới và ghi thay bản lưu lỗi</button></div>`, 'Chưa ghi đè dữ liệu', false);
  }
  renderPanel(); refresh();
}
async function startSession() {
  if (!storageSession.persistent) sessionBanner('Trình duyệt chặn lưu trên máy. Làng chỉ được giữ tạm trong phiên này; hãy xuất bản sao trước khi đóng.');
  if (!navigator.locks) {
    loadWorld(); sessionBanner('Trình duyệt chưa hỗ trợ khóa phiên lưu. Đang ở chế độ xem; dùng trình duyệt desktop mới để chơi và lưu.'); return;
  }
  await navigator.locks.request('little-coast-active-writer', { ifAvailable: true }, async lock => {
    if (!lock) { loadWorld(); sessionBanner('Làng đang mở trong tab khác. Phiên này chỉ xem.'); return; }
    writer = true; loadWorld();
    await new Promise(resolve => window.addEventListener('pagehide', () => { save(); writer = false; resolve(); }, { once: true }));
  });
}
function sessionBanner(message) {
  const banner = document.createElement('div'); banner.className = 'session-banner'; banner.textContent = message;
  const reload = document.createElement('button'); reload.textContent = 'Tải lại'; reload.onclick = () => location.reload(); banner.append(reload); app.prepend(banner);
}
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
document.addEventListener('visibilitychange', () => {
  // Restart the frame interval at both boundaries: hidden wall time never reaches the simulation.
  lastFrameTime = performance.now();
  if (document.hidden) { save(); audioGain?.gain.setTargetAtTime(0, audioContext.currentTime, .2); }
  else if (audioOn) audioGain?.gain.setTargetAtTime(.23, audioContext.currentTime, .3);
});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => { reducedMotion = event.matches; });
try {
  scene = createScene($('#world'), { onCell, onHover, onSelect: selectBuilding });
  $('#loading').remove();
  let uiElapsed = 0;
  function frame(now) {
    const dt = Math.max(0, (now - lastFrameTime) / 1000); lastFrameTime = now;
    if (writer && !blocked) tick(world, dt, !document.hidden);
    scene.update(world, dt, { ambient, selectedId, reducedMotion });
    uiElapsed += dt;
    if (uiElapsed > .4) { refresh(); uiElapsed = 0; }
    if (now - lastSave > 15000 && world.revision !== lastSavedRevision) save();
    if (audioOn && audioGain && !document.hidden) audioGain.gain.setTargetAtTime(.17 + Math.sin(now / 4500) * .055, audioContext.currentTime, .5);
    requestAnimationFrame(frame);
  }
  renderPanel(); refresh(); startSession(); requestAnimationFrame(frame);
} catch (error) {
  $('#loading').innerHTML = '<div><p>Chưa mở được cảnh 3D.</p><p style="font:14px sans-serif">Hãy bật tăng tốc đồ họa hoặc dùng trình duyệt desktop hỗ trợ WebGL.</p></div>';
  console.error(error);
}
