# Nhà và quán — mẫu mesh ven biển v1

Ngày: **22/10/2026**. Owner: **Environment Artist / Technical Artist**. Trạng thái: **PROCEDURAL SAMPLE IMPLEMENTED; đang bàn giao Rendering/QA**, chưa phải asset cuối, GLB hoặc human playtest ACCEPTED.

Nguồn đã đọc: `AGENTS.md`, `docs/production/DECISIONS.md`, `STUDIO_BACKLOG.md`, `FIRST_PLAYABLE_REPORT.md`, `DEV_HANDOFF.md`, `src/scene.js`. Đã mở xem trực tiếp `assets/concepts/environments/coastal-runtime-style-target-v1.png` và `coastal-modular-kit-v1.png` trước khi dựng. Hai ảnh là reference ImageGen; mesh dưới đây là geometry 3D nguyên bản viết bằng Three.js, không dán concept lên billboard.

## Kết quả

`src/art/buildings.js` xuất `createBuildingModel(type, {region='lang-chai', variant=0}={})`. Hỗ trợ `house`, `cafe`; loại khác trả `null` để renderer giữ fallback hiện hành. Factory chỉ tạo presentation; không đọc/thay world, population, route, ID, save hoặc unlock.

Nhà có tường vữa vàng ấm, chân nền bo nhẹ, mái ngói đất nung gồm từng viên nửa trụ cong và ngói nóc riêng, tường hồi kín với ô thông gió teal nhỏ, hiên gỗ có cột/giằng, mái hiên xanh, cửa gỗ teal, cửa chớp nan với lòng cửa tối, bậc và lát hiên, giỏ đan, chậu cây, hoa giấy leo cột hiên trước và thông gió phía sau. Mặt trước hướng +Z, cửa đặt tên `entrance`.

Quán có mái ngói, mái che xanh–kem từng dải với diềm cong, cửa phục vụ có lòng tối và kệ, quầy gỗ, ấm trà có vòi/quai/nắp, chén và hũ, bàn thấp cùng hai ghế đẩu, cửa chớp bên, hoa giấy, giỏ và chậu cây. Không tạo người trang trí. Đồ phụ nằm cùng parent để Move/Delete theo công trình.

Biến thể `xom-bien` dùng vữa coral ấm cùng hệ mái/cửa; không dựng tầng hai vượt footprint. Đây là thử nghiệm palette trên cùng model mẫu, chưa phải bộ kiến trúc đầy đủ của Xóm Biển. `variant` chỉ thay nhịp sắc ngói ổn định, không thay danh tính công trình.

## Số đo CPU thực

Đo bằng Node + Three.js thật, `Box3.setFromObject()` sau update matrix và đếm triangle theo index/position. Tất cả số dưới tính toàn bộ mesh con, cả hoa/chậu/hiên; **không phải GPU benchmark hoặc browser draw-call profile**.

| Chỉ số | Nhà | Quán |
| --- | --- | --- |
| Local X bounds | −0.463207 → +0.463207 | −0.457131 → +0.457131 |
| Local Z bounds | −0.435000 → +0.479500 | −0.435000 → +0.479500 |
| Local Y bounds | ~0 → 1.018131 | ~0 → 0.976623 |
| Kích thước X × Y × Z | 0.926413 × 1.018131 × 0.914500 | 0.914261 × 0.976623 × 0.914500 |
| Mesh sau gộp tĩnh theo material | 22 | 21 |
| Triangles | 4,788 | 5,840 |
| Material riêng mỗi instance | 21 | 20 |
| Geometry riêng | 21 | 21 |
| Fit XZ trong ±0.5 tại 0/90/180/270° | PASS | PASS |

Hai palette vùng có cùng dimensions/count. Geometry và material cache chỉ nằm trong một lần gọi factory: có thể dispose asset này mà không làm hỏng asset khác. Mesh đều cast/receive shadow; cửa sổ có `userData.window=true` trên cả mesh và material riêng để renderer nhận diện nếu cần. Không có texture, network fetch hoặc tài nguyên phụ thuộc DOM.

Bản primitive đầu có 256/283 mesh và 8,412/10,104 triangle cho nhà/quán. Đã giản lược khối hoa/lá nhỏ, bỏ bevel trên lát nền nhỏ rồi bake static transform và gộp theo material bằng `mergeGeometries`. Cửa vào và ô kính vẫn là mesh riêng; các điểm đặc trưng có tên giữ thành feature anchor. Geometry nguồn không còn dùng và geometry clone trung gian được dispose ngay sau gộp. Số mesh là số object tiềm năng cho draw, chưa phải draw call GPU thực với shadow passes.

Vòng sửa thị giác sau ảnh browser đầu: đã mở ảnh `artifacts/art-sample/cafe-first-pass.png` và thấy hoa phía sau có cảm giác lơ lửng vì thân bị mái che. Dời hoa giấy ra cột hiên trước, thêm các nhánh nối, cụm lá/bông chồng nhau; quán giữ hoa dưới diềm mái. Studio Lead báo nhà đọc thành hai tầng nên giảm tỷ lệ Y của **group presentation bên trong** xuống 0.82, giữ root identity/footprint, thêm ô thông gió đầu hồi. Chiều cao thực nhà sau sửa là 1.018131, lựa chọn thử có chủ ý thấp hơn khoảng ứng viên ban đầu trong DEV_HANDOFF. Đây là phản hồi studio từ bản chạy, chưa phải human playtest. Cần Rendering chụp lại để xác minh kết quả sửa.

## Kiểm tra và giới hạn

Parent đã viết test RED trước khi có module; owner không sửa test. `node --test tests/art-models.test.js`: **6 PASS, 0 FAIL** sau implementation; bao gồm feet/identity/animation của module nhân vật song song và footprint/cửa/fallback của nhà/quán. Phép kiểm thêm riêng của owner xác nhận XZ bounds tại cả bốn quarter-turn. Browser integration, chụp gameplay/crop, picking/preview/Move/Delete, pause/load và full test/build do Rendering/QA tổng hợp; không suy từ Node thành đã kiểm browser.

Nhà đã nằm trong ngân sách tam giác ứng viên 2k–5k của DEV_HANDOFF; quán 5,840 triangle còn vượt 840, nhất là diềm mái và đồ gốm/phụ kiện. Chưa đo GPU/frame time; không tuyên bố đạt budget hiệu năng. Batch tiếp theo cần profile, cân nhắc atlas/instancing và giản lược props. Màu vữa matte và geometry bo cạnh là chuyển tiếp; chưa có UV, texture vữa, DCC source, GLB, LOD hoặc mặt sau giàu chi tiết tương đương mặt tiền. Đây là một mẫu nhà/quán dùng để quyết định chất lượng trong camera thật trước mass production.

Next owner: Rendering tích hợp đúng root/picking ownership, QA kiểm browser, Studio Lead quyết định keep/revise. Không tự mở vùng khóa hoặc thêm fixture nhà/dân để làm cảnh đông như keyframe.
