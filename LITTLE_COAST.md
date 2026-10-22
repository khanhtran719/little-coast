# LITTLE COAST

## Product Discovery v0.10 — Consolidated Requirements

**Phiên bản:** 0.10 — Review Draft  
**Ngày:** 22/10/2026  
**Trạng thái:** Product Discovery  
**Chưa phê duyệt:** GDD, MVP chính thức, Technical Design, Game Engine, kế hoạch triển khai code

---

# 1. Executive Summary

Little Coast là game indie **Cozy City Builder / Light Simulation / Living World** trên nền tảng web desktop.

Người chơi quan sát và phát triển một làng chài ven biển Việt Nam từ góc nhìn 3D Isometric. Họ xây dựng nhà cửa, đường phố, cây xanh, tiện ích và các công trình đặc trưng, từng bước mở rộng thành phố theo các mốc dân cư, cảnh quan và thành tựu, không sử dụng tiền làm tài nguyên xây dựng.

Thế giới tự vận hành với chu kỳ ngày đêm, thời tiết, người dân, xe cộ, tàu đánh cá, hải đăng và các sự kiện tự nhiên hiếm như cá voi xuất hiện ngoài khơi.

Người chơi có thể chuyển sang Ambient Mode toàn màn hình, nghe nhạc, tiếng sóng và quan sát thành phố ở ba chế độ: Living, Slow và Scenic Pause.

Hệ thống Hybrid AI cho phép NPC có tính cách, ký ức và hội thoại, đồng thời hỗ trợ nhật ký thành phố. Tuy nhiên, các quy tắc mô phỏng, sự kiện, template và memory có cấu trúc được xử lý cục bộ. Cloud AI chỉ được gọi khi cần thiết.

## 1.1. Ba trụ cột sản phẩm

| Pillar                  | Giá trị cốt lõi                                  | Tiêu chí thành công                                   |
| ----------------------- | ------------------------------------------------ | ----------------------------------------------------- |
| **Meaningful Building** | Người chơi thấy thành phố thay đổi nhờ quy hoạch | Công trình và đường có tác động dễ quan sát           |
| **Living Ambience**     | Thành phố vẫn thú vị khi không tương tác         | Có nhịp sống, âm thanh, cảnh quan và sự kiện phù hợp  |
| **Memorable World**     | Thành phố có lịch sử riêng                       | NPC và nhật ký phản ánh đúng những thay đổi đã xảy ra |

## 1.2. Những gì Little Coast không hướng đến trong phiên bản đầu

Đây là các ranh giới sản phẩm **đề xuất**, chưa phải quyết định cuối cùng:

- Không trở thành game quản lý ngân sách, thuế, điện, nước hoặc chuỗi cung ứng phức tạp.
- Không mô phỏng từng cư dân bằng một LLM Agent độc lập.
- Không cần bản đồ sinh vô hạn.
- Không có thiên tai gây phá hủy hàng loạt hoặc game over vì quy hoạch kém.
- Không dùng các hoạt động lặp vô hạn để thúc ép tiến trình.
- Không cần thế giới nhiều người chơi hoặc multiplayer trong MVP.
- Không triển khai hình nền hệ điều hành thực sự trong MVP web.
- Không để Cloud AI quyết định tính đúng sai của World State.

---

# 2. Decision Register — Quy ước trạng thái

Để tránh các quyết định bị hiểu nhầm qua nhiều phiên Discovery, toàn bộ Decision Register sử dụng bốn trạng thái:

| Trạng thái    | Ý nghĩa                                                        |
| ------------- | -------------------------------------------------------------- |
| **CONFIRMED** | Người chơi đã lựa chọn hoặc xác nhận rõ                        |
| **PARTIAL**   | Một phần đã chốt, chi tiết còn thiếu                           |
| **OPEN**      | Chưa được lựa chọn; có thể có phương án đề xuất                |
| **DEFERRED**  | Không cần chốt ở Discovery hiện tại; chuyển sang giai đoạn sau |

Một phương án do người thiết kế đề xuất **không trở thành CONFIRMED** khi chưa được người chơi phê duyệt.

Các nguyên tắc an toàn trạng thái và tính nhất quán được coi là ràng buộc thiết kế đề xuất để kiểm chứng, không được tự nhận là quyết định sản phẩm đã chốt.

---

# 3. Confirmed Product Baseline

Đây là danh sách các quyết định lớn đã được xác nhận qua v0.1–v0.9.

| ID  | Nhóm             | Quyết định đã xác nhận                                                 |
| --- | ---------------- | ---------------------------------------------------------------------- |
| C01 | Genre            | Quản lý và xây dựng thành phố biển mang tính thư giãn                  |
| C02 | Platform         | Web browser, ưu tiên desktop                                           |
| C03 | Perspective      | 3D Isometric, góc nhìn từ trên cao                                     |
| C04 | Art              | Cozy Stylized 3D                                                       |
| C05 | Setting          | Thành phố biển Việt Nam                                                |
| C06 | Evolution        | Làng chài nhỏ phát triển thành đô thị biển                             |
| C07 | Geography        | Địa hình ven biển nối với đất liền                                     |
| C08 | World Map        | Region được thiết kế sẵn, mở rộng theo tiến trình                      |
| C09 | Construction     | Xây dựng trên Grid                                                     |
| C10 | Terrain          | Chỉnh sửa nhẹ nền đất, bảo tồn địa hình tổng thể                       |
| C11 | Economy          | Không dùng tiền để xây công trình                                      |
| C12 | Progression      | Mở khóa theo thành tựu, dân số, cảnh quan                              |
| C13 | Connectivity     | Có thể xây công trình thiếu đường; hoạt động bị giới hạn               |
| C14 | Passive Growth   | Dân cư, cây xanh và du lịch có thể phát triển khi người chơi không xây |
| C15 | Time             | Một ngày game khoảng 20–30 phút thực                                   |
| C16 | Weather          | Thay đổi tự nhiên và người chơi có thể can thiệp                       |
| C17 | Living World     | Có hoạt động NPC, phương tiện, tàu đánh cá                             |
| C18 | Landmarks        | Có hải đăng và sự kiện cá voi ngoài khơi                               |
| C19 | Population       | Tái định cư mềm khi xóa nhà; ưu tiên nhà trống, có thời gian chờ       |
| C20 | NPC Preservation | Cư dân nền có thể rời đi dần; NPC đặc biệt giữ ký ức                   |
| C21 | Ambient          | Fullscreen, nhạc và âm thanh thiên nhiên                               |
| C22 | Ambient Time     | Có Living, Slow và Scenic Pause                                        |
| C23 | AI NPC           | Có hội thoại, ký ức, nhật ký và sự kiện nhỏ                            |
| C24 | AI Architecture  | Hybrid AI                                                              |
| C25 | Local Systems    | Simulation, Event, Template và Structured Memory xử lý cục bộ          |
| C26 | Cloud AI         | Chỉ gọi theo nhu cầu                                                   |

