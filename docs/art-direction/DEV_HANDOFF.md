# Little Coast — bàn giao concept cho technical art và dev

Ngày: **22/10/2026**. Owner: **Technical Artist**. Trạng thái hiện tại: **PROCEDURAL SAMPLE INTEGRATED / PARTIAL BROWSER QA; chưa có GLB/skin rig hoặc production-art acceptance**.

**Cập nhật increment mẫu:** [ART_SAMPLE_REPORT.md](./ART_SAMPLE_REPORT.md) ghi kết quả thực của ART-DEV-02–05, API và sai khác với budget ứng viên. Phần yêu cầu bên dưới giữ để đối chiếu; các câu “chưa” trong mô tả baseline nói về lúc bàn giao concept, không phủ nhận model mới. ART-DEV-02/03 đã có source `src/art/characters.js` và `src/art/buildings.js`; ART-DEV-04/05 còn một số bài NOT RUN; ART-DEV-06 vẫn PLANNED. Nhà mẫu cao 1.018 thay khoảng ứng viên 1.15–1.45 sau review tỷ lệ người–nhà; Hải cao 0.618, vật rắn nhà/quán đều nằm trong một ô. Các số này là lựa chọn mẫu mới, không sửa GDD lịch sử.

Nguồn: yêu cầu trực tiếp mới nhất của người dùng về agent đồ họa dùng ImageGen thiết kế nhân vật/bối cảnh trước rồi dev làm theo; `AGENTS.md`; `docs/production/DECISIONS.md`; `STUDIO_BACKLOG.md`; `FIRST_PLAYABLE_REPORT.md`; GDD v1.1 §2.6, §3, §8 và §13; `docs/IMPLEMENTATION_CONTRACT.md`; `src/scene.js`, `src/simulation.js`. Hợp đồng tích hợp hiện có vẫn là nguồn chuẩn của API/runtime. Tài liệu này đặt yêu cầu cho bước sản xuất art tiếp theo; không tự thay schema hay luật simulation.

## 1. Đầu vào và cổng bàn giao

**Concept là đích thị giác**, chưa phải GLB, topology, UV, texture PBR, rig hay animation. Một ảnh turnaround có thể sai tỷ lệ giữa các hướng; technical artist phải đối chiếu, sửa model và ghi ngoại lệ. Chỉ báo ảnh đã tạo khi file tồn tại và đã được xem. Không đặt ảnh concept lên một mặt phẳng rồi gọi đó là nhân vật 3D hoàn thiện.

Các file bên dưới **đã tồn tại trong repo**. Technical Artist đã kiểm kê đường dẫn và mở xem hai style master; QA sheet riêng theo báo cáo Character Art và review Studio Lead. Đây là reference ảnh, chưa phải asset runtime:

| Bộ đích | File thực | Cách dev dùng |
| --- | --- | --- |
| Bác Hải | `assets/concepts/characters/hai-turnaround-v1.png` | Tỷ lệ, silhouette, khuôn mặt, chất liệu, phụ kiện của ID `hai` |
| Cô Lan | `assets/concepts/characters/lan-turnaround-v1.png` | Cùng hệ tỷ lệ; nhận dạng riêng ID `lan` |
| Anh Minh | `assets/concepts/characters/minh-turnaround-v1.png` | Cùng hệ tỷ lệ; nhận dạng riêng ID `minh` |
| Chị An | `assets/concepts/characters/an-turnaround-v1.png` | Cùng hệ tỷ lệ; nhận dạng riêng ID `an` |
| **Character style master** | `assets/concepts/characters/cast-lineup-style-target-v1.png` | Ưu tiên tỷ lệ gọn, khối đầu/tóc, silhouette chung; giữ identity từ sheet riêng |
| Làng Chài | `assets/concepts/environments/lang-chai-keyframe-v1.png` | Nhịp mái, vật liệu biển, mật độ chi tiết có chủ đích |
| Xóm Biển | `assets/concepts/environments/xom-bien-keyframe-v1.png` | Khu dân cư ven biển, quán nhỏ, lối dạo và cây xanh; giữ quan hệ với Làng Chài |
| Kit mô-đun | `assets/concepts/environments/coastal-modular-kit-v1.png` | Tách công trình, đường, mái, hiên, cây, đồ nghề thành asset có thể dựng |
| **Environment style master** | `assets/concepts/environments/coastal-runtime-style-target-v1.png` | Ưu tiên khối 3D dày, bề mặt matte, mảng màu gọn và mức giản lược runtime |

