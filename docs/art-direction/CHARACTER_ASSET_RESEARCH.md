# Nguồn nhân vật và animation — báo cáo trước triển khai

Kiểm tra: **22/10/2026**. Owner: Studio Lead. Người dùng nhận xét tạo hình/chuyển động hiện tại cứng, yêu cầu tìm nguồn trên mạng và báo cáo trước. Lượt này đọc code và các trang chính thức; **không tải gói model, không mua, không upload concept/model, không đổi runtime/save**. Không có animation nguồn ngoài đã chạy thử trong game.

## Vấn đề thực trong repo

`src/art/characters.js` dựng người bằng mesh riêng dưới các group vai/hông; không có skeleton/skin weights, gối hoặc khuỷu. Walk là xoay chân/tay theo sine ở tốc độ cố định; bộ chuyển idle/walk không blend clip, heading bám đoạn route. Vì vậy phần mềm có thể giữ danh tính/vị trí đúng nhưng chuyển động vẫn cứng. Cần mẫu skinned mesh với rig/clip, rồi chỉnh nhịp bước theo tốc độ thật và blend đứng–đi. Đổi mỗi hình mặt hoặc số polygon không giải quyết phần chuyển động.

Nhận định chuyên môn: vẫn giữ hướng cozy stylized và tỷ lệ người–nhà hiện tại; ưu tiên chuyển động thuyết phục, không mặc định đổi toàn bộ game sang photorealistic. Giữ concept Hải/Lan/Minh/An làm đích nhận diện; asset có sẵn là nền kỹ thuật hoặc mẫu để so sánh, không tự biến một nhân vật fantasy/thành thị thành nhân vật Việt Nam hoàn chỉnh.

## Shortlist đã xác minh từ nhà phát hành

