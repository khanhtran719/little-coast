# Mẫu nhân vật 3D — ART-DEV-02

Ngày: **22/10/2026**. Owner: **Character Artist / Technical Artist**. Deliverable: `src/art/characters.js`. Trạng thái **IMPLEMENTED / NODE CHECKED — chờ review hình runtime bởi owner tích hợp**. Không phải nhân vật cuối, rig skinning, GLB hay human playtest ACCEPTED.

## Đích hình và phạm vi

Đã mở xem `assets/concepts/characters/cast-lineup-style-target-v1.png` và `hai-turnaround-v1.png`; đọc `AGENTS.md`, production decisions/backlog/report và `DEV_HANDOFF.md`. Mẫu Hải ưu tiên tóc bạc hất khối lớn, mặt người lớn có ria, vai rộng, áo indigo có cổ và túi ngực, tay áo xắn, quần olive có gấu, dép có quai và ngón. Mặt gồm hộp sọ/jaw, má, tai, mắt trắng/con ngươi/điểm sáng/mí, lông mày, mũi, miệng và ria. Đây là khối procedural nguyên bản được dựng từ reference, không dùng ảnh làm billboard.

Lan/Minh/An có **appearance chuyển tiếp** cùng hệ khối: Lan tóc búi thấp, thân tròn, seafoam và tạp dề mustard; Minh mảnh/cao, áo kem/áo lót gạch/túi navy; An bob ngắn, yếm coral và túi teal. Chúng chưa qua mẫu/turntable QA riêng và không được đánh dấu batch hoàn tất. ID ngoài cast nhận `coastal-resident`, không mạo danh Hải.

## API bàn giao

```js
createResidentModel(npc) // THREE.Group
animateResidentModel(model, { time, moving, reducedMotion }) // void
```

- Appearance chọn bằng `npc.id`, không dùng array index, nhà hay tọa độ; root và mọi mesh có `userData.residentId`.
- Root local giữa bàn chân tại mặt đất, mặt nhìn +Z. Scene chịu trách nhiệm đặt root về tọa độ canonical và xoay heading. Factory/animation không sửa world hoặc root transform.
- Các nhóm `head`, `body`, `left-leg`, `right-leg`, `left-arm`, `right-arm` là **khớp nhóm cứng**, không có skeleton/skin weights. Tay xoay tại vai và chân tại hông. Chưa có gối, khuỷu, talk hay seat animation.
- Walk in-place, góc chân/tay từ thời gian tuyệt đối; chân được nâng nhẹ ở khớp để không xuyên đất. Idle thở nhẹ và quay đầu nhỏ. Reduced motion khôi phục pose tác giả. Reset pose trước mỗi call nên cùng time/input luôn ra cùng transform, Pause chỉ cần giữ `world.time`.
- Chỉ animate bằng simulation time; không dùng timer riêng, không render bob chồng thêm từ placeholder cũ.
- Geometry/material cache thuộc **mỗi model**. Có thể share giữa mesh trong một model; không share sang resident khác. Scene dispose tập unique geometry/material khi remove root. `userData.pose`/`joints` chỉ là metadata render, không serialize vào save.

## Số đo thực bằng Three.js / Node

Đo `new Box3().setFromObject(model)` ở pose mặc định; kích thước X/Y/Z local, 1 tile = 1 unit. Triangle count cộng indexed/non-indexed triangles của **từng mesh instance**, không chỉ unique geometry. Đây không phải GPU frame profiling.

| Appearance | X / Y / Z | Min Y | Mesh | Triangle | Unique geometry | Material |
| --- | --- | --- | --- | --- | --- | --- |
| Hải | 0.260725 / 0.617534 / 0.127200 | 0.001000 | 85 | 5,780 | 9 | 21 |
| Lan, chuyển tiếp | 0.278107 / 0.586657 / 0.149000 | 0.000950 | 85 | 5,724 | 9 | 20 |
| Minh, chuyển tiếp | 0.228445 / 0.642235 / 0.127200 | 0.001040 | 84 | 5,676 | 9 | 20 |
| An, chuyển tiếp | 0.230928 / 0.580482 / 0.127200 | 0.000940 | 89 | 5,912 | 9 | 19 |
| Generic | 0.248309 / 0.605183 / 0.127200 | 0.000980 | 80 | 5,540 | 9 | 17 |