**Thứ tự ưu tiên đã chọn dưới ủy quyền studio:** hai style master quyết định ngôn ngữ hình khối/chất liệu chung; sheet riêng quyết định identity, trang phục/phụ kiện; keyframe và modular kit cung cấp bố cục, motif địa phương và quan hệ vật liệu. Các keyframe chi tiết hơn, có sắc thái quasi-real; không đưa tỷ lệ hiện thực hoặc noise vải/da/đá từ chúng lên trên style master. Style master cũng là ảnh minh họa, không chứa geometry, kích thước kỹ thuật hay tọa độ vật thể. Không sao chép dân/nhà trong ảnh thành fixture runtime.

**Giới hạn đã thấy khi QA:** lineup vẫn có Minh gần khoảng 5 đầu theo quan sát, cao và dài hơn mục tiêu; còn noise vải và tóc nhỏ. Dựng mesh phải chuẩn hóa khoảng 4–4,5 đầu, giữ tương quan cao thấp và bộ nhận dạng, làm sạch chi tiết. Sheet riêng có front / 3⁄4 / back, **chưa có side 90°**; technical artist phải giải quyết cấu trúc nghiêng khi dựng, thêm turntable/side render ở gate mẫu. `CHARACTER_DESIGNS.md` và `ENVIRONMENT_DESIGNS.md` đã có, đã đọc và ghi giới hạn chi tiết. Bộ master môi trường đọc rõ hai vùng cùng phong cách nhưng tán còn nhiều lá; kit chỉ có góc 3⁄4, cần tự giải quyết mặt sau/snapping. Chưa chứng minh fit grid/pivot/performance hoặc công trình 3D đã chạy. `lang-chai-study-v0.png` được giữ truy vết, không thuộc chín reference chính và không được dùng làm style master.

**Cổng ART→DEV:** art owner ghi lựa chọn concept, palette, tỷ lệ và các điểm nhận dạng trong art bible; technical artist kiểm tra đọc rõ ở góc camera game và quy đổi được về footprint. Studio Lead tự chọn hướng trong ủy quyền hiện có; không cần biến mỗi quyết định art thành vòng xin phép. Nếu concept có lô nhà rộng, đường cong hoặc đông dân hơn runtime, phải ghi đó là đích bố cục tương lai hoặc cảnh minh họa, không ngầm đổi seed/luật để giống ảnh.

Trong lượt art này chỉ tạo reference và hợp đồng. **Dev chưa rework scene trước khi có đích hình ảnh thật**. Sau cổng, làm một mẫu nhân vật + nhà + quán để kiểm chứng trước toàn bộ nội dung.

## 2. Danh tính nhân vật và nhận dạng

Renderer hiện tạo người từ cùng một cơ thể/nón, khác màu theo chỉ số mảng. Bộ mới phải chọn bằng `npc.id`, không bằng vị trí trong mảng, nhà đang ở hoặc thứ tự load. Bốn ID cố định đã tồn tại: `hai` = Bác Hải, `lan` = Cô Lan, `minh` = Anh Minh, `an` = Chị An. Chỉ `hai` hiện có cờ named/narrative thử nghiệm; tạo hình riêng ba người còn lại **không** tự thay gameplay/narrative flags.

