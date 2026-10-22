# Little Coast — art sample 01

Ngày: **22/10/2026**. Accountable owner: **Studio Lead / Rendering integration**. Nguồn: SRC-ART-001 và lời người dùng “Triển khai đi”. Trạng thái **PROCEDURAL SAMPLE INTEGRATED / PARTIAL QA**, chưa phải art cuối, toàn bộ Xóm Biển hoặc human playtest ACCEPTED.

## Kết quả mở được

Chạy game bằng launcher hoặc `npm run dev`. **Lưu và tùy chọn → Xem gần mẫu tạo hình 3D** mở `/art-review.html`; chọn Hải/nhà/quán/góc mẫu, góc trước/bên/sau/3⁄4, bước đi hoặc ngày/hoàng hôn. Model lấy từ cùng factory dùng trong game. Trang này không đọc/ghi save; người đứng trong sân mẫu không thuộc simulation world. Concept đặt bên phải luôn được ghi là ảnh tham chiếu.

Trong game, **Ghé chào bác Hải → Ra chỗ bác đang đứng** đưa camera tới vị trí thật; click nhân vật mở tên/trạng thái, **Nhìn gần hơn** zoom tới 6×. Camera vẫn orbit/pan/zoom. Không thêm nhà/dân seed hoặc tự mở vùng khóa.

## Thay đổi và ownership

| Owner | File bàn giao | Kết quả |
| --- | --- | --- |
| Character Artist / Technical Artist | `src/art/characters.js`, CHARACTER_MODEL_SAMPLE.md | Hải có tóc/ria bạc, mặt, cổ/túi áo chàm, quần olive và dép; idle/walk bằng khớp nhóm cứng. Lan/Minh/An có appearance chuyển tiếp theo ID, chưa qua batch art gate riêng. |
| Environment Artist / Technical Artist | `src/art/buildings.js`, BUILDING_MODEL_SAMPLE.md | Nhà/quán với ngói cong, hiên, cửa chớp, đồ gốm/hoa; quán có mái bạt, quầy trà, bàn/ghế. Props cùng parent; geometry tĩnh gộp theo material. |
| Studio Lead / Rendering | `src/scene.js`, `src/main.js`, `src/art/presentation.js` | Tích hợp model, nearest-hit picking cư dân/công trình, heading theo đoạn route kế tiếp, zoom cư dân, cửa sổ sáng về đêm. Exposure giảm 1.16→1.02 sau review màu. |
| Studio Lead / Rendering | `art-review.html`, `src/art-review.js`, `src/art-review.css`, `vite.config.js` | Trang đối chiếu model/concept, MPA build cả game và viewer. Concept chỉ được tham chiếu trên viewer. |
| QA + Studio Lead | Ba file `tests/art-*.test.js`, ART_SAMPLE_QA.md | 15 tests mới dùng Three.js CPU thật; giữ 32 tests simulation/persistence. |

Không đổi `src/simulation.js`, `src/persistence.js`, seed, footprint, route schema hoặc save schema. Appearance lấy canonical resident ID, không lấy thứ tự mảng. Animation trong game nhận `world.time`, không đẩy root; tọa độ root luôn từ NPC. Renderer giữ offset chân .015 hiện có trên nền .1; không cộng bob placeholder cũ. Props quán không tạo khách giả; chỗ dừng vẫn là ô đường kề công trình, chưa có seat/socket/ngồi trong quán.

## Vòng chỉnh từ ảnh browser thật

Ảnh pass đầu lộ cổ/túi áo bị chìm và quần Hải thành các khối rời: sửa pivot/lean thân, chân taper liền, gấu bo và mắt bớt trắng. Regression raycast bảo vệ chi tiết áo ở phía ngoài thân. Nhà ban đầu quá cao so với người: giảm group presentation Y còn .82; thêm ô thông gió đầu hồi. Hoa quán có cảm giác nổi trên mái: dời xuống cột hiên, nối nhánh và giữ dưới diềm. Đã chụp lại mẫu sửa. Các đánh giá này là studio review, chưa phải phản hồi playtester.

## Kiểm tra thực

Môi trường: macOS workspace hiện tại, Node **24.17.0**, Vite **7.3.7**, Three.js theo lockfile; browser **ChatGPT in-app browser** có WebGL. Không ghi được phiên bản browser engine/GPU. Ảnh desktop 1280×720; kiểm chọn Hải thêm tại khung hẹp thực 648×766. Chưa có ma trận thiết bị hay benchmark.

