# Little Coast — thiết kế môi trường v1

Ngày: **22/10/2026**. Owner: **Environment Art / Art Direction**. Trạng thái: **CONCEPT REFERENCES READY FOR IMPLEMENTATION**, không phải nghiệm thu đồ họa runtime hoặc human playtest.

Nguồn: yêu cầu trực tiếp của người dùng để agent đồ họa dùng ImageGen thiết kế trước rồi developer dựng theo; quyền triển khai thông thường tại `docs/production/DECISIONS.md` (SRC-IMP-001); GDD v1.1 §1, §3.1, §8.1–8.2. GDD lịch sử không bị sửa.

## Phân cấp tài liệu tham chiếu

1. **coastal-runtime-style-target-v1.png** là nguồn chính cho **mức đơn giản hình khối và chất liệu khi dựng game**: khối bo mềm, tường màu mảng lớn, mái ngói có bề dày, nước phẳng stylized với dải bọt, tỷ lệ người gọn. Hai panel dùng cùng hướng camera. Không lấy photorealism của các keyframe làm mục tiêu runtime.
2. **lang-chai-keyframe-v1.png / xom-bien-keyframe-v1.png** là nguồn cho **bản sắc vùng, cách nhóm nhà, mật độ, chất liệu và props**, không phải bản vẽ camera/footprint hay cam kết fidelity bề mặt.
3. **coastal-modular-kit-v1.png** là bảng tách silhouette và cấu tạo từng nhóm asset để developer hand-model. Khi có xung đột chi tiết, mức đơn giản phải theo runtime-style target.

Tất cả là **ảnh raster tham chiếu**, chưa phải mesh, texture atlas, collision, rig, animation, tile prefab, hay asset đã tích hợp. Không dùng ảnh làm nền phẳng để tuyên bố có thế giới 3D tương tác.

## Tệp đã lưu

| Tệp trong assets/concepts/environments/ | Kích thước | Công dụng |
| --- | --- | --- |
| `coastal-runtime-style-target-v1.png` | 1672×941 | Master về phong cách runtime; Làng Chài bên trái, Xóm Biển bên phải |
| `lang-chai-keyframe-v1.png` | 1672×941 | Làng Chài đang làm nghề: bến gỗ, tàu xanh, thúng, lưới, giỏ, sân/ngõ |
| `xom-bien-keyframe-v1.png` | 1672×941 | Khu dân cư nối tiếp: nhà thấp tầng, veranda/balcony, quán, sân cây, lối dạo/bờ kè |
| `coastal-modular-kit-v1.png` | 1774×887 | Ba biến thể nhà, quán, chợ, bến thẳng/T, tàu/thúng, ghế/cây/tường/mái/cửa/lưới |
| `lang-chai-study-v0.png` | 1672×941 | Study bị loại khỏi vai trò style master: quá giống ảnh chụp, có chân trời xa; chỉ giữ truy vết iteration |

Các ảnh final được tạo bằng **built-in ImageGen**, mỗi asset một prompt, sau đó chép nguyên bản từ thư mục generated_images vào repo. Không dùng CLI/API ngoài, không chỉnh ảnh bằng Python, không có asset bên thứ ba.

## Art direction để dev dựng

**Chung:** đất liền liên tục, bờ cong; nền màu xanh biển/ngói ấm/vôi vàng/teal; công trình thấp, mái có nhiều cao độ nhưng không thành skyline đô thị. Hiệu ứng nắng mềm và bóng tán cây tạo nhịp. Nhà có hiên, chân tường, cửa chớp và cụm đồ dùng lớn có chủ đích; tránh khối hộp mái tam giác lặp nguyên mẫu. Màu mái/tường khác nhau phải đi cùng khác silhouette để vẫn phân biệt khi thu nhỏ.

**Làng Chài:** mép biển là nơi làm việc: nhóm bến gỗ, chợ nhỏ, ngư cụ, thuyền xanh, thúng. Nhà một tầng chiếm chính; đường nhỏ xen sân và bóng cây. Nhóm chi tiết theo cụm dễ đọc, không rải noise khắp mặt đất.