- Hệ tỷ lệ chung: **khoảng 4,5 đầu** tính đỉnh sọ đến bàn chân, không tính nón/tóc cao. Gương mặt người trưởng thành, tay/chân có thể đọc động tác; không đổi thành trẻ em chỉ để đạt tỷ lệ cozy.
- Mỗi người cần khác ít nhất **ba trục độc lập**: khối đầu/tóc và nét mặt; vai–thân–tư thế; phom quần áo; phụ kiện chính. Màu áo hỗ trợ nhận dạng nhưng không được là khác biệt duy nhất.
- Bộ sheet đã có front / 3⁄4 / back và inset mặt, phụ kiện; side 90° còn thiếu. Bước dựng mẫu bổ sung side/turntable đồng tỷ lệ, thêm mặt trung tính và một biểu cảm đặc trưng; chỉ một bộ trang phục chính cho pass đầu. Vị trí phụ kiện không được đổi bên ngẫu nhiên giữa các view.
- Bộ nhận dạng đã ghi ở `CHARACTER_DESIGNS.md`: Hải tóc bạc ngắn/ria bạc, vai hơi còng, áo indigo/quần olive; Lan búi thấp/dáng tròn, áo seafoam/tạp dề mustard; Minh tóc hất lệch/dáng thanh, áo kem mở/áo gạch/quần navy/túi xanh; An bob ngắn/dáng gọn, yếm coral/áo kem/túi teal. Không tự bịa tiểu sử, nghề, quan hệ hay kỷ niệm từ phụ kiện. Đặc điểm già/trẻ, tóc, giỏ và nón phải theo concept studio đã chọn.
- Không đội cùng một nón lá lên cả bốn để thay cho thiết kế khuôn mặt. Gỡ phụ kiện vẫn cần phân biệt đầu/thân/trang phục.
- Cư dân mới tiếp tục lấy từ ledger; chỉ dùng variant chung khi ID không thuộc bốn người trên. Không clone bốn người thành đám đông trang trí và không gán identity của họ cho dân mới.

Kiểm tra tiếp nhận: contact sheet cùng góc, cùng ánh sáng, cùng chiều cao tương đối; render ở kích thước xuất hiện thật trong gameplay và lúc zoom gần. Reviewer ghi rõ có phân biệt được silhouette và màu hay không; đây là đánh giá studio, chưa phải nghiên cứu nhận dạng bởi người chơi.

## 3. Tọa độ, kích thước và footprint

Hiện trạng đã đọc trong code: grid **22 × 16**, tâm ô là số nguyên `x,z`, **1 tile = 1 world unit**, +Y hướng lên; `groundY = 0.1`. Xóm Biển bắt đầu tại `x >= 14`; biển ở phía `z >= 16`. Root công trình đặt `(b.x, 0.1, b.z)` và xoay `(b.rotation || 0) × π/2` quanh Y. NPC quay theo `atan2(dx,dz)`, nên model **nhìn +Z** ở góc 0. Mỗi công trình hiện chiếm **đúng 1 ô**, kể cả quán/chợ/nhà/bến; đường nối 4 hướng. Đây là fixture kỹ thuật hiện hành, không là chuẩn bản đồ production bất biến.

Quy ước asset đích:

| Loại | Pivot / kích thước chuẩn hóa ứng viên | Ràng buộc |
| --- | --- | --- |
| Nhân vật | Root giữa hai bàn chân, mặt đất local Y=0, mặt hướng +Z; thân không tính nón cao khoảng **0.50–0.60 unit**, ngang thân khoảng 0.16–0.23 | Cùng tỷ lệ 4,5 đầu; không dùng scale khổng lồ để bù thiếu chi tiết. Đo lại với nhà/camera mẫu trước batch. |
| Nhà/quán/chợ | Root giữa tâm footprint, đáy local Y=0; thân/đồ rắn nằm trong **0.90 × 0.90 unit**; chiều cao thử nhà 1.15–1.45, quán 0.80–1.10 | Mái/hiên có thể tới 0.98 nhưng không tràn vào đường hay che ô liền kề. Số đo là proposal để test, không tuyên bố đã đạt. |
| Đường | Tâm ô, mặt đi bộ local Y khoảng 0.02; biên tối đa 1 × 1 | Mesh giữa/cạnh/góc/ngã ba/ngã tư theo graph thật; cả bốn hướng hợp lệ, không vẽ đường cong thành tuyến giả. Mép nối không khe/hõm gây cảm giác vấp. |
| Cây/ghế | Root giữa ô, mặt đất Y=0; thân cây/chân ghế trong footprint | Tán có thể nhô cao nhưng không che picking; cây và ghế là hai công trình độc lập. Không ghép cây bắt buộc vào ghế. |
| Bến | Root tâm ô, đáy/chân bến theo mực nước; đoạn hoạt động trên ô `z=15` | Phần vươn biển phải ở ngoài đất có thể xây và vẫn đúng sau mọi quarter-turn được API cho phép. Nếu kit chưa xử lý các hướng, ghi gap và sửa thiết kế/hợp đồng trước tích hợp; không âm thầm đổi placement. |

Các số trên là **ứng viên chưa đo runtime**. Giữ gốc và scale ở file source, apply transforms khi export; manifest ghi dimensions thực. Animation không được đưa bàn chân xuyên dưới ground hoặc đẩy root khỏi tọa độ canonical. Cách renderer hiện cộng thêm .015 và bob .022 là placeholder cần xem lại ở mẫu có chân; không cộng chồng bob vào walk cycle đã có.

Nếu concept cần quán 2×2, vỉa hè rộng hơn hoặc đường cong: lập task thay footprint/picking/graph/save trong `IMPLEMENTATION_CONTRACT.md`, có TDD và migration khi cần. Trong pass art đầu, ưu tiên module 1 ô để thử mức chất lượng trước; không phóng model 2 ô trong khi validator vẫn coi 1 ô.

## 4. Hai vùng và trang trí trung thực với world

Làng Chài: ưu tiên mặt tiền thấp, vật liệu chịu hơi biển, mái/ngói/tôn có kiểm soát, gỗ và dụng cụ nghề cá; tách lớp khối lớn → chi tiết trung → đồ nhỏ. Xóm Biển: nhịp khu dân cư liền mạch hơn, hiên/quán và góc nghỉ, lối dạo có cây; palette/mái liên hệ Làng Chài để không thành một resort khác game. Chất liệu, biến thể và điểm nhấn cuối cùng phải lấy từ concept có file thực.

- Seed không đổi: nhà (5,6), (8,6), đường z=7 x=0..12 và x=11 z=8..14, bến (11,15), chợ (12,11), **4 cư dân**. Không thêm dãy nhà có vẻ ở được hay người trang trí để lấp cảnh.
- Bề mặt cát/cỏ loang, sóng, vật ngoài map hoặc đồ nhỏ đi kèm công trình có thể tăng độ phong phú mà không thay gameplay. Không để đá lớn, hàng rào, bàn ghế độc lập cản một ô validator vẫn cho xây/đi.
- Props gắn một công trình phải Move/Delete theo đúng công trình; đồ được coi là độc lập phải có đối tượng world riêng qua hợp đồng tương ứng. Cột hiên, biển hiệu và quán không thành đường đi giả.
- Trên ô còn trống trong vùng xây, chỉ dùng decor thấp/phẳng có thể bị che bởi model; không tạo hidden barrier. Scenery ở ngoài map cần đọc được là rìa cảnh và không giống nhà chức năng có thể chọn.
- Xóm Biển chưa mở phải tiếp tục đúng `regionUnlocked`; art không tự unlock, không seed đô thị/dân bên trong để khớp keyframe. Có thể đổi sắc nền/vegetation theo vùng. Công trình variant vùng chọn từ tọa độ hiện tại theo một quy tắc manifest ổn định; Move giữ nguyên building ID/cư dân, chỉ đổi presentation nếu chính sách ấy được ghi rõ.
- Cảnh keyframe đông hơn có thể làm mục tiêu cho **save thử nghiệm riêng** sau này, gắn nhãn scene art test; không ghi đè save người dùng hoặc dùng ảnh ấy báo seed đã đạt chất lượng tương tự.

