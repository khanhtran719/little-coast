# LITTLE COAST

## GDD Candidate v1.2 — Review Round 02

**Chủ đề:** Phiên chơi đầu và công dụng công trình.  
**Ngày:** 22/10/2026.  
**Trạng thái:** PROPOSED / REVIEW CANDIDATE — chưa phải Approved GDD.  
**Kết quả vòng này:** Một phương án khuyến nghị cụ thể để review, kèm điều kiện hoạt động, phản hồi, tình huống biên và kế hoạch đánh giá. Chưa có prototype hoặc playtest được thực hiện.

## 0. Phạm vi và cách đọc

Đây là **bản bổ sung thiết kế**, đọc cùng [GDD Candidate v1.1 — Review Round 01](./Little_Coast_GDD_Candidate_v1.1_Review_Round_01.md), không phải bản thay thế đầy đủ toàn bộ GDD. Bản v1.1 và v1.0 được giữ nguyên.

- §2–4 dưới đây cụ thể hóa phương án đề nghị thay thế v1.1 §2.5–2.7 và §10.6 khi được duyệt.
- §5 làm rõ ví dụ nhân vật trong v1.1 §7.6; §7 bổ sung kế hoạch kiểm thử ở v1.1 §16.
- Các quyết định CONFIRMED trong v1.1 vẫn giữ nguyên; những đề xuất mới ở đây chưa tự trở thành CONFIRMED.
- Yêu cầu của người dùng “tiếp tục Review Round 02” là nguồn cho **phạm vi công việc review**, không phải bằng chứng người dùng đã duyệt những lựa chọn chưa được trình bày.
- Khi nội dung hai tài liệu khác nhau, dùng v1.1 cho luật đã CONFIRMED; dùng tài liệu này để biết **phương án Round 02 đang được đề nghị**, không âm thầm thay luật.

Vòng này không chọn engine, camera projection, kích thước grid, thiết bị mục tiêu hoặc thông số tăng trưởng chính thức. Không giao việc triển khai code.

## 1. Kết luận thiết kế được khuyến nghị

**Mở đầu bằng một xóm nhỏ đang sống, cho người chơi tự thay đổi xóm ấy, và để cư dân hiện hữu sử dụng những thay đổi đó.** Cư dân mới là tiến trình dài hơn, không phải điều kiện để phiên đầu có phản hồi.

| Decision ID mới | Phương án khuyến nghị                                                                                                                                 | Căn cứ/ràng buộc                                         | Trạng thái                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------- |
| R02-FS01        | Mặc định bắt đầu với một cụm nhà có cư dân, đường và bến cá đang hoạt động; giữ khoảng đất trống để người chơi tạo phần của mình                      | HX-01/03/05; đối chiếu phương án gần trống qua TC-EXP-09 | PROPOSED                     |
| R02-FS02        | Phiên đầu có các cơ hội xây → thấy thay đổi → quan sát/trò chuyện → lưu; hướng dẫn có thể bỏ qua, không khóa người chơi vào một thứ tự                | D19, TIME-01–04, HX-03                                   | PROPOSED                     |
| R02-FS03        | Không thêm suất dân thưởng hoặc hứa cư dân đầu tiên xuất hiện trong N phút; phản hồi sớm đến từ trạng thái công trình và cư dân đã có                 | POP-01/03/04, GROW-01–03                                 | PROPOSED, giữ luật CONFIRMED |
| R02-BLD01       | Dùng sáu nhóm chức năng đại diện; nhà, đường, quán nước và góc nghỉ là trọng tâm thao tác; bến cá có sẵn; chợ cá thử sau bài cốt lõi                  | HX-02, v1.1 §10.5                                        | PROPOSED                     |
| R02-BLD02       | Quán/chợ/ghế cung cấp cơ hội sinh hoạt cho NPC hợp lệ; cây tạo cảnh quan. Phản hồi dựa trên người, tuyến và lịch thật, không sinh đám đông để làm đẹp | D36/D42, POP-02/05                                       | PROPOSED                     |
| R02-NAR01       | Một khoảnh khắc Named NPC dùng thay đổi do người chơi tạo, phản hồi theo điều đã biết và nhớ lại sau tải game; Local Template phải đủ dùng            | D30/D35/D36/D42, SAVE-05                                 | PROPOSED                     |

**Lý do chọn:** Phương án này giải quyết khoảng chờ ban đầu mà không đổi cơ chế tăng dân, cho thấy ý nghĩa của việc quy hoạch, và tạo cơ hội gắn bó với người đã sống trong làng. Rủi ro là người chơi thấy mình tiếp quản “làng của ai khác”; giảm rủi ro bằng khu đất trống dễ thấy, các thay đổi tự chọn và khả năng chỉnh sửa công trình theo luật chung.

## 2. Cảnh khởi đầu

### 2.1. Bố cục tối thiểu để thử

Không khóa hình học, hướng bản đồ hoặc số ô grid. Quan hệ không gian cần có:

1. Một đường tiếp cận từ đất liền, với Access Anchor được khai báo rõ trong fixture thử.
2. Hai nhà đã có người, cùng nối tới mạng tiếp cận hợp lệ.
3. Một bến cá có đường người đi và lối tàu hợp lệ. Bến **không mặc định** là Access Anchor.
4. Một lối đi hiện hữu từ nhà đến bến; một khoảng đất cho phép người chơi bổ sung lối ven biển hữu ích, không phải đoạn đường hỏng cố tình buộc sửa.
5. Một khoảng đất dễ xây thêm nhà, đặt quán hoặc góc nghỉ; không cần chỉnh địa hình mới chơi được bài cốt lõi.
6. Mép Xóm Biển có thể nhìn thấy nếu bố cục cho phép, nhưng không chiếm trọng tâm và không bắt mở trong phiên đầu.

Tuyến ven biển mới chỉ được chọn nếu thực sự hợp lệ và phù hợp hành trình NPC. Nếu không ngắn hơn, thoại không được nói “đi nhanh hơn”. Hình học phải được chứng minh tại MP-01/02; mô tả này chưa xác nhận một layout đã vận hành.