**Lưu ý:** Việc đã chốt một hệ thống không có nghĩa toàn bộ thông số bên trong hệ thống đó đã được chốt. Ví dụ, C15 xác nhận khoảng 20–30 phút/ngày, không xác nhận chính xác 24 phút.

---

# 4. Full Decision Register — D01 đến D58

Đây là bảng hợp nhất toàn bộ các quyết định đã được mở trong các phiên v0.3–v0.9, cập nhật theo lựa chọn mới nhất.

## 4.1. World Map, Construction, Terrain, Population — D01–D17

| ID  | Nội dung                                                 | Trạng thái | Kết quả hiện tại / việc còn thiếu                                         |
| --- | -------------------------------------------------------- | ---------- | ------------------------------------------------------------------------- |
| D01 | Cơ chế mở rộng bản đồ                                    | CONFIRMED  | Region thiết kế sẵn, mở theo tiến trình                                   |
| D02 | Mức tự do chỉnh công trình và địa hình                   | PARTIAL    | Grid và chỉnh nền nhẹ đã chốt; quy tắc chỉnh công trình chi tiết còn mở   |
| D03 | Tăng trưởng khi không xây, khi chuyển tab, khi đóng game | PARTIAL    | Khi không xây đã chốt; tab nền/offline chưa chốt                          |
| D04 | Giới hạn can thiệp thời tiết                             | OPEN       | Cần thống nhất lợi ích mô phỏng và tần suất đổi thời tiết                 |
| D05 | Điều kiện để dân cư và dịch vụ phát triển                | OPEN       | Có mô hình đề xuất; công thức và điều kiện chưa duyệt                     |
| D06 | Ambient giữ thời điểm hoặc thời tiết yêu thích           | PARTIAL    | Scenic Pause đã chọn; lựa chọn cảnh, thời tiết và quy tắc cụ thể còn mở   |
| D07 | Memory lưu cục bộ hay đồng bộ                            | PARTIAL    | Xử lý Structured Memory cục bộ đã chốt; lưu trữ lâu dài/chia sẻ chưa chốt |
| D08 | Xây công trình khi thiếu đường                           | CONFIRMED  | Được xây, nhưng hoạt động bị giới hạn                                     |
| D09 | San nền thủ công hay tự động                             | OPEN       | Đề xuất cả hai, có preview và xác nhận thay đổi                           |
| D10 | Mạng đường dân sinh và đường đi bộ liên thông            | OPEN       | Đề xuất qua các điểm kết nối hợp lệ                                       |
| D11 | Có cần một mạng đường trung tâm duy nhất                 | OPEN       | Đề xuất hỗ trợ các cụm sinh hoạt độc lập                                  |
| D12 | Di chuyển nhà có người ở                                 | OPEN       | Đề xuất giữ danh tính nhà và cư dân, cập nhật tuyến                       |
| D13 | Công trình xây tức thì hay chờ thi công                  | OPEN       | Đề xuất xuất hiện ngay kèm animation ngắn                                 |
| D14 | Xóa nhà có hoàn nguyên đất không                         | OPEN       | Đề xuất không tự hoàn nguyên                                              |
| D15 | Xóa đường khi xe đang chạy                               | OPEN       | Đề xuất hoàn tất hoặc giải quyết hành trình an toàn                       |
| D16 | Kích thước Grid và chiều rộng đường                      | OPEN       | Phải kiểm chứng bằng tỷ lệ asset và prototype                             |
| D17 | Trang trí tự do bên trong một ô                          | OPEN       | Đề xuất chỉ áp dụng cho vật nhỏ                                           |

## 4.2. Time, Weather, Living World — D18–D29

| ID  | Nội dung                               | Trạng thái | Kết quả hiện tại / việc còn thiếu                          |
| --- | -------------------------------------- | ---------- | ---------------------------------------------------------- |
| D18 | Tốc độ chuẩn của một ngày              | PARTIAL    | 20–30 phút đã chốt; 24 phút là đề xuất                     |
| D19 | Ambient Time Modes                     | CONFIRMED  | Living, Slow, Scenic Pause                                 |
| D20 | Offline Growth                         | OPEN       | Chưa chốt có tăng trưởng khi đóng game và giới hạn bao lâu |
| D21 | Giới hạn quyền năng thời tiết          | OPEN       | Đề xuất điều khiển tự do nhưng không cộng lợi ích vô hạn   |
| D22 | Thời tiết nguy hiểm                    | OPEN       | Đề xuất không có thiên tai gây phá hủy trong MVP           |
| D23 | Lịch NPC cố định hay linh hoạt         | OPEN       | Đề xuất lịch cơ bản kèm thay đổi theo điều kiện            |
| D24 | NPC đặc biệt tạm rời thành phố         | PARTIAL    | Bảo toàn ký ức đã chốt; cơ chế vắng mặt/trở lại còn mở     |
| D25 | Mô phỏng tắc đường                     | OPEN       | Đề xuất loại khỏi MVP                                      |
| D26 | Hải đăng hoạt động trước khi mở Region | OPEN       | Đề xuất nhìn thấy và có thể sáng từ xa                     |
| D27 | Thông báo cá voi                       | OPEN       | Đề xuất tín hiệu nhẹ, tùy chọn                             |
| D28 | Thành tựu từ sự kiện cá voi            | OPEN       | Đề xuất tùy chọn, không chặn tiến trình chính              |
| D29 | Tần suất viết nhật ký                  | OPEN       | Đề xuất dựa vào sự kiện đáng nhớ và tóm tắt có chọn lọc    |

## 4.3. AI NPC, Memory, Narrative — D30–D42

| ID  | Nội dung                                  | Trạng thái | Kết quả hiện tại / việc còn thiếu                                 |
| --- | ----------------------------------------- | ---------- | ----------------------------------------------------------------- |
| D30 | Hình thức hội thoại                       | OPEN       | Đề xuất câu hỏi gợi ý kết hợp chat tự do                          |
| D31 | Cách vận hành Cloud AI                    | PARTIAL    | Hybrid AI và gọi theo nhu cầu đã chốt; gateway/provider chưa chốt |
| D32 | Số NPC đặc biệt trong Vertical Slice      | OPEN       | Đề xuất 2–3 người                                                 |
| D33 | NPC có chủ động bắt chuyện                | OPEN       | Đề xuất hiếm, không gây phiền                                     |
| D34 | Cơ chế phai nhạt/tóm tắt ký ức            | OPEN       | Đề xuất giữ mốc quan trọng, tóm tắt ký ức ít liên quan            |
| D35 | Thời điểm tạo nhật ký                     | OPEN       | Đề xuất theo sự kiện và khi có đủ nội dung                        |
| D36 | AI tạo sự kiện gameplay mới               | OPEN       | Đề xuất không cho Cloud AI tạo trực tiếp trong MVP                |
| D37 | Fallback khi AI không hoạt động           | PARTIAL    | Template cục bộ đã chốt; trải nghiệm fallback chi tiết còn mở     |
| D38 | Vị trí lưu Structured Memory              | PARTIAL    | Xử lý cục bộ đã chốt; persistence/sync chưa chốt                  |
| D39 | Mức độ quan hệ NPC–người chơi             | OPEN       | Đề xuất quen biết, kỷ niệm và phản hồi tự sự                      |
| D40 | Chính sách giới hạn chi phí AI            | OPEN       | Đề xuất hạn mức mỗi người chơi và tổng hệ thống                   |
| D41 | Voice chat hoặc NPC voice                 | DEFERRED   | Đề xuất để sau MVP                                                |
| D42 | NPC AI được ảnh hưởng công trình/gameplay | OPEN       | Đề xuất chỉ qua cơ chế gameplay được phê duyệt                    |

