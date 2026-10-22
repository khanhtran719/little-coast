# Little Coast

Bản chơi thử web 3D của một làng chài ven biển Việt Nam. Đây là **first playable**, chưa phải MVP hoặc vertical slice đã nghiệm thu. Các tài liệu Discovery/GDD gốc được giữ nguyên trong dự án.

Bộ concept và chuẩn art: [Visual Development v1](./docs/art-direction/README.md). Mẫu 3D Bác Hải, nhà và quán đã tích hợp vào game; Lan/Minh/An có tạo hình chuyển tiếp theo ID. Đây là mesh procedural dựng theo ảnh tham chiếu, chưa phải bộ art cuối hoặc toàn bộ Xóm Biển. Xem [báo cáo mẫu](./docs/art-direction/ART_SAMPLE_REPORT.md).

**Lưới nhỏ đã tích hợp:** mỗi ô cũ chia thành 3×3 ô; người/nhà giữ nguyên kích thước. Nhà và quán chiếm 3×3, đường mới rộng 2 ô nhỏ. Làng mới có hai nhà gần nhau hơn; save cũ giữ nguyên bố cục và đường cũ rộng 3 ô. Xem [báo cáo grid v2](./docs/FINE_GRID_REPORT.md).

## Mở game

Yêu cầu Node.js 22.12+ hoặc 24. Trên macOS, có thể mở `Play Little Coast.command`; một cửa sổ Terminal sẽ chạy máy chủ và trình duyệt mở game. Đóng Terminal hoặc nhấn Ctrl+C để dừng.

Hoặc chạy trong thư mục dự án:

```sh
npm install
npm run dev
```

Mở địa chỉ Local do Vite in ra, thường là `http://127.0.0.1:5173/`. Lần đầu cần mạng để tải dependency; font có fallback khi không có mạng. Không cần tài khoản hoặc khóa AI.

Trong game, mở **Lưu và tùy chọn → Xem gần mẫu tạo hình 3D**, hoặc truy cập `/art-review.html` trên cùng địa chỉ Local. Trang mẫu dùng đúng model của game, có góc trước/bên/sau, thử bước đi và ánh sáng ngày/hoàng hôn, đặt cạnh concept để đối chiếu; không đọc/ghi bản lưu. Muốn xem Hải trong làng: **Ghé chào bác Hải → Ra chỗ bác đang đứng**; cũng có thể click cư dân rồi chọn **Nhìn gần hơn**.

Trong xưởng tạo hình, **So lưới & bố cục** có ba cảnh cùng camera/ánh sáng: lưới cũ, lưới nhỏ giữ vị trí nhà, rồi bố cục sát nhau hơn.

```sh
npm test       # kiểm tra mô phỏng, lưu/khôi phục và hợp đồng model/picking
npm run build # tạo bản static trong dist/
npm run preview # xem bản build qua HTTP
```

## Chơi thử