### 2.2. Fixture dân cư và trạng thái ban đầu

Các số sau chỉ là **CONTENT/BALANCE CANDIDATE cho bài thử**, không phải ngân sách nội dung MVP:

| Thành phần                                              | Giá trị thử                                         | Ý nghĩa                                                                        |
| ------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Nhà có sẵn                                              | 2 căn, mỗi căn 2 chỗ                                | Tổng sức chứa 4, không dùng mô hình hộ gia đình phức tạp                       |
| Cư dân có sẵn                                           | 4 người, gồm 1 Named NPC thử nghiệm và 3 cư dân nền | Named NPC nằm trong tổng 4, không cộng thêm lần nữa                            |
| City / Housed / Connected Population                    | 4 / 4 / 4                                           | Cả hai nhà hợp lệ và đã nối Anchor                                             |
| Waiting / At Risk / DepartureEligible / TemporarilyAway | 0 / 0 / 0 / 0                                       | Không tạo áp lực mất nhà ở thời điểm khởi đầu                                  |
| Quán nước / góc nghỉ do người chơi thêm                 | Chưa có                                             | Có khoảng trống để thấy nhân–quả trước và sau                                  |
| Bến cá                                                  | 1 bến, 1 tàu minh họa                               | Tàu/đạo cụ không tự cộng City Population                                       |
| Chợ cá                                                  | Không cần trong fixture cốt lõi                     | Thêm ở bài thử mở rộng MP-03 nếu đủ khả năng đánh giá                          |
| Thời gian, thời tiết                                    | Ban ngày, khô ráo, Living cho lần tạo thành phố mới | Mốc giờ chính xác còn mở; đây là đề xuất trạng thái mới, không ghi đè lúc Load |

Fixture được tạo một lần khi tạo thành phố mới và ghi là **trạng thái nền ban đầu**. Không ghi sự kiện giả rằng người chơi vừa xây hai căn nhà, vừa đón bốn người hoặc đã trò chuyện với bác Hải. Không tái tạo fixture khi tải lại save, đổi thời gian hoặc mở Journal.

Nhà, đường có sẵn tuân theo cùng luật Move/Delete/Relocation như công trình người chơi đặt. Không gắn bảo vệ vô hình để giữ màn hướng dẫn. Quy tắc cho phép Move/Rotate của bến cá vẫn thuộc BUILD-B01; bài cốt lõi không yêu cầu người chơi di chuyển bến.

### 2.3. Cảm giác sở hữu và thông tin ban đầu

Thông điệp mở đầu đề xuất: **“Một xóm nhỏ đã ở đây. Bạn muốn bờ biển này đổi khác thế nào?”** Có thể đóng ngay; không giao vai trưởng làng, cốt truyện thừa kế hay nhiệm vụ bắt buộc chưa được thiết kế.

Hiển thị nhẹ số cư dân và chỗ ở. Khi chọn nhà, giải thích rõ “2 người đang ở / 2 chỗ”, hoặc “0 người đang ở / 2 chỗ — đã có lối vào, chờ cư dân chuyển đến”. Không dùng hình người hoặc tiếng chúc mừng để khiến sức chứa trông như cư dân thật.

Palette đầu có nhà, lối đi, quán nước, cây, ghế. Đường dân sinh và công cụ chỉnh sửa vẫn truy cập được; palette chỉ sắp xếp ưu tiên, không thêm hệ thống mở khóa công cụ. Ghế và cây là hai đối tượng riêng dù cùng nhóm “góc nghỉ”.

## 3. Phiên chơi đầu — tự do trong khoảng 20–30 phút

### 3.1. Nhịp trải nghiệm đề nghị

Các mốc dưới đây là **phút thực trong phiên quan sát**, để người tổ chức đánh giá nhịp chơi; không phải deadline, đồng hồ nhiệm vụ hoặc thời gian mô phỏng. Người chơi được đổi thứ tự, làm ít hơn, hoặc chỉ ngắm cảnh.

| Khoảng quan sát | Cơ hội người chơi tự chọn                                                 | Phản hồi cần có                                                                                          | Điều bài thử tìm hiểu                                |
| --------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 0–3 phút        | Nhìn biển, chọn nhà, theo dõi một người đi ra bến                         | Nhận ra đã có người sống; hiểu nhà khác đường/bến; âm thanh và chuyển động không cần click               | Làng có sức sống và còn chỗ cho mình sáng tạo không? |
| 3–8 phút        | Thêm lối ven biển hoặc một căn nhà                                        | Preview/validation rõ; đường nối hợp lệ đổi trạng thái tiếp cận; nhà tạo sức chứa nhưng không sinh người | Người chơi hiểu một thao tác đã thay đổi gì?         |
| 8–14 phút       | Thử quán nước hoặc đặt ghế bên lối đi                                     | Có điểm sinh hoạt mới; cư dân hiện hữu có thể chọn dùng nếu đến lượt hoạt động hợp lệ                    | Có phân biệt công dụng quán, ghế và cây không?       |
| 14–20 phút      | Chỉnh vị trí công trình, theo dõi người sử dụng tuyến mới hoặc xem bến cá | Tuyến/điểm đến đổi theo trạng thái thật; thuyền có lịch riêng                                            | Quy hoạch có tác động ngoài bảng chỉ số không?       |
| 20–25 phút      | Hỏi NPC về thay đổi hoặc tiếp tục xây                                     | Thoại phù hợp hiện trạng, góc nhìn riêng; không cần Cloud AI                                             | Người chơi có quan tâm một nhân vật cụ thể không?    |
| 25–30 phút      | Chọn Ambient/Slow/Scenic Pause, xem Journal nếu có và lưu                 | Nhịp cảnh rõ, pause đúng; lưu được trạng thái thật                                                       | Có muốn ngắm tiếp hoặc quay lại làng này không?      |