## 4.4. Art, Camera, UX, Audio, Performance — D43–D58

| ID  | Nội dung                               | Trạng thái | Kết quả hiện tại / việc còn thiếu                   |
| --- | -------------------------------------- | ---------- | --------------------------------------------------- |
| D43 | Phong cách đồ họa                      | CONFIRMED  | Cozy Stylized 3D                                    |
| D44 | Orthographic hay Perspective           | OPEN       | Đề xuất prototype Orthographic trước                |
| D45 | Giới hạn xoay và nghiêng camera        | OPEN       | Đề xuất camera có giới hạn góc                      |
| D46 | Ambient Camera mặc định                | OPEN       | Đề xuất Static; Orbit/Tour tùy chọn                 |
| D47 | Preset đồ họa                          | OPEN       | Đề xuất Eco, Balanced, High                         |
| D48 | Thiết bị mục tiêu tối thiểu            | OPEN       | Chưa chọn cấu hình tham chiếu                       |
| D49 | Engine và Rendering API                | DEFERRED   | Chỉ chọn trong Technical Discovery                  |
| D50 | Giới hạn map, asset, NPC hiển thị      | OPEN       | Cần profile bằng cảnh thử                           |
| D51 | Phong cách nhạc                        | OPEN       | Đề xuất piano, acoustic, Nature Only                |
| D52 | Đồng bộ ngày đêm theo giờ thực         | DEFERRED   | Đề xuất sau MVP                                     |
| D53 | Thời tiết thuần thị giác trong Ambient | OPEN       | Đề xuất tách khỏi lợi ích mô phỏng                  |
| D54 | Scenic Tour tự động                    | OPEN       | Chưa ưu tiên cho Vertical Slice                     |
| D55 | Tín hiệu cá voi trong Ambient          | OPEN       | Liên quan D27; chỉ dấu nhẹ, không ép camera         |
| D56 | UI Scaling                             | OPEN       | Đề xuất hỗ trợ desktop và các độ phân giải phổ biến |
| D57 | Coastal Color Palette                  | OPEN       | Đã có bảng màu concept, chưa phê duyệt              |
| D58 | Camera theo NPC hoặc thuyền            | OPEN       | Đề xuất tùy chọn, không mặc định                    |

## 4.5. Kết luận từ Decision Register

Có ba nhóm khác nhau, không nên xử lý chung:

**Nhóm đã chốt:** Định hình tầm nhìn và các lựa chọn sản phẩm lớn. Không cần hỏi lại trừ khi phát hiện mâu thuẫn thực sự.

**Nhóm cần chốt trước GDD:** Làm thay đổi luật chơi, vòng đời dữ liệu hoặc phạm vi triển khai, ví dụ D03, D05, D12, D20, D30, D35 và D44.

**Nhóm có thể quyết định khi thử nghiệm:** Thông số cân bằng, màu sắc cụ thể, tỷ lệ asset, preset hiệu năng hoặc Animation Timing. Những điểm này cần prototype hơn là tranh luận lý thuyết.

Không nhất thiết phải chốt cả 58 mục trước GDD. Nhưng mọi mục còn mở phải có trạng thái, người chịu trách nhiệm quyết định và thời điểm giải quyết rõ ràng.

---

# 5. Cross-System Consistency Review

Đây là phần kiểm tra mâu thuẫn xuyên hệ thống, bao gồm cả những vấn đề đã từng được nhắc đến nhưng chưa giải quyết triệt để.

| ID   | Mâu thuẫn                                                            | Hệ thống liên quan                    | Chính sách đề xuất                                                  |
| ---- | -------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| CR01 | Xây không tốn tiền khiến spam công trình để mở khóa                  | Construction, Population, Progression | Đánh giá cư dân thực, điều kiện hoạt động và chất lượng quy hoạch   |
| CR02 | Nhà thiếu đường nhưng vẫn được đặt                                   | Building, Connectivity, Simulation    | Tách khả năng đặt và khả năng hoạt động                             |
| CR03 | Xóa nhà làm số cư dân vượt sức chứa                                  | Population, Relocation                | Phân biệt cư dân có nhà và cư dân chờ tái định cư                   |
| CR04 | NPC đặc biệt mất nhà nhưng vẫn có lịch đi về nhà cũ                  | NPC, Relocation, Navigation           | Chuyển trạng thái lịch sinh hoạt, giữ danh tính và ký ức            |
| CR05 | Scenic Pause giữ cảnh nhưng thời gian vẫn chạy                       | Time, Ambient, NPC                    | Đề xuất đóng băng Simulation Clock, chỉ tiếp tục hiệu ứng trang trí |
| CR06 | Offline Growth làm hết thời gian tái định cư khi người chơi vắng mặt | Time, Relocation                      | Cần chính sách riêng, không tự áp dụng đồng hồ thực                 |
| CR07 | Người chơi gọi mưa liên tục để tăng cây                              | Weather, Landscape, Progression       | Lợi ích tính theo điều kiện duy trì, không theo số lần nhấn         |
| CR08 | AI ghi nhớ sự kiện không xảy ra hoặc NPC không biết                  | Event, Memory, AI                     | Ký ức cần nguồn và phạm vi nhận biết                                |
| CR09 | Xóa/di chuyển quán làm ký ức vị trí cũ bị hiểu là hiện tại           | Building, Memory                      | Phân biệt sự kiện lịch sử và World State hiện hành                  |
| CR10 | Camera nhìn xa làm giảm NPC render và vô tình giảm dân số            | Render, Population                    | Tách dân số logic và NPC hiển thị                                   |
| CR11 | Đường bị phá nhưng xe vẫn dùng tuyến cũ                              | Road, Navigation, Traffic             | Cập nhật tuyến và giải quyết phương tiện đang di chuyển             |
| CR12 | Mở Region mới làm thay đổi hoặc ghi đè khu cũ                        | World, Construction, Save             | Mở rộng chỉ bổ sung vùng hợp lệ, không ghi đè trạng thái cũ         |
| CR13 | Địa hình grid vuông nhưng bờ biển cần tự nhiên                       | Terrain, Grid, Art                    | Tách grid logic khỏi hình học bờ biển                               |
| CR14 | Địa hình được san rồi xóa nhà gây đường treo                         | Terrain, Building, Road               | Không tự hoàn nguyên nền khi xóa nhà                                |
| CR15 | Whale Event xảy ra ngoài camera nhưng game ghi “người chơi đã thấy”  | Ambient, Events, Achievement          | Phân biệt xảy ra và được quan sát                                   |
| CR16 | Cloud AI phản hồi dựa trên World State cũ                            | AI, World, Dialogue                   | Gắn context với thời điểm và kiểm tra dữ kiện nhạy thời gian        |
| CR17 | FPS thấp khiến lịch NPC và cây phát triển chậm                       | Render, Simulation, Time              | Simulation Clock độc lập FPS                                        |
| CR18 | Tab nền phục hồi và phát lại hàng loạt sự kiện                       | Time, Events, Save                    | Có chính sách catch-up, định danh sự kiện và giới hạn xử lý         |
| CR19 | AI hội thoại truy cập sai bản lưu                                    | Save, AI, Memory                      | Giới hạn dữ liệu theo City/Save Identity                            |
| CR20 | Đô thị hóa làm mất bản sắc làng chài                                 | Progression, Construction, Art        | Cho phép giữ công trình lịch sử và phát triển các Region khác nhau  |