Hải được lấy mẫu 100 walk poses với `time = 0, .01, …, .99`; min Y thấp nhất **0.000922168**, không dưới mặt đất local trong dải đã đo. Đây không thay kiểm tra browser hoặc khẳng định không bao giờ giao nhau giữa tay/chân và môi trường.

Triangle nằm trong budget ứng viên 3k–6k của handoff. **Material count vượt budget ứng viên 1–2**, do procedural màu riêng; chưa có texture atlas, vertex-color consolidation hoặc LOD. Không tuyên bố performance đạt; số mesh/material cần được owner tích hợp kiểm tra qua renderer thật và lập task tối ưu trước batch.

## Kiểm chứng và giới hạn

- Root owner đã viết `tests/art-models.test.js` trước implementation và báo RED do thiếu module. Sau model: `node --test tests/art-models.test.js` **6 PASS** (bao gồm building sample của owner khác).
- `npm test`: **47 PASS, 0 FAIL** sau vòng sửa đầu tiên; gồm art/model/picking tests và 32 simulation/persistence tests. Các bài appearance/reload/root/determinism/resources dùng Three.js và world thật trong Node; **không phải browser/WebGL test**.
- CPU inventory và 100 pose sweep ở trên chạy trực tiếp bằng Node/Three.js. Mọi mesh được kiểm tra có đúng resident ID.
- Browser, ảnh front/side/back/3⁄4, crop Hải ở game camera, interaction/pause/reload thật và GPU profiling do owner tích hợp/QA thực hiện trong báo cáo increment. File này không tự gán PASS cho các bài ấy.

Sai khác còn lại so với concept: hình khối giản lược; tóc là các lock ellipsoid, chi tiết mặt chưa sculpt DCC; cổ/tay/gấu là nhóm mesh; chưa có nếp vải/atlas/normal map/skin rig, portrait expression hoặc basket accessory. Không tự thêm nón cho cả cast, NPC trang trí hoặc hành vi mới. Bước kế tiếp: đánh giá mẫu Hải trong camera thật và chỉnh tỷ lệ/độ đọc trước khi sản xuất batch.

## Sửa sau browser review vòng đầu

Đã xem ảnh browser thật `artifacts/art-sample/hai-first-pass.png` do owner tích hợp chụp. Ảnh cho thấy cổ/túi/nẹp áo bị chìm và quần có silhouette nhiều khối rời. Tái hiện riêng bằng Raycaster từ +Z qua tâm `shirt-placket`: first hit là `shirt` trước khi sửa (**RED**), do torso profile chứa Y tuyệt đối nhưng bị xoay quanh gốc mặt đất. Bỏ phép xoay riêng sai pivot; sau sửa ray đầu trúng button/placket và breast-pocket trước shirt (**GREEN**). Parent bổ sung regression test lâu dài `shirt front details remain visible outside the torso rather than buried by its lean`.

Quần đổi sang một lathe taper liên tục mỗi chân; cuff đổi thành vòng bo lathe, không còn chuỗi thigh/calf ellipsoid và hộp gấu. Mắt bớt vùng trắng, con ngươi cùng hướng, má đầy hơn và mày hơi bất đối xứng để giữ mặt người trưởng thành; không thêm chi tiết li ti. API, identity, world/root invariants và mốc chân giữ nguyên. Số đếm trên đã cập nhật sau sửa. Review ảnh vòng sau và kiểm browser tiếp thuộc owner tích hợp; chưa gán kết quả từ suy luận geometry.