## 5. Cấu trúc file và manifest đề xuất

```text
assets/concepts/characters/<id>-turnaround-v1.png
assets/concepts/environments/<region>-keyframe-v1.png
assets/concepts/environments/coastal-modular-kit-v1.png
assets/source/characters/<id>/<id>-v1.blend
assets/source/environment/<asset-id>/<asset-id>-v1.blend
public/assets/models/characters/<id>-v1.glb
public/assets/models/environment/<asset-id>-v1.glb
public/assets/textures/<atlas-id>-basecolor-v1.webp
public/assets/manifest-v1.json
```

Đây là **cấu trúc đề xuất**, chưa có manifest hoặc GLB được tạo. Concept/source không bundle vào game. Tên ASCII, kebab-case, version rõ; asset ID tách building instance ID. Ví dụ `house-lang-chai-a` là asset, `b-1` vẫn là công trình trong save.

Manifest mỗi asset ghi: `id`, `kind`, `uri`, `conceptSource`, `sourceFile`, `version`, `unitsPerTile:1`, `forwardAxis:'+Z'`, `upAxis:'+Y'`, `pivot`, `dimensions`, `footprint`, `materialCount`, `triangleCount`, `textureUris`, `animationClips`, `bounds`, `authorship`, `generationTool` nếu có, `status`. Ghi số thực đã export; field chưa đo để null cùng lý do. Không đưa manifest vào schema save trừ khi có thay đổi interface được duyệt trong hợp đồng.

glTF 2.0/GLB là lựa chọn chuẩn trao đổi ứng viên; texture base color sRGB, normal/roughness data linear. Tránh bake bóng mạnh/hướng sáng cố định vào albedo khiến sáng tối mâu thuẫn thời gian ngày. Load lỗi có fallback procedural rõ; asset readiness không làm thời gian simulation ngừng tùy tiện hoặc nhân đôi NPC. Chia sẻ geometry/material có ownership/dispose rõ, giữ picking `buildingId`/`residentId` trên mesh con.

Ngân sách **đề xuất chưa profile** để ràng buộc mẫu: nhân vật LOD0 3k–6k triangles, 1–2 material; nhà/quán 2k–5k; prop 50–600; atlas nhân vật 1024 và môi trường 1024–2048. Đếm draw calls, GPU memory, tải và thời gian frame trên máy ghi rõ sau khi mẫu chạy; không hứa FPS hoặc thiết bị tối thiểu từ các con số này. LOD sau nếu đo thấy cần. Không viết budget ứng viên thành thành tích performance.

## 6. Rig, animation và phương án chuyển tiếp