## 5.1. Ba mâu thuẫn cần xử lý trước tiên

### CR06 — Offline Growth và tái định cư

Đây là rủi ro thiết kế đáng chú ý nhất.

Giả sử người chơi phá một ngôi nhà có bốn cư dân, rồi đóng game trong ba ngày thực.

Nếu thời gian chờ tái định cư tự chạy theo toàn bộ thời gian thực, người chơi có thể trở lại và phát hiện cư dân đã rời thành phố dù không có cơ hội xây nhà thay thế.

Điều này không phù hợp với trải nghiệm chill.

**Đề xuất:** Trong giai đoạn đầu, các hậu quả bất lợi cần người chơi can thiệp, đặc biệt là cư dân rời đi vì thiếu nhà, không nên tự phát sinh trong thời gian offline. Tiến trình offline tích cực có thể được cho phép có giới hạn nếu sau này được duyệt.

Đây là một đề xuất cần quyết định chính thức.

### CR05 — Scenic Pause và tính nhất quán

Scenic Pause không nên là việc dừng đồng hồ nhưng vẫn để mọi NPC hoàn thành lịch trình.

**Đề xuất:** Đồng hồ, tăng trưởng, hoạt động có thay đổi trạng thái và sự kiện mới dừng. Chỉ các hiệu ứng không làm thay đổi World State tiếp tục vận hành.

Nếu người chơi muốn ngắm một buổi hoàng hôn kéo dài, họ vẫn có sóng, gió, ánh đèn và âm nhạc, nhưng thành phố không trải qua thêm những ngày mô phỏng.

### CR08 — AI Memory và World Truth

Hệ thống AI không thể chỉ dựa vào prompt để bảo đảm mọi nội dung đều đúng.

**Đề xuất:** Sự kiện gameplay do Local Simulation xác nhận, Memory lưu dữ kiện cùng nguồn, Cloud AI chỉ đọc phần được cấp phép. Những nội dung kể chuyện có sự kiện cụ thể cần được kiểm chứng trước khi công bố thành thông tin chính thức.

---

# 6. Dependency Map — Bản đồ phụ thuộc hệ thống

## 6.1. Phụ thuộc gameplay

```text
World Map
  ├── Region & Unlock Boundaries
  ├── Terrain & Elevation
  └── Global Grid
        ├── Building Placement
        │     ├── Housing Capacity
        │     │     └── Population & Relocation
        │     ├── Amenities
        │     └── Landscape Effects
        │
        └── Road Construction
              ├── Road Connectivity
              ├── Pedestrian Navigation
              └── Vehicle Traffic

Population + Amenities + Landscape + Connectivity
              │
              ▼
       City Simulation
         ├── Population Growth
         ├── Tourism Activity
         └── City Progression
                 │
                 ▼
        Achievement & Region Unlock
```

**Hệ quả:** Không nên làm hệ thống mở khóa Region hoàn chỉnh trước khi xác định được điều gì làm dân cư phát triển hợp lệ.

Tương tự, việc tạo nhiều loại xe 3D trước khi có Road Connectivity sẽ khiến công sức animation có nguy cơ phải làm lại.

## 6.2. Phụ thuộc Time, Living World và AI

```text
Simulation Clock
  ├── Day / Night Cycle
  ├── Weather Simulation
  ├── NPC Schedule
  ├── Marine Schedule
  ├── Population Growth
  └── Ambient Event Scheduling
            │
            ▼
       World State
            │
            ▼
      Canonical Event Log
            │
        ┌───┴─────────┐
        ▼             ▼
  Progression      Memory System
                      │
                      ▼
             Narrative Context
                      │
                      ▼
                 Cloud AI
                      │
                      ▼
            Validated Narrative
                      │
                 Dialogue /
                 City Journal
```

Cloud AI nằm sau các hệ thống mô phỏng và ký ức. Điều này bảo vệ yêu cầu Hybrid AI đã chốt.

## 6.3. Phụ thuộc trình bày

```text
Art Direction ──> Asset Standards ──> Rendering

Camera Design ─────────────────────> Rendering / UX
World State ───────────────────────> Rendering / Audio
Weather State ─────────────────────> VFX / Audio
Ambient Time Policy ───────────────> Camera / Lighting
Performance Budget ────────────────> Asset / VFX Limits
```

**Hệ quả:** Nên kiểm chứng camera và tỷ lệ asset sớm bằng một cảnh nhỏ. Không nên sản xuất hàng chục nhà, xe và thuyền trước khi biết chúng sẽ được nhìn thấy ở khoảng cách nào.

## 6.4. Critical Dependencies

| Hệ thống muốn hoàn thiện | Phụ thuộc phải có trước                             |
| ------------------------ | --------------------------------------------------- |
| Building Placement       | Grid, Terrain, Region Boundaries                    |
| Road Connectivity        | Grid, Road Placement, Elevation Rules               |
| Population Growth        | Housing, Connectivity, Simulation Clock             |
| Tourism                  | Amenities, Landscape, Accessibility, Time           |
| Named NPC Routine        | Population Identity, Navigation, Time               |
| Relocation               | Housing Capacity, NPC Identity, Save State          |
| Whale Event              | Marine Space, Time, Event Scheduling                |
| City Journal             | Canonical Events, Memory, Narrative Rules           |
| Ambient Living           | World Simulation, Time, Render, Audio               |
| Scenic Pause             | Time Policy, Render/Simulation Separation           |
| Offline Growth           | Persistence, Time Policy, Simulation Reconciliation |
| Cloud AI Dialogue        | NPC Profile, Memory, Context Selection, API Safety  |

---

# 7. Phân tách Vertical Slice, MVP và Post-MVP

Ba khái niệm này không được dùng thay thế cho nhau.

**Vertical Slice:** Kiểm chứng rằng những cơ chế cốt lõi có thể kết hợp thành một trải nghiệm thực tế.