Gợi ý theo ngữ cảnh chỉ xuất hiện khi liên quan, có thể bỏ qua và tắt. Ví dụ chọn nhà thiếu đường thì hiện “Cần lối đi nối tới điểm tiếp cận để đón cư dân”. Không bắt người chơi đặt nhà sai trước, không nhắc đi nhắc lại vì họ chưa làm theo.

### 3.2. Ba tầng phản hồi

| Tầng                       | Phản hồi                                                                         | Khi nào hợp lệ                                                                       |
| -------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Ngay sau thao tác hoàn tất | Footprint, trạng thái kết nối, sức chứa, điểm dừng mới hoặc lý do chưa hoạt động | Khi thao tác Place/Move/Delete đã thành công; không chờ Arrival                      |
| Theo thời gian mô phỏng    | Người đã có chọn tuyến/điểm nghỉ, hoạt động quán, tàu ra/vào                     | Có tuyến, điểm đến, người rảnh và lịch phù hợp; không chạy trong Scenic Pause/tab ẩn |
| Qua lịch sử thành phố      | NPC nhớ việc đã biết, một Journal Entry đủ ý nghĩa                               | Sự kiện thật đã xảy ra, có nguồn và thỏa chính sách ghi nhận                         |

**Mục tiêu đo thử:** trạng thái công trình phản hồi ngay khi thao tác kết thúc; với fixture đã có NPC rảnh và hành trình phù hợp, thử đạt một hành vi dễ nhận thấy trong **30–90 giây thực ở Living** sau thay đổi. Đây là ngưỡng trải nghiệm đề xuất, chưa phải cam kết mọi lần xây. Ghi thêm elapsed Simulation Time để so sánh Slow; không tăng tốc mô phỏng hoặc ép NPC dịch chuyển để đạt số đo.

Nếu chưa có ai rảnh hoặc không có tuyến phù hợp, UI nói “Có thể sử dụng — chưa có người ghé” hoặc lý do cụ thể. Không hứa mốc thời gian không tính được, không spawn người dùng giả. Nếu bài thử nhiều lần không thấy phản hồi, cần sửa fixture, hành vi hoặc chức năng; không đánh PASS chỉ vì thanh trạng thái đổi.

### 3.3. Nhịp cư dân mới

- Nhà mới hợp lệ chỉ thêm chỗ ở. New Arrival vẫn chịu Housing Eligibility, thứ tự POP-03 và City Arrival Budget.
- Đề xuất **không dùng lịch Arrival đặc biệt trong phiên đầu**. Thời điểm cư dân đầu tiên và nhịp 1–2 người/ngày vẫn là Balance Candidate của v1.1.
- Người chơi có thể hoàn thành một phiên đầu đáng giá mà không có New Arrival. Bài playtest cần thử chính nhánh này.
- Nếu quán/cảnh quan được nối vào mô hình tăng trưởng ở prototype sau, tác động phải đi qua mô hình đã được review và cùng hạn mức; không cộng người theo số lần đặt hoặc dùng quán. Hệ số cụ thể chưa được chốt trong vòng này.

### 3.4. Định nghĩa một phiên đầu thành công

Đích trải nghiệm: **“Tôi đã làm một góc làng khác đi, thấy người trong làng phản ứng, và muốn xem nó tiếp tục sống.”**

Không yêu cầu mở Region, đạt một dân số, nói đủ câu, xây đủ sáu nhóm, gặp cá voi hoặc chờ hết ngày. Save và hội thoại được giới thiệu như lựa chọn; trải nghiệm người chỉ xây hoặc chỉ Ambient vẫn được đánh giá riêng.

## 4. Công dụng công trình — hợp đồng hành vi đề nghị

Các chức năng chi tiết dưới đây là R02-BLD01/02 PROPOSED. Chỉ những ràng buộc dẫn tới quyết định CONFIRMED của v1.1 mới là luật đã chốt. Không suy ra toàn bộ danh mục này đã được đưa vào ngân sách asset MVP.

### 4.1. Nhà ngư dân — chỗ ở

- **Function:** Cung cấp Housing Capacity; gắn nơi ở cho cư dân được phân bổ hợp lệ.
- **Conditions:** Placement hợp lệ. Muốn nhận người mới/tái định cư phải còn slot sau reservation và có tuyến tới Anchor; giữ POP-03.
- **Observable Response:** Căn trống khác căn có người; bảng nhà tách chỗ ở/người đang ở/kết nối; người đã có nhà về nhà theo lịch, đèn phụ thuộc trạng thái thực.
- **Move/Delete:** Move giữ identity, cư dân và ký ức; Delete dùng Soft Relocation. Cắt đường không đẩy cư dân đang ở ra ngoài.
- **Non-effects:** Không cho cư dân ngay khi đặt, không bắt có quán/chợ/cây mới được nhận người.
- **Dependencies:** Grid/terrain validation, connectivity, resident ledger, clock, save.

### 4.2. Đường dân sinh / lối đi bộ — khả năng tiếp cận

- **Function:** Nối lối vào công trình tới mạng hợp lệ và mở lựa chọn hành trình cho người/xe đúng loại.
- **Conditions:** Có điểm nối/cao độ hợp lệ. Một đoạn đẹp nhưng cô lập vẫn không tạo Functional Accessibility.
- **Observable Response:** Trạng thái nhà đổi ngay khi kết nối thực thay đổi; NPC có mục tiêu phù hợp có thể chọn đường mới. Thử highlight tuyến khi chọn nhà, không bật overlay phủ cảnh liên tục.
- **Move/Delete:** Tính lại kết nối và tuyến; không đổi dân số chỉ vì đường bị cắt. Chi tiết xử lý NPC/xe đang trên đoạn bị xóa vẫn thuộc BUILD-B03/D15 và cần closure riêng.
- **Non-effects:** Đường không tự là Anchor; không tạo dân và không bảo đảm mọi NPC đều chọn tuyến mới.
- **Dependencies:** Road graph, quyền truy cập từng loại đường, Anchor, route selection, clock.

### 4.3. Quán nước nhỏ — điểm ghé và gặp nhau