- Một rig humanoid đơn giản chung có root/hips/spine/chest/head, vai/cánh tay/cẳng tay/tay, đùi/cẳng chân/bàn chân; phụ kiện tách để điều chỉnh mà không phá silhouette. Skinning cần kiểm tra cổ, vai, khuỷu, gối. Không cần facial rig đầy đủ ở pass đầu.
- Clip đặt tên `idle`, `walk`, `talk`, `sit-down`, `sit-idle`, `stand-up`. Mẫu đầu chỉ yêu cầu `idle` + `walk`; `talk` chỉ chạy khi UI hội thoại thực mở, cần hook rõ nếu renderer chưa nhận trạng thái UI.
- Walk **in-place**, root motion bằng 0: tọa độ từ simulation. Chọn clip theo activity/delta vị trí canonical; chống trượt chân bằng chỉnh tốc độ clip, không kéo người đến vị trí model mong muốn.
- Hiện NPC dừng ở **ô đường kề quán/ghế/bến**; chưa có chỗ ngồi/socket hay đường đi vào nội thất. Vì vậy chưa bật sit dù GLB chứa clip. Dùng idle/tư thế ghé phù hợp ngoài đường. Muốn ngồi đúng ghế phải thêm endpoint/seat reservation/entry-exit hợp lệ vào simulation và contract bằng task riêng, có test trước. Không teleport render tới ghế.
- Animation người, vật dụng hoạt động/thuyền và mưa đi theo `world.time`; Pause dừng world activity, hidden tab không catch-up. Reduced motion tắt bob/secondary motion mạnh, không thay route/law/identity. Dao động trang trí sóng hiện có thể theo thời gian render nhưng không được tạo sự kiện hoặc hành vi NPC khi Pause.
- Nếu chưa có DCC/export rig trong milestone đầu, dev có thể dùng **mesh procedural chuyển tiếp** bám tỷ lệ, phom mặt/tóc/quần áo/phụ kiện của concept; phải báo đúng mức fidelity. Không gọi đó là model cuối hay ảnh đã biến thành GLB.
- Billboard turnaround xoay theo camera mất silhouette khi orbit, có thể phản nắng sai và trượt hướng đi. Chỉ dùng ảnh trong tài liệu/reference hoặc portrait UI được ghi rõ; không dùng làm giải pháp thay nhân vật 3D của pass này.

## 7. Task thực thi sau khi concept sẵn sàng

**ART-DEV-01 đã hoàn thành reference QA ở cấp studio.** Trạng thái sau increment mẫu: ART-DEV-02/03 **IMPLEMENTED**, ART-DEV-04/05 **INTEGRATED / PARTIAL VERIFIED**, ART-DEV-06 **PLANNED**. Các tiêu chí bên dưới tiếp tục dùng để thấy việc còn thiếu; không suy từ triển khai thành nghiệm thu tất cả tiêu chí. Một owner chịu trách nhiệm mỗi deliverable; reviewer phối hợp tuần tự, tránh cùng sửa `src/scene.js`.

| ID | Owner → nhận bàn giao | Dependency và deliverable | Acceptance có thể quan sát |
| --- | --- | --- | --- |
| ART-DEV-01 — khóa mục tiêu mẫu | Art Director → Technical Artist | **REFERENCE QA COMPLETE / READY FOR DEV SAMPLE**. 9 reference chính thực có; quy tắc ưu tiên hai master, identity từng ID và giới hạn đã ghi | Studio review thấy bốn silhouette/trang phục riêng và hai vùng cùng hệ khối; technical artist đã xem hai master. Giới hạn Minh dài người, cloth noise và thiếu side view chuyển sang mẫu. Không gọi đây là human approval hay working model. |
| ART-DEV-02 — mẫu Hải | Character Artist/Technical Artist → Rendering | ART-DEV-01; model hoặc procedural mẫu `hai`, idle/walk, dimensions/material/triangle count thực | Front/side/back/3⁄4 khớp concept; bàn chân local Y=0; nhìn +Z; không đổi ID. Render trên một ô đường trong camera thực và kiểm tra tay/chân không xuyên. |
| ART-DEV-03 — mẫu nhà + quán | Environment Artist/Technical Artist → Rendering | ART-DEV-01; một nhà Làng Chài, một quán biến thể Xóm Biển hoặc motif tương ứng, road connection mẫu | Đọc rõ khác công dụng; fit footprint cả 4 góc xoay; façade/cửa/lối tiếp cận không xung đột đường; props đi cùng parent; không cần thêm cư dân để ảnh đẹp. |
| ART-DEV-04 — tích hợp mẫu so sánh | Rendering Engineer → QA + Art Director | ART-DEV-02/03; chỉ thay presentation, giữ API và seed. Nếu interface đổi, cập nhật contract trước code | Chụp trước/sau cùng camera/viewport/zoom/ánh sáng/world time; thêm crop Hải và nhà/quán ở cự ly chơi. Selection/preview/rotation/Move/Delete còn đúng; asset lỗi có fallback. |
| ART-DEV-05 — xác minh mẫu | QA → Studio Lead | ART-DEV-04; browser thật và world snapshot kiểm soát được | Route ở road thật; Pause không đi chân/đổi vị trí; reload giữ 4 seed IDs/home/memories và appearance mapping; quán trống không có khách giả; locked region còn khóa. `npm test`, `npm run build` và affected checks có kết quả thật. Ghi console, viewport/browser, máy và profiling đã đo hoặc NOT RUN. |
| ART-DEV-06 — sản xuất batch | Character + Environment Artist, chia asset độc quyền → Rendering | ART-DEV-05 có quyết định keep/revise; mẫu art nhìn đạt đích và không phá runtime | Hoàn thiện Lan/Minh/An và kit 7 loại theo mẫu; variant hai vùng/road graph, manifest/export đầy đủ; lại kiểm browser và không tự coi art review là human playtest ACCEPTED. |