**MVP:** Một phiên bản nhỏ, độc lập, có thể phát hành thử cho người chơi bên ngoài và đủ hấp dẫn để chơi lại.

**Post-MVP:** Những tính năng mở rộng chiều sâu, nội dung và quy mô sau khi MVP đã được kiểm chứng.

## 7.1. Scope Matrix

| Feature           | Vertical Slice                       | MVP                                                | Post-MVP                                |
| ----------------- | ------------------------------------ | -------------------------------------------------- | --------------------------------------- |
| Map               | Một phần Làng Chài + khu mở rộng thử | Làng Chài hoàn chỉnh + một vùng mở rộng có ý nghĩa | Toàn bộ Region thiết kế sẵn             |
| Terrain           | Đất, cát, biển, đồi thoải            | Hoàn thiện địa hình các khu MVP                    | Địa hình và cảnh quan đa dạng hơn       |
| Grid Construction | Đặt, xoay, di chuyển, xóa            | UX hoàn chỉnh, công trình phong phú                | Công cụ quy hoạch hàng loạt             |
| Terrain Editing   | San nền cục bộ                       | San nền và trang trí phù hợp                       | Công cụ nâng cao trong giới hạn         |
| Road              | Đường dân sinh và đi bộ              | Kết nối, giao thông cơ bản                         | Nhiều loại đường, giao thông phong phú  |
| Buildings         | Khoảng 5–8 loại thử nghiệm           | Khoảng 12–20 loại có biến thể                      | Thư viện công trình lớn                 |
| Population        | Sức chứa, dân số thực                | Tăng trưởng và tái định cư mềm                     | Mô phỏng cộng đồng sâu hơn              |
| NPC Background    | Một số NPC sinh hoạt                 | Mật độ theo khu và giờ                             | Đa dạng hoạt động                       |
| Named NPC         | 1 nhân vật kiểm chứng                | 2–3 nhân vật có câu chuyện                         | Thêm nhân vật và quan hệ                |
| Weather           | Nắng, mây, mưa nhẹ                   | Hoàn thiện chuyển tiếp và tác động                 | Gió, sương mù sâu hơn, biến thể khí hậu |
| Time              | Một chu kỳ đầy đủ                    | Living/Slow/Scenic Pause                           | Tùy chỉnh thời gian sâu hơn             |
| Vehicles          | Xe máy trên tuyến đơn giản           | Xe máy, xe đạp, ô tô nhỏ ở mức phù hợp             | Giao thông phong phú                    |
| Fishing Boats     | 1–2 tàu thử nghiệm                   | Lịch tàu và cảng có sự sống                        | Nhiều loại tàu, hoạt động cảng          |
| Lighthouse        | Hiệu ứng đèn nếu có cảnh phù hợp     | Landmark đặc trưng hoặc cảnh riêng được hoàn thiện | Tương tác và sự kiện mới                |
| Whale             | Một chuỗi sự kiện kiểm chứng         | Một Rare Ambient Event                             | Nhiều sinh vật và sự kiện               |
| AI Dialogue       | Một NPC, bối cảnh giới hạn           | Hybrid Dialogue cho NPC đặc biệt                   | Hội thoại và quan hệ sâu hơn            |
| Memory            | Event → Memory → Dialogue            | Ký ức qua nhiều phiên chơi                         | Hệ thống ký ức nâng cao                 |
| Journal           | Một trang tạo từ event               | Nhật ký thành phố có fallback                      | Nhiều phong cách kể chuyện              |
| Audio             | Sóng, mưa, một bản nhạc              | Music + Nature + Weather + City                    | Nhiều preset và nội dung âm thanh       |
| Camera            | Pan, zoom, rotate, reset             | Focus, Ambient Static                              | Scenic Tour, camera nâng cao            |
| Graphics          | Một cảnh Cozy Stylized 3D            | Art style nhất quán, preset cơ bản                 | Nhiều hiệu ứng và asset cao cấp         |
| Save              | Lưu và tải cảnh thử                  | Autosave, khôi phục, dữ liệu bền vững              | Cloud sync, nhiều thiết bị              |
| Offline           | Mô phỏng không phụ thuộc Cloud AI    | Fallback AI; chính sách chơi offline cần chốt      | Đồng bộ và offline sâu hơn              |
| Performance       | Benchmark cảnh thử                   | Đáp ứng thiết bị mục tiêu đã duyệt                 | Tối ưu cho bản đồ lớn                   |

**Lưu ý:** Các số lượng 5–8, 12–20, 1–3 là giả định lập phạm vi, chưa được xác nhận.

## 7.2. Vertical Slice — Trải nghiệm cần chứng minh

Mình đề xuất một kịch bản thử hoàn chỉnh:

Người chơi bắt đầu tại một làng chài ven biển. Họ đặt thêm nhà, kéo đường nối khu dân cư, trồng cây và xây một quán nước. Dân cư bắt đầu chuyển đến, xe máy đi lại và khách ghé quán. Thành phố trải qua một chu kỳ ngày đêm, có một cơn mưa nhẹ, tàu đánh cá ra vào cảng.

Người chơi sau đó chuyển sang Ambient Mode, ngắm cảnh, nghe nhạc và trò chuyện với một NPC đặc biệt. Khi quay lại, NPC có thể nhắc đến một thay đổi thật trong thành phố.

Cuối cùng, người chơi lưu game, mở lại và thấy mọi trạng thái liên quan được bảo toàn.

Nếu chuỗi này chưa thú vị, việc bổ sung 50 công trình hoặc 20 NPC sẽ chưa giải quyết được vấn đề cốt lõi.

### Definition of Done cho Vertical Slice — Đề xuất

- Có thể xây dựng và điều chỉnh công trình mà không gây sai trạng thái grid.
- Mạng đường tác động thực sự tới công trình.
- Dân cư có thể phát triển theo thời gian.
- Một chu kỳ ngày đêm và thời tiết hoạt động nhất quán.
- Có ít nhất một hoạt động giao thông và hàng hải có thể quan sát.
- Ambient có đủ ba chế độ thời gian ở mức kiểm chứng.
- Một NPC có thể nhớ một sự kiện thực sự từ phiên trước.
- Cloud AI bị ngắt không làm dừng game.
- Có thể lưu và tải lại không lỗi.
- Có một cảnh đủ đẹp để quan sát liên tục mà không cần xây thêm.

## 7.3. MVP — Trải nghiệm phải hoàn chỉnh đến đâu?

MVP không cần nhiều Region nhưng cần một vòng chơi có ý nghĩa.

Mình đề xuất người chơi mới có thể:

1. Hiểu cách xây dựng trong vài phút đầu.
2. Tạo một khu phố có đường và cư dân.
3. Thấy công trình ảnh hưởng đến hoạt động và cảnh quan.
4. Đạt ít nhất một mốc tiến trình và mở một vùng mới.
5. Thưởng thức thành phố trong Ambient.
6. Trò chuyện với NPC có ký ức.
7. Quay lại phiên sau và thấy thành phố, nhật ký, tiến trình được giữ nguyên.