| Bài | Kết quả / giới hạn |
| --- | --- |
| TDD model/integration/picking | RED vì module chưa tồn tại trước implementation; GREEN sau implementation. Ca regression áo có tái hiện RED riêng của character owner rồi GREEN sau sửa; root thêm test lưu lâu dài. |
| `npm test` | **47 PASS, 0 FAIL, 0 SKIP**: 32 luật/save baseline + 15 model/identity/animation/bounds/resources/picking. Đây là Node CPU tests, không phải browser test hoặc mock WebGL. |
| `npm run build` | **PASS**, xuất `dist/index.html` + `dist/art-review.html`. Warning chunk Three.js dùng chung ~562.92 kB minified; chưa đạt budget tải cuối. Ba concept viewer ~2.1/2.65/2.65 MB, chưa tối ưu ảnh; game entry không import ảnh. |
| WebGL mẫu | PASS smoke — mở Hải, góc bên/sau, nhà, quán, góc chung; ngày/hoàng hôn có ảnh. Liên kết trong game mở đúng viewer; bật/dừng bước đi, khung 648×766 xếp model/reference dọc. Chuyển tab model không thấy lỗi. |
| WebGL game / picking | PASS smoke — nhà mới hiện trong world hiện hữu; click quán mở đúng panel; click mesh Hải mở panel Bác Hải; camera tìm Hải có ảnh. |
| Place / rotation / Move / Delete quán | PASS smoke — keyboard ô (7,8), R 90°, Enter; báo sẵn sàng chưa có người dùng. Move sang (6,8), ảnh cho thấy quán/props đi cùng; Delete loại quán khỏi scene/điều kiện unlock. Đặt lại tại (6,8) để thử save. Cả bốn rotation được kiểm bounds ở Node; chưa thử đủ bốn góc bằng browser. |
| Pause / save / reload | PASS smoke — nhiều thao tác trên đều ở 13:56, 4 cư dân/0 chỗ trống; manual save rồi reload vẫn 13:56/Pause/4 người/quán đã đặt; vùng khóa còn khóa. CPU tests kiểm chi tiết IDs/home/memory/root pose sau real save encode/decode. Browser chỉ xác minh phần state nhìn được trên HUD/scene, không đọc ledger ẩn. |
| Console game + viewer | Không có entry warn/error trong log thu ở hai tab sau vòng kiểm tra. Không thay cho kiểm mọi nhánh. |
| Cặp trước/sau kiểm soát đầy đủ | **NOT RUN** — baseline 08:32, sau 13:56; cùng camera mặc định nhưng world time, exposure và quán thử khác. Không dùng cặp này làm bằng chứng A/B ánh sáng hay performance. |
| Move/Delete nhà có người, cut road, import hỏng/quota, đủ 7 loại mới | **NOT RUN lại trên browser ở increment này**. Simulation/persistence regression suite vẫn pass; model factory bounds/resources được kiểm riêng. |
| FPS / draw calls / GPU memory / tải / soak / human recognition | **NOT RUN**. Không suy ra từ số mesh hoặc test CPU. |

Save thử dùng origin **127.0.0.1:5174**, tách với cổng chơi mặc định 5173. Không reset/import ghi đè save người dùng để dựng ảnh. Dev server kiểm tra được dừng sau bàn giao; dùng launcher để mở lại.

## Số đo factory và giới hạn fidelity

| Model | Mesh | Tam giác | Material | Bounds X×Y×Z (unit) |
| --- | ---: | ---: | ---: | --- |
| Hải | 85 | 5,780 | 21 | .261 × .618 × .127 |
| Nhà | 22 | 4,788 | 21 | .926 × 1.018 × .914 |
| Quán | 21 | 5,840 | 20 | .914 × .977 × .914 |

Đây là số đếm geometry CPU, không phải draw-call/GPU profile. Chân Hải không dưới 0 trong 100 walk poses đã quét; XZ nhà/quán nằm trong 1 ô qua bốn quarter-turn và hai palette vùng. Material nhân vật còn vượt ứng viên 1–2; quán vượt ứng viên 5k triangles. Đã gộp tĩnh nhà/quán từ 256/283 mesh xuống 22/21, chưa tối ưu hết cast. Không có Blender source, UV/atlas, GLB, skeleton skinning, LOD, talk/sit hoặc production animation; model là mesh procedural có khớp nhóm.

Mẫu giữ màu/motif lớn, chưa tái tạo chất liệu đã dùng lâu hoặc facial sculpt trong concept. Ở camera mặc định mặt người vẫn quá nhỏ để đánh giá chi tiết; zoom gần giúp xem, chưa thay bài recognition với người thật. Xóm Biển hiện có palette vữa coral trên cùng kit; chưa có nhà ban công, promenade, cây/tường, địa hình và bố cục khu ở như keyframe. Terrain/road/market/pier/trees vẫn phần lớn baseline.

## Bằng chứng hình và bước tiếp

Ảnh gốc browser trong `artifacts/art-sample/` (gitignored): `before-game.png`, `after-game.png`, `hai-first-pass.png`, `cafe-first-pass.png`, `hai-runtime.png`, `hai-side.png`, `hai-back.png`, `house-runtime.png`, `cafe-runtime.png`, `corner-runtime.png`, `corner-dusk.png`, `hai-in-game.png`, `hai-picking-narrow.png`, `viewer-narrow-walk.png`. `house-first-pass.png` không dùng làm bằng chứng vì HMR đổi nội dung giữa lần chụp. Hai ảnh first pass giữ để truy vết, không phải đích cuối.

**ART-DEV-02/03: IMPLEMENTED; ART-DEV-04/05: PARTIAL VERIFIED; ART-DEV-06: PLANNED.** Studio Lead chọn **KEEP kiến trúc factory/ID/pivot, REVISE chất lượng trước batch** theo ủy quyền hiện có. Tiếp theo ưu tiên độ đọc cast ở camera thật, profile/consolidate material và hoàn thiện kit/bố cục Xóm Biển bằng các đối tượng world hợp lệ; chạy lại các ca browser còn thiếu. Không đóng human art/playtest gate bằng review agent.