- Kéo chuột trái để xoay, chuột phải để dịch cảnh, cuộn để zoom.
- Chọn công cụ rồi click để đặt cả công trình: nhà, quán nước, cây, ghế, chợ cá, bến cá. Preview phủ đầy diện tích 3×3 ô nhỏ; R xoay, mũi tên trên preview chỉ mặt trước. Bến đặt ở mép đất sát biển.
- Đường rộng 2 ô: click điểm đầu rồi điểm cuối để vẽ cả dải, tự nối góc vuông (ngang trước, dọc sau). Esc hủy đoạn đang vẽ, Esc lần nữa thoát công cụ. Kéo chuột vẫn xoay camera. Đường chồng đường cũ được nối; chồng công trình khác thì cả lệnh bị từ chối.
- Click công trình để xem điều kiện hoạt động, di chuyển hoặc dỡ bỏ. Nhà thêm sức chứa, không sinh cư dân ngay.
- Có thể xây bằng bàn phím: 1–7 chọn công cụ; Tab đến vùng làng, mũi tên đi từng ô nhỏ, Enter đặt hoặc chọn hai đầu đường. R xoay công trình/đoạn đường đang di chuyển. Chọn một đoạn đường rồi Move/Delete áp dụng cho toàn bộ phần đất thuộc đoạn đó.
- Space dừng/tiếp tục. A ngắm cảnh, Esc trở lại. Living 1×, Slow 0.25×. Tab ẩn dừng thời gian và không tính bù.
- Nút thời tiết đổi nắng/mây/mưa. Scenic Pause giữ thời tiết và dừng sinh hoạt; vẫn đọc nhật ký, trò chuyện, lưu được.
- Bác Hải dùng thoại cục bộ dựa trên ký ức thật. Cư dân đi trên mạng đường, ghé quán/ghế/chợ/bến theo điều kiện; không có Cloud AI.
- Lưu/tùy chọn có Manual Save, Export/Import JSON và nhật ký. Tự lưu sau lệnh thành công, khoảng 15 giây khi có thay đổi và khi tab bị ẩn. Có Last Known Good và kiểm tra bản lưu; một tab có quyền ghi.
- Dữ liệu chỉ ở trình duyệt/origin đang dùng. Xóa dữ liệu website sẽ mất save; xuất JSON để sao lưu. Khi lưu bị chặn, phiên tạm được cảnh báo và vẫn xuất JSON được.
- Save v1 được kiểm tra rồi chuyển sang world v2; bản v1 và backup v1 giữ nguyên, bản mới lưu ở khóa v2 riêng. Import JSON cũ vẫn dùng được. Nếu chuyển đổi không hợp lệ, game báo khôi phục thay vì tự reset làng. Tốc độ người, thời gian, ký ức, dân số và sức chứa không tăng theo số ô.

## Thông số thử nghiệm

2 nhà/4 cư dân lúc đầu. Mỗi nhà 2 chỗ. Ngày dài 24 phút ở Living; New Arrival đầu tiên sớm nhất sau 24 phút chơi có mô phỏng, sau đó cách ít nhất 12 phút, tối đa 2 người/ngày game, còn phải có nhà kết nối và không có người chờ tái định cư.

Xóm Biển dùng rule thử: ít nhất 6 cư dân có nhà kết nối, một quán và một ghế kết nối; người chơi chủ động mở. Không cần đạt trong phiên đầu. Waiting 3 ngày, At Risk có thêm một ngày bảo vệ chỉ tích lũy khi xây dựng; Ambient bảo vệ khỏi Departure. Named NPC tạm vắng giữ danh tính/ký ức và có nhịp trở lại riêng khi có nhà hợp lệ. Các con số chưa phải cân bằng production.

## Tổ chức mã nguồn

| File | Trách nhiệm |
| --- | --- |
| `src/simulation.js` | World canonical, grid/road graph, housing/ledger, clock, routine, memory và progression |
| `src/grid.js`, `src/construction.js` | Chuyển tọa độ, footprint/ô chiếm, hình đường và kế hoạch preview dùng chung validation |
| `src/migration.js`, `src/legacy-v1.js` | Kiểm tra save v1 và chuyển sang v2, giữ vị trí/danh tính/lịch sử |
| `src/scene.js` | Three.js đọc world, hình khối procedural gốc, camera, picking/preview và ánh sáng |
| `src/main.js` | HUD, input, kết nối command, vòng chạy, Web Locks, âm thanh tùy chọn |
| `src/persistence.js` | Validation, checksum, lưu nguyên snapshot, Last Known Good và export/import |
| `tests/` | node:test, không cần dịch vụ ngoài |
| `docs/production/` | Quyền ủy thác, task, quyết định, QA và phần việc còn lại |

Thuyền ra/vào là hoạt cảnh suy từ clock, không phải mô phỏng đánh cá/logistics. Âm thanh biển được tổng hợp qua Web Audio khi người chơi bật. Asset 3D là hình khối nguyên bản bằng code; chưa có asset/art/audio cuối. Chưa có Undo/Redo, Assisted Terrain, Cloud AI, độ hấp dẫn tăng trưởng đã cân bằng hoặc kiểm chứng UX với người chơi thật. Camera hiện là lựa chọn thử nghiệm orthographic.

Xem [báo cáo first playable](./docs/production/FIRST_PLAYABLE_REPORT.md), [backlog](./docs/production/STUDIO_BACKLOG.md) và [sổ quyết định](./docs/production/DECISIONS.md).