Điểm đặc biệt là MVP phải thỏa mãn cả **Building Experience** và **Ambient Experience**. Một bản game chỉ đẹp khi xem nhưng xây dựng không thú vị chưa đạt mục tiêu; ngược lại, xây dựng có logic nhưng Ambient nhàm chán cũng chưa đạt.

## 7.4. Những tính năng nên tránh đưa vào MVP

- Multiplayer.
- Kinh tế tiền tệ phức tạp.
- Hệ thống sản xuất, xuất nhập khẩu hoặc tài chính.
- Tắc đường chuyên sâu và giao thông nhiều tầng.
- Sinh bản đồ vô hạn.
- San núi, lấn biển và điêu khắc địa hình tự do.
- Mỗi NPC là một Agent chủ động gọi AI liên tục.
- NPC tự xây hoặc phá công trình không cần người chơi.
- Voice chat và lồng tiếng AI thời gian thực.
- Hình nền desktop tích hợp hệ điều hành.
- Nhiều mùa, năm hoặc lịch lễ hội phức tạp.
- Mô phỏng thiên tai gây thiệt hại nặng.
- Cloud sync/multi-device nếu chưa chứng minh được giá trị cần thiết.

Đây là **đề xuất loại khỏi MVP**, không có nghĩa các ý tưởng đó bị cấm vĩnh viễn.

---

# 8. Acceptance Framework

Mình đề xuất đánh giá Little Coast trên năm chiều: correctness, usability, atmosphere, performance và narrative consistency.

## 8.1. Gameplay Correctness

| ID    | Scenario                           | Acceptance                                  |
| ----- | ---------------------------------- | ------------------------------------------- |
| GP-01 | Đặt công trình lên grid hợp lệ     | Xây thành công và lưu footprint chính xác   |
| GP-02 | Đặt công trình trên ô không hợp lệ | Không thay đổi World State                  |
| GP-03 | Xây nhà thiếu đường                | Nhà vẫn tồn tại nhưng hoạt động bị giới hạn |
| GP-04 | Kết nối đường sau khi xây          | Công trình cập nhật điều kiện hoạt động     |
| GP-05 | Dân cư chuyển đến                  | Không vượt sức chứa hợp lệ                  |
| GP-06 | Xóa nhà có cư dân                  | Kích hoạt tái định cư mềm                   |
| GP-07 | Di chuyển NPC đặc biệt             | Không làm mất hoặc nhân đôi danh tính/ký ức |
| GP-08 | Mở Region                          | Không làm thay đổi trái phép khu vực cũ     |
| GP-09 | Giảm dân số sau khi mở khóa        | Không tự khóa lại nội dung đã nhận          |
| GP-10 | Gọi mưa liên tục                   | Không tạo tăng trưởng cây vô hạn            |

## 8.2. Time & Living World

| ID    | Scenario                                | Acceptance                                               |
| ----- | --------------------------------------- | -------------------------------------------------------- |
| LW-01 | Chạy đủ một ngày game                   | Hoàn thành chu kỳ ánh sáng và lịch hoạt động             |
| LW-02 | Chuyển Living sang Slow                 | Các hệ thống dựa trên thời gian chậm lại nhất quán       |
| LW-03 | Chuyển sang Scenic Pause                | Không phát sinh tiến trình mô phỏng mới                  |
| LW-04 | Tiếp tục Living sau Pause               | Không cộng bù thời gian đã tạm dừng                      |
| LW-05 | Xóa đường đang có xe                    | Xe không đi xuyên ô đã mất đường                         |
| LW-06 | Thay đổi thời tiết khi tàu ở ngoài khơi | Tàu phản ứng theo chính sách đã định, không biến mất sai |
| LW-07 | Cá voi xuất hiện                        | Sự kiện hợp lệ, animation đúng và không tạo trùng        |
| LW-08 | Camera rời khỏi NPC rồi trở lại         | Trạng thái NPC vẫn nhất quán                             |

LW-04 là tiêu chí **đề xuất theo định nghĩa Scenic Pause**, cần được xác nhận khi hoàn thiện chính sách thời gian.

## 8.3. AI & Narrative Consistency

| ID    | Scenario                          | Acceptance                                       |
| ----- | --------------------------------- | ------------------------------------------------ |
| AI-01 | NPC nhớ sự kiện đã chứng kiến     | Hội thoại dùng ký ức chính xác                   |
| AI-02 | Sự kiện chưa xảy ra               | NPC không tự khẳng định như sự thật              |
| AI-03 | Công trình đã được di chuyển      | NPC không nhầm vị trí cũ với hiện tại            |
| AI-04 | NPC mất nhà                       | Giữ hồ sơ, lịch sử và ký ức                      |
| AI-05 | Tắt Cloud AI                      | Simulation và Local Event vẫn hoạt động          |
| AI-06 | AI trả lời chậm                   | Không làm thay đổi trạng thái gameplay           |
| AI-07 | Người chơi yêu cầu AI tăng dân số | Không thay đổi World State                       |
| AI-08 | Tạo nhật ký và tải lại            | Không viết trùng cùng sự kiện                    |
| AI-09 | Dữ liệu từ bản lưu khác           | Không truy xuất sai City/Save                    |
| AI-10 | Ambient không có tương tác        | Không phát sinh gọi LLM liên tục không kiểm soát |

## 8.4. UX & Ambient Experience

| ID    | Scenario                  | Acceptance                                   |
| ----- | ------------------------- | -------------------------------------------- |
| UX-01 | Người mới lần đầu xây nhà | Hiểu vị trí hợp lệ và cách hoàn tất thao tác |
| UX-02 | Đặt công trình bị từ chối | Biết nguyên nhân và cách khắc phục           |
| UX-03 | Camera xoay               | Không làm lệch đối tượng được chọn           |
| UX-04 | Bật Ambient               | UI xây dựng được ẩn                          |
| UX-05 | Tắt nhạc                  | Tiếng thiên nhiên vẫn có thể hoạt động       |
| UX-06 | Đổi nắng sang mưa         | Có chuyển tiếp âm thanh và hình ảnh          |
| UX-07 | Có sự kiện cá voi         | Không bị ép camera hoặc popup che cảnh       |
| UX-08 | Giảm chất lượng đồ họa    | Không thay đổi World State                   |
| UX-09 | Thoát Fullscreen          | Không mất bản lưu hoặc tiến trình            |
| UX-10 | Chế độ giảm chuyển động   | Có thể hạn chế hiệu ứng camera gây khó chịu  |

## 8.5. Performance & Reliability

Các mục tiêu bên dưới là **ngưỡng đánh giá sơ bộ**, chưa phải SLA được phê duyệt.

