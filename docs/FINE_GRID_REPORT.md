# Little Coast — fine grid v2

Ngày: **22/10/2026**. Owner chịu trách nhiệm: **Studio Lead / Integration**. Nguồn: đề xuất grid của người dùng, review ba chuyên môn và chỉ thị “Triển khai đi”, “Tiếp tục đi”. Trạng thái **IMPLEMENTED / AUTOMATED + BROWSER SMOKE VERIFIED**; chưa human playtest hoặc benchmark.

## Kết quả

- Bản đồ giữ diện tích vật lý 22×16 đơn vị, đổi thành **66×48 ô nhỏ**; mỗi cạnh ô = 1/3 đơn vị cũ. Người và model công trình giữ nguyên kích thước.
- Nhà/quán hiện tại **3×3**; các công trình baseline khác cũng dùng lô 3×3 để giữ model. Nhà 2×3 cần mẫu hẹp riêng, chưa đưa vào catalog. Capacity nhà vẫn 2 người.
- Đường mới dùng bút rộng **2 ô**; chọn đầu/cuối, vẽ ngang trước rồi dọc, có preview toàn dải. Cùng điểm đầu/cuối đặt một mảng 2×2. Không đổi thao tác kéo camera.
- Place/Move/Rotate kiểm toàn bộ ô chiếm, mép map/vùng khóa/bờ biển/va chạm; thất bại giữ world nguyên trạng. Preview, selection và hình đường dùng cùng footprint, kể cả đoạn chữ L có góc khuyết. Preview công trình có mũi tên mặt trước.
- Một stroke có một ID và sở hữu các ô mới vẽ. Qua đường có sẵn thì bỏ phần trùng; gặp nhà/đồ vật thì từ chối cả lệnh. Move/Delete cả stroke tác động chỉ ô stroke đó sở hữu, giữ đường khác và các tham chiếu memory.
- Graph lấy từ các ô đường thật; tiếp cận công trình từ biên footprint bất kỳ phía nào, giữ luật cũ. NPC dùng tọa độ vật lý liên tục, tốc độ .75 đơn vị/giây. Không đổi thành entrance-only, không thêm avoidance/interior/seat.
- **Làng mới** giữ 2 nhà/4 cư dân, đưa hai nhà gần nhau: tâm x=5 và 6⅓, thay x=5 và 8. Dùng đường 2 ô. **Save cũ** giữ vị trí/bố cục vật lý và mỗi đoạn đường cũ rộng 3 ô; không tự thu hẹp/dời nhà khi load.
- Xưởng tạo hình thêm **So lưới & bố cục**: cùng 2 nhà + 1 quán + 1 mẫu Hải, cùng camera/time480/ánh sáng. Ba cảnh: cũ → đường hẹp/lưới nhỏ giữ vị trí → cụm nhà sát hơn. Đây là sân riêng, không đọc/ghi save hoặc thêm cư dân vào world.

## Save và hợp đồng

World schema **2**, envelope checksum vẫn version1 vì định dạng bọc không đổi. Building x/z là anchor ô nhỏ góc min; người/route/target là physical world units. Helper chung `src/grid.js`; `src/construction.js` tạo kế hoạch preview read-only. Runtime contract đã cập nhật rõ phần supersede v1 trong `docs/IMPLEMENTATION_CONTRACT.md`.

`src/legacy-v1.js` chỉ giữ validator/helpers cần cho snapshot cũ; không chạy mô phỏng cũ. Migrator kiểm v1 trước → copy → anchor×3, roadWidth3 → chèn waypoint nhỏ giữ nguyên polyline/quãng đường/đích → kiểm v2. Giữ IDs, homeIds, memories, journal, mode, time, quotas và vị trí phân số; không tick trong migration. Giữ cả waypoint dài 0 hợp lệ và tuyến recovery không có destination.

Storage ghi `little-coast.world.v2`/`little-coast.backup.v2`. Khi chưa có v2, load thử v1 primary rồi backup và chuyển **trong bộ nhớ**, không ghi trong load. Ghi bình thường sau quyền writer dùng khóa v2; cả hai khóa v1 giữ nguyên. V2 hỏng chỉ recover v2 backup, không tự rollback sang v1 cũ hoặc reset. Import kiểm checksum trước validate/migrate và chỉ ghi sau thành công. Web Lock vẫn dùng tên chung giữa các phiên.

## Kiểm chứng