**Xóm Biển:** khu dân cư ven biển tiếp nối Làng Chài, có nhà 1–2 tầng, balcony/hiên, sân trồng cây, quán nước ở góc ngõ, lối dạo và bờ kè thấp. Không tự hiện đại hóa làng cũ; không phải đô thị cao tầng, resort, khu nghỉ dưỡng Địa Trung Hải hoặc ngoại ô Mỹ. Dùng vòm tán cây/bóng râm/không gian sinh hoạt thay cho tăng mật độ bằng nhà cao tầng.

**Mật độ:** hai keyframe mô tả **đích không gian khi đã phát triển**, không thay seed 2 nhà/4 cư dân thành làng hàng chục nhà. Không sinh nhà ở/cư dân chỉ ở renderer. Cụm cỏ, đá, bờ, bóng cây và props có thể làm nền bớt trống, nhưng không lấp ô xây hoặc che đường đi sai dữ liệu canonical. Cảnh concept có người minh họa, không phải số dân gameplay.

**Camera:** góc nhìn game nâng khoảng 35°, không chân trời xa. Các ảnh có tính minh họa nên không phải projection chuẩn đo lường. Giữ camera/zoom runtime kiểm tra footprint, selection và NPC; không đổi API world chỉ để khớp tranh.

**Mức chi tiết:** developer dựng shape/mảng màu trước, sau đó thêm hiên/cửa/ngói/tán/bọt biển. Không cần mô phỏng từng lá/từng sợi lưới/vết nứt/màng nước; dùng nhóm khối/strip/instancing khi hợp lý. Chưa có ngân sách tam giác/drawcall/FPS được benchmark; phải đo runtime trên thiết bị ghi rõ, không suy từ ảnh.

## QA hình ảnh thực hiện

Tất cả bốn ảnh final đã mở lại bằng `view_image` từ đường dẫn repo; kích thước được kiểm tra bằng `sips -g pixelWidth -g pixelHeight`.

| Hạng mục | Quan sát | Kết quả / giới hạn |
| --- | --- | --- |
| Đất liền và bờ | Làng kéo dài ra mép trên/trái; nước trước mặt; không floating island | Đạt mục đích concept; hình bờ vẫn cần level-design theo dữ liệu world |
| Bản sắc Việt Nam | Mái ngói/tôn, cửa teal, hiên/ngõ, xe máy, quán ghế thấp, thúng/lưới/tàu xanh | Đọc được; không có mái Nhật/cao tầng/resort |
| Hai vùng khác nhau | Làng Chài nhấn bến/nghề cá; Xóm Biển nhấn nhà ở/cây/quán/lối dạo/kè | Đạt phân biệt chức năng không gian trong concept |
| Phong cách keyframe | Chất liệu nước/lá/bề mặt còn chi tiết gần thực | Không làm style master; đã bổ sung runtime-style target để xử lý khoảng cách |
| Runtime-style target | Tường sạch mảng màu, mái/đá bo khối, nước dải bọt stylized, người toy gọn; không chân trời | Đạt làm master sculpted-game look; tán vẫn có nhiều lá, developer cần giảm số cụm |
| Kit | Đủ nhóm nhà/quán/chợ/bến/thuyền/thúng/cây/ghế/tường/mái/cửa/lưới; vật thể tách rõ | Chỉ góc 3/4; mặt sau/kích thước và snapping cần developer thiết kế |
| Tính nhất quán hình học | Một số độ sâu/camera/lan can/bến là suy diễn minh họa, không có kích thước | Không dùng như bản vẽ kỹ thuật orthographic hoặc texture bake trực tiếp |
| Text / UI | Keyframe không HUD/grid/text; kit có một tiêu đề; runtime target có hai nhãn vùng | Nhãn runtime là tiêu đề bảng art, không đề xuất thêm vào HUD |
| Nghiệm thu | Chỉ có agent art review và kiểm tra ảnh | Chưa browser QA, chưa model/render runtime, chưa performance hoặc human playtest |

Không cần chạy test simulation/build cho deliverable chỉ ảnh/tài liệu; developer phải chạy checks và kiểm tra browser thực khi triển khai render.

## Handoff cho Rendering / Level Art