- **Function:** Cung cấp một lựa chọn nghỉ/gặp trong lịch sinh hoạt, tạo nhịp ngồi–đứng–rời quán và âm thanh nhỏ tại chỗ.
- **Conditions:** Cửa quán có tuyến hợp lệ tới mạng Anchor; có NPC hiện hữu phù hợp lịch và vị trí còn trống. Đề xuất thử 2 chỗ, không khóa con số chính thức. Không thêm quản lý nhân công hay kho hàng.
- **Observable Response:** Đặt xong thấy điểm đến sẵn sàng; khi có người ghé mới có animation dùng quán và thoại/âm thanh tương ứng. Quán vắng vẫn được hiển thị trung thực.
- **Move/Delete:** Giữ identity khi Move nếu loại công trình được phép; hủy/đổi mục tiêu sinh hoạt về sau. Không làm người dùng quán mất nhà, không xóa ký ức đã có.
- **Non-effects:** Không thu tiền, không sinh khách du lịch, không tăng dân trực tiếp; không biến một NPC thành hai người để có cảnh nói chuyện. Khi chỉ một người ghé, dùng hành vi một người.
- **Dependencies:** Connectivity, routine/occupancy, existing residents, clock, local audio. Mái che mưa chỉ dùng khi hình ảnh và đường tiếp cận cho phép; không mặc định quán là nơi trú duy nhất.

### 4.4. Cây và ghế nghỉ — cảnh quan và chỗ dừng

- **Function:** Cây thay đổi cảnh quan địa phương; ghế cung cấp một vị trí nghỉ. Hai đối tượng có thể đặt riêng, có footprint riêng.
- **Conditions:** Cây cần đất hợp lệ, không cần nối đường để có giá trị hình ảnh. Ghế cần chỗ tiếp cận đi bộ hợp lệ và NPC đang có cơ hội nghỉ để được sử dụng.
- **Observable Response:** Cây đổi bóng/đường nét cảnh quan theo ánh sáng và chất lượng hình; ghế có người ngồi khi thực sự được dùng. Ghế không cần cạnh cây mới hoạt động.
- **Move/Delete:** Cập nhật vị trí cảnh quan/đích nghỉ; không xóa cư dân. Xóa cây không tự xóa ghế hoặc lối đi bên cạnh.
- **Non-effects:** Đặt một cây không biến ghế bất kỳ thành “có bóng mát”; không tự tạo người. Hiệu ứng cảnh quan/tăng trưởng chưa có hệ số chính thức; giữ diminishing returns, không cộng thưởng lặp do đặt/xóa.
- **Dependencies:** Terrain/footprint, pedestrian access cho ghế, routine, ánh sáng/âm thanh phù hợp. Không thêm hệ thống nhiệt độ hay sức khỏe.

### 4.5. Bến cá — nhịp sinh hoạt hướng ra biển

- **Function:** Là điểm tàu đi/về và điểm đến ven bờ, giúp thế giới có hoạt động ngoài đường phố.
- **Conditions:** Vị trí bờ biển được phép, tuyến tàu hợp lệ; phần sinh hoạt trên bờ cần pedestrian access. Không sửa bờ biển để ép đặt bến. Tàu và hoạt động trên bờ được kiểm tra điều kiện riêng.
- **Observable Response:** Tàu rời/cập theo lịch, người có tuyến ra bến; âm thanh theo hoạt động thật. Trong fixture mở đầu, chọn pha lịch có hoạt động gần để bài thử không phải đợi cả ngày; không reset lịch khi Load.
- **Move/Delete:** Hủy/đổi hoạt động tương lai; xử lý tàu đang cập và khả năng Move/Delete bến cần được chốt trước bài thử chỉnh bến, không nằm trong thao tác onboarding cốt lõi.
- **Non-effects:** Không tự đón dân, không là passenger port/Anchor, không tạo tiền/cá trong kho. Không tạo NPC thuyền viên mới nếu chưa có quy tắc danh tính/dân số.
- **Dependencies:** Shoreline validation, marine route, clock/schedule; pedestrian route cho hoạt động người trên bờ. Ở micro-prototype được mock lịch nhưng phải ghi rõ; ở MP-06 phải chạy bằng trạng thái thật.

### 4.6. Chợ cá — nhịp tụ họp gắn với bến

- **Function:** Một điểm tụ họp khác quán nước, hoạt động tập trung vào một pha lịch bến/chợ và các hành vi xem hàng, trao đổi ngắn.
- **Conditions:** Công trình có đường hợp lệ, đang trong pha hoạt động, có NPC rảnh phù hợp. Trong bài thử đại diện, cần bến cá hoạt động cùng mạng đi bộ; thiếu bến thì ghi “Chưa có hoạt động bến cá kết nối”. Đây là phụ thuộc chức năng được đề xuất, không phải luật đã CONFIRMED.
- **Observable Response:** Thời điểm có hoạt động, người dùng quầy và âm thanh khác quán; ngoài giờ vẫn là công trình tồn tại nhưng ít hoạt động. Đạo cụ hàng hóa không phải tồn kho có thể giao dịch.
- **Move/Delete:** Tính lại mạng và lịch hoạt động; không ảnh hưởng nơi ở hay dân số. Không bắt buộc giữ bến/chợ để cư dân hiện có được ở lại.
- **Non-effects:** Không quản lý sản xuất, tài nguyên hoặc giá cá; không bắt đủ người/đủ giao dịch mới mở Region. Chợ không phải điều kiện cứng cho New Arrival.
- **Dependencies:** Pedestrian connectivity, lịch bến/chợ, routine, existing residents. Bài mở rộng MP-03 trước; chỉ đưa vào onboarding mặc định nếu cho thấy khác quán/bến mà không làm nặng phiên đầu.

### 4.7. Phân biệt được trong mắt người chơi

