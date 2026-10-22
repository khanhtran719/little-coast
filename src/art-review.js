import './art-review.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createResidentModel, animateResidentModel } from './art/characters.js';
import { createBuildingModel } from './art/buildings.js';
import { comparisonLayout } from './art/grid-comparison.js';
import castReference from '../assets/concepts/characters/cast-lineup-style-target-v1.png?url';
import buildingReference from '../assets/concepts/environments/coastal-modular-kit-v1.png?url';
import regionReference from '../assets/concepts/environments/coastal-runtime-style-target-v1.png?url';

const $ = selector => document.querySelector(selector);
const container = $('#model-viewport');
const descriptions = {
  hai: ['Bác Hải', 'Tóc bạc, ria nhẹ, áo chàm xắn tay và quần ô-liu. Tỷ lệ gọn để đọc rõ hơn khi nhìn từ trên cao.', castReference, 'Ảnh cả nhóm giữ hướng tạo hình chung; mẫu hiện tập trung vào bác Hải.', ['Mặt có mũi, mắt, lông mày và ria bạc.', 'Áo có cổ, túi và cổ tay xắn; dép có quai.', 'Bước đi tại chỗ bằng khớp vai/hông; root do mô phỏng điều khiển.']],
  house: ['Nhà ngư dân', 'Vữa vàng ấm, ngói đất nung, cửa chớp xanh và hiên nhỏ. Toàn bộ mẫu nằm trong lô 3×3 ô nhỏ, kích thước model giữ nguyên.', buildingReference, 'Bộ module tham chiếu kiến trúc và vật dụng. Mẫu đã giản lược để khớp footprint hiện tại.', ['Ngói cong có hình khối, mái che hiên và cửa vào rõ.', 'Chậu hoa, giỏ và khung cửa đi cùng công trình.', 'Nhìn đủ bốn hướng và giữ ô đất khi xoay.']],
  cafe: ['Quán nước', 'Một mái hiên xanh kem, quầy trà, đồ gốm và ghế thấp. Một điểm ghé có dáng riêng, cùng chất liệu với xóm.', buildingReference, 'Không có người ngồi trang trí. Sinh hoạt trong game vẫn lấy từ cư dân và đường đi thật.', ['Mái ngói, mái bạt và quầy mở tách ba lớp.', 'Ấm trà, cốc và ghế là đồ vật 3D.', 'Dáng quán khác căn nhà, không tràn vào ô đường.']],
  compare: ['Đối chứng lưới và bố cục', 'Hai nhà, một quán và một mẫu Hải: cùng model, camera và ánh sáng. Chuyển lần lượt để tách tác động của đường hẹp và nhà sát nhau.', regionReference, 'Sân thử độc lập, không phải bản lưu hay dân số của làng. Giữ số lượng và tỷ lệ model giống nhau ở cả ba cảnh.', ['Lưới cũ: đường rộng 1 đơn vị, hai nhà đặt thưa.', 'Chỉ đổi lưới: vị trí nhà giữ nguyên, đường rộng 2/3.', 'Cụm sát nhau: đổi vị trí nhà/quán, giữ model và số lượng.']],
  corner: ['Một góc đang thành hình', 'Nhân vật, nhà và quán cùng một tỷ lệ. Đây là sân kiểm tra riêng, không thay bản đồ hoặc dân số của làng.', regionReference, 'Đích bối cảnh phát triển về sau. Góc mẫu kiểm tra chất liệu/tỷ lệ, chưa tái tạo toàn bộ khu phố.', ['So tỷ lệ đầu người với cửa, mái hiên và ghế.', 'Xem khối và màu ở ánh sáng ngày lẫn hoàng hôn.', 'Cảnh mẫu độc lập; không tạo thêm người trong bản lưu.']],
};

function disposeAsset(object) {
  const geometries = new Set(), materials = new Set();
  object.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) for (const m of [o.material].flat()) materials.add(m); });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); object.removeFromParent();
}