Không chạy mass production trước mẫu: tỷ lệ nhà/NPC, camera và pixel size ở gameplay có thể làm chi tiết mặt vô dụng hoặc công trình che tuyến. Mẫu là nơi giải quyết trước khi lặp lỗi lên toàn bộ kit.

## 8. Bài nghiệm thu mẫu và bằng chứng phải lưu

1. Dùng bản world test tách save người chơi. Ghi checksum/snapshot trước thay art; seed đúng 4 người và ledger không đổi sau load. Không cần unlock giả để xem vật liệu Xóm Biển: có thể dùng turntable asset riêng được ghi nhãn.
2. Chụp baseline và mẫu ở **1280×720**, cùng state, camera `(26.5,29,36)`, target `(8,0,9)`, zoom 1.23 rồi ghi frustum thực sau resize. Khung crop gần thứ hai dùng transform camera được ghi; không thay ánh sáng giữa trước/sau. Nếu framing đổi để đo occlusion thì tạo một cặp so sánh riêng.
3. Cho Hải đi tuyến có sẵn: vị trí mesh x/z đối chiếu snapshot, heading +Z và quay bốn hướng đúng; không lệch ô/cắt xuyên nhà. Quán chưa có khách không animate người trang trí. World pause: chụp hai thời điểm, người/hoạt động không tiến; camera còn dùng được.
4. Đặt, xoay 4 hướng, Move rồi Delete mẫu nhà/quán; hình chọn đúng building ID, không bị props giữ lại, không che preview ngoài footprint. Cắt đường và Move đến nơi disconnected vẫn báo đúng trạng thái; không dùng art để giả công trình hoạt động.
5. Save/reload rồi kiểm IDs, home IDs, positions, route, time, memory và appearance map; không reset save vì thiếu asset. Bản import hỏng vẫn bị reject, Last Known Good giữ nguyên nếu có đổi đường load/save.
6. Kết quả ghi ở báo cáo increment: PASS/FAIL/NOT RUN theo từng bài, ảnh runtime gốc và crop, console, số mesh/material/draw calls nếu đã đo, sai khác với concept và task tiếp. Ảnh ImageGen luôn gắn nhãn concept; ảnh browser luôn gắn nhãn runtime. Chưa chạy bài nào thì ghi chưa chạy.

**Handoff hiện tại:** mẫu Hải + nhà/quán đã dùng trong game và trang art review; 47 tests/build đạt, browser smoke có ảnh, chi tiết trong báo cáo mẫu. Owner tiếp theo: Art/Technical Director hoàn thiện độ đọc cast, môi trường và profile trước batch. Không có GLB, skin rig, GPU benchmark hay human playtest acceptance; chất lượng vertical slice vẫn chưa được tuyên bố đạt.