| Nhóm      | Câu trả lời kỳ vọng bằng lời người chơi        | Dấu hiệu thiết kế chưa đạt         |
| --------- | ---------------------------------------------- | ---------------------------------- |
| Nhà       | “Thêm chỗ ở, chưa chắc có người đến ngay.”     | “Đặt nhà là thêm hai dân.”         |
| Đường     | “Nối cho nhà hoạt động và người đi được.”      | “Cứ có ô đường cạnh nhà là được.”  |
| Quán nước | “Có chỗ ghé ngồi/gặp nhau trong ngày.”         | “Nó chỉ cộng chỉ số đẹp.”          |
| Cây / ghế | “Cây làm góc này đẹp hơn; ghế cho người nghỉ.” | “Phải spam cây thì mới có dân.”    |
| Bến cá    | “Có nhịp thuyền ra vào và sinh hoạt ven biển.” | “Bến này tự mang cư dân đến.”      |
| Chợ cá    | “Tụ họp theo nhịp bến/giờ hoạt động.”          | “Giống quán nước, chỉ khác model.” |

### 4.8. Trạng thái sử dụng và sự cạnh tranh giữa hoạt động

Không dùng một nhãn “Hoạt động” để ngụ ý luôn có người. Bảng công trình nên phân biệt **thiếu điều kiện**, **sẵn sàng nhưng chưa có người dùng**, **đang có hoạt động**, và **ngoài giờ** khi loại công trình có lịch.

Một cư dân chỉ có một hoạt động chính tại một thời điểm. Quán/ghế/chợ/bến chia sẻ cùng số người hiện hữu; không cần tất cả đông cùng lúc. Lịch phải còn cơ hội đi lại/về nhà, không để quán hút toàn bộ người dân mãi mãi. Giới hạn chỗ, thời lượng ở và cách chọn hoạt động còn là Balance Candidate tại MP-03.

Tác động tiện ích tới tăng trưởng theo POP-04 là lớp riêng cần cân bằng. Prototype chức năng có thể chưa mô phỏng trọng số này nhưng phải ghi rõ phần chưa chứng minh; không dùng việc NPC ghé quán làm bằng chứng mô hình tăng trưởng đã hoàn thiện.

## 5. Khoảnh khắc đáng nhớ đầu tiên

**Nhân vật thử:** Bác Hải từ v1.1, vẫn là character candidate, không tự chốt cast MVP.

1. Bác đã là một trong bốn cư dân, có nhà và hành trình hợp lệ ra bến.
2. Người chơi có thể thêm một lối ven biển. Nếu bác thực sự dùng lối đó, mô phỏng ghi nhận việc sử dụng và nguồn thay đổi; trước thời điểm này không khẳng định bác đã trải nghiệm nó.
3. Khi người chơi hỏi, Local Template có thể đáp: **“Bác vừa đi qua lối ven biển cháu mới nối. Đứng đây nhìn thuyền về cũng thích.”** Chỉ dùng khi tuyến và góc nhìn biển thực sự hợp lệ. Nếu không, chọn câu đúng với dữ kiện ít hơn.
4. Nếu tuyến thực sự giúp đường đi ngắn hơn, có thể dùng biến thể “Ra bến đỡ phải vòng”. Không suy ra điều đó từ việc đường vừa được đặt.
5. Tải lại save: bác giữ memory; hiện tại còn đường thì nhắc như lối đang dùng, đường đã xóa thì nhắc như chuyện cũ.

**Nhánh khác:** Không xây đường thì bác vẫn có hành vi/lời thoại đời thường. Xây quán trước thì dùng phản ứng về quán nếu bác đã biết hoặc ghé; bác không mặc định biết mọi nơi. Không chat thì không bật hội thoại ép buộc. Không có Cloud AI vẫn có thể nhận ra nét ít nói, thích yên bình của bác.

**Không suy diễn tiếng ồn:** Nếu chưa có cơ chế/context xác nhận quán đang ồn, bác chỉ được nói sở thích chung “Bác thích góc yên tĩnh”, không cáo buộc quán người chơi xây đang gây ồn. Vòng này không thêm chỉ số ô nhiễm tiếng ồn hoặc hình phạt quan hệ.

**Journal Candidate:** Có thể ghi một kỷ niệm đầu tiên khi một Named NPC thực sự sử dụng lối mới do người chơi xây. Phạm vi là **một lần đầu ở cấp thành phố**, không phải mỗi ô đường hoặc mỗi lần cắt/nối. Định danh mốc và trạng thái đã ghi phải được bảo toàn qua Save/Load; entry chỉ kể sự kiện có thật, không khẳng định người chơi đã nhìn thấy. Không bật popup bắt đọc và không tự gọi Cloud AI.

Đây là đề xuất sự kiện kể chuyện R02-NAR01, chưa thêm achievement hoặc điều kiện mở Xóm Biển. Nếu người chơi không tạo tình huống này thì không có entry tương ứng; không chèn ký ức giả để hoàn thành onboarding.

## 6. Các nhánh cần giữ chơi được