| Hạng mục         | Định hướng                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| FPS              | Hướng đến 60 FPS trên cấu hình tham chiếu đủ mạnh                      |
| Low Quality      | Có cấu hình hướng đến 30 FPS ổn định trên thiết bị tối thiểu được chọn |
| Input            | Không có độ trễ thao tác xây dựng gây khó chịu                         |
| Time             | FPS không ảnh hưởng tốc độ mô phỏng                                    |
| Memory           | Không tích lũy bộ nhớ vô hạn khi mở lâu                                |
| Save             | Khôi phục trạng thái nhất quán                                         |
| AI Outage        | Không làm hỏng phiên chơi                                              |
| Browser Resume   | Không nhân đôi sự kiện hoặc đối tượng                                  |
| Region Expansion | Không gây đứng hình dài hoặc sai trạng thái                            |
| Render Context   | Có chiến lược phục hồi hoặc báo lỗi an toàn                            |

**Các phép đo cần thu thập khi thử nghiệm:** FPS và frame-time distribution, CPU usage, GPU time khi hỗ trợ đo, JS heap, graphics memory ở mức quan sát được, thời gian cập nhật mô phỏng, thời gian xử lý thay đổi mạng đường, kích thước bản lưu, thời gian lưu/tải, request count và chi phí AI.

---

# 9. Product Experience Validation

Automated tests không chứng minh được một game thực sự chill hoặc thú vị.

Vì vậy, ngoài Correctness Tests, mình đề xuất một chương trình Playtest riêng.

## 9.1. Three Experience Tests

### Test A — Beautiful to Watch

Người chơi bật Ambient, không thực hiện xây dựng và quan sát thành phố.

Câu hỏi đánh giá:

- Thành phố có đủ chuyển động và âm thanh tự nhiên không?
- Có những khoảnh khắc đáng nhìn mà không cần popup nhắc không?
- Ánh sáng và thời tiết có tạo được cảm xúc khác nhau không?
- Âm nhạc có gây lặp hoặc khó chịu khi nghe lâu không?
- Có muốn tiếp tục để game trên màn hình không?

### Test B — Meaningful to Build

Người chơi xây một khu dân cư nhỏ và kết nối đường.

Câu hỏi đánh giá:

- Có hiểu lý do nên xây đường không?
- Có thấy sự khác nhau giữa nhà kết nối và nhà chưa kết nối không?
- Có nhận ra người dân, xe cộ và hoạt động thay đổi không?
- Có cảm thấy tự do quy hoạch dù không dùng tiền không?
- Có bị buộc làm quá nhiều thao tác kỹ thuật không?

### Test C — Memorable to Return

Người chơi quay lại sau nhiều phiên chơi và trò chuyện với NPC.

Câu hỏi đánh giá:

- Có nhận ra khu phố mình từng xây không?
- NPC có ký ức đúng với những lần tương tác trước không?
- Nhật ký có phản ánh thành phố thật, không phải đoạn văn ngẫu nhiên không?
- Có điều gì khiến người chơi muốn tiếp tục chăm sóc thành phố không?

## 9.2. Chỉ số nghiên cứu người chơi — Đề xuất

| Metric                    | Ý nghĩa                                                |
| ------------------------- | ------------------------------------------------------ |
| First Build Completion    | Người chơi có xây được công trình đầu tiên không       |
| First Meaningful Reaction | Mất bao lâu để thấy thành phố phản ứng                 |
| Ambient Dwell Time        | Thời gian người chơi chủ động duy trì chế độ ngắm cảnh |
| Return Intent             | Ý định quay lại phiên khác                             |
| NPC Memory Recognition    | Người chơi có nhận thấy NPC nhớ đúng sự kiện không     |
| Player Confusion Points   | Những thao tác khó hiểu                                |
| Visual Comfort            | Cảm giác dễ chịu khi nhìn thời gian dài                |
| Audio Comfort             | Mức độ hài lòng khi nghe trong lúc làm việc            |

Chưa cần gắn target retention hay doanh thu ở giai đoạn này. Trước hết cần kiểm chứng rằng người chơi cảm thấy sản phẩm có giá trị.

---

# 10. Risk Register — Rủi ro ưu tiên

| ID      | Rủi ro                                              | Mức        | Cách giảm thiểu                                                        |
| ------- | --------------------------------------------------- | ---------- | ---------------------------------------------------------------------- |
| RISK-01 | Phạm vi mô phỏng quá lớn so với nguồn lực indie     | Cao        | Vertical Slice tập trung, cắt tính năng không đóng góp Core Experience |
| RISK-02 | Asset đẹp riêng lẻ nhưng thiếu thống nhất           | Cao        | Art Bible, chuẩn tỷ lệ và review                                       |
| RISK-03 | Đường, nhà và địa hình chỉnh sửa gây lỗi dây chuyền | Cao        | Invariants, atomic changes, test tình huống biên                       |
| RISK-04 | NPC AI tạo thông tin không đúng                     | Cao        | Event grounding và validation                                          |
| RISK-05 | AI API tốn kém khi mở rộng người chơi               | Cao        | On-demand, giới hạn ngân sách, template fallback                       |
| RISK-06 | Browser chạy lâu quá nóng hoặc tốn GPU              | Cao        | Quality presets, frame cap, profile phiên dài                          |
| RISK-07 | Ambient Mode trở nên nhàm chán                      | Cao        | World Moments, soundscape, playtest ngắm cảnh                          |
| RISK-08 | Không có tiền khiến tiến trình thiếu mục tiêu       | Cao        | Unlock từ sự thay đổi có ý nghĩa và thành tựu có chất lượng            |
| RISK-09 | Offline Growth gây tổn thất ngoài ý muốn            | Cao        | Chốt thời gian và hậu quả offline trước triển khai                     |
| RISK-10 | Camera khó dùng với grid có độ cao                  | Cao        | Prototype chọn ô, occlusion và terrain                                 |
| RISK-11 | Nhật ký AI lặp hoặc vô nghĩa                        | Trung bình | Event selection, relevance và quality review                           |
| RISK-12 | Đô thị hóa làm mất cảm giác làng chài Việt Nam      | Trung bình | Region art rules, bảo tồn công trình cũ                                |

---

# 11. Decisions Required Before GDD Candidate

Không cần giải quyết toàn bộ Decision Register ngay. Mình đề xuất ưu tiên một nhóm **P0 — GDD Blockers**.

| Thứ tự | Decision    | Vấn đề cần chốt                                                                                    |
| ------ | ----------- | -------------------------------------------------------------------------------------------------- |
| P0-01  | D20 + D03   | Chính sách thời gian khi chuyển tab hoặc đóng game; hậu quả offline đối với cư dân chờ tái định cư |
| P0-02  | D05         | Điều kiện tối thiểu để nhà, dân cư, dịch vụ và cảnh quan phát triển                                |
| P0-03  | D12         | Di chuyển nhà có cư dân, danh tính công trình và xử lý NPC                                         |
| P0-04  | D09 + D14   | Quy tắc san nền tự động/thủ công và hoàn nguyên nền                                                |
| P0-05  | D18 + D19   | Tốc độ chuẩn, hệ số Slow, ngữ nghĩa chính xác của Scenic Pause                                     |
| P0-06  | D30 + D35   | Hình thức hội thoại NPC và thời điểm tạo nhật ký                                                   |
| P0-07  | D36 + D42   | Quyền tự chủ của AI với sự kiện gameplay                                                           |
| P0-08  | D44 + D45   | Camera projection và giới hạn điều khiển cần thử nghiệm                                            |
| P0-09  | D16 + D48   | Tỷ lệ Grid, kích thước thế giới và thiết bị mục tiêu                                               |
| P0-10  | MVP Content | Nội dung tối thiểu cần thiết để có phiên chơi hấp dẫn                                              |