Bắt đầu bằng một góc làng nhỏ theo **runtime-style target**, dùng kit để dựng ba silhouette nhà, quán mái bạt, chợ, bến và thuyền/thúng. Thêm hierarchy bờ biển/đá/tán để chia khoảng đất lớn, rồi kiểm tra cảnh thực cùng zoom tương đương ảnh. Xóm Biển phải giữ các dấu hiệu residential đã ghi dù region còn khóa. Hoạt động/người/mở vùng vẫn đọc world canonical. Không tuyên bố đã đạt master chỉ vì đặt ảnh concept vào repo.

## Prompts chính xác và provenance

Không dùng thông số size/quality/model CLI. Các lệnh built-in đặt `transparent_background: false`. Các prompt tạo mới không có ảnh tham chiếu; riêng runtime-style target dùng hai keyframe đã mở bằng `view_image` làm **reference**, không sửa/ghi đè chúng. Nguồn mặc định: `/Users/trankhanh/.codex/generated_images/01a16292-c8a3-7af1-b932-4c660a946184/`.

### Làng Chài study v0 — không chọn làm final

Nguồn: `exec-a600e733-8939-4099-a458-ae1835ab881e.png`; không reference images.

```text
Use case: stylized-concept
Asset type: wide landscape environment keyframe for Little Coast, a browser cozy city builder; art reference for developers, no game UI.
Primary request: Design a beautiful, dense but readable Vietnamese working fishing village called Làng Chài on a curved continuous MAINLAND shore. Original game art, cozy stylized 3D with mature soft sculpted forms, tangible matte painted plaster, individually readable curved terracotta roof tiles, weathered timber and corrugated metal, warm cream/ochre/coral architecture with teal doors and sea-green shutters, lush layered foliage, turquoise coastal water. Isometric-like camera around 35 degrees, elegant crafted shapes, soft global illumination, warm late-afternoon light, ambient occlusion, coherent real-world material character without photorealism. Distinctively Vietnamese coastal village, comfortable human scale.
Scene: The village hugs the sea in a crescent. Foreground has blue fishing boats and round woven basket boats beside weathered wooden landing stages, fishing nets drying, coiled ropes, woven baskets, plastic fish crates and a tiny fish stall. Midground has a varied organic cluster of low one-story houses, a few two-story houses, warm terracotta tiles mixed with weathered blue corrugated roofs, ochre walls, teal doors, narrow shaded lanes, courtyards, washing lines, parked small motorbikes, veranda pots and broad-canopy shade trees. Small local tea corner with low stools. Background continues inland through layered low green hills and a tiny modest distant lighthouse. Show shore foam and soft water ripples.
Composition/framing: Wide cinematic landscape, isometric-like elevated camera around 35 degrees, readable inhabited foreground/midground/backdrop. Mainland continues beyond the left and top edges; water opens in the foreground/right. An organic main lane links the homes to the quay. A few tiny illustrative people only. Maintain useful spaces between clusters without giant empty beige areas. Make an evocative place someone would want to stroll around, not a crowded model sheet.
Constraints: Original art. No HUD, UI, controls, grid, labels, lettering or watermark. Not a floating island or a cutaway block. No Greek/Santorini architecture, no Japanese roofs/torii, no generic Mediterranean town, no highrise, resort, American suburb, repeating clone homes, flat cardboard minimalism, hyperrealism, anime 2D or voxel art. All boats modest Vietnamese coastal craft, not luxury yachts.
```

### Làng Chài keyframe v1

Nguồn: `exec-8e2578bb-d039-436b-9b0f-9e0352fb493a.png`; không reference images. Prompt được tăng ràng buộc game-shape sau QA v0.