Môi trường: macOS workspace, Node24.17.0, Vite7.3.7, Three.js theo lockfile; WebGL trong ChatGPT in-app browser. Không xác định engine/GPU cụ thể, không profile FPS/frame time. Browser có các khung thực 1280×720 và 961×858; không gọi là ma trận thiết bị đầy đủ.

| Kiểm tra | Bằng chứng thực |
| --- | --- |
| TDD mới | Grid/migration/construction/geometry/comparison ban đầu RED do module chưa tồn tại; persistence có RED khi vẫn ghi v1/không migrate. Sau implementation GREEN. |
| Regression sửa | RED→GREEN cho route recovery dài được chia waypoint, destination giả lệch .001 trong cùng cell, và waypoint legacy dài0. Ca seed spur ban đầu chồng pier bị test bắt, đã sửa điểm cuối. |
| `npm test` | **79 PASS, 0 FAIL, 0 SKIP**. Gồm 25 lifecycle regressions chạy trên world v2 từ fixture v1, 16 persistence tests, 15 art tests, và 23 grid/migration/preview/comparison checks. Node dùng world/Three.js CPU thật, không phải WebGL/browser tests. |
| `npm run build` | PASS, xuất game và art-review. Warning chunk Three.js dùng chung vẫn >500 kB; ảnh concept viewer chưa tối ưu, không tuyên bố đạt load/performance budget. |
| Browser save cũ | Origin thử `127.0.0.1:5174` tự mở save v1 có sẵn từ lần art QA: HUD13:56/Pause, 4 dân/0 chỗ trống, quán và locked region còn đúng; có thông báo chuyển grid. Không reset/import vào cổng chơi mặc định5173. |
| Browser xây | Keyboard preview nhà3×3, báo chồng công trình; dịch ô nhỏ rồi R90°/Enter đặt: dân vẫn4, chỗ trống tăng2. Vẽ L từ(21,27) đến(25,29): preview và đường khớp; chọn báo16 ô đất, disconnected đúng. Move/xoay cả đoạn và Delete thành công. |
| Browser lưu/tải | Manual save/reload vẫn13:56/Pause,4 dân/2 chỗ trống, nhà vừa đặt còn; đường thử đã dỡ không quay lại. Chi tiết ledger/byte bảo toàn v1 kiểm bằng Node, không suy từ HUD. |
| Browser làng mới | Origin riêng `localhost:5174`:2 nhà/4 dân/0 chỗ trống,4/6 connected; đã chạy Living vài giây rồi Pause08:05, đến vị trí Hải thấy đường2ô/người/nhà cùng tỷ lệ. |
| Browser đối chứng | Mở cả3nút, hình thực cùng camera và ánh sáng, ảnh riêng từng chế độ; cùng số model, không ghi player storage. |
| Console | Không thu được warn/error từ ba tab game cũ/game mới/viewer sau vòng smoke. |
| Review độc lập | Rendering owner review read-only core/grid/migration/main, phát hiện zero-waypoint đã sửa và xác minh reproduction PASS; không còn blocker báo lại. |

Ảnh browser gốc trong `artifacts/fine-grid/` (gitignored): `migrated-game.png`, `road-l-preview.png`, `road-moved.png`, `reloaded-game.png`, `new-village.png`, `comparison-baseline.png`, `comparison-fine.png`, `comparison-compact.png`. Cảnh đối chứng là 3D thật nhưng là art stage, không phải screenshot world đang chơi. Không dùng cặp ảnh game cũ/newgame khác giờ/camera làm A/B kiểm soát.

## Giới hạn còn lại

Chưa làm nhà2×3/kit công trình lớn, hẻm1ô, vẽ đường đường cong/đường chéo, xóa từng ô thuộc stroke, entrance-only, avoidance hoặc hoàn thiện Xóm Biển. Vẽ đường chưa Undo; dùng Esc hủy draft trước commit hoặc chọn stroke/Move/Delete sau commit. Đường v1 được giữ rộng3ô để bảo toàn save; muốn thu hẹp cần edit riêng về sau. Chưa browser retest đủ7loại/4hướng/đa tab/import hỏng/quota/long session, chưa profile map đầy hoặc playtest người thật. CPU tests bao phủ luật tương ứng nhưng không thay browser/human QA. Dev server kiểm tra dừng sau bàn giao; mở lại bằng launcher hoặc npm run dev.