| Tình huống                                     | Hành vi thiết kế cần có                                                                        | Luật / giới hạn                        |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| Xây quán ở nơi thiếu đường                     | Quán tồn tại nếu placement hợp lệ; hiện lý do chưa có tiếp cận, không có khách giả             | R02-BLD02 PROPOSED                     |
| Chỉ xây nhiều nhà                              | Có thêm capacity, giải thích chỗ trống; không vượt Arrival Budget                              | POP-01/03, GROW-01–03                  |
| Chỉ ngắm cảnh từ đầu                           | Làng ban đầu vẫn có hoạt động trong Living; không cưỡng ép xây                                 | R02-FS01/02, D19                       |
| Bật Scenic Pause ngay                          | Dừng người/tàu/lịch và phản hồi dùng công trình; cho xem/lưu/chủ động chat, giữ Weather State  | TIME-02–04                             |
| Slow hoặc tab ẩn                               | Slow kéo dài chờ theo clock; tab ẩn không tiến triển, không bù khi trở lại                     | TIME-01/02, D20                        |
| Giữ mưa thủ công                               | Có phản ứng trú/nghỉ thích hợp nếu hỗ trợ; không khóa housing/arrival hoặc toàn bộ trải nghiệm | WEATHER-01–04; hành vi cụ thể PROPOSED |
| Trời mưa làm ghế trống                         | Là hành vi hợp lý; trạng thái giải thích được. Có thể tiếp tục xây, xem nhà/bến và trò chuyện  | Không ép có người ngồi để đạt số đo    |
| Xóa hoặc Move nhà ban đầu                      | Cùng luật identity/occupancy/Soft Relocation; không chặn ngầm vì onboarding                    | D12/D14, POP/REL                       |
| Cắt đường sau khi nhà đã có người              | Giữ cư dân đang ở; Connected giảm đúng, không tính như Departure                               | POP-01/02                              |
| Người chơi làm NPC không còn tiếp cận bến/quán | Không có hành vi sử dụng giả; giải thích điều kiện thiếu, tiếp tục các tương tác còn hợp lệ    | BUILD-B03 chi tiết vẫn OPEN            |
| Cloud AI không khả dụng                        | Local Template phản hồi đúng, không chặn simulation hoặc lưu                                   | D30/D35/D42                            |
| Tải lại giữa phiên                             | Khôi phục snapshot, lịch và memory; không phát lại fixture/Arrival/mốc Journal                 | SAVE-01–05, TIME-02                    |
| Không đủ điều kiện mở Xóm Biển                 | Không coi phiên đầu thất bại; hiển thị điều kiện thật khi rule được chốt                       | UNLOCK-01–03; ngưỡng vẫn OPEN          |

Mưa kéo dài là nhánh kiểm chứng thêm, không thay fixture khô ráo mặc định. Các giá trị không hoàn thành được bài đo do thời gian pause/không đủ điều kiện phải ghi đúng nguyên nhân; không âm thầm loại khỏi báo cáo.

## 7. Kế hoạch chứng minh và tiêu chí review

### 7.1. Tách thiết kế, kiểm tra luật và playtest

- **Review tài liệu:** Kiểm tra đề xuất có đủ điều kiện/hiệu ứng/giới hạn và có mâu thuẫn CONFIRMED không. Có thể làm ngay, không chứng minh game thú vị.
- **Kiểm tra chức năng:** Dùng các TC-_ hiện hữu cộng TC-R02-_ dưới đây khi có prototype thực.
- **Playtest:** Người chơi thật quan sát công dụng, cảm giác chờ và động lực quay lại. Chưa thực hiện; không có số liệu PASS hoặc retention.

### 7.2. Bài thử nhỏ trước tích hợp

| Gate   | Nội dung Round 02 cần chứng minh                                                                    | Bằng chứng cần có                                                                         |
| ------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| MP-01  | Người chơi đặt/chỉnh nhà, đường, quán/ghế; hiểu preview và lý do chưa hoạt động                     | Ghi thao tác, chỗ nhầm, lý do người chơi nói ra; không cần đồ họa cuối                    |
| MP-02  | Fixture 4 người đúng ledger; thêm đường/nhà không sinh dân, có Arrival thật theo budget ở bài riêng | Ledger trước/sau, route hợp lệ, nhật ký test; mock UX không tính là chứng minh simulation |
| MP-03A | Nhà–đường–quán–cây/ghế phân biệt được, một số NPC thật sử dụng cơ hội mới                           | So sánh trước/sau; thời gian phản hồi; thử Move/Delete và quán chưa có khách              |
| MP-03B | Chợ khác quán và bến nhờ nhịp hoạt động; không cần nhiều hệ thống kinh tế                           | Bài chợ ngắn tách khỏi onboarding cốt lõi; nếu thất bại sửa/giảm scope                    |
| MP-04  | Phiên chỉ Ambient, Slow/Pause, mưa kéo dài vẫn hợp logic và dễ chịu                                 | Quan sát clock, hành vi, audio; ghi tác động mưa lên các điểm nghỉ                        |
| MP-05  | Một NPC thật dùng thay đổi, có phản ứng đúng và nhớ sau reload; không cloud vẫn có nét riêng        | Nguồn event/memory, thoại trước/sau, nhánh chưa chứng kiến                                |
| MP-06  | Tích hợp cả ba trụ cột, save và Region thử theo scope v1.1                                          | Không thay sự kiện thật bằng demo scripted; Arrival/Relocation/Unlock có bài riêng đủ dài |

MP-03A/03B là hai bài con của MP-03, không thêm hai gate bắt buộc ngoài sáu micro-prototypes đã đề xuất. Phiên onboarding 30 phút không thay bài kiểm tra Relocation ba ngày, Recovery hoặc unlock tích hợp.

### 7.3. Test cases bổ sung — chưa thực hiện