```text
Use case: stylized-concept
Asset type: wide landscape environment keyframe for Little Coast, a browser cozy city builder; art reference for developers, no game UI.
Primary request: Design a beautiful, dense but readable Vietnamese working fishing village called Làng Chài on a curved continuous MAINLAND shore. Original game art, cozy stylized 3D with mature soft sculpted forms, tangible matte painted plaster, individually readable curved terracotta roof tiles, weathered timber and corrugated metal, warm cream/ochre/coral architecture with teal doors and sea-green shutters, lush layered foliage, turquoise coastal water. Isometric-like camera around 35 degrees, elegant crafted shapes, soft global illumination, warm late-afternoon light, ambient occlusion, coherent real-world material character without photorealism. Distinctively Vietnamese coastal village, comfortable human scale.
Scene: The village hugs the sea in a crescent. Foreground has blue fishing boats and round woven basket boats beside weathered wooden landing stages, fishing nets drying, coiled ropes, woven baskets, plastic fish crates and a tiny fish stall. Midground has a varied organic cluster of low one-story houses, a few two-story houses, warm terracotta tiles mixed with weathered blue corrugated roofs, ochre walls, teal doors, narrow shaded lanes, courtyards, washing lines, parked small motorbikes, veranda pots and broad-canopy shade trees. Small local tea corner with low stools. Background continues inland through layered low green hills and a tiny modest distant lighthouse. Show shore foam and soft water ripples.
Composition/framing: Wide cinematic landscape, isometric-like elevated camera around 35 degrees, readable inhabited foreground/midground/backdrop. Mainland continues beyond the left and top edges; water opens in the foreground/right. An organic main lane links the homes to the quay. A few tiny illustrative people only. Maintain useful spaces between clusters without giant empty beige areas. Make an evocative place someone would want to stroll around, not a crowded model sheet.
Constraints: Original art. No HUD, UI, controls, grid, labels, lettering or watermark. Not a floating island or a cutaway block. No Greek/Santorini architecture, no Japanese roofs/torii, no generic Mediterranean town, no highrise, resort, American suburb, repeating clone homes, flat cardboard minimalism, hyperrealism, anime 2D or voxel art. All boats modest Vietnamese coastal craft, not luxury yachts.
Critical style correction: Render this as an unmistakable cozy 3D GAME ENVIRONMENT, a premium hand-sculpted 3D animation maquette. Orthographic elevated camera with NO visible horizon and NO photographic lens. Tilt down to 35–45 degrees so rooftops and winding lanes read clearly. Simplify all forms into rounded handcrafted geometry: chunky leaves in unified canopy clumps, sculpted rock groups, slightly bowed painted walls, exaggerated thick roof tiles, soft bevels. Buildings have large readable proportions, boat hulls have clean simplified ribs and broad color panels, water is stylized softly shaded broad ripples. Eliminate photographic microtexture, film realism and real beach holiday photography. This should look clearly modeled and rendered in Blender with a cohesive stylized game material kit, NOT a photograph and NOT a flat illustrated scene. Focus tightly on one beautiful village cluster (about 12 homes), fishing quay and curved shore; no hundreds of distant buildings. Retain the rich authentic Vietnamese details but simplify each detail into clear sculpted shapes.
```

### Xóm Biển keyframe v1

Nguồn: `exec-41098526-03ea-4c7b-b4aa-96601ab6833f.png`; không reference images.

