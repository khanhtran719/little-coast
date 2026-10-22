# Little Coast

Bản chơi thử web 3D của một làng chài ven biển Việt Nam. Đây là **first playable**, chưa phải MVP hoặc vertical slice đã nghiệm thu. Các tài liệu Discovery/GDD gốc được giữ nguyên trong dự án.

## Mở game

Yêu cầu Node.js 22.12+ hoặc 24. Trên macOS, có thể mở `Play Little Coast.command`; một cửa sổ Terminal sẽ chạy máy chủ và trình duyệt mở game. Đóng Terminal hoặc nhấn Ctrl+C để dừng.

Hoặc chạy trong thư mục dự án:

```sh
npm install
npm run dev
```

Mở địa chỉ Local do Vite in ra, thường là `http://127.0.0.1:5173/`. Lần đầu cần mạng để tải dependency; font có fallback khi không có mạng. Không cần tài khoản hoặc khóa AI.

```sh
npm test       # kiểm tra luật mô phỏng và lưu/khôi phục
npm run build # tạo bản static trong dist/
npm run preview # xem bản build qua HTTP
```

## Chơi thử

- Kéo chuột trái để xoay, chuột phải để dịch cảnh, cuộn để zoom.
- Chọn một trong bảy công cụ rồi click ô đất: nhà, đường, quán nước, cây, ghế, chợ cá, bến cá. Bến đặt ở mép đất sát biển. R để xoay; Esc để hủy.
- Click công trình để xem điều kiện hoạt động, di chuyển hoặc dỡ bỏ. Nhà thêm sức chứa, không sinh cư dân ngay.
- Có thể xây bằng bàn phím: 1–7 chọn công cụ; Tab đến vùng làng, mũi tên di chuyển ô, Enter đặt. R xoay.
- Space dừng/tiếp tục. A ngắm cảnh, Esc trở lại. Living 1×, Slow 0.25×. Tab ẩn dừng thời gian và không tính bù.
- Nút thời tiết đổi nắng/mây/mưa. Scenic Pause giữ thời tiết và dừng sinh hoạt; vẫn đọc nhật ký, trò chuyện, lưu được.
- Bác Hải dùng thoại cục bộ dựa trên ký ức thật. Cư dân đi trên mạng đường, ghé quán/ghế/chợ/bến theo điều kiện; không có Cloud AI.
- Lưu/tùy chọn có Manual Save, Export/Import JSON và nhật ký. Tự lưu sau lệnh thành công, khoảng 15 giây khi có thay đổi và khi tab bị ẩn. Có Last Known Good và kiểm tra bản lưu; một tab có quyền ghi.
- Dữ liệu chỉ ở trình duyệt/origin đang dùng. Xóa dữ liệu website sẽ mất save; xuất JSON để sao lưu. Khi lưu bị chặn, phiên tạm được cảnh báo và vẫn xuất JSON được.

## Thông số thử nghiệm

2 nhà/4 cư dân lúc đầu. Mỗi nhà 2 chỗ. Ngày dài 24 phút ở Living; New Arrival đầu tiên sớm nhất sau 24 phút chơi có mô phỏng, sau đó cách ít nhất 12 phút, tối đa 2 người/ngày game, còn phải có nhà kết nối và không có người chờ tái định cư.

Xóm Biển dùng rule thử: ít nhất 6 cư dân có nhà kết nối, một quán và một ghế kết nối; người chơi chủ động mở. Không cần đạt trong phiên đầu. Waiting 3 ngày, At Risk có thêm một ngày bảo vệ chỉ tích lũy khi xây dựng; Ambient bảo vệ khỏi Departure. Named NPC tạm vắng giữ danh tính/ký ức và có nhịp trở lại riêng khi có nhà hợp lệ. Các con số chưa phải cân bằng production.

## Tổ chức mã nguồn

| File | Trách nhiệm |
| --- | --- |
| `src/simulation.js` | World canonical, grid/road graph, housing/ledger, clock, routine, memory và progression |
| `src/scene.js` | Three.js đọc world, hình khối procedural gốc, camera, picking/preview và ánh sáng |
| `src/main.js` | HUD, input, kết nối command, vòng chạy, Web Locks, âm thanh tùy chọn |
| `src/persistence.js` | Validation, checksum, lưu nguyên snapshot, Last Known Good và export/import |
| `tests/` | node:test, không cần dịch vụ ngoài |
| `docs/production/` | Quyền ủy thác, task, quyết định, QA và phần việc còn lại |

Thuyền ra/vào là hoạt cảnh suy từ clock, không phải mô phỏng đánh cá/logistics. Âm thanh biển được tổng hợp qua Web Audio khi người chơi bật. Asset 3D là hình khối nguyên bản bằng code; chưa có asset/art/audio cuối. Chưa có Undo/Redo, Assisted Terrain, Cloud AI, độ hấp dẫn tăng trưởng đã cân bằng hoặc kiểm chứng UX với người chơi thật. Camera hiện là lựa chọn thử nghiệm orthographic.

Xem [báo cáo first playable](./docs/production/FIRST_PLAYABLE_REPORT.md), [backlog](./docs/production/STUDIO_BACKLOG.md) và [sổ quyết định](./docs/production/DECISIONS.md).