| Nguồn chính thức | Những gì trang công bố | Giá / license tại lúc tra cứu | Đánh giá cho Little Coast (suy luận) |
| --- | --- | --- | --- |
| [Quaternius — Universal Base Characters](https://quaternius.itch.io/universal-base-characters) + [Universal Animation Library](https://quaternius.itch.io/universal-animation-library) | Bộ base humanoid rig, nhiều tỷ lệ/tóc, tương thích UAL. Toàn UAL quảng bá120+ clips và có bản root motion tắt. Base có glTF/FBX; UAL có GLB/FBX. | Standard có thể tải miễn phí, CC0; Base Source19.99USD, UAL Pro9.99/Source14.99USD. Không suy tất cả6base/120+clip đều nằm trong Standard: chưa kiểm nội dung ZIP. | Ưu tiên nghiên cứu nền rig chung/tùy biến cast. Base chưa mặc đúng quần áo hoặc có mặt Hải; cần chọn body phù hợp và làm trang phục/tóc. Trang công bố trung bình13ktris, cao hơn Hải mẫu5780; chưa có benchmark. |
| [Quaternius — Ultimate Animated Character Pack](https://quaternius.com/packs/ultimatedanimatedcharacter) | 50+ nhân vật animated, các định dạngFBX/Blend/OBJ; trang ghi52models. | Miễn phí, CC0, dùng cá nhân/thương mại theo công bố. | Có thể chọn một người mặc đồ sẵn làm motion prototype nhanh. Tạo hình low-poly đời cũ, không coi là đạt chất lượng cast cuối. FBX/Blend có thể cần chuyển GLB; không dùng OBJ cho bản thử có xương/animation. Rig của gói này chưa kiểm tương thích UAL mới. |
| [KayKit Adventurers](https://kaylousberg.itch.io/kaykit) + [Character Animations](https://kaylousberg.itch.io/kaykit-character-animations) | Bản character free có5nhân vật rigged/animated; thư viện animation công bố161clip, có idle/walk/emote/wave/sit/tool/fishing, .FBX/.GLTF. | Bản character free và toàn animation miễn phí theo trang tác giả, CC0. Adventurers Extra7.95/Source11.95USD là phần thêm. | Đáng so chuyển động/tỷ lệ cartoon và workflow cùng hệ rig. Trang phục dungeon/fantasy cần thay, không dùng nguyên giáp/pháp sư làm dân làng. Animation trên rig ngoài KayKit cần retarget và có thể kém phù hợp theo chính tác giả. |
| [Adobe Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) | Auto-rig và thư viện animation cho người hai chân; cho dùng characters/animations trong game cá nhân/thương mại theo FAQ. | Miễn phí với Adobe ID, không cần Creative Cloud subscription. Đây là nội dung có điều khoản Adobe, không phải CC0. | Hợp tìm động tác người đi/chào/đứng tự nhiên để so. Cần kiểm clip cụ thể, phong cách tuổi tác, retarget và chuyển định dạng. Chưa đăng nhập hoặc upload model; không hứa các nguồn khác cắm thẳng vào được. |
| [Synty — POLYGON MINI City Characters](https://syntystore.com/products/polygon-mini-city-characters-pack) | 37nhân vật, có Grandpa/Grandma, các biến thể màu; rig cho Mecanim, **không kèm animation**. | Trang niêm yết29.99USD; [One Time Purchase Licence](https://syntystore.com/pages/one-time-purchase-licence), không phải CC0. Giá là giá trang, chưa gồm thuế/checkout. | Có người già và cast đời thường, là hướng mua nếu thích phong cáchMINI. Tạo hình thành thị/chibi cần đối chiếu concept; mua bộ này riêng chưa giải quyết động tác cứng. |

Giá và danh sách là thông tin trang công bố vào ngày tra cứu, không phải kiểm kê file hoặc xác nhận checkout. Bộ Base/UAL có phân tầng free/paid nên chọn từ file thực trước khi chốt chi phí/nội dung. UAL2 cũng có [gói riêng](https://quaternius.itch.io/universal-animation-library-2),130+clip toàn bộ thư viện, Standard miễn phí và Source14.99USD; có farming/fishing nhưng không cần đưa cả thư viện vào game để sửa đi/đứng.

## License và khả năng đưa vào repo

Các trang Quaternius/KayKit nêu CC0 và quyền dùng thương mại; lưu license/provenance của chính file tải về khi tiếp nhận. Mixamo/Synty có điều khoản riêng, không mặc định quyền phát tán file nguồn như CC0. [EULA Synty hiện tại](https://syntystore.com/pages/one-time-purchase-licence) ghi quyền dùng/chỉnh trong sản phẩm, giới hạn chia sẻ source ngoài đội và hạn chế sử dụng với công cụ AI/3D generation; đây là lý do chưa chọn mua/đưa qua pipeline ImageGen. Báo cáo này không tuyên bố mọi workflow AI của dự án phù hợp EULA đó. Không upload asset Synty/Mixamo lên dịch vụ bên ngoài trong lượt nghiên cứu.

## Khuyến nghị

**Chuyển pipeline nhân vật từ mesh group cứng sang model có xương và animation có sẵn.** Ưu tiên nguồn CC0 miễn phí để kiểm chứng trước chi phí. Thử một nhân vật mặc đồ sẵn của Quaternius hoặc KayKit cùng clip đúng rig trong sân art review; nếu chọn nền tùy biến lâu dài thì kiểm Universal Base + UAL và nội dung Standard trước. Chưa gọi mẫu nào là Hải cuối cho đến khi tạo hình đúng mặt/tóc/trang phục và nhìn đạt ở camera game.

Bài thử tiếp theo đề xuất (chưa chạy):

1. Chọn một model có skin/rig và hai clip **idle, walk** đúng skeleton; kiểm license và inventory file. Không đưa hàng trăm clip/thư viện texture vào bundle.
2. Đóng gói GLB/glTF, chuẩn hóa chiều cao khoảng .62 world unit, chânY0, mặt+Z; root di chuyển vẫn từ simulation. Ưu tiên clip in-place/root motion tắt. Chỉnh tần số bước theo tốc độ .75worldunit/giây, blend idle↔walk và chuyển hướng mềm nhưng vị trí luôn canonical.
3. So video mẫu mới/cũ cùng camera/ánh sáng/tốc độ. Kiểm gối/khuỷu, chân trượt, bàn chân xuyên nền, lúc dừng/quay góc, sốmaterial/bones/triangles/dung lượng và thực đo frame time.
4. Test Pause/hidden không chạy chân; reload giữ IDs/home/memory; nếu tải model lỗi có fallback. Sit/talk chỉ tích hợp khi có hook/điểm dừng hợp lệ; thư viện có clip ngồi không tự làm NPC teleport vào ghế.
5. Sau motion proof mới làm Hải bám concept, rồi retarget cùng bộ animation sang Lan/Minh/An. Việc tạo topology, skin weights và chỉnh trang phục là công việc art thực, không hứa chỉ đổi màu là hoàn tất.

Phân biệt mức xác minh: đã đọc trang nguồn chính thức và code hiện tại; chưa tải ZIP, chưa kiểm skeleton/clip, chưa xem chuyển động nguồn trong WebGL của repo, chưa đo hiệu năng, chưa có human acceptance. Lượt này không chạy test/build vì chỉ thêm báo cáo nghiên cứu.