| Test ID   | Tình huống                                          | Kết quả cần kiểm tra                                                                               | Traceability                     |
| --------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| TC-R02-01 | Tạo fixture mới rồi Load hai lần                    | Tổng 4 người, 2 nhà; không seed lại, không giả lịch sử người chơi                                  | R02-FS01; POP-02/05, SAVE-05     |
| TC-R02-02 | Đặt thêm nhà rồi nối đường trước một lượt Arrival   | Capacity tăng; City Population không đổi cho đến Arrival hợp lệ                                    | R02-FS03; POP-01/03, GROW-01–03  |
| TC-R02-03 | Thêm lối có ích khi có người với hành trình phù hợp | Connectivity đúng; NPC được phép chọn tuyến; không spawn người để làm phản hồi                     | R02-BLD02; D10/D11, POP-05       |
| TC-R02-04 | Đặt quán thiếu đường, sau đó nối đường              | Phân biệt thiếu điều kiện/sẵn sàng/đang có khách; khách là cư dân hiện hữu                         | R02-BLD02                        |
| TC-R02-05 | Đặt cây không ghế; đặt ghế không cây                | Cây có hiệu ứng cảnh quan, ghế có cơ hội ngồi nếu tiếp cận được; không phụ thuộc bắt buộc lẫn nhau | R02-BLD01/02                     |
| TC-R02-06 | Mở quán, bến, ghế và chợ cùng lúc                   | Một NPC không ở nhiều hoạt động; dân số không tăng do số điểm sinh hoạt                            | R02-BLD02; POP-02/05             |
| TC-R02-07 | Bến không có Anchor hành khách                      | Không tự eligible hóa nhà hoặc thêm New Arrival chỉ nhờ có bến                                     | R02-BLD01; D10/D11, POP-01       |
| TC-R02-08 | Chợ có đường nhưng thiếu bến kết nối; sau đó có bến | Lý do chờ đúng; có điều kiện lịch/people mới có hoạt động; không tạo logistics                     | R02-BLD01/02                     |
| TC-R02-09 | Đổi Scenic Pause/tab ẩn trước cơ hội dùng quán      | Không chạy timer/routine/sự kiện sử dụng trong lúc clock dừng; resume không reset lịch             | TIME-01–04, D20                  |
| TC-R02-10 | Xóa nhà có sẵn và cắt đường nhà còn lại             | Áp dụng relocation đúng; cắt đường không làm cư dân có nhà thành vô gia cư                         | D12/D14, POP-01/02, REL-02/03    |
| TC-R02-11 | NPC chưa dùng/chưa biết lối mới; sau đó dùng thật   | Không có ký ức trải nghiệm trước nguồn hợp lệ; thoại sau đó đúng dữ kiện                           | R02-NAR01; D36/D42               |
| TC-R02-12 | Ghi kỷ niệm đường đầu tiên, xóa/nối lại, reload     | Tối đa một mốc đầu tiên cấp thành phố; lịch sử giữ quá khứ và hiện tại riêng                       | R02-NAR01; D35, SAVE-05          |
| TC-R02-13 | Giữ mưa, không chat, không New Arrival trong phiên  | Có lựa chọn chơi/ngắm hợp lệ; không bắt vượt thời tiết hoặc gọi cloud để tiếp tục                  | R02-FS02/03; WEATHER-01–04       |
| TC-R02-14 | Load bản lưu ban đêm/mưa/Slow                       | Không đổi thành fixture ban ngày/khô/Living hoặc bắt đầu lại hướng dẫn đã tắt                      | R02-FS01/02; TIME-02, SAVE-01–05 |

Các expected results phụ thuộc R02-\* mới là **acceptance candidate**; bảng test không tự phê duyệt các cơ chế đó. TC-R02-10 không đòi kiểm chứng Departure đầy đủ trong phiên ngắn; dùng TC-POP/TC-LED/TC-E2E hiện hữu cho thời gian bảo vệ dài.

### 7.4. Playtest phiên đầu

Đề xuất một vòng khám phá **6 người mới, mỗi người 30 phút** trên fixture A. Mời họ xây hoặc quan sát tùy ý; không đọc kịch bản thao tác cho họ. Người điều phối ghi trợ giúp đã đưa, thời điểm pause, vấn đề kỹ thuật và việc người chơi có thấy phản hồi hay không. Không dùng nhóm này để khẳng định retention/PMF.

| Câu hỏi                           | Cách thu bằng chứng                                                                              | Ngưỡng thử để quyết định sửa, chưa được duyệt                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Có hiểu nhà không sinh dân ngay?  | Sau một lần xem/đặt nhà, hỏi họ dự đoán điều gì xảy ra tiếp                                      | Ít nhất 5/6 giải thích đúng sau khi có cơ hội thấy UI; ghi rõ ai không làm nhánh này                                              |
| Công trình có tác dụng khác nhau? | Cho xem và tự mô tả nhà/đường/quán/góc nghỉ, không cho đọc GDD                                   | Ít nhất 4/6 mô tả đúng ít nhất 3 nhóm; chợ/bến có bài riêng                                                                       |
| Phản hồi có dễ thấy?              | Với người chủ động thử thay đổi đủ điều kiện, đo từ commit đến hành vi thật và hỏi họ nhận ra gì | Ghi cả thời gian và tỷ lệ nhận thấy; mục tiêu 30–90 giây Living cần kiểm chứng, không suy ra từ event log                         |
| Có bị ép chờ?                     | Phút 10–15 hỏi mở “Lúc này bạn muốn làm gì tiếp?”; cuối phiên hỏi về đoạn chờ                    | Không có điểm mà game bắt buộc đợi dân mới mới được tiếp tục; nếu 2 người trở lên nói không còn gì làm ngoài chờ, phải review lại |
| NPC có nét riêng?                 | Với người tự tương tác hoặc xem nhân vật, hỏi họ nhớ gì về người đó                              | Thu ví dụ cụ thể về tính cách; không gán thất bại cho người chọn không chat                                                       |
| Có muốn trở lại làng?             | Hỏi điều muốn đổi/xem ở phiên sau                                                                | Thu lý do gắn với làng; không biến câu trả lời ý định thành tỷ lệ quay lại thực                                                   |

Tất cả báo cáo số lượng phải có mẫu số thực: ví dụ “3/4 người đã đặt quán thấy NPC ghé”, không đổi thành “3/6 pass” hoặc giấu hai người không thử. Nhánh bị skip, lỗi, pause hoặc thiếu điều kiện phải được báo riêng. Khi tỷ lệ tiếp xúc quá thấp, làm bài targeted tiếp theo thay vì tuyên bố gate đã đạt.

Phương án B gần trống vẫn là đối chứng mở. Nếu thử A cho thấy cảm giác sở hữu yếu, tiến hành vòng B với người mới khác, cùng thời lượng và câu hỏi; không cho cùng người chơi A rồi B và diễn giải kết quả như so sánh không có hiệu ứng học. Vòng B không phải việc đã được chạy trong review này.

**Go–Revise:** Chỉ đề nghị giữ hướng A sau khi hiểu đúng capacity/connectivity, phân biệt chức năng và không có bế tắc chờ bắt buộc. Lỗi mất/nhân đôi cư dân, memory sai hoặc pause sai phải sửa trước khi coi bản tích hợp đủ điều kiện. Nếu quán/chợ chưa tạo khác biệt, sửa công dụng hoặc giảm nội dung trước khi thêm asset.