```text
Use case: stylized-concept
Asset type: wide landscape environment keyframe for Little Coast, a browser cozy city builder; art reference for developers, no game UI.
Primary request: Design Xóm Biển, the evolved low-rise residential coastal neighborhood continuing from a Vietnamese working fishing village. This is an intimate lived-in local neighborhood, not a modern city or resort. Original game art, cozy stylized 3D with mature soft sculpted forms, tangible matte painted plaster, individually readable curved terracotta roof tiles, weathered timber and corrugated metal, warm cream/ochre/coral architecture with teal doors and sea-green shutters, lush layered foliage, turquoise coastal water. Isometric-like camera around 35 degrees, elegant crafted shapes, soft global illumination, warm late-afternoon light, ambient occlusion, coherent real-world material character without photorealism. Distinctively Vietnamese coastal village, comfortable human scale.
Critical rendering style: Unmistakable cozy sculpted 3D GAME ART, premium hand-modeled animation maquette, soft bevels, rounded chunky tree-canopy clumps, curved thick roof tiles, simple carefully designed geometry. NOT real beach photography. Elevated orthographic-like 35-degree camera, no visible horizon, no long photographic depth. Simplify details but preserve architectural richness.
Scene: Small one- and two-story narrow Vietnamese coastal homes of varied roof heights, tiled sloping roofs mixed with muted blue corrugated additions, balconies with metal rails, deep shaded verandas, pale ochre/coral/sea-green walls, teal doors and shutters, verandah pots and washing lines. Shaded paved lanes wind between planted courtyards and low garden walls, not a regular street grid. A local quán nước tea/coffee corner with a simple fabric awning, low stools, enamel teapot and potted vines sits at a lane junction, under a broad shade tree. A low weathered stone seawall and a pedestrian promenade curve across the foreground, with benches, coastal planting and steps down to a small beach. Foreground is broad turquoise blue sea, with gentle stylized shore ripples. Far left edge visibly connects into the older one-story fishing village and a modest blue fishing boat/dock, so this is one continuous mainland, with older village identity preserved. Inland upper edge continues to green low hills and more neighborhood; no island edges. Include a small leafy community meeting corner and parked motorbikes; only a few tiny illustrative residents.
Composition: Main neighborhood occupies center/right, foreground promenade runs diagonally from lower-left to right, lanes/courtyards visible from above, distinctly residential and greener/more leisurely than a working quay; don't repeat the fishing-port composition. Strong foreground/midground and natural asymmetry, lush shade and material hierarchy, no giant empty beige plane.
Constraints: Original art; no HUD, UI, controls, grid, labels, writing or watermark. No highrise, glass towers, industrial harbor, luxury resort, Greek/Santorini/Mediterranean town, Japanese roofs, American suburb, clone-house rows, floating island/cutaway block, flat cardboard minimalism, photorealism or anime 2D. Do not place an apartment city behind the homes.
```

### Coastal modular kit v1

Nguồn: `exec-787e7a42-87b6-4cea-9d90-91c79117ad73.png`; không reference images.

```text
Use case: stylized-concept
Asset type: wide landscape 3D modular environment asset design board for Little Coast.
Primary request: Create a coherent hand-modeled 3D ASSET KIT contact sheet, every object isolated with generous spacing on a perfectly plain pale warm-gray studio background. Clean readable simplified game geometry, premium sculpted 3D animation style. This sheet will guide a Three.js developer to hand-model independent modular assets, so silhouette and large construction shapes matter far more than microdetail. Original game art, cozy stylized 3D with mature soft sculpted forms, tangible matte painted plaster, individually readable curved terracotta roof tiles, weathered timber and corrugated metal, warm cream/ochre/coral architecture with teal doors and sea-green shutters, lush layered foliage, turquoise coastal water. Isometric-like camera around 35 degrees, elegant crafted shapes, soft global illumination, warm late-afternoon light, ambient occlusion, coherent real-world material character without photorealism. Distinctively Vietnamese coastal village, comfortable human scale.
Rendering direction: Deliberately simplified chunky game objects, gentle bevels, broad clean material color panels, chunky tree canopies made of soft sculpted leaf clusters, simplified large terracotta roof tiles, visibly stylized matte wood and plaster. Soft studio lighting with subtle contact shadows. Orthographic isometric camera 35 degrees identically oriented for ALL objects. No photographic scene, no photoreal textures, no scenic landscape or horizon. Each object stands alone on background, no connecting ground tiles.
Layout: Three evenly separated horizontal rows, a small centered title at top reading only "LITTLE COAST — COASTAL KIT". No other labels, no paragraphs.
Top row, four large independent structures: (1) one-story Vietnamese fisher's house with warm ochre wall, teal doors, terracotta gabled tiled roof and small veranda; (2) compact coastal house with faded coral plaster, blue corrugated side roof and shaded porch; (3) narrow two-story residential house with sea-green shutters, small balcony, tiled roof and garden gate; (4) local quán nước café with simple striped cloth awning, open serving counter, enamel teapot and three tiny low stools. These are distinct silhouettes, not clones.
Middle row: fish stall with canopy, baskets and fish trays; simple wooden dock straight segment; wooden dock T junction; a modest blue wooden fishing boat; a Vietnamese round woven basket boat with one paddle and a net coil. Independent objects, do not combine into a dockscene.
Bottom row: wooden park bench; a palm tree; a broad-canopy shade tree; short low plaster garden wall with gate; a terracotta roof module with clearly modeled thick tiles beside a blue corrugated roof module; a teal shutter pair; rolled fishing net with small woven basket. Independent shapes, space between.
Constraints: Original art; cohesive Vietnamese coastal craftsmanship. No HUD/UI/game controls, people, environment scene, grid, numbered labels, extra lettering, logos or watermark. No Greek/Japanese architecture, no highrise, flat cardboard minimalism, voxel cubes, overcomplicated noisy textures or tiny unreadable objects. Keep clean cutout silhouettes and generous whitespace. The neutral background is opaque, not transparent.
```