try {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#e7e7dc');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  container.appendChild(renderer.domElement); $('#viewer-loading').remove();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .01, 50);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.minPolarAngle = .15; controls.maxPolarAngle = Math.PI / 2.03;
  controls.minZoom = .7; controls.maxZoom = 3; controls.enablePan = false;
  const hemi = new THREE.HemisphereLight('#fff6dd', '#708273', 2.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff2d7', 2.7); sun.position.set(-3, 5, 4); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .1, far: 20 }); sun.shadow.normalBias = .01; scene.add(sun);
  const stage = new THREE.Mesh(new THREE.CircleGeometry(5, 96), new THREE.MeshStandardMaterial({ color: '#d6d9c9', roughness: 1 }));
  stage.rotation.x = -Math.PI / 2; stage.position.y = -.005; stage.receiveShadow = true; scene.add(stage);
  let assetRoot, selected = 'hai', animated = false, dusk = false, modelTime = 480, last = performance.now(), halfHeight = .4;
  let comparisonMode='baseline';
  let characters = [], center = new THREE.Vector3(), assetBounds = new THREE.Box3();
  const motion = matchMedia('(prefers-reduced-motion:reduce)');

  function countModel(root) {
    let triangles = 0, meshes = 0; const materials = new Set();
    root.traverse(o => { if (!o.isMesh) return; meshes++; triangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; for (const m of [o.material].flat()) materials.add(m); });
    $('#asset-counts').textContent = `${Math.round(triangles).toLocaleString('vi-VN')} tam giác\n${meshes} mesh · ${materials.size} vật liệu`;
  }
  function fitCamera(angle = 'quarter') {
    const directions = { front: [0, .12, 1], side: [1, .12, 0], back: [0, .12, -1], quarter: [.8, .45, 1] };
    const direction = new THREE.Vector3(...directions[angle]).normalize();
    camera.position.copy(center).addScaledVector(direction, 7);
    controls.target.copy(center); camera.zoom = 1; camera.lookAt(center); controls.update();
    document.querySelectorAll('[data-angle]').forEach(button => button.setAttribute('aria-pressed', button.dataset.angle === angle));
    resize();
  }
  function resize() {
    const width = container.clientWidth, height = container.clientHeight, aspect = width / height;
    renderer.setSize(width, height);
    // Fit the actual projected sample, rather than wasting the wide desktop canvas.
    if (!assetBounds.isEmpty()) {
      camera.updateMatrixWorld(true);
      let extentX = 0, extentY = 0;
      for (const x of [assetBounds.min.x, assetBounds.max.x]) for (const y of [assetBounds.min.y, assetBounds.max.y]) for (const z of [assetBounds.min.z, assetBounds.max.z]) {
        const point = new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse);
        extentX = Math.max(extentX, Math.abs(point.x)); extentY = Math.max(extentY, Math.abs(point.y));
      }
      halfHeight = Math.max(extentY * 1.23, extentX / aspect * 1.23, .2);
    }
    const view = halfHeight;
    camera.left = -view * aspect; camera.right = view * aspect; camera.top = view; camera.bottom = -view; camera.updateProjectionMatrix();
  }
  function addComparison() {
    const layout=comparisonLayout(comparisonMode);
    const road = new THREE.Mesh(new THREE.BoxGeometry(layout.road.maxX-layout.road.minX,.025,layout.road.maxZ-layout.road.minZ),new THREE.MeshStandardMaterial({color:'#c9b18a',roughness:1}));
    road.position.set(0,.0125,(layout.road.minZ+layout.road.maxZ)/2);road.receiveShadow=true;assetRoot.add(road);
    for(const building of layout.buildings) {
      const model=createBuildingModel(building.type,{region:'lang-chai'});
      model.position.set(building.x,0,building.z);assetRoot.add(model);
    }
    for(const resident of layout.residents) {
      const person=createResidentModel(resident);person.position.set(resident.x,0,resident.z);assetRoot.add(person);characters.push(person);
    }
    const lines=[], size=layout.cellSize;
    for(let i=0;i<=7/size+.001;i++){const x=-3.5+i*size;lines.push(x,.033,-1.5,x,.033,2.5);}
    for(let i=0;i<=4/size+.001;i++){const z=-1.5+i*size;lines.push(-3.5,.033,z,3.5,.033,z);}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));
    assetRoot.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#71836b',transparent:true,opacity:.32})));
    return layout.cameraBounds;
  }
  function setAsset(key) {
    const keepComparisonCamera=selected==='compare'&&key==='compare';
    const previousPosition=camera.position.clone(),previousTarget=controls.target.clone(),previousZoom=camera.zoom;
    selected = key; characters = []; if (assetRoot) disposeAsset(assetRoot);
    assetRoot = new THREE.Group(); scene.add(assetRoot);
    let comparisonBounds;
    if(key==='compare') comparisonBounds=addComparison();
    else if (key === 'hai') { const person = createResidentModel({ id: 'hai' }); assetRoot.add(person); characters.push(person); }
    else if (key === 'corner') {
      const home = createBuildingModel('house', { region: 'lang-chai' }); home.position.set(-.73, 0, -.20); assetRoot.add(home);
      const cafe = createBuildingModel('cafe', { region: 'xom-bien' }); cafe.position.set(.52, 0, -.2); assetRoot.add(cafe);
      const person = createResidentModel({ id: 'hai' }); person.position.set(-.15, 0, .72); assetRoot.add(person); characters.push(person);
    } else assetRoot.add(createBuildingModel(key, { region: 'lang-chai' }));
    assetRoot.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(assetRoot), size = bounds.getSize(new THREE.Vector3());
    if(comparisonBounds) {
      bounds.set(new THREE.Vector3(comparisonBounds.minX,0,comparisonBounds.minZ),new THREE.Vector3(comparisonBounds.maxX,comparisonBounds.height,comparisonBounds.maxZ));
    }
    assetBounds.copy(bounds);
    center = bounds.getCenter(new THREE.Vector3()); halfHeight = Math.max(size.y * .65, size.x * .58, size.z * .7);
    const [title, description, reference, caption, points] = descriptions[key];
    $('#asset-title').textContent = title; $('#asset-description').textContent = description;
    $('#reference-image').src = reference; $('#reference-link').href = reference; $('#reference-caption').textContent = caption;
    $('#review-points').replaceChildren(...points.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    document.querySelectorAll('[data-asset]').forEach(button => button.setAttribute('aria-pressed', button.dataset.asset === key));
    $('#animate-button').disabled = characters.length === 0 || key==='compare';
    $('#light-button').disabled=key==='compare';
    if(key==='compare'){animated=false;modelTime=480;dusk=false;sun.color.set('#fff2d7');sun.intensity=2.7;hemi.intensity=2.1;scene.background.set('#e7e7dc');$('#animate-button').setAttribute('aria-pressed','false');$('#animate-button').textContent='▶ Thử bước đi';$('#light-button').setAttribute('aria-pressed','false');$('#light-button').textContent='☀ Ban ngày';}
    $('#comparison-controls').hidden=key!=='compare';
    document.querySelectorAll('[data-comparison]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.comparison===comparisonMode));
    countModel(assetRoot);
    if(keepComparisonCamera){camera.position.copy(previousPosition);camera.zoom=previousZoom;controls.target.copy(previousTarget);controls.update();resize();}
    else fitCamera();
  }
  document.querySelectorAll('[data-asset]').forEach(button => button.onclick = () => setAsset(button.dataset.asset));
  document.querySelectorAll('[data-angle]').forEach(button => button.onclick = () => fitCamera(button.dataset.angle));
  document.querySelectorAll('[data-comparison]').forEach(button=>button.onclick=()=>{comparisonMode=button.dataset.comparison;setAsset('compare');});
  $('#animate-button').onclick = () => { animated = !animated; $('#animate-button').setAttribute('aria-pressed', animated); $('#animate-button').textContent = animated ? 'Ⅱ Dừng bước đi' : '▶ Thử bước đi'; };
  $('#light-button').onclick = () => {
    dusk = !dusk; sun.color.set(dusk ? '#f0aa75' : '#fff2d7'); sun.intensity = dusk ? 1.6 : 2.7;
    hemi.intensity = dusk ? 1.2 : 2.1; scene.background.set(dusk ? '#adbeb6' : '#e7e7dc');
    $('#light-button').setAttribute('aria-pressed', dusk); $('#light-button').textContent = dusk ? '☾ Hoàng hôn' : '☀ Ban ngày';
  };
  document.addEventListener('visibilitychange', () => { last = performance.now(); });
  const observer = new ResizeObserver(resize); observer.observe(container); setAsset('hai');
  function frame(now) {
    if (!document.hidden && animated) modelTime += Math.min((now - last) / 1000, .1); last = now;
    for (const character of characters) animateResidentModel(character, { time: modelTime, moving: animated, reducedMotion: motion.matches });
    controls.update(); renderer.render(scene, camera); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.addEventListener('pagehide', () => { observer.disconnect(); controls.dispose(); disposeAsset(assetRoot); stage.geometry.dispose(); stage.material.dispose(); renderer.dispose(); }, { once: true });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
} catch (error) {
  container.replaceChildren(Object.assign(document.createElement('p'), { textContent: 'Không mở được mẫu 3D. Hãy bật WebGL hoặc tăng tốc đồ họa của trình duyệt.' }));
  console.error(error);
}