## 8. Đối chiếu với luật đã chốt và vấn đề còn mở

| Điểm review                       | Kết luận trên tài liệu                                                     | Điều chưa được chứng minh                  |
| --------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| Không dùng tiền xây dựng          | Giữ nguyên; không thêm thu nhập/quản lý hàng hóa                           | UX thao tác thực tế                        |
| Capacity khác dân số              | Fixture có ledger rõ; phản hồi dùng cư dân cũ; không thưởng dân onboarding | MP-02 và Arrival thật                      |
| Amenities không khóa Arrival      | Không bắt quán/chợ/cây để nhận dân; tác động tăng trưởng chưa gán hệ số    | Growth balance theo POP-04                 |
| Giữ identity/relocation           | Nhà ban đầu theo cùng luật; không miễn trừ vì hướng dẫn                    | Kiểm tra Delete/Move và bảo vệ nhiều ngày  |
| Một Simulation Clock              | Không gắn deadline thật vào gameplay; routine không chạy khi pause/away    | MP-04, lifecycle browser                   |
| AI chỉ Read/Narrate               | Template có điều kiện, không bịa trải nghiệm hay người dùng công trình     | Context/witness và stale response handling |
| Journal event-driven              | Một kỷ niệm có nguồn, tùy chọn; không entry cho mỗi ô đường                | Quy tắc event candidate và save dedupe     |
| Region 02 không có phụ thuộc vòng | Không yêu cầu mở Xóm Biển trong phiên đầu; không thêm chợ/AI làm khóa mới  | Ngưỡng và achievement unlock vẫn OPEN      |
| Scope nhỏ                         | Chợ là bài mở rộng, không thêm economy/worker/relationship simulation      | Asset cost và khả năng hiện thực hóa       |

**Tình trạng sau review:** Phương án thiết kế đã cụ thể hơn, chưa có bằng chứng thực nghiệm để tuyên bố “đã vui” hoặc đã hoàn tất prototype. Chưa đóng những P0 ngoài phạm vi: Undo/Redo, điều kiện unlock Xóm Biển, Named NPC Reentry, Save UX/privacy và xử lý chi tiết người/xe/tàu khi sửa đường/bến.

## 9. Gói quyết định để phê duyệt

Gói khuyến nghị gồm **R02-FS01–03, R02-BLD01–02 và R02-NAR01** ở §1. Có thể duyệt hướng chung mà chưa duyệt các số cân bằng. Khi có phản hồi, ghi rõ quyết định nào được chấp nhận và cập nhật chúng vào GDD hợp nhất; không dùng im lặng làm phê duyệt.

| Nhóm       | Đề nghị chốt ở cấp thiết kế                                                                                            | Vẫn cần thử/chốt sau                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Khởi đầu   | Một xóm nhỏ đã sống; người chơi tự mở rộng/chỉnh sửa                                                                   | 2 nhà/4 người, layout, giờ bắt đầu, cast chính thức                        |
| Phiên đầu  | Tự do, gợi ý nhẹ; phản hồi từ cư dân cũ; không hứa Arrival sớm                                                         | Thời gian phản hồi, pacing, tác động lên cảm giác sở hữu                   |
| Công trình | Nhà = chỗ ở; đường = tiếp cận; quán = ghé/gặp; cây/ghế = cảnh quan/nghỉ; bến = nhịp thuyền; chợ = nhịp tụ họp theo bến | Sức chứa, lịch hoạt động, phạm vi cảnh quan, geometry và ngân sách asset   |
| Kỷ niệm    | Named NPC biết/dùng thay đổi thật; Local Template và memory sau reload; không ép chat                                  | Bác Hải có là cast chính thức không, wording thoại, sự kiện Journal cụ thể |

**Không nằm trong gói:** phê duyệt toàn bộ GDD, triển khai prototype/code, chọn engine hoặc phát hành. Các công việc đó chưa được thực hiện ở vòng này.

## 10. Nguồn và lịch sử thay đổi

- **SRC-R02-001 — trực tiếp, phạm vi công việc:** Người dùng ngày 22/10/2026: “Oke, tiếp tục ‘Review Round 02 — chốt thiết kế phiên chơi đầu và công dụng công trình’”. Cho phép thực hiện vòng review; chưa phải phê duyệt sáu đề xuất tại §1.
- **SRC-R02-002 — baseline kế thừa:** GDD v1.1 §2.4–2.7, §4–7, §10.5–10.6, §13.2, §16.9–16.10 và §18–20. Trạng thái và giới hạn bằng chứng nguồn lịch sử giữ như v1.1; không nâng mức xác thực chỉ vì chép lại.
- **SRC-R02-003 — nguồn bối cảnh:** [Hội thoại được người dùng chia sẻ](https://chatgpt.com/share/6ad9afdd-e754-83ec-8dbd-7cedecdf0e04), phần cuối Review Round 01 đề nghị review First Play Session và Building Functions. Link là ngữ cảnh tiếp nối, không phải kết quả playtest.
- **PROPOSED / DERIVED:** Bố cục fixture, flow phiên đầu, hợp đồng công trình, event Journal và ngưỡng thử trong tài liệu này do vòng review đề xuất. Ràng buộc dân số/thời gian/AI/save dẫn về quyết định hiện hữu, không tạo bằng chứng phê duyệt mới.

| Phiên bản                         | Thay đổi                                                                                                                  | Trạng thái                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| GDD v1.1 — Round 01               | Baseline, giả thuyết trải nghiệm, mẫu công trình/NPC, ledger và micro-prototypes                                          | Giữ nguyên file gốc         |
| Review supplement v1.2 — Round 02 | Chọn hướng khởi đầu đề nghị, fixture, phiên đầu tự do, sáu hợp đồng công trình, nhánh biên, traceability và playtest plan | PROPOSED; chưa Approved GDD |

**Review checklist:** Đã có khuyến nghị, lý do, giới hạn, tác động liên hệ chéo và kế hoạch đánh giá. Chưa có phê duyệt các lựa chọn mới, prototype hoặc dữ liệu playtest.