### Coastal runtime-style target v1

Nguồn: `exec-196ee7b8-d273-4c91-8a32-fad0b691ef43.png`. Hai reference images theo đúng thứ tự: `/Users/trankhanh/MyFolder/games/little-coast/assets/concepts/environments/lang-chai-keyframe-v1.png`, `/Users/trankhanh/MyFolder/games/little-coast/assets/concepts/environments/xom-bien-keyframe-v1.png`.

```text
Use case: stylized-concept
Asset type: runtime-style art target for Little Coast, a cozy stylized 3D browser building game.
Primary request: Two SIDE BY SIDE matched-camera panels: a small Vietnamese working fishing village on the LEFT, and a leafy Vietnamese residential coastal neighborhood on the RIGHT. Both are clear premium stylized 3D GAME SCREEN renders. Large simple sculpted forms, cozy toy-scale people about 4.5 heads tall, clean chunky geometry. This is the rendering style a browser game should actually use.
Input images: First reference shows village placement/material motifs ONLY; second shows residential promenade placement/material motifs ONLY. Transform their rendering style completely: remove all photographic detail, real water and microscopic texturing.
Style transform is mandatory: every house is a few clean hand-modeled solid shapes with soft rounded bevels. Walls are smooth broad PAINTED COLOR BLOCKS, with no photoreal texture, fine grunge, cracks or speckle. Roofs are simple thick terracotta tile strips, not hundreds of tiny tiles. Trees use 5–8 large rounded canopy CLUMPS, NOT individual leaves. Water is flat soft turquoise shaded surface with simple broad curved cream/white FOAM BANDS and no realistic ripples, reflections or caustics. Rocks are smooth chunky shapes, not granular. Shadows are softly painted ambient shadows. Bright soft pastel color grading and diffuse lighting. Think beautiful real-time handcrafted 3D game assets, not detailed beach photography, not a flat 2D illustration.
Composition: Wide landscape divided into two clear equally sized rectangular panels separated by narrow cream gutter. Both use the SAME elevated 35-degree ORTHOGRAPHIC camera, no horizon or perspective vanishing point, scene continuing beyond top/side edges. Each shows only 5–7 houses and small lanes, not a vast city. No floating island edges. Both are coastal MAINLAND.
Left panel: Làng Chài. Cluster of one-story ochre/coral Vietnamese homes with orange terracotta roofs and muted blue corrugated additions, deep teal doors, a winding lane, broad shade tree, simple fish stall, a modest wooden dock with large clean planks, round basket boat and blue Vietnamese fishing boat, a few stylized nets/crates. Cozy readable working quay, smaller pockets of shade.
Right panel: Xóm Biển. One- and two-story Vietnamese coastal homes of varied heights, balconies/verandas, muted sea-green and coral accents, a local tea café under simple striped awning, planted courtyards and low garden walls, shade trees, a low curved stone seawall, pedestrian promenade and two benches at the turquoise sea. Leafy human-scale neighborhood, not a resort. Both share the same warm ochre/terracotta/teal/turquoise palette and simplified sculpted 3D visual language.
Only title above left "LÀNG CHÀI" and above right "XÓM BIỂN". No other text, no HUD/UI/controls/grid/watermarks.
Avoid: photographic realism, microdetail, noisy textures, shiny hyperreal water, realistic individual leaves, gritty grunge, thin fragile silhouettes, super-dense miniature, voxel/cube lowpoly, flat cardboard, isometric illustration outlines, Greek/Santorini/Japanese architecture, highrise or resort. Do not preserve reference photographic texture. Prioritize the style transformation over exact layout.
```