Một số quyết định P0 có thể cần **prototype để trả lời**, không thể chốt hoàn toàn bằng mô tả. Điều này không đồng nghĩa phải triển khai toàn bộ game trước GDD.

---

# 12. Proposed Product Gates

## Gate 1 — Product Consistency

Điều kiện hoàn thành:

- Tất cả quyết định lớn có trạng thái rõ ràng.
- Các P0 Blocker được duyệt hoặc có giả định thử nghiệm được ghi nhận.
- Không tồn tại mâu thuẫn logic chưa có phương án xử lý.
- Scope của Vertical Slice và MVP được phê duyệt.
- GDD Candidate có đủ cơ sở để mô tả gameplay.

## Gate 2 — Technical Feasibility

Được thực hiện sau khi kết thúc Discovery và phê duyệt kế hoạch thử nghiệm.

Mục tiêu kiểm chứng:

- Một cảnh 3D Cozy Stylized hoạt động tốt trên web.
- Grid và camera tương tác ổn định.
- Địa hình nhẹ, đường và Building Placement hoạt động.
- Simulation Clock độc lập FPS.
- NPC và phương tiện có hành vi cơ bản.
- Ambient ngày đêm, âm thanh và thời tiết có hiệu quả.
- Memory/AI theo nhu cầu có thể tích hợp mà không ảnh hưởng gameplay.

## Gate 3 — Vertical Slice Acceptance

Một khu làng chài nhỏ phải tạo được toàn bộ vòng lặp: xây dựng → kết nối → phát triển → quan sát → ghi nhớ → lưu và trở lại.

## Gate 4 — MVP Readiness

- Nội dung đủ để chơi và khám phá.
- UX dễ hiểu.
- Mô phỏng ổn định.
- AI có fallback.
- Không có lỗi lưu trạng thái nghiêm trọng.
- Hiệu năng phù hợp thiết bị mục tiêu.
- Có phản hồi playtest chứng minh giá trị của ba trụ cột sản phẩm.

---

# 13. Recommendation Summary

## Những gì nên giữ nguyên

**Không có tiền** là một lựa chọn mang tính bản sắc. Thay vì quản lý tài chính, người chơi được khuyến khích xây dựng không gian đáng sống.

**Region được thiết kế sẵn** giúp bảo đảm cảnh quan đẹp, có mũi hải đăng, làng chài và bãi biển đặc trưng. Người chơi vẫn tự quyết định cách bố trí trong vùng cho phép.

**Soft Relocation** cho phép chỉnh sửa thành phố mà không mất NPC đột ngột, đồng thời giữ cho mô phỏng có những phản ứng hợp lý.

**Living / Slow / Scenic Pause** giúp cùng một thành phố hỗ trợ cả gameplay chủ động và trải nghiệm thư giãn.

**Hybrid AI** bảo vệ khả năng vận hành cục bộ, chi phí và tính nhất quán của thế giới.

**Cozy Stylized 3D** đặt nền tảng nghệ thuật cho một thành phố Việt Nam có màu sắc và hình khối rõ ràng nhưng vẫn phù hợp hiệu năng web.

## Những gì chưa nên làm

Chưa nên chọn công nghệ chỉ dựa trên sở trường Backend hoặc một framework quen thuộc.

Chưa nên triển khai nhiều NPC AI trước khi hệ thống Event và Memory được xác định.

Chưa nên tạo hàng loạt model 3D trước khi kiểm chứng camera, grid, tỷ lệ nhân vật và bộ quy tắc Art Direction.

Chưa nên tối ưu cho hàng nghìn dân cư hay bản đồ cực lớn trước khi Vertical Slice chứng minh được gameplay hấp dẫn.

Chưa nên chốt hàng trăm chỉ số cân bằng khi chưa có playtest.

---

# 14. Final Status — Product Discovery v0.10

| Hạng mục                | Đánh giá                                         |
| ----------------------- | ------------------------------------------------ |
| Game Vision             | Đã xác định                                      |
| Product Pillars         | Đã xác định                                      |
| Setting & Art Style     | Đã chốt định hướng                               |
| World Map Strategy      | Đã chốt                                          |
| Grid Construction       | Đã chốt cơ chế; còn quy tắc chi tiết             |
| Terrain Editing         | Đã chốt phạm vi; còn hành vi chi tiết            |
| Connectivity            | Đã chốt nguyên tắc hoạt động                     |
| Population & Relocation | Đã chốt hướng; còn thời lượng và xử lý biên      |
| City Progression        | Đã chốt nguồn mở khóa; còn điều kiện cân bằng    |
| Time & Ambient          | Đã chốt chế độ; còn thông số                     |
| Weather & Living World  | Đã phân tích; còn chính sách chi tiết            |
| AI NPC                  | Đã chốt Hybrid AI; còn Dialogue và Memory Policy |
| Audio & VFX             | Đã phân tích hướng nghệ thuật                    |
| Performance             | Đã có mục tiêu kiểm chứng; chưa có benchmark     |
| Vertical Slice          | Có scope đề xuất, chưa phê duyệt                 |
| MVP                     | Có scope đề xuất, chưa phê duyệt                 |
| GDD                     | Chưa chốt                                        |
| Technical Design        | Chưa bắt đầu                                     |
| Development             | Chưa bắt đầu                                     |

**Kết luận:** Little Coast đã có một bộ yêu cầu sản phẩm khá đầy đủ về chiều rộng. Điểm cần tập trung tiếp theo không phải là tiếp tục thêm chức năng mà là giảm các vùng chưa xác định, kiểm chứng những quyết định có rủi ro cao và biến các mô tả trải nghiệm thành những tiêu chí có thể quan sát hoặc kiểm thử.

**Đề xuất bước tiếp theo:** Product Discovery v0.11 — Decision Closure & Gameplay Validation. Giải quyết các P0 Blocker theo từng nhóm nhỏ, ưu tiên Time/Offline/Relocation và Construction/Population. Sau đó tổng hợp thành GDD Candidate v1.0 để bạn phê duyệt trước khi lựa chọn kiến trúc kỹ thuật.

_Little Coast — Một thành phố biển nhỏ được xây dựng bằng sự sáng tạo của người chơi, vận hành bằng những quy luật nhất quán, và trở nên đáng nhớ nhờ những khoảnh khắc đời thường._
